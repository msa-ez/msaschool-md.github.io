---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# [Service Mesh] Istio Metrics based HPA

# [Service Mesh] Istio Metrics based HPA

### Istio metrics based HPA

- Goal : Istio metrics기반의 HPA를 설정하고, Pod 자동 Scale Out을 확인한다. 
- Istio Control Plane 중 하나인 Mixer는 Sidecar로부터 Metrics정보를 수집해 Promethus에 저장한다.

### Custom metrics adapter 설치

- 먼저 프로메테우스 쿼리를 실행할 Metrics Adapter를 설치한다.
```
git clone https://github.com/acmexii/istio-hpa.git
cd istio-hpa
kubectl apply -f ./kube-metrics-adapter/
```

- Adapter는 kube-system 네임스페이스에 설치된다.
- Adapter는 istio-system 네임스페이스 상의 Prometheus 인스턴스를 쿼리한다.
- Adapter 실행로그를 확인한다.
```
kubectl -n kube-system logs deployment/kube-metrics-adapter
```

### Delivery 어플리케이션 배포
- 먼저 Sidecar Injection이 설정된 네임스페이스를 생성한다.
```
kubectl apply -f ./namespaces/
```

- 배송 마이크로서비스를 배포한다.
```
kubectl apply -f https://raw.githubusercontent.com/acmexii/demo/master/edu/delivery-rediness-v3.yaml -n mall
kubectl expose deploy delivery --port=8080 -n mall
```

#### Configuring the HPA with Istio metrics
- Prometheus Query기반 배송서비스에 대한 HPA를 설정한다.

```
kubectl apply -f - <<EOF
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: delivery-hpa
  namespace: mall
  annotations:
    metric-config.object.istio-requests-total.prometheus/per-replica: "true"
    metric-config.object.istio-requests-total.prometheus/query: |
      sum(
        rate(
          istio_requests_total{
            destination_workload="delivery",
            destination_workload_namespace="mall"
          }[1m]
        )
      ) /
      count(
        count(
          container_memory_usage_bytes{
            namespace="mall",
            pod=~"delivery.*"
          }
        ) by (pod)
      )
spec:
  maxReplicas: 10
  minReplicas: 1
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: delivery
  metrics:
    - type: Object
      object:
        metricName: istio-requests-total
        target:
          apiVersion: v1
          kind: Pod
          name: delivery
        targetValue: 10
EOF

```
- annotations에서 metric object 'istio-requests-total' 를 정의한다.
- 배송서비스로의 초당 트래픽이 평균 10개를 상회할 경우, HPA가 발동한다.

#### 부하테스터를 통한 HPA 테스트
- Load Generator 설치
```
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: siege
  namespace: mall
spec:
  containers:
  - name: siege
    image: apexacme/siege-nginx
EOF
```
- 모니터를 켜고, 새로운 터미널에서 Siege 컨테이너로 접속한다.
```
watch kubectl get pod -n mall
kubectl exec -it siege -n mall -- /bin/bash
```

- 접속한 Siege 컨테이너 안에서 배송서비스로 부하를 발생하고, 임계치를 초과했을때 Pod 자동확장 되는 것을 확인한다. 
```
siege -c10 -t10S -v http://delivery.mall:8080
```

#### 실행 결과
- 배송 마이크로서비스에 유입되는 초당 요청수가 Threshold를 초과하여, 자동확장되었음이 확인된다.
- HPA의 Metric type이 Container Resource(CPU, MEM) 기반이 아니므로, Resource Spec. 없어도 동작한다.
- (But) Pod의 'Evicted' 예방차원에서 Resource Spec.는 항상 YAML에 정의하는것을 추천한다.


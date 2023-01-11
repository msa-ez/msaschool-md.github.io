---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# [Service Mesh] Istio 를 통한 서비스 회복성 Part1 - 타임아웃/재시도

# [Service Mesh] Istio 를 통한 서비스 회복성 Part1 - 타임아웃/재시도

### Istio Timeout & Retry

- 주문서비스와 배송서비스를 활용해 이스티오가 제공하는 Service Resiliency 기능 중, '타임아웃'과 '재시도'에 대해 실습한다. 
- 이전에 사용한 tutorial 네임스페이스에 Istio feature를 enable 시킨다.
 
### 1. Timeout

#### tutorial 네임스페이스에 Istio Activation

- 네임스페이스가 없을 시, 생성 후 실행한다.
```java
kubectl create ns tutorial
kubectl label namespace tutorial istio-injection=enabled --overwrite
kubectl get ns -L istio-injection
```

- 주문서비스를 배포한다.
```bash
kubectl apply -f - <<EOF
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: order
    namespace: tutorial
    labels:
      app: order
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: order
    template:
      metadata:
        labels:
          app: order
      spec:
        containers:
          - name: order
            image: jinyoung/order:timeout
            ports:
              - containerPort: 8080
            resources:
              limits:
                cpu: 500m
              requests:
                cpu: 200m
EOF
```

- Order 서비스 생성
```
kubectl expose deploy order --port=8080 -n tutorial
```

#### Order 서비스 Timeout 설정
- 배포된 order 서비스에 타임아웃 임계치(3초)를 가지는 Istio Policy를 생성한다.
- 
```bash
kubectl apply -f - <<EOF
    apiVersion: networking.istio.io/v1alpha3
    kind: VirtualService
    metadata:
      name: vs-order-network-rule
      namespace: tutorial
    spec:
      hosts:
      - order
      http:
      - route:
        - destination:
            host: order
        timeout: 3s
EOF
```
#### Siege를 통한 Order 서비스 부하 적용 및 확인

- 워크로드 생성기인 Siege Pod를 생성한다.
```
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: siege
  namespace: tutorial
spec:
  containers:
  - name: siege
    image: apexacme/siege-nginx
EOF
```

- Siege에 접속하여 워크로드가 잘 전달되는지 테스트해 본다.
```
kubectl exec -it siege -c siege -n tutorial -- /bin/bash
siege -c1 -t2S -v --content-type "application/json" 'http://order:8080/orders POST {"productId": "1001", "qty":5}'
```

#### 타임아웃(Timeout) 확인

- 적절한 부하를 발생시킨다.
```
siege -c30 -t20S -v --content-type "application/json" 'http://order:8080/orders POST {"productId": "1001", "qty":5}'
```

- Order 서비스에 설정된 Timeout 임계치를 초과하는 연결에 대해, 사이드카에서  차단(Fail-fast)되는 것이 확인된다.
- 마이크로서비스 구현 단계가 아닌, 런타임 상에서 운영 단계시 타임 아웃을 적용해 보았다.

### 2. Retry

- Product Id 가 없으면 오류가 나도록 하는 버전으로 전환
```
kubectl set image deploy/order order='jinyoung/monolith:v20121121' -n tutorial
```

#### Order 서비스에 'Retry' Rule 추가

```bash
kubectl apply -f - <<EOF
  apiVersion: networking.istio.io/v1alpha3
  kind: VirtualService
  metadata:
    name: vs-order-network-rule
    namespace: tutorial
  spec:
    hosts:
    - order
    http:
    - route:
      - destination:
          host: order
      timeout: 3s
      retries:
        attempts: 3
        perTryTimeout: 2s
        retryOn: 5xx,retriable-4xx,gateway-error,connect-failure,refused-stream
EOF
```

#### Order 서비스 API (주문취소-실패) 호출
```
kubectl exec -it siege -c siege -n tutorial -- /bin/bash
http http://order:8080/orders qty=5
```
- 이때, 데이터 플레인 엔보이 프락시에서 설정된 정책에 따라 내부적으로 재시도가 일어난다.


#### 재시도(Retry) 결과확인

- 추척 서비스인 예거를 접속하기 위한 ingress 를 설정

- ingress.yaml 을 아래와 같이 추가:
```
apiVersion: networking.k8s.io/v1
kind: "Ingress"
metadata: 
  name: "shopping-ingress"
  namespace: "istio-system"  
  annotations: 
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
    ingressclass.kubernetes.io/is-default-class: "true"
spec: 
  ingressClassName: nginx
  rules:
    - host: "kiali.service.com"
      http: 
        paths: 
          - 
            path: /
            pathType: Prefix
            backend: 
              service:
                name: kiali
                port:
                  number: 20001

    - host: "prom.service.com"
      http: 
        paths: 
          - 
            path: /
            pathType: Prefix
            backend: 
              service:
                name: prometheus
                port:
                  number: 9090

    - host: "gra.service.com"
      http: 
        paths: 
          - 
            path: /
            pathType: Prefix
            backend: 
              service:
                name: grafana
                port:
                  number: 3000

    - host: "tracing.service.com"
      http: 
        paths: 
          - 
            path: /
            pathType: Prefix
            backend: 
              service:
                name: tracing
                port:
                  number: 80
```
- 그런다음 apply
```
kubectl apply -f ingress.yaml
```
- host 파일에 추가
```
x.x.x.x  tracing.service.com
```
- tracing.service.com 으로 접속


- 검색조건: Service : siege.tutorial
- 화면 오른쪽 검색결과에서  총 3번의 추가 호출이 데이터플레인의 사이드카에서 요청되었음을 확인할 수 있다.

![image](https://user-images.githubusercontent.com/35618409/135967043-086c621e-c04a-4089-8432-e3db8a999a95.png)

- 해당 요청을 클릭하면 상세 요청 명세를 조회할 수 있다.
![image](https://user-images.githubusercontent.com/35618409/135967305-a6c93ef4-b2f1-48dd-8186-1ac20025b7f7.png)

#### Order 서비스에 대해 Retry를 1회로 하는 Policy를 적용해 보고, 반영결과를 확인해 보자.
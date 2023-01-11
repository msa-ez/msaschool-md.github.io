---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# 셀프힐링 & 무정지 배포 실습

# 셀프힐링 & 무정지 배포 실습

## 셀프힐링 실습 (livenessProbe)

본 랩에서는 먼저 컨테이너에 장애가 생겼을 때, 컨테이너 플랫폼이 자동으로 장애를 감지하여 복구하는 내용을 실습한다. 

또한, 컨테이너 플랫폼이 각 마이크로서비스들의 Healthy 여부를 체크하는 Probe Action 중, Command Type과 HttpGet Type을 적용해 보고 복구 시 어떠한 변화가 있는지도 알아본다.

### Command ProbeAction

#### Command type의 Probe Action이 설정된 YAML을 배포한다.
````
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  labels:
    test: liveness
  name: liveness-exec
spec:
  containers:
  - name: liveness
    image: k8s.gcr.io/busybox
    args:
    - /bin/sh
    - -c
    - touch /tmp/healthy; sleep 30; rm -rf /tmp/healthy; sleep 600
    livenessProbe:
      exec:
        command:
        - cat
        - /tmp/healthy
      initialDelaySeconds: 5
      periodSeconds: 5
EOF			
````
- 컨테이너가 Running 상태로 보이나, Probe Configuration에 따라 Liveness Probe 실패가 벌어진다.
- kubectl describe 커맨드로 Pod 이벤트의 메시지 변화를 확인한다.

```
kubectl describe po liveness-exec
```

### HttpGet ProbeAction

- HttpGet type의 Probe Action이 설정된  주문 마이크로서비스 배포

```
kubectl apply -f https://raw.githubusercontent.com/acmexii/demo/master/edu/order-liveness.yaml
```
- 배포된 주문서비스에 대해 라우터를 생성한다.
```
kubectl expose deploy order --type=LoadBalancer --port=8080
kubectl get svc
```
- Order Liveness Probe를 명시적으로 Fail 상태로 전환한다.
```
# Liveness Probe 확인
http EXTERNAL-IP:8080/actuator/health
# Liveness Probe Fail 설정 및 확인
http put EXTERNAL-IP:8080/actuator/down
http EXTERNAL-IP:8080/actuator/health
```
- Probe Fail에 따른 쿠버네티스 동작확인
```
kubectl get pod
kubectl describe pod/[ORDER-POD객체]
```

- 다음 실습을 위해 생성된 객체를 삭제한다.
```
kubectl delete pod,deploy,svc --all
```

## 무정지 배포 실습 (readinessProbe, 제로 다운타임)

다음으로 클러스터에 배포시 다운타임이 존재하는지 실습을 한다. 클러스터에 배포를 할때 readinessProbe 설정이 없으면 다운타임이 존재 하게 된다. 이는 쿠버네티스에서 Ramped 배포 방식으로 무정지 배포를 시도 하지만, 서비스가 기동하는 시간이 있기 때문에 기동 시간동안에 트래픽이 유입되면 장애가 발생 할 수 있다.  

배포시 다운타임의 존재 여부를 확인하기 위하여, siege 라는 부하 테스트 툴을 사용한다.  
배포시작전에 부하테스트 툴을 실행하고, 배포 완료시 종료한 후, 결과값인 Availability 를 체크 하여 어느정도의 실패가 있었는지를 확인한다.


### 선행과정

- Kafka 가 설치되어있어야 한다:
- Kafka는 K8s 패키지 인스톨러인 Helm으로 설치 가능하므로 Helm이 먼저 설치되어야 한다.

- Helm 3.x 설치(권장)
```
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 > get_helm.sh
chmod 700 get_helm.sh
./get_helm.sh
```

- Kafka 설치 (Namespace 'kafka')
```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
kubectl create ns kafka
helm install my-kafka bitnami/kafka --namespace kafka
```

- GitPod > Explorer 에서 마우스 오른쪽 클릭 > New Folder > Zerodowntime 입력
- Lab 폴더 마우스 오른쪽 클릭 > New File > deployment.yaml 입력
- 아래 내용 복사하여 붙여넣기
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order
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
          image: jinyoung/order:stable
          ports:
            - containerPort: 8080
```

- 주문서비스를 배포한다:
```
kubectl apply -f deployment.yaml
```

서비스 객체를 위한 yaml도 만든다:

```
apiVersion: "v1"
kind: "Service"
metadata: 
  name: "order"
  labels: 
    app: "order"
spec: 
  ports: 
    - 
      port: 8080
      targetPort: 8080
  selector: 
    app: "order"
  type: "ClusterIP"
```
를 붙여넣기 하여 생성한 다음,

```
kubectl apply -f service.yaml
```
로 서비스 객체를 생성한다.


- 부하 테스트 Pod 설치
	- 아래 스크립트를 terminal 에 복사하여 siege 라는 Pod 를 생성한다.
	```
    kubectl apply -f - <<EOF
    apiVersion: v1
    kind: Pod
    metadata:
      name: siege
    spec:
      containers:
      - name: siege
        image: apexacme/siege-nginx
    EOF
	```
	- 생성된 siege Pod 안쪽에서 정상작동 확인
	```
	kubectl exec -it siege -- /bin/bash
	siege -c1 -t2S -v http://order:8080/orders
	exit
	```
 
### 1. readinessProbe 가 없는 상태에서 배포 진행

1.1 새 버전을 배포할 준비를 한다:
deployment.yaml 의 이미지 정보를 아래와 같이 변경한 후 (19라인):
```
image: jinyoung/order:canary
```

1.2 새로운 터미널을 열어서 충분한 시간만큼 부하를 준다.

```
kubectl exec -it siege -- /bin/bash
siege -c1 -t60S -v http://order:8080/orders --delay=1S
```

1.3. 배포를 반영한다:

```
kubectl apply -f deployment.yaml
```

1.5 siege 로그를 보면서 배포시 정지시간이 발생한것을 확인한다.
```
Transactions:                     82 hits
Availability:                  70.09 %
Elapsed time:                  59.11 secs
```

### 2. readinessProbe 를 설정하고 배포 진행

2.1 아래와 같이 readiness 설정을 주입한다:

```
    spec:
      containers:
        - name: order
				  ...
          readinessProbe:    # 이부분!
            httpGet:
              path: '/orders'
              port: 8080
            initialDelaySeconds: 10
            timeoutSeconds: 2
            periodSeconds: 5
            failureThreshold: 10
```
2.2. image 명도 변경한다 (19라인):
```
				image: jinyoung/order:stable
```

2.2 siege 터미널을 열어서 충분한 시간만큼 부하를 준다.

```
kubectl exec -it siege -- /bin/bash
siege -c1 -t60S -v http://order:8080/orders --delay=1S
```

2.3 수정된 주문 서비스를 적용하여 배포한다
- kubectl apply -f deployment.yaml


2.5 siege 로그를 보면서 배포시 무정지로 배포된 것을 확인한다.
```
Transactions:                    112 hits
Availability:                 100.00 %
Elapsed time:                  59.58 secs
```

> 주의점: siege 테스트를 걸어놓은 후 배포해야 정확한 테스트가 이루어집니다. 

### 상세설명
<iframe width="100%" height="100%" src="https://www.youtube.com/embed/n_A59SwsDJ0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
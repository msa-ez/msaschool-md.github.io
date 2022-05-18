---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# [Service Mesh] Istio 를 통한 서비스 회복성 Part1 - 타임아웃/재시도

### Istio Timeout & Retry

- 주문서비스와 배송서비스를 활용해 이스티오가 제공하는 Service Resiliency 기능 중, '타임아웃'과 '재시도'에 대해 실습한다. 
- 먼저, 카프카 설치 후 주문과 배송 마이크로서비스를 배포한다.
 
### 1. Timeout

#### tutorial 네임스페이스에 Istio Activation
- 네임스페이스가 없을 시, 생성 후 실행
```java
kubectl label namespace tutorial istio-injection=enabled --overwrite
```

#### Order 이미지 배포
- 터미널에서 order 프로젝트로 이동한다.
```
cd order
```
- order 이미지 생성과 푸쉬
```
mvn package
docker build -t [Image Registry]/order:latest .
docker push [Image Registry]/order:latest
```
- 푸쉬한 이미지 정보를 아래 YAML(spec.template.spec.containers&#91;0&#93;.image)에 수정하여 배포한다.

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

#### Order 서비스 생성
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
#### Siege를 통한 Order 서비스 부하 생성 및 확인
```
kubectl create deploy siege --image=apexacme/siege-nginx -n tutorial
kubectl exec -it [siege-Pod-Instance] -c siege-nginx -n tutorial -- /bin/bash
```
```
siege -c30 -t20S -v --content-type "application/json" 'http://order:8080/orders POST {"productId": "1001", "qty":5}'
```
#### 타임아웃(Timeout) 확인
- Order 서비스에 설정된 Timeout 임계치를 초과하는 연결에 대해, 사이드카에서  차단(Fail-fast)되는 것이 확인
- (초기, 3초의 임계치 초과가 많은  이유는 Not-Bean들의 높은 클래스 로딩 레이턴시 때문)
- 다시 한번, 동일 부하를 발생해 본다.
- 이번엔 부하를 높여(-c50) 임계치를 상회하는 요청에 대한 Timeout(Fail-Fast) 기능을 확인한다.

### 2. Retry

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
kubectl exec -it [siege-Pod-Instance] -c siege-nginx -n tutorial -- /bin/bash

http http://order:8080/orders/ productId=1001 qty=5
```
- 주문서비스에 아래 '주문취소' 요청을 보내게 되면 배송서비스를 동기호출 하는데, 배송서비스가 다운되어 있어 '5xx' 오류코드를 수신한다. 
```
http DELETE http://order:8080/orders/(주문번호)
```
- 이때, 데이터 플레인에 설정된 정책에 따라 내부적으로 재시도가 일어난다.


#### 재시도(Retry) 결과확인

- 추척 서비스인 Jaeger에 접속(http://Jaeger EXTERNAL-IP:80)하여 , Retry가 발생하였는지 확인
- 검색조건: Service : siege.tutorial
- 화면 오른쪽 검색결과에서  총 3번의 추가 호출이 데이터플레인의 사이드카에서 요청되었음을 확인할 수 있다.

![image](https://user-images.githubusercontent.com/35618409/135967043-086c621e-c04a-4089-8432-e3db8a999a95.png)

- 해당 요청을 클릭하면 상세 요청 명세를 조회할 수 있다.
![image](https://user-images.githubusercontent.com/35618409/135967305-a6c93ef4-b2f1-48dd-8186-1ac20025b7f7.png)

---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# [Service Mesh] Istio 를 통한 서비스 회복성 Part2 - 서킷브레이커

# [Service Mesh] Istio 를 통한 서비스 회복성 Part2 - 서킷브레이커

## Istio Circuit Breaker
Istio Circuit Breaker 기능으로는 Connection Pool의 크기를 조정하여, DDoS 공격 등을 차단하거나  장애가 감지된 서비스를 서비스 대상에서 일정시간 동안 제외(Pool Ejection)가 가능하다. 

랩에서 우리는 Istio의 Circuit Breaker 기능 중에서, 오류가 있는 컨테이너를 지정된 시간만큼 Pool Ejection하는 Service Resiliency를 실습한다.


### Delivery 이미지 배포

- 이전 랩에서 사용한 Istio Injection이 적용된 tutorial 네임스페이스를 사용한다.
- 배송 마이크로서비스를 배포하고 인스턴스를 2개로 스케일 아웃시킨다.
```
kubectl create deploy delivery --image=ghcr.io/acmexii/delivery:istio-circuitbreaker -n tutorial
kubectl scale deploy delivery --replicas=2 -n tutorial
kubectl expose deploy delivery --port=8080 -n tutorial
```

### 배송 서비스에 Circuit Breaker 설정
```
kubectl apply -f - << EOF
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: dr-delivery
  namespace: tutorial
spec:
  host: delivery
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
      localityLbSetting:
        enabled: false
    outlierDetection:
      interval: 10s
      consecutive5xxErrors: 1
      baseEjectionTime: 3m
      maxEjectionPercent: 100
EOF

```
- 위 CB정책은 10초마다 스캔하여 delivery 서비스의 라우팅 대상 컨테이너로부터 1번이라도 서버 오류가 발생 시, 3분동안 라우팅에서 제외하며, 모든 컨테이너가 제외될 수 있음을 나타낸다. 
- 모든 업스트림 서비스가 장애인 경우,  이스티오는 'No healthy upstream.' 오류를 리턴한다.

### 특정 서비스에 장애유도

- 설치된 Http Client 컨테이너에 접속한다.
```
kubectl exec -it siege -c siege -n tutorial -- /bin/bash
```
- 배송서비스 확인 (Replica가 2개 이므로, 아래 명령을 2번 이상 호출하여 호스트 정보 확인)
- 각 컨테이너마다 번갈아 가며 호스트 이름과 클러스터 IP(IPv4)가 출력된다.
```
http http://delivery:8080/actuator/echo
```

- 출력되는 정보에서 ~~마음에 들지않는~~ 배송 서비스 IP를 복사하여 아래와 같이 일부러 장애를 발생시킨다.
```
# example, 192.168.79.155를 수정
http PUT http://192.168.79.155:8080/actuator/down
```

- 그런 다음, 아래 '/actuator/health'를 2번 이상 호출해 보면, '위에서 발생시킨 장애' 상태인 컨테이너는 5xx 오류를 응답하게 된다.
- (실제, 5xx 오류가 리턴되면 Istio는 자동 Retry를 시도하고 Healthy한 컨테이너로부터 응답을 받기 때문에 결과는 항상 'UP' 상태가 보여진다.)
```
http GET http://delivery:8080/actuator/health
```
- 이 때, 서킷브레이커가 발동하여 5xx 오류를 리턴한 해당 컨테이너를 (CB설정에 따라) 3분동안 Pool에서 Ejection 한다.


### Pool Ejection 확인

- 가용 서비스를 확인해 보면, 아래 명령에 대해 컨테이너1개만 응답하는 것이 확인된다. (3회 이상 반복 실행)
```
http http://delivery:8080/actuator/echo
```
- Pool Ejection 타임(3') 경과후엔 배송서비스가 다시 2개가 동작됨이 확인된다.
```
http http://delivery:8080/actuator/echo
```

### Kiali를 통한 Circuit Breaker 확인

- 모니터링 시스템(Kiali)에 접속해 (kiali.service.com/kiali)배송서비스를 확인해 보면, Circuit Breaker가 설정(Badge 확인)되어 있고, 동작한 것을 볼 수 있다.
![image](https://user-images.githubusercontent.com/35618409/204700407-72dc696c-113b-4c9c-872b-177e77206539.png)
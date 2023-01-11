---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# [Service Mesh] Istio 를 통한 동적 트래픽 라우팅

# [Service Mesh] Istio 를 통한 동적 트래픽 라우팅

### Traffic Mgmt & Canary 배포

예제를 통해 Istio가 지원하는 동적 트레픽 라우팅을 이해하고, 앞서 설치한 Add-on 서버들의 시각화된 화면으로 적용 결과를 확인한다.

대표적인 서비스 메시의 카나리(Canary) 배포전략을 실습해 보고 Advanced한 서비스 리자일런스를 학습한다.


#### Istio Tutorial 셋업

- Git repository에서 Tutorial 리소스에서 Istio 트래픽 예제가 있는 저장소를 복제한다.
```
git clone https://github.com/redhat-developer-demos/istio-tutorial
cd istio-tutorial
```

#### 네임스페이스 생성

```
kubectl create namespace tutorial
```

#### Customer 예제 서비스 배포

```
kubectl apply -f <(istioctl kube-inject -f customer/kubernetes/Deployment.yml) -n tutorial
kubectl describe pod (Customer Pod) -n tutorial
kubectl create -f customer/kubernetes/Service.yml -n tutorial
```

#### Istio Gateway 설치 및 Customer 서비스 라우팅(VirtualService) 설정

```
cat customer/kubernetes/Gateway.yml
kubectl create -f customer/kubernetes/Gateway.yml -n tutorial
```

#### Istio-IngressGateway를 통한 Customer 서비스 확인

```
kubectl get service/istio-ingressgateway -n istio-system
```

- Customer 서비스 호출
```
"http://(istio-ingressgateway IP)/customer"
```


#### 예제 Preference, Recommendation-v1 Service 배포
```
kubectl apply -f <(istioctl kube-inject -f preference/kubernetes/Deployment.yml) -n tutorial
kubectl create -f preference/kubernetes/Service.yml -n tutorial
kubectl apply -f <(istioctl kube-inject -f recommendation/kubernetes/Deployment.yml) -n tutorial
kubectl create -f recommendation/kubernetes/Service.yml -n tutorial
```

### Istio - Traffic Routing

#### Simple Routing

```
cd istio-tutorial
```

- recommendation 두번째 서비스 배포
```
kubectl apply -f <(istioctl kube-inject -f recommendation/kubernetes/Deployment-v2.yml) -n tutorial
```

#### 서비스 호출 및 확인

- 브라우저에서 Ingressgateway를 경유하는 Customer 서비스 호출

- F5(새로고침)를 10회 이상 클릭하여 수회이상의 요청 생성한다.
- Routing 결과 확인 - Kiali(Externl-IP:20001)

- 추천 서비스 v2 의 replica 를 두개로 스케일 아웃한다.
```
kubectl scale --replicas=2 deployment/recommendation-v2 -n tutorial
kubectl get po -n tutorial
```

- Customer 서비스에 10회 이상 워크로드를 발생시킨다.
- Routing 결과 확인 - Kiali(Externl-IP:20001) 접속

#### Advanced Routing

Istio의 CRD(Custom Resouce Definition) 객체를 통해 advanced한 트래픽 정책을 설정하고, Policy기반의 동적 트래픽 라우팅을 확인한다.

- 설정된 정책(VirtualService, DestinationRule) 확인
```
kubectl get VirtualService -n tutorial -o yaml
kubectl get DestinationRule -n tutorial -o yaml
```

#### 사용자 선호도에 따른 추천 서비스 라우팅 정책 설정

- 기존 버전과 신규버전을 각각 Destination Rule 객체를 통해 대상 서비스로 정의한다.
```
kubectl create -f istiofiles/destination-rule-recommendation-v1-v2.yml -n tutorial
```

- 기존 버전(version-1)으로 모든 트래픽이 전송되도록 라우팅 룰을 설정한다. 
```
kubectl create -f istiofiles/virtual-service-recommendation-v1.yml -n tutorial
```

- 설정정책 확인
```
kubectl get VirtualService -n tutorial -o yaml
kubectl get DestinationRule -n tutorial -o yaml
```

#### 서비스 호출 및 확인

- 브라우저에서 Ingressgateway를 경유하는 Customer 서비스 호출
- F5(새로고침)를 10회 이상 클릭하여 수회이상의 요청 생성한다.
- Kiali(Externl-IP:20001), Jaeger(External-IP:80) 에서 모니터링해 본다


### 가중치 기반 카나리 배포 

- Canary 라우팅 비율별 배포 정책 예시
```
(90 : 10)
kubectl apply -f istiofiles/virtual-service-recommendation-v1_and_v2.yml -n tutorial
(75 : 25)
kubectl replace -f istiofiles/virtual-service-recommendation-v1_and_v2_75_25.yml -n tutorial
```

- recommendation 서비스 v2의 가중치를 100으로 변경
```
kubectl replace -f istiofiles/virtual-service-recommendation-v2.yml -n tutorial
```

#### 삭제
```
kubectl delete dr recommendation -n tutorial
kubectl delete vs recommendation -n tutorial
kubectl scale --replicas=1 deployment/recommendation-v2 -n tutorial
```


### Header정보 기반 스마트 라우팅

유입되는 요청 브라우저, 또는 사용자 Profile기반 라우팅이 가능하다. 마이크로서비스 배포팀 또는 부서일 경우에만 새 버전(v.2)으로 라우팅하여 고객 피해를 최소화 할 수 있다.

- Firefox 브라우저로 접속 시, v2로 라우팅되도록 설정
```
kubectl apply -f istiofiles/destination-rule-recommendation-v1-v2.yml -n tutorial
kubectl apply -f istiofiles/virtual-service-firefox-recommendation-v2.yml -n tutorial
```
- Firefox 브라우저와 다른 브라우저에서 접속 확인 Browser 환경이 지원되지 않을 경우
```
curl -A Safari Externl-IP:8080
curl -A Firefox Externl-IP:8080
```


#### 삭제
```
kubectl delete dr recommendation -n tutorial
kubectl delete vs recommendation -n tutorial
```
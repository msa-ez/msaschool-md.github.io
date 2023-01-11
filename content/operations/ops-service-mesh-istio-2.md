---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# [Service Mesh] Istio-2

# [Service Mesh] Istio-2

## Download & Install Istio 

1. 본 랩에서는 Istio Service Mesh를 내 클러스터에 설치하고, 모니터링을 위한 대쉬보드를 추가 설정 해 본다.

```
export ISTIO_VERSION=1.14.5
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=$ISTIO_VERSION TARGET_ARCH=x86_64 sh -
```

1.  Istio 패키지 폴더로 이동시킨다 
```
cd istio-$ISTIO_VERSION
```

   해당 디렉토리에는 다음의 내용을 포함하고 있다:

    - 샘플애플리케이션: `samples/`
    - `istioctl` 클라이언트 툴은
      `bin/` 디렉토리에 포함되어있다.

1.  `istioctl` 클라이언트를 PATH에 잡아준다:

```
export PATH=$PWD/bin:$PATH
```

## Install Istio 

1.  기본적인 구성인 `demo` 를 기반으로 설치한다. 

```
istioctl install --set profile=demo --set hub=gcr.io/istio-release
```
```
    ✔ Istio core installed
    ✔ Istiod installed
    ✔ Egress gateways installed
    ✔ Ingress gateways installed
    ✔ Installation complete
```


## Istio add-on Dashboard 설치

Istio 는 다른 텔레메트리 모니터링 툴과 같이 제공이 된다. 이 툴은 서비스 매시의 구조를 쉽게 들여다 볼 수 있도록 되어있어 서비스간 호출 구조와 핼쓰상태를 쉽게 이해할 수 있도록 CNCF(http://cncf.io)에 등록된 GUI기반 모니터링 도구가 제공된다.

```
kubectl apply -f samples/addons
```

### 모니터링(Tracing & Monitoring) 툴 설정

배포된 마이크로서비스들의 토폴로지를 보여주는 에드온 서버로, 사용자 트레픽의 흐름이나 설정된 이스티오 구성요소들의 동작상황을 실시간 감지하여 그래피컬하게 제공해 준다. 

#### Monitoring Server - Kiali

- 정상 설치 후, ServiceType을 ClusterIP에서 LoadBalancer로 변경한다.
```
kubectl patch svc kiali -n istio-system -p '{"spec": {"type": "LoadBalancer"}}'
```

- 모니터링 시스템(kiali) 접속 : 브라우저의 새 탭에서 생성된 엔드포인트로 접속한다.
```
kubectl get service -n istio-system
```
- kiali EXTERNAL-IP:20001 `(admin/admin)`


#### Tracing Server - Jaeger

외부 요청이 응답으로 나가기까지 백엔드에서의 마이크로서비스간 호출 순서와 각 서비스들의 리드 타임 및 각 호출에서의 HTTP Header 내용을 조회할 수 있는 추적 서버이다. 

- 정상 설치 후, ServiceType을 ClusterIP에서 LoadBalancer로 변경한다.
```
kubectl patch svc tracing -n istio-system -p '{"spec": {"type": "LoadBalancer"}}'
```

- 분산추적 시스템(tracing) 접속 : 브라우저의 새 탭에서 생성된 엔드포인트로 접속한다.
```
kubectl get service -n istio-system
```
- tracing EXTERNAL-IP:80


## How to inject Sidecar on Istio environment

클러스터에 설치된 Istio, 서비스 메시는 자동으로 사이드카(Sidecar)를 Pod 내에 인잭션하지 않는다. 배포 시, 전처리 과정을 거치거나, 지정된 Label을 가진 네임스페이스 상에서 동작한다.

```
#1. By using the  "Istioctl kube-inject" preprocessing command
e.g. 
$ kubectl apply -f <(istioctl kube-inject -f Deployment.yml)
```
```
#2. By installing on the namespace where Istio is enabled
e.g. 
$ kubectl label namespace tutorial istio-injection=enabled
$ kubectl apply -f Deployment.yml -n tutorial
```

## Uninstall

The Istio uninstall deletes the RBAC permissions and all resources hierarchically
under the `istio-system` namespace. It is safe to ignore errors for non-existent
resources because they may have been deleted hierarchically.

```
cd istio-$ISTIO_VERSION
kubectl delete -f samples/addons
istioctl manifest generate --set profile=demo | kubectl delete --ignore-not-found=true -f -
```

The `istio-system` namespace is not removed by default.
If no longer needed, use the following command to remove it:

```
kubectl delete namespace istio-system
```
---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# [Service Mesh] MSA 모니터링 w/ Istio addon Grafana

### Service Mesh Istio 모니터링 

#### Istio Addon 설치 
```
cd istio-<istio-version>
kubectl apply -f samples/addons
```
#### Ingress 로 모니터링 도구들 expose
```
kubectl apply -f - <<EOF
apiVersion: "extensions/v1beta1"
kind: "Ingress"
metadata: 
  name: "istio-ingress"
  namespace: "istio-system"
  annotations: 
    kubernetes.io/ingress.class: "nginx"
spec: 
  rules: 
    - host: "tracing.service.com"
      http: 
        paths: 
          - 
            path: /
            pathType: Prefix
            backend: 
              serviceName: tracing
              servicePort: 80	
    - host: "kiali.service.com"
      http: 
        paths: 
          - 
            path: /
            pathType: Prefix
            backend: 
              serviceName: kiali
              servicePort: 20001

    - host: "prom.service.com"
      http: 
        paths: 
          - 
            path: /
            pathType: Prefix
            backend: 
              serviceName: prometheus
              servicePort: 9090

    - host: "gra.service.com"
      http: 
        paths: 
          - 
            path: /
            pathType: Prefix
            backend: 
              serviceName: grafana
              servicePort: 3000
EOF
```
> ingress provider 가 없는경우
```
helm repo add stable https://charts.helm.sh/stable
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
kubectl create namespace ingress-basic

helm install nginx-ingress ingress-nginx/ingress-nginx --namespace=ingress-basic
```

서비스 접근을 위하여 hosts 파일을 변경:
C:\Windows\System32\drivers\etc 내의 hosts 파일에 아래를 추가한다: (mac 과 linux 인 경우 /etc/hosts)
```
<획득한 ingress의 External IP>  tracing.service.com, kiali.service.com, prom.service.com, gra.service.com
```
> ingress address 얻기: kubectl get ingress -n istio-system 한다음 "ADDRESS" 부분 확인
> ADDRESS 에 값이 없다면, 위의 "ingress provider 가 없는경우" 확인

#### 각 Monitoring Tool 접속 방법
브라우저에서 다음의 url 들로 접속:
- tracing.service.com
- kiali.service.com/kiali
- prom.service.com
- gra.service.com


#### Grafana Monitoring 사용법 

<img width="420" alt="스크린샷 2022-02-23 오후 2 31 53" src="https://user-images.githubusercontent.com/43136526/155266431-7aee06a7-f5b1-41dc-86af-641763d751f8.png">

- 좌측 메뉴바에서 돋보기의 Search 클릭 

<img width="1319" alt="스크린샷 2022-02-23 오후 2 33 20" src="https://user-images.githubusercontent.com/43136526/155266537-03f88c5d-88f2-4f66-885b-3e9951150d2a.png">

- Istio의 Istio Service Dashboard 클릭 


#### Grafana Dashboard plugin 설치 

##### Dashboard plugin 검색 

https://grafana.com/grafana/dashboards/ 

- 위 링크로 이동
- Search Dashboard에서 istio 검색 
- 검색 결과 중 Istio Service Dashboard 클릭
- 우측의 Copy ID to Clipboard 클릭 

##### Grafana에 plugin 추가 

<img width="274" alt="스크린샷 2022-02-23 오후 3 13 42" src="https://user-images.githubusercontent.com/43136526/155269822-082f28e1-81e0-4394-8a8a-8681ee2e75fb.png">

- 좌측 메뉴바에서 + 클릭 후 import 클릭 

<img width="655" alt="스크린샷 2022-02-23 오후 3 30 32" src="https://user-images.githubusercontent.com/43136526/155271211-34a1124d-6686-4a5f-811e-01b9008a051a.png">

- import via grafana.com 에 grafana 에서 복사한 plugin id 붙여넣기 

<img width="622" alt="스크린샷 2022-02-23 오후 3 31 53" src="https://user-images.githubusercontent.com/43136526/155271318-2f8bf3b1-de2c-49a1-b6a1-9a99481bfd33.png">

#### Kubernetes Monitoring
- uid 를 315번으로 입력 후 Load 클릭 
- 하단 prometheus 에서 prometheus 선택
- 선택 후 import 클릭


#### Microservice Monitoring
- uid 를 7636번으로 입력 후 Load 클릭 
- 하단 prometheus 에서 prometheus 선택
- 선택 후 import 클릭

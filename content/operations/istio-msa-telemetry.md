---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# [Service Mesh] MSA 모니터링 w/ Istio addon Grafana

# [Service Mesh] MSA 모니터링 w/ Istio addon Grafana

### Prometheus/Grafana기반 K8s 통합 모니터링

- 프로메테우스는 SoundCloud 에서 만든 go언어 기반 오픈소스 모니터링 툴
- kubernetes 환경에서 모니터링하기 원하는 리소스로부터 metirc을 수집하고 해당 메트릭을 이용해서 모니터링
- 이상 증세가 발생했을 때 Slack, Mail 또는 다른 Webhook을 이용해서 알림을 주는 등 확장 기능 제공


#### 설치하기
- 다운로드한 Istio 폴더에서 Addon Server YAML로 설치
```
cd istio-1.11.3
kubectl apply -f samples/addons
```

#### 모니터링 대상 마이크로서비스 배포 
- Shop 네임스페이스를 만들고, 주문과 배송서비스를 배포한다.
- 클라이언트용 Pod도 배포한다.
```
kubectl create ns shop
kubectl label namespace shop istio-injection=enabled
kubectl apply -f https://raw.githubusercontent.com/acmexii/demo/master/edu/order-liveness.yaml -n shop
kubectl expose deploy order --port=8080 -n shop
kubectl apply -f https://raw.githubusercontent.com/acmexii/demo/master/edu/delivery-rediness-v1.yaml -n shop
kubectl expose deploy delivery --port=8080 -n shop
# Client Pod deploy
kubectl apply -f https://raw.githubusercontent.com/acmexii/demo/master/edu/siege-pod.yaml -n shop
```

### PromQL Test in Expression Browser

- PromQL Expression Browser Open
```
kubectl patch service/prometheus -n istio-system -p '{"spec": {"type": "LoadBalancer"}}'
```
- Prometheus service EXTERNAL-IP:9090에 접속한다.
- 아래와 같은 PromQL Playground WebUI가 나타난다.
![image](https://user-images.githubusercontent.com/35618409/183331272-01891ec2-74cf-41f2-8876-02fb34a9107f.png)

- Expression browser에서 주문서비스 요청 횟수를 조회해 본다.
```
istio_requests_total{destination_service="order.shop.svc.cluster.local"}
```
- 아무런 요청이 없었으므로, 'Empty query result'가 출력된다.
- Client Pod에 접속해 주문서비스를 query한다.
```
kubectl exec -it pod/siege -n shop -- /bin/bash
http GET http://order:8080
http GET http://order:8080/orders
```
- 다시 PromQL로 주문서비스 요청 횟수를 조회해 본다.
```
istio_requests_total{destination_service="order.shop.svc.cluster.local", response_code = "200"}
istio_requests_total{destination_service="order.shop.svc.cluster.local", response_code != "500"}
sum(kube_pod_status_phase{namespace="shop", phase="Running"})
```
- 아래와 같이 Kubernetes 메타정보와 응답코드를 포함한 Label 정보가 출력된다.
![image](https://user-images.githubusercontent.com/35618409/183334592-87417cc9-15bd-4b15-bc67-7e9766c5889e.png)

- 이번엔 Siege로 주문서비스에 부하를 발생한다.
```
siege -c30 -t40S -v http://order:8080
```
- Expression Browser에 아래 쿼리로 모니터링한다.
```
rate(istio_requests_total{app="order",destination_service="order.shop.svc.cluster.local",response_code="200"}[5m])
```
- 'Graph' 탭을 클릭한다.
- 지난 5분간 Data로 PromQL기반의 그래프가 나타난다.
![image](https://user-images.githubusercontent.com/35618409/183346842-1dda3245-d264-452e-9a2a-9c016ff7318e.png)
- 보다 상세한 Istio기반 메트릭은 아래 링크를 참조한다.
- [Istio Standard Metrics 참조](https://istio.io/latest/docs/reference/config/metrics/)
- 이제, Istio 메트릭 기반으로 Grafana를 통해 대쉬보드를 시각화해 보자


### 서비스 모니터링 in Grafana  

- Grafana 서비스 Open 
```
kubectl patch service/grafana -n istio-system -p '{"spec": {"type": "LoadBalancer"}}'
```
- Grafana service EXTERNAL-IP에 접속한다.
- 아래와 같은 Grafana main WebUI가 나타난다.
![image](https://user-images.githubusercontent.com/35618409/183338028-f5ac4664-d30d-445b-8596-630afad7fc2c.png)

#### Built-in Dashboard 뷰
- 왼쪽 Search 아이콘 메뉴를 클릭 후, Istio 폴더를 펼친다.
- 목록 중, Istio Service Dashboard를 클릭한다.
- 조회 조건에서 order.shop.svc.cluster.local 설정하면 istio Built-in Dashboard가 나타난다.


#### Grafana providing Dashboard 뷰
- 왼쪽 '+' 아이콘의 import 서브메뉴를 클릭한다.
![image](https://user-images.githubusercontent.com/35618409/183344494-fc7ca028-b95e-4fbb-9ab3-61db07765b62.png)
- Grafana dashboard id 입력란에 '6417'번을 입력하고 Load를 클릭 후, 로딩된 차트를 확인한다.
- 동일한 방법으로 Grafana dashboard id 입력란에 '315'번을 입력하고 차트를 로딩한다.
- 접속한 Siege 터미널에서 주문서비스로 부하를 발생시킨다.
``` 
kubectl exec -it pod/siege -n shop -- /bin/bash
siege -c30 -t80S -v http://order:8080
```
- 부하량에 따른 서비스 차트의 실시간 Gauge를 확인한다.
- 아래와 같이 Network IO, CPU, Memory 사용량이 실시간 증가한다.
![image](https://user-images.githubusercontent.com/35618409/183344194-8f4e571b-3640-4c54-8896-e7b7c6b3a7ca.png)


#### Dashboard Customizing

- '315' id의 쿠버네티스 모니터링 차트에서 주문서비스 요청율(rps)을 상단에 추가해 본다.
- 화면 상단의 'Add panel'을 클릭하여 empty panel을 추가한다.
![image](https://user-images.githubusercontent.com/35618409/183352278-f8e02a99-cb2d-4fa3-9e20-5a1b55a147e0.png)
- Metics 입력란에 아래 PromQL을 입력한다.
```
rate(istio_requests_total{app="order",destination_service="order.shop.svc.cluster.local"}[5m])
```
- 왼쪽 Panel title에 '주문서비스 요청율'을 입력한다.

- apply를 눌러 적용한다.
![image](https://user-images.githubusercontent.com/35618409/183353312-531a693a-ac33-43e4-b75c-009ddef30153.png)

- 위젯의 길이를 늘여 전체 크기로 맞춘다.- 
- 상단의 저장 아이콘을 눌러 차트를 저장한다.
![image](https://user-images.githubusercontent.com/35618409/183370320-ebe428ed-413e-48ba-a809-d796b2336a74.png)

#### Dashboard 참조 URL
- 아래 링크를 통해 Grafana가 제공하는 더 많은 대쉬보드를 검색하여 참고할 수 있다.
- [Grafana Dashboard 참조](https://grafana.com/grafana/dashboards/)


### 이상감지 & Alerting

#### Alert 설정
- 수정한 '쿠버네티스 클러스터 차트(id: 315)'의 '주문서비스 요청율'' Graph를 편집한다.
- 하단의 3번째 탭인 Alert을 클릭하여 'Create Alert' 버튼을 클릭해 Alert Rule을 설정한다.
![image](https://user-images.githubusercontent.com/35618409/183359486-c6b6d1e0-7411-45d8-92f6-7b4b33d02f40.png)
- 임계치(Threshold)를 '5'로 설정한다.
- Alert 이름은 자동으로 '주문서비스 요청율 alert'로 설정된다.
![image](https://user-images.githubusercontent.com/35618409/183370815-d900326b-8da0-4503-9c23-d92903f73181.png)
- 수정내용을 적용(apply)하고, Dashboard를 저장하면 '♥주문서비스 요청율'로 ♥가 타이틀앞에 붙는다.
- 이는 해당 차트에 Alert가 적용되었음을 의미한다. (녹색 : OK, 적색 : alert 발생)

##### Grafana Alert 서비스
- Grafana 왼쪽 메뉴에서 Alert 아이콘을 클릭한다.
- 설정된 주문서비스 요청율 Alert가 보여진다.
- Siege로 부하를 주어 초당 요청율을 증가시켜 본다.
```
kubectl exec -it pod/siege -n shop -- /bin/bash
siege -c20 -t40S -v http://order:8080
```
- 다시, Alert 목록을 조회하면 'PENDING'으로 임계치 초과에 따른 Alert이 발생했음이 보여진다.
![image](https://user-images.githubusercontent.com/35618409/183362467-2fecbce0-3e88-4062-aeb9-26ae700f075b.png)

#### Notification 설정
- Notification channels에서 New channel을 클릭해 Alert 수신방식을 지정한다.
![image](https://user-images.githubusercontent.com/35618409/183362971-d77df778-8ec6-40fc-9942-7a3b337ea398.png)

- SMTP로 Alerting 하기위해 grafana.ini를 수정해야 한다.
```
kubectl edit cm grafana -n istio-system
```

- default 설정
```
  grafana.ini: |
    [analytics]
    check_for_updates = true
    [grafana_net]
    url = https://grafana.net
    [log]
    mode = console
    [paths]
    data = /var/lib/grafana/
    logs = /var/log/grafana
    plugins = /var/lib/grafana/plugins
    provisioning = /etc/grafana/provisioning
```
- 아래 내용을 추가한다.
```
    [smtp]
    enabled = true
    host = smtp.gmail.com:587
    user = gmail-user@gmail.com
    password = ************
    skip_verify = true
```
- 편집 후, Grafana Pod를 재시작한다.
- SMTP 설정은 메일서버의 2-Factor인증에 따라 제대로 working하지 않을 수 있음
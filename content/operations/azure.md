---
description: ''
sidebar: 'started'
prev: ''
next: ''
---

# Azure Cloud Setup (AKS, ACR 설정)

### Azure 접속 환경 & ACR, AKS 생성 및 설정 

https://portal.azure.com

#### - Azure 관리콘솔에서 '구독(Subscription)' 확인   

- Azure 관리콘솔 접속
- '구독' 서비스에서 가용한 구독이름 확인  

```
user01~user31@gkn2025hotmail.onmicrosoft.com / password


```


#### - Azure 관리콘솔에서 '리소스 그룹' 생성   

- Azure 관리콘솔 접속
- '리소스 그룹' 서비스에서 새로운 그룹 추가
- 구독 선택
- 리소스 그룹명 입력
- 영역(Region) 입력 - '한국중부' 선택  


#### -  Cloud IDE - Azure Client Config 설정

```bash

$ az login 
```  


#### - AKS (Azure Kubernetes Service) 생성

```bash

$ az aks create --resource-group (RESOURCE-GROUP-NAME) --name (Cluster-NAME) --node-count 2 --enable-addons monitoring --generate-ssh-keys
```  


#### - K8s Client 에 Target Context 설정

```bash

$ az aks get-credentials --resource-group (RESOURCE-GROUP-NAME) --name (Cluster-NAME)
```  

한후, 다음을 통해 새로 생성한 클러스터에 부착됐는지 확인:

```
# kubectl get po
No resources found in default namespace.
# kubectl get node
NAME                                STATUS   ROLES   AGE   VERSION
aks-nodepool1-21539036-vmss000000   Ready    agent   20m   v1.20.7
aks-nodepool1-21539036-vmss000001   Ready    agent   20m   v1.20.7
```

#### - ACR (Azure Container Registry) 생성

```bash

$ az acr create --resource-group (RESOURCE-GROUP-NAME) --name (REGISTRY-NAME) --sku Basic
```  

#### - Azure AKS에 ACR Attach 설정

```bash

$ az aks update -n (Cluster-NAME) -g (RESOURCE-GROUP-NAME) --attach-acr (REGISTRY-NAME)
```  

#### - Azure ACR Login 설정

```bash

$ az acr login --name (REGISTRY-NAME) --expose-token
```  

빌드와 푸시를 한번에 하기
```
az acr build --registry [acr-레지트스리명] --image [acr레지스트리명].azurecr.io/order:v1 .
```

> shopmall 예제 빌드
```
cd shopmall
cd order
mvn package -B

```



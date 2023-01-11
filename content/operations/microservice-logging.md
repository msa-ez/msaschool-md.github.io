---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# 마이크로서비스 통합 로깅 with EFK stack

# 마이크로서비스 통합 로깅 with EFK stack

### 마이크로서비스 통합 로깅

- EFK(Elasticsearch, Fluentd, Kibana) 스텍을 클러스터에 설치하여 마이크로서비스 로그를 중앙에서 통합 모니터링한다.
- 로그 수집기를 Fluentd 대신 동일 회사(Treasure Data)가 제작한 High Performance의 경량화 버전인 Fluent Bit를 적용한다.
- 수집 데이터 저장소인 Elasticsearch를 기반으로 Kibana에서 조회 후, 시각화하여 통합 로깅한다.


### ElasticSearch 설치
 
- helm 레포지토리(저장소)를 추가하고 업데이트한다.
```
helm repo add elastic https://helm.elastic.co
helm repo update
```

- 추가된 레포지토리에서 설치정보를 수정하기 위해 helm으로부터 values를 받아온다. 
```
helm show values elastic/elasticsearch > es-value.yml
```

- 다운받은 yaml을 편집하여 아래 내용으로 수정 후 저장한다.
  - 복제본의 개수와 리소스를 줄여 아래와 같이 수정한다.
```
vi es-value.yml
```
```
  ...
24  replicas: 1
25  minimumMasterNodes: 1
  ...
  ...
78  image: "docker.elastic.co/elasticsearch/elasticsearch"
79  imageTag: "7.17.3"
  ...
  ...    
90  resources:
91    requests:
92      cpu: "500m"
93      memory: "1Gi"
94    limits:
95      cpu: "500m"
96      memory: "1Gi"
  ...
  
```

- 네임스페이스를 생성하고, 수정한 value 정보를 참조하여 elasticsearch를 설치한다.
```
kubectl create namespace logging
helm install elastic elastic/elasticsearch -f es-value.yml -n logging
```

- 설치된 Elastic Search를 사용하기 위해서는 접속정보를 미리 정리해 두어야 한다.
```
# id : elastic
# passwd : get from following kubectl command.

kubectl get secrets --namespace=logging elasticsearch-master-credentials -ojsonpath='{.data.password}' | base64 -d
```

- 설치한 내용을 확인한다.
```
kubectl get all -n logging
```


### FluentBit 설치

- Fluent Bit는 Helm Chart가 있지만 이해 차원에서 Github에서 clone하여 설치한다.
```
git clone https://github.com/fluent/fluent-bit-kubernetes-logging.git
cd fluent-bit-kubernetes-logging/
```

- 계정을 생성하고 Pod 읽기권한을 가진 클러스터 롤을 바인딩한다.
```
kubectl create -f fluent-bit-service-account.yaml -n logging
kubectl create -f fluent-bit-role-1.22.yaml -n logging
kubectl create -f fluent-bit-role-binding-1.22.yaml -n logging
```

- output/elasticsearch/ 폴더에 있는 리소스를 확인한다.
```
ls output/elasticsearch/
cd output/elasticsearch/
```

- fluent-bit-configmap.yaml은 공통적으로 적용되는 설정파일이고,
- fluent-bit-ds.yaml은 제너럴한 데몬셋 설치파일이다.
  - fluent-bit-ds.yaml을 편집하여 Fluent bit가 Elastic Search로 로그를 보내도록 한다.

```  
vi fluent-bit-ds.yaml
```
```
32   - name: FLUENT_ELASTICSEARCH_HOST
33     value: "elasticsearch-master"
```

- 35행 아래에 Fluent와 Elasticsearch간 tls 통신을 위한 Yaml Spec을 추가한다. 
```
    - name: FLUENT_ELASTICSEARCH_SCHEME
      value: "https"
    - name: FLUENT_ELASTICSEARCH_USER
      value: elastic
    - name: FLUENT_ELASTICSEARCH_PASSWORD
      valueFrom:
        secretKeyRef:
          name: elasticsearch-master-credentials
          key: password
```

- configmap 파일을 수정하여 57행 아래에 tls 설정을 추가한다.
```  
vi fluent-bit-configmap.yaml
```

```
        HTTP_User       ${FLUENT_ELASTICSEARCH_USER}
        HTTP_Passwd     ${FLUENT_ELASTICSEARCH_PASSWORD}
        # Trace_Output    On
        tls             On
        tls.verify      Off  
```

- 수정한 Yaml을 기반하여 ConfigMap과 데몬셋을 설치한다.
```
kubectl apply -f fluent-bit-configmap.yaml -n logging
kubectl apply -f fluent-bit-ds.yaml -n logging
```
 

### Kibana 설치

새로운 터미널을 오픈하여, EFK에서 시각화서버 역할을 하는 Kibana설치에 필요한 기본정보를 수정한다.

```
helm show values elastic/kibana > kibana-value.yml
```
```
ls
vi kibana-value.yml
```

- Kibana 설치를 위한 이미지 버전을 7.17.3으로 수정후 저장한다.
```
  ...
40    image: "docker.elastic.co/kibana/kibana"
41    imageTag: "7.17.3"
42    imagePullPolicy: "IfNotPresent"
     ...
52    resources:
53      requests:
54        cpu: "500m"
55        memory: "0.7Gi"
56      limits:
57        cpu: "500m"
58        memory: "0.7Gi"
    ...
122    service:
123      type: LoadBalancer
      ...   
```

- Kibana를 수정한 value 기반으로 설치한다.
```
helm install kibana elastic/kibana -f kibana-value.yml -n logging
```

### 통합 로깅에 필요한 12st Mall 배포

```
kubectl create ns shop
kubectl apply -f https://raw.githubusercontent.com/acmexii/demo/master/edu/order-liveness.yaml -n shop
kubectl expose deploy order --port=8080 -n shop
kubectl apply -f https://raw.githubusercontent.com/acmexii/demo/master/edu/delivery-rediness-v1.yaml -n shop
kubectl expose deploy delivery --port=8080 -n shop
```

### Elasticsearch 동작 확인

#### Elasticsearch 정상동작 확인을 위해 Port forwarding 후, GET 요청을 보내본다.
```
kubectl port-forward -n logging elasticsearch-master-0 9200:9200
```

- 새로운 터미널에서 인덱스를 조회한다.
```
curl -k https://localhost:9200 -u elastic:ELASTICSEARCH_PASSWORD
```

- 다음 샘과 같이 조회가 되면 정상적으로 실행중이다.
```
{
  "name" : "elasticsearch-master-0",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "PRDXqhO-QnGke9d8twMFTg",
  "version" : {
    "number" : "7.17.3",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "5ad023604c8d7416c9eb6c0eadb62b14e766caff",
    "build_date" : "2022-04-19T08:11:19.070913226Z",
    "build_snapshot" : false,
    "lucene_version" : "8.11.1",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

### Kibana를 통한 12st Mall 로깅

#### 1. Kibana Web Admin에 접속

- 아이디와 비번을 입력한다.
![image](https://user-images.githubusercontent.com/35618409/203238623-1dfdd6e4-0190-4804-a0e4-b8456ca99672.png)

- Explore My Own을 클릭한다.
![image](https://user-images.githubusercontent.com/35618409/203238963-4ca924df-7576-45fb-8dc4-75685b4442b7.png)

#### 2. Index 패턴 생성
- Kibana 접속 후, Management > Stack Management를 선택한다.
![image](https://user-images.githubusercontent.com/35618409/203239259-a633c9a0-7047-4b1d-a3f3-51eb874f3152.png)

- Kibana > Index Patterns을 클릭하면, 수집된 데이터가 있다는 메시지가 출력된다.
![image](https://user-images.githubusercontent.com/35618409/203239363-b6075ccb-32cf-45db-b1c4-a33a30be3f17.png)

- Create Index Pattern 클릭
> Name 필드에 logstash-* 입력
> Timestamp 필드에 @timestamp 선택
> Create Index Pattern 버튼 클릭


#### 2. 로그 조회
- Analytics > Discover 를 눌러 조회페이지를 오픈한다.
![image](https://user-images.githubusercontent.com/35618409/203239901-3f0ccba7-3773-4162-a707-70e600dab2b4.png)

- 'Add filter' 에서 'kubernetes.namespace.name is shop'으로 조건을 지정한다.
![image](https://user-images.githubusercontent.com/35618409/203240374-8ca665fa-2f76-4482-b84b-94c3b46bef0d.png)

- 조회할 Date Range에 인덱싱된 shop 네임스페이스 data가 존재하면 아래처럼 로그가 나타난다.
![image](https://user-images.githubusercontent.com/35618409/203240515-e5a4e6e8-c2e6-4a37-b755-24e1d1511562.png)


#### 3. 로그리게이션 (Log + Aggregation)
- 로그가 표시되는 영역의 컬럼을 선택하여 주문, 배송 서비스의 Stack trace를 확인한다.
- 우측  Selected fields에서 log와 kubernetes.labels.app을 선택한다.
![image](https://user-images.githubusercontent.com/35618409/203241007-10667a19-d42b-407f-aabe-ceff97f21e52.png)
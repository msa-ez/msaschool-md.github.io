---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# 파일시스템 (볼륨) 연결과 데이터베이스 설정

# 파일시스템 (볼륨) 연결과 데이터베이스 설정

## 주문 서비스에 Database 설치 후 연결하기

> 데이터베이스 설정이 이루어진 order project 를 새 터미널에서 다운로드 한다.
```
git clone https://github.com/event-storming/monolith

cd monolith
```

먼저 기존 Dockerfile 삭제하고, Dockerfile-prod 를 Dockerfile 로 바꾼다.
```
rm Dockerfile
mv Dockerfile-prod Dockerfile
```

빌드하여 order:database 라는 이미지명으로 레지스트리에 등록한다
e.g. (도커허브일 경우)
```
mvn package -B 

# jinyoung을 내 도커 계정(ID)로 수정
docker build -t jinyoung/order:database .
docker push jinyoung/order:database
# 권한 오류 발생시, docker login으로 Token 생성
```

### 데이터베이스 설정 확인 및 생성
monolith order 서비스의 Database 설정을 확인하고, 컨테이너 플랫폼에서 저장소 정보를 주입하여  데이터베이스에 접근 가능하도록 설정되어 있다:

- application-prod.yml 
```
spring:
  jpa:
    hibernate:
      naming:
        physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
      ddl-auto: update
    properties:
      hibernate:
        show_sql: true
        format_sql: true
        dialect: org.hibernate.dialect.MySQL57Dialect
  datasource:
    url: jdbc:mysql://${_DATASOURCE_ADDRESS:35.221.110.118:3306}/${_DATASOURCE_TABLESPACE:my-database}
    username: ${_DATASOURCE_USERNAME:root1}
    password: ${_DATASOURCE_PASSWORD:secretpassword}
    driverClassName: com.mysql.cj.jdbc.Driver
```

변경한 정보를 환경변수에서 얻어오도록 설정하였고,  Deployment 에서 위의 값이 전달되도록 주입할 수 있다:

- 아래 Database 환경정보를 가진 YAML을 복사하여 deployment.yaml로 생성한다.
- 이때, 이미지 이름(20 라인)은 내가 만든 이미지명으로 변경한다.

```
apiVersion: "apps/v1"
kind: "Deployment"
metadata: 
  name: "order"
  labels: 
    app: "order"
spec: 
  selector: 
    matchLabels: 
      app: "order"
  replicas: 1
  template: 
    metadata: 
      labels: 
        app: "order"
    spec: 
      containers: 
        - 
          name: "order"
          image: "jinyoung/order:database"
          ports: 
            - 
              containerPort: 8080
          env:
            - name: superuser.userId
              value: some_value					
            - name: _DATASOURCE_ADDRESS
              value: mysql
            - name: _DATASOURCE_TABLESPACE
              value: orderdb
            - name: _DATASOURCE_USERNAME
              value: root
            - name: _DATASOURCE_PASSWORD
              value: admin
```

실행 후에 kubectl logs 로 로그를 확인하면 다음과 같은 오류를 발견할 수 있다:

```
kubectl apply -f deployment.yaml
kubectl get po # pod 명 확인
kubectl logs <pod 명>
```
로그 내용중:
```
Caused by: java.net.UnknownHostException: mysql: Name does not resolve
```
우리가 제공한 DB server 의 주소를 환경변수로 잘 받아왔고 (mysql), 그 주소로 접근을 시도했으나 서비스가 올라있지 않으므로 발생하는 오류이다.


값을 위와 같이 Deployment 설정에 직접 입력하는것은 별도의 Configuration 을 위한 쿠버네티스 객체인 ConfigMap (혹은 Secret)을 선언하여 연결할 수 있다. 여기서는 패스워드가 노출되면 안되므로 PASSWORD 에 대해서만 Secret 을 이용하여 분리해준다:
```
apiVersion: v1
kind: Secret
metadata:
  name: mysql-pass
type: Opaque
data:
  password: YWRtaW4=
```
> "YWRtaW4="는  'admin' 문자열의 BASE64 인코딩된 문자열이다.   "echo -n 'admin' | base64" 명령을 통해 생성가능하다.

Secret 스펙을 deployment.yaml 에 추가하고:
(추가 시, 맨 아래 새로운 라인에 --- (triple dash)를 추가하고 다음 라인에 붙여넣는다.)
```
kubectl apply -f deployment.yaml 

secret/mysql-pass created
```

생성된 secret 을 확인한다:
```
kubectl get secrets

NAME                  TYPE                                  DATA   AGE
default-token-l7t7b   kubernetes.io/service-account-token   3      4h24m
mysql-pass            Opaque                                1      1m
```

해당 Secret 을 Order Deployment 에 반영:
- 아래 YAML 전체를 복사하여 deployment.yaml의 env: 를 덮어쓴다.
```yaml
          env:
            - name: superuser.userId
              value: userId
            - name: _DATASOURCE_ADDRESS
              value: mysql
            - name: _DATASOURCE_TABLESPACE
              value: orderdb
            - name: _DATASOURCE_USERNAME
              value: root
            - name: _DATASOURCE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-pass
                  key: password
```

## Database 서비스의 생성
주문 서비스를 위한 데이터베이스로 MySQL 을 사용하기로 한다. MySQL 이미지명으로 간단하게 Pod 하나를 생성한다. 

MySQL 을 위한 Pod 설치:
- 아래 YAML을 복사하여 mysql-deployment.yaml로 저장한다.
```
apiVersion: v1
kind: Pod
metadata:
  name: mysql
  labels:
    name: lbl-k8s-mysql
spec:
  containers:
  - name: mysql
    image: mysql:latest
    env:
    - name: MYSQL_ROOT_PASSWORD
      valueFrom:
        secretKeyRef:
          name: mysql-pass
          key: password
    ports:
    - name: mysql
      containerPort: 3306
      protocol: TCP
    volumeMounts:
    - name: k8s-mysql-storage
      mountPath: /var/lib/mysql
  volumes:
  - name: k8s-mysql-storage
    emptyDir: {}
```

생성된 yaml 을 mysql-deployment.yaml 에 추가한 후:
```
kubectl apply -f mysql-deployment.yaml

pod/mysql created
```

Pod 실행을 확인한다:
```
$ kubectl get pod

NAME        READY   STATUS    RESTARTS   AGE
mysql   1/1     Running   0          30s
Now, we can connect to the k8s-mysql pod:
```

새 터미널에서 Pod 에 접속하여 orderdb 데이터베이스 공간을 만들어주고 데이터베이스가 잘 동작하는지 확인한다:

```
kubectl exec mysql -it -- bash

# echo $MYSQL_ROOT_PASSWORD
admin

# mysql --user=root --password=$MYSQL_ROOT_PASSWORD

mysql> create database orderdb;
    -> ;
Query OK, 1 row affected (0.01 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| orderdb            |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.01 sec)

mysql> exit
```

주문 마이크로 서비스를 쿠버네티스 DNS 체계내에서 접근가능하게 하기 위해 ClusterIP 로 서비스를 생성해준다. 주문 서비스에서 mysql 접근을 위하여 "mysql"이라는 도메인명으로 접근하고 있으므로, 같은 이름으로 서비스를 만들어준다:
```
apiVersion: v1
kind: Service
metadata:
  labels:
    name: lbl-k8s-mysql
  name: mysql
spec:
  ports:
  - port: 3306
    protocol: TCP
    targetPort: 3306
  selector:
    name: lbl-k8s-mysql
  type: ClusterIP
```
> 마찬가지 위의 내용을 mysql-deployment.yaml 에 추가하고 kubectl apply -f mysql-deployment.yaml 실행한다.

주문 마이크로 서비스만을 새로 재기동 시키기 위해서는 아래와 같이 po 를 삭제해주면 deployment 에 의해서 알아서 재시작된다:

```
kubectl get po -l app=order
kubectl delete po [order-po-name]
```
이렇게 잘 접속이 된다면 다음의 로그를 확인할 수 있다:

```
Hibernate: 
    insert 
    into
        ProductOption
        (description, name, optionName, PRODUCT_ID) 
    values
        (?, ?, ?, ?)
Hibernate: 
    insert 
    into
        Product
        (imageUrl, name, price, stock) 
    values
        (?, ?, ?, ?)
Hibernate: 
    insert 
    into
        ProductOption
        (description, name, optionName, PRODUCT_ID) 
    values
        (?, ?, ?, ?)
Hibernate: 
    insert 
    into
        ProductOption
        (description, name, optionName, PRODUCT_ID) 
    values
        (?, ?, ?, ?)
```

## 주문 걸어보기

siege pod 에 들어가서 주문을 걸어준다:
- 먼저 Siege Pod를 다음 YAML로 설치하자.
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

```
kubectl exec -it siege -- /bin/bash 
http order:8080/orders productId=1 customerId="jjy"
```
> 위의 'order' 도메인 주소로 접근이 되도록 하려면 order 를 위한 Service (이름 order) 객체가 꼭 만들어져 있어야 한다.
> deployment.yaml에 아래 스펙을 추가하여 재 배포한다.

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
- 재 배포한 다음, 주문을 다시 생성해 본다.
- 
```
kubectl exec -it siege -- /bin/bash 
http order:8080/orders productId=1 customerId="jjy"
```

주문 마이크로 서비스의 데이터가 설치한 MySQL을 통하여 보존되는 것을 확인한다. 
```
mysql> use orderdb
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+-------------------+
| Tables_in_orderdb |
+-------------------+
| Delivery          |
| Product           |
| ProductOption     |
| order_table       |
+-------------------+
4 rows in set (0.00 sec)

mysql> select * from order_table;

+----+--------------+------------+--------------+-------+-----------+-------------+----------+-------------+-------------+
| id | customerAddr | customerId | customerName | price | productId | productName | quantity | state       | product_idx |
+----+--------------+------------+--------------+-------+-----------+-------------+----------+-------------+-------------+
|  1 | NULL         | jjy        | NULL         | 10000 |         1 | TV          |        0 | OrderPlaced |           1 |
+----+--------------+------------+--------------+-------+-----------+-------------+----------+-------------+-------------+
1 row in set (0.00 sec)

```

> 주문 마이크로 서비스를 내렸다가 올려도 주문한 내역이 그대로 존재함을 확인할 수 있어야 한다.

## PersistenceVolume 을 통한 데이터베이스 데이터 보존

먼저, MySQL 서비스의 설치를 제거했다가 다시 기동시켜본다:

```
kubectl delete pod mysql
kubectl apply -f mysql-deployment.yaml
```

```
kubectl exec mysql -it -- bash
mysql --user=root --password=$MYSQL_ROOT_PASSWORD
show databases;
```
애플리케이션 데이터가 소실됨을 확인할 수 있다. 

이는, MySQL 자체가 사용하는 볼륨이 해당 Pod 에 기본 부착된 파일시스템이기 때문이다. 이를 해결하기 위하여 PersistenceVolume 으로 된 파일시스템에 연결하도록 설정한다:

- mysql-deployment.yaml에서 emptyDir{}을 persistentVolumeClaim으로 수정한다.
> 맨 아래 2줄만 복사하여 적용
```
    volumeMounts:
    - name: k8s-mysql-storage
      mountPath: /var/lib/mysql
  volumes:
  - name: k8s-mysql-storage
    persistentVolumeClaim:
      claimName: "fs"  
```
변경후 재배포한 다음,
```
kubectl delete -f mysql-deployment.yaml 
kubectl apply -f mysql-deployment.yaml 
```
기다려보면 해당 Pod 는 Pending 상태에 잠기게 된다. 이유는 해당 Pod 를 위한 fs 라는 PVC가 생성되지 않았기 때문이다.

우리는 저 "fs" 라고 하는 PVC 를 플랫폼(AWS, Azure등)의 파일 서비스에서 만들어와야 한다.


### PVC 생성

PersistentVolumeClaim - PVC 를 생성하는 방법은 간단하다. 기본으로 장착된 gp2라고 하는 StorageClass 를 통해서 얻을 수 있기 때문이다.
아래 yaml 을 mysql-pvc.yaml에 추가한 다음 배포하고, kubectl get pvc 를 통해 PVC가 생성되는 것을 확인한다. 
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: fs
  labels:
    app: test-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

PVC가 생성되면, mysql pod 의 pending 이 해제될 것이다. 

- 이제 AWS 영구 스토리지에 DB 생성이 가능하다. PVC 상태를 확인:

```
# kubectl get pvc
NAME            STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
fs         Bound     pvc-225ebe47-cc67-4985-8f94-c0d4d795dede   1Gi        RWO            gp2            9m47s
```

- 다시 MySQL DB에 접속하여 주문 DB(orderdb)를 생성해 주어야 하고, 
- 주문 서비스를 재기동하여 필요한 테이블이 생성되도록 한다.
```
kubectl exec mysql -it -- bash
mysql --user=root --password=$MYSQL_ROOT_PASSWORD
create database orderdb; 
show databases;
```
```
kubectl delete -f deployment.yaml
kubectl apply -f deployment.yaml
```

- 그런 다음 주문을 넣어보자.
```
kubectl exec -it siege -- /bin/bash 
http order:8080/orders productId=1 customerId="jjy"
```
이제, MySQL 이 소실된다하더라도, PersistenceVolume 에 실제 연결된 클라우드 파일 시스템에 주문 데이터가 보존될것이다. 


mysql pod 를 삭제하고,
```
kubectl delete pod mysql
kubectl apply -f mysql-deployment.yaml
```

데이터베이스가 재시작된 후 주문 데이터가 존재함을 확인한다.
```
kubectl exec mysql -it -- bash
mysql --user=root --password=$MYSQL_ROOT_PASSWORD
use orderdb;
show tables;
select * from order_table;
```
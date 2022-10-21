---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# 12번가 Mall에 토큰인증 적용하기

# 12번가 Mall에 토큰인증 적용하기

### 12st Mall에 토큰인증 적용
- keycloak을 클러스터에 설치하고, 권한추가, 사용자 등록 등 보안설정을 수행한다.
- 마이크로서비스를 배포하고, 토큰기반 인증이 가능하도록 설정한 다음 배포 및 적용해 본다.

### 첫번째, Keycloak 설치하기
- Helm Chart 설정
```
cd /home/project
git clone https://github.com/acmexii/mall-with-keylcoak-JWT.git
cd mall-with-keylcoak-JWT
tar xvf keycloak.tar
cd keycloak
vi values.yaml
# 96라인과 99라인의 
# adminUser, adminPassword 값을
# 모두 admin으로 수정하고 저장/종료한다.
```

- 네임스페이스 생성 및 설치
```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
kubectl create namespace keycloak
helm install keycloak bitnami/keycloak -f values.yaml --namespace keycloak
kubectl get all -n keycloak
```
- keycloak SSO Server가 Postgresql DB기반으로 설치되어 조회된다.
- 발급된 EXTERNAL-IP를 복사하여 브라우저에서 접근한다.

#### Keycloak 서버 설정

- 웹브라우저에서 Keycloak 관리콘솔(http://EXTERNAL-IP/)에 접속한다.
- 관리자 계정이 (admin/admin)으로 등록되어 있다.
- 'Administration Console'을 눌러 콘솔로 진입한다.

![image](https://user-images.githubusercontent.com/35618409/156484122-ffa109fc-d558-4ab1-bfcf-60b83cbaf7bc.png)


### 두번째, Keycloak 설정하기 

#### 1/5. Realm 추가
- 'test-realm' 이름으로 Root 관리단위인 Realm을 추가한다.
- 추가된 Realm에서 Token의 Lifespan을 1시간으로 조정한다.

#### 2/5. Client 등록
- 왼쪽 메뉴 Client를 눌러, Realm 범주의 Client를 추가한다.
- 'test-client' 이름으로 OAuth2 CLIENT를 등록한다.
> Root URL: http://EXTERNAL-IP/
- 'Save'를 눌러 저장한다.

#### 3/5. Client의 OAuth2 설정을 추가한다.
- 등록된 Client의 Settings 탭에서 아래 설정을 추가해 준다.
> Redirect URI: http://GATEWAY-EXTERNAL-IP:8080/*
> Access Type: public에서 confidential로 설정
> OAuth2의 "Client Credentials" 타입이 활성화된다.

![image](https://user-images.githubusercontent.com/35618409/156488402-9cbe5c86-bf4f-43df-a1d0-1a9468b07cd7.png)

- 'Save'를 눌러 저장한다.

- 'Credentials' 탭을 눌러, Client의 Secret 정보가 발급됨을 확인한다.


#### 4/5. 권한(Role) 및 사용자 설정
- 'Roles' 탭을 눌러 Client의 Local Role을 추가한다.
![image](https://user-images.githubusercontent.com/35618409/156489319-547b9359-9ab6-48a8-b60e-840f64dd0dae.png)

- 아래 목록처럼 나타나도록 Role 이름을 부여한다.
![image](https://user-images.githubusercontent.com/35618409/156489389-068e1763-45cb-467c-ac7f-cef9ff71aba0.png)


- 왼쪽 메뉴에서 Users를 눌러 사용자를 등록한다.
> 사용자 정보는 Custom하게 생성해 본다. (User와 Admin 계정포함)
![image](https://user-images.githubusercontent.com/35618409/156489961-925921e0-fccc-4962-84cb-a48c095112ce.png)

- 등록 후, Credentials 탭에서 비밀번호를 등록하는데 이때, Temporary를 Off로 설정한다.

![image](https://user-images.githubusercontent.com/35618409/156490161-f7f4d714-bb17-4b21-9931-3b26608e9cd1.png)

- User 등록이 끝나면, Role과 사용자를 매핑한다.
- 등록한 사용자 각각에서 'Role Mappings' 탭을 눌러 Client의 Local Role을 선택해 준다.
![image](https://user-images.githubusercontent.com/35618409/156490674-2c253aa0-44b3-45fb-be21-3fcc3952e2ed.png)

> User 계정에는 'ORDER_CUSTOMER' 역할 매핑
> Admin 계정에는 'ORDER_ADMIN', 'ORDER_CUSTOMER' 역할 매핑


#### 5/5. 로그인 페이지 설정
- 등록한 Realm의  General 탭에서 Display name을 '12st_shopMall'로 설정한다.
- Login 탭에서 '사용자 등록', '비밀번호 분실', '기억하기'를 추가로 On 으로 설정한다.


### 세번째, 12st Mall에 SSO 적용하기
- 12st Mall 코드에 Keycloak설정을 적용한다.
- VSCode의 Explorer영역을 펼쳐 코드를 수정한다.

### Gateway 서비스 배포

#### 1/5. Gateway OAuth2 Client 설정

- pom.xml을 통해 Gateway에 설정된 라이브러리(oauth2 client)를 확인한다.
- application.yml에 oauth2 client 설정을 주입한다.
- 주석 부분을 해제하고 나의 keycloak 정보로 수정한다.
```yaml
#  security:
#    oauth2:
#      client:
#        provider:
#          my-keycloak-provider:
#            issuer-uri: http://KEYCLOAK-EXTERNAL-IP/auth/realms/test-realm
#        registration:
#          keycloak-test-client:
#            provider: my-keycloak-provider
#            client-id: test-client
#            client-secret: HKFKYP7kb8OMldAgfvnk27FhRPOv8Y7H
#            authorization-grant-type: authorization_code
#            redirect-uri: '{baseUrl}/login/oauth2/code/keycloak'
#            scope: openid
```
> keycloak Endpoint 정보는 Realm에서 OIDC 링크를 통해 확인 가능하다.

![image](https://user-images.githubusercontent.com/35618409/156495160-c1dba952-ad18-45d8-b170-e2cfe377887d.png)


#### 2/5. Gateway Security Configuration 
- SecurityConfig.java 파일을 열어 기본 설정을 확인한다.
- 백엔드 마이크로서비스 단위의 화이트 리스트만 보이고, API 리소스에 대한 설정은 없어 간결하다.


#### 3/5. Gateway에서 Backend 라우팅 
- application.yml을 다시 오픈한다.
- 주문 마이크로서비스에 대한 라우팅 설정과 TokenRelay 필터를 적용해 준다.
```yaml
#      default-filters:
#        - TokenRelay
#      routes:
#        - id: order
#          uri: http://order:8080
#          predicates:
#            - Path=/orders/**, /order/**
```
- application.yml을 저장한다.

#### 4/5. Gateway 이미지 빌드 및 배포
```
cd gateway
mvn package -B -DskipTests
# 'username'을 나의 Docker account로 수정
docker build -t username/gateway:v2 .
docker push username/gateway:v2
cd gateway/kubernetes
vi deployment.yml
# 19라인의 이미지 이름을 빌드한 이름에 맞도록 수정/저장한다.
kubectl apply -f ./
kubectl get all
```

#### 5/5. OAuth2 Client 확인
- 브라우저를 열어 Gateway Root(http://EXTERN-IP:8080/)에 접속한다.
- Controller.java에 테스트용 Content("/")가 설정되어 있다.

- 인증서버의 Login페이지가 출력되고, 등록한 사용자로 인증한다.
- 아래와 같이 ACL이 적용된 콘텐츠가 출력된다.

![image](https://user-images.githubusercontent.com/35618409/156498442-37706c2f-ff8f-445b-8c2b-0f6416888233.png)

#### JWT Token 확인
- http://EXTERN-IP:8080/token 호출
- JWT Token String이 브라우저에 출력되는데 이를 복사한다.
- jwt.io 에 접속한다.
- 나타나는 'Encoded' 영역에 붙여넣어 Token을 확인한다.


### Order 서비스 설정

#### OAuth2 Resource Server 설정

- Order 마이크로서비스의 pom.xml을 통해 Resource Server 설정에 필요한 라이브러리(oauth2-resource-server)를 확인한다.
- application.yml에 oauth2-resource-server 설정을 주입한다.
- application.yml을 열어 주석 부분을 해제한다.
```yaml
#  security:
#    oauth2:
#      resourceserver:
#        jwt:
#          jwk-set-uri: http://KEYCLOAK-EXTERNAL-IP:80/auth/realms/test-realm/protocol/openid-connect/certs
```
>  keycloak Endpoint 정보는 Realm에서 OIDC 링크를 통해 확인 가능하다.

![image](https://user-images.githubusercontent.com/35618409/156495160-c1dba952-ad18-45d8-b170-e2cfe377887d.png)


#### Resource Server Security Configuration 
- security 패키지의 ResourceSecurityConfig.java 파일을 열어 기본 설정을 확인한다.
- 메소드 레벨의 Spring security를 적용하기 위해 @EnableGlobalMethodSecurity을 설정한다.
- Gateway로부터 전달받은 JWT 토큰으로부터 Claim을 추출하여 Spring security에 Injection한다.


#### 메소드 레벨 Fine grained Role 적용
- Order 서비스의 Controller.java를 열어 Role 설정을 확인한다.
- javax.annotation.security.RolesAllowed 를 활용해 메소드 레벨 ACL을 적용한다.
> Spring Security의 @Secured 로도 제어 가능하다.
> Keycloak > JWT Claim > Spring Security로 전달되었다.

#### Order 이미지 빌드 및 배포
```
cd order
mvn package -B -DskipTests
# 'username'을 나의 Docker account로 수정
docker build -t username/order:v2 .
docker push username/order:v2
cd order/kubernetes
vi deployment.yml
# 19라인의 이미지 이름을 빌드한 이름에 맞도록 수정/저장한다.
kubectl apply -f ./
kubectl get all
```

#### Order 서비스 ACL 테스트
- 브라우저로 http://GATEWAY-EXTERNAL-IP:8080에 접속한다.
- 접속 후, 인증한 User의 Role에 따른 응답을 확인해 본다.
```sh
http://GATEWAY-EXTERNAL-IP:8080/orders
http://GATEWAY-EXTERNAL-IP:8080/orders/placeAnOrder
http://GATEWAY-EXTERNAL-IP:8080/orders/orderManage
```
- '/orders' 는 access_token이 있으면 접근가능하다.
- '/orders/placeAnOrder'에는 사용자 Role이 매핑되어 있어, 사용자 정보로 로그인해야 접속 가능하다.
- '/orders/orderManage'에는 관리자 Role이 매핑되어 있어, 관리자 정보로 로그인해야 접속 가능하다.

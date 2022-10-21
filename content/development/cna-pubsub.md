---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# JWT Token 기반 인증 인가 - Advanced

# JWT Token 기반 인증 인가 - Advanced

## JWT기반 인증 w/ Keycloak

### OAuth2 Stackholders
- Spring Security와 Spring oauth2를 사용하고, Resource Owner, Client, Authorization Server, Resource Server간의 인증/인가를 실습한다.
- JWT기반 Access_Token을 활용한다.
- 인증/인가 서버로 Standalone Keycloak(https://www.keycloak.org/) 서버를 활용한다.

### Keycloak SSO 토핑 적용
- Code > Code Preview를 눌러 모델기반 템플릿 코드창을 연다.
- 우측 상단의 TOPPINGS를 클릭하여 Keycloak SSO를 적용한다.
![image](https://user-images.githubusercontent.com/35618409/190953029-6f27e3ec-2ad8-4101-b223-6ffe5675af48.png)

- 적용결과, keycloak 프로젝트가 추가되었고, Client인 Gateway의 application.yml 설정에도 oauth2설정이 추가된 것이 확인된다.
 ![image](https://user-images.githubusercontent.com/35618409/190953662-d6b127f8-b532-4cc8-aa42-5b64ea47842f.png)
 
 ### Keycloak Server 접속/설정

#### Keycloak이 적용된 Model Code 반영

- 이벤트 스토밍 결과 코드를 생성하고 push 한 후, Code 를 update 한다.
- Gitpod에서 모델코드가 push된 template 브랜치와  main 브랜치를 Merge 한다.
```
git pull && git merge origin/template
```

 #### Keycloak 서버 실행
 
 - keycloak 폴더로 이동하여 컨테이너를 생성하고 및 Keycloak 서버를 실행한다.
```sh
cd keycloak
docker-compose up -d
# 실행 확인
docker container ls 
```

 #### Keycloak 서버 오픈 및 접속하기
 - 왼쪽 메뉴의 'Remote Explorer'를 눌러 keycloak이 사용하는 포트(9090)를 외부에 오픈한다.  (자물쇠 아이콘 클릭)
![image](https://user-images.githubusercontent.com/35618409/190956537-056d6f0a-6b46-45c0-9df8-55d7a3cb7fc4.png)

- 오픈된 keycloak 항목 3번째, 브라우저 아이콘(지구모양)을 눌러 웹 브라우저에서 접속한다.  
-  Administration Console을 클릭해 설정된 관리자 정보(admin / admin)로 로그인한다.
![image](https://user-images.githubusercontent.com/35618409/190956899-9c7efca3-04ac-4f11-851c-1e199debaa02.png)

- Keycloak 메인 화면이 아래와 같이 출력된다.
![image](https://user-images.githubusercontent.com/35618409/190957013-3a6669d9-0928-498b-9529-cbac6fad8cd5.png)


### Keycloak  Server와 Client(Gateway)간 Security 설정

- Master Realm에서 'Tokens' 탭을 눌러 Access Token Lifespan을 1시간으로 수정한다.
- 수정 후, 하단의 'save' 를 눌러 저장한다.
- Master Realm에서 Endpoints 링크를 클릭해 엔드포인트 창을 열어둔다.
![image](https://user-images.githubusercontent.com/35618409/190969570-2a75868c-2b68-44e1-b69c-2bfa4dcfe54b.png)

#### Issuer  등록
- 엔드포인트 창에서 issuer로 검색된 value를 Gateway application.yml에 등록한다.(39라인)
![image](https://user-images.githubusercontent.com/35618409/190958542-d700f666-f889-49a9-8fde-62fc92267bdc.png)

#### jwk-uri 등록
- 엔드포인트 창에서 jwk로 검색된 value를 Gateway application.yml에 등록한다.(50라인)
![image](https://user-images.githubusercontent.com/35618409/190958759-036c3ffd-8fba-42af-905e-a971291557ac.png)

#### OAuth Client 등록
- Keycloak 서버의 왼쪽메뉴에서 Clients를 눌러 12stmall 을 추가한다.
 ![image](https://user-images.githubusercontent.com/35618409/190959198-145da6e6-f82d-412c-843c-9f5caf47c09e.png)
 
 - 등록한 Client id를 Gateway application.yml 설정의 client-id: 에 추가한다.
 - 등록된 Client 설정에서 Access Type을 confidential로 설정한다.
 ![image](https://user-images.githubusercontent.com/35618409/190959505-5adf84bf-cda5-4cd9-ba90-e8c7d806a8dc.png)
 
 - 아래에 있는 Valid Redirect URIs 설정에 다음과 같이 입력한다.
 - 규칙 : Gateway Endpoint URL + /login/oauth2/code/ + Client ID(12stmall)
![image](https://user-images.githubusercontent.com/35618409/191009706-1033fa72-194b-4806-b9e7-33cffcffcf42.png)
 - Valid Redirect URIs 정보를 Gateway application.yml 설정의 redirect-uri: 에 추가한다.

- 저장 후, Credentials 탭을 확인하면 Secret (비밀번호)가 설정되는데 이를 Gateway application.yml 설정의 client-secret: 에도 추가한다.
![image](https://user-images.githubusercontent.com/35618409/190960454-9348d122-30d3-49b0-b63d-6389107a305e.png)
 
- Application.yml에 완료된 설정은 다음과 같다. (참조)
```
  security:
    oauth2:
      client:
        provider:
          keycloak:
            issuer-uri: https://9090-acmexii-labshopmonolith-orw1glcgvae.ws-us65.gitpod.io/realms/master
            user-name-attribute: preferred_username
        registration:
          keycloak:
            client-id: 12stmall
            client-secret: 7cic1U8ZS7ZOGruyBNlPY0BHzeeUinXj
            redirect-uri: https://8088-acmexii-labshopmonolith-orw1glcgvae.ws-us65.gitpod.io/login/oauth2/code/12stmall
            authorization-grant-type: authorization_code
            scope: openid
      resourceserver:
        jwt:
          jwk-set-uri: https://9090-acmexii-labshopmonolith-orw1glcgvae.ws-us65.gitpod.io/realms/master/protocol/openid-connect/certs
```
 
 ### Test User 등록
 
- Keycloak 서버의 왼쪽 메뉴에서 Users를 눌러 사용자를 등록한다.
![image](https://user-images.githubusercontent.com/35618409/190961205-3c69d45e-2705-4ba2-af18-edbff2f57bf4.png)
- user@naver.com 으로 저장한다.

- 등록한 사용자의 Credentials 탭에서 비밀번호를 설정하고,  Temporary를 OFF로 한 다음 설정한다.
![image](https://user-images.githubusercontent.com/35618409/190961449-1acc3c93-f448-42be-8b6e-dd6f4c99ac20.png)


### Keycloak SSO Test

- Gateway와 마이크로서비스를  재시작한다.
```
cd gateway
mvn spring-boot:run
```
- Gateway 서비스 또한 Liten Port를 외부에 오픈한다.
![image](https://user-images.githubusercontent.com/35618409/190962087-a82b9e08-0cde-4d28-8e10-05cd89c938ea.png)
-  왼쪽 메뉴인 'Remote Explorer'에서도 설정 가능하다.

- 마이크로서비스를 시작한다.
```
cd monolith
mvn spring-boot:run
```

- 다음의 오류 발생시, kafka를 시작한다.
```
Broker may not be available.
2022-09-19 06:43:53.548  WARN [monolith,,,] 5204 --- [| adminclient-2] org.apache.kafka.clients.NetworkClient   : [AdminClient clientId=adminclient-2] Connection to node -1 (localhost/127.0.0.1:9092) could not be established. Broker may not be available.
```
```
cd kafka
docker-compose up -d
```

- 웹 브라우저의 새로운 탭에서  Gateway를 경유하여 Order 마이크로서비스에 접속해 본다.
```
https://8088-acmexii-labshopmonolith-orw1glcgvae.ws-us65.gitpod.io/orders
(Gateway URL need to be modified)
```
- 비인가된 Resource 접근으로 Keycloak SSO 로그인 창이 나타난다.
 ![image](https://user-images.githubusercontent.com/35618409/190966067-a39781e6-87bc-47e6-9688-eea7f7f7cd86.png)
 
 - 관리콘솔에서 등록한 사용자(user@naver.com / 1)로 인증한다.
 - 인증 성공 후, 주문서비스의 응답이 정상적으로 출력된다.
  

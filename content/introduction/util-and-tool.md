---
description: ''
sidebar: 'introduction'
---
# 유틸리티 및 도구
## 단계별 학습 시 필요한 Software 및 교구 소개

### 크롬(Chrome) 브라우저
        </mark-down>
        <mark-down class="content">

- 로컬 디바이스에 크롬 브라우저가 설치되어 있어야 합니다.
- 브라우저 설정 : 크롬 브라우저의 캐쉬 설정에서 ‘쿠키가 허용됨’ 옵션이 설정되어 있어야 합니다.

![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image4.png)

---

### JDK(Java Development Kit)
MSA 교육은 Java 환경이 설치되어 있어야 하며, 원활한 교육을 위해 JDK 11 이상 버전의 설치를 추천합니다.
- JDK 다운로드 (둘중 하나 설치)
  - Open JDK : https://jdk.java.net/15/
  - Oracle JDK : https://www.oracle.com/java/technologies/javase-downloads.html
- 설치 버전은 11, 13, 15 설치 후 아래 사이트를 참고하여 추가 환경정보를 설정해 주시면 됩니다. 
- 설치 및 설정 참조 : https://jhnyang.tistory.com/224

---

### Httpie
![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image1.jpg)

Httpie는 python으로 개발된 콘솔용 http client 유틸리티로 curl 대신 http 개발 및 디버깅 용도로 사용되는 Software입니다.

본 사이트 구현 단계에서는 데이터 조회, 입력, 수정 등 클라이언트 요청 생성 시, Httpie를 사용하고 있습니다.

- curl에 비해 사용이 쉬움
- json 지원 기능 내장
- 출력을 포맷팅해 보여주므로 가독성이 뛰어남
- Form 과 file 업로드가 쉬움
- HTTP 인증 및 커스텀 헤더 설정이 가능

☞ [Httpie 설치 - windows](https://github.com/TheOpenCloudEngine/uEngine-cloud/wiki/Httpie-%EC%84%A4%EC%B9%98 "Httpie 설치")
☞ [Httpie 홈페이지](https://httpie.org/doc "Httpie 문서")

---

### Visual Studio Code (VS Code)
        </mark-down>
        <mark-down class="content">
비주얼 스튜디오 코드는 Microsoft에서 오프소스로 개발하고 있는 에디터입니다. 윈도우, MacOS, 리눅스 운영체제를 모두 지원하며,
디버깅/Git 제어/확장프로그램(extension)등 다양한 기능이 포함되어 있는 무료 버전입니다.

현재 랩 환경의 통합 개발 도구인 theia-ide 는 클라우드 개발 환경으로 가장 많이 쓰이는 VS code 의 gui 와 사용법 및 숏컷 키보드 매핑이 동일한 카피캣입니다.
따라서 로컬 환경에 VS code 를 설치하시면 학습한 내용을 동일하게 사용하실 수 있습니다.

![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image5.png)

- VS code 다운로드 URL(System Installer 로 설치) : https://code.visualstudio.com/download 
- VS code + 자바 설치법: https://niceman.tistory.com/198

- MacOS, 리눅스, 윈도우등 다양한 운영체제들 지원
- 코드, 변수타입, 함수정의등 코드 intellisense(단어 자동완성) 기능
- GIT의 기본 지원
- 강력한 CSS 유효성 체크 기능
- 안전성과 뛰어난 속도

---

### Kafka
![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image2.jpg)

Apache Kafka(아파치 카프카)는 LinkedIn에서 개발된 분산 메시징 시스템입니다. 대용량 실시간 로그처리에 특화되어 기존 메시징 시스템보다 TPS(Transaction per Second)가 우수합니다.
서비스 제공자가 퍼블리시(Publish)한 이벤트를, 필요한 소비자가 구독(Subscribe)하여 활용하는 Pub/Sub 기반 아키텍처가 특징입니다.

예제 도메인(12st Shopping Mall) 에서는 상품, 주문, 배송 서비스 간 Time decoupled 한 인터페이스에 카프카를 통한 메시지 교환방식을 적용하고 있습니다.

사용자로부터 주문을 접수하고, 접수된 주문에 대해 배송 준비 및 상품 재고를 수정하는 싱글 쓰레드가 있다고 가정해 보면, REST 방식에서는 배송 준비와 상품 재고수정이 완료되어야 다음 주문을 처리 할 수 있습니다.
그러나, Pub/Sub 환경에서 주문 서비스는 배송과 상품서비스가 Available 하지 않아도 '주문발생'이라는 이벤트를 메시지 큐에 Publish 하고 즉시 다음 주문을 처리합니다.
이러한 이벤트 드리븐한 구조로 통신하게 되면, 시스템 간 블로킹이 없고(Non-Blocking) Time decoupled 한 호출로 인해 장애 전파는 생기지 않습니다.



☞ [Kafka 홈페이지](https://kafka.apache.org/ "Kafka 문서")
- 다운로드 URL : https://kafka.apache.org/downloads
   - 반드시 Binary downloads 링크 중, 하나를 선택하여 압축해제(설치) 및 테스트를 실행해 주시기 바랍니다.
- 설치 및 테스트 참조 : https://blusky10.tistory.com/366
- windows OS 환경에서 카프카 실행 시, “‘wmic은(는) 내부 또는 외부 명령, 실행할 수 있는 프로그램, 또는 배치 파일이 아닙니다.
” 라는 메시지가 출력될 때는 시스템 환경변수(path)에 %SystemRoot%\System32\Wbem 를 추가해 줍니다.
- 가상랩 환경에는 카프카와 카프카 실행을 위한 주키퍼가 기본 실행된 채로 제공됩니다.
로컬 개발환경에는 카프카를 직접 설치하시고 서버 실행을 해 주셔야합니다.
    - 카프카 설치 및 서버 실행방법: https://github.com/event-storming/docs#%EC%B9%B4%ED%94%84%EC%B9%B4-%EC%84%A4%EC%B9%98
        

---

### Maven
![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image6.png)

빌드 도구란 프로젝트 생성, 테스트 빌드, 배포 등의 작업을 위한 전용 프로그램입니다.
- 빠른기간동안 계속해서 늘어나는 라이브러리 추가, 프로젝트를 진행하며 라이브러리의 버전 동기화의 어려움을 해소하고자 등장하였습니다.
- 초기의 java 빌드도구로 Ant를 많이 사용하였으나 최근 많은 빌드도구들이 생겨나 Maven이 많이 쓰였고, 현재는 Gradle이 많이 쓰입니다.

Maven은 자바용 프로젝트 관리도구로 Apache Ant의 대안으로 만들어졌습니다.
 - Maven은 Ant와 마찬가지로 프로젝트의 전체적인 라이프 사이클을 관리하는 도구 이며, 많은 편리함과 이점이 있어 널리 사용되고 있습니다.
   (프로젝트의 작성부터 컴파일, 페트스 등 프로젝트 라이프사이클에 포함되는 각 테스트를 지원해 줍니다.)

 - Maven은 필요한 라이브러리를 특정 문서(pom.xml)에 정의해 놓으면 내가 사용할 라이브러리 뿐만 아니라
 해당 라이브러리가 작동하는데에 필요한 다른 라이브러리들까지 관리하여 네트워크를 통해서 자동으로 다운로드해 줍니다.
 - Maven은 중앙 저장소를 통한 자동 의존성 관리를 중앙 저장소(아파치재단에서 운영 관리)는 라이브러리를 공유하는 파일 서버라고 볼 수 있고,
 메이븐은 자기 회사만의 중앙 저장소를 구축할 수도 있습니다.
#### Maven 설치방법
- Maven 다운로드 URL : https://Maven.apache.org/ (접속하여 파일 다운로드 후 zip 파일 압축을 풀어주십시오.)

![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image7.png)

![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image8.png)

#### Maven 설정방법
- 환경변수 설정
- 변수 이름 : MAVEN_HOME
- 변수 값 : Maven 설치 경로

![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image9.png)

- Path 환경변수 편집 누르고 새로 만들기해서 %MAVEN_HOME%\bin
- \ 부분은 복사 붙여넣기 하면 위 화면 처럼 제대로 나옵니다.

![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image10.png)

- CMD에서 Maven 버전 확인 명령어(mvn -version)를 실행하여 제대로 설치됐는지 확인해주십시오.

![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image11.png)

---

### MSAEasy

MSAEasy는 마이크로서비스 구축에서 운영에 필요한 분석, 설계, 구현 및 모니터링을 지원하는 도구로써, 이벤트스토밍 기반 협업을 통해 도메인을 분석/설계하고, 설계된 도메인 모델에서 MSA 소스코드를 자동으로 생성해 줍니다.
최근 IBM, Pivotal 등 MSA를 선도하는 글로벌 기업들이 채택하고 있는 Event-driven한 도메인 분석기법의 모델링 환경을 제공하고, 모델링 결과로부터 개발자가 비즈니스 로직을 구현할 수 있도록 MSA 템플릿 코드와 클라우드 배포에 필요한 파일들을 동시에 생성해 줍니다.

![image](../../src/img/01_Introduction/06_유틸리티_및_도구/image3.png)

'이벤트스토밍(Event Storming)'은 Event와 BrainStorming의 합성어로서, 이벤트 기반 시스템의 설계와 개발을 빠르게 할 수 있는 기법입니다.
UML, BPMN 등 IT 전문성을 갖추지 않더라도 현업, 업무전문가, 도메인 전문가들이 모여 화이트보드 벽면에 주요 이벤트(Event)를 중심으로 업무들간의 상호 연관성을 스티커만 가지고 모델을 설계합니다.
이벤트를 유발시키는 행위(사용자의 의사결정)와 해당 이벤트에 연이어 반응하는 액션들을 <sup>1)</sup>모든 이해 관계자들이, <sup>2)</sup>짧은 시간 내에, <sup>3)</sup>시각적으로 모델링 합니다.
MSAEasy는 오프라인 이벤트스토밍이 공간적인 제약과 화이트보드 벽면에 부착된 스티커가 물리적 요인으로 쉽게 떨어질 수 있다는 점을 보완해 줍니다.

또한, 결과 모델을 순공학(Forward Engineering) 기능을 통해 단위 마이크로서비스 코드 생성이 가능하고, 마이크로서비스가 운영될 클라우드 환경에 필요한 도커 파일(Docker file)과 CI(Continuous Integration), CD(Continuous Deployment) 배포 파이프라인(Pipeline) 등 자동화된 환경 구성(Configuration) 파일도 생성해 줍니다.

MSAEasy의 커스텀 템플릿은 이를 적용하는 기업의 표준 프레임워크(Framework)에 맞도록 커스터마이징 할 수 있는 확장 기능을 제공합니다.

---

### 도커와 쿠버네티스
현재 가상랩 환경에는 기본적으로 도커엔진과 도커 명령어 그리고 쿠버네티스 엔진과 명령어가 기본 설치되어 제공되나 여러분의 로컬 환경에서는 이들을 직접 설치해야 합니다. 미니큐브는 여러분이 퍼블릭 클라우드의 쿠버네티스(Amazon EKS, MS Azure AKS or Google GKE)를 아예 사용하시지 못하는 경우 로컬에 간단히 설치하여 테스트 가능한 환경입니다.

- 도커 설치법: (윈도우) https://steemit.com/kr/@mystarlight/docker
- kubectl 명령어 설치법: https://kubernetes.io/ko/docs/tasks/tools/install-kubectl/
- 쿠버네티스(미니큐브) 설치법: https://kubernetes.io/ko/docs/tasks/tools/install-minikube/

---

### 클라우드 플랫폼 별 명령어
클라우드 플랫폼 별로 사용되는 자체 명령어는 해당 클라우드 플랫폼 설명에서 찾아 설치하시면 됩니다.
예를들어 azure 플랫폼의 경우 'az', google 의 경우 'gcloud' 라는 명령어를 설치해주셔야 합니다.

- 구글 SDK: https://cloud.google.com/sdk/
- 애져 SDK: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
- 아마존 SDK: https://aws.amazon.com/ko/cli/

---

### siege 
Siege는 오픈 소스 회귀 테스트 및 벤치 마크 유틸리티이며 리눅스 기반의 http 로드테스트 도구 입니다.


siege 다운로드 URL : https://github.com/JoeDog/siege.git

- siege는 단시간에 수많은 트래픽을 내보내기 쉬움
- 수백 개의 http 리퀘스트를 특정 url로 보내기 가능
- 기능을 이용해서 스트레스 테스트가 가능
#### **주요 Features**

- **Web-based Event Storming environment**
- 6 types of Event Sticker
(Event, Policy, Command, Aggregate, External System, Read Model)
- Bounded Context and Context Mapping (Relation between Microservices)
- English word suggestion

- **Code Generation**
- MSA Implementation Source Codes (Default: Spring-boot)
- Dockerfile
- Pipeline YAML file for CI/CD DevOps
- Helm Chart for Kubernetes Deployment

- **Custom Templates for Microservice’s Polyglot language**
- Template customizing support (Any language is available)
- Local and remote(Github) template add-in support

- **Service Monitoring**
- Service Status Monitoring & Health Check

☞ [MSAEasy 도구](http://eventstorming2code.io/#/ "MSAEasy")
☞ [MSAEasy 홈페이지](http://uengine.org/eventstorming/#/ "MSAEasy Homepage")
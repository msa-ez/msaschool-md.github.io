---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# [Capstone Prj.] Simple Mall - Scenario/Modeling

### CapStone Prj - Simple Mall 설계 

- MSAEz 도구를 활용하여 시나리오 기반의 이벤트스토밍 
- 프로젝트 이름은 mall로 설정 

#### 시나리오 

- 고객이 주문을 발생시키면 주문 정보를 참조하여 배송이 시작되어야 한다. 
- 주문 서비스의 각 주문 건은  배송서비스에서 생성된 배송 Id와 상태코드를 저장하여야 한다.
- 고객이 주문 취소를 하게 되면 '반드시' 배송취소가 선행되어야 한다. (취소는 삭제를 의미)
- 고객은 언제든지 배송정보가 포함된 주문내역을 조회할 수 있어야 한다. 
- 고객은  Gateway를 통해 주문과 배송서비스와 통신 할 수 있어야 한다. 

#### Order Aggregate Design
- productId : Long
- qty : Int 
- productName : String
- deliveryId : String
- deliveryStatus : String

#### Delivery Aggregate Design
- orderId : Long 
- productId : Long 
- porductName : String
- deliveryStatus : String 


### Code Gen. & Download

1) 우측 상단의 프로젝트 이름이 'mall'인지 확인한다.
2) 모델링 된 코드를 다운 받는다. 
3) EventStorming 도구의 Code > Download Archive > Spring Boot를 선택
4) 로컬 컴퓨터 다운로드 경로 > mall.zip 확인 


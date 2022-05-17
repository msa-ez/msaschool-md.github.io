---
description: ''
sidebar: 'information'
---
# [분석] DDD 이벤트의 도출 - 12번가 쇼핑몰

#### 아래 사용자 시나리오에 포함된 도메인 이벤트들을 도출하시오

1. 고객 (Customer) 이 상품을 선택하여 주문한다 (Place an Order)
1. 주문이 되면 상품 배송을 한다.
1. 배송이 완료가 되면 상품의 재고량이 감소한다.

예시) OrderPlaced (pp형으로 도출, 목적어+동사pp)

#### 확장 시나리오 - Saga Compensation
1. 고객이 주문을 취소할 수 있다 (Customer can cancel order)
1. 주문이 취소되면 배달이 취소된다 (Whenever customer cancel an order, cook or delivery is canceled too)
2. 배달이 수거되면 재고량이 증가한다

#### 다음 스프린트
##### 다음의 시나리오가 추가되었다
1. 재고량이 확보되면 (InventoryIncreased) 대기 고객에게 알림 메일을 발송한다 - 주문팀에서 관심
2. 배송상태가 바뀌면 주문상태도 업데이트 한다 - 주문팀에서 관심

##### 다음의 마이크로 서비스가 추가되었다
4. 고객은 언제든지 주문한 내역과 배송 상태를 조회한다. (CQRS - View)
5. 주문/배송 상태가 바뀔때 마다 해당 고객에게 문자 메시지가 발송된다.

---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# Pub/Sub 방식의 연동 - Choreography with Idempotency

# Pub/Sub 방식의 연동 - Choreography with Idempotency

## 12st Mall에 중복실행 방지 적용

- 12st Mall의 Consumer 사이드에 Idempotency(멱등성)를 추가함으로써 진정한 Eventual Consistency를 구현한다.
- 프로세스 처리 중 실패하게 되면 Reject에 따라 보상처리(Compensation)가 벌어진다.
- Mall에서 보상처리가 한번 이상 벌어져도 상품재고가 두번, 세번 차감되어서는 안된다.


### GitPod 환경 구성

- 모델을 내 리파지토리로 복사(Fork)한다.
- CODE > Code Preview 메뉴로 코드 창을 오픈한다.
- GitHub 메뉴 팝업에서 코드를 Fork하여 생성한다.
![image](https://user-images.githubusercontent.com/108639319/204209954-0f47ea0f-0ca5-4e0a-9c3e-226ad4eabb37.png)

- 'Open GitPod'를 클릭하여 코드를 로드한다.

### 12st Mall 테스트

#### Topic 리스닝
- 새로운 터미널에서 kafka 컨슈머로 토픽을 모니터링한다.
```
cd kafka
docker-compose exec -it kafka /bin/bash
cd /bin
./kafka-console-consumer --bootstrap-server localhost:9092 --topic choreography.with.idempotency
```

#### 서비스 실행, 데이터 초기화

- 주문과 배송 서비스를 각각 실행한다.
```
cd order
mvn clean spring-boot:run

cd delivery
mvn clean spring-boot:run
```

- 상품 마이크로서비스를 실행하고, 2개의 상품 데이터를 등록한다.
```
cd product 
mvn clean spring-boot:run

http :8083/inventories productName=TV stock=1000   # id=1
http :8083/inventories productName=RADIO stock=1000  # id=2
```

- 주문을 발행하고, 카프카 토픽과 상품 재고를 모니터링한다.
```
http :8081/orders customerId=1 productId=1 productName=TV qty=10

http :8081/orders/1
http :8083/inventories
```

- 재고량을 초과하는 상품번호로 주문을 발행하고 카프카 토픽의 이벤트를 모니터링한다.
```
http :8081/orders customerId=1 productId=2 productName=TV qty=200
```

- 상품 서비스에서 StockDecreasedFailed 가 Publish되어 Order Reject에 따라 보상(Compensation)처리가 벌어진다. 
  > OrderCreated - DeliveryStarted - StockDecreaseFailed - OrderRejected - DeliveryCancelled


### 12st Mall에 중복실행 방지 적용

- 카프카 파티션 수가 변하거나, Consumer Group의 Client가 Scaling되면 Kafka에서는 리밸런싱이 일어난다.
- 리밸런싱이 일어나면, Offset이 처리되지 않은 파티션에 Consumer가 재할당 되어 메시지를 재수신하는 일이 벌어진다.
- Consumer 사이드에서 한번 처리된 메시지가 중복 처리되지 않도록 멱등성을 적용해 본다.


#### Delivery 서비스

Delivery Aggregate를 열어보자.

- Delivery 서비스의 Key 필드인 orderId 자동 생성 dsiable; 19 라인  
- 주문 서비스의 Order Id를 Key 필드로 저장 
- 메시지 중복 실행(저장) 멱등성 관리; 40 라인
- Compensate가 벌어질 때, Key 필드 삭제 : 보상처리 멱등성 관리; 55 라인


#### Inventory 서비스

- 멱등성 관리를 위한 Transaction 리파지토리를 생성한다.
  - product > domain 패키지에 Transaction.java를 생성한다.

```
package choreography.with.idempotency.domain;
import javax.persistence.Entity;
import javax.persistence.Id;

import choreography.with.idempotency.ProductApplication;
import lombok.Data;

@Entity
@Data
public class Transaction {
    @Id
    Long orderId;
    Integer stockOrdered;
    String customerId;

    public static TransactionRepository repository(){
        return ProductApplication.applicationContext.getBean(TransactionRepository.class);
    }
}
```

  - product > domain 패키지에 TransactionRepository.java를 생성한다.
```
package choreography.with.idempotency.domain;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long>{
    
}

```  

- Inventory.java에 Idempotency 적용

생성한 Transaction 리파지토리에 주문번호를 Key로 멱등성을 적용한다.

1. (34~35라인 주석해제) 한번 처리된 메시지는 중복처리 되지 않는다 - 멱등성 관리
2. (44~48라인 주석해제) 정상 처리된 주문에 대해 Trx 리파지토리에 등록(,Or 플래그 처리)
3. (63, 69, 73~77라인 주석해제) 보상처리 멱등성 관리를 위해 처리 후 삭제한다.


### 멱등성이 적용된 서비스 테스트

- 상품 마이크로서비스를 재실행하고, 2개의 상품 데이터를 등록한다.
```
cd product 
mvn clean spring-boot:run

http :8083/inventories productName=TV stock=100   # id=1
http :8083/inventories productName=RADIO stock=100  # id=2
```

- 주문을 발행하고, 카프카 토픽과 상품 재고를 모니터링한다.
```
http :8081/orders customerId=1 productId=1 productName=TV qty=10

http :8081/orders/1
http :8083/inventories
```

- 재고량을 초과하는 상품번호로 주문을 발행하고 카프카 토픽의 이벤트를 모니터링한다.
```
http :8081/orders customerId=1 productId=2 productName=TV qty=200
```

- 결과는 동일하게 작동한다.
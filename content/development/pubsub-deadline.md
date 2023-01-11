---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# Pub/Sub 방식의 연동 - Choreography with Deadline added

# Pub/Sub 방식의 연동 - Choreography with Deadline added

## 12st Mall에 데드라인 추가 적용

- 12st Mall 주문처리 프로세스에 데드라인(Deadline)을 적용하여, 시간 내 주문건이 최종 처리(재고 차감)되어야 하는 시나리오를 추가한다.
- 데드라인 시간 내에 처리되지 못한 주문건은 유효하지 않은 주문으로 보상처리 되어야 하는 대상이다.
- 앞서, 중복실행 방지가 적용된 코드에 더해 Event Expiration을 추가적으로 적용해 본다.



### GitPod 환경 구성

- 모델을 내 리파지토리로 복사(Fork)한다.
- CODE > Code Preview 메뉴로 코드 창을 오픈한다.
- GitHub 메뉴 팝업에서 코드를 Fork하여 생성한다.
![image](https://user-images.githubusercontent.com/108639319/204209954-0f47ea0f-0ca5-4e0a-9c3e-226ad4eabb37.png)

- 'Open GitPod'를 클릭하여 코드를 로드한다.


### Deadline 마이크로서비스 확인

#### Deadline.java

- 데드라인 서비스는 주문이 발생되면, 주문번호와 주문시간, 만기시간(주문시간 + deadline Duration)을 스케줄한다.
- 기본 deadline Duration은 5초로 설정되어 있다.
```
    public static void schedule(OrderCreated orderCreated){
        Deadline deadline = new Deadline();
        deadline.setOrderId(orderCreated.getId());
        deadline.setStartedTime(new Date(orderCreated.getTimestamp()));

        Date deadlineDate = new Date(deadline.getStartedTime().getTime() + deadlineDurationInMS);
        deadline.setDeadline(deadlineDate);
        
        repository().save(deadline);
    }
```    

#### PolicyHandler.java
- 5초 주기로 Event Expiration을 체크한다. 

```
    // @Scheduled(fixedRate = 5000) //FOCUS: every 5 seconds. 5초에 한번씩
    public void checkDeadline(){
        Deadline.sendDeadlineEvents();
    }
```

#### Deadline.java
- Expired된 주문 건에 대해서는 DeadlineReached 이벤트를 퍼블리시한다.
```
    public static void sendDeadlineEvents(){
        repository().findAll().forEach(deadline ->{
            Date now = new Date();
            
            if(now.after(deadline.getDeadline())){
             	new DeadlineReached(deadline).publishAfterCommit();
                repository().delete(deadline);
            }
        });
    }
```

### Deadline이 적용된 서비스 테스트

#### Topic 리스닝

- 새로운 터미널에서 kafka 컨슈머로 토픽을 모니터링한다.
```
cd kafka
docker-compose exec -it kafka /bin/bash
cd /bin
./kafka-console-consumer --bootstrap-server localhost:9092 --topic choreography.with.deadline
```

- 배송서비스 시작전에 Expiration을 초과하는 강제 Delay를 발생시킨다.
- Delivery.java 37~40 라인을 주석해제 한다.
```
        if("1".equals(orderCreated.getProductId()))
        try{
            Thread.sleep(10000);
        }catch(Exception e){}
```

####  서비스 실행, 데이터 초기화

- 데드라인, 주문, 배송, 상품 서비스를 모두 실행하고 초기 데이터를 입력한다.
```
cd deadline
mvn clean spring-boot:run

cd order
mvn clean spring-boot:run

cd delivery 
mvn clean spring-boot:run

cd product 
mvn clean spring-boot:run

http :8083/inventories productName=TV stock=1000   # id=1
http :8083/inventories productName=RADIO stock=1000  # id=2
```

#### 데드라인 동작 확인

- 데드라인을 초과하는 주문을 발행해 본다. (1번 상품은 데드라인을 초과하는 10초의 강제 Delay를 탄다)
```
http :8081/orders customerId=1 productId=1 productName=TV qty=10
```

- 카프카 모니터링 결과
  > - OrderCreated 이벤트 Push 후, 10초 대기 중,
  > - DeadlineReached 이벤트가 먼저 채널에 Push
  > - OrderRejected 이벤트가 리액티브하게 반응
  > - delivery 서비스에 멱등성 처리가 적용되어 있어 Compensation은 일어나지 않음


- 분석  
  > - 주문 이후, 데드라인 도래에 따라 Order Reject Compensation이 예상대로 실행
  > - http :8083/inventories/1  # 상품 재고도 Compensation에 따라 정상 수치로 복원
  > - Expired Event에 대해서는 Redundency 로직을 수행하지 않도록 조치 필요 


- Delivery.java 42~43 라인을 주석해제하여 Redundency 로직을 스킵한다.
```
Date now = new Date();
if(orderCreated.getTimestamp() + deadlineDurationInMS < now.getTime()) return;  
```

- Delivery 서비스를 재기동하고 다시 1건의 주문을 넣어본다.
```
cd delivery 
mvn clean spring-boot:run


http :8081/orders customerId=1 productId=1 productName=TV qty=10
```

- 카프카 모니터링 결과
  > - OrderCreated 이벤트 Push 후, 10초 대기 중,
  > - DeadlineReached 이벤트가 먼저 채널에 Push
  > - OrderRejected 이벤트가 리액티브하게 반응
  > - delivery 서비스에 멱등성 처리가 적용되어 있어 Compensation은 일어나지 않음


####  배송서비스 Down 테스트

- Delivery.java 37~40 라인을 다시 주석처리 후 서비스를 다운한다.
```
    // if("1".equals(orderCreated.getProductId()))
    // try{
    //    Thread.sleep(10000);
    // }catch(Exception e){}
```

- 주문을 넣고 DeadlineReached 이벤트 퍼블리쉬 확인 후, 배송 서비스를 기동해 본다.
```
http :8081/orders customerId=1 productId=1 productName=TV qty=10
http :8081/orders customerId=1 productId=2 productName=TV qty=10

cd delivery 
mvn clean spring-boot:run
```

- 배송서비스가 기동되어도 Redundency한 이벤트 로직이 처리되지 않음을 Kafka 로그를 통해 알 수 있다.
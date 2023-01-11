---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# Pub/Sub 방식의 연동 

# Pub/Sub 방식의 연동 

### 이벤트 Publish / Subscribe
- 마이크로 서비스간의 통신에서 이벤트 메세지를 Pub/Sub 하는 방법을 실습한다.  
- Order 서비스에서 OrderPlaced 이벤트를 발행하였을때 Inventory 서비스에서 OrderPlaced 이벤트를 수신하여 재고량을 변경(감소)한다.  

#### order 서비스의 이벤트 Publish

- order 마이크로 서비스를 실행한다.
> order 폴더를 선택 > Open In Terminal > 터미널에서 아래 커맨드를 실행한다.
> 주문 서비스가 8081 포트로 실행된다.
```
mvn spring-boot:run
```

- 기동된 order 서비스를 호출하여 주문 1건을 요청한다.
 ```
http localhost:8081/orders productId=1 productName=TV qty=3
```
- GitPod에서 새 터미널을 추가한다.
- kafka 유틸리티가 포함된 위치에 접속하기 위하여 docker 를 통하여 shell 에 진입한다:
```
cd kafka
docker-compose exec -it kafka /bin/bash
cd /bin
```

- kafka Consumer에서 이벤트 확인한다
``` 
./kafka-console-consumer --bootstrap-server localhost:9092 --topic labshoppubsub  --from-beginning
```


#### Inventory 서비스의 이벤트 Subscribe
- Inventory PolicyHandler.java Code 확인한다.
- PolicyHandler.java --> Inventory.java (Aggregate) 의 Port Method (decreaseStock)을 호출하게 된다.
- decreaseStock 내에 우리가 작성해야 할 로직은 다음과 같다:

```
        
               
        repository().findById(Long.valueOf(orderPlaced.getProductId())).ifPresent(inventory->{
            
            inventory.setStock(inventory.getStock() - orderPlaced.getQty()); // do something
            repository().save(inventory);


         });
      
```


- inventory 서비스를 실행한다 (mvn spring-boot:run)
- inventory 서비스가 8082 포트로 기동됨을 확인한다.
- OrderPlaced 이벤트에 반응하여 재고량이 감소되는 것을 확인한다:

```
http :8082/inventories id=1 stock=10
http :8081/orders productId=1 qty=5
http :8082/inventories/1
```
결과:
```
{
    "_links": {
        "inventory": {
            "href": "http://localhost:8082/inventories/1"
        },
        "self": {
            "href": "http://localhost:8082/inventories/1"
        }
    },
    "stock": 5
}
```


### 확장미션
- delivery Bounded Context 를 생성하고, 주문에 대하여 배송 1건을 추가하는 policy를 모델링하고 구현하시오.
---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# Req/Res 방식에서 장애전파 차단 - 서킷브레이커 (New)

# Req/Res 방식에서 장애전파 차단 - 서킷브레이커 (New)

### 서킷브레이커를 통하여 장애 전파를 차단

#### 이벤트스토밍

서킷브레이커 테스트를 위하여 monolith 에서 order Command 에서 inventory 의 재고량을 조회하는(GET) 호출을 그린다

- order command 에서 Inventory Aggregate 로 선을 연결한다. 

<img width="899" alt="image" src="https://user-images.githubusercontent.com/487999/190903135-a6bb95c0-d1f6-424e-9444-1bbf0119386a.png">

- 연결한 선을 더블 클릭하여 호출이름을 다음과 같이 준다: get availability
- 호출선의 설정에서 Circuit breaker 옵션을 On 한다

<img width="452" alt="image" src="https://user-images.githubusercontent.com/487999/190903010-1f789fc6-bc4e-4ad5-a7fd-a2a51b11c940.png">


#### 생성 코드 확인과 구현

- monolith/../Order.java 의 @PrePersist

```
@PrePersist
public void onPrePersist() {
    // Get request from Inventory
    Inventory inventory =
        Application.applicationContext.getBean(InventoryService.class)
        .getInventory(Long.valueOf(getProductId()));

    if(inventory.getStock() < getQty()) throw new RuntimeException("Out of Stock!");

}
```

> 재고 서비스를 호출한 결과 얻은 재고량을 확인하여 재고가 주문량에 못 미치면 오류를 내도록 하는 검증 로직을 추가
- monolith/../external/InventoryService.java

```
@FeignClient(name = "inventory", url = "${api.url.inventory}")
public interface InventoryService {
    @RequestMapping(method = RequestMethod.GET, path = "/inventories/{id}")
    public Inventory getInventory(@PathVariable("id") Long id);

  ...
}
```

> 재고량을 얻기 위한 GET 호출의 FeignClient Interface 확인



#### 서킷브레이커 설정 전 호출 
- monolith 서비스와 inventory 서비스를 실행한다. 
- 충분한 재고량을 입력한다

```
http :8082/inventories id=1 stock=10000
```

- 부하 툴을 사용하여 동시사용자2명의 10초간의 주문을 넣어본다.

```
siege -c2 -t10S  -v --content-type "application/json" 'http://localhost:8081/orders POST {"productId":1, "qty":1}'
```

> siege 툴을 설치하려면 다음 명령으로 설치한다:

```
sudo apt update -y
sudo apt install siege -y
```
		
> 모든 호출이  201 Code 로 성공함을 알 수 있다.

#### 서킷브레이커 설정

- monolith 서비스의 application.yaml 파일의 다음 설정을 true 로 하고, 임계치를 610ms로 바꾼다:  

````yaml

feign:
    hystrix:
    enabled: true

hystrix:
    command:
    # 전역설정
    default:
        execution.isolation.thread.timeoutInMilliseconds: 610
````

- inventory 서비스의 Inventory.java 를 GET 할때 성능이 느려지도록 딜레이 발생 코드를 넣는다.  


````java
@PostLoad
public void makeDelay(){
    try {
        Thread.currentThread().sleep((long) (400 + Math.random() * 220));
    } catch (InterruptedException e) {
        e.printStackTrace();
    }

}
````

- inventory 서비스를 종료하고 재실행한다. 
- 이때 재고량을 충분히 줘놓아야 한다:

```
http :8082/inventories id=1 stock=10000
```

- 부하 툴을 사용하여 주문을 넣어본다.  

```
siege -c2 -t10S  -v --content-type "application/json" 'http://localhost:8081/orders POST {"productId":1, "qty":1}'
```

> Delay 가 발생함에 따라 적당히 201 code 와 500 오류 코드가 반복되며 inventory 로 부하를 조절하면서 요청을 관리하는 것을 확인할 수 있다.
> 결과적으로 Availability 는 60~90% 수준이 유지되면서 서비스는 유지된다.

- monolith 서비스의 로그를 확인:

```
java.lang.RuntimeException: Hystrix circuit short-circuited and is OPEN
```

> 서킷 브레이커가 발동하여 오류가 발생한 것을 확인할 수 있다.

~~ [Tip] 임계치를 바꾸거나 delay 를 바꾸어 가면서 테스트해보세요 ~~

#### fallback 처리 (장애시에 적당한 대체값)

- inventory 서비스가 중지된 상태로 주문을 넣어본다. ( 500 에러 )

```
http localhost:8081/orders productId=1 qty=1 
```

- monolith 서비스의 external/InventoryService.java 의 FeignClient에 fallback 옵션을 준다.
    
```
@FeignClient(name = "inventory", url = "${api.url.inventory}", fallback = InventoryServiceFallback.class)
```
 
- monolith 서비스에 Fallback 구현체를 구현한다:

```
package labshopmonolith.external;

import org.springframework.stereotype.Service;

@Service
public class InventoryServiceFallback implements InventoryService{
    public Inventory getInventory(Long id){
        Inventory fallbackValue = new Inventory();
        fallbackValue.setStock(1L);

        return fallbackValue;
    }
}
```

- monolith 서비스를 재실행 후 주문을 넣어본다. ( 주문 가능 )
    - 이때 inventory 서비스는 중지 상태 이어야 한다.  
    - InventoryServiceImpl 의 getInventory 메서드가 실행되어 적당한 가짜 값인 1이 리턴되어 재고량이 있는 것으로 리턴하게 하는 것을 확인할 수 있다. 

```
http localhost:8081/orders productId=1 qty=1   # will succeed!
```

- qty를 1이상인 값으로도 호출해본다.

```
http localhost:8081/orders productId=1 qty=3   # will fail!
```

#### 다른 Circuit Breaker 들
https://dzone.com/articles/comparing-envoy-and-istio-circuit-breaking-with-ne?fbclid=IwAR0wYnXPiAZSVtluJ-17Ywb9dK3xrytAMo3ImIZv8KwoOo2WGGnyTKm6c04


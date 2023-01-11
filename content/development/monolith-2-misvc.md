---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# Req/Res 방식의 MSA 연동 

# Req/Res 방식의 MSA 연동 

### Monolith 서비스의 동작 구조 확인

모노리스 기반 쇼핑몰 서비스에서 inventory 서비스를 분리하고, Feign Client 를 사용해 모노리식 쇼핑몰과 분리된 마이크로서비스 분리하는 Lab 이다.  
Feign Client 는 기존의 로컬 객체 인터페이스를 준수하면서 실제적으로는 원격 호출(Request/Response) 방식으로 서비스간의 통신을 가능하게 하여 레가시 코드의 변경을 최소화 하여 transform하는 방법이다.

이전 랩에서 실행한 GitPod 환경을 로딩한다.

- monolith 서비스 기동
```
cd monolith
mvn spring-boot:run

http localhost:8081
``` 
- Order.java 에서 inventory 로컬 객체를 통해 재고처리 중임을 확인:
```

    @PostPersist
    public void onPostPersist() {
        inventoryService().decreaseStock(Long.valueOf(getProductId()), new DecreaseStockCommand(getQty()));

    }

    @PrePersist
    public void checkAvailability(){
        if(inventoryService().getInventory(Long.valueOf(getProductId())).getStock() < getQty()) throw new RuntimeException("Out of stock");
    }

    public static InventoryService inventoryService(){
        InventoryService inventoryService = MonolithApplication.applicationContext.getBean(
            InventoryService.class
        );

        return inventoryService; // 여기에 breakpoint 설정
    }


```

- Order.java의 inventoryService() 메서드에 디버그 포인트 설치
- "return inventoryService;" 라인의 라인번호 앞을 클릭하면, 빨간색의 원(breakpoint)이 나타남
 
- 주문 발송  
```
http localhost:8081/orders productId=1 quantity=3 customerId="1@uengine.org" customerName="hong" customerAddr="seoul"
```

- InventoryServiceImpl.java 를 통해서 처리가 되는 Monolith 임을 확인.

### 기존 Monolith에서 일부 영역을 마이크로서비스로 분리

본 랩에 주어진 기본 모델을 수정하기 위해 모델을 복제(FORK)한 다음, 도구를 활용하여 가이드에 따라 커스터마이징 한다.

#### 이벤트스토밍
- bounded context 를 추가하고 이름을 "inventory"로 설정
- inventory aggregate 객체들을 묶음 선택하여 inventory bounded context 내로 이동

<img width="874" alt="image" src="https://user-images.githubusercontent.com/487999/190896320-72973cf1-c1dc-44f4-a46a-9be87d072284.png">

- 재고량을 감소시키는 Command 의 추가: inventory BC 내에 Command  스티커를 추가하고, 이름을 "decrease stock" 으로 부여. 이때 Command 스티커는 Inventory Aggregate 스티커의 왼쪽에 인접하게 부착.
- Command 의 설정:  "decrease stock" command 를 더블클릭한 후, "Controller" 를 선택. Attribute로 name: qty, type: Integer 를 추가.

<img width="784" alt="image" src="https://user-images.githubusercontent.com/487999/190896393-30889e96-6cbc-4e7f-9631-25c0d004635d.png">

- 원격 호출선 연결:  monolith 내의 OrderPlaced Event 스티커와 inventory 의 decrease stock Command 스티커를 연결. 이때 Req/res 라는 표시가 나타남.

<img width="859" alt="image" src="https://user-images.githubusercontent.com/487999/190896427-f91962cd-f8ab-4113-bd85-5abe1ada3bcd.png">

#### 호출측 코드 확인과 구현
- 이벤트 스토밍 결과 코드를 생성하고 push 한 후, Code 를 update 한다.
> Code Preview 메뉴에서 "Commit & Push on Git" 서브 메뉴를 통해 내 GitHub에 코드를 내보낸다.
> 그러기 위해서는 MSAEz에 내 Github 토큰이 설정되어야 한다.

- monolith/../ Order.java 의 @PostPersist 내에 호출을 위해 생성된 샘플코드를 확인하고 //here 부분과 같이 수정한다:
```
     @PostPersist
    public void onPostPersist() {
        //Following code causes dependency to external APIs
        // it is NOT A GOOD PRACTICE. instead, Event-Policy mapping is recommended.

        labshopmonolith.external.DecreaseStockCommand decreaseStockCommand = new labshopmonolith.external.DecreaseStockCommand();
        decreaseStockCommand.setQty(getQty()); //here
        
        // mappings goes here
        MonolithApplication.applicationContext
            .getBean(labshopmonolith.external.InventoryService.class)
            .decreaseStock((Long.valueOf(getProductId())), decreaseStockCommand); //here

        OrderPlaced orderPlaced = new OrderPlaced(this);
        orderPlaced.publishAfterCommit();
    }

```
> 우리는 decreaseStock stub 메서드를 로컬 객체를 호출하는것처럼 호출하지만 실제적으로는 inventory 원격객체를 호출하는 결과가 될 것이다.
> 재고량 수정을 위하여 qty 값을 전달하는 Command 객체와 해당 제품 id 를 path 로 전달하는 첫번째 아규먼트로 productId를 전달한다.


- monolith/../ external 패키지 내에 생성된 FeignClient 관련 Stub 코드들을 참고한다 (InventoryService.java, DecreaseStockCommand.java, Inventory.java)
```
@FeignClient(name = "inventory", url = "${api.url.inventory}")
public interface InventoryService {
    @RequestMapping(
        method = RequestMethod.PUT,
        path = "/inventories/{id}/decreasestock"
    )
    public void decreaseStock(
        @PathVariable("id") Long id,
        @RequestBody DecreaseStockCommand decreaseStockCommand
    );

}
```
> FeignClient 는 실제로는 inventory 원격객체를 호출하는 proxy 객체를 생성할 것이다. application.yaml 의 api.url.inventory 설정값의 url 로 PUT 메서드를 해당 path 로 호출하는 원격 호출의 구현체가 채워진다. 

#### 피호출측 소스코드의 확인과 구현
- inventory/.. /infra/InventoryController.java
```
public class InventoryController {

    @Autowired
    InventoryRepository inventoryRepository;

    @RequestMapping(
        value = "inventories/{id}/decreasestock",
        method = RequestMethod.PUT,
        produces = "application/json;charset=UTF-8"
    )
    public Inventory decreaseStock(
        @PathVariable(value = "id") Long id,
        @RequestBody DecreaseStockCommand decreaseStockCommand,
        HttpServletRequest request,
        HttpServletResponse response
    ) throws Exception {
        System.out.println("##### /inventory/decreaseStock  called #####");
        Optional<Inventory> optionalInventory = inventoryRepository.findById(
            id
        );

        optionalInventory.orElseThrow(() -> new Exception("No Entity Found"));
        Inventory inventory = optionalInventory.get();
        inventory.decreaseStock(decreaseStockCommand);

        inventoryRepository.save(inventory);
        return inventory;
    }
}
```
> decreaseStock 에 대한 원격호출을 받을 수 있는 REST Service Mapping 이다.
> 호출을 받으면 Inventory 어그리거트의 decreaseStock 으로 전달하는 input adapter 역할을 한다(hexagonal architecture). 실제 비즈니스 로직 (재고량 감소)은 어그리거트 내부에서만 ubiquitous 언어로 구현되어야 한다.

- inventory/../Inventory.java 의 구현
```
    public void decreaseStock(DecreaseStockCommand decreaseStockCommand) {
        setStock(getStock() - decreaseStockCommand.getQty().longValue());
    }

```

#### inventory 서비스의 테스트

- inventory 서비스를 기동시키고 httpie 툴을 통하여 서비스가 잘 호출되는지 테스트한다:
```
cd inventory
mvn spring-boot:run
```
- 서비스 기동 후, "could not be established. Broker may not be~.." 오류가 발생한다.
- 메시징 브로커인 Kafka가 실행되고 있지 않아서 발생하는 접속 오류이다.
- 새로운 터미널에서 Kafka 서버를 기동한다.
```
cd kafka
docker-compose down
docker-compose up
```

- 새 터미널에서 테스트 전, http Client를 먼저 설치한다.
```
pip install httpie
```
- 인벤토리에 테스트할 상품을 먼저 등록하고 사전 검증한다.
```
http :8082/inventories id=1 stock=10
http PUT :8082/inventories/1/decreasestock qty=3
http :8082/inventories/1  # stock must be 7
```

#### monolith 를 통하여 inventory 호출 테스트

- monolith 를 기동시키고 실제 주문을 통하여 inventory 가 호출되는지 확인한다:

```
cd monolith
mvn spring-boot:run

#새 터미널
http :8081/orders productId=1 qty=5
http :8082/inventories/1  # stock must be 2
```

# 참고
1. 파일 다운로드 받기:  터미널 열고 > zip -r test.zip ./* 하신후, 생성된 test.zip 을 우클릭 다운로드


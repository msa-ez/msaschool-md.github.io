---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# Data Projection with Frontend and HATEOAS

# Data Projection with Frontend and HATEOAS

### 프론트엔드를 기반한 Data Projection

#### 기본 생성된 프론트엔드를 테스트
- 모든 마이크로 서비스를 기동시킨다.
- 생성된 프론트엔드 서비스를 기동시킨다.
```
cd frontend
npm i
npm run serve
```
- 브라우저를 통하여 8080 서비스로 접속해본다
- 게이트웨이를 기동시킨다:
```
cd gateway
mvn spring-boot:run
```
- 게이트웨이를 통하여 접속해본다 (8088)
- 게이트웨이를 통해서만 API 가 호출됨을 알 수 있다 (CORS: Cross-Origin-Resource-Sharing Issue)

- 주문을 하기 위해 재고량을 우선 등록한다:
```
http :8082/inventories id=1 stock=10
```

- 다음과 같이 UI 에 접근하여 주문을 해본다:

<img width="574" alt="image" src="https://user-images.githubusercontent.com/487999/191061282-9cba3a28-219e-4fde-baa9-f9713b3f889a.png">

<img width="574" alt="image" src="https://user-images.githubusercontent.com/487999/191061179-211ff733-b7c7-4d26-9c33-e146ed565bf5.png">

<img width="574" alt="image" src="https://user-images.githubusercontent.com/487999/191061043-c9796f3f-4758-4052-aff4-71171f0c14fe.png">




#### Order UI를 통한 Delivery 와 Inventory 정보의 통합

- Order.vue 의 템플릿내(template Tag)에 Delivery 태그를 추가하여 Delivery 가 불려지도록 구현한다:

```
        <v-card-text>
            <String label="ProductId" v-model="value.productId" :editMode="editMode"/>
            <Number label="Qty" v-model="value.qty" :editMode="editMode"/>
            <String label="CustomerId" v-model="value.customerId" :editMode="editMode"/>
            <Number label="Amount" v-model="value.amount" :editMode="editMode"/>
            <String label="Status" v-model="value.status" :editMode="editMode"/>
            <String label="Address" v-model="value.address" :editMode="editMode"/>

            <Inventory v-model="inventory"></Inventory>

        </v-card-text>

```

- v-model 로 연결된 변수인 inventory 를 선언해주고 기본 데이터를 준다:
```
        data: () => ({
            snackbar: {
                status: false,
                timeout: 5000,
                text: ''
            },
            inventory: {stock: 5}
        }),

```
- 화면에 다음과 같이 출력됨을 확인한다:

<img width="462" alt="image" src="https://user-images.githubusercontent.com/487999/191063786-aa08928e-eda9-41a4-9c21-bcb9ccdddef5.png">

- Inventory data 를 동적으로 로딩하여 채워넣기
```
        data: () => ({
            snackbar: {
                status: false,
                timeout: 5000,
                text: ''
            },
            inventory: null
        }),
        async created(){
            var result = await axios.get('/inventories/' + this.value.productId);
            this.inventory = result.data;
        },
    ...
```

#### HATEOAS Link 를 통한 동적인 데이터 연관 관계 처리

- order/../infra/OrderHateoasProcessor.java:
```
@Component
public class OrderHateoasProcessor implements RepresentationModelProcessor<EntityModel<Order>>  {

    @Override
    public EntityModel<Order> process(EntityModel<Order> model) {
        model.add(Link.of("/inventories/" + model.getContent().getProductId()).withRel("inventory"));
        
        return model;
    }
    
}
```
- 생성된 HATEOAS Link 를 확인:
```
> http :8081/orders
{
    "_links": {
        "inventory": {
            "href": "/inventories/1"
        },
        "order": {
            "href": "http://localhost:8081/orders/1"
        },
        "self": {
            "href": "http://localhost:8081/orders/1"
        }
    },
    "address": "Everland",
    "amount": null,
    "customerId": "jjy",
    "productId": "1",
    "qty": 1,
    "status": null
}
```
- Order.vue 에서 Inventory 데이터에 대한 URI 주소를 HATEOAS Link 를 통해서 간접적으로 주소를 획득하도록 수정:
```
        async created(){
            var result = await axios.get(this.value._links.inventory.href);
            this.inventory = result.data;
        },

```

### 확장시나리오: 배송정보를 통합하여 출력
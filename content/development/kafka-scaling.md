---
description: ''
sidebar: 'business'
prev: ''
next: ''
---

# Data Projection with GraphQL

# Data Projection with GraphQL

### GraphQL로 백엔드 데이터 통합

- GraphQL 용 Apollo Server 를 생성하기 위하여 CODE Preview > TOPPINGS 에서 "Apollo GraphQL" 선택

<img width="697"  src="https://user-images.githubusercontent.com/487999/191050930-bca7a84e-ab92-4c41-a746-a4b40da3e58d.png">

- apollo 마이크로 서비스 폴더가 생성된 것을 확인하고, 코드를 Git 으로 PUSH 한다.
- Project IDE 를 Open 한다.
- 커밋된 모델의 소스코드를 반영받는다:

```
git pull && git merge origin/template
```
- 주문,재고,배송 서비스를 모두 기동한다.
- 주문서비스 기동(8081)
```
cd order
mvn spring-boot:run
```
- 재고서비스 기동(8082)
```
cd inventory
mvn spring-boot:run
```
- 배송서비스 기동(8083)
```
cd delivery
mvn spring-boot:run
```  
	
- 상품을 등록하고 해당 상품을 주문한다.
```
http localhost:8082/inventories id=1 stock=10

http localhost:8081/orders productId=1 qty=1 customerId="1@uengine.org"
```

- GraphQL 기동(8089)
```
cd apollo_graphql
npm install
yarn start
```
- GraphQL Playground 
> 작성한 GraphQL Type, Resolver 명세확인, 데이터 요청 및 테스트가 가능한 워크벤치
- Remote Explorer 에서 WebUI에 접속

<img width="1161" alt="스크린샷 2022-09-23 오후 3 48 53" src="https://user-images.githubusercontent.com/58163635/191912194-88d4b4a0-44fd-4f13-a014-73fc0b503797.png">

** 이 때 서비스를 Make Public 꼭 해주어야 조회가 가능하다.

### 서비스 조회
* 전체 주문서비스
```gql
query getOrders {
  orders {
    productId
    qty
  }
}
```
* 단일 주문서비스( id=1 주문서비스 )
```gql
query getOrderById {
  order(id: 1) {
    productId
    qty
  }
}
```


* 복합 서비스 조회


복합적인 서비스 조회를 위하여 서브쿼리에 대한 Resolver 전략을 작성한다:

- resolver.ts
```
const resolvers = {
    Order: {
        delivery: async (root, {deliveryId}, {dataSources}) => {
            try {
                if (root && root._links.self.href) {
                    var parseLink = root._links.self.href.split('/')
                    var getOrderId = parseLink[parseLink.length - 1]
                    var deliveries = await dataSources.deliveryRestApi.getDeliveries();

                    if(deliveries){
                        var rtnVal = null
                        Object.values(deliveries).forEach(function (delivery) {
                            if(delivery && delivery.orderId == getOrderId){
                                rtnVal = delivery
                            }
                        })
                        return rtnVal
                    }
                }
                return null;
            } catch (e) {
                return null;
            }
        },
        
        inventory: async (root, {productId}, {dataSources}) => {
            if (!productId) productId = root.productId

            if (productId) {
                return await dataSources.inventoryRestApi.getInventory(productId);
            }
            return null;
        }
    },
    Inventory: {
        // set Query
    },
    Delivery: {
        // set Query
    },

    Query: {
        order : async (_, { id }, { dataSources }) => {
            return dataSources.orderRestApi.getOrder(id);
        },
        orders : async (_, __, { dataSources }) => {
            return dataSources.orderRestApi.getOrders();
        },
        inventory : async (_, { id }, { dataSources }) => {
            return dataSources.inventoryRestApi.getInventory(id);
        },
        inventories : async (_, __, { dataSources }) => {
            return dataSources.inventoryRestApi.getInventories();
        },
        delivery : async (_, { id }, { dataSources }) => {
            return dataSources.deliveryRestApi.getDelivery(id);
        },
        deliveries : async (_, __, { dataSources }) => {
            return dataSources.deliveryRestApi.getDeliveries();
        },
    }
};

export default resolvers;

```

- Type 선언에 속성추가 :  typeDefs.ts
```
    type Order {
    	id: Long! 
			productId: String 
			qty: Integer 
			customerId: String 
			amount: Double 
			status: String 
			address: String
      delivery: Delivery
      inventory: Inventory
    }
```

order 서비스의 연결된 product, delivery 정보조회
```gql
query {
  orders {
    qty
    customerId
    
    delivery {
      orderId
    }

    inventory{
      stock
    }
  }

}
```
- 호출결과
```
{
  "data": {
    "orders": [
      {
        "qty": 1,
        "customerId": "1@uengine.org",
        "delivery": {
          "orderId": 1
        },
        "inventory": {
          "stock": 9
        }
      }
    ]
  }
}
```


#### GraphQL 파일 참고
1. src/graphql/resolvers.js
* 데이터를 가져오는 구체적인 과정을 구현     
* 서비스의 액션들을 함수로 지정, 요청에 따라 데이터를 반환(Query), Mutation(입력, 수정, 삭제) 하는 Query 또는 구현체 작성
 
```
예시)
const resolvers = {
  //typeDefs의 객체 유형 정보(Order, Query, Product) 호출 선언
  
  Query: {
     //...
  } 
  Order: {
      deliveries: (root, args, {dataSources}) => {}

      //  함수명: (parent, args, context, info) => {}
      //  * parent  : 루트에 대한 resolver의 반환 값.
      //  * args    : 함수 호출시 args 또는 {parameter}으로 인자값.
      //  * context : 
            특정 작업을 위해 실행되는 모든 resolver에 전달되는 개체,
            데이터베이스 연결과 같은 컨텍스트를 공유.
          {dataSources}: xxx-rest-api.js와 연결된 데이터 호출.
      //  * info    : 필드명, 루트에서 필드까지의 경로 등 작업의 실행 상태.
  }
}
```

2. src/graphql/typeDefs.js
    * GraphQL 명세서에서 사용될 데이터, 요청의 타입 (gql로 생성됨)

* Type Definitions
*  객체 타입과 필드명 선언
```
type Delivery {
        id: Long!
        orderId: Long 
        productId: Long 
        customerId: String 
        deliveryAddress: String 
        deliveryState: String 
        orders: [Order]
        order(orderId: Long): Order
    }
  
    type Order {
        id: Long! 
        productId: Long
        customerId: String
        state: String
        deliveries: [Delivery]
        delivery(deliveryId: Long): Delivery
    }

    // []: 배열
    //  !: 필수값
```

3. src/restApiServer/xxx-rest-api.js
	* apollo-datasource-rest의 해당 서비스의 호출 함수및 호출 경로 설정.
```
import {RESTDataSource} from 'apollo-datasource-rest';
// apollo-datasource-rest 모듈

class orderRestApi extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://order:8080';
        // 해당 서비스의 호출 주소 정보.
    }

    // 함수명() 
    async getOrders() {
        const data = await this.get('/orders', {})
        // baseURL 이후 url 호출 정보.

        var value = this.stringToJson(data);
        // 호출정보 String to Json 으로 변경. 
        
        return value
        // 호출 정보 리턴.
    }

    async getOrder(id) {
        // ...
    }

    stringToJson(str){
        if(typeof str == 'string'){
            str = JSON.parse(str);
        }
        return str;
    }
}
```
4. src/index.js
    * 선언부 호출 매핑및 선언.
```
import {ApolloServer} from 'apollo-server';
import resolvers from './graphql/resolvers.js';
import typeDefs from './graphql/typeDefs.js';
import orderRestApi from './restApiServer/order-rest-api.js'
import deliveryRestApi from './restApiServer/delivery-rest-api.js'

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        orderRestApi: new orderRestApi(),
        deliveryRestApi: new deliveryRestApi()
    }),
    // dataSources 선언 하여 xxxRestApi 호출정보.
});

server.listen({
    port: 8089,
}).then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});

```


### 미션:  delivery 조회를 위한 resolver 효율화

현재 주문에 대한 배송건을 찾는 로직은 전체 배송을 모두 조회한 후 orderId와 비교하는 비효율적인 조회를 하고 있다. 이를 다음과 같이 findByOrderId 를 통해 백엔드에서 DB 조회한 결과를 가져오도록 변경하기 위하여 data source 부분의 코드와 delivery 서비스를 개선하시오:

```
const resolvers = {
    Order: {
        delivery: async (root, {deliveryId}, {dataSources}) => {
            var parseLink = root._links.self.href.split('/')
            var orderId = parseLink[parseLink.length - 1]
            var deliveries = await dataSources.deliveryRestApi.findByOrderId(orderId);

            if(deliveries && deliveries.length>0)
                return deliveries[0];

            return null;
        },
      ...
```
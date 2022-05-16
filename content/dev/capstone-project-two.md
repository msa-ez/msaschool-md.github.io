<template>
    <div>
        <mark-down class="content">
### CapStone Prj - Simple Mall 구현 

- 모델링 후 다운로드된 mall.zip 아카이브를 업로드 한다.
- VSCode Explorer 영역에서 'Upload Files.. ' 선택 후, 이전 Lab에서 다운받은 아카이브를 선택한다.
- 업로드한 mall.zip 파일을 압축해제 한다.

```
unzip mall.zip
```

#### 시나리오를 충족하는 코드 구현 

- 주문생성 이벤트에 대한 배송 서비스의 Policy를 구현한다. (주문정보를 바탕으로 배송 Entity 생성)
- 배송상태 변경 이벤트에 대한 주문서비스의 Policy를 구현한다. (deliveryId와 deliveryStatus 업데이트)
- Compenstation(주문취소)에 대한 동기호출 로직을 FeignClient로 구현한다.


#### 고려요소
- MSAEz가 생성한 코드는 오류가 존재할 수 있으므로 콘솔 로그를 참조하여 TrobleShooting 한다.
- Kafka Consumer를 실행(Topic: mall)하여 이벤트를 모니터링하며 구현한다.
        </mark-down>
    </div>
</template>


<script>
    // @group 07_02_26
    export default {
        name:'capstoneProject2',
        data() {
            return {}
        },
        props: {
            "[Capstone Prj.] Simple Mall - Implementation": {
                type: String
            },
        },
    }
</script>
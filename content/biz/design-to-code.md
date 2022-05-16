<template>
    <div>
        <mark-down class="content">
#### 이벤트 스토밍 결과를 기반한 Spring-boot 코드의 매핑 관계 이해

1. 'Code' 버튼을 클릭
1. 프로젝트 명을 'mall' 로 입력
1. 생성된 코드들에서 다음 매핑 관계를 확인:
    1. Bounded Context --> 단위 마이크로서비스
    1. Event --> Event POJO
    1. Command --> RestRepository
    1. Aggregate --> Entity (Aggregate Root) 
    1. Policy --> PolicyHandler 내에 kafka event listener
        </mark-down>
    </div>
</template>


<script>
    // @group 06_02_06
    export default {
        name:'designToCode',
        data() {
            return {}
        },
        props: {
            "[설계] ES모델기반 템플릿 코드 분석": {
                type: String
            },
        },
    }
</script>
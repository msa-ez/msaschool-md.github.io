<template>
     <div>
        <mark-down class="content">

        </mark-down>
     </div>
</template>


<script>
    // @group 08_02_10
    export default {
        name:'opsPersistenceVolume',
        directory:'operation_ops',
        data() {
            return {}
        },
        props: {
            "파일시스템 (볼륨) 연결과 데이터베이스 설정(작업중)": {
                type: String
            },
        },
    }
</script>
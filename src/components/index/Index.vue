<template>
    <div class="index">
        引入温度计组件
        <goal :currentAmount="currentAmount"></goal>
    </div>
</template>

<script>
import Wenduji from '../../components/Wenduji'
export default {
    data(){
        return {
            currentAmount:-50
        }
    },
    components:{
        'goal':Wenduji
    }
}
</script>
<style>
    .index{
        color:#fff;
    }
</style>
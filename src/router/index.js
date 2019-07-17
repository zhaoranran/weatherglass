import Vue from 'vue'
import Router from 'vue-router'
import Wenduji from '@/components/Wenduji'
import Index from '@/components/index/Index'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    }
  ]
})

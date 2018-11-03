import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import home from '@/views/home'

Vue.use(Router)

export default new Router({
  routes: [
  	{
      path: '/',
      redirect:'/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },{
      path: '/home',
      name: 'home',
      component: home
    }
  ]
})

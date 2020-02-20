import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Right from '../components/power/Right.vue'
import Roles from '../components/power/Roles.vue'
import Category from '../components/goodsMessage/Category.vue'
import goodParams from '../components/goodsMessage/goodParams.vue'
import goodList from '../components/goodsMessage/goodList.vue'
import Add from '../components/goodsMessage/Add.vue'

Vue.use(VueRouter) 

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue')
  },
  {
    path: '/home',
    component: Home,
    name: 'Home',
    //打开home页面，重定向到welcome,看路由变化
    redirect:'/welcome',
    children:[{
      path:'/welcome',
      component:Welcome
    },{
      path:'/users',
      component:Users
    },{
      path:'/rights',
      component:Right
    },{
      path:'/roles',
      component:Roles
    },{
      path:'/categories',
      component:Category,
    },{
      path:'/params',
      component:goodParams,
    },{
      path:'/goods',
      component:goodList,
    },
    {
      path:'/goods/add',
      component:Add,
    },
  ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
//添加beforeEach导航守卫
router.beforeEach((to, from, next) => {
  //如果访问的是login,直接放行
  if (to.path === '/login') return next()
  //如果不是，取到sessionStorage中的token ，如果有，放行，如果没有，跳转到首页
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router

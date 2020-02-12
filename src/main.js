import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/global.css'
import 'element-ui/lib/theme-chalk/index.css'
import element from './element/index.js'
import TreeTable from 'vue-table-with-tree-grid'
//导入图标库
import './assets/fonts/iconfont.css'
import axios from 'axios'
//将axios挂载在Vue中的原型对象http上
Vue.prototype.$http = axios
//配置请求根路径
//defaults 全局配置baseURL
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//- 需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
//axios请求拦截
axios.interceptors.request.use(config => {
  // console.log(config)
  //为请求头对象，添加token验证的Authorization` 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.config.productionTip = false
Vue.use(element)

Vue.component('tree-table', TreeTable)
//定义一个全局的时间过滤器
Vue.filter('dataFormat',function(timeValue){
  const dt=new Date(timeValue)
  const y =dt.getFullYear()
  console.log(typeof y)
  const m = (dt.getMonth()+1+'').padStart(2,'0')
  console.log(typeof m)
  const d = (dt.getDate()+'').padStart(2,'0')
  const hh = (dt.getHours()+'').padStart(2,'0')
  const mm = (dt.getMinutes()+'').padStart(2,'0')
  const ss = (dt.getSeconds()+'').padStart(2,'0')
  return `${y}-${m}-${d}  ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

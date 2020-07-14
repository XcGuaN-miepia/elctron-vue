import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'
import yjui from 'yjui'
import fetch from '@/common/fetch'
import DB from '@/database/data-store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

// 注册yjui组件
Vue.use(yjui, {
  size: 'small',
  zIndex: 2000
})

// 全局Vue报错捕获
Vue.config.errorHandler = function (err, vm, info) {
  // eslint-disable-next-line no-console
  console.error(err)
}

// 全局Vue警告捕获，只适用于开发环境
Vue.config.warnHandler = function (msg, vm, trace) {
  // eslint-disable-next-line no-console
  console.warn(msg)
}

// 注册请求方法
Vue.prototype.$fetch = fetch
// 注册数据库
Vue.prototype.$db = new DB()

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

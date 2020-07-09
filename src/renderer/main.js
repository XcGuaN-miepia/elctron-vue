import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'
import yjui from 'yjui'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

// 注册yjui组件
Vue.use(yjui, {
  size: 'small',
  zIndex: 2000
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

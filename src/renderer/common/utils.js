/**
* created by hezq on 2019-10-18
*
* description: 项目级工具方法
*
*/

import Vue from 'vue'
import fetch from '@/common/fetch.js'
import { tools, MessageBox, Loading } from 'yjui'
import Cookies from 'js-cookie'
import store from '@/store'
import api from '@/api'
const env = require('@/config')

let utils = { app: null }

/**
 * description: 初始化app的值
 * @param {Vue} app vue实例
 *
 * created by hezq on 2019-10-18
 *
*/
utils.init = function (app) {
  utils.app = app

  // 如果是从2.0跳转进入应用
  if (!env.config.hasLoginPage) {
    utils.getUserData()
  }

  // 启用轮询刷新token
  utils.refreshToken()

  if (utils.refreshST) {
    clearInterval(utils.refreshST)
  }

  utils.refreshST = setInterval(() => {
    utils.refreshToken()
  }, 5 * 60 * 1000)
}

/**
 * description: 刷新token
 *
 * created by hezq on 2020-05-19
 *
 */
utils.refreshToken = function () {
  // 获取token
  let accessToken = Cookies.get(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`, {
    domain: env.config.DOMAIN
  }) || tools.store.getLS(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`)

  let refreshToken = Cookies.get(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.refresh_token`, {
    domain: env.config.DOMAIN
  })

  if (accessToken && refreshToken) {
    fetch({
      url: api.common.refreshToken + refreshToken,
      method: 'post',
      data: {
        refresh_token: refreshToken
      },
      headers: {
        Authorization: accessToken
      }
    }).then((res) => {
      if (res.code !== 200) {
        utils.loginout()
      } else {
        utils.refresh(res.data)
      }
    }).catch(() => {
      utils.loginout()
    })
  }
}

/**
 * description: 登录成功
 * @param {Object} data 登录返回值
 *
 * created by hezq on 2019-10-18
 *
*/
utils.login = function (data) {
  // 定义 cookie 相关时间
  let accessTime = new Date(new Date().getTime() + data.access_time * 1000)
  let refreshTime = new Date(new Date().getTime() + data.refresh_time * 1000)

  // 设置 cookie 数据
  Cookies.set(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`, data.access_token, { expires: accessTime, domain: env.config.DOMAIN })
  Cookies.set(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_time`, data.access_time, { expires: accessTime, domain: env.config.DOMAIN })
  Cookies.set(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.refresh_token`, data.refresh_token, { expires: refreshTime, domain: env.config.DOMAIN })
  Cookies.set(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.refresh_time`, data.refresh_time, { expires: refreshTime, domain: env.config.DOMAIN })
  Cookies.set(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.userid`, data.username, { expires: refreshTime, domain: env.config.DOMAIN })

  // 刷新token使用
  tools.store.setLS(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`, data.access_token)
}

/**
 * description: 刷新token，刷新数据
 * @param {Object} data 刷新返回值
 *
 * created by hezq on 2019-10-18
 *
*/
utils.refresh = function (data) {
  // 定义 cookie 相关时间
  let accessTime = new Date(new Date().getTime() + data.access_time * 1000)
  let refreshTime = new Date(new Date().getTime() + data.refresh_time * 1000)
  let lastRefreshTime = new Date().getTime()

  // 更新 cookie
  Cookies.set(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`, data.access_token, { expires: accessTime, domain: env.config.DOMAIN })
  Cookies.set(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_time`, data.access_time, { expires: accessTime, domain: env.config.DOMAIN })
  Cookies.set(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.refresh_token`, data.refresh_token, { expires: refreshTime, domain: env.config.DOMAIN })
  Cookies.set(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.refresh_time`, data.refresh_time, { expires: refreshTime, domain: env.config.DOMAIN })
  Cookies.set(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.last_refresh_time`, lastRefreshTime, { expires: refreshTime, domain: env.config.DOMAIN })

  // 刷新token使用
  tools.store.setLS(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`, data.access_token)
}

/**
 * description: 退出登录
 *
 * created by hezq on 2019-10-18
 *
*/
utils.loginout = function (flag) {
  if (utils.st) {
    clearTimeout(utils.st)
    delete utils.st
  }

  let loadingInstance = Loading.service({
    lock: true,
    text: '登录失效，退出重新登录......',
    background: 'rgba(0, 0, 0, 0.8)'
  })

  // 页面跳转
  utils.st = setTimeout(function () {
    loadingInstance.close()
    Vue.prototype.$nextTick(() => {
      utils.clear()
      if (env.config.hasLoginPage) {
        utils.app.$push('/login')
      } else {
        utils.app.$href(env.config.LOGIN_URL)
      }
    })
  }, 1000)
}

/**
 * description: 应用清理
 *
 * created by hezq on 2020-05-15
 *
*/
utils.clear = function () {
  // 清除缓存
  tools.store.clearLS()
  tools.store.clearSS()
  // 清除 Cookie
  Cookies.remove(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`, { domain: env.config.DOMAIN })
  Cookies.remove(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_time`, { domain: env.config.DOMAIN })
  Cookies.remove(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.refresh_token`, { domain: env.config.DOMAIN })
  Cookies.remove(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.refresh_time`, { domain: env.config.DOMAIN })
  Cookies.remove(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.last_refresh_time`, { domain: env.config.DOMAIN })
  Cookies.remove(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.userid`, { domain: env.config.DOMAIN })
}

/**
 * description: 获取用户相关信息
 *
 * created by hezq on 2020-05-20
 *
 */
utils.getUserData = function (loading, callback) {
  if (!loading) {
    loading = Loading.service({
      lock: true,
      text: '数据加载中......',
      background: 'rgba(0, 0, 0, 0.8)'
    })
  }

  // 获取登录用户信息  获取用户权限组
  Promise.all([utils.loadUserInfo(), utils.loadAuth()]).then(() => {
    // 关闭loading
    loading.close()
    Vue.prototype.$nextTick(() => {
      callback && callback()
    })
  }).catch(() => {
    // 关闭loading
    loading.close()
  })
}

/**
 * description: 获取用户信息
 *
 * created by hezq on 2020-05-20
 *
 */
utils.loadUserInfo = function () {
  return new Promise((resolve, reject) => {
    store.dispatch('loadUserInfo').then((role) => {
      resolve()
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * description: 获取权限信息
 *
 * created by hezq on 2020-05-20
 *
 */
utils.loadAuth = function () {
  return new Promise((resolve, reject) => {
    store.dispatch('loadMenus').then(() => {
      resolve()
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * description: 无权限，页面跳转
 *
 * created by hezq on 2019-10-18
 *
*/
utils.noAuth = function () {
  setTimeout(function () {
    if (utils.app) {
      utils.app.$push('/noauth')
    } else {
      window.location.href = window.location.origin + '/' + env.config.WEB_PACK_NAME + '/noauth'
    }
  }, 1500)
}

/**
 * description: 正在建设中弹窗
 *
 * created by hezq on 2019-11-12
 *
*/
utils.buildingMsg = function () {
  // 弹窗组件
  let imgUrl = require('../assets/images/staytuned.png')

  MessageBox.alert('<div><img class="mb10" src="' + imgUrl + '" alt="图片" width="154" height="152" /></div><div style="color: #767676FF;">正在建设，敬请期待！</div>', {
    dangerouslyUseHTMLString: true,
    showClose: false,
    center: true,
    customClass: 'alert_wrap'
  })
}

/**
 * description: 无权限弹窗
 *
 * created by hezq on 2019-11-12
 *
*/
utils.noAuthMsg = function () {
  // 弹窗组件
  let imgUrl = require('../assets/images/alert_bg.png')

  MessageBox.alert('<div><img class="mb10" src="' + imgUrl + '" alt="图片" width="289" height="198" /></div><div style="color: #767676FF;">您没有相关查看权限，请联系管理员</div>', {
    dangerouslyUseHTMLString: true,
    showClose: false,
    center: true,
    customClass: 'alert_wrap'
  })
}

/**
 * description: 处理路由配置，否则页面无法缓存
 * @param {Object} routers 路由数据
 *
 * created by hezq on 2019-10-18
 *
*/
utils.parseRouterSetting = function (routers) {
  if (tools.isNull(routers)) { return }

  if (routers instanceof Array) {
    routers.forEach(function (item, index) {
      parseRouterSettingNow(item)
    }, this)
  } else {
    parseRouterSettingNow(routers)
  }

  function parseRouterSettingNow (item) {
    if (!tools.isNull(item.children) && item.children.length > 0) { // 对子集进行扫描
      item.children.forEach(function (ch) {
        parseRouterSettingNow(ch)
      })

      return
    }

    if (tools.isNull(item.name)) { // 如果路由名字不存在，则默认赋值一个
      item.name = 'ROUTER_' + tools.str.GUID()
    }

    if (!tools.isNull(item.component)) {
      if (item.component && typeof item.component !== 'function') {
        item.component.name = item.name // 强制把组件的名称赋值成路由名称，不管组件有没有设置名称
      }
    }
  }
}

/**
 * description: 获取文件上传参数
 *
 * created by huyy on 2020-04-27
 *
 */
utils.getUploadFormData = function () {
  let accessToken = Cookies.get(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`, {
    domain: env.config.DOMAIN
  })

  return {
    sid: env.config.SID,
    ssid: env.config.SID,
    token: accessToken
  }
}

/**
 * description: 判断浏览器是否为IE或Edge
 *
 * created by panjm on 2019-10-18
 */

utils.isIeOrEdge = function () {
  let ua = window.navigator.userAgent

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  let msie = ua.indexOf('MSIE ')
  if (msie > 0) {
    // IE 10及以下
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
  }

  let trident = ua.indexOf('Trident/')
  if (trident > 0) {
    // IE 11
    let rv = ua.indexOf('rv:')
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
  }

  let edge = ua.indexOf('Edge/')
  if (edge > 0) {
    // Edge (IE 12+)
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10)
  }

  // 其他浏览器类型
  return false
}

export default utils

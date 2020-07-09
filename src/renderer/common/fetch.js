/**
 * created by hezq on 2019-10-18
 *
 * description: 封装axios的一些常用方法以及request，response拦截器的处理，
 * 更多配置，详见文档：https://www.kancloud.cn/yunye/axios/234845
 *
 */

import axios from 'axios'
import Qs from 'qs'
import Cookies from 'js-cookie'
import {
  Loading,
  Message
} from 'yjui'
import utils from './utils.js'
import api from '@/api'

const env = require('@/config')

// 刷新token接口请求锁
let isRefreshing = true

// Token失效的请求集合
let subscribers = []

/**
 * description: 执行token失效产生的请求
 *
 * created by hezq on 2020-04-16
 *
 */
function onAccessTokenFetched () {
  subscribers.forEach((callback) => {
    callback()
  })
  subscribers = []
}

/**
 * description: token失效接口，加入队列
 *
 * created by hezq on 2020-04-16
 *
 */
function addSubscriber (callback) {
  subscribers.push(callback)
}

/**
 * description: 响应数据统一处理
 * @param {Function} resolve
 * @param {Function} reject
 * @param {Object} response 响应数据
 * @param {Object} params 一些参数
 *
 * created by hezq on 2020-04-16
 *
 */
function doResponse (resolve, reject, response, params) {
  if (response && !response.code) {
    // 判断是否为下载请求响应
    if (params.excelExport) {
      // 模拟下载
      let linkElement = document.createElement('a')

      try {
        let blob = new Blob([response], {
          type: response.type
        })
        let url = window.URL.createObjectURL(blob)

        linkElement.style.display = 'none'
        linkElement.download = params.filename
        linkElement.href = url
        let clickEvent = new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'cancelable': false
        })

        linkElement.dispatchEvent(clickEvent)
        resolve()
      } catch (ex) {
        reject(ex)
      }
    }
  } else if (response && response.code !== 200) {
    let code = response.code
    // 处理401错误，登录失效
    if (code === 401) {
      if (env.config.keepToken === 0) {
        if (isRefreshing) {
          refreshToken()
        }
        isRefreshing = false
        // 这个Promise函数很关键
        const retryOriginalRequest = new Promise((resolve) => {
          addSubscriber(() => {
            resolve(fetch(params.options))
          })
        })
        return retryOriginalRequest
      } else {
        utils.loginout()
      }
    } else if (code === 403) {
      // 处理403错误，访问无权限
      Message.error('请求无权限，请联系管理员')
    } else {
      if (params.showError) {
        // 统一提示错误信息
        Message.error(response.msg)
      }
    }
    reject(response)
  } else {
    resolve(response)
  }
}

/**
 * description: 刷新token
 *
 * created by hezq on 2020-04-16
 *
 */
function refreshToken () {
  // 获取token
  let accessToken = Cookies.get(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`, {
    domain: env.config.DOMAIN
  }) || tools.store.getLS(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`)

  let refreshToken = Cookies.get(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.refresh_token`, {
    domain: env.config.DOMAIN
  })

  axios.request({
    url: api.common.refreshToken + refreshToken,
    method: 'put',
    headers: {
      Authorization: accessToken
    },
    data: {
      refresh_token: refreshToken
    }
  }).then((res) => {
    if (res.data && res.data.code === 200) {
      utils.refresh(res.data.data)
      onAccessTokenFetched()
      isRefreshing = true
    } else {
      subscribers = []
      isRefreshing = true
      utils.loginout()
    }
  }).catch(() => {
    subscribers = []
    isRefreshing = true
    utils.loginout()
  })
}

/**
 * description: 请求封装
 *
 * created by hezq on 2020-04-16
 *
 */
export default function fetch (options) {
  // 请求方式强制转成小写
  options.method = options.method ? options.method.toLowerCase() : 'get'

  // 默认参数
  let defaultOptions = {
    // 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL
    baseURL: '',
    // `transformRequest` 允许在向服务器发送前，修改请求数据
    // 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
    // 后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
    // transformRequest: [function(data) {
    //  // 对 data 进行任意转换处理
    //  return data
    // }],
    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
    // transformResponse: [function(data) {
    //  // 对 data 进行任意转换处理
    //  return data
    // }],
    // 即将被发送的自定义请求头
    headers: {},
    // 即将与请求一起发送的 URL 参数
    params: {},
    // `paramsSerializer` 是一个负责 `params` 序列化的函数
    paramsSerializer: function (params) {
      return Qs.stringify(params, {
        indices: false
      })
    },
    // `data` 是作为请求主体被发送的数据
    // 只适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
    // 在没有设置 `transformRequest` 时，必须是以下类型之一：
    // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
    // - 浏览器专属：FormData, File, Blob
    // - Node 专属： Stream
    // 如果使用FormData，header里的content-type：application/x-www-form-urlencoded，且data必须要Qs.stringify(data)处理
    data: {},
    // 请求超时设置 如果为0，表示无超时时间
    timeout: 30000,
    // 表示跨域请求时是否需要使用凭证
    withCredentials: false,
    // 表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
    responseType: 'json',
    // 以下是非请求参数
    unAxiosParams: {
      // 错误统一拦截
      showError: true,
      // 是否需要loading效果(全屏)
      showLoading: false,
      // 是否是excel导出功能
      excelExport: false,
      // 是否是excel导入功能
      excelImport: false
    }
  }

  // 处理header里的Content-Type值
  if (options.headers && options.headers['Content-Type']) {
    defaultOptions.headers['Content-Type'] = options.headers['Content-Type']
  } else {
    if (options.method === 'post' || options.method === 'put') {
      defaultOptions.headers['Content-Type'] = 'application/json;charset=UTF-8;'
    }
  }

  // 覆盖showError属性
  if (options.showError !== undefined) {
    defaultOptions.unAxiosParams.showError = options.showError
    delete options.showError
  }

  // 覆盖excelExport属性
  if (options.excelExport !== undefined) {
    defaultOptions.unAxiosParams.excelExport = options.excelExport
    defaultOptions.unAxiosParams.filename = options.filename || 'Excel导出文件.xlsx'
    delete options.excelExport
  }

  // 导出excel模式，responseType为blob，method强制为get请求
  if (defaultOptions.unAxiosParams.excelExport) {
    options.responseType = 'blob'
    options.method = 'get'
  }

  // 覆盖excelImport属性
  if (options.excelImport !== undefined) {
    defaultOptions.unAxiosParams.excelImport = options.excelImport
    delete options.excelImport
  }

  // 导入excel模式，data为FormData模式，method强制为post请求
  if (defaultOptions.unAxiosParams.excelImport) {
    options.method = 'post'
    defaultOptions.headers['Content-Type'] = 'multipart/form-data'

    // 文件导入采用 FormData 参数
    let data = new FormData()

    // 组装数据
    for (let key in options.data) {
      if (options.data.hasOwnProperty(key)) {
        data.append(key, options.data[key])
      }
    }

    options.data = data
  }

  // 获取token
  let accessToken = Cookies.get(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`, {
    domain: env.config.DOMAIN
  }) || tools.store.getLS(`${env.config.DOMAIN_URL}${env.config.WEB_APP_KEY}.access_token`)

  // 判断是否存在token，如果存在的话，则每个http header都加上token
  if (accessToken && options.url.indexOf('mock') === -1) {
    defaultOptions.headers.Authorization = accessToken
  }

  // 如果页面上传了headers参数，合并处理
  if (options.headers) {
    options.headers = {
      ...defaultOptions.headers,
      ...options.headers
    }
  }

  // 合并请求参数
  const newOptions = { ...defaultOptions,
    ...options
  }

  let unAxiosParams = newOptions.unAxiosParams

  // 删掉非请求参数
  delete newOptions.unAxiosParams

  let loadingInstance = null
  if (unAxiosParams.showLoading) {
    loadingInstance = Loading.service({
      lock: true,
      text: '加载中',
      spinner: 'yj-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }
  // 发起请求，返回一个promise对象
  return new Promise((resolve, reject) => {
    axios.request(newOptions).then(res => {
      if (unAxiosParams.showLoading) {
        loadingInstance.close()
      }

      let params = {
        options: newOptions,
        ...unAxiosParams
      }
      // 状态处理
      doResponse(resolve, reject, res, params)
    }).catch(error => {
      if (unAxiosParams.showLoading) {
        loadingInstance.close()
      }
      reject(error)
    })
  })
}

// 请求拦截器
axios.interceptors.request.use(function (config) {
  // 增加 ssid 参数
  config.params.ssid = env.config.SID
  // 如果需要，增加 subsystem 参数
  config.params.subsystem = env.config.SUB_SYSTEM
  // 增加 ssid 参数
  config.data.ssid = env.config.SID
  // 如果需要，增加 subsystem 参数
  config.data.subsystem = env.config.SUB_SYSTEM

  // 解决在ie下请求缓存的问题
  config.params._ = new Date().getTime()

  // 请求地址及参数是否打印日志，在config.js里设置
  if (env.config.showLogs) {
    // eslint-disable-next-line no-console
    console.log('接口地址-->' + config.url)
    // eslint-disable-next-line no-console
    console.log('传入data参数-->' + JSON.stringify(config.params))
    // eslint-disable-next-line no-console
    console.log('传入params参数-->' + JSON.stringify(config.data))
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

// 响应拦截器
axios.interceptors.response.use(
  response => {
    // 响应数据是否打印日志，在config.js里设置
    if (env.config.showLogs) {
      // eslint-disable-next-line no-console
      console.log('返回数据-->' + JSON.stringify(response.data))
    }
    return response.data
  },
  error => {
    if (error && error.response) {
      Message.error(`状态码：${error.response.status}，错误信息：${error.response.data.error}`)
    } else {
      // error.message 是英文的，所以不提示出来，统一错误信息
      Message.error('网络请求异常，请稍候再试')
    }
    return Promise.reject(error)
  })

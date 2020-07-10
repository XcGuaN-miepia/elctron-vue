/**
* created by hezq on 2019-10-18
*
* description: 项目配置文件
*
*/

let config = {}

// 接口请求是否显示日志
config.showLogs = false

// 是否启用登录页，若不启用，必须配上LOGIN_URL
config.hasLoginPage = true

// 登录页验证码方式 0-图片计算验证码 1-滑块验证码 1-文字验证码
config.verifyType = 1

// 是否启用token保活机制 0- 启用 1- 不启用
config.keepToken = 0

// 菜单模式 0- 静态 1- 动态
config.menuMode = 0

// 网站根目录
config.WEB_ROOT = '$$_WEB_ROOT_$$'
// 网站 title
config.WEB_TITLE = '$$_WEB_TITLE_$$'
// 应用key
config.WEB_APP_KEY = '$$_WEB_APP_KEY_$$'
// 打包后的项目名
config.WEB_PACK_NAME = '$$_WEB_PACK_NAME_$$'

// 2.0项目相关配置
config.LOGIN_URL = '$$_LOGIN_URL_$$'
config.DOC_URL = '$$_DOC_URL_$$'

// 微服务相关地址
config.SID = '$$_SID_$$'
config.SUB_SYSTEM = '$$_SUB_SYSTEM_$$'
config.API_SSO = '$$_API_SSO_$$'
config.API_BS = '$$_API_BS_$$'
config.API_MB = '$$_API_MB_$$'
config.API_AUTH = '$$_API_AUTH_$$'
config.API_SP = '$$_API_SP_$$'
config.API_FS = '$$_API_FS_$$'
config.FS_URL = '$$_FS_URL_$$'

// cookie相关配置
config.DOMAIN_URL = '$$_DOMAIN_URL_$$'
config.DOMAIN = '$$_DOMAIN_$$'

// mock模拟接口地址
config.API_MOCK = '$$_API_MOCK_$$'

module.exports = {
  config: config
}

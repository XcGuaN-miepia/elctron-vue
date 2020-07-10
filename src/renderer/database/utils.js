/**
 * created by zhouzt on 2020-07-11
 *
 * description: 操作数据库方法
 *
 */
import Nedb from 'nedb'
import path from 'path'
import { remote } from 'electron'

export default class DatabaseUtils extends Nedb {
  /**
   * description: 构造函数
   *
   * @param {Object} db 数据库参数
   * @param {String} [remotePath = 'userData'] 存储位置
   * @param {String} dbName 数据库名称
   *
   * created by zhouzt on 2020-07-11
   *
   */
  constructor ({
    remotePath = 'userData',
    dbName
  }) {
    super({
      autoload: true,
      filename: path.join(remote.app.getPath(remotePath), `/electron/${dbName}.db`)
    })
  }
}

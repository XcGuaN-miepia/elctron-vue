import Nedb from 'nedb'
import path from 'path'
import { remote } from 'electron'

// TODO:文件名称修改
export default class Datastore extends Nedb {
  /**
   * description: 构造函数
   *
   * @param {Object} db 数据库参数
   * @param {String} [db.remotePath = 'userData'] 存储位置
   * @param {String} db.dbName 数据库名称
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

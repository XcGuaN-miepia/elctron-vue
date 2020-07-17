import Nedb from 'nedb'
import path from 'path'
import { remote } from 'electron'

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
  constructor (db = {
    remotePath: 'userData',
    dbName: 'data'
  }) {
    super({
      autoload: true,
      filename: path.join(remote.app.getPath(db.remotePath), `/electron/${db.dbName}.db`)
    })
  }

  /**
   * description: 封装 insert
   *
   * @param {any} doc 支持String, Number, Boolean, Date, null, array以及object类型。如果该字段是undefined类型，将不会被保存，这里和MongoDB处理方式有点不同，MongoDB会将undefined转换为null进行存储。字段名称不能以"$"开始，也不能包含"."。
   *
   * created by zhouzt on 2020-07-13
   *
   */
  dbInsert (doc) {
    return new Promise((resolve, reject) => {
      this.insert(doc, (err, newDoc) => {
        if (err) {
          reject(err)
          return
        }

        resolve(newDoc)
      })
    })
  }

  /**
   * description: 封装 find
   *
   * @param {Object} query 查询条件。支持使用比较运算符($lt, $lte, $gt, $gte, $in, $nin, $ne), 逻辑运算符($or, $and, $not, $where), 正则表达式进行查询。
   *
   * created by zhouzt on 2020-07-14
   *
   */
  dbFind (query) {
    return new Promise((resolve, reject) => {
      this.find(query, (err, docs) => {
        if (err) {
          reject(err)
          return
        }

        resolve(docs)
      })
    })
  }

  /**
   * description: 封装 update
   *
   * created by zhouzt on 2020-07-14
   *
   */
  dbUpdate () {
    return new Promise((resolve, reject) => {

    })
  }
}

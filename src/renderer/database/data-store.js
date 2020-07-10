import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

// TODO:文件名称修改
export default new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), '/electron/data.db')
})

// TODO:考虑多数据库

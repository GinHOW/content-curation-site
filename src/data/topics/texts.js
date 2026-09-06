// 选题的文字标签库：球面屏幕墙中文字屏的内容来源。
// 选中选题后，图片不足 16 块屏幕时优先用这里的文字标签补齐；
// 没有文字素材的选题以空白卡片补齐。
import { livingRoomArchive } from './livingRoomArchive.js'

export const topicTexts = {
  // 客厅的示范采集：每条记录 = 名称 ＋ 出处。
  客厅: livingRoomArchive.categories.flatMap((category) =>
    category.items.map(([name, source]) => `${name}｜${source}`),
  ),
}

import { spatialKeywordColors } from './home.js'

const topicDefinitions = [
  ['客厅', 'room1'],
  ['橱窗', 'room2'],
  ['隧道', 'room2'],
  ['桌面', 'room3'],
  ['暗房', 'room4'],
  ['蓄水池', 'room5'],
  ['田', 'room6'],
  ['黄页', 'room7'],
  ['晒场', 'room8'],
  ['阳台', 'room9'],
  ['宴席', 'room10'],
  ['谷仓', 'room11'],
  ['楼梯间', 'room11'],
  ['监控室', 'room12'],
]

const roomKeywords = topicDefinitions.reduce((map, [label, roomId]) => {
  map[roomId] ||= []
  map[roomId].push(label)
  return map
}, {})

export function getLocalCourseState() {
  return {
    rooms: Array.from({ length: 12 }, (_, index) => {
      const id = `room${index + 1}`
      return {
        id,
        number: String(index + 1).padStart(2, '0'),
        name: `空间 ${String(index + 1).padStart(2, '0')}`,
        keywords: [...(roomKeywords[id] || [])],
      }
    }),
    topics: topicDefinitions.map(([label, roomId], index) => ({
      id: index + 1,
      label,
      source: 'system',
      roomId,
      colorToken: spatialKeywordColors[label],
      sortOrder: index + 1,
    })),
    groups: Array.from({ length: 16 }, (_, index) => ({
      id: `group-${index < 8 ? 'a' : 'b'}${(index % 8) + 1}`,
      code: `${index < 8 ? 'A' : 'B'}${(index % 8) + 1}`,
      sortOrder: index + 1,
      topicId: null,
      topicLabel: null,
    })),
  }
}

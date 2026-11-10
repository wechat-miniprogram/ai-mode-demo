// 安全 decode：非法转义序列（如单独的 %）时保留原值，避免抛错
function safeDecode(value) {
  const str = String(value == null ? '' : value).replace(/\+/g, ' ')
  try {
    return decodeURIComponent(str)
  } catch (e) {
    return str
  }
}

// 解析 handoff 原始 query 字符串（开发者自行 encodeURIComponent 拼接），key/value 均 decode
// 例：'keyword=%E6%8B%BF%E9%93%81&drinkId=289' -> { keyword: '拿铁', drinkId: '289' }
function parseQuery(raw) {
  const result = {}
  if (!raw || typeof raw !== 'string') return result
  raw.replace(/^[?#]/, '').split('&').forEach(pair => {
    if (!pair) return
    const idx = pair.indexOf('=')
    const key = safeDecode(idx >= 0 ? pair.slice(0, idx) : pair)
    if (!key) return
    result[key] = idx >= 0 ? safeDecode(pair.slice(idx + 1)) : ''
  })
  return result
}

// 合并 onLoad query 与 handoff 解码后的 query：handoff 优先；onLoad 值同样做安全 decode
function resolvePageQuery(pageQuery, handoff) {
  const result = {}
  Object.keys(pageQuery || {}).forEach(key => {
    result[key] = safeDecode(pageQuery[key])
  })
  if (handoff && handoff.params) Object.assign(result, handoff.params)
  return result
}

module.exports = { safeDecode, parseQuery, resolvePageQuery }

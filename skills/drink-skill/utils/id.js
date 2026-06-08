// ID 生成工具
function genOrderId() {
  const ts = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1e4).toString(36).padStart(3, '0')
  return `O${ts}${rand}`.toUpperCase()
}

module.exports = { genOrderId }

// ID 生成工具
function genOrderId() {
  const ts = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1e4).toString(36).padStart(3, '0')
  return `O${ts}${rand}`.toUpperCase()
}

// 订单商品项 ID（同一订单内区分多杯，供 removeOrderItem 精确定位）
function genItemId() {
  const ts = Date.now().toString(36)
  const rand = Math.floor(Math.random() * 1e4).toString(36).padStart(3, '0')
  return `IT${ts}${rand}`.toUpperCase()
}

module.exports = { genOrderId, genItemId }

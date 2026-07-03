// SKU 校验与金额计算
const { findDrink } = require('./storage.js')
const { genItemId } = require('./id.js')

/**
 * 在选项列表里找匹配项，支持 value（精确）、label（中文）、大小写不敏感匹配
 */
function resolveOption(options, rawVal) {
  if (rawVal == null) return null
  const v = String(rawVal).trim()
  const vLower = v.toLowerCase()
  // 1. 精确 value
  let opt = options.find(o => o.value === v)
  if (opt) return opt
  // 2. 大小写不敏感 value
  opt = options.find(o => String(o.value).toLowerCase() === vLower)
  if (opt) return opt
  // 3. label 完全匹配（中文）
  opt = options.find(o => o.label === v)
  if (opt) return opt
  // 4. label 去空格匹配
  opt = options.find(o => String(o.label).replace(/\s+/g, '') === v.replace(/\s+/g, ''))
  if (opt) return opt
  return null
}

// 单选维度「用户未指定」时的统一默认值（与 sku-picker 规格页、详情卡保持一致）
const DEFAULT_SINGLE_SPEC = { temperature: 'ice', sugar: 'normal', cupSize: 'medium' }

/**
 * 校验并规范化 specs
 * @returns { valid: boolean, error?: string, normalizedSpecs, specText, totalPrice }
 */
function validateSpecs(drinkId, rawSpecs) {
  const drink = findDrink(drinkId)
  if (!drink) {
    return { valid: false, error: `未找到 id 为 ${drinkId} 的饮品` }
  }
  const schema = drink.skuSchema
  const specs = rawSpecs || {}
  const normalized = {}
  const textParts = []
  let extraPrice = 0

  for (const dim of schema.dimensions) {
    const val = specs[dim.key]
    if (dim.multiple) {
      const arr = Array.isArray(val) ? val : (val ? [val] : [])
      const validValues = []
      const labels = []
      for (const v of arr) {
        const opt = resolveOption(dim.options, v)
        if (opt) {
          validValues.push(opt.value)
          labels.push(opt.label)
          extraPrice += (opt.extraPrice || 0)
        } else {
          const allow = dim.options.map(o => `${o.value}(${o.label})`).join('、')
          return { valid: false, error: `${dim.label} 不支持 "${v}"，可选：${allow}` }
        }
      }
      normalized[dim.key] = validValues
      if (labels.length) textParts.push(`${dim.label}:${labels.join('+')}`)
    } else {
      // 用户/模型未指定该维度时，使用统一默认值兜底（不再报错、不依赖模型猜测）
      const useVal = (val != null && String(val).trim())
        ? val
        : (DEFAULT_SINGLE_SPEC[dim.key] || (dim.options[0] && dim.options[0].value))
      const opt = resolveOption(dim.options, useVal)
      if (!opt) {
        const allow = dim.options.map(o => `${o.value}(${o.label})`).join('、')
        return { valid: false, error: `${dim.label} 不支持 "${val}"，可选：${allow}` }
      }
      normalized[dim.key] = opt.value
      extraPrice += (opt.extraPrice || 0)
      textParts.push(`${opt.label}`)
    }
  }

  const totalPrice = drink.price + extraPrice
  return {
    valid: true,
    normalizedSpecs: normalized,
    specText: textParts.join(' / '),
    totalPrice,
    basePrice: drink.price,
    extraPrice
  }
}

/**
 * 校验规格并组装一个订单商品项（供 createOrder / addToOrder 共用）
 * @returns { valid: boolean, error?: string, item? }
 */
function buildOrderItem(drinkId, rawSpecs) {
  const drink = findDrink(drinkId)
  if (!drink) {
    return { valid: false, error: `未找到 drinkId=${drinkId} 的饮品` }
  }
  const check = validateSpecs(drinkId, rawSpecs)
  if (!check.valid) return check
  return {
    valid: true,
    item: {
      itemId: genItemId(),
      drinkId: drink.id,
      drinkName: drink.name,
      imageUrl: drink.imageUrl,
      specs: check.normalizedSpecs,
      specText: check.specText,
      basePrice: check.basePrice,
      extraPrice: check.extraPrice,
      totalPrice: check.totalPrice
    }
  }
}

module.exports = { validateSpecs, buildOrderItem }

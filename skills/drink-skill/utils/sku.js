// SKU 校验与金额计算
const { findDrink } = require('./storage.js')

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
      if (!val) {
        return { valid: false, error: `缺少规格：${dim.label}` }
      }
      const opt = resolveOption(dim.options, val)
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

module.exports = { validateSpecs }

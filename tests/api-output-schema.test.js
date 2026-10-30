const test = require('node:test')
const assert = require('node:assert/strict')

const definitions = require('../skills/drink-skill/mcp.json').apis
const apis = Object.fromEntries(definitions.map(({ name }) => [name, require(`../skills/drink-skill/apis/${name}.js`)]))

let storage
global.wx = {
  getStorageSync: key => storage[key],
  setStorageSync: (key, value) => { storage[key] = value },
  removeStorageSync: key => { delete storage[key] }
}

function checkSchema(schema, value, location = 'structuredContent') {
  const types = Array.isArray(schema.type) ? schema.type : [schema.type]
  const actual = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
  assert.ok(types.includes(actual), `${location}: expected ${types}, got ${actual}`)
  if (actual === 'object') {
    for (const key of Object.keys(value)) {
      const property = schema.properties?.[key] || schema.additionalProperties
      assert.ok(property && typeof property === 'object', `${location}.${key}: missing schema`)
      checkSchema(property, value[key], `${location}.${key}`)
    }
    for (const [key, property] of Object.entries(schema.properties || {})) {
      if (property.format !== 'page-link') continue
      assert.equal(typeof value[key], 'string', `${location}.${key}: missing page link`)
      assert.ok(value[key].startsWith('/'), `${location}.${key}: invalid mini program path`)
      assert.equal(typeof value[property['x-link-text-field']], 'string', `${location}.${key}: missing link text`)
    }
  } else if (actual === 'array') {
    value.forEach((item, index) => checkSchema(schema.items, item, `${location}[${index}]`))
  }
}

async function check(name, args, expectedPath) {
  const result = await apis[name](args)
  assert.equal(result.isError, false, `${name}: ${result.content[0].text}`)
  const schema = definitions.find(api => api.name === name).outputSchema
  checkSchema(schema, result.structuredContent)
  if (expectedPath) assert.equal(result.structuredContent.pagePath, expectedPath)
  if (result.handoff && result.structuredContent.pagePath) {
    assert.equal(result.structuredContent.pagePath.split('?')[0], definitions.find(api => api.name === name)._meta.ui.pagePath)
  }
  return result
}

test('all atomic API success outputs match outputSchema and expose page links', async () => {
  storage = {}
  const search = await check('searchDrinks', { keyword: '拿铁' })
  assert.ok(search.structuredContent.items.length)
  for (const item of search.structuredContent.items) {
    assert.equal(item.pagePath, `/packageDetail/pages/sku-picker?drinkId=${item.drinkId}`)
  }
  await check('searchDrinks', {}) // keyword is null when browsing all
  const drinkId = search.structuredContent.items[0].drinkId
  await check('selectDrink', { drinkId }, `/packageDetail/pages/sku-picker?drinkId=${drinkId}`)

  const created = await check('createOrder', { drinkId, specs: {} })
  const orderPath = `/packageDetail/pages/checkout?orderId=${created.structuredContent.orderId}`
  assert.equal(created.structuredContent.pagePath, orderPath)
  await check('addToOrder', { drinkId, specs: {} }, orderPath)
  await check('viewOrder', {}, orderPath)
  await check('removeOrderItem', { itemId: created.structuredContent.items[0].itemId }, orderPath)
  await check('saveAddress', { name: '测试', phone: '13800000000', detail: '测试地址' }, orderPath)
  await check('cancelOrder', {}, '/pages/home/home')
  await check('saveAddress', { name: '测试', phone: '13800000000', detail: '测试地址' }, '/pages/home/home')
})

test('error responses do not advertise page links', async () => {
  storage = {}
  for (const [name, args] of [
    ['searchDrinks', { keyword: 'not-a-drink' }],
    ['selectDrink', { drinkId: -1 }],
    ['createOrder', {}],
    ['addToOrder', {}],
    ['removeOrderItem', {}],
    ['viewOrder', {}],
    ['cancelOrder', {}],
    ['saveAddress', {}]
  ]) {
    const result = await apis[name](args)
    assert.equal(result.isError, true, name)
    assert.equal(result.structuredContent, undefined, name)
  }
})

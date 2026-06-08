// 注册所有原子接口
// 注意：必须使用 createSkill 创建 skill 实例后通过 skill.registerAPI 注册，
// 这样才能使用中间件机制（skill.use），且符合文档规范。
const getRecommendedDrinks = require('./apis/getRecommendedDrinks.js')
const searchDrinks = require('./apis/searchDrinks.js')
const getAllDrinks = require('./apis/getAllDrinks.js')
const selectDrink = require('./apis/selectDrink.js')
const confirmSku = require('./apis/confirmSku.js')
const getAddress = require('./apis/getAddress.js')
const saveAddress = require('./apis/saveAddress.js')
const confirmOrder = require('./apis/confirmOrder.js')
const payOrder = require('./apis/payOrder.js')
const getStoreStatus = require('./apis/getStoreStatus.js')

// 创建 skill 实例，path 需与 app.json 中 agent.skills[].path 一致
const skill = wx.modelContext.createSkill('skills/drink-skill')

// 注册原子接口，name 需与 mcp.json 中声明的一致
skill.registerAPI('getRecommendedDrinks', getRecommendedDrinks)
skill.registerAPI('searchDrinks', searchDrinks)
skill.registerAPI('getAllDrinks', getAllDrinks)
skill.registerAPI('selectDrink', selectDrink)
skill.registerAPI('confirmSku', confirmSku)
skill.registerAPI('getAddress', getAddress)
skill.registerAPI('saveAddress', saveAddress)
skill.registerAPI('confirmOrder', confirmOrder)
skill.registerAPI('payOrder', payOrder)
skill.registerAPI('getStoreStatus', getStoreStatus)

console.log('[drink-skill] APIs registered via createSkill')

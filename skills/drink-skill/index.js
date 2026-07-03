// 注册所有原子接口
// 注意：必须使用 createSkill 创建 skill 实例后通过 skill.registerAPI 注册，
// 这样才能使用中间件机制（skill.use），且符合文档规范。
const searchDrinks = require('./apis/searchDrinks.js')
const selectDrink = require('./apis/selectDrink.js')
const createOrder = require('./apis/createOrder.js')
const addToOrder = require('./apis/addToOrder.js')
const removeOrderItem = require('./apis/removeOrderItem.js')
const viewOrder = require('./apis/viewOrder.js')
const cancelOrder = require('./apis/cancelOrder.js')
const saveAddress = require('./apis/saveAddress.js')

// 创建 skill 实例，path 需与 app.json 中 agent.skills[].path 一致
const skill = wx.modelContext.createSkill('skills/drink-skill')

// 注册原子接口，name 需与 mcp.json 中声明的一致
skill.registerAPI('searchDrinks', searchDrinks)
skill.registerAPI('selectDrink', selectDrink)
skill.registerAPI('createOrder', createOrder)
skill.registerAPI('addToOrder', addToOrder)
skill.registerAPI('removeOrderItem', removeOrderItem)
skill.registerAPI('viewOrder', viewOrder)
skill.registerAPI('cancelOrder', cancelOrder)
skill.registerAPI('saveAddress', saveAddress)

console.log('[drink-skill] APIs registered via createSkill')

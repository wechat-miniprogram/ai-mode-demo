// 半屏页面内置 seed 兜底（与 skills/drink-skill/data/seed.js 保持一致）
// 用于独立分包隔离下当 storage 尚未被原子接口注入时的兜底

const CATEGORIES = [
  { id: 141, name: '黑咖/果咖' },
  { id: 133, name: '奶咖' },
  { id: 136, name: '蔬果汁' },
  { id: 135, name: '水果茶' },
  { id: 139, name: '奶茶/暖饮' }
]

const DRINKS = [
  // 黑咖/果咖
  { id: 289, name: '美式', price: 15, categoryId: 141, categoryName: '黑咖/果咖', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251209/17652673086937d76c17e9c.jpg' },
  { id: 366, name: '超大杯美式600ml', price: 20, categoryId: 141, categoryName: '黑咖/果咖', description: '含四份浓缩咖啡', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251210/176534508969390741d4166.jpg' },
  { id: 293, name: '白桃茶美式', price: 16, categoryId: 141, categoryName: '黑咖/果咖', description: '清爽茶香', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251210/176534486869390664b695a.jpg' },
  { id: 295, name: '杨桃油柑冰美式', price: 18, categoryId: 141, categoryName: '黑咖/果咖', description: '鲜油柑+杨桃', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20260316/177362732169b767b997a3e.jpg' },
  { id: 353, name: '凤梨冰美式', price: 18, categoryId: 141, categoryName: '黑咖/果咖', description: '推荐', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251210/17653523176939237d0eb54.jpg' },
  { id: 362, name: '葡萄冰美式', price: 18, categoryId: 141, categoryName: '黑咖/果咖', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251210/176535381669392958855c3.jpg' },
  { id: 294, name: '爆柠冰美式', price: 18, categoryId: 141, categoryName: '黑咖/果咖', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251210/176535305869392662b1f7b.jpg' },
  { id: 296, name: '鲜橙冰美式', price: 20, categoryId: 141, categoryName: '黑咖/果咖', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251210/1765352595693924931d530.jpg' },

  // 奶咖
  { id: 393, name: '焦糖蜂窝拿铁', price: 20, categoryId: 133, categoryName: '奶咖', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20260309/177303790969ae6955c4adc.jpg' },
  { id: 395, name: '小黄油拿铁', price: 20, categoryId: 133, categoryName: '奶咖', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20260316/177362905369b76e7d64a60.jpg' },
  { id: 368, name: '黄油Dirty', price: 20, categoryId: 133, categoryName: '奶咖', description: '到店制作 大口喝', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250915/175792001668c7bb103f1f5.jpg' },
  { id: 390, name: '轻芝士拿铁', price: 20, categoryId: 133, categoryName: '奶咖', description: '法国kiri芝士', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251204/17648151816930f14da5150.jpg' },
  { id: 195, name: '拿铁', price: 18, categoryId: 133, categoryName: '奶咖', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251209/17652726516937ec4b6b532.jpg' },
  { id: 384, name: 'SOE澳白', price: 18, categoryId: 133, categoryName: '奶咖', description: '小热杯 更"咖啡"！', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251201/1764565677692d22add53e7.jpg' },
  { id: 383, name: '秋玫瑰拿铁', price: 20, categoryId: 133, categoryName: '奶咖', description: '玫瑰与奶咖的双向奔赴', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251103/176214825769083fa1d7de2.jpg' },
  { id: 299, name: '生椰拿铁', price: 20, categoryId: 133, categoryName: '奶咖', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250627/1750996846685e176e7536c.jpg' },
  { id: 297, name: '橘皮拿铁', price: 20, categoryId: 133, categoryName: '奶咖', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250627/1750997293685e192d579ce.jpg' },
  { id: 208, name: '燕麦拿铁', price: 22, categoryId: 133, categoryName: '奶咖', description: 'OATLY燕麦奶', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250627/1750996571685e165b4e3a0.jpg' },

  // 蔬果汁
  { id: 394, name: '杨桃+油柑', price: 18, categoryId: 136, categoryName: '蔬果汁', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20260316/177362802669b76a7a93e8b.jpg' },
  { id: 389, name: '胡萝卜汁', price: 13, categoryId: 136, categoryName: '蔬果汁', description: '补充维生素A', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251202/1764654531692e7dc3927b4.jpg' },
  { id: 386, name: '青瓜+西芹+苹果', price: 15, categoryId: 136, categoryName: '蔬果汁', description: '全能果蔬饮就它了', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251208/1765176657693675513a17b.jpg' },
  { id: 387, name: '青瓜+雪梨+柠檬', price: 15, categoryId: 136, categoryName: '蔬果汁', description: '一口喝出清润好气色', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251208/1765164002693643e2d174a.jpg' },
  { id: 313, name: '苹果胡萝卜汁', price: 17, categoryId: 136, categoryName: '蔬果汁', description: '现榨无糖0负担', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251202/1764658171692e8bfb790d5.jpg' },

  // 水果茶
  { id: 315, name: '蜂蜜柚子茶', price: 12, categoryId: 135, categoryName: '水果茶', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250330/174327153667e83670dc047.jpg' },
  { id: 300, name: '海盐柠檬', price: 13, categoryId: 135, categoryName: '水果茶', description: '补充电解质', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250330/174327104167e8348162305.jpg' },
  { id: 302, name: '鸭屎香柠檬茶', price: 13, categoryId: 135, categoryName: '水果茶', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250330/174327110067e834bc1a742.jpg' },
  { id: 301, name: '白桃乌龙柠檬茶', price: 13, categoryId: 135, categoryName: '水果茶', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250330/174327107367e834a181d79.jpg' },
  { id: 305, name: '满杯百香果', price: 13, categoryId: 135, categoryName: '水果茶', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250330/174327118767e83513831c0.jpg' },
  { id: 306, name: '百香益力多', price: 16, categoryId: 135, categoryName: '水果茶', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250330/174327124867e83550ede3a.jpg' },
  { id: 307, name: '柠檬益力多', price: 16, categoryId: 135, categoryName: '水果茶', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250330/174327126967e835653918f.jpg' },
  { id: 364, name: '黑加仑柠檬茶', price: 16, categoryId: 135, categoryName: '水果茶', description: '', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251204/17648181086930fcbc996fe.jpg' },
  { id: 303, name: '杨桃油柑柠檬茶', price: 16, categoryId: 135, categoryName: '水果茶', description: '鲜油柑榨+杨桃', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250330/174327112967e834d9e9e4a.jpg' },

  // 奶茶/暖饮
  { id: 371, name: '抹茶脑袋', price: 17, categoryId: 139, categoryName: '奶茶/暖饮', description: '冷热皆宜', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250919/175825559068ccd9e621790.jpg' },
  { id: 372, name: '茶萃奶白', price: 16, categoryId: 139, categoryName: '奶茶/暖饮', description: '冷热皆宜', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250919/175825679268ccde98d4a11.jpg' },
  { id: 316, name: '黑糖姜母茶', price: 12, categoryId: 139, categoryName: '奶茶/暖饮', description: '热饮 红枣配枸杞', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20250330/174327157267e83694d8e63.jpg' },
  { id: 381, name: '红糖姜桃胶撞奶', price: 18, categoryId: 139, categoryName: '奶茶/暖饮', description: '热饮 姜跟牛奶很般配', imageUrl: 'https://coffeebar.ext.pinquest.cn/uploads/goods/20251023/176118648468f992b4ab4e6.jpg' }
]

function buildSkuSchema(categoryId) {
  const tempDim = {
    key: 'temperature', label: '温度', multiple: false,
    options: [
      { value: 'ice', label: '冰' },
      { value: 'hot', label: '热' }
    ]
  }
  const sugarDim = {
    key: 'sugar', label: '糖度', multiple: false,
    options: [
      { value: 'none', label: '无糖' },
      { value: 'less', label: '少糖' },
      { value: 'normal', label: '标准' },
      { value: 'more', label: '多糖' }
    ]
  }
  const cupDim = {
    key: 'cupSize', label: '杯型', multiple: false,
    options: [
      { value: 'medium', label: '中杯', extraPrice: 0 },
      { value: 'large', label: '大杯', extraPrice: 3 },
      { value: 'xlarge', label: '超大杯', extraPrice: 6 }
    ]
  }
  const milkToppings = {
    key: 'toppings', label: '加料', multiple: true,
    options: [
      { value: 'oatMilk', label: '燕麦奶', extraPrice: 3 },
      { value: 'coconut', label: '椰浆', extraPrice: 3 },
      { value: 'extraShot', label: '额外浓缩', extraPrice: 5 }
    ]
  }
  const teaToppings = {
    key: 'toppings', label: '加料', multiple: true,
    options: [
      { value: 'pearl', label: '珍珠', extraPrice: 2 },
      { value: 'jelly', label: '椰果', extraPrice: 2 }
    ]
  }
  const juiceCupDim = {
    key: 'cupSize', label: '杯型', multiple: false,
    options: [
      { value: 'medium', label: '中杯', extraPrice: 0 },
      { value: 'large', label: '大杯', extraPrice: 3 }
    ]
  }

  switch (categoryId) {
    case 141: return { dimensions: [tempDim, sugarDim] }
    case 133: return { dimensions: [tempDim, sugarDim, cupDim, milkToppings] }
    case 136: return { dimensions: [tempDim, juiceCupDim] }
    case 135: return { dimensions: [tempDim, sugarDim, cupDim] }
    case 139: return { dimensions: [tempDim, sugarDim, cupDim, teaToppings] }
    default: return { dimensions: [tempDim, sugarDim] }
  }
}

function buildCatalog() {
  return DRINKS.map(d => ({
    ...d,
    skuSchema: buildSkuSchema(d.categoryId)
  }))
}

module.exports = { CATEGORIES, DRINKS, buildCatalog, buildSkuSchema }

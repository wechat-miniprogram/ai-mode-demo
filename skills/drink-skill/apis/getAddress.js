// 获取收货地址（通过 wx.chooseAddress 系统选择器）
// 原子组件环境不支持 wx.chooseAddress，因此必须在原子接口中调用
// 规范（最佳实践）：
// - content：「事实陈述 + 业务动作」两段式
// - structuredContent：供 Agent 理解
// - _meta：组件渲染用，Agent 不可见
const { getAddress: getStoredAddress, setAddress } = require('../utils/storage.js')

function chooseAddress() {
  return new Promise((resolve, reject) => {
    if (!wx || typeof wx.chooseAddress !== 'function') {
      return reject(new Error('当前环境不支持 wx.chooseAddress'))
    }
    wx.chooseAddress({
      success: (res) => resolve(res),
      fail: (err) => reject(err || new Error('用户取消选择地址'))
    })
  })
}

async function getAddressApi() {
  try {
    // 调用系统地址选择器
    let addr
    try {
      const res = await chooseAddress()
      const detail = (res.provinceName || '') + (res.cityName || '') + (res.countyName || '') + (res.detailInfo || '')
      addr = {
        name: res.userName,
        phone: res.telNumber,
        detail
      }
      // 持久化到 storage
      setAddress(addr)
    } catch (e) {
      // 用户取消或环境不支持，尝试读取已存储的地址
      addr = getStoredAddress()
    }

    if (!addr) {
      return {
        isError: false,
        content: [{ type: 'text', text: '用户未选择收货地址（取消或无已保存地址）。请引导用户再次点击地址区域选择地址。' }],
        structuredContent: {
          hasAddress: false,
          address: null
        },
        _meta: {}
      }
    }

    return {
      isError: false,
      content: [{ type: 'text', text: '用户已选择收货地址。接下来为用户展示地址卡片。' }],
      structuredContent: {
        hasAddress: true,
        address: {
          name: addr.name,
          phone: addr.phone,
          detail: addr.detail
        }
      },
      _meta: {}
    }
  } catch (err) {
    console.error('[getAddress] error', err)
    return {
      isError: true,
      content: [{ type: 'text', text: `获取地址失败：${err.message || '未知错误'}。` }]
    }
  }
}

module.exports = getAddressApi

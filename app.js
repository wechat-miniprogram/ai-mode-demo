App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    // 小微 handoff 缓存：以接力页实例 pageId 为 key，存放 { path, query, payload }
    agentHandoffs: {}
  },

  onLaunch() {
    console.log('[App] Launch')
    this.registerAgentHandoff()
    this.checkLoginStatus()
  },

  // 注册小微 AI Handoff 监听（须早于 handoff 触发的 onBeforeAppRoute）
  // 用户在小微对话中点击小程序卡片进入接力页时触发，每次进入 1 次
  registerAgentHandoff() {
    if (!wx.onAgentHandoff) {
      console.warn('[App] 当前基础库不支持 wx.onAgentHandoff，请使用支持小微 handoff 的版本')
      return
    }
    wx.onAgentHandoff(({ pageId, path, query, payload }) => {
      console.log('[App] onAgentHandoff', { pageId, path, query, payload })
      this.globalData.agentHandoffs = this.globalData.agentHandoffs || {}
      // 按 pageId 精确投递给目标接力页；query 为 string，payload 为可选预置数据
      this.globalData.agentHandoffs[pageId] = { path, query, payload }
    })
  },

  // 接力页取走 handoff（取后删除，避免重复消费）
  takeAgentHandoff(pageId) {
    const map = this.globalData.agentHandoffs || {}
    const handoff = map[pageId]
    if (handoff) delete map[pageId]
    return handoff || null
  },

  onShow() {
    console.log('[App] Show')
  },

  onHide() {
    console.log('[App] Hide')
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.openid) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
      console.log('[App] 用户已登录:', userInfo.openid)
    } else {
      this.silentLogin()
    }
  },

  // 静默登录
  silentLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          this.mockLogin(res.code)
        } else {
          console.error('[App] 登录失败:', res)
        }
      },
      fail: (err) => {
        console.error('[App] wx.login 失败:', err)
        // 兜底：使用本地 mock code
        this.mockLogin('local_' + Date.now())
      }
    })
  },

  // Mock 登录
  // 【仅演示】以下 openid/unionid 为本地伪造，仅用于跑通 demo 流程；
  // 生产环境必须用 wx.login 拿到的 code 换取服务端会话，切勿伪造用户标识。
  mockLogin(code) {
    const mockOpenid = `mock_${String(code).substring(0, 16)}_${Date.now()}`
    const userInfo = {
      openid: mockOpenid,
      unionid: `union_${mockOpenid}`,
      nickname: `用户${Math.floor(Math.random() * 10000)}`,
      avatarUrl: '',
      loginTime: new Date().toISOString()
    }

    wx.setStorageSync('userInfo', userInfo)
    this.globalData.userInfo = userInfo
    this.globalData.isLoggedIn = true

    console.log('[App] 静默登录成功:', mockOpenid)

    this.initUserData()
  },

  // 初始化用户数据（订单、地址空数据，商品目录由原子接口首次访问时注入）
  initUserData() {
    const openid = this.globalData.userInfo.openid
    const initialized = wx.getStorageSync(`initialized_${openid}`)
    if (initialized) return

    wx.setStorageSync(`address_${openid}`, null)
    wx.setStorageSync(`orders_${openid}`, [])
    wx.setStorageSync(`pending_order_${openid}`, null)
    wx.setStorageSync(`active_order_${openid}`, null)
    wx.setStorageSync(`initialized_${openid}`, true)

    console.log('[App] 用户业务数据初始化完成')
  },

  // 获取用户信息
  getUserInfo() {
    return this.globalData.userInfo
  },

  // 检查是否登录
  isLoggedIn() {
    return this.globalData.isLoggedIn
  }
})

App({
  globalData: {
    userInfo: null,
    isLoggedIn: false
  },

  onLaunch() {
    console.log('[App] Launch')
    this.checkLoginStatus()
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

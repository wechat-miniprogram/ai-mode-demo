Page({
  data: {
    name: '',
    phone: '',
    detail: '',
    canSubmit: false,
    headerPaddingTop: 36
  },

  onLoad() {
    // 获取半屏页面关闭按钮位置，让标题避开
    try {
      wx.getDetailPageCloseButtonBoundingClientRect({
        success: (rect) => {
          if (rect) {
            const btnBottom = (rect.top || 0) + (rect.height || 0)
            this.setData({
              headerPaddingTop: Math.max(btnBottom + 8, 36)
            })
          }
        },
        fail: (err) => {
          console.warn('[address-edit] getDetailPageCloseButtonBoundingClientRect fail', err)
        }
      })
    } catch (e) {
      console.warn('[address-edit] getDetailPageCloseButtonBoundingClientRect not available', e)
    }

    // 读取已有地址（按 openid 命名空间）
    const userInfo = wx.getStorageSync('userInfo')
    const openid = (userInfo && userInfo.openid) ? userInfo.openid : 'anonymous'
    const addr = wx.getStorageSync(`address_${openid}`) || null
    if (addr) {
      this.setData({
        name: addr.name || '',
        phone: addr.phone || '',
        detail: addr.detail || ''
      })
    }
    this._validate()
  },

  onInputName(e) {
    this.setData({ name: e.detail.value })
    this._validate()
  },
  onInputPhone(e) {
    this.setData({ phone: e.detail.value })
    this._validate()
  },
  onInputDetail(e) {
    this.setData({ detail: e.detail.value })
    this._validate()
  },

  _isValidPhone(phone) {
    return /^1\d{10}$/.test((phone || '').trim())
  },

  _validate() {
    const { name, phone, detail } = this.data
    const ok = !!name.trim() && this._isValidPhone(phone) && !!detail.trim()
    this.setData({ canSubmit: ok })
  },

  onTapSubmit() {
    const { name, phone, detail } = this.data
    if (!name.trim()) {
      wx.showToast({ title: '请填写收货人', icon: 'none' })
      return
    }
    if (!this._isValidPhone(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return
    }
    if (!detail.trim()) {
      wx.showToast({ title: '请填写详细地址', icon: 'none' })
      return
    }
    try {
      // 半屏页面中使用 getContext() 无参数形式（文档规范：Page 中不传 this）
      const ctx = wx.modelContext && wx.modelContext.getContext()
      if (ctx && ctx.sendFollowUpMessage) {
        ctx.sendFollowUpMessage({
          content: [
            { type: 'text', text: '保存地址 ' + name + ' ' + phone + ' ' + detail + '并继续下单' },
            {
              type: 'api/call',
              data: {
                name: 'saveAddress',
                arguments: {
                  name: name.trim(),
                  phone: phone.trim(),
                  detail: detail.trim()
                }
              }
            }
          ]
        })
        return
      }
    } catch (err) {
      console.warn('[address-edit] not in agent context', err)
    }
    wx.showToast({ title: '地址已保存（预览）', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 600)
  }
})

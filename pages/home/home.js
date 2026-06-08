Page({
  data: {},
  onLoad() {
    console.log('[home] onLoad')
  },
  onTapMoreDrinks() {
    wx.navigateTo({ url: '/packageDetail/pages/more-drinks' })
  },
  onTapSkuPicker() {
    // 美式 id=289
    wx.navigateTo({ url: '/packageDetail/pages/sku-picker?drinkId=289' })
  },
  onTapAddressEdit() {
    wx.navigateTo({ url: '/packageDetail/pages/address-edit' })
  }
})

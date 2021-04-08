const app = getApp()
Page({
  data: {
    flag: false,
  },
  onLoad() {
    let user = wx.getStorageSync('user')
    if (user) {
      this.setData({
        flag: true,
      })
    }
  },
  onShareAppMessage() {
    return {
      title: '自定义转发标题',
    }
  },
  bind(res) {
    const that = this
    wx.getUserProfile({
      desc: '用于完善头像和昵称',
      success: function (res) {
        console.log(res.userInfo);
        wx.setStorageSync('user', res.userInfo)
        wx.cloud.callFunction({
          name: 'inituser',
          data: {
            info: res.userInfo
          },
          success(res) {
            that.setData({
              flag: true,
            })
          },
          fail(e) {
            that.setData({
              flag: false,
            })
            wx.showModal({
              title: '网络错误',
              content: '设备网络服务出现异常，请稍后再试～',
              showCancel: false
            })
          }
        })
      },
      fail(e) {
        that.setData({
          flag: false,
        })
        wx.showModal({
          title: '提示',
          content: '为了保证消息来源可追溯，需要用户信息授权。本应用只用于展示，不用于任何其他地方～',
          showCancel: false
        })
      }
    })
  },
})

// miniprogram/pages/welcome/welcome.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hiddenButton: true
  },

  /**
   *从云端获取资料
   *如果没有获取到则尝试新建用户资料
   */
  onGotUserInfo: function(e) {
    var _this = this
    //需要用户同意授权获取自身相关信息
    if (e.detail.errMsg == "getUserInfo:ok") {
      //将授权结果写入app.js全局变量
      app.globalData.auth['scope.userInfo'] = true
      //尝试获取云端用户信息
      wx.cloud.callFunction({
        name: 'get_setUserInfo',
        data: {
          getSelf: true
        },
        success: res => {
          if (res.errMsg == "cloud.callFunction:ok")
            if (res.result) {
              //如果成功获取到
              //将获取到的用户资料写入app.js全局变量
              console.log(res)
              app.globalData.userInfo = res.result.data.userData
              app.globalData.userId = res.result.data._id
              wx.switchTab({
                url: '/pages/home/home'
              })
            } else {
              //未成功获取到用户信息
              //调用注册方法
              console.log("未注册")
              _this.register({
                nickName: e.detail.userInfo.nickName,
                gender: e.detail.userInfo.gender,
                avatarUrl: e.detail.userInfo.avatarUrl,
                region: ['none', 'none', 'none'],
                campus: "none",
                studentNumber: "none",
              })
            }
        },
        fail: err => {
          wx.showToast({
            title: '请检查网络您的状态',
            duration: 800,
            icon: 'none'
          })
          console.error("get_setUserInfo调用失败", err.errMsg)
        }
      })
    } else
      console.log("未授权")
  },

  /**
   * 注册用户信息
   */
  register: function(e) {
    let _this = this
    wx.cloud.callFunction({
      name: 'get_setUserInfo',
      data: {
        setSelf: false,
        userData: e
      },
      success: res => {
        if (res.errMsg == "cloud.callFunction:ok" && res.result) {
          _this.setData({
            hiddenButton: true
          })
          app.globalData.userInfo = e
          app.globalData.userId = res.result._id
          _this.data.registered = true
          app.getLoginState()
          console.log(res)
          wx.navigateTo({
            url: '/pages/mine/info/info'
          })
        } else {
          console.log("注册失败", res)
          wx.showToast({
            title: '请检查网络您的状态',
            duration: 800,
            icon: 'none'
          })
        }
      },
      fail: err => {
        wx.showToast({
          title: '请检查网络您的状态',
          duration: 800,
          icon: 'none'
        })
        console.error("get_setUserInfo调用失败", err.errMsg)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    let _this = this
    //需要用户同意授权获取自身相关信息
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          //将授权结果写入app.js全局变量
          app.globalData.auth['scope.userInfo'] = true
          //从云端获取用户资料
          wx.cloud.callFunction({
            name: 'get_setUserInfo',
            data: {
              getSelf: true
            },
            success: res => {
              if (res.errMsg == "cloud.callFunction:ok" && res.result) {
                //如果成功获取到
                //将获取到的用户资料写入app.js全局变量
                console.log(res)
                app.globalData.userInfo = res.result.data.userData
                app.globalData.userId = res.result.data._id
                wx.switchTab({
                  url: '/pages/home/home'
                })
              } else {
                _this.setData({
                  hiddenButton: false
                })
                console.log("未注册")
              }
            },
            fail: err => {
              _this.setData({
                hiddenButton: false
              })
              wx.showToast({
                title: '请检查网络您的状态',
                duration: 800,
                icon: 'none'
              })
              console.error("get_setUserInfo调用失败", err.errMsg)
            }
          })
        } else {
          _this.setData({
            hiddenButton: false
          })
          console.log("未授权")
        }
      },
      fail(err) {
        _this.setData({
          hiddenButton: false
        })
        wx.showToast({
          title: '请检查网络您的状态',
          duration: 800,
          icon: 'none'
        })
        console.error("wx.getSetting调用失败", err.errMsg)
      }
    })
  }
})
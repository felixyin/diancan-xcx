// pages/user/user.js
const api = require('../../api/index.js');
const util = require('../../utils/util.js');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    session_3rd: '',
    userInfo: '',
    baseUrl: app.globalData.baseUrl,
    showRight: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    app.getSession(function (session_3rd) {

      app.getUserMsg(session_3rd, function (res) {
        that.setData({
          session_3rd: session_3rd,
          userInfo: res.data.user
        })
      })

    });

  },
  bindGetUserInfo: function (e) {

    var that = this;
    var session_3rd = that.data.session_3rd;

    app.checkSettingStatu(e,function (user) {

      console.log(user);
      that.setData({
        userInfo: user
      })

    });

  },
  canLogin: function (res) {


    if (!wx.canIUse || !wx.canIUse('button.open-type.getUserInfo')) {

      wx.showModal({
        title: '微信版本太旧',
        content: '使用旧版本微信、将完美使用此小程序，请下载最新版本微信',
        showCancel: false
      })

    }

  },
  onShow:function(){

   
  }

})
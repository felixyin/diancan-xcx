// pages/wallet/wallet.js

const api = require('../../api/index.js');
const util = require('../../utils/util.js');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    session_3rd:'',
    baseUrl: app.globalData.baseUrl,
    user:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    app.getSession(function (session_3rd) {

       that.setData({
         session_3rd: session_3rd
       });

       that.getUserMsg();
    });
  },
  getUserMsg:function(){

    var that = this;

    wx.request({
      url: api.userMsg(),
      data: {
        session_3rd: that.data.session_3rd
      },
      success: function (res) {

        util.checkCode(res, function (res) {
          console.log(res);
          that.setData({
            user: res.data.user
          });
        });

      }
    });

  }


})
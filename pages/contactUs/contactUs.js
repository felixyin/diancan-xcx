// pages/aboutUs/aboutUs.js
const api = require('../../api/index.js');
const util = require('../../utils/util.js');
var WxParse = require('../wxParse/wxParse.js');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    session_3rd: '',
    baseUrl: app.globalData.baseUrl,
    article: '',
    title: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.getSession(function (session_3rd) {

      wx.request({
        url: api.contact(),
        data: {
          session_3rd: session_3rd
        },
        success: function (res) {
          util.checkCode(res, function (res) {

            that.setData({
              article: res.data.article,
              session_3rd: session_3rd,
              title: res.data.article.title
            });

            WxParse.wxParse('article', 'html', res.data.article.content, that, 5, that.data.baseUrl);

          });
        }
      })
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
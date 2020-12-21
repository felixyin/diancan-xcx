// pages/takeOut/tabkeOut.js
const api = require('../../api/index.js');
const util = require('../../utils/util.js');

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.baseUrl,
    session_3rd: '',
    tid:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.getSession(function (session_3rd) {

        wx.request({
          url: api.takeoutTables(),
          data:{
            session_3rd: session_3rd
          },
          success:function(res){

            console.log(res);
            
          }
        })

    });

  }
})
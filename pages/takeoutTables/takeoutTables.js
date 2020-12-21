// pages/takeoutTables/takeoutTables.js
const api = require('../../api/index.js');
const util = require('../../utils/util.js');

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    session_3rd: '',
    baseUrl: app.globalData.baseUrl,
    tables:{},
    appointment:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    var appointment = 0; //外卖
    if (options.appointment){
      appointment =1; //预约
    }
    
    app.getSession(function (session_3rd) {

        wx.request({
          url: api.takeoutTables(),
          data:{
            session_3rd: session_3rd,
            appointment: appointment
          },
          success:function(res){
            wx.hideLoading();

            if (res.statusCode == '404' || res.statusCode == '500' || res.statusCode == 404) {
              wx.redirectTo({
                url: '/pages/404/404',
              })
            }else{

              if(res.data.code == "10002") {
                console.log('拦截请求登录')
                var app = getApp();

                app.appLogin(function (session_3rd) {

                  console.log('重新刷新页面');
                  var str = '';
                  for (var i in options) {
                    str += i + '=' + options[i] + '&'
                  }
                  wx.reLaunch({
                    url: '/pages/takeoutTables/takeoutTables?' + str
                  });

                });

              } else if (res.data.code == '10001') {

                wx.showModal({
                  title: res.data.msg,
                  showCancel: false
                });

              }else{

                that.setData({
                  tables: res.data.tables
                });
                
                if (appointment){
                  wx.redirectTo({
                    url: '/pages/order/order?scene=' + that.data.tables.id + '&takeaway=takeaway&appointment=1',
                  });
                }else{
                  wx.redirectTo({
                    url: '/pages/order/order?scene=' + that.data.tables.id + '&takeaway=takeaway',
                  });
                }
                

              }

            }

          }
        });
    });

  }

})
// pages/orderMsg/orderMsg.js

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
    oid: '',
    orders: '',
    dishes_list: [],
    userInfo: {
      avatarUrl: '/image/user_icon.png',
      nickName: '昵称'
    },
    showRight:true,
    tables: {
      type: '',
      title: '',
      code: ''
    },
    tables_list:[],
    tableIndex:0,
    url:'', //判断是否来源个人中心 true 是
    see:'', //判断是否来源 加餐页面  true 
    shop:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    app.getSession(function (session_3rd, userInfo) {

      that.setData({
        session_3rd: session_3rd,
        oid: options.oid,
        userInfo: userInfo
      })

      if (options.url){
        that.setData({
          url: options.url
        })
      }

      if (options.see){
        that.setData({
          see: options.see
        })
      }

      that.getOrderMsg(function(){

        that.getShop();

      });

    })

  },
  getOrderMsg: function (cb, stopPull){

    var that = this;
    wx.request({
      url: api.orderMsg(),
      data: {
        id: that.data.oid,
        session_3rd: that.data.session_3rd
      },
      success: function (res) {

        util.checkCode(res, function (res) {

          that.setData({
            orders: res.data.orders,
            dishes_list: res.data.item_list,
            tables: res.data.tables
          })

          typeof cb == "function" && cb(res);

          if (stopPull) {
            wx.stopPullDownRefresh();
          }

        })
      }
    })

  },
  getShop: function () {

    var that = this;

    wx.request({
      url: api.shop(),
      data: {
        session_3rd: that.data.session_3rd
      },
      success: function (res) {
        util.checkCode(res, function (res) {
          that.setData({
            shop: res.data.shop
          });
        });
      }
    });

  },
  delOrder:function(){

      var that = this;

      wx.showModal({
        title: '确定删除订单吗？',
        success:function(res){
          if (res.confirm) {

            wx.request({
              url: api.delOrder(),
              data: {
                id: that.data.oid,
                session_3rd: that.data.session_3rd
              },
              success: function (res) {

                util.checkCode(res, function (res) {

                  wx.showToast({
                    title: '删除成功',
                    mask: true,
                    success: function (res) {
                      setTimeout(function () {

                        if(that.data.url){

                          wx.reLaunch({
                            url: '/pages/user/user'
                          })

                        }else{
                          wx.navigateBack({
                            delta: 1
                          })
                        }
                      }, 1800);
                    }
                  });

                })

              }
            })

          }
        }
      })
  },
  checkJiacan: function () {

    var that = this;

    if (that.data.see) {
      wx.navigateBack({
        delta: 1
      });

    } else {

      var scene = that.data.orders.tables_id;
      var oid = that.data.orders.id;

      wx.navigateTo({
        url: '/pages/order/order?scene=' + scene + '&oid=' + oid + '&orderMsg=orderMsg',
      });

    }

  },
  callTel: function (e) {

    var telPhone = e.currentTarget.dataset.tel;

    if (!telPhone) {
      wx.showToast({
        title: '暂时还没有填写电话',
        icon: 'none'
      });

      return false;
    }

    wx.showModal({
      title: '请拨打电话',
      content: '取消订单，需联系客服，点击确定将拨打电话' + telPhone,
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: telPhone
          });

        }
      }

    });

   

  },
  onPullDownRefresh: function () {

    this.getOrderMsg(null,true);

  }

})
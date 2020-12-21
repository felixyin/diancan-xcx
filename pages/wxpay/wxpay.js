// pages/wxpay/wxpay.js
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
    takeaway: '',
    accountPayCur:'cur',
    wxPayCur:'',
    oid:'',
    payMethod:0,// 0 余额支付 1 微信支付
    lock:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    var that = this;
    app.getSession(function (session_3rd) {

      that.setData({
        session_3rd: session_3rd,
        oid: options.oid
      });
      
      that.getOrderMsg(function(){

        that.getUserMsg();

      });

    }); 
  },
  toggleMethod:function(e){

      var method = parseInt(e.currentTarget.dataset.method);
      if (method==0){
        this.setData({
          accountPayCur:'cur',
          wxPayCur:'',
          payMethod:0
        });
      }else{
        this.setData({
          accountPayCur:'',
          wxPayCur:'cur',
          payMethod: 1
        });
      }
  },
  getOrderMsg: function (cb) {

    var that = this;
    wx.request({
      url: api.orderMsg(),
      data: {
        id: that.data.oid,
        session_3rd: that.data.session_3rd
      },
      success: function (res) {

        util.checkCode(res, function (res) {

          console.log(res);
          that.setData({
            orders: res.data.orders,
            dishes_list: res.data.item_list,
            tables: res.data.tables
          });

          typeof cb == "function" && cb(res);

        })
      }
    })

  },
  orderAccountPay:function(){
    var that = this;

    if(that.data.lock){
      return;
    }

    that.setData({
      lock:true
    })

    wx.request({
      url: api.accountPay(),
      data:{
        session_3rd: that.data.session_3rd,
        id:that.data.oid
      },
      success:function(res){
        util.checkCode(res,function(res){

          that.setData({
            lock:false
          })
    
          if (res.data.code == '10004'){

            wx.showModal({
              title:'余额不足',
              content: res.data.msg,
              cancelText:'微信支付',
              confirmText:'去充值',
              success:function(res){
                if (res.confirm) {

                  wx.navigateTo({
                    url: '/pages/recharge/recharge?url=wxpay',
                  });

                } else if (res.cancel) {

                  that.setData({
                    accountPayCur: '',
                    wxPayCur: 'cur',
                    payMethod: 1
                  });

                }
              }
            });

          }else{

            wx.showToast({
              title: '支付成功',
              icon:'success',
              success:function(){
                setTimeout(function () {

                  wx.switchTab({
                    url: '/pages/orderList/orderList'
                  });

                },1200);
              }
            });

          }

        },
        function(res){
          that.setData({
            lock:false
          })
    
          wx.showModal({
            title:'提示',
            content: res.data.msg,
            showCancel: false
          }) 

        });
      }
    })
  },
  orderWxPay:function(){

    var that = this;
    
    if(that.data.lock){
      return;
    }

    that.setData({
      lock:true
    })

    api.wxPay(that.data.session_3rd, that.data.oid, function (err, res) {

      that.setData({
        lock:false
      })

      if(err){

        wx.showModal({
          title: '支付失败',
          content: '到订单列表可继续支付',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '/pages/orderList/orderList'
              })
            }
          }
        });

      }else{

        wx.showToast({
          title: '支付成功',
          icon: 'success',
          success: function () {
            setTimeout(function () {

              wx.switchTab({
                url: '/pages/orderList/orderList'
              });

            }, 1200);
          }
        });
      }

    });
  },
  getUserMsg: function () {

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

  },
  orderDefault:function(){

    wx.showModal({
      title: '提示',
      content: '其他付款方式，请到吧台进行操作',
      showCancel: false
    });

  }


})
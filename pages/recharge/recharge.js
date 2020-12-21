// pages/recharge/recharge.js
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
    account:'',
    user_charge:'',
    url:'', //来源页面
    rule_list:[],
    lock:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    app.getSession(function (session_3rd) {
        
      if (options.url){
        that.setData({
          session_3rd: session_3rd,
          url: options.url
        });
      }else{
        that.setData({
          session_3rd: session_3rd
        });
      }

      wx.request({
        url: api.chargeRule(),
        data:{
          session_3rd: session_3rd
        },
        success:function(res){
          console.log(res);
          util.checkCode(res,function(res){

            if (res.data.code == '10005') {
              wx.showModal({
                title: '提示',
                content: '请先绑定手机号',
                showCancel: false,
                success: function (res) {

                  wx.redirectTo({
                    url: '/pages/mobile/mobile',
                  });

                }
              });
            }

            that.setData({
              rule_list: res.data.list
            });



          });
        }
      })

    });

  },
  chargeNum:function(e){
    this.setData({
      account: e.detail.value
    });
  },
  recharge:function(e){

    var that = this;

    var rid = e.currentTarget.dataset.id;

    console.log(e);

    if (!rid) {
      wx.showToast({
        title: '操作失败，请重试',
        image: '/image/tip.png'
      });

      return false;
    }

    if(that.data.lock){
      return;
    }

    that.setData({
      lock:true
    })
    

    wx.request({
      url: api.chargeCreate(),
      data:{
        session_3rd: that.data.session_3rd,
        rid: rid
      },
      success:function(res){
        util.checkCode(res, function (res) {
          
            api.chargeWxPay(that.data.session_3rd, res.data.user_charge.code,function(err,res){
               
               if (err){
                 console.log(err);
                 wx.showModal({
                   title: '提示',
                   content: '支付失败，请重试',
                   showCancel: false
                 });

                that.setData({
                  lock:false
                })

                 return false;
               }

               var pages = getCurrentPages();
               var prevPage = pages[pages.length - 2];//下一页

               wx.showToast({
                 title: res.data.msg,
                 mask: true,
                 success: function () {
                   setTimeout(function () {
                    
                     prevPage.getUserMsg();

                     that.setData({
                      lock:false
                    })

                     wx.navigateBack({
                       delta:1
                     });

                   }, 1200);
                 }
               });

            });
        },function(res){

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

  }

})
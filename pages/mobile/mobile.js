// pages/mobile/mobile.js
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
    mobile:'',
    name:'',
    lock:false,
    goback:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var that = this;
    app.getSession(function (session_3rd) {

        that.setData({
          session_3rd: session_3rd,
          goback:options.goback || ''
        });

    })
  },
  chargeNum: function (e) {
    this.setData({
      mobile: e.detail.value
    });
  },
  chargeName:function(e){

    this.setData({
      name: e.detail.value
    });

  },
  updateMobile:function(){
    var that = this;
    var mobile = that.data.mobile;
    var name = that.data.name;

    if (!name) {

      wx.showToast({
        title: '姓名不能为空',
        image: '/image/tip.png'
      });

      return false;
    }

    if (!mobile){

      wx.showToast({
        title: '号码不能为空',
        image: '/image/tip.png'
      });

      return false;
    }

    if (mobile.length!=11){
      wx.showToast({
        title: '手机号码格式不对',
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
      url: api.updateMobile(),
      data:{
        session_3rd: that.data.session_3rd,
        user_mobile: mobile,
        user_name:name
      },
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success:function(res){
        util.checkCode(res,function(){

            wx.showToast({
              title: '绑定成功',
              icon:'success',
              success:function(res){


                var time = setTimeout(function(){

                  if(that.data.goback){
                    wx.navigateBack({
                      delta:1
                    })
                  }else{
                    wx.redirectTo({
                      url: '/pages/recharge/recharge'
                    });
                  }  
                  clearTimeout(time);
                },1200);
              }
            })

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
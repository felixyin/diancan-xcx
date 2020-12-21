//app.js
var api = require('/api/index.js');
var util = require('/utils/util.js');
var config = require("/api/config.js");

//获取基础参数
var baseUrl = "";
var bcode = "";
config.getConfig(function (res) {
  console.log(res);
  baseUrl = res.wxUrl;
  bcode = res.bcode;
});

// //普通上传方式
// baseUrl= 'https://demo2.xiaodaofuli.com'
// bcode = "20070416045702731"


App({
  onLaunch: function () {

    var that = this;
    var userInfo = wx.getStorageSync('userInfo');

    if (userInfo) {
      that.globalData.userInfo = userInfo
    }
  },
  appLogin: function (cb) {
    var that = this;
    wx.login({
      success: function (res) {
        console.log(res)
        if (res.code) {
   
          //传递code 发送网络请求
          let obj = {
            code: res.code,
            bcode: that.globalData.bcode
          }

          wx.request({
            url: api.login(),
            data: obj,
            success: function (res) {
              console.log(res);
              if (res.data['session_3rd']) {

                wx.setStorageSync('session_3rd', res.data['session_3rd']);
                typeof cb == "function" && cb(res.data['session_3rd']);

              } else {

                wx.showModal({
                  title: res.data.msg,
                  showCancel: false
                });

              }

            }
          })

        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: function (res) {
        console.log(res)
      }
    
    });
  },
  checkSettingStatu: function (e, cb) {//获取用户信息 

    var that = this;
    if(!e){
      return false;
    }

    that.getSession(function (session_3rd) {

      if (e.detail.errMsg == 'getUserInfo:fail auth deny') {

        wx.showModal({
          title: '提示',
          content: '小程序需要获取你的用户头像和昵称用于登录，请重新授权',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {

            }
          }
        });

      } else {

        //同步会员信息
        that.userInform(session_3rd, e.detail, function (res) {

          console.log('存入缓存');
          console.log(res);

          wx.showToast({
            title: '授权成功',
          });

          wx.setStorageSync('userInfo', res.data.user);
          that.globalData.userInfo = res.data.user;

          typeof cb == "function" && cb(res.data.user);

        });
      }

    })
  },
  userInform: function (session_3rd, user, cb) {

    var that = this;
    var session_3rd = session_3rd;

    wx.request({
      url: api.userInform(),
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      data: {
        session_3rd: session_3rd,
        name: user.userInfo.nickName,
        img_url: user.userInfo.avatarUrl
      },
      success: function (res) {
        // console.log('同步完毕');
        util.checkCode(res, function () {

          that.getUserMsg(session_3rd, cb);

        })

      }
    })
  },
  getUserMsg: function (session_3rd, cb) {

    wx.request({
      url: api.userMsg(),
      data: {
        session_3rd: session_3rd
      },
      success: function (res) {
        util.checkCode(res, function () {
          typeof cb == "function" && cb(res);
        })
      }
    })

  },
  getSession: function (cb) {
    
    var that = this;
    var session_3rd = wx.getStorageSync('session_3rd');
    if (session_3rd) {
      typeof cb == "function" && cb(session_3rd);
    } else {
      console.log('getSession 登录');
      //调用登录接口
      that.appLogin(cb);
    }

  },
  globalData: {
    userInfo: null,
    baseUrl: baseUrl,
    bcode: bcode,
    keyMap: config.keyMap,
    v:'1.0.8'
  }
})


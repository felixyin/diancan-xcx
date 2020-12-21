// pages/paidui/jieguo/jieguo.js
const api = require('../../../api/index.js');
const util = require('../../../utils/util.js');
const app = getApp();


Page({
  data: {
    session_3rd:'',
    baseUrl: app.globalData.baseUrl,
    paidui:'',
    lock:false
  },
  onLoad: function (options) {

    let that = this;

    app.getSession((session_3rd)=>{
      this.setData({
        session_3rd:session_3rd
      })

      that.getShop(function(){
        that.apiPaiduiUser();
      })
      
    })

  },
  async apiPaiduiDeleted(){

    let that = this;

    wx.showModal({
      title:"提示",
      content:"确定要取消排队吗？",
      success:async function(res){
        if(res.confirm){

          let obj = {
            session_3rd:that.data.session_3rd,
            id:that.data.paidui.id
          }

          await api.apiPaiduiDeleted(obj)

          wx.showToast({
            title: '操作成功',
            success:function(){

              setTimeout(function(){

                wx.redirectTo({
                  url: '/pages/paidui/faqi/faqi',
                })

              },800)

            }
          })


        }
      }
    })
    
  },
  async apiPaiduiUser(){

    let res = await api.apiPaiduiUser({
      session_3rd:this.data.session_3rd
    })
    
    this.setData({
      paidui:res.data.paidui
    })
  },
  getShop:function(cb){

    var that = this;

    wx.request({
      url: api.shop(),
      data: {
        session_3rd: that.data.session_3rd
      },
      success: function (res) {
        util.checkCode(res, function (res) {

          that.setData({
            shop: res.data.shop,
            business:res.data.business
          });

          typeof cb == "function" && cb();

        });

      }
    });
      
  },
  onPullDownRefresh:function(){

    if(this.data.paidui){
      this.onLoad();
      wx.stopPullDownRefresh()
    }

  }



})
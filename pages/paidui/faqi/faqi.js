// pages/paidui/faqi/faqi.js
const api = require('../../../api/index.js');
const util = require('../../../utils/util.js');
const app = getApp();


Page({
  data: {
    session_3rd:'',
    baseUrl: app.globalData.baseUrl,
    list:[],
    lock:false,
    curId:'',//选中的ID
  },
  onLoad: function (options) {

    let that = this;

    app.getSession((session_3rd)=>{
      this.setData({
        session_3rd:session_3rd
      })
      
      that.getShop(function(){
        that.apiPaidui();
      })
     
    })

  },
  async apiPaiduiSave(){

    let that = this;

    let obj = {
      session_3rd:that.data.session_3rd,
      id:that.data.curId
    }

    if(!that.data.curId){
      wx.showToast({
        title: '请先选择就餐人数',
        icon:"none"
      })
      return;
    }

    if(that.data.lock){
      return;
    }


    that.setData({
      lock:true
    })

    try {
      let res = await api.apiPaiduiSave(obj)
      
      that.requestSubscribeMessage(function(){

        wx.showToast({
          title: '操作成功',
          success:function(){
  
            setTimeout(function(){
  
              wx.redirectTo({
                url: '/pages/paidui/jieguo/jieguo'
              })
  
            },800)
  
          }
        })

      });

    } catch (res) {
      
      that.setData({
        lock:false
      })

      wx.showModal({
        title:'提示',
        content: res.data.msg,
        showCancel: false
      })

    }
    
  },
  requestSubscribeMessage(cb){ //申请订阅消息

    let that = this;
    let template_id_paidui = that.data.business.template_id_paidui || '';

    if(!template_id_paidui){
      typeof cb == "function" && cb()
      return;
    }

    wx.requestSubscribeMessage({
      tmplIds: [template_id_paidui],
      success (res) { 
        console.log(res);
        typeof cb == "function" && cb()
      },
      fail:function(res){
        console.log(res)
        typeof cb == "function" && cb()
      }
    })

  },
  chooseItemFunc(e){

    console.log(e);
    let id = e.currentTarget.dataset.id;
    this.setData({
      curId:id
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
  async apiPaidui(){

    let obj = {
      session_3rd:this.data.session_3rd
    }

    let res = await api.apiPaidui(obj);

    this.setData({
      list:res.data.list
    })

  }
})
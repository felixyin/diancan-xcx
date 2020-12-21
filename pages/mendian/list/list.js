// pages/mendian/list/list.js
const api = require('../../../api/index.js');
const util = require('../../../utils/util.js');

const app = getApp();

Page({
  data: {
    baseUrl: app.globalData.baseUrl,
    list:[],
    lock:false,
  },
  onLoad: function (options) {
    app.getSession((session_3rd)=>{
      this.setData({
        session_3rd:session_3rd
      })
      this.apiList();
    })
  },
  apiList(){

    let that = this;
    let obj = {
      session_3rd:that.data.session_3rd
    }

    api.apiList(obj,(res)=>{

      this.setData({
        list:res.data.list
      })

    })

  },
  apiBind(e){

    console.log(e);
    let that = this;
    let id = e.currentTarget.dataset.id;

    let obj = {
      id:id,
      session_3rd:that.data.session_3rd
    }

    if(this.data.lock){
      return;
    }

    this.setData({
      lock:true
    })

    api.apiBind(obj,(res)=>{

      wx.showToast({
        title: '绑定成功',
        success:function(){
          setTimeout(function(){

            wx.navigateBack({
              delta:1
            })

          },800)
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

    })

  }
})
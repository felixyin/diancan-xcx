//index.js
//获取应用实例
const api = require('../../api/index.js');
const util = require('../../utils/util.js');

const app = getApp();
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');

// tableware_price  餐具费
// takeaway_distance  配送范围 
// takeaway_moq  外卖起送费
// takeaway_price  配送费  

Page({
  data: {
    session_3rd: '',
    shop:{
      title:'店铺名称',
      area_msg: '店铺',
      address:'地址',
      work_time:'营业时间',
      telephone:'电话'
    },
    dishes_list:[],
    userInfo: {
      avatarUrl:'/image/user_icon.png',
      nickName:'昵称'
    },
    showRight: false,
    baseUrl: app.globalData.baseUrl,
    carousel_list:[],
    commentList:[],
    totalRow:0,
    support:'',
    coupon_list:[],
    paidui:'',
    yuyuezhuowei:''
  },
  onLoad: function () {

  },
  onShow(stopFull){
    
    var that = this;
    app.getSession(function (session_3rd) {
      app.getUserMsg(session_3rd, function (res) {

        that.setData({
          session_3rd: session_3rd,
          userInfo: res.data.user
        });

        if(!that.data.userInfo.shop_id){
          wx.navigateTo({
            url: '/pages/mendian/list/list',
          })
          return;
        }

        that.getShop(async function(){
       
          that.apiCarousel();
          that.getCoupon();
          that.shopComment();
          
          //发起排队
          let res = await api.apiPaiduiUser({
            session_3rd:that.data.session_3rd
          })

          that.setData({
            paidui:res.data.paidui || ''
          })
          
          //预约桌位
          let resYuyue = await api.apiYuyuezhuoweiUser({
            session_3rd:that.data.session_3rd
          })

          that.setData({
            yuyuezhuowei:resYuyue.data.yuyuezhuowei || ''
          })

          if(stopFull){
            wx.stopPullDownRefresh();
          }
          
        });

      })
    })

  },
  async apiCarousel(){

    let that = this;
    let obj = {
      session_3rd:that.data.session_3rd
    }

    let res = await api.apiCarousel(obj);
    that.setData({
      carousel_list:res.data.list
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

          wx.setNavigationBarTitle({
            title: that.data.shop.title
          });

    
          typeof cb == "function" && cb();

        });

      }
    });
      
  },
  async getCoupon(){

    var that = this;

    let obj = {
      session_3rd: that.data.session_3rd
    }

    let res = await api.apiCoupon(obj)

    that.setData({
      coupon_list: res.data.list
    });
  },
  shopComment:function(){

    var that = this;
    var data = {
      session_3rd: that.data.session_3rd
    }

    api.shopCommentList(data,function(res){

      that.setData({
        commentList: res.data.results.list,
        totalRow: res.data.results.totalRow
      });

    });

  },
  showCommentImg: function (event) {
    var that = this;
    var commentImgList = event.currentTarget.dataset.list;
    var commentImgListNew = [];

    commentImgList.forEach(function (item) {
      item = util.imageFilter(item,that.data.baseUrl);
      commentImgListNew.push(item)
    });

    wx.previewImage({
      current: event.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: commentImgListNew // 需要预览的图片http链接列表
    })
  },
  takeawayNone:function(){

      wx.showToast({
        title: '外卖没有开放',
        icon:"none"
      });

  },
  sharePeople:function(){
    
  },
  scanning:function(e){

    var that = this;
    wx.scanCode({
      success: (res) => {
        console.log(res);
        if (res.errMsg == 'scanCode:ok'&& res.path){
          var path = res.path;
          var tid = path.split('=')[1];
          console.log(tid);
          wx.navigateTo({
            url: "/" + path
          });

        }else{
          wx.showModal({
            title: '内容不识别，请重新扫描',
            showCancel: false
          })
        }
      }
    })
  },
  callTel:function(e){
    
    var telPhone = e.currentTarget.dataset.tel;

    if (!telPhone){
      wx.showToast({
        title: '暂时还没有填写电话',
        icon:'none'
      });

      return false;
    }

    wx.makePhoneCall({
      phoneNumber: telPhone 
    });

  },
  navigationMap:function(e){

    var that = this;
    var latitude = parseFloat(that.data.shop.lat);
    var longitude = parseFloat(that.data.shop.lng);

    if (!latitude || !longitude){

      wx.showToast({
        title: '店铺导航还没有设置',
        icon:'none'
      });

    }else{

      wx.openLocation({
        name: that.data.shop.title,
        address: that.data.shop.area_msg + that.data.shop.address,
        latitude: latitude,
        longitude: longitude,
        scale: 10
      });

    }
   
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {

  },
  onPullDownRefresh:function(){

    if(this.data.carousel_list.length>0){
      this.onShow(true);
    }
    
  }
})

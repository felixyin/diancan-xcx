// pages/orderList/orderList.js

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
    pageSize:20,
    page:1,
    hasMoreData: false,
    Inx:0,
    status:'all',
    orderList:[],
    tab: [
      {
        name: '全部',
        status: 'all'
      },
      {
        name: '未付款',
        status: 0
      },
      {
        name: '已付款',
        status: 1
      },
      {
        name: '配送中',
        status: 2
      },
      {
        name: '已完成',
        status: 9
      }
    ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;

    if (options.status) {

      that.setData({
        status: options.status,
        Inx: parseInt(options.inx)
      })

    }

  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {

    var that = this;
    app.getSession(function (session_3rd) {

      that.setData({
        session_3rd: session_3rd,
        page: 1
      })

      that.getOrderList();

    });

    
  },
  changeTab: function (event) {
    var that = this;
    that.setData({
      Inx: event.currentTarget.dataset.index,
      status: event.currentTarget.dataset.status,
      page: 1
    });
    that.getOrderList();
  },
  getOrderList: function () {

    var that = this;
    wx.showLoading({
      title: "正在加载"
    });

    var data = {
      session_3rd: that.data.session_3rd,
      p: that.data.page,
      rows: that.data.pageSize
    }

    if (that.data.status != 'all') {
      data.status = that.data.status
    }

    api.myOrdersList(data, function (res) {

      var orderListTem = that.data.orderList;
      if (that.data.page == 1) {
        orderListTem = [];
      }

      var orderList = res.data.results.list;
      
      console.log(res);
      if (orderList.length < that.data.pageSize) {

        that.setData({
          orderList: orderListTem.concat(orderList),
          hasMoreData: false
        });

      } else {
        that.setData({
          orderList: orderListTem.concat(orderList),
          hasMoreData: true,
          page: that.data.page + 1
        });
      }

      //隐藏加载
      wx.hideToast();

    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    if (this.data.hasMoreData) {
      this.getOrderList();
    }
    
  },
  onPullDownRefresh:function(){

    if(this.data.session_3rd && this.data.orderList.length>0){
      
      this.setData({
        page:1,
        hasMoreData:false
      })

      this.getOrderList();
      wx.stopPullDownRefresh();
    }

  }
})
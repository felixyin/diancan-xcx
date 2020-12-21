// pages/createOrderMsg/createOrderMsg.js
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
    remark:'',
    remarkFlage:'',
    user_number:'1人',
    userList:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
    user_number_index:0,
    scene:'',
    subtotal:'',
    subtotal_coupon:0,
    tables:'',
    shopping_cart:[],
    tableware_price:'',
    showGrand_total:'',
    takeaway_price:'',
    popupShow:false,
    take_name:'',
    take_mobile:'',
    take_address:'',
    take_date:'',//配送时间
    showRight:'showRight',
    peisongCur:'cur',//配送
    zitiCur:'',//自提
    take_own:0,//配送
    takeaway:'',//是否为外卖订单
    takeaway_distribution_status: '',//外卖配送
    takeaway_own_status: '', //外卖自提
    appointment:'',
    lock:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this;
    if (options.takeaway) {

      that.setData({
        takeaway: 'takeaway'
      });

      var take_name = wx.getStorageSync('take_name');
      var take_mobile = wx.getStorageSync('take_mobile');
      var take_address = wx.getStorageSync('take_address');

      if (take_name) {
        that.setData({
          take_name: take_name,
          take_mobile: take_mobile
        });
      }
      if (take_address){
        that.setData({
          take_address: take_address
        });
      }

      if (options.appointment){

        that.setData({
          appointment: options.appointment
        })

      }   

    }
    app.getSession(function (session_3rd) {

      that.setData({
        session_3rd: session_3rd,
        scene: options.scene
      });

      // 购物车列表
      that.getCart(function(){

        //获取店铺信息 
        wx.request({
          url: api.shop(),
          data:{
            session_3rd: that.data.session_3rd
          },
          success:function(res){
            util.checkCode(res, function (res) {
              that.setData({
                takeaway_distribution_status: res.data.shop.takeaway_distribution_status,
                takeaway_own_status: res.data.shop.takeaway_own_status
              });
            });
          }
        })

      });

    });
  },
  getCart: function (cb) {

    var that = this;

    wx: wx.request({
      url: api.getCart(),
      data: {
        tid: that.data.scene,
        session_3rd: that.data.session_3rd,
        oid: that.data.oid
      },
      success: function (res) {
        util.checkCode(res, function (res) {

          that.setData({
            subtotal: res.data.subtotal,//商品小计
            subtotal_coupon: res.data.subtotal_coupon,
            tables: res.data.tables,
            shopping_cart: res.data.shopping_cart,
            tableware_price: res.data.tableware_price,
            coupon_saving: res.data.coupon_saving,
            coupon_title: res.data.coupon_title
          });

          // 并且当前选择是外卖
          if (that.data.takeaway) {

            if (that.data.appointment){ //预约订单
              that.setData({
                showGrand_total: res.data.subtotal_coupon
              });
            }else{ //外卖订单

              if (that.data.take_own == 0) { //配送

                that.setData({
                  showGrand_total: util.numAdd(res.data.subtotal_coupon, res.data.takeaway_price),
                  takeaway_price: res.data.takeaway_price
                });

              } else { //自提

                that.setData({
                  showGrand_total: res.data.subtotal_coupon
                });

              }
            }

           
          }else{ //普通订单
            var tablePrice = res.data.tables.price;
            var subtotal_coupon = res.data.subtotal_coupon;
            that.setData({
              showGrand_total: util.numAdd(subtotal_coupon, tablePrice)
            });
          }

          that.changeUserNumber({
            detail:{
              value:that.data.user_number_index
            }
          })
          
          if (typeof cb == "function") {
            cb(res);
          }

        });
      }
    })

  },
  changeUserNumber:function(e){
    
    var that = this;
    that.setData({
      user_number: parseInt(e.detail.value) + 1 + '人',
      user_number_index: parseInt(e.detail.value)
    });

    if (that.data.user_number){
      
      var tableware_price = util.numMulti(that.data.user_number_index + 1, that.data.tableware_price);

      if (that.data.takeaway && that.data.appointment==0){ //外卖

        if (that.data.take_own == 0){ //配送

        } else if (that.data.take_own == 1 ){ //自提

        }
      
      }else{ //非外卖 +预约

        var tablePrice = that.data.tables.price;
        var showGrand_total = util.numAdd(that.data.subtotal_coupon, tableware_price);
        showGrand_total = util.numAdd(showGrand_total, tablePrice);
        
        that.setData({
          showGrand_total: showGrand_total
        });

      }
      
    }

  },
  bindKeyInput:function(e){

    var key = e.currentTarget.dataset.key;
    var val = e.detail.value;
    var keyData = new Object();
    keyData[key] = val;
    this.setData(keyData);

  },
  hidePopup: function () {

    this.setData({
      popupShow: false
    });

  },
  showPopup:function(){
    
    this.setData({
      popupShow: true
    });

  },
  add_remark:function(){
    
    var that =this;

    that.setData({
      remark: that.data.remarkFlage,
      popupShow:false
    });

  },
  updateAddress:function(){

    var that = this;

    if (that.data.appointment){
      
      wx.navigateTo({
        url: '/pages/address/address?url=address&take_name=' + that.data.take_name + '&take_mobile=' + that.data.take_mobile + '&take_date=' + that.data.take_date + '&appointment=' + that.data.appointment
      });

    }else{

      if (that.data.take_own == 0) {//配送
        wx.navigateTo({
          url: '/pages/address/address?url=address&take_name=' + that.data.take_name + '&take_mobile=' + that.data.take_mobile + '&take_address=' + that.data.take_address + '&take_own=' + that.data.take_own,
        });
      } else { //自提
        wx.navigateTo({
          url: '/pages/address/address?url=date&take_name=' + that.data.take_name + '&take_mobile=' + that.data.take_mobile + '&take_date=' + that.data.take_date + '&take_own=' + that.data.take_own
        });
      }

    }

  },
  toggleTakeOwn:function(e){

    var take_own = parseInt(e.currentTarget.dataset.method);
    var that = this;
    var session_3rd = that.data.session_3rd;

    if (take_own == 0) { //配送

      that.setData({
        take_own: take_own,
        zitiCur: '',
        peisongCur: 'cur',
        appointmentCur: '',
        showGrand_total: util.numAdd(that.data.subtotal_coupon, that.data.takeaway_price)
      });

    } else if (take_own == 1){ //自提

      that.setData({
        take_own: take_own,
        zitiCur: 'cur',
        peisongCur: '',
        appointmentCur:'',
        showGrand_total: that.data.subtotal_coupon
      });
      
    }

  },
  createTakeaWayOrder:function(){ //创建外卖订单

    var that = this;
    var dataObj = {};
    dataObj.session_3rd = that.data.session_3rd;
    dataObj.tid = that.data.scene;
    dataObj.remark = that.data.remark;
    dataObj.user_number = that.data.user_number;

    if (!dataObj.user_number) {
      wx.showToast({
        title: '请填写用餐人数',
        icon: 'none'
      });
      return false;
    }

    //预约订单
    if (that.data.appointment){
        
      dataObj.take_name = that.data.take_name;
      dataObj.take_mobile = that.data.take_mobile;
      dataObj.take_date = that.data.take_date;
      dataObj.appointment = that.data.appointment;
      
      if (!dataObj.take_date) {
        wx.showToast({
          title: '请填写预约时间',
          icon: 'none'
        });
        return false;
      }

    //外卖订单
    }else{

      dataObj.take_own = that.data.take_own;

      if (dataObj.take_own == null) {
        wx.showToast({
          title: '请先选择配送方式',
          icon: 'none'
        });
        return false;
      }

      if (dataObj.take_own == 0) { //配送

        dataObj.take_name = that.data.take_name;
        dataObj.take_mobile = that.data.take_mobile;
        dataObj.take_address = that.data.take_address;

        if (!dataObj.take_address) {
          wx.showToast({
            title: '请填写地址',
            icon: 'none'
          });
          return false;
        }

      } else if (dataObj.take_own == 1){ //自提

        dataObj.take_name = that.data.take_name;
        dataObj.take_mobile = that.data.take_mobile;
        dataObj.take_date = that.data.take_date;

        if (!dataObj.take_date) {
          wx.showToast({
            title: '请填写自提时间',
            icon: 'none'
          });
          return false;
        }

      }
    }

    dataObj.user_number = that.data.user_number_index + 1;

    if(that.data.lock){
      return;
    }

    that.setData({
      lock:true
    })

    wx.request({
      url: api.createTakeaway(),
      data: dataObj,
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        util.checkCode(res, function (res) {

          that.setData({
            lock:false
          })
      
          wx.showToast({
            title: res.data.msg,
            mask: true,
            success: function () {
              setTimeout(function () {

                
                wx.redirectTo({
                  url: '/pages/wxpay/wxpay?oid=' + res.data.oid,
                });

              }, 1200);
              
            }
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

  },
  createOrder: function () { //创建点餐订单

    var that = this;

    var dataObj = {};
    dataObj.session_3rd = that.data.session_3rd;
    dataObj.tid = that.data.scene;
    dataObj.remark = that.data.remark;
    dataObj.user_number = that.data.user_number;
    
    if (!dataObj.user_number) {
      wx.showToast({
        title: '请填写用餐人数',
        image: '../../image/tip.png'
      });
      return false;
    }

    dataObj.user_number =  that.data.user_number_index + 1;

    if(that.data.lock){
      return;
    }

    that.setData({
      lock:true
    })


    wx.request({
      url: api.orderCreate(),
      data: dataObj,
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded"},
      success: function (res) {
        util.checkCode(res, function (res) {

          console.log(res);
          wx.showToast({
            title: res.data.msg,
            mask: true,
            success: function () {
              setTimeout(function () {

               wx.redirectTo({
                 url: '/pages/wxpay/wxpay?oid=' + res.data.oid,
               });

              }, 1200);
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

  }

})
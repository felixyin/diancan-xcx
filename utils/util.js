
function formatTime(date,all) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  if(all){
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }else{
    return [year, month, day].map(formatNumber).join('-')
  }
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function isEmptyObject(e) {
  var name;
  for (name in e) {
    return false;
  }
  return true;
}

//拦截请求
function checkCode(res, cb, err, linkERrr, goErr) { //linkERrr 10003  err 1001  goErr 10000
  wx.hideLoading();
  if (res.statusCode == '404' || res.statusCode == '500' || res.statusCode == 404) {
    wx.redirectTo({
      url: '/pages/404/404',
    })
  } else {
    if (res.data.code == "10002") {
      console.log('拦截请求登录');

      if (goErr){
        
        typeof goErr == "function" && goErr(res);

      }else{

        var app = getApp();
        app.appLogin(function () {

          console.log('页面重定向首页');
          wx.reLaunch({
            url: '/pages/index/index'
          });
          
        });

      }

    } 

    else if (res.data.code == '10007') {

      wx.showModal({
        title:'提示',
        content:'您还未选择门店，请前往选择',
        showCancel: false,
        success:function(){
          wx.navigateTo({
            url: '/pages/mendian/list/list',
          })
        }
      })
      
    }
    
    else if (res.data.code == '10001') {

      if (err) {
        typeof err == "function" && err(res);
      } else {
        wx.showModal({
          title:'提示',
          content: res.data.msg,
          showCancel: false
        })
      }
    } else if (res.data.code == '10003') {
      console.log(res);
      typeof linkERrr == "function" && linkERrr(res);
      
    }
    else {
      typeof cb == "function" && cb(res);
    }
  }

}

var animation = wx.createAnimation({
  duration: 400,
  timingFunction: "ease",
  delay: 0
});
var opacityAnimation = wx.createAnimation({
  duration: 400,
  delay: 100
});

// 筛选优惠券
function returnCouponObj(arr) {

  var obj = new Object();
  obj.notUsed = [];
  obj.used = [];
  obj.expired = [];
  if (arr.length > 0) {

    arr.forEach(function (item) {
      if (item.user_coupon_status == 1) {
        obj.notUsed.push(item);
      } else if (item.user_coupon_status == 0) {
        obj.used.push(item);
      } else {
        obj.expired.push(item);
      }
    });

  }
  return obj;
}

function numAdd(arg1, arg2) {
  var r1, r2, m, c;
  try {
    r1 = arg1.toString().split(".")[1].length;
  }
  catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split(".")[1].length;
  }
  catch (e) {
    r2 = 0;
  }
  c = Math.abs(r1 - r2);
  m = Math.pow(10, Math.max(r1, r2));
  if (c > 0) {
    var cm = Math.pow(10, c);
    if (r1 > r2) {
      arg1 = Number(arg1.toString().replace(".", ""));
      arg2 = Number(arg2.toString().replace(".", "")) * cm;
    } else {
      arg1 = Number(arg1.toString().replace(".", "")) * cm;
      arg2 = Number(arg2.toString().replace(".", ""));
    }
  } else {
    arg1 = Number(arg1.toString().replace(".", ""));
    arg2 = Number(arg2.toString().replace(".", ""));
  }
  return (arg1 + arg2) / m;
};
/**
 * 减法运算，避免数据相减小数点后产生多位数和计算精度损失。
 * 
 * @param num1被减数  |  num2减数
 */
function numSub(num1, num2) {
  var baseNum, baseNum1, baseNum2;
  var precision;// 精度
  try {
    baseNum1 = num1.toString().split(".")[1].length;
  } catch (e) {
    baseNum1 = 0;
  }
  try {
    baseNum2 = num2.toString().split(".")[1].length;
  } catch (e) {
    baseNum2 = 0;
  }
  baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
  precision = (baseNum1 >= baseNum2) ? baseNum1 : baseNum2;
  return ((num1 * baseNum - num2 * baseNum) / baseNum).toFixed(precision);
};
/**
 * 乘法运算，避免数据相乘小数点后产生多位数和计算精度损失。
 * 
 * @param num1被乘数 | num2乘数
 */
function numMulti(num1, num2) {
  var baseNum = 0;
  try {
    baseNum += num1.toString().split(".")[1].length;
  } catch (e) {
  }
  try {
    baseNum += num2.toString().split(".")[1].length;
  } catch (e) {
  }
  return Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", "")) / Math.pow(10, baseNum);
};
/**
 * 除法运算，避免数据相除小数点后产生多位数和计算精度损失。
 * 
 * @param num1被除数 | num2除数
 */
function numDiv(num1, num2) {
  var baseNum1 = 0, baseNum2 = 0;
  var baseNum3, baseNum4;
  try {
    baseNum1 = num1.toString().split(".")[1].length;
  } catch (e) {
    baseNum1 = 0;
  }
  try {
    baseNum2 = num2.toString().split(".")[1].length;
  } catch (e) {
    baseNum2 = 0;
  }

  baseNum3 = Math.Number(num1.toString().replace(".", ""));
  baseNum4 = Math.Number(num2.toString().replace(".", ""));

  return (baseNum3 / baseNum4) * pow(10, baseNum2 - baseNum1);

};

//把同一类的筛选成数组
function getTypeObj(arr){
  
    var obj = {};
    var i ;
    if(arr.length>0){

      arr.forEach(function(item){

        if (obj[item.type_title]){
          obj[item.type_title].push(item);
        }else{
          obj[item.type_title] = [];
          obj[item.type_title].push(item);
        }

      })

      return obj;
    }
}




function imageFilter(src, baseUrl){
  var patt = new RegExp('http');
  if (patt.test(src)) {
    return src;
  } else {
    return baseUrl + src;
  }
}



module.exports = {
  imageFilter,
  formatTime: formatTime,
  isEmptyObject: isEmptyObject,
  checkCode: checkCode,
  animation: animation,
  opacityAnimation: opacityAnimation,
  returnCouponObj: returnCouponObj,
  numAdd: numAdd,
  numSub: numSub,
  numMulti: numMulti,
  numDiv: numDiv,
  getTypeObj: getTypeObj
}

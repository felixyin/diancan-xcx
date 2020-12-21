//腾讯地图key
const keyMap = 'D2YBZ-JHF3D-WPU4N-PVHS6-FDPCQ-PBFDL';


// "extAppid": "wx4732a31b2b29b82a",
// "wxUrl": "https://www.wukongdiancan.com",
// "sCode": "18031314593308978"

function getConfig(cb) {

  if (wx.getExtConfigSync) {

    let extConfig = wx.getExtConfigSync();
    // let extConfig ={
    //   wxUrl:'http://139.129.227.83:8095',
    //   bcode:"20070416045702731"
    // }

    typeof cb == "function" && cb(extConfig);

  } else {

    wx.showModal({
      title: '提示',
      content: '基础配置获取失败',
    });

    return false;
  }


}


//17110311594354681
module.exports = {
  keyMap: keyMap,
  getConfig: getConfig
}




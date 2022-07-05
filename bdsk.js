//可以看成是c#中的using Java中的import
const { state } = require('bleno')
var bleno = require('bleno')
//本段代码含义这是一个event当蓝牙ble通电时，响应事件执行广播。
bleno.on('stateChange',function(state){
    console.log("on ->stateChange: " +state);

    if (state == "poweredOn"){
        bleno.startAdvertising("翔哥哥device",['1803']);
    }else{
        bleno.stopAdvertising();
    }
});
//可以看成是c#中的using Java中的import
const { state } = require('bleno')
var bleno = require('bleno')
//本段代码含义这是一个event当蓝牙ble通电时，响应事件执行广播。
bleno.on('stateChange',function(state){
    console.log("on ->stateChange: " +state);

    if (state == "poweredOn"){
        bleno.startAdvertising("XiangGeGe",['1803']);
    }else{
        bleno.stopAdvertising();
    }
});

bleno.on("advertisingStart",function(error){
 console.log("on ->  advertisingStart:"+(error?"error"+error : 'success'));
 if(!error){
    bleno.setServices([
        //  link loss service
        new bleno.PrimaryService({
            uuid: '1803',
            characteristics: [
                // Alert Level
                new bleno.Characteristic({
                    value: 0,
                    uuid: '2A06',
                    properties: ['read', 'write'],
                    onReadRequest: function (offset, callback) {
                        console.log('link loss.alert level READ:');
                        data = [0x00];
                        data[0] = link_loss_alert_level;
                        var octets = new Uint8Array(data);
                        console.log(octets);
                        callback(this.RESULT_SUCCESS, octets);
                    },
                    onWriteRequest: function (data, offset, withoutResponse, callback) {
                        console.log("link loss.alert level WRITE:");
                        this.value = data;
                        var octets = new Uint8Array(data);
                        console.log("0x" + u8AToHexString(octets).toUpperCase());
                        // application logic for handling WRITE or WRITE_WITHOUT_RESPONSE on characteristic Link Loss Alert Level goes here
                        link_loss_alert_level = octets[0];
                        var led = getLed(link_loss_alert_level);
                        allLedsOff();
                        startFlashing(led, 250, 4);
                        callback(this.RESULT_SUCCESS);
                    }
                })
            ]
        }),
        //  immediate alert service
        new bleno.PrimaryService({
            uuid: '1802',
            characteristics: [
                // Alert Level
                new bleno.Characteristic({
                    value: 0,
                    uuid: '2A06',
                    properties: ['writeWithoutResponse'],
                    onWriteRequest: function (data, offset, withoutResponse, callback) {
                        console.log("immediate alert.alert level WRITE:");
                        this.value = data;
                        var octets = new Uint8Array(data);
                        console.log("0x" + u8AToHexString(octets).toUpperCase());
                        immediate_alert_level = octets[0];
                        flash_count = (immediate_alert_level + 3) * 2;
                        startBeepingAndflashingAll(250, immediate_alert_level);
                        callback(this.RESULT_SUCCESS);
                    }
                })
            ]
        }),
        //  TX power service
        new bleno.PrimaryService({
            uuid: '1804',
            characteristics: [
                // Power Level
                new bleno.Characteristic({
                    value: 0,
                    uuid: '2A07',
                    properties: ['read'],
                    onReadRequest: function (offset, callback) {
                        console.log('TX Power.level read request:');
                        data = [0x0A];
                        var octets = new Uint8Array(data);
                        callback(this.RESULT_SUCCESS, octets);
                    }
                })
            ]
        }),
        //  proximity monitoring service
        new bleno.PrimaryService({
            uuid: '3E099910293F11E493BDAFD0FE6D1DFD',
            characteristics: [
                // client proximity
                new bleno.Characteristic({
                    value: 0,
                    uuid: '3E099911293F11E493BDAFD0FE6D1DFD',
                    properties: ['writeWithoutResponse'],
                    onWriteRequest: function (data, offset, withoutResponse, callback) {
                        console.log("proximity monitoring.client proximity WRITE:");
                        this.value = data;
                        var octets = new Uint8Array(data);
                        console.log("0x" + u8AToHexString(octets).toUpperCase());
                        var proximity_band = octets[0];
                        var client_rssi = octets[1];
                        client_rssi = (256 - client_rssi) * -1;
                        allLedsOff();
                        if (proximity_band == 0) {
                            // means the user has turned off proximity sharing 
                            // so we just want to switch off the LEDs
                            console.log("Proximity Sharing OFF");
                        } else {
                            var proximity_led = getLed(proximity_band - 1);
                            proximity_led.writeSync(1);
                            console.log("Client RSSI: " + client_rssi);
                        }
                        callback(this.RESULT_SUCCESS);
                    }
                })
            ]
        }),
        //  health thermometer service
        new bleno.PrimaryService({
            uuid: '1809',
            characteristics: [
                // temperature measurement
                new bleno.Characteristic({
                    value: 0,
                    uuid: '2A1C',
                    properties: ['indicate'],
                    onSubscribe: function (maxValueSize, updateValueCallback) {
                        console.log("subscribed to temperature measurement indications");
                        simulateTemperatureSensor(updateValueCallback);
                        //sampleTemperatureSensor(updateValueCallback);
                    },

                    // If the client unsubscribes, we stop broadcasting the message
                    onUnsubscribe: function () {
                        console.log("unsubscribed from temperature measurement indications");
                        clearInterval(temperature_timer);
                    }
                })
            ]
        }),
    ]);
}
}); 

bleno.on('accept', function (clientAddress) {
    console.log('on -> accept, client: ' + clientAddress);
    });
    bleno.on('disconnect', function (clientAddress) {
    console.log("Disconnected from address: " + clientAddress);
    });
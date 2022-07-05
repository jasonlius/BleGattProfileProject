var bleno = require('bleno');
bleno.on('stateChange', function (state) {
 console.log('on -> stateChange: ' + state);
 if (state === 'poweredOn') {
 bleno.startAdvertising('BDSK', ['1803']);
 } else {
 bleno.stopAdvertising();
 }
});
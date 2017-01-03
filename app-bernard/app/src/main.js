// Application object.
var app = {}

var paid = $('.progress').attr('data-item-paid');
paid = parseInt(paid, 10);

var price = $('.progress').attr('data-item-price');
price = parseInt(price, 10);

var tapAmount = parseInt($('.tap-amount').text(), 10);

$(document).ready(function() {

    // Connected device.
    app.device = null;

    // // Turn on LED.
    // app.ledOn = function() {
    //     app.device && app.device.writeDataArray(new Uint8Array([1]), '19b10001-e8f2-537e-4f6c-d104768a1214');
    // }

    // // Turn off LED.
    // app.ledOff = function() {
    //     app.device && app.device.writeDataArray(new Uint8Array([0]), '19b10001-e8f2-537e-4f6c-d104768a1214');
    // }

    app.showMessage = function(info) {
        document.getElementById('info').innerHTML = info
    };

    // Called when BLE and other native functions are available.
    app.onDeviceReady = function() {
        console.log('Ready');
        app.connect();
    };

    document.addEventListener(
        'deviceready',
        function() {
            evothings.scriptsLoaded(app.onDeviceReady)
        }, false);
});

app.connect = function() {
    console.log('Connceting...');
    evothings.arduinoble.close();

    evothings.arduinoble.connect(
        'LED', // Advertised name of BLE device.
        function(device) {
            app.device = device;
            console.log('Connect successful!');
            $('.system-loading-container').hide();
            $('.system-connected-container').show();
            setProgress();

            app.getData();
        },
        function(errorCode) {
            app.showMessage('Connect error: ' + errorCode + '.');
        }
    );
};

app.getData = function() {
    app.device && app.device.enableNotifications('19b10001-e8f2-537e-4f6c-d104768a1214', function(data) {
        handleData(data);
    });
}

function handleData(data) {
    data = parseInt(data, 10);
    if( data === 1 ) {
        var newPaid = paid += tapAmount;
        paid = newPaid;
        $('.progress').attr('data-item-paid', newPaid);

        setProgress();
    }
}

function setProgress() {

    var percent = paid / price * 100;

    $('.money-left').text(price - paid);

    var x = document.querySelector('.progress-circle-prog');
    x.style.strokeDasharray = (percent * 4.65) + ' 999';
    var el = document.querySelector('.progress-text');
    var from = $('.progress-text').data('progress');
    $('.progress-text').data('progress', paid);
    var start = new Date().getTime();

    setTimeout(function() {
        var now = (new Date().getTime()) - start;
        var progress = now / 700;
        result = paid > from ? Math.floor((paid - from) * progress + from) : Math.floor(from - (from - rand) * progress);
        $('.progress-text').text(progress < 1 ? result+' SEK SAVED' : paid+' SEK SAVED');
        if (progress < 1) setTimeout(arguments.callee, 10);
    }, 10);


    var daysToGo = (price - paid) / tapAmount;
    daysToGo = Math.round(daysToGo);
    $('.time-left').text( daysToGo === 1 ? 'Wow, only ' + daysToGo + ' day left' : 'Just ' + daysToGo + ' days left' );
}
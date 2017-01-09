// Application object.
var app = {}

var paid = 8270;
var price = 8895;
var tapAmount = 80;

$(document).ready(function() {

    // Connected device.
    app.device = null;

    // Called when BLE and other native functions are available.
    app.onDeviceReady = function() {
        console.log('Ready');
        app.connect();
    };

    document.addEventListener(
        'deviceready',
        function() {
            evothings.scriptsLoaded(app.onDeviceReady)
        },
        false
    );

    $('.navigation-toggle-container').on('click', function() {
        $('body').toggleClass('navigation-open');
    });

    $('.navigation-item.reload').on('click', function() {
        location.reload();
    });

    $('.navigation-item.reload').on('click', function() {
        history.back();
    });

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
            console.log('Connect error: ' + errorCode + '.');
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
        paid += tapAmount;
        setProgress();
    } else if ( data === 2) { // Restart signal
        $('.restarting-container').show();
        setTimeout(function() {
            $('.restarting-container').hide();
        }, 4000);
        paid = 8270;
        setProgress();
    }
}

function setProgress() {

    $('.progress').attr('data-item-paid', paid);
    $('.progress').attr('data-item-price', price);

    var moneyLeft = price - paid;

    if(moneyLeft < 0) {

        moneyLeft = 0;
        paid = price;

        $('body').addClass('done');
    } else {
        $('.money-left').text(moneyLeft);

        var daysToGo = (price - paid) / tapAmount;
        daysToGo = Math.round(daysToGo);
        $('.time-left').text( daysToGo === 1 ? 'Wow, only ' + daysToGo + ' day left' : 'Just ' + daysToGo + ' days left' );

        var percent = paid / price * 100;

        $('body').removeClass('done');

        // GRAPH
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
    }
}
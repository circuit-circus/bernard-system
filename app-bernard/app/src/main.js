// Application object.
var app = {}

var paid = 8270;
var price = 8895;
var tapAmount = 80;
var lastTap = 0;

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
    }
}

function setProgress() {

    $('.progress').attr('data-item-paid', paid);
    $('.progress').attr('data-item-price', price);

    var moneyLeft = price - paid;

    if(moneyLeft < 0) {

        //fireworks();

        moneyLeft = 0;
        paid = price;

        $('body').addClass('done');
    } else {
        $('.money-left').text(moneyLeft);

        var daysToGo = (price - paid) / tapAmount;
        daysToGo = Math.round(daysToGo);
        $('.time-left').text( daysToGo === 1 ? 'Wow, only ' + daysToGo + ' day left' : 'Just ' + daysToGo + ' days left' );

        var percent = paid / price * 100;

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

function fireworks() {
    'use strict';

    // If set to true, the user must press
    // UP UP DOWN ODWN LEFT RIGHT LEFT RIGHT A B
    // to trigger the confetti with a random color theme.
    // Otherwise the confetti constantly falls.

    $(function() {
      // Globals
      var $window = $(window)
        , random = Math.random
        , cos = Math.cos
        , sin = Math.sin
        , PI = Math.PI
        , PI2 = PI * 2
        , timer = undefined
        , frame = undefined
        , confetti = [];

      // Settings
      var pointer = 0;
      var onlyOnKonami = false;

      var particles = 150
        , spread = 40
        , sizeMin = 8
        , sizeMax = 20 - sizeMin
        , eccentricity = 10
        , deviation = 100
        , dxThetaMin = -.1
        , dxThetaMax = -dxThetaMin - dxThetaMin
        , dyMin = .13
        , dyMax = .18
        , dThetaMin = .4
        , dThetaMax = .7 - dThetaMin;

      var colorThemes = [
        function() {
          return color(60, 179, 113);
        }
      ];
      function color(r, g, b) {
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      }

      // Cosine interpolation
      function interpolation(a, b, t) {
        return (1-cos(PI*t))/2 * (b-a) + a;
      }

      // Create a 1D Maximal Poisson Disc over [0, 1]
      var radius = 1/eccentricity, radius2 = radius+radius;
      function createPoisson() {
        // domain is the set of points which are still available to pick from
        // D = union{ [d_i, d_i+1] | i is even }
        var domain = [radius, 1-radius], measure = 1-radius2, spline = [0, 1];
        while (measure) {
          var dart = measure * random(), i, l, interval, a, b, c, d;

          // Find where dart lies
          for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
            a = domain[i], b = domain[i+1], interval = b-a;
            if (dart < measure+interval) {
              spline.push(dart += a-measure);
              break;
            }
            measure += interval;
          }
          c = dart-radius, d = dart+radius;

          // Update the domain
          for (i = domain.length-1; i > 0; i -= 2) {
            l = i-1, a = domain[l], b = domain[i];
            // c---d          c---d  Do nothing
            //   c-----d  c-----d    Move interior
            //   c--------------d    Delete interval
            //         c--d          Split interval
            //       a------b
            if (a >= c && a < d)
              if (b > d) domain[l] = d; // Move interior (Left case)
              else domain.splice(l, 2); // Delete interval
            else if (a < c && b > c)
              if (b <= d) domain[i] = c; // Move interior (Right case)
              else domain.splice(i, 0, c, d); // Split interval
          }

          // Re-measure the domain
          for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
            measure += domain[i+1]-domain[i];
        }

        return spline.sort();
      }

      // Create the overarching container
      var container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top      = '75px';
      container.style.left     = '0';
      container.style.width    = '100%';
      container.style.height   = '100vh';
      container.style.overflow = 'hidden';
      container.style.zIndex   = '9999';

      // Confetto constructor
      function Confetto(theme) {
        this.frame = 0;
        this.outer = document.createElement('div');
        this.inner = document.createElement('div');
        this.outer.appendChild(this.inner);

        var outerStyle = this.outer.style, innerStyle = this.inner.style;
        outerStyle.position = 'absolute';
        outerStyle.width  = (sizeMin + sizeMax * random()) + 'px';
        outerStyle.height = (sizeMin + sizeMax * random()) + 'px';
        innerStyle.width  = '100%';
        innerStyle.height = '100%';
        innerStyle.backgroundColor = theme();

        outerStyle.perspective = '50px';
        outerStyle.transform = 'rotate(' + (360 * random()) + 'deg)';
        this.axis = 'rotate3D(' +
          cos(360 * random()) + ',' +
          cos(360 * random()) + ',0,';
        this.theta = 360 * random();
        this.dTheta = dThetaMin + dThetaMax * random();
        innerStyle.transform = this.axis + this.theta + 'deg)';

        this.x = $window.width() * random();
        this.y = -deviation;
        this.dx = sin(dxThetaMin + dxThetaMax * random());
        this.dy = dyMin + dyMax * random();
        outerStyle.left = this.x + 'px';
        outerStyle.top  = this.y + 'px';

        // Create the periodic spline
        this.splineX = createPoisson();
        this.splineY = [];
        for (var i = 1, l = this.splineX.length-1; i < l; ++i)
          this.splineY[i] = deviation * random();
        this.splineY[0] = this.splineY[l] = deviation * random();

        this.update = function(height, delta) {
          this.frame += delta;
          this.x += this.dx * delta;
          this.y += this.dy * delta;
          this.theta += this.dTheta * delta;

          // Compute spline and convert to polar
          var phi = this.frame % 7777 / 7777, i = 0, j = 1;
          while (phi >= this.splineX[j]) i = j++;
          var rho = interpolation(
            this.splineY[i],
            this.splineY[j],
            (phi-this.splineX[i]) / (this.splineX[j]-this.splineX[i])
          );
          phi *= PI2;

          outerStyle.left = this.x + rho * cos(phi) + 'px';
          outerStyle.top  = this.y + rho * sin(phi) + 'px';
          innerStyle.transform = this.axis + this.theta + 'deg)';
          return this.y > height+deviation;
        };
      }

      function poof() {
        if (!frame) {
          // Append the container
          document.body.appendChild(container);

          // Add confetti
          var theme = colorThemes[0]
            , count = 0;
          (function addConfetto() {
            if (onlyOnKonami && ++count > particles)
              return timer = undefined;

            var confetto = new Confetto(theme);
            confetti.push(confetto);
            container.appendChild(confetto.outer);
            timer = setTimeout(addConfetto, spread * random());
          })(0);

          // Start the loop
          var prev = undefined;
          requestAnimationFrame(function loop(timestamp) {
            var delta = prev ? timestamp - prev : 0;
            prev = timestamp;
            var height = $window.height();

            for (var i = confetti.length-1; i >= 0; --i) {
              if (confetti[i].update(height, delta)) {
                container.removeChild(confetti[i].outer);
                confetti.splice(i, 1);
              }
            }

            if (timer || confetti.length)
              return frame = requestAnimationFrame(loop);

            // Cleanup
            document.body.removeChild(container);
            frame = undefined;
          });
        }
      }

      poof();
    });

}
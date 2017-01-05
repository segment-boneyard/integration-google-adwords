
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var facade = require('segmentio-facade');
var should = require('should');
var AdWords = require('..');
var mapper = require('../lib/mapper');
var sinon = require('sinon');

describe('AdWords', function(){
  var settings;
  var googleAdWords;
  var test;
  var settings;
  beforeEach(function(){
    settings = {
      conversionId: 1012091361,
      events: {
        'Application Installed': '824NCNfly2cQ4ZPN4gM',
        'Payment Info Added': 'L5vqCITpy2cQ4ZPN4gM'
      },
      remarketing: false,
      whitelist: []
    };

    googleAdWords = new AdWords(settings);
    test = Test(googleAdWords, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('AdWords')
      .endpoint('https://www.googleadservices.com/pagead/conversion/')
      .channels(['server']);
  });

  describe('.validate()', function(){
    var msg;

    beforeEach(function(){
      msg = {
        type: 'track',
        event: 'Application Installed',
        timestamp: new Date(),
        context: {
          app: {
            namespace: 'com.Segment.testApp',
            version: 1.0
          },
          device: {
            type: 'ios',
            advertisingId: '123456',
            adTrackingEnabled: 1
          },
          os: {
            name: 'iPhone OS',
            version: '8.1.5'
          },
          sdk: {
            version: '0.1.0'
          }
        }
      };
    });

    it('should be invalid when settings are not complete', function(){
      settings.events = {};
      test.invalid(msg, settings);
    });

    it('should be valid when settings are complete', function(){
      test.valid(msg, settings);
    });

    it('should still be valid if you have no conversion labels but whitelisted remarketing', function(){
      msg.event = 'remarketing';
      settings.whitelist.push('remarketing');
      test.valid(msg, settings);
    });
  });

   describe('mapper', function(){

    describe('track', function(){
      describe('conversions', function(){
        it('should map basic track', function(){
          test.maps('track-basic');
        });

        it('should map Application Installed for iOS', function(){
          test.maps('track-application-installed-ios');
        });

        it('should map Application Installed for android', function(){
          test.maps('track-application-installed-android');
        });
      });

      describe('remarketing', function(){
        it('should map remarketing', function(){
          googleAdWords.settings.remarketing = true;
          test.maps('track-remarketing');
        });
      });
    });
  });

  describe('track', function(){
    it('should track basic mapped events correctly', function(done){
      var json = test.fixture('track-basic');
      // Remarketing is false by default so should only send mapped event conversion
      test
        .track(json.input)
        .requests(1)

      test
        .request(0)
        .query(json.output[0])
        .expects(200, done);
    });

    it('should track Application Installed correctly for iOS', function(done){
      var json = test.fixture('track-application-installed-ios');

      test
        .track(json.input)
        .request(0)
        .query(json.output[0])
        .expects(200, done);
    });

    it('should track Application Installed correctly for android', function(done){
      var json = test.fixture('track-application-installed-android');

      test
        .track(json.input)
        .request(0)
        .query(json.output[0])
        .expects(200, done);
    });

    it('should send both conversion and additionally a remarketing tag if enabled', function(done){
      googleAdWords.settings.remarketing = true;
      var json = test.fixture('track-remarketing');

      test
        .track(json.input)
        .requests(2);

      test
        .request(0)
        .query(json.output[0])
        .expects(200);

      test
        .request(1)
        .query(json.output[1])
        .expects(200);

      test.end(done);
    });

    it('should send standalone remarketing ping if whitelisted', function(done){
      googleAdWords.settings.whitelist = ['whats gucci'];
      var json = test.fixture('track-whitelist');

      test
        .track(json.input)
        .requests(1);

      test
        .request(0)
        .query(json.output)
        .expects(200);

      test.end(done);
    });
  });
});

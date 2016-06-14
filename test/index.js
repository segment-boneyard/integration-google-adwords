
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var facade = require('segmentio-facade');
var should = require('should');
var GoogleAdWords = require('..');
var mapper = require('../lib/mapper');

describe('Google AdWords', function(){
  var settings;
  var googleAdWords;
  var test;

  beforeEach(function(){
    settings = {
      events: {
        'Application Installed': {
          conversionId: 0123456789,
          conversionLabel: 'abCDEFG12hIJk3Lm4nO'
        },
        'Payment Info Added': {
          conversionId: 1234567890,
          conversionLabel: 'abcdefghijklmnopqrs'
        }
      }
    };
  });

  beforeEach(function(){
    googleAdWords = new GoogleAdWords(settings);
    test = Test(googleAdWords, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('Google AdWords')
      .endpoint('https://www.googleadservices.com/pagead/conversion/')
      .channels(['server'])
      .ensure('settings.events');
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
      delete settings.events;
      test.invalid(msg, settings);
    });

    it('should be valid when settings are complete', function(){
      test.valid(msg, settings);
    });
  });

   describe('mapper', function(){

    describe('track', function(){
      it('should map basic track', function(){
        test.maps('track-basic');
      });
    });

  });

  describe('track', function(){

    it('should track basic correctly', function(done){
      var json = test.fixture('track-basic');
      test
        .track(json.input)
        .query(json.output)
        .end(function(err, res) {
          assert(res.ok);
          done(err);
        });
    });

  });
});

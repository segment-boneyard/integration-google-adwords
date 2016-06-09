
var Test = require('segmentio-integration-tester');
var assert = require('assert');
var facade = require('segmentio-facade');
var should = require('should');
var FacebookAppEvents = require('..');
var mapper = require('../lib/mapper');

describe('Google AdWords', function(){
  var settings;
  var googleAdWords;
  var test;

  beforeEach(function(){
    settings = {};
  });

  beforeEach(function(){
    googleAdWords = new GoogleAdWords(settings);
    test = Test(googleAdWords, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('Google AdWords')
      .endpoint('')
      .channels(['server'])
      .ensure('');
  });

  describe('.validate()', function(){
    var msg;

    beforeEach(function(){
      msg = {
        type: 'track',
        event: 'Character Upgraded',
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
          }
        }
      };
    });

    it('should be valid when settings are complete', function(){
      test.valid(msg, settings);
    });
  });

   describe('mapper', function(){

    // describe('track', function(){
    //   it('should map basic track', function(){
    //     test.maps('track-basic');
    //   });
    // });

  });

  describe('track', function(){

    // it('should track basic correctly', function(done){
    //   var json = test.fixture('track-basic');
    //   test
    //     .track(json.input)
    //     .sends(json.output)
    //     .expects(200)
    //     .end(done);
    // });

  });
});

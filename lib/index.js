
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `GoogleAdWords`
 */

var GoogleAdWords = module.exports = integration('Google AdWords')
  .endpoint('')
  .channels(['server'])
  .ensure('')
  .retries(2);

GoogleAdWords.ensure(function(msg){
  var device = track.proxy('context.device') || {};
  if (device.adTrackingEnabled && device.advertiserId) return;
  return this.invalid('All calls must have Ad Tracking Enabled and an Advertiser Id');
});
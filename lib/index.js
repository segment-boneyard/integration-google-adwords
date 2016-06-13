
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `GoogleAdWords`
 */

var GoogleAdWords = module.exports = integration('Google AdWords')
  .endpoint('https://www.googleadservices.com/pagead/conversion/')
  .channels(['server'])
  .ensure('settings.events')
  .retries(2);

GoogleAdWords.ensure(function(msg, settings){
  var device = msg.proxy('context.device') || {};
  var app = msg.proxy('context.app') || {};
  var os = msg.proxy('context.os') || {};
  var conversionId = mapper.getConversionId(msg.event(), settings.events);
  var conversionLabel = mapper.getConversionLabel(msg.event(), settings.events);
  if (device.advertisingId && app.namespace && app.version && os.version && device.type && conversionId && conversionLabel) return;
  return this.invalid('All calls must have an Advertising Id, Namespace, App Version, OS version, device type and conversionId and Label');
});

/**
 * Track.
 *
 * https://developers.google.com/app-conversion-tracking/ios/conversion-tracking-server
 * https://developers.google.com/app-conversion-tracking/android/conversion-tracking-server
 *
 * @param {Track} msg
 * @param {Function} callback
 */

GoogleAdWords.prototype.track = function(msg, callback){
  var payload = mapper.query(msg, this.settings.events);
  return this
    .get(conversionId + '/')
    .query(payload)
    .end(this.handle(callback));
};

/**
 * Application Installed.
 *
 * https://developers.google.com/app-conversion-tracking/ios/conversion-tracking-server
 * https://developers.google.com/app-conversion-tracking/android/conversion-tracking-server
 *
 * @param {Track} msg
 * @param {Function} callback
 */

GoogleAdWords.prototype.applicationInstalled = function(msg, callback){
  var payload = mapper.query(msg, this.settings.events);
  return this
  .get(conversionId + '/')
  .query(payload)
  .end(this.handle(callback));
};

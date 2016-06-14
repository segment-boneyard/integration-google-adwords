
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
  var conversionId = settings.conversionId;
  var conversionLabel = mapper.getConversionLabel(msg.event(), settings.events);

  if (!device.advertisingId) return this.invalid('All calls must have an advertisingId');
  if (!app.namespace) return this.invalid('All calls must have an App Namespace');
  if (!app.version) return this.invalid('All calls must have an App Version');
  if (!os.version) return this.invalid('All calls must have an OS Version');
  if (!device.type) return this.invalid('All calls must have a Device Type');
  if (!conversionId) return this.invalid('All calls must have an conversionId');
  if (!conversionLabel) return this.invalid('All calls must have a conversionLabel');
  return;
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
  var events = this.settings.events;
  var payload = mapper.track(msg, this.settings);

  return this
    .get(this.settings.conversionId + '/')
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
  var events = this.settings.events;
  var payload = mapper.track(msg, this.settings);

  return this
  .get(this.settings.conversionId + '/')
  .query(payload)
  .end(this.handle(callback));
};

/**
 * Google Adwords needs specific ConversionLabels for each mapped event
 * Iterate through events object keys and return the conversionLabel if found
 *
 * @param {String} eventName
 * @param {Object} events
 */

function getConversionLabel (eventName, events) {
  if (events[eventName]) {
    return events[eventName].conversionLabel;
  }
};
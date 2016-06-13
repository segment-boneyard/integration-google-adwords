/**
 * Module Dependencies
 */

var reject = require('reject');

/**
 * Map query.
 *
 * @param {Track} msg
 * @param {Object} events
 * @return {Object}
 */

exports.query = function (msg, events){
  var device = track.proxy('context.device');
  var app = track.proxy('context.app');
  var os = track.proxy('context.os');
  var referrer = track.proxy('referrer.id');
  var sdkVersion = app.name + '-sdk-' + firstLetterOfOS(device) + 'v' + app.build;  
  
  return reject({
    label: getConversionLabel(track.event(), events),
    rdid: device.advertisingId,
    idtype: 'advertisingid',
    lat: 0,
    bundleid: app.namespace,
    appversion: app.version,
    osversion: os.version,
    sdkversion: sdk.version,
    referrer: referrer,
    value: track.revenue(),
    currency_code: track.currency()
  });
};

/**
 * Google Adwords needs specific ConversionId's for each mapped event
 * Iterate through events object keys and return the conversionId if found
 *
 * @param {String} eventName
 * @param {Object} events
 */

exports.getConversionId = function (eventName, events) {
  if (events[eventName]) {
    return events[eventName].conversionId;
  }
};

/**
 * Google Adwords needs specific ConversionLabels for each mapped event
 * Iterate through events object keys and return the conversionLabel if found
 *
 * @param {String} eventName
 * @param {Object} events
 */

exports.getConversionLabel = function (eventName, events) {
  if (events[eventName]) {
    return events[eventName].conversionLabel;
  }
};

/**
 * The endpoint needs an sdk version field which needs the first letter of the device type
 * in the string
 * 
 * @param  {Object} Device
 */

function firstLetterOfOS (device) {
  return (device.type === 'ios') ? 'i' : 'a';
};
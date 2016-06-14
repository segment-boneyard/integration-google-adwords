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

exports.track = function (msg, events){
  var device = msg.proxy('context.device');
  var app = msg.proxy('context.app');
  var os = msg.proxy('context.os');
  var referrer = msg.proxy('context.referrer.id');
  var sdk = msg.proxy('context.sdk');
  var sdkVersion = app.name + '-sdk-' + firstLetterOfOS(device) + 'v' + app.build;
  var conversionLabel = getConversionLabel(msg.event(), events)

  return reject({
    label: conversionLabel,
    rdid: device.advertisingId,
    idtype: 'advertisingid',
    lat: 0,
    bundleid: app.namespace,
    appversion: app.version,
    osversion: os.version,
    sdkversion: sdk.version,
    referrer: referrer,
    value: msg.revenue(),
    currency_code: msg.currency()
  });
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
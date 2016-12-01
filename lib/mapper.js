/**
 * Module Dependencies
 */

var each = require('@ndhoule/each');

/**
 * Map query.
 *
 * @param {Track} msg
 * @param {Object} events
 * @return {Object}
 */

exports.track = function (msg, settings){
  var events = settings.events;
  var conversionLabel = exports.getConversionLabel(msg.event(), events)
  var remarketing = settings.remarketing;
  var ret = [];

  if (conversionLabel) {
    var device = msg.proxy('context.device');
    var app = msg.proxy('context.app');
    var os = msg.proxy('context.os');
    var referrer = msg.proxy('context.referrer.id');
    var sdkVersion = app.name + '-sdk-' + firstLetterOfOS(device) + 'v' + app.build;
    var idType = getIdType(device);
    var limitedAdTracking = device.adTrackingEnabled ? 1 : 0;
    var conversion = {
      label: conversionLabel,
      rdid: device.advertisingId,
      idtype: idType,
      lat: limitedAdTracking,
      bundleid: app.namespace,
      appversion: app.version,
      osversion: os.version,
      sdkversion: app.build,
      value: msg.revenue() || 0,
      currency_code: msg.currency() // defaults to 'USD'
    };

    if (referrer) conversion.referrer = referrer;

    ret.push(conversion);

    // Just like client side, we only send remarketing tags for mapped events
    if (remarketing) {
      var remarketingTag = {
        bundleid: app.namespace,
        rdid: device.advertisingId,
        idtype: idType,
        lat: limitedAdTracking,
        remarketing_only: 1,
        appversion: app.version,
        osversion: os.version
      };

      // custom properties to remarket with must be prefixed with `data.` property
      each(function(value, key) {
        remarketingTag['data.' + key] = value;
      }, msg.properties());

      ret.push(remarketingTag);
    }
  }

  return ret;
};

/**
 * The idtype parameter should be idfa for iOS and advertisingid for android
 *
 * @param {Object} device
 */

function getIdType (device) {
  return (device.type === 'ios') ? 'idfa' : 'advertisingid';
}

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
 * Exposing this with exports because we need to use it in lib/index.js's ensure block
 *
 * @param {String} eventName
 * @param {Object} events
 */

exports.getConversionLabel = function(eventName, events) {
  if (events[eventName]) {
    return events[eventName];
  }
};

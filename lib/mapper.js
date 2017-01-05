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
  var whitelistedRemarketingEvent = exports.getRemarketingEvent(msg.event(), settings.whitelist);
  var conversionLabel = exports.getConversionLabel(msg.event(), events);
  var remarketing = settings.remarketing;
  var ret = [];

  if (conversionLabel) {
    var conversion = formatConversionTag(msg);
    conversion.label = conversionLabel;
    ret.push(conversion);

    // Just like client side, we only send remarketing tags for mapped events
    if (remarketing) {
      var remarketingTag = formatRemarketingTag(msg);
      ret.push(remarketingTag);
    }
  }

  // You can still send remarketing pings by itself if you have whitelisted a certain event to do so
  // Noop if we already sent the same remarketing tag above in case customer
  // accidentally whitelists an event they already mapped as a conversion label
  if (whitelistedRemarketingEvent && !remarketingTag) {
    var whitelistedRemarketingTag = formatRemarketingTag(msg);
    ret.push(whitelistedRemarketingTag);
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

/**
 * You can whitelist Segment events to be sent as standalone remarketing tags
 * Exposing this with exports because we need to use it in lib/index.js's ensure block
 *
 * @param {String} eventName
 * @param {Array} events
 * @return {Boolean}
 */

exports.getRemarketingEvent = function(eventName, events) {
  if (events.indexOf(eventName) > -1) return true;
};

/**
 * Generate a conversion tag payload
 *
 * @param {Object} msg
 * @param {Object} ret
 * @api private
 */

function formatConversionTag(msg) {
  var device = msg.proxy('context.device');
  var app = msg.proxy('context.app');
  var os = msg.proxy('context.os');
  var referrer = msg.proxy('context.referrer.id');
  var sdkVersion = app.name + '-sdk-' + firstLetterOfOS(device) + 'v' + app.build;
  var ret = {
    rdid: device.advertisingId,
    idtype: getIdType(device),
    lat: device.adTrackingEnabled ? 1 : 0,
    bundleid: app.namespace,
    appversion: app.version,
    osversion: os.version,
    sdkversion: app.build,
    value: msg.revenue() || 0,
    currency_code: msg.currency() // defaults to 'USD'
  };

  if (referrer) ret.referrer = referrer;

  return ret;
}
/**
 * Generate a remarketing tag payload
 *
 * @param {Object} msg
 * @param {Object} ret
 * @api private
 */

function formatRemarketingTag(msg) {
  var device = msg.proxy('context.device');
  var app = msg.proxy('context.app');
  var os = msg.proxy('context.os');
  var ret = {
    bundleid: app.namespace,
    rdid: device.advertisingId,
    idtype: getIdType(device),
    lat: device.adTrackingEnabled ? 1 : 0,
    remarketing_only: 1,
    appversion: app.version,
    osversion: os.version
  };

  // custom properties to remarket with must be prefixed with `data.` property
  each(function(value, key) {
    ret['data.' + key] = value;
  }, msg.properties());

  return ret;
}


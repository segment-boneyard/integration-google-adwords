
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var Batch = require('batch');
var each = require('@ndhoule/each');
var mapper = require('./mapper');

/**
 * Expose `AdWords`
 */

var AdWords = module.exports = integration('AdWords')
  .endpoint('https://www.googleadservices.com/pagead/conversion/')
  .channels(['server'])
  .mapper(mapper)
  .retries(2);

AdWords.ensure(function(msg, settings){
  var device = msg.proxy('context.device') || {};
  var app = msg.proxy('context.app') || {};
  var os = msg.proxy('context.os') || {};
  var conversionId = settings.conversionId;
  var conversionLabel = mapper.getConversionLabel(msg.event(), settings.events);
  var remarketingEvent = mapper.getRemarketingEvent(msg.event(), settings.whitelist);

  if (!device.advertisingId) return this.invalid('All calls must have an advertisingId');
  if (!app.namespace) return this.invalid('All calls must have an App Namespace');
  if (!app.version) return this.invalid('All calls must have an App Version');
  if (!os.version) return this.invalid('All calls must have an OS Version');
  if (!device.type) return this.invalid('All calls must have a Device Type');
  if (!conversionId) return this.invalid('All calls must have a conversionId');
  if (!conversionLabel && !remarketingEvent) return this.invalid('All calls must have at least a mapped conversion label or a whitelisted remarketing event');
  // If you have remarketing setting enabled, we will send additional remarketing pings for all your conversion labels
  // If you include a whitelisted non conversion events to send as remarketing pings we can send remarketing pings without a conversion label
  return;
});

/**
 * Track.
 *
 * https://developers.google.com/app-conversion-tracking/ios/conversion-tracking-server
 * https://developers.google.com/app-conversion-tracking/android/conversion-tracking-server
 *
 * @param {Track} payload
 * @param {Function} done
 */

AdWords.prototype.track = function(payload, fn){
  var batch = new Batch;
  var self = this;

  // integration-worker doesn't handle multiple errors so immediatley invoke callback upon first error
  // Rest of requests in the batch will still send but their responses will be ignored
  batch.throws(true);

  each(function(params){
    batch.push(function(done){
      self
        .get(self.settings.conversionId + '/')
        .query(params)
        .end(self.handle(done));
    });
  }, payload);

  // Flush
  batch.end(fn);
};


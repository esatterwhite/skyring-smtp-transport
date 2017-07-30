'use strict'

const debug = require('debug')('skyring:transports:smtp')
    , nodemailer = require('nodemailer')
    , env = process.env
    ;

module.exports = (opts) => {
  const transport = nodemailer.createTransport({
    pool: true
  , port: opts.port || env.SKYRING_SMTP_PORT
  , host: opts.host || env.SKYRING_SMTP_HOST
  , authMethod: env.SKYRING_SMTP_AUTHMETHOD
  , auth: {
      user: opts.auth.user || env.SKYRING_SMTP_USER
    , pass: opts.auth.pass || env.SKYRING_SMTP_PASS
    }
  , tls: {
      rejectUnauthorized: false
    }
  }, opts);

  transport.verify((err, success) => {
    if (err) {
      err.code = 'ESMTPERROR';
      throw err;
    }
    debug('smtp connection', success)
  });

  function smtp ( method, url, payload, id, cache ){
    let out = jsonParse(payload);
    transport.sendMail(out, (err, info) => {
      if (err) return console.log(err);
      info && debug(info);
      cache.remove(id);
    });
  }

  smtp.shutdown = (cb = ()=>{}) => {
    debug('shutting down smtp transport...');
    transport.close();
    return setImmediate(cb, null);
  };

  return smtp;
};

function jsonParse(value) {
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch (e) {
    debug('unable to parse json value', e, value);
  }
  return null;
}

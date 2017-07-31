'use strict'

const test = require('tap').test
    , Skyring = require('skyring')
    , supertest = require('supertest')
    , SMTP = require('../lib/smtp')
    , SMTPServer = require('smtp-server').SMTPServer
    ;

test('SMTP Server - connection failure', (t) => {
  const state = {
    smtp: null
  }
  t.test('setup smtp', (tt) => {
    state.smtp = new SMTPServer({
      secure: false
    , name: 'localhost'
    , authOptional: true
    , onData:(stream, session, cb) => {
        setImmediate(cb,new Error('Fail'))
      }
    , onAuth:(auth, session, cb) => {
        setImmediate(cb, null, null);
      }
    })
    tt.end()
  })
  t.test('invalid port', (tt) => {
    tt.test('connect smtp', (ttt) => {
      state.smtp.listen(3333, ttt.end)
    })
    tt.on('end', () => {
      state.smtp.close()
    })
    tt.throws(() => {
      new SMTP({
        host: 'localhost'
      , post: 3131
      , auth: {
          user: 'me'
        , pass: 'you'
        }
      })
    })
    tt.end()
  })

  t.test('falied auth', (tt) => {
    tt.on('end', () => {
      state.smtp.close()
    })
    tt.test('connect smtp', (ttt) => {
      state.smtp.listen(3333, ttt.end)
    })

    tt.throws(() => {
      new SMTP({
        host: 'localhost'
      , post: 3333
      , auth: {user: 'you', pass: 'me'}
      })
    })
    tt.end()
  })
  t.end()
})

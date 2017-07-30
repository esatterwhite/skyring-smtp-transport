'use strict'

const test = require('tap').test
    , Skyring = require('skyring')
    , supertest = require('supertest')
    , SMTP = require('../lib/smtp')
    , SMTPServer = require('smtp-server').SMTPServer
    , simpleParser = require('mailparser').simpleParser;
    ;


function createMailServer(done) {
  return new SMTPServer({
    secure: false
  , name: 'localhost'
  , authOptional: true
  , onData:(stream, session, cb) => {
      simpleParser(stream, (err, mail) => {
        cb()
        done(err, mail)
      })
    }
  , onAuth:(auth, session, cb) => {
      setImmediate(cb, null, {user:'abc'})
    }
  })
}

test('SMTP Transport', (t) => {
  const state = {
    smtp_server: null
  , skyring: null
  }


  t.test('setup skyring', (tt) => {
    state.skyring = new Skyring({
      seeds: ['localhost:3456']
    , transports:[SMTP({
        port:2222
      , host: 'localhost'
      })]
    , node: {
        port: 3456
      , host: 'localhost'
      , app: 'smtp' 
      }
    }).load().listen(3000, null, null, tt.end)
  })

  t.test('set smtp timeout', (tt) => {
    tt.plan(3)
    const smtp = createMailServer((err, mail) => {
      tt.equal(mail.text.trim(), 'hello world')
    });
    tt.on('end', () => {
      smtp.close()
    })
    tt.test('smtp listen', (ttt) => {
      smtp.listen(2222, ttt.end)
    })


    tt.test('set timeout', (ttt) => {
      supertest('http://localhost:3000')
        .post('/timer')
        .set({
          'Content-Type': 'application/json'
        })
        .send({
          timeout: 500
        , data: JSON.stringify({
            text: 'hello world'
          , to: 'eric@codedependant.net'
          , from : 'mail@mail.com'
          })
        , callback: {
            transport: 'smtp'
          , uri: ''
          , method: ''
          }
        })
        .expect(201)
        .end((err, res) => {
          ttt.error(err)
          ttt.end()
        })
    })
  })

  t.test('teardown', (tt) => {

    state.skyring.close(() => {
      tt.end()
      console.log('skyring server closed')
    })

  })
  t.end()
})

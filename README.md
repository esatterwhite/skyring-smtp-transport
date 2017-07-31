# skyring-smtp-transport

SMTP Transport for node-skyring

The smtp transport exposes a configurable transport function. As a result, it must be manually
passed to a skyring server, and cannot be auto loaded. Environment variables can also be used
to configure the transport instead of passing configuration in directly

```js
const Skyring = require('skyring')
const SMTP = require('@skyring/smtp-transport')

new Skyring({
  seeds: ['localhost:3456']
, node: {host: 'localhost', port: 3456}
, transports: [ SMTP({ host: 'smtp.mail.com', port: 578 }) ]
})
```

Available Environment Variables

| Variable | Usabage | Example |
-----------|---------|---------|
SKYRING_SMTP_PORT | port of smtp server to connect to | 25
SKYRING_SMTP_HOST | host name or ip of the smtp server | smtp.mailserver.com
SKYRING_SMTP_AUTHMETHOD | auth method to login with | 'PLAIN'
SKYRING_SMTP_USER | smtp login user name | 'username'
SKYRING_SMTP_PASS | smtp login password | 'password'




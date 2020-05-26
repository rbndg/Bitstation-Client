'use strict'
const util = {}
const fs = require('fs')
const { open } = require('openurl')
const QRCode = require('qrcode')
const Payment = require('dazaar-payment-lightning')
const { randomBytes } = require('crypto')

util.openInvoice = function (invoice, cb) {
  QRCode.toDataURL(invoice.request, { type: 'terminal' }, function (err, url) {
    if (err) return cb(err)
    const html = `
    <html><body style="background:black; color:white; font-family:sans-serif; width: 500px; margin: 0 auto; text-align:center">
    <br/>
    <h1> BIT STATION Invoice </h1>
    <h3 style="color:yellow"> Turn up the sound and pay with your Lightning Wallet </h3>
      <img src="${url}"/>
      <h2><code style="overflow-wrap:break-word">${invoice.request}</code></h2>
      </body></html>
    `
    try {
      fs.writeFileSync('./.invoice.html', html)
      open('./.invoice.html')
      cb(null)
    } catch (err) {
      cb(err)
    }
  })
}

class PayLn extends Payment {
  constructor (a, b, c, hooks) {
    super(a, b, c)

    this.lightning = {
      connect: () => {},
      requests: []
    }
    this.hooks = {}
    if (hooks) {
      this._hooks = hooks
    }
    try {
      this.nodeInfo.id = fs.readFileSync('./.stream-client-id')
    } catch (err) {
      this.nodeInfo.id = randomBytes(32).toString('hex')
      fs.writeFileSync('./.stream-client-id', this.nodeInfo.id)
    }
  }

  pay (invoice) {
    this.emit('stream-invoice', invoice)
    if (this.hooks.newInvoice) {
      return this.hooks.newInvoice(invoice)
    }
  }
}
util.PayLn = PayLn

module.exports = util

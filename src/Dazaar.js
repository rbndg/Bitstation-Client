'use strict'

const { EventEmitter } = require('events')
const swarm = require('dazaar/swarm')
const market = require('dazaar/market')
const buffEncode = require('./buffencode')
const { PayLn } = require('./util')

class Dazaar extends EventEmitter {
  constructor (args) {
    super()
    this.config = args

    if (!this.config.STATION_KEY) {
      throw new Error('You must enter a station key.')
    }

    this._marketFile = market('./.stream-data', {
      sparse: true
    })
    this.buyer = this._marketFile.buy(Buffer.from(args.STATION_KEY, 'hex'))

    this.buyerLn = new PayLn(this.buyer, null, {
      implementation: 'c-lightning'
    })
  }

  start () {
    this.buyerLn.on('error-payment', () => {
      this.error('Failed to pay')
    })

    this.buyer.on('validate', () => {
      this.emit('stream-validate')
    })

    this.buyer.on('valid', (info) => {
      this.emit('stream-valid', info)
    })

    this.buyer.on('invalid', () => {
      this.emit('stream-invalid')
    })

    this.buyer.on('error', (err) => {
      this.emit('stream-error', err)
    })

    this.buyer.on('feed', () => {
      this.emit('stream-feed')
    })

    swarm(this.buyer)
  }

  startStream (options, cb) {
    const self = this
    const start = Number.isInteger(options.start) ? options.start : this.buyer.feed.remoteLength
    const buyerStream = this.buyer.feed.createReadStream({
      start,
      snapshot: false,
      live: true
    })

    buyerStream.on('data', (chunk) => {
      const data = buffEncode.decode(chunk)
      this.emit('stream-data', data)
    })
  }

  getMenuAmount (t) {
    if (!Number.isInteger(t)) {
      return false
    }
    return (t * 60) * this.config.STREAM_COST
  }

  buy (amt) {
    this.emit('buying-stream', amt)
    this.buyerLn.buy(null, amt, null, (err) => {
      if (err) throw err
      this.emit('payment-sent')
    })
  }
}

module.exports = Dazaar

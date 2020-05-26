'use strict'
const View = require('./src/View')
const Dazzar = require('./src/Dazaar.js')
const HLS = require('./src/HLS-Gen.js')
const { openInvoice } = require('./src/util')

const config = {
  STATION_KEY: process.argv[2],
  HLS_SERVER: new (require('url').URL)(process.argv[3] || 'http://localhost:8021'),
  STREAM_COST: 10,
  MENU: [1, 10, 60, 90, 120]
}

if (!config.STATION_KEY) throw new Error('You must pass station key as argument to the script ')
console.log(config)
const hls = new HLS(config)
hls.init((err) => {
  if (err) throw err
})
hls.startHLS()

const dazaar = new Dazzar(config)

dazaar.buyerLn.on('stream-invoice', (invoice) => {
  openInvoice(invoice, (err) => {
    if (err) throw err
  })
})

const render = new View({
  state: {
    stationKey: config.STATION_KEY,
    input: null,
    streamAuth: 'Connecting to station ....'
  },
  config: {}
})
render.forceRender()

dazaar.on('stream-validate', () => {
  dazaar.startStream({
    start: 0
  })
  render.streamIsValid()
})

dazaar.on('stream-data', (data) => {
  hls.appendData(data)
})

render.on('enter-key', (line) => {
  if (render.state.menu) {
    const amt = dazaar.getMenuAmount(+line)
    if (!amt) return
    dazaar.buy(amt)
  }
})

dazaar.on('stream-invalid', () => {
  render.showMenu(config.MENU, config.STREAM_COST)
})

dazaar.start()
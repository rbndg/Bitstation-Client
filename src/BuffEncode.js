'use strict'
const protobuf = require('protocol-buffers')
const { readFileSync } = require('fs')
const path = require('path')
const { RadStream } = protobuf(readFileSync(path.join(__dirname, 'bs.proto')))

module.exports = {
  encode: ({ meta, media }) => {
    const obj = { meta, media }
    if (!meta) {
      obj.meta = null
    }
    if (!media) {
      obj.media = null
    }
    return RadStream.encode(obj)
  },
  decode: (d) => {
    return RadStream.decode(d)
  }
}

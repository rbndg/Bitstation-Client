'use strict'

const HLSServer = require('hls-server')
const fs = require('fs')
const server = require('http').createServer()
const { EventEmitter } = require('events')
const rimraf = require('rimraf')
const async = require('async')

class HLS extends EventEmitter {
  constructor (config) {
    super()
    this.config = config
    this.config.PLAYLIST_PATH = this.config.PLAYLIST_PATH || './.playlist'
    this.config.PLAYLIST_FILE = this.config.PLAYLIST_FILE || 'output.m3u8'
    this.PLAYLIST_FILE = `${this.config.PLAYLIST_PATH}/${this.config.PLAYLIST_FILE}`
    this.curSegment = null
    this.segmentStreams = new Map()
    this.MAX_STREAMS = 100
    this.clearSegmentStreams()
  }

  init (cb) {
    async.waterfall([
      (next) => {
        rimraf(this.config.PLAYLIST_PATH, (err) => {
          if (err) return next(err)
          fs.mkdir(this.config.PLAYLIST_PATH, next)
        })
      },
      (next) => {
        fs.writeFile(this.PLAYLIST_FILE, `
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:8
#EXT-X-MEDIA-SEQUENCE:0
            `.trim(), next)
      }
    ], cb)
  }

  clearSegmentStreams () {
    this._clearStreams = setInterval(() => {
      const keys = this.segmentStreams.keys()
      while (this.segmentStreams.size > this.MAX_STREAMS) {
        this.segmentStreams.delete(keys.next().value)
      }
    }, 300000)
  }

  createSegmentFile (number) {
    return fs.createWriteStream(`${this.config.PLAYLIST_PATH}/${this.getSegName(number)}`)
  }

  getSegName (number) {
    return `output-${number}.ts`
  }

  appendData ({ meta, media }) {
    if (!this.curSegment) {
      this.curSegment = +meta.seg_number
      return
    }
    if (meta.seg_number > this.curSegment) {
      this.curSegment = +meta.seg_number
      this.addToPlayList(meta)
      const file = this.createSegmentFile(meta.seg_number)
      return file.on('open', () => {
        this.segmentStreams.set(meta.seg_number, file)
        file.write(media)
      })
    }
    const strm = this.segmentStreams.get(meta.seg_number)
    if (strm) strm.write(media)
  }

  addToPlayList (meta) {
    fs.appendFile(this.PLAYLIST_FILE, '\n' + meta.extinf + '\n' + this.getSegName(meta.seg_number) + '\n', (err) => {
      if (err) throw err
    })
  }

  startHLS () {
    if (this.hls || server.listening) {
      return
    }
    const self = this
    server.listen(this.config.HLS_SERVER.port)
    this.hls = new HLSServer(server, {
      provider: {
        exists: function (req, callback) {
          fs.stat(self.PLAYLIST_FILE, (err, data) => {
            if (err) return callback(null, false)
            callback(null, true)
          })
        },
        getManifestStream: function (req, cb) {
          cb(null, fs.createReadStream(self.PLAYLIST_FILE))
        },
        getSegmentStream: function (req, cb) {
          cb(null, fs.createReadStream(self.config.PLAYLIST_PATH + '/' + req.filePath))
        }
      }
    })
  }
}
module.exports = HLS

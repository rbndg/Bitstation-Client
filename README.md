# Bitstation Client

Use this client to connect, purchase, decode Bitstartion streams.

## Features

* Pay for Bitstation streams
* Deserialise stream into HLS segment and playlist.
* HLS server to watch stream on any HLS viewer (Web, VLC, Quicktime..etc)


### Requirements

* Lightning Network wallet to pay for a stream.

## How to watch  now
You can start watching streams with the provided index.js
```js
// First setup of config.json.
node conenct.js <station key>
// When stream is connected and ready, you can use any HLS compatible video player to start watching stream.

```


---
## API


#### `const dazaar = new Dazzar(config)`
Streamer class deals with broadcasting data to Dazaar and handling payment processing
``` js
const config = {
  HLS_SERVER:'http://localhost:8021',   // HLS server for watching the stream
  STREAM_COST: 10,                      // Cost of stream in Sats per second  (Get this value from broadcaster)
  MENU: [1, 10, 60, 90, 120],           // Array of minutes of streaming you want to pay for
}

```

#### `dazaar.on('stream-data',mediaBinary)`
Binary media data from dazaar stream

#### `dazaar.on('stream-invalid')`
You have no access to the stream, you must subscribe

#### `dazaar.on('stream-invalid')`
You have no access to the stream, you must subscribe to stream

#### `dazaar.on('stream-validate')`
You have access to stream to start deserialising.

#### `dazaar.buy(sats)`
Request a invoice from some `satoshi` amounts from broadcaster.

#### `dazaar.startStream(config)`
Start deserialisng from a position. When data starts flowing `stream-data` will be calledd

``` js
Optional Config 
{
  start : 0 // Position where to start streaming.  
            // 0 = start from the beginning stream. Good for watching VOD content.
            // Leave config as undefined for watching Live content
}
```

----

#### `const hls = new HLS(config)`
HLS class will deserialise stream and serve the content
``` js
{
  "PLAYLIST_PATH" : "./.playlist", //Folder where the HLS output is saved
  "PLAYLIST_FILE" : "output.m3u8", //Name of playlist file
}
```

#### `hls.init(cb)`
Delete current playlist directory and create empty playlist file.

#### `hls.startHLS()`
Start HLS Server for serving the video.

#### `hls.appendData(data)`
Decoded Dazaar data for updating playlist file and creating segment files.

-----
### Related Packages
**Bitstation server**   : Broadcasting and charging for videos.

**Bitstation client**   : Connect to a stream, decode and purchase videos.

**Bitstation player**   : Simple video client GUI built on top of Bitstation client.
import { MongoClient } from 'mongodb'
import * as assert from 'assert'
import moment from 'moment'
import Candle from './candle'

var url = 'mongodb://localhost:27017/forexjs'
var candles = []

MongoClient.connect(url, async (err, db) => {
  assert.equal(null, err)
  const cursor = await db.collection('ticks').find().sort({timestamp: 1})
  while (await cursor.hasNext()) {
    const tick = await cursor.next()
    updateCandles(tick)
  }
  db.close()
})

function updateCandles (tick) {
  let date = moment(tick.timestamp)
  tick.roundDate = date.startOf('minute').valueOf()
  date = date.valueOf()
  const lastCandle = candles[candles.length - 1]
  if (lastCandle && tick.roundDate === lastCandle.timestamp) {
    lastCandle.update(tick)
  } else {
    candles.push(new Candle(tick.roundDate, +tick.price, +tick.price, +tick.price))
  }
}

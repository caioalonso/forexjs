'use strict'

const moment = require('moment')
const Candle = require('./candle')
const csv = require('fast-csv')
const SMA = require('./sma')

var candles = []
var shortSma = new SMA(10)
var mediumSma = new SMA(50)
var longSma = new SMA(100)
var indicators = [shortSma, mediumSma, longSma]

function runTest (file) {
  csv
    .fromPath(file)
    .on('data', tick => {
      updateCandles(tick)
      runStrategy(tick)
    }).on('end', function(){
      console.log('done')
    })
}

function updateCandles (tick) {
  let date = moment(tick[0])
  tick.roundDate = date.startOf('minute').valueOf()
  date = date.valueOf()
  const lastCandle = candles[candles.length - 1]
  const price = +tick[2]
  if (lastCandle && tick.roundDate === lastCandle.timestamp) {
    lastCandle.update(tick)
    indicators.forEach(ind => ind.update(price))
  } else {
    candles.push(new Candle(tick.roundDate, price, price, price))
    indicators.forEach(ind => ind.insert(price))
  }
}

function runStrategy (tick) {
  console.log(shortSma.last())
}

module.exports = runTest

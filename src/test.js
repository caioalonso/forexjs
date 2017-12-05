'use strict'

const fs = require('fs')
const readline = require('readline')
const stream = require('stream')
const Candle = require('./candle')
const SMA = require('./sma')
const EMA = require('./ema')

var candles = []
var balance = {
  'USD': 10000,
  'EURUSD': 0
}
var lotSize = 100
var shortEma = new EMA(10)
var mediumEma = new EMA(50)
var longSma = new SMA(100)
var indicators = [shortEma, mediumEma, longSma]
var prevCross = [false, false]
var curCross = [false, false]
var position = 0

var positionSide = null

function runTest (file) {
  var instream = fs.createReadStream(file)
  var outstream = new stream
  var rl = readline.createInterface(instream, outstream)
  
  rl.on('line', function(line) {
    let tick = line.split(',')
    tick[0] = parseDate(tick[0])
    updateCandles(tick)
    runStrategy(tick)   
  })
}

function parseDate (dateStr) {
  let [date, time] = dateStr.split(' ')
  let [year, month, day] = date.split('-')
  let [hour, minute, secondms] = time.split(':')
  let [second, ms] = secondms.split('.')
  if (ms === undefined) {
    ms = 0
  } else {
    ms = ms/1000
  }
  
  return new Date(year, month, day, hour, minute, second, ms)
}

function updateCandles (tick) {
  let date = tick[0].valueOf()
  tick.roundDate = roundMinute(tick[0]).valueOf()
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

function roundMinute (date) {
  date.setMilliseconds(0)
  date.setSeconds(0)
  return date
}

function runStrategy (tick) {
  if (!seenEnoughData()) {
    return
  }

  prevCross = curCross
  curCross = checkCrosses()

  if (prevCross[0] === false && curCross[0] === true) {
    if(positionSide === true) {
      return
    } else {
      closePosition(tick[2])
      positionSide = true
      buy(tick[2])
    }
  }

  if (prevCross[1] === false && curCross[1] === true) {
    if(positionSide === false) {
      return
    } else {
      closePosition(tick[2])
      positionSide = false
      sell(tick[2])
    }
  }
}

function seenEnoughData () {
  return candles.length >= 100
}

function checkCrosses () {
  const buycross = shortEma.last() > mediumEma.last()
  const sellcross = shortEma.last() < mediumEma.last()
  return [buycross, sellcross]
}

function buy (price) {
  position = lotSize
  balance['USD'] -= lotSize * price
  balance['EURUSD'] += lotSize
}

function sell (price) {
  position = lotSize
  balance['USD'] += lotSize * price
  balance['EURUSD'] -= lotSize
}

function closePosition (price) {
  balance['USD'] += balance['EURUSD'] * price
  balance['EURUSD'] = 0
  position = 0
}

module.exports = runTest

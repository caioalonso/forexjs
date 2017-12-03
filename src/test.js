'use strict'

const moment = require('moment')
const Candle = require('./candle')
const csv = require('fast-csv')
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
  csv
    .fromPath(file)
    .on('data', tick => {
      updateCandles(tick)
      runStrategy(tick)
      console.log(balance)
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

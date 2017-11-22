import moment from 'moment'
import Candle from './candle'
import csv from 'fast-csv'

var candles = []

export function runTest (file) {
  var csvFile = csv.fromPath(file)

  csvFile.on('data', function (tick) {
    updateCandles(tick)
    runStrategy()
  })
  .on('end', function () {
    console.log('\ndone\n')
  })
}

function updateCandles (tick) {
  let date = moment(tick[0])
  tick.roundDate = date.startOf('minute').valueOf()
  date = date.valueOf()
  const lastCandle = candles[candles.length - 1]
  if (lastCandle && tick.roundDate === lastCandle.timestamp) {
    lastCandle.update(tick)
  } else {
    candles.push(new Candle(tick.roundDate, +tick[2], +tick[2], +tick[2]))
  }
}

function runStrategy (tick) {
  if (candles.length < 20) {
    return
  }
  console.log('running')
}

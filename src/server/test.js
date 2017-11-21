import moment from 'moment'
import Candle from './candle'
import csv from 'fast-csv'
import ProgressBar from 'progress'
import { execSync } from 'child_process'

var candles = []

export function runTest (file) {
  var csvFile = csv.fromPath(file)
  var lines = +execSync('wc -l ' + file).toString('utf-8').split(' ')[0]
  var bar = new ProgressBar(':bar :rate/s :percent (ETA: :eta)', { total: lines })

  csvFile.on('data', function (tick) {
    updateCandles(tick)
    bar.tick()
  })
  .on('end', function () {
    console.log('\ndone\n')
  })
}

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

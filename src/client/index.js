import socketio from 'socket.io-client'
import Highcharts from 'highstock-release'
import indicators from 'highstock-release/indicators/indicators'
import ema from 'highstock-release/indicators/ema'
import theme from './theme'
import moment from 'moment'

indicators(Highcharts)
ema(Highcharts)
theme(Highcharts)

var chart = Highcharts.stockChart('chart', {
  title: {
    text: 'EURUSD M1'
  },
  tooltip: {
    'enabled': false
  },
  credits: {
    enabled: false
  },
  series: [{
    id: 'EURUSD',
    name: 'EURUSD',
    type: 'candlestick',
    tooltip: {
      valueDecimals: 5
    },
    dataGrouping: {
      enabled: false,
      forced: false
    }
  },
  { type: 'ema', linkedTo: 'EURUSD', name: 'EMA (10)', params: { period: 10 }, marker: { enabled: false }, 'enableMouseTracking': false },
  { type: 'ema', linkedTo: 'EURUSD', name: 'EMA (50)', params: { period: 50 }, marker: { enabled: false }, 'enableMouseTracking': false},
  { type: 'sma', linkedTo: 'EURUSD', name: 'SMA (100)', params: { period: 100 }, marker: { enabled: false }, 'enableMouseTracking': false}],
  rangeSelector: false
})

const socket = socketio()

socket.on('pastData', (data) => {
  console.log('pastData')
  var candles = []
  data.candles.forEach((candle) => {
    var date = moment(candle.time).valueOf()
    candles.push([date, +candle.mid.o, +candle.mid.h, +candle.mid.l, +candle.mid.c])
  })
  chart.series[0].setData(candles)
  console.log(chart)

  socket.on('data', (tick) => {
    tick.price = +tick.bids[0].price
    var date = moment(tick.time)
    tick.roundDate = date.startOf('minute').valueOf()
    date = date.valueOf()
    var points = chart.series[0].getValidPoints()
    var lastCandle = points[points.length - 1]
    if (tick.roundDate === lastCandle.options.x) {
      lastCandle.update(updateOHLC(lastCandle.options, tick))
    } else {
      chart.series[0].addPoint([date, +tick.price, +tick.price, +tick.price, +tick.price])
    }
  })
})

function updateOHLC (candle, tick) {
  tick.price = +tick.price
  if (tick.price > candle.high) {
    candle.high = tick.price
  }
  if (tick.price < candle.low) {
    candle.low = tick.price
  }
  candle.close = tick.price

  return candle
}

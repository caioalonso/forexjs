import socketio from 'socket.io-client'
import Highcharts from 'highcharts/highstock'
import theme from './theme'
import moment from 'moment'

theme(Highcharts)
var chart = Highcharts.stockChart('chart', {
  title: {
    text: 'EURUSD M1'
  },
  credits: {
    enabled: false
  },
  series: [],
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
  chart.addSeries({
    name: 'EURUSD',
    type: 'candlestick',
    data: candles,
    tooltip: {
      valueDecimals: 5
    },
    dataGrouping: {
      enabled: false,
      forced: false
    }
  })

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
      chart.series[0].addPoint([date, +tick.price, +tick.price, +tick.price, +tick.price], true, true, true)
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

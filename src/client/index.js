import * as d3 from 'd3'
import techan from 'techan'
import socketio from 'socket.io-client'
const socket = socketio()

var margin = {top: 20, right: 20, bottom: 30, left: 50},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom

var candles = []
socket.on('pastData', (data) => {
  data.candles.forEach((candle) => {
    var date = parseDate(candle.time)
    newCandle(date, candle.mid.o, candle.mid.h, candle.mid.l, candle.mid.c)
  })
  redraw(candles)
})
socket.on('data', (tick) => {
  updateCandles(tick)
  redraw(candles)
})

function parseDate (date) {
  var parser = d3.timeParse('%Y-%m-%dT%H:%M:%S.%L')
  return parser(date.slice(0, -7))
}

function updateCandles (tick) {
  tick.price = +tick.bids[0].price
  tick.date = parseDate(tick.time.slice(0, -7))
  tick.roundDate = d3.timeMinute.floor(tick.date)

  var candle = candles.pop()
  if (candle) {
    if (+tick.roundDate === +candle.date) {
      candle = updateOHLC(candle, tick)
      candles.push(candle)
    } else {
      candles.push(candle)
      newCandleFromTick(tick)
    }
  } else {
    newCandleFromTick(tick)
  }
}

function newCandleFromTick (tick) {
  newCandle(tick.roundDate, tick.price, tick.price, tick.price, tick.price)
}

function newCandle (date, open, high, low, close) {
  candles.push({
    date: date,
    open: +open,
    high: +high,
    low: +low,
    close: +close })
}

function updateOHLC (candle, tick) {
  if (tick.price > candle.high) {
    candle.high = tick.price
  }
  if (tick.price < candle.low) {
    candle.low = tick.price
  }
  candle.close = tick.price

  return candle
}

var x = techan.scale.financetime()
.range([0, width])

var y = d3.scaleLinear()
.range([height, 0])

var candlestick = techan.plot.candlestick()
.xScale(x)
.yScale(y)

var sma0 = techan.plot.sma()
.xScale(x)
.yScale(y)

var sma0Calculator = techan.indicator.sma()
.period(10)

var sma1 = techan.plot.sma()
.xScale(x)
.yScale(y)

var sma1Calculator = techan.indicator.sma()
.period(20)

var xAxis = d3.axisBottom(x)

var yAxis = d3.axisLeft(y)

var timeAnnotation = techan.plot.axisannotation()
.axis(xAxis)
.orient('bottom')
.format(d3.timeFormat('%Y-%m-%d'))
.width(65)
.translate([0, height])

var ohlcAnnotation = techan.plot.axisannotation()
.axis(yAxis)
.orient('left')
.format(d3.format(',.2f'))

var svg = d3.select('body').append('svg')
.attr('width', width + margin.left + margin.right)
.attr('height', height + margin.top + margin.bottom)

var defs = svg.append('defs')

defs.append('clipPath')
.attr('id', 'ohlcClip')
.append('rect')
.attr('x', 0)
.attr('y', 0)
.attr('width', width)
.attr('height', height)

svg = svg.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var ohlcSelection = svg.append('g')
.attr('class', 'ohlc')
.attr('transform', 'translate(0,0)')

ohlcSelection.append('g')
.attr('class', 'candlestick')
.attr('clip-path', 'url(#ohlcClip)')

ohlcSelection.append('g')
.attr('class', 'indicator sma ma-0')
.attr('clip-path', 'url(#ohlcClip)')

ohlcSelection.append('g')
.attr('class', 'indicator sma ma-1')
.attr('clip-path', 'url(#ohlcClip)')

svg.append('g')
.attr('class', 'x axis')
.attr('transform', 'translate(0,' + height + ')')

svg.append('g')
.attr('class', 'y axis')
.append('text')
.attr('transform', 'rotate(-90)')
.attr('y', 6)
.attr('dy', '.71em')
.style('text-anchor', 'end')
.text('Price ($)')

svg.append('g')
.attr('class', 'crosshair ohlc')

var coordsText = svg.append('text')
.style('text-anchor', 'end')
.attr('class', 'coords')
.attr('x', width - 5)
.attr('y', 15)

function redraw (data) {
  var accessor = candlestick.accessor()

  x.domain(data.map(accessor.d))
  // Show only 150 points on the plot
  x.zoomable().domain([data.length - 130, data.length])

  // Update y scale min max, only on viewable zoomable.domain()
  y.domain(techan.scale.plot.ohlc(data.slice(data.length - 130, data.length)).domain())

  // Setup a transition for all that support
  svg
  //          .transition() // Disable transition for now, each is only for transitions
  .each(function () {
    var selection = d3.select(this)
    selection.select('g.x.axis').call(xAxis)
    selection.select('g.y.axis').call(yAxis)

    selection.select('g.candlestick').datum(data).call(candlestick)
    selection.select('g.sma.ma-0').datum(sma0Calculator(data)).call(sma0)
    selection.select('g.sma.ma-1').datum(sma1Calculator(data)).call(sma1)
  })
}

function move (coords) {
  coordsText.text(
    timeAnnotation.format()(coords.x) + ', ' + ohlcAnnotation.format()(coords.y)
)
}

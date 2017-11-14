import * as d3 from 'd3'
import techan from 'techan'
import socketio from 'socket.io-client'

const socket = socketio()

var parentDiv
var candlestick, x, y, xAxis, yAxis, svg, ohlcSelection, ohlcRightAnnotation, crosshair
var sma1, sma0, sma1Calculator, sma0Calculator, timeAnnotation
var zoom, zoomableInit

var verticalMargin = 20
var horizontalMargin = 10
var axisWidth = 50

var candles = []

socket.on('pastData', (data) => {
  data.candles.forEach((candle) => {
    var date = parseDate(candle.time)
    newCandle(date, candle.mid.o, candle.mid.h, candle.mid.l, candle.mid.c)
  })
  var accessor = candlestick.accessor()
  x.domain(candles.map(accessor.d))
  var candlesToShow = 300
  x.zoomable().domain([candles.length - candlesToShow, candles.length])
  y.domain(techan.scale.plot.ohlc(candles.slice(candles.length - candlesToShow, candles.length)).domain())
  redraw()
  zoomableInit = x.zoomable().clamp(false).copy()
})

socket.on('data', (tick) => {
  updateCandles(tick)
  y.domain(techan.scale.plot.ohlc(candles.slice(candles.length - 230, candles.length)).domain())
  redraw()
})

function parseDate (date) {
  var parser = d3.timeParse('%Y-%m-%dT%H:%M:%S.%L')
  return parser(date.slice(0, -7))
}

function updateCandles (tick) {
  tick.price = +tick.bids[0].price
  tick.date = parseDate(tick.time)
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

function setupChart () {
  parentDiv = document.getElementById('chart')
  var height = parentDiv.clientHeight - verticalMargin
  var width = parentDiv.clientWidth - horizontalMargin

  x = techan.scale.financetime()
  .range([0, width - axisWidth])

  y = d3.scaleLinear()
  .range([height, 0])

  zoom = d3.zoom()
  .on('zoom', zoomed)

  candlestick = techan.plot.candlestick()
  .xScale(x)
  .yScale(y)

  sma0 = techan.plot.sma()
  .xScale(x)
  .yScale(y)

  sma0Calculator = techan.indicator.sma()
  .period(10)

  sma1 = techan.plot.sma()
  .xScale(x)
  .yScale(y)

  sma1Calculator = techan.indicator.sma()
  .period(20)

  xAxis = d3.axisBottom(x)

  yAxis = d3.axisRight(y)

  ohlcRightAnnotation = techan.plot.axisannotation()
    .axis(yAxis)
    .orient('right')
    .translate([width - axisWidth, 0])

  timeAnnotation = techan.plot.axisannotation()
    .axis(xAxis)
    .orient('bottom')
    .format(d3.timeFormat('%H:%M'))
    .width(40)
    .translate([0, height])

  crosshair = techan.plot.crosshair()
    .xScale(x)
    .yScale(y)
    .yAnnotation(ohlcRightAnnotation)
    .xAnnotation(timeAnnotation)

  svg = d3.select('div#chart').append('svg')
  .attr('width', width)
  .attr('height', parentDiv.clientHeight)

  var defs = svg.append('defs')

  defs.append('clipPath')
  .attr('id', 'ohlcClip')
  .append('rect')
  .attr('x', x(0))
  .attr('y', y(1))
  .attr('width', x(1) - x(0))
  .attr('height', y(0) - y(1))

  svg = svg.append('g')
  .attr('width', width)

  ohlcSelection = svg.append('g')
  .attr('class', 'ohlc')

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
  .attr('transform', 'translate(' + (width - axisWidth) + ',0)')
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('y', 6)
  .attr('dy', '.71em')
  .style('text-anchor', 'end')

  svg.append('rect')
  .attr('class', 'pane')
  .attr('width', width)
  .attr('height', height)
  .call(zoom)

  svg.append('g')
    .attr('class', 'crosshair')
    .datum({ x: x.domain()[80], y: 67.5 })
    .call(crosshair)
}

function zoomed () {
  var rescaledY = d3.event.transform.rescaleY(y)
  var rescaledX = d3.event.transform.rescaleX(zoomableInit)
  yAxis.scale(rescaledY)
  sma0.yScale(rescaledY)
  sma1.yScale(rescaledY)
  candlestick.yScale(rescaledY)
  x.zoomable().domain(rescaledX.domain())
  redraw()
}

function redraw () {
  svg
  .each(function () {
    var selection = d3.select(this)
    selection.select('g.x.axis').call(xAxis)
    selection.select('g.y.axis').call(yAxis)
    selection.select('g.candlestick').datum(candles).call(candlestick)
    selection.select('g.sma.ma-0').datum(sma0Calculator(candles)).call(sma0)
    selection.select('g.sma.ma-1').datum(sma1Calculator(candles)).call(sma1)
  })
}

function resizeChart () {
  var height = parentDiv.clientHeight - verticalMargin
  var width = parentDiv.clientWidth - horizontalMargin
  x.range([0, width - axisWidth])
  y.range([height, 0])
  svg.select('.ohlc')
    .attr('width', width).attr('height', height)
  svg.select('.y.axis')
    .attr('transform', 'translate(' + (width - axisWidth) + ',0)')
  redraw()
}

document.addEventListener('DOMContentLoaded', setupChart)

d3.select(window).on('resize.updatesvg', resizeChart)

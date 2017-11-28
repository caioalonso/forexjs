'use strict'

class Candle {
  constructor (timestamp, open, high, low, close) {
    this.timestamp = timestamp
    this.open = open
    this.high = high
    this.low = low
    this.close = close
  }

  update (tick) {
    tick[2] = +tick[2]
    if (tick[2] > this.high) {
      this.high = tick[2]
    }
    if (tick[2] < this.low) {
      this.low = tick[2]
    }
    this.close = tick[2]
  }
}

module.exports = Candle
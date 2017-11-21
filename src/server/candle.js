export default class Candle {
  constructor (timestamp, open, high, low, close) {
    this.timestamp = timestamp
    this.open = open
    this.high = high
    this.low = low
    this.close = close
  }

  update (tick) {
    tick.price = +tick.price
    if (tick.price > this.high) {
      this.high = tick.price
    }
    if (tick.price < this.low) {
      this.low = tick.price
    }
    this.close = tick.price
  }
}

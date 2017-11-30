'use strict'

class EMA {
  constructor(windowLength) {
    this.windowLength = windowLength
    this.k = 2 / (this.windowLength + 1)
    this.results = []
  }

  insert (price) {
    this.results.push(this.calculateEMA(price))
  }
  
  update (price) {
    this.results[this.results.length - 1] = this.calculateEMA(price)
  }

  calculateEMA(price) {
    const lastResult = this.last() || price
    return price * this.k + lastResult * (1 - this.k)
  }
  
  last () {
    return this.results[this.results.length - 1]
  }
}

module.exports = EMA

'use strict'

class SMA {
  constructor(windowLength) {
    this.windowLength = windowLength
    this.results = []
    this.prices = []
    this.age = 0
    this.sum = 0
  }

  insert (price) {
    this.results.push(this.calculateSMA(price))
    this.age = (this.age + 1) % this.windowLength
  }
  
  update (price) {
    this.results[this.results.length - 1] = this.calculateSMA(price)
  }
  
  calculateSMA (price) {
    const tail = this.prices[this.age] || 0 // oldest price in window
    this.prices[this.age] = price
    this.sum += price - tail
    return this.sum / this.prices.length
  }

  last () {
    return this.results[this.results.length - 1]
  }
}

module.exports = SMA

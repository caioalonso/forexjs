'use strict'

class SMA {
  constructor(windowLength) {
    this.input = 'price'
    this.windowLength = windowLength
    this.results = []
    this.prices = []
    this.age = 0
    this.sum = 0
  }

  insert (price) {
    var tail = this.prices[this.age] || 0 // oldest price in window
    this.prices[this.age] = price
    this.sum += price - tail
    this.results.push(this.sum / this.prices.length)
    this.age = (this.age + 1) % this.windowLength
  }
  
  update (price) {
    var tail = this.prices[this.age] || 0 // oldest price in window
    this.prices[this.age] = price
    this.sum += price - tail
    this.results[this.results.length - 1] = this.sum / this.prices.length
  }
  
  last () {
    return this.results[this.results.length - 1]
  }
}

module.exports = SMA

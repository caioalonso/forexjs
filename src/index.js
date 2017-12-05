'use strict'

const fx = require('simple-fxtrade')
const runTest = require('./test')
const program = require('commander')

program
  .version('0.0.0')
  .option('-t, --test <file>', 'Execute the strategy on the CSV tick data')
  .parse(process.argv)

if (program.test) {
  runTest(program.test)
} else {
  run()
}

async function run () {
  fx.configure({
    apiKey: 'acaac8e8156cc16d6325c098ffec6a0b-e56d059ca6ec0422c420dd60dfeaccd6',
    accountId: '101-004-6915582-001',
    live: false
  })
  const {accounts: [{id}]} = await fx.accounts()
  fx.setAccount(id)

  try {
    const candles = await fx.candles({id: 'EUR_USD', granularity: 'M1', count: 300, smooth: false})
  } catch (e) {
    console.log(e)
  }

  const stream = await fx.pricing.stream({ instruments: 'EUR_USD' })
  stream.on('data', data => {
  })
}

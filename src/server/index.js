'use strict'

import http from 'http'
import express from 'express'
import fx from 'simple-fxtrade'
import socketio from 'socket.io'
import renderApp from './render-app'
import { APP_NAME, STATIC_PATH, WEB_PORT } from '../shared/config'
import { isProd } from '../shared/util'

const run = async () => {
  fx.configure({
    apiKey: 'acaac8e8156cc16d6325c098ffec6a0b-e56d059ca6ec0422c420dd60dfeaccd6',
    accountId: '101-004-6915582-001',
    live: false
  })
  const {accounts: [{id}]} = await fx.accounts()
  fx.setAccount(id)

  io.on('connect', async (socket) => {
    try {
      const candles = await fx.candles({id: 'EUR_USD', granularity: 'M1', count: 300, smooth: false})
      socket.emit('pastData', candles)
    } catch (e) {
      console.log(e)
    }
  })

  const stream = await fx.pricing.stream({ instruments: 'EUR_USD' })
  stream.on('data', data => {
    if (data.type === 'PRICE') {
      io.emit('data', data)
    }
  })
}

const app = express()
const server = http.createServer(app)
const io = socketio(server)

run()

server.listen(WEB_PORT, () => {
  console.log(`${APP_NAME} running on port ${WEB_PORT} ${isProd ? '(production)'
  : '(development).\nKeep "yarn dev:wds" running in an other terminal'}.`)
})
app.use(STATIC_PATH, express.static('dist'))
app.use(STATIC_PATH, express.static('public'))
app.get('/', (req, res) => res.send(renderApp(APP_NAME)))

'use strict'

import http from 'http'
import express from 'express'
import fx from 'simple-fxtrade'
import socketio from 'socket.io'
import renderApp from './render-app'
import { APP_NAME, STATIC_PATH, WEB_PORT } from '../shared/config'
import { isProd } from '../shared/util'

const lastTicks = []
const run = async () => {
  fx.configure({
    apiKey: 'API KEY HERE',
    accountId: 'ACCOUNT ID HERE',
    live: false
  })
  const {accounts: [{id}]} = await fx.accounts()
  fx.setAccount(id)

  io.on('connect', async (socket) => {
    const candles = await fx.candles({id: 'EUR_USD', granularity: 'M1', count: 300})
    socket.emit('pastData', candles)
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

'use strict'

export const WDS_PORT = 7000
export const WEB_PORT = process.env.PORT || 3000
export const STATIC_PATH = '/static'
export const APP_NAME = 'Forex Bot'
export const TEST = {
  startNetWorth: 10000,
  leverage: 20
}
export const STRATEGY = {
  maxPercentRisk: 2,
  stopLoss: 1,
  takeProfit: 1
}

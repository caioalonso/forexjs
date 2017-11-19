var moment = require('moment')
var csv = require('fast-csv')
var ProgressBar = require('progress')
var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
const { execSync } = require('child_process')

var url = 'mongodb://localhost:27017/forexjs'

export function importCsv(file) {
  var csvFile = csv.fromPath(file)
  var lines = +execSync('wc -l ' + file).toString('utf-8').split(' ')[0]
  var bar = new ProgressBar(':bar :rate/s :percent (ETA: :eta)', { total: lines })

  MongoClient.connect(url, function (err, db) {
    csvFile.on('data', function (data) {
      assert.equal(null, err)
      insertTick(db, data)
      bar.tick()
    })
    .on('end', function () {
      console.log('\ndone\n')
    })
  })
}

function insertTick (db, tick) {
  db.collection('ticks').insertOne({
    symbol: 'EURUSD',
    timestamp: moment(tick[0]).toDate(),
    bidPrice: +tick[1],
    askPrice: +tick[2]
  }, function (err, result) {
    assert.equal(err, null)
  })
}

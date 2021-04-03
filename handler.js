'use strict'
const { once } = require('events')

const numPoints = 100000
const palette = ['#6290C3', '#C2E7DA', '#F1FFE7', '#1A1B41', '#BAFF29']

function rndInArray (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

exports.handler = async function handler (req, res) {
  for (let i = 0; i < numPoints; i++) {
    // generates a random data point
    const x = Math.random()
    const y = Math.random()
    const color = rndInArray(palette)
    const dataPoint = `${x},${y},${color}\n`

    // writes the datapoint in the response stream
    const canContinue = res.write(dataPoint)

    // handles backpressure
    if (!canContinue) {
      await once(res, 'drain')
    }
  }
  res.end()
}

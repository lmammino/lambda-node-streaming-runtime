'use strict'

const { promisify } = require('util')
const { request } = require('http')
const { finished } = require('stream')

const finishedAsync = promisify(finished)

function requireHandler () {
  const splitPoint = process.env._HANDLER.lastIndexOf('.')
  const handlerPath = `./${process.env._HANDLER.slice(0, splitPoint)}`
  const handlerExportName = process.env._HANDLER.slice(splitPoint + 1)

  const handlerModule = require(handlerPath)
  const handler = handlerModule[handlerExportName]

  return handler
}

function requestAsync (options) {
  return new Promise((resolve, reject) => {
    const req = request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Failed request with statusCode: ${res.statusCode}. Req: ${JSON.stringify(options)}`))
      }

      resolve(res)
    })
    req.end() // flushes the request
  })
}

async function getAndProcessEvent (handler) {
  const [host, port] = process.env.AWS_LAMBDA_RUNTIME_API.split(':')

  // Get an event – Call the next invocation API to get the next event. The response body contains the event data. Response headers contain the request ID and other information.
  const req = await requestAsync({
    method: 'POST',
    host,
    port,
    path: '/2018-06-01/runtime/invocation/next'
  })

  const requestId = req.headers['lambda-runtime-aws-request-id']

  const lambdaRes = request({
    method: 'POST',
    host,
    port,
    path: `/2018-06-01/runtime/invocation/${requestId}/response`
  })

  handler(req, lambdaRes)

  await finishedAsync(lambdaRes)

  // Propagate the tracing header – Get the X-Ray tracing header from the Lambda-Runtime-Trace-Id header in the API response. Set the _X_AMZN_TRACE_ID environment variable locally with the same value. The X-Ray SDK uses this value to connect trace data between services.
  // Create a context object – Create an object with context information from environment variables and headers in the API response.
  // Invoke the function handler – Pass the event and context object to the handler.
  // Handle the response – Call the invocation response API to post the response from the handler.
  // Handle errors – If an error occurs, call the invocation error API.
  // Cleanup – Release unused resources, send data to other services, or perform additional tasks before getting the next event.
}

async function run () {
  // 1. INIT PHASE
  // Load the handler and report any potential error
  const handler = requireHandler()

  // 2. PROCESSING TASKS
  while (true) {
    await getAndProcessEvent(handler)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

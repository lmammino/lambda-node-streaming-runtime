'use strict'

const { createServer } = require('http')

const server = createServer(function (req, res) {
  console.log(`>> ${req.method} ${req.url}`)
  const url = new URL(req.url, 'http://localhost')

  if (req.method === 'GET' && url.pathname === '/2018-06-01/runtime/invocation/next') {
    res.writeHead(200, 'OK', {
      'Lambda-Runtime-Aws-Request-Id': (new Date()).getTime()
    })
    res.end()
    console.log('<< 200')
  } else if (req.method === 'POST' && url.pathname.match(/\/2018-06-01\/runtime\/invocation\/(\d+)\/response/)) {
    res.writeHead(200, 'OK')
    req.on('data', c => console.log(`>>> ${c.toString()}`))
    req.on('end', () => {
      res.end()
      console.log('<< 200')
    })
  } else {
    res.writeHead(404)
    res.end()
    console.log('<< 404')
  }
})

server.listen(9001, '0.0.0.0')

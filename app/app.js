const express = require('express')
const app = express()
const Prometheus = require('prom-client');

const metricsInterval = Prometheus.collectDefaultMetrics()
const checkoutsTotal = new Prometheus.Counter({
  name: 'checkouts_total',
  help: 'Total number of checkouts',
  labelNames: ['payment_method']
})
const httpRequestDurationMicroseconds = new Prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  // buckets for response time from 0.1ms to 500ms
  buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]
});

app.use((req, res, next) => {
  res.locals.startEpoch = Date.now()
  next()
})

app.get('/', function (req, res, next) {
  setTimeout(() => {
    res.json({
      message: 'Hello World!'
    })
    next()
  }, Math.round(Math.random() * 200))
})

app.get('/checkout', (req, res, next) => {
  const paymentMethod = Math.round(Math.random()) === 0 ? 'stripe' : 'paypal'

  checkoutsTotal.inc({
    payment_method: paymentMethod
  })

  res.json({ status: 'ok' })
  next()
})

app.get('/metrics', (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType)
  res.end(Prometheus.register.metrics())
})

app.use((req, res, next) => {
  const responseTimeInMs = Date.now() - res.locals.startEpoch

  httpRequestDurationMicroseconds
    .labels(req.method, req.route.path, res.statusCode)
    .observe(responseTimeInMs)

  next()
})

app.listen(3100, function () {
  console.log('Example app listening on port 3000!')
})

// Graceful shutdown
process.on('SIGTERM', () => {
  clearInterval(metricsInterval)

  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    process.exit(0)
  })
})
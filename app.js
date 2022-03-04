if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const http = require('http')
const passport = require('./config/passport')
const routes = require('./routes')

const app = express()
const server = http.createServer(app)
// enable websocket function
require('./config/socket-io')(server)
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(routes)

server.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))


module.exports = server

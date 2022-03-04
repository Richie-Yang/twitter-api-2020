const jwt = require('jsonwebtoken')
const { Server } = require("socket.io")
const { User } = require('../../models')


function socketIo (server) {
  const io = new Server(server, { cors: { origin: '*' } })

  // websocket middleware for authenticating signed-in user
  io.use((socket, next) => {
    const { handshake } = socket
    if (!handshake.auth || !handshake.auth.token) {
      throw new Error('尚未授權，禁止存取!')
    }

    // if token is found inside socket data
    // then use jwt module to decode it and 
    // search for corresponding user from database
    jwt.verify(handshake.auth.token, process.env.JWT_SECRET, 
      async (err, jwtPayload) => {
        try {
          if (err) throw new Error('尚未授權，禁止存取!')

          const user = await User.findByPk(jwtPayload.id)
          if (!user) throw new Error('尚未授權，禁止存取!')

          socket.user = user
          return next()

        } catch (err) { next(err) }
      })
  })

  // socket server starts listening for 'connection' event
  io.on('connection', (socket) => {
    const events = require('./events')(io, socket)
    socket.emit('chat', `user ${socket.id} connected`)

    // registered socket events are below
    socket.on('chat', events.chat)
    socket.on('disconnect', events.disconnect)
  })
}

module.exports = socketIo

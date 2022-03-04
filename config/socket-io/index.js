function socketIo (server) {
  const { Server } = require("socket.io")
  const io = new Server(server, { cors: { origin: '*' } })

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
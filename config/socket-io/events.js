module.exports = (io, socket) => {
  const chat = msg => {
    io.emit('chat', `${msg} --- 來自使用者的 socket.id: ${socket.id}`)
  }

  const disconnect = () => {
    io.emit('chat', `user ${socket.id} disconnected`)
  }

  return {
    chat,
    disconnect
  }
}

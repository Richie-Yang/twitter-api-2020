module.exports = (io, socket) => {
  const fetchUsers = () => {
    // fetch existing users
    const users = [];
    for (let [_, user] of io.of("/").sockets) {
      users.push({
        id: user.user.id,
        name: user.user.name,
      })
    }
    io.emit("users", users)
  }

  const publicMessage = message => {
    io.emit('public message', {
      UserId: socket.user.id,
      socketId: socket.id,
      message: message,
      createdAt: new Date()
    })
  }

  const connect = () => {
    console.log(`${socket.user.name} is connected`)
    socket.broadcast.emit(
      'public message',
      `${socket.user.name} is connected`
    )
    fetchUsers
  }

  const disconnect = () => {
    console.log(`${socket.user.name} disconnected`)
    socket.broadcast.emit(
      'public message', 
      `${socket.user.name} disconnected`
    )
    fetchUsers()
  }

  return {
    fetchUsers,
    publicMessage,
    connect,
    disconnect
  }
}

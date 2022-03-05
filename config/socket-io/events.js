module.exports = (io, socket) => {
  const fetchUsers = () => {
    // fetch existing users
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
      const { socketId, user } = socket
      users.push({
        UserId: user.id,
        socketId,
        name: user.name
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

  const privateMessage = ({content, to}) => {
    socket.to(to).emit("private message", {
      content,
      from: socket.id,
    })
  }

  const connect = () => {
    console.log(`${socket.user.name} is connected`)
    socket.broadcast.emit(
      'user connect',
      `${socket.user.name} 已經上線。`
    )
    fetchUsers()
  }

  const disconnect = () => {
    console.log(`${socket.user.name} disconnected`)
    socket.broadcast.emit(
      'user disconnect', 
      `${socket.user.name} 已經離線。`
    )
    fetchUsers()
  }

  return {
    fetchUsers,
    publicMessage,
    privateMessage,
    connect,
    disconnect
  }
}

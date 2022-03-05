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
    socket.emit("users", users)

    // notify existing users
    socket.broadcast.emit("user connected", {
      userID: socket.user.id,
      username: socket.user.name,
    })

    socket.broadcast.emit(
      'public message',
      `${socket.user.name} is connected`
    )
  }

  const chat = msg => {
    io.emit(
      'public message', 
      `${msg} --- 來自使用者名稱: ${socket.user.name}; 使用者的 socket.id ${socket.id}`
    )
  }

  const disconnect = () => {
    socket.broadcast.emit(
      'public message', 
      `${socket.user.name} disconnected`
    )
  }

  return {
    fetchUsers,
    chat,
    disconnect
  }
}

const { Message } = require('../../models')


module.exports = (io, socket) => {
  const fetchUsers = () => {
    // fetch existing users and push into an array
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

  const publicMessage = async (message) => {
    const senderId = socket.user.id
    const senderAvatar = socket.user.avatar
    const senderSocketId = socket.id
    const createdAt = new Date()

    // pre-made object for later DB operation and io.emit
    const messageObj = {
      senderId, senderSocketId, message, createdAt
    }

    await Message.create(messageObj)
    io.emit('public message', { ...messageObj, senderAvatar })
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
    // update all online users again
    fetchUsers()
  }

  const disconnect = () => {
    console.log(`${socket.user.name} disconnected`)
    socket.broadcast.emit(
      'user disconnect', 
      `${socket.user.name} 已經離線。`
    )
    // update all online users again
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

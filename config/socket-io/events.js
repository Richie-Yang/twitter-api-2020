const { Message } = require('../../models')


module.exports = (io, socket) => {
  const fetchUsers = () => {
    // fetch existing users and push into an array
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
      const { socketId, user } = socket
      users.push({
        UserId: user.id,
        name: user.name,
        avatar: user.avatar,
        socketId,
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

  const renderPublicMessages = async () => {
    // retrieve all public messages from database first
    const messages = await Message.findAll({
      include: [{ model: User, as: 'Receiver' }],
      where: { chatType: 'public' },
      attributes: [
        'senderId', 'senderSocketId', 'message', 'createdAt'
      ],
      nest: true
    })

    const responseData = messages.map(message => ({
      ...message.toJSON()
    }))

    // send to all other online users except for himself/herself
    socket.emit('render public messages', responseData)
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
    renderPublicMessages,
    privateMessage,
    connect,
    disconnect
  }
}

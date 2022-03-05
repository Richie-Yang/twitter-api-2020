const { Message } = require('../../models')


module.exports = (io, socket) => {
  const fetchUsers = () => {
    // fetch existing users and push into an array
    const users = []
    const userSet = new Set()

    for (let [id, childSocket] of io.of("/").sockets) {
      const { user } = childSocket

      if (!userSet.has(user.id)) {
        users.push({
          UserId: user.id,
          name: user.name,
          account: user.account,
          avatar: user.avatar,
          socketId: socket.id,
        })
        userSet.add(user.id)
      }
    }

    io.emit("users", users)
  }

  const renderUserSet = () => {
    const userSet = new Set()
    for (let [id, childSocket] of io.of("/").sockets) {
      userSet.add(childSocket.user.id)
    }
    return userSet
  }

  const connect = () => {
    const userSet = renderUserSet()

    if (!userSet.has(socket.user.id)) {
      socket.broadcast.emit(
        'user connect',
        `${socket.user.name} 已經上線。`
      )
    }
    // update all online users again
    fetchUsers()
  }

  const disconnect = () => {
    const userSet = renderUserSet()

    if (!userSet.has(socket.user.id)) {
      socket.broadcast.emit(
        'user disconnect',
        `${socket.user.name} 已經離線。`
      )
    }
    // update all online users again
    fetchUsers()
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

  return {
    connect,
    disconnect,
    publicMessage,
    renderPublicMessages,
    privateMessage
  }
}

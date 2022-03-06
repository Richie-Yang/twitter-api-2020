const { Message, User } = require('../../models')


module.exports = (io, socket) => {
  const fetchUsers = () => {
    // fetch existing users and push into an array
    const users = []
    const userSet = new Set()

    for (let [id, childSocket] of io.of("/").sockets) {
      const { user, rooms } = childSocket

      if (!userSet.has(user.id) && rooms.has('chatroom')) {
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

  const enterChatroom = () => {
    socket.join("chatroom");

    socket.broadcast.to("chatroom").emit(
      'user connect',
      `${socket.user.name} 進入聊天室。`
    )

    // update all online users again & show history message
    fetchUsers()
    renderPublicMessages()
  }

  const leaveChatroom = () => {
    socket.leave("chatroom");

    socket.broadcast.to("chatroom").emit(
      'user disconnect',
      `${socket.user.name} 離開聊天室。`
    )

    // update all online users again
    fetchUsers()
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
  }

  const disconnect = () => {
    // const userSet = renderUserSet()

    socket.broadcast.to("chatroom").emit(
      'user disconnect',
      `${socket.user.name} 已下線囉。`
    )

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
      nest: true
    })

    const responseData = messages.map(message => ({
      ...message.toJSON()
    }))

    // send to all other online users except for himself/herself
    socket.emit('render public messages', responseData)
  }

  const privateMessage = ({ content, to }) => {
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
    privateMessage,
    leaveChatroom,
    enterChatroom
  }
}

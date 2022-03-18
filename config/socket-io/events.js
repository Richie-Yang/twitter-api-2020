const e = require('connect-flash')
const { Message, User, Room } = require('../../models')
const Sequelize = require('sequelize')
const { Op } = Sequelize;

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
      `${socket.user.name} 進入聊天室`
    )

    // update all online users again & show history message
    fetchUsers()
    renderPublicMessages()
  }

  const leaveChatroom = () => {
    socket.leave("chatroom");

    socket.broadcast.to("chatroom").emit(
      'user disconnect',
      `${socket.user.name} 離開聊天室`
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
    // const userSet = renderUserSet()
  }

  const disconnect = () => {
    // const userSet = renderUserSet()
    socket.broadcast.to("chatroom").emit(
      'user disconnect',
      `${socket.user.name} 已下線囉`
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

    // send to  himself/herself
    socket.emit('render public messages', responseData)
  }

  // click private message icon
  const toPrivateMessage = async (userId) => {
    // 如果這個 userId ，不在 room，就創一個 room
    const userOneId = socket.user.id
    const userTwoId = userId
    const createdAt = new Date()

    // get room 
    const room = await Room.findOne({
      where: {
        [Op.or]: [
          { userOneId: userOneId, userTwoId: userTwoId },
          { userOneId: userTwoId, userTwoId: userOneId },
        ]
      },
      raw: true
    })

    // create new room , if it does not exist
    if (!room) {
      const room = await Room.create({ userOneId, userTwoId, createdAt })
    }
  }

  // enter private room , and get list
  const enterPrivateRoom = async () => {
    const userId = socket.user.id

    // get rooms 
    const rooms = await Room.findAll({
      where: {
        [Op.or]: [
          { userOneId: userId },
          { userTwoId: userId },
        ]
      },
      raw: true
    })

    if (rooms.length === 0) return socket.emit('private message', rooms)

    // 找出所有使用者
    const users = await User.findAll({ raw: true })

    // 找出正確的接收者
    const responseData = rooms.map(room => {
      const receiverId = userId === room.userOneId ? room.userTwoId : room.userOneId
      const receiver = users.find(user => user.id === receiverId)
      return {
        ...room,
        receiver
      }
    })

    socket.emit('private message list', responseData)
  }

  const leavePrivateRoom = () => {
    const { room } = socket
    socket.leave(room);

    io.to(roomId).emit(
      'user disconnect',
      `${socket.user.name} 離開聊天室`
    )
  }

  // get roomId . put user to room and get history private messages 
  const getPrivateMessages = async (roomId) => {
    // get room
    const room = await Room.findById(
      roomId, { raw: true }
    )
    const selfId = socket.user.id
    const otherId = selfId === room.userOneId ? room.userTwoId : room.userOneId
    socket.join(roomId)

    renderPrivateMessages(otherId, roomId)
  }

  // get history private messages
  const renderPrivateMessages = async (otherId, roomId) => {
    // retrieve all public messages from database first
    const [messages, otherUser] = await Promise.all([
      Message.findAll({
        include: [{ model: User, as: 'Receiver' }],
        where: {
          chatType: 'private',
          roomId
        },
        nest: true
      }),
      User.findById(otherId, {
        attributes: { exclude: ['password'] },
        raw: true
      })
    ])

    const responseData = {
      otherUser,
      messages: messages.map(message => ({ ...message.toJSON() }))
    }

    // send to  himself/herself
    socket.emit('render private messages', responseData)
  }

  // send private message
  const privateMessage = async (data) => {
    const { roomId, message } = data
    const senderId = socket.user.id
    const senderAvatar = socket.user.avatar
    const senderSocketId = socket.id
    const createdAt = new Date()

    // pre-made object for later DB operation and io.emit
    const messageObj = {
      senderId, senderSocketId, chatType: 'private', roomId, message, createdAt
    }

    await Message.create(messageObj)
    io.to(roomId).emit('private message', { ...messageObj, senderAvatar })
  }

  return {
    // connection
    connect,
    disconnect,

    // public 
    publicMessage,
    enterChatroom,
    leaveChatroom,

    // private
    toPrivateMessage,
    enterPrivateRoom,
    privateMessage,
    getPrivateMessages,
    leavePrivateRoom,

  }
}

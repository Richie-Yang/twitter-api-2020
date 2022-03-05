'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    senderId: DataTypes.INTEGER,
    senderSocketId: DataTypes.STRING,
    receiverId: DataTypes.INTEGER,
    receiverSocketId: DataTypes.STRING,
    message: DataTypes.TEXT,
    chatType: DataTypes.STRING,
    roomId: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    tableName: 'Messages'
  });
  Message.associate = function(models) {
    // associations can be defined here
    Message.belongsTo(models.User, { 
      foreignKey: 'senderId', as: 'Receiver' 
    })
    Message.belongsTo(models.User, { 
      foreignKey: 'receiverId', as: 'Sender' 
    })
  };
  return Message;
};
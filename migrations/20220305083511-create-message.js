'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      senderId: {
        type: Sequelize.INTEGER
      },
      senderSocketId: {
        type: Sequelize.STRING
      },
      receiverId: {
        type: Sequelize.INTEGER
      },
      receiverSocketId: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.TEXT
      },
      chatType: {
        defaultValue: 'public',
        type: Sequelize.STRING
      },
      roomId: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Messages');
  }
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    userOneId: DataTypes.INTEGER,
    userTwoId: DataTypes.INTEGER
  }, {
    tableName: 'Rooms'
  });
  Room.associate = function (models) {
    // associations can be defined here
    Room.hasMany(models.Message, { foreignKey: 'RoomId' })
  };
  return Room;
};
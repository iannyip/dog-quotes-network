// This is the model for the dog table
export default function initDogModel(sequelize, DataTypes) {
  return sequelize.define(
    'dog',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
      }, 
      password: {
        type: DataTypes.STRING,
      }, 
      dob: {
        type: DataTypes.DATE,
      }, 
      about: {
        type: DataTypes.STRING,
      }, 
      status: {
        type: DataTypes.INTEGER,
      }, 
      bank: {
        type: DataTypes.INTEGER,
      }, 
      profilepic: {
        type: DataTypes.STRING,
      }, 
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      }, 
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      underscored: true,
    }

  )
}
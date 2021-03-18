// This is the model for the transactions table
export default function initFollowModel(sequelize, DataTypes) {
  return sequelize.define(
    'follow',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      followerId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'dogs',
          key: 'id',
        }
      }, 
      followedId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'dogs',
          key: 'id',
        }
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
// This is the model for the transactions table
export default function initTransactionModel(sequelize, DataTypes) {
  return sequelize.define(
    'transaction',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      payerId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'dogs',
          key: 'id',
        }
      }, 
      payeeId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'dogs',
          key: 'id',
        }
      }, 
      quoteId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'quotes',
          key: 'id',
        }
      }, 
      amount: {
        type: DataTypes.INTEGER,
      }, 
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      }, 
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      }
    },
    {
      underscored: true,
    }

  )
}
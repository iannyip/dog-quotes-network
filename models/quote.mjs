// This is the model for the quotes table
export default function initQuoteModel(sequelize, DataTypes) {
  return sequelize.define(
    'quote',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      quote: {
        type: DataTypes.STRING,
      }, 
      quoterId: {
        type: DataTypes.STRING,
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
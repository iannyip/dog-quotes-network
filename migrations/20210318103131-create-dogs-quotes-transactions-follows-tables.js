module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      }, 
      password: {
        type: Sequelize.STRING,
      }, 
      dob: {
        type: Sequelize.DATE,
      }, 
      about: {
        type: Sequelize.STRING,
      }, 
      status: {
        type: Sequelize.INTEGER,
      }, 
      bank: {
        type: Sequelize.INTEGER,
      }, 
      profilepic: {
        type: Sequelize.STRING,
      }, 
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }, 
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('quotes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quote: {
        type: Sequelize.STRING,
      }, 
      quoter_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dogs',
          key: 'id',
        }
      }, 
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }, 
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });

    await queryInterface.createTable('transactions',{
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      payer_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dogs',
          key: 'id',
        }
      }, 
      payee_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dogs',
          key: 'id',
        }
      }, 
      quote_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'quotes',
          key: 'id',
        }
      }, 
      amount: {
        type: Sequelize.INTEGER,
      }, 
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }, 
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('follows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      follower_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dogs',
          key: 'id',
        }
      }, 
      followed_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'dogs',
          key: 'id',
        }
      }, 
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }, 
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('follows');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('quotes');
    await queryInterface.dropTable('dogs');
  }
};

import sequelizePackage from 'sequelize';
import allConfig from '../config/config.js';
// create this config

import initDogModel from './dog.mjs';
import initQuoteModel from './quote.mjs';
import initTransactionModel from './transaction.mjs';
import initFollowModel from './follow.mjs';

const { Sequelize } = sequelizePackage;
const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];
const db = {};

let sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Initialize Sequelize objects
db.Dog = initDogModel(sequelize, Sequelize.DataTypes);
db.Quote = initQuoteModel(sequelize, Sequelize.DataTypes);
db.Transaction = initTransactionModel(sequelize, Sequelize.DataTypes);
db.Follow = initFollowModel(sequelize, Sequelize.DataTypes);

// One to many relationships
db.Dog.hasMany(db.Quote);
db.Quote.belongsTo(db.Dog);

db.Quote.hasMany(db.Transaction);
db.Transaction.belongsTo(db.Quote);

db.Dog.hasMany(db.Transaction);
db.Transaction.belongsTo(db.Dog);
    // There are actually two links (payer_id and payee_id)

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
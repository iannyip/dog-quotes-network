import moment from "moment";
import db from "./models/index.mjs";
import sequelize from "sequelize";
const { Op } = sequelize;

const testFunction = async () => {
  // Attempt at user's profile page
  try {
    const userId = process.argv[2];
    const userData = {};

    const dog = await db.Dog.findOne({ where: { id: userId } });
    userData.info = dog;
    userData.info.bday = moment(userData.info.dob).format("D MMM YYYY");
    console.log(userData.info.bday);

    const quotes = await db.Quote.findAll({ where: { quoterId: userId } });

    // userData.quotes = quotes;
    // console.log(userData);
  } catch (error) {
    console.log(error);
  }
};

const sequelize_findAll_single = async () => {
  // Try to get one user
  try {
    // ~~~~ USING FIND ALL ~~~~~
    console.log(
      "######################### FIND ALL ##########################"
    );

    const yettie = await db.Dog.findAll({ where: { id: 1 } });

    // What is returned? An object. But it is actually an array
    console.log(`Variable type: `, typeof yettie);

    // I expect to see an object. but it gives me an array
    console.log(`Yettie object: `, yettie);
    console.log(`Yettie object (stringify): `, JSON.stringify(yettie, null, 2));

    // What if I treat is as an array
    console.log(`Yettie array: `, yettie[0]);

    // To get Yettie id:
    // console.log(`Yettie id: `, yettie.id);
    // console.log(`Yettie id: `, yettie.dataValues.id);
    console.log(`Yettie id: `, yettie[0].dataValues.id);
    console.log(`Yettie id: `, yettie[0].id);

    // for a single row, we are able to treat the variable as that particular row
  } catch (error) {
    console.log(error);
  }
};

const sequelize_findAll_dbl = async () => {
  // Try to get two users
  try {
    // ~~~~ USING FIND ALL ~~~~~
    console.log(
      "######################### FIND ALL ##########################"
    );

    const yettie = await db.Dog.findAll({ where: { id: { [Op.lt]: 3 } } });

    // What is returned? An object
    console.log(`Variable type: `, typeof yettie);

    // I expect to see an object. but it gives me an array
    console.log(`Yettie object: `, yettie);

    // What if I treat is as an array
    console.log(`Yettie array: `, yettie[0]);

    // To get Yettie id:
    // console.log(`Yettie id: `, yettie.id);
    // console.log(`Yettie id: `, yettie.dataValues.id);
    console.log(`Yettie id: `, yettie[0].dataValues.id);

    // for a single row, we are able to treat the variable as that particular row
  } catch (error) {
    console.log(error);
  }
};

const sequelize_findOne = async () => {
  // Try to get one user
  try {
    console.log(
      "######################### FIND ONE ##########################"
    );

    const yettie = await db.Dog.findOne({ where: { id: 1 } });

    // What is returned? An object as well
    console.log(`Variable type: `, typeof yettie);

    // I expect to see an object, and I got an object
    console.log("Yettie Object: ", yettie);

    // To get Yettie id: All of these work!!
    console.log(`Yettie id: `, yettie.id);
    console.log(`Yettie id: `, yettie.dataValues.id);
    console.log("````````````````````");
    console.log("Yettie id", yettieStringify["id"]);
    // console.log(`Yettie id: `, yettie[0].dataValues.id); // This doesn't work

    // for a single row, we are able to treat the variable as that particular row
  } catch (error) {
    console.log(error);
  }
};

const sequelize_get = async () => {
  try {
    const yettie = await db.Dog.findOne({ where: { id: 1 } });
    const yettieQuotes = await yettie.getQuotes();
    console.log(`Type: `, typeof yettieQuotes);
    console.log(yettieQuotes);
  } catch (error) {
    console.log(error);
  }
};

const sequelize_getDog = async () => {
  try {
    const quote = await db.Quote.findOne({ where: { id: 1 } });
    const yettie = await quote.getDog();
    console.log(yettie);
    console.log(typeof yettie);
  } catch (error) {
    console.log(error);
  }
};

// testFunction();
// sequelize_findAll_single();
// sequelize_findAll_dbl();
// sequelize_findOne();
// sequelize_get();
sequelize_getDog();

// test msg

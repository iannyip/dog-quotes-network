import moment from 'moment';
import db from './models/index.mjs';

const testFunction = async () => {
  // Attempt at user's profile page
  try {
    const userId = process.argv[2];
    const userData = {};

    const dog = await db.Dog.findOne({ where: { id: userId, }});
    userData.info = dog;
    userData.info.bday = moment(userData.info.dob).format("D MMM YYYY");
    console.log(userData.info.bday);

    const quotes = await db.Quote.findAll({where: {quoterId: userId}});
    
    // userData.quotes = quotes;
    // console.log(userData);
    
  } catch (error) {
    console.log(error);
  }  

}

testFunction();
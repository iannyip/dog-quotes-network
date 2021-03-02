// import packages
import express from "express";
import pg from "pg";
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import moment from 'moment';

// Set up
const {Pool} = pg;
const PORT = 3004;
const pgConnectionConfig = {
  user: 'iannyip',
  host: 'localhost',
  database: 'doggos',
  port: 5432,
}
const pool = new Pool(pgConnectionConfig);
const app = express();
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// Create routes
app.get('/', (request, response) => {
  response.render('root');
})

app.get('/quotes', (request, response) => {
  pool
    .query(`SELECT * FROM quotes`)
    .then((result) => {
      const allQuotes = result.rows;
      response.render('quotes', {allQuotes});
    })
    .catch((error) => console.log("error: ", error.stack))
})

app.get('/quote/new', (request, response) => {
  const {userId} = request.cookies;
  response.render('quote-new', {userId});
})

app.post('/quote/new', (request, response) => {
  const newQuoteData = request.body;
  console.log(newQuoteData);
  pool
    .query(`INSERT INTO quotes (quote, quoter_id) VALUES ('${newQuoteData.quote}', ${Number(newQuoteData.quoter_id)})`)
    .then((result) => response.redirect('/quotes'))
    .catch((error) => console.log(error));
})

app.get('/quote/:id/edit', (request, response) => {
  const {id} = request.params;
  pool
    .query(`SELECT * FROM quotes WHERE id=${id}`)
    .then((result) => {
      response.render('quote-edit', result.rows[0]);
    })
    .catch((error) => console.log(error));
})

app.put('/quote/:id/edit', (request, response) => {
  const {id} = request.params;
  pool
    .query(`UPDATE quotes SET quote='${request.body.quote}' WHERE id=${id}`)
    .then((result) => response.redirect('/dogs/you'))
    .catch((error) => console.log(error));
})

app.delete('/quote/:id/delete', (request, response) => {
  const {id} = request.params;
  pool
    .query(`DELETE FROM quotes WHERE id=${id}`)
    .then((result) => response.redirect('/dogs/you'))
    .catch((error) => console.log(error));
})

app.get('/dogs', (request, response) => {
  pool.query("SELECT * FROM dogs", (error, result) => {
    const allDogs = result.rows;
    response.render('dogs', {allDogs});
  });
})

app.get('/dogs/profile/:id', (request, response) => {
  const {id} = request.params;
  const {userId} = request.cookies;
  console.log("user id from cookie: ", userId);
  const userData = {};
  pool
    .query(`SELECT * FROM dogs WHERE id=${id}`)
    .then((result) => {
      userData.info = result.rows[0];
      return pool.query(`SELECT * FROM quotes WHERE quoter_id=${id}`)
    })
    .then((result) => {
      userData.quotes = result.rows;
      return pool.query(`SELECT COUNT(*) FROM follows WHERE followed_id=${id}`)
    })
    .then((result) => {
      if (result.rows.length === 0){
        userData.followers = 0;
      } else {
        userData.followers = result.rows[0].count;
      }
      return pool.query(`SELECT * FROM follows WHERE (followed_id=${id} AND follower_id=${userId})`)
    })
    .then((result) => {
      if (result.rows.length === 0){
        userData.followStatus = false;
      } else {
        userData.followStatus = true;
      }
      console.log(userData);
      response.render('dog-single', userData);
    })
    .catch((error) => console.log("error: ", error))
})

app.get('/dogs/you', (request, response) => {
  const {userId} = request.cookies;
  const userData = {};
  pool
    .query(`SELECT * FROM dogs WHERE id=${userId}`)
    .then((result) => {
      userData.info = result.rows[0];
      return pool.query(`SELECT * FROM quotes WHERE quoter_id=${userId}`)
    })
    .then((result) => {
      userData.quotes = result.rows;
      console.log(userData);
      response.render('dogs-you', userData);
    })
    .catch((error) => console.log("error: ", error))
})

app.get('/dogs/you/edit', (request, response) => {
  const {userId} = request.cookies;
  pool
    .query(`SELECT * FROM dogs WHERE id=${userId}`)
    .then((result) => {
      const dogObj = result.rows[0];
      dogObj.date = moment(dogObj.dob).format("YYYY-MM-DD");
      response.render('dogs-you-edit', dogObj);
    })
    .catch((error) => console.log("error: ", error))
})

app.put('/dogs/you/edit', (request, response) => {
  const formData = request.body;
  const insertData = [formData.name, formData.dob, formData.about, formData.status];
  const {userId} = request.cookies;
  pool 
    .query(`UPDATE dogs SET (name, dob, about, status) = ($1, $2, $3, $4) WHERE id=${userId}`, insertData)
    .then((result) => {
      response.redirect('/dogs/you');
    })
    .catch((error) => console.log("error: ", error))
})

app.get('/help', (request, response) => {
  response.render('help');
})

app.get('/login', (request, response) => {
  response.render('login');
})

app.post('/login', (request, response) => {
  const loginDetails = request.body;
  console.log(loginDetails);
  pool
    .query(`SELECT * FROM dogs WHERE name='${loginDetails.name}'`)
    .then((result) => {
      // CONTINUE LOGIN VERIFICATION
      if (result.rows.length === 0){
        response.redirect('/login');
        return;
      } else {
        const user = result.rows[0];
        if (user.password === loginDetails.password) {
          response.cookie('userId', user.id);
          response.redirect('/dogs');
        } else {
          response.redirect('/login');
          return;
        }
      }
    })
    .catch((error) => console.log(error));
})

app.get('/signup/1', (request, response) => {
  response.render('signup1');
})

app.post('/signup/1', (request, response) => {
  const newUserDataPartial = request.body;
  console.log(newUserDataPartial);
  response.render('signup2', newUserDataPartial);
})

app.post('/signup/2', (request, response) => {
  const newUserData = request.body;
  const inputNewUser = [newUserData.name, newUserData.password, newUserData.dob, newUserData.about]
  pool
    .query(`INSERT INTO dogs (name, password, dob, about, status) VALUES ($1, $2, $3, $4, 1)`, inputNewUser)
    .then((result) => {
      const queryUserArr = [newUserData.name, newUserData.password]
      return pool.query(`SELECT * FROM dogs WHERE (name=$1 AND password=$2)`, queryUserArr)
    })
    .then((result) => {
      const newUserId = result.rows[0].id;
      response.cookie('userId', newUserId);
      response.redirect('/dogs')
    })
    .catch((error) => console.log(error));
})

app.delete('/logout', (request, response) => {
  response.clearCookie('userId');
  response.redirect('/login');
})

app.post('/follow', (request, response) => {
  const newRelationArr = [request.cookies.userId, request.body.followed];
  pool
    .query(`INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)`, newRelationArr)
    .then((result) => {
      response.redirect(`/dogs/profile/${newRelationArr[1]}`);
    })
    .catch((error) => console.log(error));
})

app.delete('/unfollow', (request, response) => {
  const cutTiesArr = [request.cookies.userId, request.body.followed];
  pool
    .query(`DELETE FROM follows WHERE (follower_id=$1 AND followed_id=$2)`, cutTiesArr)
    .then((result) => {
      response.redirect(`/dogs/profile/${cutTiesArr[1]}`);
    })
    .catch((error) => console.log(error));
})

app.get('/quote/:id/tip', (request, response) => {
  const quoteId = request.params.id;
  const {userId} = request.cookies;
  const quoteInfo = {};
  // to do: add link to each quote
  pool
    .query(`SELECT * FROM quotes INNER JOIN dogs ON quotes.quoter_id = dogs.id WHERE quotes.id = ${quoteId}`)
    .then((result) => {
      if (result.rows.length === 0) {
        quoteInfo.validity = false;
        return;
      } else {
        quoteInfo.validity = true;
        quoteInfo.info = result.rows[0];
        quoteInfo.info.payer = userId;
        return pool.query(`SELECT * FROM transactions WHERE quote_id = ${quoteId}`)
      }
    })
    .then((result) => {
      quoteInfo.transactions = result.rows;
      console.log(quoteInfo);
      response.render('quote-single', quoteInfo);
    })
    .catch((error) => console.log(error.stack));
})

app.post('/quote/:id/tip', (request, response) => {
  const newTrxn = request.body;
  console.log(newTrxn);
  const inputData = [newTrxn.payer_id, newTrxn.payee_id, newTrxn.quote_id, newTrxn.amount];
  pool
    .query(`INSERT INTO transactions (payer_id, payee_id, quote_id, amount) VALUES ($1, $2, $3, $4)`, inputData)
    .then((result) => {
      response.redirect(`/quote/${request.params.id}/tip`);
    })
    .catch((error) => console.log(error.stack));
})

// Start server
console.log("Starting server...");
app.listen(PORT);
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
    response.cookie('userId', 1);
    const allDogs = result.rows;
    response.render('dogs', {allDogs});
  });
})

app.get('/dogs/profile/:id', (request, response) => {
  const {id} = request.params;
  const userData = {};
  pool
    .query(`SELECT * FROM dogs WHERE id=${id}`)
    .then((result) => {
      userData.info = result.rows[0];
      return pool.query(`SELECT * FROM quotes WHERE quoter_id=${id}`)
    })
    .then((result) => {
      userData.quotes = result.rows;
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



// Start server
console.log("Starting server...");
app.listen(PORT);
// import packages
import express from "express";
import pg from "pg";
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

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
app.use(methodOverride('_method'));

// Create routes
app.get('/', (request, response) => {
  response.render('root');
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
  pool
    .query(`SELECT * FROM dogs WHERE id=${id}`)
    .then((result) => {
      response.render('dog-single', result.rows[0]);
    })
    .catch((error) => console.log("error banana: ", error.stack));
})

app.get('/dogs/you', (request, response) => {
  const {userId} = request.cookies;
  pool
    .query(`SELECT * FROM dogs WHERE id=${userId}`)
    .then((result) => {
      response.render('dogs-you', result.rows[0]);
    })
    .catch((error) => console.log("error: ", error))
})

app.get('/dogs/you/edit', (request, response) => {
  const {userId} = request.cookies;
  pool
    .query(`SELECT * FROM dogs WHERE id=${userId}`)
    .then((result) => {
      response.render('dogs-you-edit', result.rows[0]);
    })
    .catch((error) => console.log("error: ", error))
})

app.put('/dogs/you/edit', (request, response) => {
  const updatedData = request.body;
  console.log(updatedData);
  console.log('banana');
  
})


// Start server
console.log("Starting server...");
app.listen(PORT);
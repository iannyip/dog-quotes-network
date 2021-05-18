// import packages
import express from "express";
import pg from "pg";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import moment from "moment";
import multer from "multer";
import bodyParser from "body-parser";
import Stripe from "stripe";
import jsSHA from "jssha";

// For deployment
const PORT = process.env.PORT || process.argv[2] || 3004;
const SALT = process.env.salt || "keep barking";
const secretKey =
  process.env.stripeSecretKey ||
  "sk_test_51IQmfABPFi6NInic4SBRmmZ4xQAteIMH2KYXLcQlzahlnxO1N3Z0mB8VxfpSOPKzd8It2xFVZQ8CnKosRYa6hdDT003c930J8m";

// Set up
const { Pool } = pg;
let pgConnectionConfig;
if (process.env.ENV === "PRODUCTION") {
  pgConnectionConfig = {
    user: "postgres",
    password: process.env.DB_password,
    host: "localhost",
    database: "doggos",
    port: process.env.PORT || 5432,
  };
} else {
  pgConnectionConfig = {
    user: "iannyip",
    host: "localhost",
    database: "doggos",
    port:  process.env.PORT || 5432,
  };
}

const pool = new Pool(pgConnectionConfig);
const app = express();
const multerUpload = multer({ dest: "profile_pictures/" });
const stripe = new Stripe(secretKey);

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use("/public", express.static("public")); // Retrieve static files from `public`.
app.use(express.static("profile_pictures"));

// Helper functions
const setHash = (input, type) => {
  const shaObj = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
  let stringToHash;
  if (type === "session") {
    stringToHash = `${input}-${SALT}`;
  } else if (type === "password") {
    stringToHash = `${input}`;
  }
  shaObj.update(stringToHash);
  const hashedString = shaObj.getHash("HEX");
  return hashedString;
};

const checkAuth = (request, response, next) => {
  if (request.isUserLoggedIn === false) {
    response.clearCookie("userId");
    response.clearCookie("session");
    response.redirect("/login");
    return;
  }
  next();
};

app.use((request, response, next) => {
  // set the default value
  request.isUserLoggedIn = false;

  // check to see if the cookies you need exists
  if (request.cookies.session && request.cookies.userId) {
    // get the hased value that should be inside the cookie
    const hash = setHash(request.cookies.userId, "session");

    // test the value of the cookie
    if (request.cookies.session === hash) {
      request.isUserLoggedIn = true;
    } else {
      request.isUserLoggedIn = false;
    }
  }
  next();
});

// Create routes
app.get("/", checkAuth, (request, response) => {
  response.redirect("/feed");
});

app.get("/quotes", (request, response) => {
  pool
    .query(`SELECT * FROM quotes`)
    .then((result) => {
      const allQuotes = result.rows;
      response.render("quotes", { allQuotes });
    })
    .catch((error) => console.log("error: ", error.stack));
});

app.get("/quote/new", (request, response) => {
  const { userId } = request.cookies;
  response.render("quote-new", { userId });
});

app.post("/quote/new", (request, response) => {
  const newQuoteData = request.body;
  const { userId } = request.cookies;
  pool
    .query(
      `INSERT INTO quotes (quote, quoter_id) VALUES ('${
        newQuoteData.quote
      }', ${Number(userId)})`
    )
    .then((result) => response.redirect("/feed"))
    .catch((error) => console.log(error));
});

app.get("/quote/:id/edit", (request, response) => {
  const { id } = request.params;
  pool
    .query(`SELECT * FROM quotes WHERE id=${id}`)
    .then((result) => {
      response.render("quote-edit", result.rows[0]);
    })
    .catch((error) => console.log(error));
});

app.put("/quote/:id/edit", (request, response) => {
  const { id } = request.params;
  pool
    .query(`UPDATE quotes SET quote='${request.body.quote}' WHERE id=${id}`)
    .then((result) => response.redirect("/dogs/you"))
    .catch((error) => console.log(error));
});

app.delete("/quote/:id/delete", (request, response) => {
  const { id } = request.params;
  pool
    .query(`DELETE FROM quotes WHERE id=${id}`)
    .then((result) => response.redirect("/dogs/you"))
    .catch((error) => console.log(error));
});

app.get("/dogs", (request, response) => {
  pool.query("SELECT * FROM dogs", (error, result) => {
    const allDogs = result.rows;
    response.render("dogs", { allDogs });
  });
});

app.get("/dogs/profile/:id", (request, response) => {
  const { id } = request.params;
  const { userId } = request.cookies;
  console.log("user id from cookie: ", userId);
  const userData = {};
  pool
    .query(`SELECT * FROM dogs WHERE id=${id}`)
    .then((result) => {
      userData.info = result.rows[0];
      userData.info.dob = moment(userData.info.dob).format("D MMM YYYY");
      return pool.query(`SELECT * FROM quotes WHERE quoter_id=${id}`);
    })
    .then((result) => {
      userData.quotes = result.rows;
      userData.quotes.forEach((quote) => {
        quote.created_at = moment(quote.created_at).fromNow();
      });
      return pool.query(`SELECT COUNT(*) FROM follows WHERE followed_id=${id}`);
    })
    .then((result) => {
      if (result.rows.length === 0) {
        userData.followers = 0;
      } else {
        userData.info.followers = result.rows[0].count;
        userData.followers = result.rows[0].count;
      }
      return pool.query(
        `SELECT * FROM follows WHERE (followed_id=${id} AND follower_id=${userId})`
      );
    })
    .then((result) => {
      if (result.rows.length === 0) {
        userData.followStatus = false;
      } else {
        userData.followStatus = true;
      }
      return pool.query(`SELECT COUNT(*) FROM follows WHERE follower_id=${id}`);
    })
    .then((result) => {
      userData.info.following = result.rows[0].count;
      console.log(userData);
      response.render("dog-single", userData);
    })
    .catch((error) => console.log("error: ", error));
});

app.get("/dogs/you", (request, response) => {
  const { userId } = request.cookies;
  const userData = {};
  pool
    .query(`SELECT * FROM dogs WHERE id=${userId}`)
    .then((result) => {
      userData.info = result.rows[0];
      userData.info.dob = moment(userData.info.dob).format("D MMM YYYY");
      return pool.query(`SELECT * FROM quotes WHERE quoter_id=${userId}`);
    })
    .then((result) => {
      userData.quotes = result.rows;
      userData.quotes.forEach((quote) => {
        quote.created_at = moment(quote.created_at).fromNow();
      });
      return pool.query(
        `SELECT COUNT(*) FROM follows WHERE follower_id=${userId}`
      );
    })
    .then((result) => {
      userData.info.following = result.rows[0].count;
      return pool.query(
        `SELECT COUNT(*) FROM follows WHERE followed_id=${userId}`
      );
    })
    .then((result) => {
      userData.info.followers = result.rows[0].count;
      console.log(userData);
      response.render("dogs-you", userData);
    })
    .catch((error) => console.log("error: ", error));
});

app.get("/dogs/you/edit", (request, response) => {
  const { userId } = request.cookies;
  pool
    .query(`SELECT * FROM dogs WHERE id=${userId}`)
    .then((result) => {
      const dogObj = result.rows[0];
      dogObj.date = moment(dogObj.dob).format("YYYY-MM-DD");
      console.log("babananan", dogObj);
      response.render("dogs-you-edit", dogObj);
    })
    .catch((error) => console.log("error: ", error));
});

app.put(
  "/dogs/you/edit",
  multerUpload.single("profilepic"),
  (request, response) => {
    const formData = request.body;
    console.log("kkj", request.body);
    let fileName;
    if (typeof request.file === "undefined") {
      fileName = formData.profilepicBackup;
    } else {
      fileName = request.file.filename;
    }
    const { userId } = request.cookies;
    const insertData = [
      formData.name,
      formData.dob,
      formData.about,
      formData.status || 0,
      fileName,
    ];
    console.log(insertData);
    pool
      .query(
        `UPDATE dogs SET (name, dob, about, status, profilepic) = ($1, $2, $3, $4, $5) WHERE id=${userId}`,
        insertData
      )
      .then((result) => {
        response.redirect("/dogs/you");
      })
      .catch((error) => console.log("error: ", error));
  }
);

app.get("/help", (request, response) => {
  response.render("help");
});

app.get("/login", (request, response) => {
  response.render("login");
});

app.post("/login", (request, response) => {
  const loginDetails = request.body;
  // Hash password
  const hashedPassword = setHash(loginDetails.password, "password");

  pool
    .query(`SELECT * FROM dogs WHERE name='${loginDetails.name}'`)
    .then((result) => {
      // CONTINUE LOGIN VERIFICATION
      if (result.rows.length === 0) {
        response.redirect("/login");
        return;
      } else {
        const user = result.rows[0];
        if (user.password === hashedPassword) {
          const hashedCookie = setHash(user.id, "session");
          response.cookie("session", hashedCookie);
          response.cookie("userId", user.id);
          response.redirect("/feed");
        } else {
          response.redirect("/login");
          return;
        }
      }
    })
    .catch((error) => console.log(error));
});

app.get("/signup/1", (request, response) => {
  response.render("signup1");
});

app.post("/signup/1", (request, response) => {
  const newUserDataPartial = request.body;
  newUserDataPartial.password = setHash(
    newUserDataPartial.password,
    "password"
  );
  console.log(newUserDataPartial);
  response.render("signup2", newUserDataPartial);
});

app.post("/signup/2", (request, response) => {
  const newUserDataPartial = request.body;
  console.log(newUserDataPartial);
  response.render("signup3", newUserDataPartial);
});

app.post(
  "/signup/3",
  multerUpload.single("profilepic"),
  (request, response) => {
    const newUserData = request.body;
    const inputNewUser = [
      newUserData.name,
      newUserData.password,
      newUserData.dob,
      newUserData.about,
      request.file.filename,
    ];
    pool
      .query(
        `INSERT INTO dogs (name, password, dob, about, status, bank, profilepic) VALUES ($1, $2, $3, $4, 1, 0, $5)`,
        inputNewUser
      )
      .then((result) => {
        const queryUserArr = [newUserData.name, newUserData.password];
        return pool.query(
          `SELECT * FROM dogs WHERE (name=$1 AND password=$2)`,
          queryUserArr
        );
      })
      .then((result) => {
        const newUserId = result.rows[0].id;
        response.cookie("session", setHash(newUserId, "session"));
        response.cookie("userId", newUserId);
        response.redirect("/feed");
      })
      .catch((error) => console.log(error));
  }
);

app.delete("/logout", (request, response) => {
  response.clearCookie("userId");
  response.clearCookie("session");
  response.redirect("/login");
});

app.post("/follow", (request, response) => {
  const newRelationArr = [request.cookies.userId, request.body.followed];
  pool
    .query(
      `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)`,
      newRelationArr
    )
    .then((result) => {
      response.redirect(`/dogs/profile/${newRelationArr[1]}`);
    })
    .catch((error) => console.log(error));
});

app.delete("/unfollow", (request, response) => {
  const cutTiesArr = [request.cookies.userId, request.body.followed];
  pool
    .query(
      `DELETE FROM follows WHERE (follower_id=$1 AND followed_id=$2)`,
      cutTiesArr
    )
    .then((result) => {
      response.redirect(`/dogs/profile/${cutTiesArr[1]}`);
    })
    .catch((error) => console.log(error));
});

app.get("/quote/:id/tip", (request, response) => {
  const quoteId = request.params.id;
  const { userId } = request.cookies;
  const quoteInfo = {};
  // to do: add link to each quote
  const queryTmp = `SELECT quotes.quote, quotes.id as quote_id, quotes.created_at, dogs.name, dogs.id as user_id FROM quotes INNER JOIN dogs ON quotes.quoter_id = dogs.id WHERE quotes.id = ${quoteId}`;
  console.log("query is: ", queryTmp);
  pool
    .query(queryTmp)
    .then((result) => {
      if (result.rows.length === 0) {
        quoteInfo.validity = false;
        return;
      } else {
        quoteInfo.validity = true;
        quoteInfo.info = result.rows[0];
        console.log("heree", result.rows);
        console.log("#########################");
        quoteInfo.info.payer_id = userId;
        return pool.query(
          `SELECT * FROM transactions WHERE quote_id = ${quoteId}`
        );
      }
    })
    .then((result) => {
      quoteInfo.transactions = result.rows;
      console.log(quoteInfo);
      response.render("quote-single", quoteInfo);
    })
    .catch((error) => console.log(error.stack));
});

app.post("/quote/:id/tip", (request, response) => {
  const newTrxn = request.body;
  console.log(newTrxn);
  const inputData = [
    newTrxn.payer_id,
    newTrxn.payee_id,
    newTrxn.quote_id,
    newTrxn.amount,
  ];
  pool
    .query(
      `INSERT INTO transactions (payer_id, payee_id, quote_id, amount) VALUES ($1, $2, $3, $4)`,
      inputData
    )
    .then(() => {
      return pool.query(
        `UPDATE dogs SET bank= bank-${newTrxn.amount} WHERE id=${newTrxn.payer_id}`
      );
    })
    .then(() => {
      return pool.query(
        `UPDATE dogs SET bank= bank+${newTrxn.amount} WHERE id=${newTrxn.payee_id}`
      );
    })
    .then((result) => {
      response.redirect(`/quote/${newTrxn.quote_id}/tip`);
    })
    .catch((error) => console.log(error.stack));
});

app.get("/feed", checkAuth, (request, response) => {
  const feed = {};
  const { userId } = request.cookies;
  console.log("userlogin:", request.isUserLoggedIn);

  let feedQuoteQuery = `SELECT quotes.id, quotes.created_at, quotes.quote, quotes.quoter_id, dogs.name, T1.count, T1.sum AS amount 
  FROM quotes 
  INNER JOIN dogs 
  ON quotes.quoter_id = dogs.id 
  LEFT JOIN (SELECT quote_id, COUNT(*), sum(amount) 
  FROM transactions GROUP BY quote_id) AS T1 
  ON quotes.id = T1.quote_id 
  ORDER BY quotes.created_at DESC`;
  if (request.query.filter === "top") {
    feedQuoteQuery = `SELECT quotes.id, quotes.created_at, quotes.quote, quotes.quoter_id, dogs.name, T1.count, T1.sum AS amount FROM quotes INNER JOIN dogs ON quotes.quoter_id = dogs.id INNER JOIN (SELECT quote_id, COUNT(*), sum(amount) FROM transactions GROUP BY quote_id) AS T1 ON quotes.id = T1.quote_id ORDER BY amount DESC`;
  } else if (request.query.filter === "following") {
    feedQuoteQuery = `SELECT quotes.id, quotes.created_at, quotes.quote, quotes.quoter_id, dogs.name, T1.count, T1.sum AS amount FROM quotes INNER JOIN dogs ON quotes.quoter_id = dogs.id INNER JOIN (SELECT quote_id, COUNT(*), sum(amount) FROM transactions GROUP BY quote_id) AS T1 ON quotes.id = T1.quote_id WHERE quotes.quoter_id IN (SELECT followed_id FROM follows WHERE follower_id= ${userId}) ORDER BY quotes.created_at DESC`;
  }

  // feedQuoteQuery += " LIMIT 20";
  console.log(feedQuoteQuery);
  pool
    .query(feedQuoteQuery)
    .then((result) => {
      feed.quotes = result.rows;
      return pool.query(
        `SELECT dogs.id, dogs.name, dogs.about, dogs.status, dogs.profilepic, T1.count as followers, T2.count as quotes 
        FROM dogs 
        INNER JOIN (SELECT followed_id, COUNT(*) FROM follows GROUP BY followed_id) AS T1 
        ON dogs.id = T1.followed_id 
        INNER JOIN (SELECT quoter_id, COUNT(*) FROM quotes GROUP BY quoter_id) AS T2 
        ON dogs.id = T2.quoter_id`
      );
    })
    .then((result) => {
      feed.dogs = result.rows;
      response.render("feed", feed);
    })
    .catch((error) => console.log(error.stack));
});

app.get("/topup", checkAuth, (request, response) => {
  const { userId } = request.cookies;
  pool
    .query(`SELECT * FROM dogs WHERE id=${userId}`)
    .then((result) => {
      const info = result.rows[0];
      console.log(info);
      response.render("payment", { info });
    })
    .catch((error) => console.log(error));
});

app.post("/charge", (req, res) => {
  req.body;
  console.log(req.body);
  try {
    stripe.customers
      .create({
        name: req.body.name,
        email: req.body.email,
        source: req.body.stripeToken,
      })
      .then((customer) =>
        stripe.charges.create({
          amount: req.body.amount * 100,
          currency: "sgd",
          customer: customer.id,
        })
      )
      .then(() => {
        const updatedBank = Number(req.body.bank) + Number(req.body.amount);
        return pool.query(
          `UPDATE dogs SET bank = ${updatedBank} WHERE id=${Number(
            req.body.id
          )}`
        );
      })
      .then(() => res.render("payment_complete"))
      .catch((err) => console.log("banana", err));
  } catch (err) {
    res.send(err);
  }
});

app.get("/test", (request, response) => {
  const testQuery = `UPDATE dogs SET password = '${setHash(
    "nsMAC8cgG",
    "password"
  )}' WHERE id=1`;
  pool
    .query(testQuery)
    .then((result) => {
      console.log(result.rows);
      response.redirect("/login");
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/feedsearch", (request, response) => {
  console.log(request.body.name);
  pool
    .query(`SELECT * FROM dogs WHERE name='${request.body.name}'`)
    .then((result) => {
      if (result.rows[0]) {
        console.log("found");
        const user = result.rows[0];
        response.redirect(`/dogs/profile/${user.id}`);
      } else {
        return;
      }
    })
    .catch((error) => console.log(error));
  // response.redirect('/feed');
});

// Start server
console.log("Starting server...");
app.listen(PORT);

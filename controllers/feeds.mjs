import jsSHA from "jssha";
const checkAuth = (request, response, next) => {
  if (request.isUserLoggedIn === false) {
    response.clearCookie("userId");
    response.clearCookie("session");
    response.redirect("/login");
    return;
  }
  next();
};
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

export default function initFeedController(app, pool) {

  const index = async (request, response) => {
    try {
      const feed = {};
      const { userId } = request.cookies;
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
      const queriedFeed = await pool.query(feedQuoteQuery);
      feed.quotes = queriedFeed.rows;
      const queriedUsers = await pool.query(
          `SELECT dogs.id, dogs.name, dogs.about, dogs.status, dogs.profilepic, T1.count as followers, T2.count as quotes 
          FROM dogs 
          INNER JOIN (SELECT followed_id, COUNT(*) FROM follows GROUP BY followed_id) AS T1 
          ON dogs.id = T1.followed_id 
          INNER JOIN (SELECT quoter_id, COUNT(*) FROM quotes GROUP BY quoter_id) AS T2 
          ON dogs.id = T2.quoter_id`
      );
      feed.dogs = queriedUsers.rows;
      response.render("feeds/feed", feed);
    } catch (error) {
      console.log(error);
    }
  }

  const getHelp =  (request, response) => {
    response.render("feeds/help");
  }

  const search = async (request, response) => {
    try {
      const queriedUser = await pool.query(`SELECT * FROM dogs WHERE name='${request.body.name}'`);
      if (queriedUser.rows[0]) {
        console.log("found");
        const user = queriedUser.rows[0];
        response.redirect(`/dogs/profile/${user.id}`);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  }

  const hashPW = async (request, response) => {
    try {
      const testQuery = `UPDATE dogs SET password = '${setHash(
        "nsMAC8cgG",
        "password"
      )}' WHERE id=1`;

      await pool.query(testQuery);
      response.redirect('/login');
    } catch (error) {
      console.log(error);
    }
}


  return {
    index,
    getHelp,
    search,
    hashPW
  }
}
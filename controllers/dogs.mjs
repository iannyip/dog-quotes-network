import moment from "moment";

export default function initDogsController(app, pool) {
  const you = (request, response) => {
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
  }

  const show = (request, response) => {
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
  }

  const editYou = (request, response) => {
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
  }

  const updateYou =  (request, response) => {
    const formData = request.body;
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

  return {
    you,
    show,
    editYou, 
    updateYou
  }

}
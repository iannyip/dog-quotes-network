import jsSHA from "jssha";

const SALT = process.env.salt || "keep barking";

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

export default function initAuthController(app, pool) {
  const showLogin = (request, response) => {
    response.render("./auth/login");
  }

  const createLogin = async (request, response) => {
    try {
      const loginDetails = request.body;  
      const hashedPassword = setHash(loginDetails.password, "password");
      const dogToVerify = await pool.query(`SELECT * FROM dogs WHERE name='${loginDetails.name}'`);
      if (dogToVerify.rows.length === 0) {
          response.redirect("/login");
          return;
        } else {
          const user = dogToVerify.rows[0];
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
    } catch (error) {
      console.log(error);
    }
  }

  const showSignup1 = (request, response) => {
    response.render("./auth/signup1");
  }

  const createSignup1 = (request, response) => {
    const newUserDataPartial = request.body;
    newUserDataPartial.password = setHash(
      newUserDataPartial.password,
      "password"
    );
    response.render("./auth/signup2", newUserDataPartial);
  }

  const createSignup2 = (request, response) => {
    const newUserDataPartial = request.body;
    response.render("./auth/signup3", newUserDataPartial);
  }

  const createSignup3 = async (request, response) => {
    try {
      const newUserData = request.body;
      const inputNewUser = [
        newUserData.name,
        newUserData.password,
        newUserData.dob,
        newUserData.about,
        request.file.filename,
      ];
      await pool.query(`INSERT INTO dogs (name, password, dob, about, status, bank, profilepic) VALUES ($1, $2, $3, $4, 1, 0, $5)`,inputNewUser);
      const queryUserArr = [newUserData.name, newUserData.password];
      const createdDog = await pool.query(`SELECT * FROM dogs WHERE (name=$1 AND password=$2)`,queryUserArr);
      const newUserId = createdDog.rows[0].id;
      response.cookie("session", setHash(newUserId, "session"));
      response.cookie("userId", newUserId);
      response.redirect("/feed");
    } catch (error) {
      console.log(error);
    }
  }

  const logout = (request, response) => {
    response.clearCookie("userId");
    response.clearCookie("session");
    response.redirect("/login");
  }

  return {
    showLogin,
    createLogin, 
    showSignup1,
    createSignup1,
    createSignup2,
    createSignup3,
    logout
  }

}
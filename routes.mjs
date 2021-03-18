// import db from './models/index.mjs';
import multer from "multer";
import jsSHA from "jssha";
const SALT = process.env.salt || "keep barking";
const multerUpload = multer({ dest: "profile_pictures/" });

// import the controller
import initQuotesController from './controllers/quotes.mjs';
import initDogsController from './controllers/dogs.mjs';
import initAuthController from './controllers/auth.mjs';
import initFollowsController from './controllers/follows.mjs';
import initTrxnsController from './controllers/transactions.mjs';
import initFeedController from './controllers/feeds.mjs';

export default function bindRoutes(app, pool) {

  // Middleware
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

  const checkAuth = (request, response, next) => {
  if (request.isUserLoggedIn === false) {
    response.clearCookie("userId");
    response.clearCookie("session");
    response.redirect("/login");
    return;
  }
  next();
};

  // pass in the db for all items callbacks
  const QuoteController = initQuotesController(app, pool);
  const DogController = initDogsController(app, pool);
  const AuthController = initAuthController(app, pool);
  const FollowsController = initFollowsController(app, pool);
  const TrxnsController = initTrxnsController(app, pool);
  const FeedController = initFeedController(app, pool);
  
  // Routes
  app.post('/quote/new', QuoteController.create);
  app.get("/quote/:id/edit", QuoteController.showEdit);
  app.put("/quote/:id/edit", QuoteController.update);
  app.delete("/quote/:id/delete", QuoteController.del);

  app.get("/dogs/profile/:id", DogController.show);
  app.get("/dogs/you", DogController.you);
  app.get("/dogs/you/edit", DogController.editYou);
  app.put("/dogs/you/edit", multerUpload.single("profilepic"),DogController.updateYou);

  app.get("/topup", checkAuth, DogController.showStripe);
  app.post("/charge", DogController.updateStripe);

  app.get("/login", AuthController.showLogin);
  app.post("/login", AuthController.createLogin);
  app.get("/signup/1", AuthController.showSignup1);
  app.post("/signup/1", AuthController.createSignup1);
  app.post("/signup/2", AuthController.createSignup2);
  app.post("/signup/3", multerUpload.single("profilepic"), AuthController.createSignup3);
  app.delete("/logout", AuthController.logout);

  app.post("/follow", FollowsController.create);
  app.delete("/unfollow", FollowsController.del);

  app.get("/quote/:id/tip", TrxnsController.show);
  app.post("/quote/:id/tip", TrxnsController.create);

  app.get('/feed', checkAuth, FeedController.index);
  app.get("/", checkAuth, FeedController.index);
  app.get("/help", FeedController.getHelp);
  app.post("/feedsearch", FeedController.search);
  app.get("/test", FeedController.hashPW);
}
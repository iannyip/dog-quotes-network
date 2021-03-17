// import db from './models/index.mjs';
import multer from "multer";
const multerUpload = multer({ dest: "profile_pictures/" });

// import the controller
import initQuotesController from './controllers/quotes.mjs';
import initDogsController from './controllers/dogs.mjs';
import initAuthController from './controllers/auth.mjs';

export default function bindRoutes(app, pool) {
  // pass in the db for all items callbacks
  const QuoteController = initQuotesController(app, pool);
  const DogController = initDogsController(app, pool);
  const AuthController = initAuthController(app, pool);
  
  app.post('/quote/new', QuoteController.create);
  app.get("/quote/:id/edit", QuoteController.showEdit);
  app.put("/quote/:id/edit", QuoteController.update);
  app.delete("/quote/:id/delete", QuoteController.del);

  app.get("/dogs/profile/:id", DogController.show);
  app.get("/dogs/you", DogController.you);
  app.get("/dogs/you/edit", DogController.editYou);
  app.put("/dogs/you/edit", multerUpload.single("profilepic"),DogController.updateYou);

  app.get("/login", AuthController.showLogin);
  app.post("/login", AuthController.createLogin);
  app.get("/signup/1", AuthController.showSignup1);
  app.post("/signup/1", AuthController.createSignup1);
  app.post("/signup/2", AuthController.createSignup2);
  app.post("/signup/3", multerUpload.single("profilepic"), AuthController.createSignup3);
  app.delete("/logout", AuthController.logout);
}
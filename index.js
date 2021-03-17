// import packages
import express from "express";
import pg from "pg";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import multer from "multer";
import bodyParser from "body-parser";
import jsSHA from "jssha";
import bindRoutes from "./routes.mjs";

// For deployment
const PORT = process.argv[2] || 3004;
const SALT = process.env.salt || "keep barking";


// Set up
const { Pool } = pg;
let pgConnectionConfig;
if (process.env.ENV === "PRODUCTION") {
  pgConnectionConfig = {
    user: "postgres",
    password: process.env.DB_password,
    host: "localhost",
    database: "doggos",
    port: 5432,
  };
} else {
  pgConnectionConfig = {
    user: "iannyip",
    host: "localhost",
    database: "doggos",
    port: 5432,
  };
}

const pool = new Pool(pgConnectionConfig);
const app = express();

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use("/public", express.static("public"));
app.use(express.static("profile_pictures"));

bindRoutes(app, pool);

// Start server
console.log("Starting server...");
app.listen(PORT);

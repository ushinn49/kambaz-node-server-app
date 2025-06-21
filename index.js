import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import Lab5Routes from "./Lab5/index.js";

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";
mongoose.connect(CONNECTION_STRING);

const app = express();

app.use(
  cors({
    credentials: true,
    origin: [process.env.NETLIFY_URL || "http://localhost:5173", "http://127.0.0.1:5173"],
  })
);

app.set("trust proxy", 1);
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "a-super-secret-key-that-is-long",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_ENV === "development" ? undefined : process.env.NODE_SERVER_DOMAIN,
  }
};

if (process.env.NODE_ENV !== "development") {
  // sessionOptions.proxy = true; // already set with app.set("trust proxy", 1)
}

app.use(session(sessionOptions));
app.use(express.json());

UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
Lab5Routes(app);

const port = process.env.PORT || 4000;
app.listen(port);
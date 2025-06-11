import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";
import Lab5 from "./Lab5/index.js";

const app = express();

// --- START OF FIX ---
// Define a list of allowed origins.
const allowedOrigins = [
  process.env.NETLIFY_URL,
  "http://localhost:5173",
  "http://localhost:4000",
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is in our allowed list or if it's a Netlify deploy preview.
      // Netlify deploy previews have a pattern like: https://[deploy-id]--yoursitename.netlify.app
      if (allowedOrigins.indexOf(origin) !== -1 || (origin && origin.endsWith("--yuchen-kambaz.netlify.app"))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  })
);
// --- END OF FIX ---


const sessionOptions = {
  secret: process.env.SESSION_SECRET || "a-super-secret-key-that-is-long",
  resave: false,
  saveUninitialized: false,
};

if (process.env.NODE_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.NODE_SERVER_DOMAIN,
  };
}
app.use(session(sessionOptions));
app.use(express.json());

UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
Lab5(app);

const port = process.env.PORT || 4000;
app.listen(port);
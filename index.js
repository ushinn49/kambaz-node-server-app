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


const allowedOrigins = [
  "http://localhost:5173",
  "https://a5--yuchen-kambaz.netlify.app",
  "https://yuchen-kambaz.netlify.app" 
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps/postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation"));
    }
  })
);

   app.set("trust proxy", 1);           // 如果在 Render、Heroku、Vercel 等反向代理后面
   app.use(session({
     secret: "a-super-secret-key-that-is-long",
     resave: false,
     saveUninitialized: false,
     cookie: {
       sameSite: "none",   // 关键：允许跨站点发送
       secure: true,       // 关键：HTTPS 才允许浏览器存/发此 cookie
       maxAge: 24 * 60 * 60 * 1000
     }
   }));

app.use(express.json());

UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
EnrollmentRoutes(app);
Lab5(app);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

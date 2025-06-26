import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
// 动态导入，避免未安装时立即报错
let MongoStore;
try {
  MongoStore = (await import("connect-mongo")).default;
  console.log("Connect-mongo imported successfully");
} catch (err) {
  console.warn("Failed to import connect-mongo:", err.message);
  console.warn("Using memory store instead (not suitable for production)");
}

import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import AssignmentRoutes from "./Kambaz/Assignments/routes.js";
import Lab5Routes from "./Lab5/index.js";
import dbData from "./Kambaz/Database/index.js";

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";
console.log("Connecting to MongoDB at:", CONNECTION_STRING.replace(/\/\/(.+?)@/, "//***:***@"));

mongoose.connect(CONNECTION_STRING, {
  dbName: "kambaz",   // ← 强制使用 kambaz 数据库
})
.then(() => console.log("MongoDB connected to kambaz"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    // 不退出进程，让应用继续运行，只是会话功能可能不可用
  });

// 导入初始数据到数据库
async function importInitialData() {
  try {
    // 导入用户数据
    const UserModel = mongoose.model("UserModel");
    const usersCount = await UserModel.countDocuments();
    
    if (usersCount === 0) {
      console.log("No users found in database. Importing initial data...");
      
      const usersData = dbData.users;
      await UserModel.insertMany(usersData);
      console.log(`Imported ${usersData.length} users`);
    } else {
      console.log(`Database already contains ${usersCount} users`);
    }

    // 导入课程数据
    const CourseModel = mongoose.model("CourseModel");
    const coursesCount = await CourseModel.countDocuments();
    
    if (coursesCount === 0) {
      console.log("No courses found in database. Importing course data...");
      
      const coursesData = dbData.courses;
      await CourseModel.insertMany(coursesData);
      console.log(`Imported ${coursesData.length} courses`);
    } else {
      console.log(`Database already contains ${coursesCount} courses`);
    }
    
    // 导入选课数据
    const EnrollmentModel = mongoose.model("EnrollmentModel");
    const enrollmentsCount = await EnrollmentModel.countDocuments();
    
    if (enrollmentsCount === 0) {
      console.log("No enrollments found in database. Importing enrollment data...");
      
      const enrollmentsData = dbData.enrollments;
      
      // 手动循环创建每个选课记录，确保引用正确
      for (const enrollment of enrollmentsData) {
        try {
          const enrollmentDoc = {
            _id: `${enrollment.user}-${enrollment.course}`,
            user: enrollment.user,
            course: enrollment.course
          };
          await EnrollmentModel.create(enrollmentDoc);
          console.log(`Created enrollment: ${enrollmentDoc._id}`);
        } catch (err) {
          console.error(`Error creating enrollment for user ${enrollment.user}, course ${enrollment.course}:`, err);
        }
      }
      console.log(`Attempted to import ${enrollmentsData.length} enrollments`);
    } else {
      console.log(`Database already contains ${enrollmentsCount} enrollments`);
    }
  } catch (error) {
    console.error("Error importing initial data:", error);
  }
}

const app = express();

app.use(
  cors({
    credentials: true,
    origin: [
      process.env.NETLIFY_URL || "http://localhost:5173", 
      "http://127.0.0.1:5173",
      "https://yuchen-kambaz-a6.netlify.app"
    ],
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
  }
};

// 只有在MongoStore可用且数据库连接正常时才使用MongoDB存储
if (MongoStore && mongoose.connection.readyState === 1) {
  try {
    sessionOptions.store = MongoStore.create({
      mongoUrl: CONNECTION_STRING,
      ttl: 14 * 24 * 60 * 60, // 保存14天
      autoRemove: 'native' // 默认
    });
    console.log("Using MongoDB session store");
  } catch (e) {
    console.error("Failed to create MongoDB session store:", e.message);
    console.warn("Falling back to memory store");
  }
} else {
  console.warn("Using memory store for sessions - NOT suitable for production");
}

if (process.env.NODE_ENV !== "development") {
  // sessionOptions.proxy = true; // already set with app.set("trust proxy", 1)
}

app.use(session(sessionOptions));
app.use(express.json());

// 添加健康检查端点
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Kambaz API is running",
    sessionStore: sessionOptions.store ? "MongoDB" : "MemoryStore"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    sessionStore: sessionOptions.store ? "MongoDB" : "MemoryStore",
    timestamp: new Date().toISOString()
  });
});

UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
Lab5Routes(app);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

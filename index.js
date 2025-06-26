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

const app = express();

// ======= CORS 配置移到最顶部 ========
// 定义允许的来源
const allowedOrigins = [
  "https://yuchen-kambaz-a6.netlify.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

// 配置CORS中间件，确保所有响应都带CORS头
app.use(cors({
  origin: function(origin, callback) {
    // 允许来自allowedOrigins中的请求或没有origin的请求（如直接访问API）
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      // 记录被拒绝的origin，但依然允许（调试模式）
      console.warn(`CORS rejected origin: ${origin}`);
      callback(null, allowedOrigins[0]); // 默认允许第一个origin
    }
  },
  credentials: true, // 允许跨域请求携带凭据（cookies）
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
  exposedHeaders: "Set-Cookie", // 允许前端访问Set-Cookie头
  optionsSuccessStatus: 204 // 预检请求的成功状态码
}));

// 处理OPTIONS预检请求
app.options("*", cors());
// ======= CORS配置结束 ========

// 必须紧跟CORS中间件后
app.use(express.json());

app.set("trust proxy", 1);
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "a-super-secret-key-that-is-long",
  resave: false,
  saveUninitialized: true, // 改为true确保未登录用户也能收到cookie
  cookie: {
    sameSite: "none",
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 保留一周
    httpOnly: false // 临时允许前端JS访问cookie，便于调试
  }
};

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz";
console.log("Connecting to MongoDB at:", CONNECTION_STRING.replace(/\/\/(.+?)@/, "//***:***@"));

mongoose.connect(CONNECTION_STRING, {
  dbName: "kambaz", // 强制使用kambaz数据库
})
  .then(() => {
    console.log("MongoDB connected to kambaz");
    
    // 导入初始数据
    importInitialData();
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    // 不退出进程，让应用继续运行，只是会话功能可能不可用
  });

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

// 添加会话中间件
app.use(session(sessionOptions));

// 添加错误处理中间件，确保即使出错也带上CORS头
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  
  if (res.headersSent) {
    return next(err);
  }
  
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

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
      try {
        await CourseModel.insertMany(coursesData, { ordered: false });
        console.log(`Imported ${coursesData.length} courses`);
      } catch (e) {
        if (e.code !== 11000) throw e; // 非重复键错误才抛出
        console.log(`Some courses already exist, skipping duplicates`);
      }
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
          if (err.code !== 11000) { // 跳过重复键错误
            console.error(`Error creating enrollment for user ${enrollment.user}, course ${enrollment.course}:`, err);
          }
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

UserRoutes(app);
CourseRoutes(app);
ModuleRoutes(app);
AssignmentRoutes(app);
Lab5Routes(app);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

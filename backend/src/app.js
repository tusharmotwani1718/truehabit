import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import envconf from "./conf/envconfig.js";

const app = express();

// app.set("trust proxy", true); 
app.set("trust proxy", "127.0.0.1"); // when running behind nginx+pm2 on localhost


// MIDDLEWARES:
app.use(cors({
  origin: envconf.corsOrigin,
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import habitRouter from "./routes/habit.routes.js";
import groupRouter from "./routes/group.routes.js";



// routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/habits', verifyJWT, habitRouter);
app.use('/api/v1/groups', verifyJWT, groupRouter);

export { app };

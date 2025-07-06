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
import habitRouterV1  from "./routes/habits/habit.v1.routes.js";
import habitRouterV2 from './routes/habits/habit.v2.routes.js';
import groupRouter from "./routes/group.routes.js";



// routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/habits', verifyJWT, habitRouterV1);
app.use('/api/v2/habits', verifyJWT, habitRouterV2);
app.use('/api/v2/groups', verifyJWT, groupRouter);

export { app };

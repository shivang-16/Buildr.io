import express, { urlencoded } from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import expressWinston from "express-winston";
import winston from "winston";
import errorMiddleware from "./middlewares/error";
import authRoutes from "./routes/auth";
import googleRoutes from "./routes/googleAuth";
import postRoutes from "./routes/post";
import userRoutes from "./routes/user";
import notificationRoutes from "./routes/notification";


config({
  path: "./.env",
});

const app: express.Application = express();

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli()
    ),
    meta: true,
    expressFormat: true,
    colorize: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));

const allowedOrigins = [process.env.FRONTEND_URL!, "http://localhost:4002", "http://localhost:3000"];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);


app.get("/api", (req, res) => {
  res.send("Hello, world!");
});

app.use(errorMiddleware);

export { app };

import express, { Request, Response } from "express";
import http from "http";
import pool from "./db/db";
import { authRouter } from "./routes";
import todoRouter from "./routes/todos";
import authorize from "./middlewares/authMiddelware";

const app = express();
app.use(express.json());
app.get("/", (req: Request, res: Response) => {
  res.send({ msg: "Hello World!" });
});

app.use("/auth", authRouter);
app.use("/todos", authorize, todoRouter);

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

pool
  .connect()
  .then(() => {
    console.log("Connected to the database");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database", err);
  });

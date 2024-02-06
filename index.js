import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import promptRoutes from "./routes/prompt.js";
import assistantRoutes from "./routes/assistant.js";
import fs from "fs";
import mongoose from "mongoose";
import conversationRoutes from './routes/conversation.js'

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());

app.use("/", conversationRoutes);
app.use("/prompt", promptRoutes);
app.use("/assistant", assistantRoutes);


const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect!`));
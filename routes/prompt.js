import express from "express";
import { sendMsgToOpenAI } from "../Controllers/prompt.js";


const router = express.Router();

// POST
router.post("/getSummary", sendMsgToOpenAI);

export default router;
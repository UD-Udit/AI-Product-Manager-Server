import express from "express"
import { submitConversation } from "../Controllers/conversation.js";


const router = express.Router();

router.post("/submitConversation", submitConversation);


export default router;
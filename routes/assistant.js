import express from "express"
import { getConversation, sendMessage, startConversation } from "../Controllers/assistant.js";


const router = express.Router();
// GET

router.get("/:threadId", getConversation);

// POST
router.post("/", startConversation);
router.post("/chat", sendMessage);

export default router;
import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    chat: {
        type: Array,
        required: true,
    },
});

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;

import Conversation from "../Models/Conversation.js";

export const submitConversation = async(req, res) => {
    try{
               
        const email = req.body.email; 
        const conversation = req.body.conversation;

        const convo = new Conversation({
            email: email,
            chat: conversation
        });
        const savedConvo = await convo.save();
        

        res.status(200).json({conversation: savedConvo});
        
    }catch(e){
        console.error("Error:", e);
        res.status(500).json({ error: "Something went wrong", message: e.message });
    }
}
import OpenAI from "openai";


const startConversation = async(req, res) => {
    const openai = new OpenAI({apiKey: process.env.OPENAI_KEY});
    try {
        const assistant = await openai.beta.assistants.create({
            name: "ProdBot",
            instructions: "You are a Product Manager. Ask relevant questions from the client about what kind of project he wants us to create, but only one question at a time. Start by giving your introduction and asking for the product's name. Your response must not exceed 60 words at a time. When you are done with the conversation your last response must be `You can submit the conversation now for further steps.` Remember, don't ask the client to upload any document in the entire conversation",
            tools: [{ type: "code_interpreter" }],
            model: "gpt-4-turbo-preview"
        });
    
        const thread = await openai.beta.threads.create();
    
        let run = await openai.beta.threads.runs.create(
            thread.id,
            { 
                assistant_id: assistant.id
            }
        );
        while (run.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            run = await openai.beta.threads.runs.retrieve(
                thread.id,
                run.id
            );
            console.log(run.status);
        }
    
        const messages = await openai.beta.threads.messages.list(thread.id);
        const lastMessage = messages.data.filter(
            (message) => message.run_id === run.id && message.role === "assistant"
        ).pop();
        res.status(200).json({content: lastMessage.content[0].text.value, threadId: thread.id, assistantId: assistant.id});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

const sendMessage = async(req, res) => {
    const prompt = req.body.message;
    if (!prompt) {
        throw new Error("Message is empty");
    }

    const threadId = req.body.threadId;
    if (!threadId) {
        throw new Error("ThreadId is empty");
    }

    const assistantId = req.body.assistantId;
    if (!assistantId) {
        throw new Error("assistantId is empty");
    }
    try{
        const openai = new OpenAI({apiKey: process.env.OPENAI_KEY});
        const message = await openai.beta.threads.messages.create(
            threadId,
            {
              role: "user",
              content: prompt
            }
        );
        let run = await openai.beta.threads.runs.create(
            threadId,
            { 
                assistant_id: assistantId,
            }
        );
        console.log("Running", run.status);
        while (run.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            run = await openai.beta.threads.runs.retrieve(
                threadId,
                run.id
            );
            console.log(run.status);
        }
        console.log("loop done");

        const messages = await openai.beta.threads.messages.list(
            threadId
          );
        
        const lastMessage = messages.data.filter(
            (message) => message.run_id === run.id && message.role === "assistant"
        ).pop();
        
        res.status(200).json({content: lastMessage.content[0].text.value});
        
        
    }catch(error){
        res.status(400).json({error: error.message})
    }
}

const getConversation = async(req, res) => {

    const threadId = req.params.threadId;
    if (!threadId) {
        throw new Error("ThreadId is empty");
    }

    try{
        const openai = new OpenAI({apiKey: process.env.OPENAI_KEY});

        const messages = await openai.beta.threads.messages.list(
            threadId
          );
        
        const simplifiedMessages = messages.data.map(({ role, content }) => ({
            "role": role,
            "content": content[0]?.text?.value || "", 
        }));  
        res.status(200).json({ messages: simplifiedMessages });
    } catch(error){
        res.status(400).json({error: error.message})
    }
}

export {startConversation, sendMessage, getConversation};
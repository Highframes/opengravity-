import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ override: true });

const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
});

async function test() {
    console.log("Checking Groq with key:", process.env.GROQ_API_KEY?.substring(0, 10), "...");
    try {
        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "Hi" }],
        });
        console.log("Response:", response.choices[0].message.content);
    } catch (e: any) {
        console.error("Error:", e.status, e.message);
        if (e.response) console.error("Data:", e.response.data);
    }
}

test();

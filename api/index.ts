import { Bot, webhookCallback } from "grammy";
import { runAgent } from "./src/agent.js";
import { saveMessage } from "./src/database.js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error("ERRO: TELEGRAM_BOT_TOKEN não configurado!");
}

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "");
const ALLOWED_IDS = process.env.TELEGRAM_ALLOWED_USER_IDS?.split(",").map(Number) || [];

bot.on("message:text", async (ctx) => {
    if (!ALLOWED_IDS.includes(ctx.from.id)) {
        return ctx.reply(`Acesso negado. Seu User ID (${ctx.from.id}) não está autorizado.`);
    }

    try {
        const userMessage = ctx.message.text || "";
        await saveMessage("user", userMessage);

        const reply = await runAgent(userMessage);
        const botReply = reply || "Não consegui processar isso.";

        await saveMessage("assistant", botReply);
        await ctx.reply(botReply);
    } catch (e) {
        console.error("Erro no processamento:", e);
    }
});

const handleUpdate = webhookCallback(bot, "http");

export default async function handler(req: any, res: any) {
    try {
        if (req.method === "POST") {
            return await handleUpdate(req, res);
        }
        res.status(200).send("OpenGravity Bot está ATIVO e aguardando mensagens via Webhook do Telegram! 🚀");
    } catch (e: any) {
        console.error("DEBUG ERROR:", e);
        res.status(500).json({ error: e.message, stack: e.stack });
    }
}

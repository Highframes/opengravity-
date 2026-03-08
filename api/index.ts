import { Bot, webhookCallback } from "grammy";
import { runAgent } from "./src/agent.js";
import { saveMessage } from "./src/database.js";
import dotenv from "dotenv";

dotenv.config();

// Inicialização do Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN não configurado no ambiente da Vercel.");
}

const bot = new Bot(token);
const ALLOWED_IDS = process.env.TELEGRAM_ALLOWED_USER_IDS?.split(",").map(Number) || [];

// Lógica do Bot
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
        console.error("Erro no processamento da mensagem:", e);
    }
});

// Callback oficial da Grammy para Vercel (rodando em modo 'http')
const handleUpdate = webhookCallback(bot, "http");

export default async function handler(req: any, res: any) {
    // SÓ processamos via Grammy se for um POST (que é o que o Telegram envia)
    if (req.method === "POST") {
        return await handleUpdate(req, res);
    }

    // Para GET (acesso via navegador), retornamos apenas o status
    res.status(200).send("OpenGravity Bot: Sistema ON-LINE e aguardando mensagens via Webhook do Telegram! 🚀");
}

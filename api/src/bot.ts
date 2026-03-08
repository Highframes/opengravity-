import { Bot } from "grammy";
import dotenv from "dotenv";
import { runAgent } from "./agent.js";
import { saveMessage } from "./database.js";

dotenv.config();

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
const ALLOWED_IDS = process.env.TELEGRAM_ALLOWED_USER_IDS?.split(",").map(Number) || [];

// Configuração de comandos
await bot.api.setMyCommands([
    { command: "start", description: "Iniciar o OpenGravity" },
    { command: "help", description: "Ver ajuda" },
]);

bot.command("start", (ctx) => ctx.reply("🚀 OpenGravity online! Envie uma mensagem para começar."));
bot.command("help", (ctx) => ctx.reply("Eu sou o OpenGravity! Agora posso gerenciar seu Google Workspace (Gmail, Agenda, Drive) e criar Pull Requests no GitHub, além de responder suas dúvidas. Como posso ajudar?"));

bot.on("message:text", async (ctx) => {
    if (!ALLOWED_IDS.includes(ctx.from.id)) {
        return ctx.reply(`Acesso negado. Seu User ID (${ctx.from.id}) não está autorizado. No arquivo .env, adicione este ID em TELEGRAM_ALLOWED_USER_IDS.`);
    }

    await ctx.replyWithChatAction("typing");

    try {
        const userMessage = ctx.message.text || "";
        await saveMessage("user", userMessage);

        const reply = await runAgent(userMessage);
        const botReply = reply || "Não consegui processar isso.";

        await saveMessage("assistant", botReply);
        await ctx.reply(botReply);
    } catch (e) {
        console.error(e);
        await ctx.reply("Erro no processamento local.");
    }
});

console.log("🚀 OpenGravity online via Telegram...");
export default bot;

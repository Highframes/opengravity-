import { onRequest } from "firebase-functions/v2/https";
import { Bot, webhookCallback } from "grammy";
import { runAgent } from "./agent.js";
import { saveMessage } from "./database.js";
import dotenv from "dotenv";
dotenv.config();
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
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
    }
    catch (e) {
        console.error("Erro no processamento:", e);
        await ctx.reply("Erro no processamento na nuvem.");
    }
});
export const opengravity = onRequest({ region: "southamerica-east1" }, webhookCallback(bot, "https"));
//# sourceMappingURL=index.js.map
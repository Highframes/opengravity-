import { runAgent } from "./agent.js";

async function testAgent() {
    console.log("🧪 Testando o Agente OpenGravity...");

    const queries = [
        "Olá, quem é você?",
        "Que horas são agora?",
    ];

    for (const query of queries) {
        console.log(`\n👤 Usuário: ${query}`);
        try {
            const response = await runAgent(query);
            console.log(`🤖 Agente: ${response}`);
        } catch (error: any) {
            console.error(`\n❌ Erro ao testar query "${query}":`);
            if (error.status) console.error(`Status: ${error.status}`);
            if (error.message) console.error(`Message: ${error.message}`);
            if (error.response?.data) console.error(`Data:`, JSON.stringify(error.response.data, null, 2));
            if (!error.status && !error.message) console.error(error);
        }
    }
}

testAgent().catch(console.error);

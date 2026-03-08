import OpenAI from "openai";
import { get_current_time } from "./tools/time.js";
import { create_pr_tool } from "./tools/create_pr.js";
import { gog_tool } from "./tools/gog.js";
import { listSkills, getSkillInstructions } from "./skills.js";
import { evolution_tool, suggestion_tool } from "./tools/evolution.js";
import { updater_tool } from "./tools/updater.js";
import { getRecentMessages } from "./database.js";
import dotenv from "dotenv";
dotenv.config({ override: true });
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
export async function runAgent(userInput) {
    const openai = new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY,
    });
    // Configuração das ferramentas para o OpenAI/OpenRouter
    const tools = [
        {
            type: "function",
            function: get_current_time.definition.function,
        },
        {
            type: "function",
            function: create_pr_tool.definition,
        },
        {
            type: "function",
            function: gog_tool.definition,
        },
        {
            type: "function",
            function: {
                name: "list_skills",
                description: "Lista as habilidades de metodologia (superpowers) disponíveis para planejamento e execução. Use isto inicialmente para entender quais abordagens profissionais você pode adotar.",
                parameters: { type: "object", properties: {} }
            }
        },
        {
            type: "function",
            function: {
                name: "load_skill",
                description: "Carrega as instruções completas de uma metodologia específica (superpower).",
                parameters: {
                    type: "object",
                    properties: {
                        skill_path: { type: "string", description: "O caminho/nome do diretório da habilidade (ex: test-driven-development)." }
                    },
                    required: ["skill_path"]
                }
            }
        },
        {
            type: "function",
            function: evolution_tool.definition,
        },
        {
            type: "function",
            function: suggestion_tool.definition,
        },
        {
            type: "function",
            function: updater_tool.definition,
        }
    ];
    const recentContext = await getRecentMessages(10);
    const historyMessages = recentContext.map((msg) => ({
        role: msg.role,
        content: msg.content
    }));
    let messages = [
        {
            role: "system",
            content: "Você é o OpenGravity, um agente pessoal local altamente profissional e autônomo. Você tem acesso a 'Superpowers' (metodologias) e ferramentas de 'Evolução'. Você deve ser proativo: sugira melhorias no seu próprio código com `suggest_improvements`, busque novas habilidades com `search_new_skills` quando o usuário pedir algo novo, e aplique atualizações com `apply_self_update` (sempre pedindo confirmação antes). Mantenha seu código limpo, siga TDD e evolua constantemente. Seja conciso e útil.",
        },
        ...historyMessages,
        {
            role: "user",
            content: userInput,
        },
    ];
    for (let i = 0; i < 5; i++) {
        const response = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: messages,
            tools: tools,
        });
        const message = response.choices[0].message;
        messages.push(message);
        if (!message.tool_calls) {
            return message.content;
        }
        for (const toolCall of message.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            let functionResponse;
            console.log(`🔧 Chamando ferramenta: ${functionName}`, functionArgs);
            if (functionName === "get_current_time") {
                functionResponse = await get_current_time.handler();
            }
            else if (functionName === "create_pull_request") {
                functionResponse = await create_pr_tool.handler(functionArgs);
            }
            else if (functionName === "gog") {
                functionResponse = await gog_tool.handler(functionArgs);
            }
            else if (functionName === "list_skills") {
                functionResponse = JSON.stringify(listSkills());
            }
            else if (functionName === "load_skill") {
                functionResponse = getSkillInstructions(functionArgs.skill_path) || "Habilidade não encontrada.";
            }
            else if (functionName === "search_new_skills") {
                functionResponse = await evolution_tool.handler(functionArgs);
            }
            else if (functionName === "suggest_improvements") {
                functionResponse = await suggestion_tool.handler();
            }
            else if (functionName === "apply_self_update") {
                functionResponse = await updater_tool.handler(functionArgs);
            }
            messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: functionName,
                content: String(functionResponse),
            });
        }
    }
    return "Não consegui processar isso dentro do limite de iterações.";
}
//# sourceMappingURL=agent.js.map
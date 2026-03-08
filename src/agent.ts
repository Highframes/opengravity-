import OpenAI from "openai";
import { get_current_time } from "./tools/time.js";
import { create_pr_tool } from "./tools/create_pr.js";
import { gog_tool } from "./tools/gog.js";
import { listSkills, getSkillInstructions } from "./skills.js";
import dotenv from "dotenv";

dotenv.config({ override: true });

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export async function runAgent(userInput: string) {
    const openai = new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY,
    });

    // Configuração das ferramentas para o OpenAI/OpenRouter
    const tools: any = [
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
        }
    ];

    let messages: any[] = [
        {
            role: "system",
            content: "Você é o OpenGravity, um agente pessoal local altamente profissional. Você tem acesso a 'Superpowers' (metodologias de engenharia e colaboração). Quando confrontado com tarefas complexas, considere listar suas habilidades com `list_skills` e carregar as instruções relevantes com `load_skill` para seguir as melhores práticas (como TDD, Plan Writing, etc.). Seja conciso e útil.",
        },
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
            } else if (functionName === "create_pull_request") {
                functionResponse = await create_pr_tool.handler(functionArgs as any);
            } else if (functionName === "gog") {
                functionResponse = await gog_tool.handler(functionArgs as any);
            } else if (functionName === "list_skills") {
                functionResponse = JSON.stringify(listSkills());
            } else if (functionName === "load_skill") {
                functionResponse = getSkillInstructions(functionArgs.skill_path) || "Habilidade não encontrada.";
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

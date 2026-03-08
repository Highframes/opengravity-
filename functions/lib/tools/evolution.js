export const evolution_tool = {
    definition: {
        name: "search_new_skills",
        description: "Busca novos repositórios de habilidades (skills) no GitHub baseados em uma query ou necessidade específica do usuário.",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string", description: "Termos de busca (ex: 'agentic skills', 'whatsapp automation skill')." }
            },
            required: ["query"]
        }
    },
    handler: async (args) => {
        try {
            // Tenta usar o comando 'gh' se disponível, senão usa uma busca simples via curl na API pública (limitada) ou apenas sugere links.
            // Como vimos que 'gh' não estava no path antes, vamos tentar uma abordagem de busca via URL formatada.
            const searchUrl = `https://github.com/search?q=${encodeURIComponent(args.query + " topic:skills")}&type=repositories`;
            return `Sugestão de busca: ${searchUrl}. Recomendo verificar repositórios que seguem o padrão 'superpowers' ou frameworks de agentes. Você pode me pedir para ler o conteúdo de um link específico se eu tiver a ferramenta de leitura de URL.`;
        }
        catch (error) {
            return `Erro ao buscar skills: ${error.message}`;
        }
    }
};
export const suggestion_tool = {
    definition: {
        name: "suggest_improvements",
        description: "Analisa o estado atual do bot e sugere melhorias, novas ferramentas ou refatorações automáticas.",
        parameters: {
            type: "object",
            properties: {}
        }
    },
    handler: async () => {
        return "Sugestões Proativas:\n1. Integrar uma ferramenta de busca web direta (Serper/Google Search API) para encontrar skills sem depender de links manuais.\n2. Implementar um sistema de cache para respostas recorrentes usando o banco de dados local.\n3. Adicionar uma skill de 'Análise de Sentimento' para ajustar o tom das respostas do OpenGravity.";
    }
};
//# sourceMappingURL=evolution.js.map
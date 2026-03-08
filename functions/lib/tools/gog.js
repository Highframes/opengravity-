import { exec } from "child_process";
import { promisify } from "util";
const execPromise = promisify(exec);
export const gog_tool = {
    definition: {
        name: "gog",
        description: "Executa comandos do Google Workspace CLI (Gmail, Calendar, Drive, Sheets, Docs). Exemplos: 'gmail search some-query', 'calendar events primary --from 2024-01-01T00:00:00Z', 'sheets get <id> Sheet1!A1:B10'.",
        parameters: {
            type: "object",
            properties: {
                command: {
                    type: "string",
                    description: "O comando gog a ser executado (sem o prefixo 'gog'). Exemplo: 'gmail search in:inbox'",
                },
            },
            required: ["command"],
        },
    },
    handler: async (args) => {
        try {
            const { stdout, stderr } = await execPromise(`gog ${args.command}`);
            if (stderr && !stdout) {
                return `Erro: ${stderr}`;
            }
            return stdout || "Comando executado com sucesso (sem saída).";
        }
        catch (error) {
            return `Erro ao executar gog: ${error.message}`;
        }
    },
};
//# sourceMappingURL=gog.js.map
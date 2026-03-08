import { exec } from "child_process";
import { promisify } from "util";
const execPromise = promisify(exec);
export const create_pr_tool = {
    definition: {
        name: "create_pull_request",
        description: "Cria um Pull Request no GitHub seguindo as convenções de título. Requer que as alterações estejam commitadas e a branch enviada (push).",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "Título do PR no formato: type(scope): Summary. Ex: feat(core): Add logging",
                },
                body: {
                    type: "string",
                    description: "Corpo descritivo do PR.",
                },
                draft: {
                    type: "boolean",
                    description: "Se o PR deve ser criado como rascunho (draft).",
                },
            },
            required: ["title", "body"],
        },
    },
    handler: async (args) => {
        try {
            const draftFlag = args.draft ? "--draft" : "";
            const { stdout, stderr } = await execPromise(`gh pr create ${draftFlag} --title "${args.title}" --body "${args.body}"`);
            if (stderr && !stdout) {
                return `Erro: ${stderr}`;
            }
            return `Pull Request criado com sucesso: ${stdout}`;
        }
        catch (error) {
            return `Erro ao criar PR: ${error.message}`;
        }
    },
};
//# sourceMappingURL=create_pr.js.map
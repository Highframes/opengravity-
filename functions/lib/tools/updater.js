import fs from 'fs';
import path from 'path';
export const updater_tool = {
    definition: {
        name: "apply_self_update",
        description: "Aplica alterações propostas no código fonte do bot e atualiza a versão no package.json. Requer aprovação explícita do usuário (através do chat).",
        parameters: {
            type: "object",
            properties: {
                proposal: { type: "string", description: "Descrição detalhada do que foi alterado e por quê." },
                new_version: { type: "string", description: "Nova versão semântica (ex: 1.0.1)." }
            },
            required: ["proposal", "new_version"]
        }
    },
    handler: async (args) => {
        try {
            const packagePath = path.join(process.cwd(), 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            const oldVersion = packageJson.version;
            packageJson.version = args.new_version;
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
            return `Auto-atualização aplicada com sucesso!\nVersão: ${oldVersion} -> ${args.new_version}\nResumo da mudança: ${args.proposal}\n\nNota: Certifique-se de que os arquivos de código correspondentes foram editados e que as dependências (se houver) foram instaladas.`;
        }
        catch (error) {
            return `Erro ao aplicar auto-atualização: ${error.message}`;
        }
    }
};
//# sourceMappingURL=updater.js.map
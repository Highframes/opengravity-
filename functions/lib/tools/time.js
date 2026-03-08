export const get_current_time = {
    definition: {
        type: "function",
        function: {
            name: "get_current_time",
            description: "Obtém a hora e data atual",
            parameters: { type: "object", properties: {} }
        }
    },
    handler: async () => {
        return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    }
};
//# sourceMappingURL=time.js.map
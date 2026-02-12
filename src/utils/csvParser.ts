export const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return resolve([]);

            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            const result = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const currentline = lines[i].split(',');
                const obj: any = {};

                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentline[j]?.trim();
                }
                result.push(obj);
            }
            resolve(result);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

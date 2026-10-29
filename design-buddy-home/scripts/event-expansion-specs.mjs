import fs from'node:fs';
export const specs=JSON.parse(fs.readFileSync(new URL('./event-expansion-content.json',import.meta.url),'utf8'));

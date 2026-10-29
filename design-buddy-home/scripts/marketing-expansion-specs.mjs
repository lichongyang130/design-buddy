import fs from'node:fs';
export const specs=JSON.parse(fs.readFileSync(new URL('./marketing-expansion-content.json',import.meta.url),'utf8'));

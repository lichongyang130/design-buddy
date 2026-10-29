import fs from'node:fs';
export const specs=JSON.parse(fs.readFileSync(new URL('./training-expansion-content.json',import.meta.url),'utf8'));

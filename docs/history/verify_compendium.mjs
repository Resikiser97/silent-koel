import { COMPENDIUM_DATA } from '../config/compendium_data.js';

let bad = [];
for (const section of COMPENDIUM_DATA.sections) {
  for (const entry of section.entries) {
    for (const lang of ['zh-TW', 'en']) {
      const txt = entry.content[lang];
      if (/undefined|NaN/.test(txt)) bad.push(section.id + '/' + entry.id + '/' + lang);
    }
  }
}
console.log('bad entries:', JSON.stringify(bad));
console.log('total sections:', COMPENDIUM_DATA.sections.length);
console.log('mechanics entries:', COMPENDIUM_DATA.sections.find(s => s.id === 'mechanics').entries.map(e => e.id));

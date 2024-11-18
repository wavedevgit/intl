import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import { sendToWebhook } from './comments.js';
import Strings from './Strings.js';

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.goto('https://canary.discord.com/login');
const stringsUnformatted = await page.evaluate(() => {
    let wreq;
    webpackChunkdiscord_app.push([[Symbol()], {}, (r) => (wreq = r)]);
    const chunks = Object.keys(wreq.m)
        .filter((key) => wreq.m[key].toString().includes('let{createLoader:'))
        .map(
            (e) =>
                wreq.m[e].toString().match(/("|')en-US("|'):\(\)=>.+?\(("|')\d+.+\.then\(.+bind\(.,(?<chunkEnUS>\d+)\)/)
                    ?.groups?.chunkEnUS,
        );
    return chunks.map((chunkId) => wreq(chunkId).default);
});
console.log(stringsUnformatted.length);
const stringsHashed = new Strings(stringsUnformatted).parseStrings();
let strings = {};
const mappings = await (
    await fetch('https://raw.githubusercontent.com/happyendermangit/intl/refs/heads/main/mappings.json')
).json();
for (let key in stringsHashed) {
    // @ts-ignore
    strings[mappings[key] ?? key] = stringsHashed[key];
}
const sortedStrings = {};
const storedKeys = Object.keys(strings).sort();
for (let key of storedKeys) sortedStrings[key] = strings[key];
const beforeStrings = JSON.parse(await fs.readFile('./data/strings.json', 'utf-8'));
let save = true;
if (
    Object.values(beforeStrings) === Object.values(sortedStrings) &&
    Object.keys(beforeStrings) === Object.keys(sortedStrings)
) {
    console.log('No changes');
    save = false;
}
if (save) await fs.writeFile('./data/strings.json', JSON.stringify(sortedStrings, null, 4), 'utf-8');
await browser.close();

if (save) sendToWebhook(beforeStrings, sortedStrings);

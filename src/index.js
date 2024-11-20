import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import { sendToWebhook } from './comments.js';
import Strings from './Strings.js';

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.goto('https://canary.discord.com/login');
const [stringsUnformatted, buildInfo] = await page.evaluate(() => {
    let wreq;
    webpackChunkdiscord_app.push([[Symbol()], {}, (r) => (wreq = r)]);
    const chunks = Object.keys(wreq.m)
        .filter((key) => wreq.m[key].toString().includes('let{createLoader:'))
        .map(
            (e) =>
                wreq.m[e].toString().match(/("|')en-US("|'):\(\)=>.+?\(("|')\d+.+\.then\(.+bind\(.,(?<chunkEnUS>\d+)\)/)
                    ?.groups?.chunkEnUS,
        );
    return [
        chunks.map((chunkId) => wreq(chunkId).default),
        Object.values(
            wreq(Object.keys(wreq.m).filter((c) => wreq.m[c].toString().includes('versionHash:"', 'buildNumber:"'))[0]),
        )[0](),
    ];
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
let ast = {};
for (let strings of stringsUnformatted) {
    for (let key in strings) {
        ast[mappings[key] || key] = strings[key];
    }
}
if (
    Object.values(sortedStrings) === Object.values(sortedStrings) &&
    Object.keys(sortedStrings) === Object.keys(sortedStrings)
) {
    console.log('No changes');
    save = false;
}
if (save) {
    await fs.writeFile(
        './data/buildInfo.json',
        JSON.stringify({ versionHash: buildInfo.versionHash, buildNumber: buildInfo.buildNumber }, null, 4),
        'utf-8',
    );
    await fs.writeFile('./data/strings_ast.json', JSON.stringify(ast, null, 4), 'utf-8');
    await fs.writeFile('./data/strings.json', JSON.stringify(sortedStrings, null, 4), 'utf-8');
}
await browser.close();

if (save) sendToWebhook(beforeStrings, sortedStrings);

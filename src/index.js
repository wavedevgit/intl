import puppeteer from 'puppeteer';
import fs from 'fs/promises';

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
const apiUrl = 'https://intl-stuff.wavedev.lol/api/parse';
const req = await fetch(apiUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ScraperBot/1.0',
    },
    body: JSON.stringify(stringsUnformatted),
});
const strings = await req.json();
const sortedStrings = {};
const storedKeys = Object.keys(strings).sort();
for (let key of storedKeys) sortedStrings[key] = strings[key];
await fs.writeFile('./data/strings.json', JSON.stringify(sortedStrings, null, 4), 'utf-8');
await browser.close();

import fs from 'fs/promises';

export function generateDiff(a, b) {
    let result = { added: [], removed: [], updated: [] };
    for (let key in a) {
        if (key === "PLAYSTATION") continue;
        // removed
        if (b[key] === undefined) result.removed.push(`- ${key}: "${a[key]}"`);
        // updated
        if (a[key] !== b[key] && b[key] !== undefined)
            result.updated.push(`- ${key}: "${a[key].replaceAll("\n","\\n")}"\n+ ${key}: "${b[key].replaceAll("\n","\\n")}"`);
    }
    for (let key in b) {
        if (key === "PLAYSTATION") continue;
        // added
        if (a[key] === undefined) result.added.push(`+ ${key}: "${b[key].replaceAll("\n","\\n")}"`);
    }
    let resultString = `\`\`\`diff\n${result.added.length ? '# Added:\n' + result.added.join('\n') : ''}${
        result.removed.length ? '\n# Removed:\n' + result.removed.join('\n') : ''
    }${result.updated.length ? '\n# Updated:\n' + result.updated.join('\n') : ''}\n\`\`\``;
    if (!result.removed.length && !result.added.length && !result.updated.length) return [null, null];
    return [resultString, result];
}
export async function sendToWebhook(a, b) {
    const [diff, data] = generateDiff(a, b);
    if (!diff) {
        console.log('No changes');
        return;
    }
    const buildInfo = JSON.parse(await fs.readFile('./data/buildInfo.json', 'utf-8'));
    const body = JSON.stringify({
        content: "<@&1308863534213369967>",
        embeds: [
            {
                color: 16737792,
                title: `Strings (${data.added.length} (++) ${data.removed.length} (--) ${data.updated.length} (-+) )`,
                // slice the string if its length is bigger then the limit of discord embeds description length
                description: diff.length > 4096 ? diff.slice(0, 3999) + '...\n```' : diff,
            },
            {
                color: 16737792,
                title: 'Build info:',
                description: `👽️ **\`Version Hash\`:** \`${buildInfo.versionHash}\`\n**\`Build Number\`:** \`${buildInfo.buildNumber}\``,
            },
        ],
    });
    console.log(diff);
    fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    });
}

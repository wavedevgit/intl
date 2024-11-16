export function generateDiff(a, b) {
    let result = { added: [], removed: [], updated: [] };
    for (let key in a) {
        // removed
        if (b[key] === undefined) result.removed.push(`- ${key}: "${a[key]}"`);
        // updated
        if (a[key] !== b[key]) result.updated.push(`- ${key}: "${a[key]}"\n+ ${key}: "${b[key]}"`);
    }
    for (let key in b) {
        // added
        if (a[key] === undefined) result.added.push(`+ ${key}: "${b[key]}"`);
    }
    let resultString = `\`\`\`diff\n${result.added.length ? '# Added:\n' + result.added.join('\n') : ''}
    ${result.removed.length ? '# Removed:\n' + result.removed.join('\n') : ''}
    ${result.updated.length ? '# Updated:\n' + result.updated.join('\n') : ''}\n\`\`\`
    `;
    if (!result.removed.length && !result.added.length && !result.updated.length) return null;
    return resultString;
}
export function sendToWebhook(a, b) {
    const diff = generateDiff(a, b);
    if (!diff) {
        console.log('No changes');
        return;
    }
    const body = JSON.stringify({
        content: null,
        embeds: [
            {
                color: 16737792,
                title: 'Strings',
                // slice the string if its length is bigger then the limit of discord embeds description length
                description: diff.length > 4096 ? diff.slice(0, 3999) + '...\n```' : diff,
            },
        ],
    });
    fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    });
}

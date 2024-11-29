var IntlStringsTypes;
(function (IntlStringsTypes) {
    IntlStringsTypes[(IntlStringsTypes['literal'] = 0)] = 'literal';
    IntlStringsTypes[(IntlStringsTypes['argument'] = 1)] = 'argument';
    IntlStringsTypes[(IntlStringsTypes['number'] = 2)] = 'number';
    IntlStringsTypes[(IntlStringsTypes['date'] = 3)] = 'date';
    IntlStringsTypes[(IntlStringsTypes['time'] = 4)] = 'time';
    IntlStringsTypes[(IntlStringsTypes['select'] = 5)] = 'select';
    IntlStringsTypes[(IntlStringsTypes['plural'] = 6)] = 'plural';
    IntlStringsTypes[(IntlStringsTypes['pound'] = 7)] = 'pound';
    IntlStringsTypes[(IntlStringsTypes['tag'] = 8)] = 'tag';
})(IntlStringsTypes || (IntlStringsTypes = {}));
/**
 * Strings scraper class
 * Scrapes the new intl strings
 * Report bugs to 1083437693347827764 :3
 */
function isIntlStringValue(value) {
    return (
        typeof value === 'number' ||
        typeof value === 'string' ||
        typeof value === 'object' ||
        (typeof value === 'object' && Array.isArray(value) && value.every((element) => isIntlStringValue(element)))
    );
}
export default class Strings {
    constructor(chunks) {
        this.chunks = chunks;
    }
    parseTagAsMarkdown(tagChildren, tagValue) {
        // bold tag
        if (tagValue === '$b') {
            return '**' + this.parseString(tagChildren) + '**';
        }
        // italic tag
        else if (tagValue === '$i') {
            return '*' + this.parseString(tagChildren) + '*';
        }
        // paragraph
        else if (tagValue === '$p') {
            return this.parseString(tagChildren) + '\n\n';
        }
        // code block tag
        else if (tagValue === '$code') {
            return '``' + this.parseString(tagChildren) + '``';
        }
        // link tag
        else if (tagValue === '$link') {
            // link name is always last children
            const linkName = this.parseString([[...tagChildren].pop()]);
            // link url is always first children
            const linkURL = this.parseString([tagChildren[0]]);
            return `[${linkName}](${linkURL})`;
        } else {
            /**
             * "Any other tag name is a hook, which just adds the `$[` on a link tag."
             * https://github.com/discord/discord-intl/blob/main/packages/intl/src/message.ts#L137
             */
            return `$[${this.parseString(tagChildren)}]({{${tagValue}}})`;
        }
        return this.parseString(tagChildren);
    }
    parsePluralString(string) {
        let parsedString = '';
        for (let key in string) {
            parsedString += `${key} {${this.parseString(string[key])}} `;
        }
        return parsedString;
    }
    /** Converts obfuscated array/string to readable human format string */
    parseString(string) {
        if (typeof string === 'string') {
            return string;
        }
        if (typeof string !== 'object' && !Array.isArray(string)) return '';
        let formattedString = '';
        let type = 0;
        if (typeof string[0] === 'number') {
            type = string[0];
        }
        switch (type) {
            case IntlStringsTypes.literal: {
                for (let element of string) {
                    if (typeof element === 'number') {
                        continue;
                    }
                    formattedString += this.parseString(element);
                }
                return formattedString;
            }
            case IntlStringsTypes.tag: {
                formattedString += this.parseTagAsMarkdown(string[2], string[1]);
                return formattedString;
            }
            case IntlStringsTypes.number: {
                formattedString += `{${string[1]}}`;
                return formattedString;
            }
            case IntlStringsTypes.argument: {
                formattedString += `!!{${string[1]}}!!`;
                return formattedString;
            }
            case IntlStringsTypes.date: {
                formattedString += `{${string[1]}, date, ${string[2]}}`;
                return formattedString;
            }
            case IntlStringsTypes.time: {
                formattedString += `{${string[1]}, time, ${string[2]}}`;
                return formattedString;
            }
            case IntlStringsTypes.select: {
                formattedString += `{${string[1]}, select, ${this.parsePluralString(string[2])}}`;
                return formattedString;
            }
            case IntlStringsTypes.plural: {
                formattedString += `{${string[1]}, plural, ${this.parsePluralString(string[2])}}`;
                return formattedString;
            }
            case IntlStringsTypes.pound: {
                return '';
            }
            default:
                console.log(string);
                console.log(`types#${IntlStringsTypes[type]}=${type} is not supported.`);
                formattedString += '[need to do]';
                return formattedString;
        }
    }
    getStrings(object) {
        const strings = {};
        const parseString = this.parseString.bind(this);
        const isIntlObject =
            Object.keys(object).every((key) => key.length === 6) &&
            Object.values(object).every((value) => isIntlStringValue(value));
        if (isIntlObject)
            for (let key in object) {
                // @ts-expect-error
                strings[key] = parseString(object[key]);
            }
        return strings;
    }
    parseStrings() {
        const strings = {};
        const getStrings = this.getStrings.bind(this);
        for (let chunk of this.chunks) {
            // @ts-expect-error
            const stringsForThisChunk = getStrings(chunk);
            for (let string in stringsForThisChunk) {
                // @ts-expect-error
                strings[string] = stringsForThisChunk[string];
            }
        }
        return strings;
    }
}

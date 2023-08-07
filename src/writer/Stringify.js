const { Script, List } = require('../parts/types');
const { getTabs } = require('../util/indent');

const NEWLINE = '\n';

/**
 * Transforms data into string
 * @param {object} content
 */
const Stringify = function(obj, autodetectList = true) {
    console.log(autodetectList);
    return serialize(obj, -1, { root: true, autodetectList: autodetectList });
};

/**
 * Recursively serialize data to libconfig
 * @param {any} value 
 * @param {number} indent
 * @param {object} options 
 * @returns string
 */
const serialize = function(value, indent = 0, options = {}) {
    if (typeof value !== "object") { // Number, string, etc
        return JSON.stringify(value);
    }

    if (value instanceof Script) { // Check types.js for more info
        return value.toConfig(indent);
    }

    const isArray = Array.isArray(value);
    const elements = isArray ?
        // List of elements directly
        value.map(element => serialize(element, indent + 1)) :
        // List of key: value pairs
        Object.entries(value).map(([key, value]) => `${key}: ${serialize(value, indent + 1)}`)
    
    const separator = getSeparator(indent + 1, isArray);
    const printedElements = elements.join(separator);

    if (options.root) { // Root level, dont apply indent
        return printedElements;
    }

    const brackets = getBrackets(value, options.autodetectList);

    /**
     * Open bracket in its own line
     * Print inner values. First line is always unindented. Any additional
     * values got indented in the previous .join()
     * Close bracket with indentation in its own line
     */
    return (
        brackets?.opening +
        NEWLINE +
        getTabs(indent + 1) + 
        printedElements +
        NEWLINE +
        getTabs(indent) +
        brackets?.closing
    );
}

/**
 * Get the separator string for serializing a list of elements
 * @param {number} indent 
 * @param {boolean} isArray 
 * @returns Separator string
 */
const getSeparator = function(indent, isArray) {
    return (
        (isArray ? ',' : '') + 
        NEWLINE + 
        getTabs(indent)
    );
}

/**
 * Get opening and closing brackets based on value type
 * @param {any} value 
 */
const getBrackets = function(value, autodetectList) {
    const brackets = {
        'list': { opening: '(', closing: ')' },
        'array': { opening: '[', closing: ']' },
        'object': { opening: '{', closing: '}' }
    };

    if (value instanceof Array) {
        const type = isList(value, autodetectList) ? 'list' : 'array';
        return brackets[type];
    }

    return brackets['object'];
}

const isList = function(array, autodetectList) {
    //is array of same type and only contains scalar values (number boolean string)
    const type = typeof array[0];

    if (array instanceof List)
        return true;

    if (!autodetectList)
        return false;

    if (!["string","number","boolean"].includes(type))
        return true

    for (let i = 1; i < (array.length); i++) {
        if (typeof array[i] !== type)
            return true;
    }

    return false;
}

module.exports = { Stringify }   
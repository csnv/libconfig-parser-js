const { getTabs } = require('../util/indent');

/**
 * Script class
 * Just a placeholder for strings that must be enclosed by <" ">
 */
class Script extends String {
    /**
     * Return the string representation of this script
     * @param {number} indent 
     * @returns String with the format <" <script here> "> or multiline
     */
    toConfig(indent = 0) {
        const contents = this
            .split(";")
            .map(str => str.replace(/^\s+|\s+$/g, ''))
            .filter(str => !!str);

        if (contents.length === 1)
            return "<\" " + this + " \">";
        else {
            let str = "<\"\n";

            str += `${getTabs(indent + 1)}${this}`

            str += `\n${getTabs(indent)}">`;

            return str;
        }
    }
}

/**
 * List class
 * Just a wrapper around array to identify it's a list instead of an array
 */
class List extends Array {
    /**
     * Create a new instance of list based on an already existing array
     * @param {array} arr 
     * @returns Instance of list
     */
    static from(arr) {
        if (!Array.isArray(arr)) {
            throw Error('Cannot create a List from something that is not an Array. Try new List(...) instead');
        }
        return new List(...arr);
    }
};


module.exports = { Script, List }
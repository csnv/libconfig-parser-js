const { include, getFromFile, setToFile } = require("./parts/include")
const { Group } = require("./parts/AssignmentStatement")
const { RemoveComments } = require("./parts/Comments")
const { Stringify, stringify2 } = require("./writer/Stringify");
const { Script, List } = require("./parts/types");

/**
 * 
 * @param {string} string
 * @returns {string}
 */
function stripComments(input) {
    return RemoveComments.parse(input)
}

/**
 * Parses a string (you must remove comments and process include statements
 *  before passing your string to this methode)
 * @param {string} input 
 * @returns {{[key:string]:any}}
 */
function parseString(input){
    input = stripComments(input);
    return Group.parse(`{${stripComments(input)}}`)
}

function fileReadFunction(filename, basedir) {
    return stripComments(getFromFile(filename, basedir))
}
/**
 * 
 * @param {string} filepath File path starting from basedir
 * @param {string} basedir used for `@include`
 */
function parseFile(filepath, basedir) {
    const content = include(fileReadFunction(filepath, basedir), basedir, fileReadFunction)
    return parseString(content)
}


function writeFile(filename, basedir, content, options = {}) {
    const body = Stringify(content, options.autodetect);
    return setToFile(filename, basedir, body);
}

module.exports = {
    stripComments,
    parseString,
    parseFile,
    writeFile,
    Script,
    List
}
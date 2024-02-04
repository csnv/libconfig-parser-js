const { join } = require("path");
const { readFileSync, writeFileSync } = require("fs");
/**
 * 
 * @param {string} path 
 * @param {string} includedir 
 */
function getFromFile(path, includedir) {    
    return readFileSync(join(includedir, path), "utf-8")
}

function setToFile(path, includedir, content) {
    return writeFileSync(join(includedir, path), content);
}

/**
 * 
 * @param {string} string file contents
 * @param {(path:string, basedir:string)=>string} getFunction 
 */
function _include(string, includedir, getFunction, nested_level) {
    if (nested_level > 10) throw new Error("Nesting with @include only is allowed up to a level of 10 times")
    return string.replace(/@include \"((?:[^\"\\]|\\.)*)\"/g, (_, path) => {
        const content = getFunction(path, includedir)
        return _include(content, includedir, getFunction, nested_level + 1)
    })
}

/**
 * 
 * @param {string} string file contents
 * @param {(path:string, basedir:string)=>string} getFunction 
 */
function atInclude(string, includedir, getFunction) {
    return _include(string, includedir, getFunction, 0)
}


module.exports = {
    atInclude,
    getFromFile,
    setToFile
}
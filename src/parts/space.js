const { Parse } = require('sprache');
const space = Parse.whiteSpace.or(Parse.char('\n').or(Parse.char("\t"))).or(Parse.char("\r"));
exports.space = space;

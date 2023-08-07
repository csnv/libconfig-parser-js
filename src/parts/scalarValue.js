const { Parse } = require('sprache');
const { space } = require("./space");
const { Script } = require('./types');

const Integer = Parse
    .digit.xAtLeastOnce().text()
    .select(digits => Number.parseInt(digits, 10))
    .named('an integer');

const Octal = Parse
    .regex(/0[0-7]+/)
    .select(x => Number.parseInt(x, 8))
    .named('octal notation number');

const Hex = Parse
    .regex(/0x[0-9a-f]+/i)
    .select(x => Number.parseInt(x.replace('0x', ''), 16))
    .named('a hex notation number');

const Float = Parse
    .regex(/[0-9]+\.[0-9]+/)
    .select(x => Number.parseFloat(x))
    .named('a floating point number');

const FloatWithEmptyExponent = Parse.query(function* () {
    const number = yield Float
    yield Parse.ignoreCase("e")
    return Parse.return(number)
})

const FloatWithExponent = Parse.query(function* () {
    const coefficient = yield FloatWithEmptyExponent
    const n = yield Parse.queryOr(function* () {
        yield SignedInteger;
        yield Integer;
    })
    return Parse.return(coefficient * Math.pow(10, n))
})

const UnsignedNumber = Parse.queryOr(function* () {
    yield Octal;
    yield Hex;
    yield FloatWithExponent;
    yield FloatWithEmptyExponent;
    yield Float;
    yield Integer;
})

function generateSignedParser(numberParser) {
    return Parse.query(function* () {
        const sign = yield Parse.char(input => /\+|-/.test(input), "+ or - sign")
        const number = yield numberParser;
        return Parse.return((sign && sign == '-') ? -number : number)
    })
}

const SignedNumber = generateSignedParser(UnsignedNumber)

const SignedInteger = generateSignedParser(Integer)

const MaybeSignedNumber = Parse.queryOr(function* () {
    yield SignedNumber;
    yield UnsignedNumber;
})

const NumberParser64bit = Parse.query(function* () {
    const number = yield MaybeSignedNumber;
    const last = yield Parse.char('L', "the Letter L for 64bit int").once();
    return Parse.return(new BigInt(number));
})

const NumberParser = Parse.queryOr(function* () {
    yield NumberParser64bit;
    yield MaybeSignedNumber;
})

const StringEscapeSequence = Parse.query(function* () {

    yield Parse.char("\\", "backslash")
    const escapedChar = yield Parse.char(_ => true, "any char")
    switch (escapedChar) {
        case '"':
            return Parse.return('q')
            break;
        case 'n':
            return Parse.return('\n')
            break;
        case '\\':
            return Parse.return('\\')
            break;
        case 'f':
            return Parse.return("\f")
            break;
        case 'r':
            return Parse.return("\r")
            break;
        case 't':
            return Parse.return("\t")
            break;
        case 'x':
            const a = yield Parse.regex(/[0-9a-f]{2}/i, "ascii numbers")
            const c = String.fromCharCode(Number.parseInt(a, 16))
            return Parse.return(c)
            break
        default:
            return Parse.return(`\\${escapedChar}`)
    }
})

const StringParser = Parse.query(function* () {
    const first = yield Parse.char("\"");
    let done = false
    let rest = []
    while (!done) {
        rest.push(
            yield Parse.char(char => !/\"|\\/.test(char), "all chars except for \" or \\")
                .many().text()
        )
        const n0 = yield Parse.char("\"").or(StringEscapeSequence)
        if (n0 === '"') done = true;
        else rest.push(n0 === "q" ? "\"" : n0)
    }
    return Parse.return(rest.join(''));
})

const MultilineStringParser = Parse.query(function* () {
    yield Parse.string("<\"")
    const content = yield Parse.regex(/((?!">)[^])+/)
    yield Parse.string("\">")
    return Parse.return(new Script(content));
})

const BooleanParser = Parse
    .ignoreCase("true").or(Parse.ignoreCase("false")).text()
    .select(bool => bool.toLowerCase() === "true")
    .named('a boolean');

const AdjacentString = Parse.query(function* () {
    let result = [yield StringParser]
    let input = yield Parse.regex(/(?:\"(?:[^\"\\]|\\.)*\"|[\n\t\s]+)+/) // get all input

    while (true) {
        const a = StringParser.tryParse(input)
        const b = space.atLeastOnce().tryParse(input)
        if (!a.wasSuccessful && a.wasSuccessful === b.wasSuccessful) { break }
        const r = a.wasSuccessful ? a : b
        input = input.slice(r.remainder.position)
        result.push(a.wasSuccessful ? a.value : "")
    }

    return Parse.return(result.join(''));
})


const scalarValue = Parse.query(function* () {
    yield Parse.whiteSpace.many();
    const value = yield Parse.queryOr(function* () {
        yield AdjacentString
        yield StringParser
        yield NumberParser
        yield BooleanParser
        yield MultilineStringParser
    })
    yield Parse.whiteSpace.many();
    return Parse.return(value);
})


function makeArrayValueParser(base) {
    return Parse.query(function* () {
        yield space.many()
        const value = yield base
        yield space.many()
        yield Parse.char(",").optional()
        yield space.many()
        return Parse.return(value)
    }).atLeastOnce()
}

const ArrayElements = Parse.queryOr(function* () {
    yield makeArrayValueParser(AdjacentString.or(StringParser))
    // / Make this work \  /\
    yield makeArrayValueParser(NumberParser)
    yield makeArrayValueParser(BooleanParser)
})


module.exports = {
    scalarValue,
    ArrayElements,
}

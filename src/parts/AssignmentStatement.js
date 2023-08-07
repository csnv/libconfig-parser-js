const { Identifier } = require("./Identifier")
const { scalarValue, ArrayElements } = require("./scalarValue")
const { Parse } = require('sprache')
const { space } = require("./space");
const { List } = require("./types");

const AssignmentOperator = Parse.char(c => /:|=/.test(c), '=|: (assignment)')

const SettingValue = Parse.queryOr(function* () {
    yield scalarValue
    yield ArrayParser
    yield Group
    yield ListParser
})

const Setting = Parse.query(function* () {
    yield space.many()
    const identifier = yield Identifier
    const assignmentOperator = yield AssignmentOperator
    const value = yield SettingValue
    yield Parse.chars(";").optional()
    return Parse.return({
        type: "setting",
        key: identifier,
        value: value,
    })
})

const Group = Parse.query(function* () {
    yield space.many()
    yield Parse.char("{")
    const raw_values = yield Parse.queryOr(function* () {
        yield Setting
        yield space.atLeastOnce().text()
    }).many()
    yield Parse.char("}")
    yield space.many()

    const values = raw_values.filter(i => typeof i === "object")

    let group = {}
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        group[value.key] = value.value
    }

    return Parse.return(group)
})

const ArrayParser = Parse.query(function* () {
    yield space.many()
    yield Parse.char("[")
    const values = yield ArrayElements
    yield Parse.char("]")
    yield space.many()

    return Parse.return(values)
})

const ListParser = Parse.query(function*(){
    yield space.many()
    yield Parse.char("(")
    yield space.many()
    const values = yield Parse.query(function*(){
        value = yield SettingValue 
        yield space.many()
        yield Parse.char(",").optional()
        yield space.many()
        return Parse.return(value)
    }).many()
    yield Parse.char(")")
    yield space.many()

    return Parse.return(List.from(values))
})

module.exports = {
    AssignmentOperator,
    Setting,
    Group,
    ArrayParser,
}

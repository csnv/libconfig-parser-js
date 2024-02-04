## a Libconfig Parser for js

A fork of the incredibly useful [Libconfig Parser](https://github.com/TitanRO/libconfig-parser-js) by TitanRO

## What is this?

Parser and serializer for libconfig files of the [Hercules emulator](https://github.com/HerculesWS/Hercules).

## Installation

Install libconfig-parser directly from NPM
> npm install @csnvrag/libconfig-parser

Or from Github

> npm install https://github.com/csnv/libconfig-parser-js.git

## API
### parseFile (filepath, basedir)
Parses the .conf file specified in `filepath`, constructing the JavaScript value or object described by the file. `basedir` must be the root folder of the project.

### writeFile (filepath, basedir, content [, options])
Converts the javascript value of `content` into valid libconfig file and saves it in the specified `filepath` under `basedir`.

Options:
- autodetect (true by default): Automatically detect the type of arrays in `content`. Set to false if the autodetection of Lists fails and you wish to manually distinguish between Lists and normal arrays.

## Caveats
When dealing with multiline scripts enclosed by `<"` and `">` this library uses the custom `Script` class, use it like a regular `String` primitive. Once serialized into a config file, `<"` and `">` are added automatically.


Update script of an item
``` javascript
myItem.Script = new Script(" bonus bDex,1; ")
```
Output:
```
{
	...
	Script: <"  bonus bDex,1; ">
}
```

Similarly, the `List` class is added for those arrays enclosed by `(` and `)`. Remember, the way libconfig works is:
  - Array: Enclosed by `[` and `]`. Holds items of scalar values (primitives).
  - List: Enclosed by `(` and `)`. Holds items of any value. This class is not mandatory if the autodetect option is set to true.

Example creating a new list:
``` javascript
const myItemFile = {
    item_db: new List( // Or List.from([...]) to convert from an existing array
        {  
            Id: 1,
            Name: "Random Item",
            Loc: [ "EQP_HEAD_TOP", "EQP_HEAD_MID" ]
        }
    )
}
```
Output file:
```
item_db: (
    {  
        Id: 1
        Name: "Random Item"
        Loc: [
            "EQP_HEAD_TOP",
            "EQP_HEAD_MID"
        ]
    }
)
```
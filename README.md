<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Requirements](#requirements)
- [Usage](#usage)
- [Options](#options)
  - [<key>](#key)
    - [<key>.transform](#keytransform)
      - [As a string](#as-a-string)
      - [As a function](#as-a-function)
    - [<key>.include](#keyinclude)
    - [<key>.exclude](#keyexclude)
    - [<key>.extensions](#keyextensions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install
```sh
npm i -D rollup-plugin-data-files
```

## Requirements
* rollup v2.29.0 or later to allow for the addition of a file in a globbed directory to rebuild in this plugin
## Usage
include rollup-plugin-data-files in your rollup plugins array for a build:
```js
const dataFiles = require('rollup-plugin-data-files');

...
plugins: [
  dataFiles({
    something: {
      // files to include when data-files!something is imported
      include: 'test/fixtures/**',
      // these are binary files, give me a uint8array
      transform: 'binary'
    }
  })
]
...
```

When you want to include the data file use `data-files!<configured-key>` so for our example that would be:
```js
import something from "data-files!something";

// get and console.log the uint8 array for some-file-name.jpg
console.log(something['some-file-name.jpg']());
```

Also know that you can find your file in the output bundle by searching for `rollup-plugin-data-files` and finding your key.

## Options
### <key>
The main Object that is passed to `rollup-plugin-data-files` takes keys that will refer to the reference id of your data file. The value for that key is the configuration for it's build. Those options are defined below.


#### <key>.transform
> Default: 'binary'

##### As a string
transform can be set 4 possible string values:
1. 'binary' exports an object with functions that return a `Uint8Array` of file contents.
2. 'string' exports an object with functions that will return a string of the file contents.
3. 'json' exports an object with function that will return a `JSON.parse` of the file contents.
4. 'js' exports an object with function that will return a the result of requiring the files specified.

##### As a function
Using transform as a function
```js
transform: function(key, files) {
  let output = 'module.exports = {\n'

  files.forEach(function({filepath, contents}) {
    // filepath is a string, contents is a buffer.
    output += `'${filepath}': () => '${contents.toString()}',\n`
  });

  output += '};\n';
  return output;
}

```

#### <key>.include
> Note: if you want the addition of files to trigger a rebuild, make sure you are using a glob or directly pass in a directory here.
A file, glob or an array of files/globs to include in your data-file.

#### <key>.exclude
A file, glob or an array of files/globs to exclude from your data-file.

#### <key>.extensions
> Default: true

Should file extensions be included in the resulting object generated by string transform.

example for foo.txt with extensions true:
```js
{
  'foo.txt': () => 'hello world'
}
```

example for foo.txt with extensions false:
```js
{
  'foo': () => 'hello world'
}
```

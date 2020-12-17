<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Requirements](#requirements)
- [Usage](#usage)
- [Options](#options)
  - [transform](#transform)
- [include](#include)
- [exclude](#exclude)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install
```sh
npm i -D rollup-plugin-data-files
```

## Requirements
* rollup v2.29.0 or later to allow for the addition of a file in a globbed directory to rebuild a data-files

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
The main Object that is passed to `rollup-plugin-data-files` takes keys that will refer to the reference id of your data file. The value for that key is the configuration for it's build. Those options are defined below.

### transform
> Default: 'binary'

transform can be set three possible values:
1. 'binary' to export an object that has functions that will return uint8arrays of file contents.
2. 'string' to export an object that has functions which will return the string of the file contents for text files
3. a function that manually builds the files and returns a string containing the js code to use for this data-file.

Using transform as a function
```js
...
transform: function(files) {
  let output = 'module.exports = {\n'

  files.forEach(function({filepath, contents}) {
    // filepath is a string, contents is a buffer.
    output += `'${filepath}': () => '${contents.toString()}',\n`
  });

  output += '};\n';
  return output;
}
...

```
## include
> Note: if you want the addition of files to trigger a rebuild, make sure you are using a glob or directly pass in a directory here.
A file, glob or an array of files/globs to include in your data-file.

## exclude
A file, glob or an array of files/globs to exclude from your data-file.

# k6-html-reporter

A light weight html reporter for k6

| :exclamation: This is a customization of [`szboynono/k6-html-reporter`](https://github.com/szboynono/k6-html-reporter)  |
|-------------------------------------------------------------------------------------------------------------------------|
 


## Install
NPM:

``` bash
npm install @avitalique/k6-html-reporter --save-dev
```

YARN:

```bash
yarn add @avitalique/k6-html-reporter --dev
```



## Usage

1. Install the package
2. Create a js/ts file and specify the options:

```js

const reporter = require('k6-html-reporter');

const options = {
        jsonFile: <path-to-json-report>,
        output: <path-to-output-directory>,
    };

reporter.generateSummaryReport(options);
    
```

for typescript

```ts
import {generateSummaryReport} from 'k6-html-reporter';

const options = {
        jsonFile: <path-to-json-report>,
        output: <path-to-output-directory>,
    };

generateSummaryReport(options);
```
3. Output a JSON summary output with the `handleSummary` function provided by k6, [more info](https://k6.io/docs/results-visualization/end-of-test-summary).
```js
export default function () { /** some tests here */}
export function handleSummary(data) {
  console.log('Preparing the end-of-test summary...');
  return {
      <path-to-json-report>: JSON.stringify(data),
  }
}
```

> **Note**: The ` --summary-export=path/to/file.json` run option is no longer recomanded after k6 v0.30.0.

4. Run the code in step two as a node.js script after the test execution:
```bash
node xxxx.js
```

### Sample report:
![Alt text](./screenshot/k6.png?raw=true "Optional Title")

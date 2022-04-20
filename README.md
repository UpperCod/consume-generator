# @uppercod/consume-generator

Recursive and asynchronous function that explores return values of promises and generators

## Install

```bash
# NPM
npm install @uppercod/consume-generator
# CDN
https://cdn.skypack.dev/@uppercod/consume-generator
```

## Example

```js
import { consume } from "@uppercod/consume-generator";

function* count() {
    yield 1;
    yield 2;
    yield 3;
    yield function* () {
        yield 4.1;
        yield 4.2;
        yield 4.3;
        yield 4.4;
        return 4.5;
    };
    return new Promise((resolve) => setTimeout(resolve, 1000, 5));
}

consumer(count, 20, {
    next(task){
        return true;
    }
    set(value) {
        console.log(value);
        this.state = value;
    },
    get() {
        return this.state;
    },
}).then((value) => {
    console.log(value); // 5
});
```

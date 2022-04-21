import test from "ava";
import { consumer } from "../src/module.js";

test("consumer", async (t) => {
    const values = [1, 2, 3, 4.1, 4.2, 4.3, 4.4, 4.5, 5];
    let queue = new Set();
    async function* count() {
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

    const task = consumer(count, 20, {
        next(taskId) {
            return queue.has(taskId);
        },
        set(value) {
            t.is(value, values.shift());
            this.state = value;
        },
        get() {
            return this.state;
        },
    });

    queue.add(task);

    const value = await task;

    t.is(value, 5);

    t.is(values.length, 0);
});

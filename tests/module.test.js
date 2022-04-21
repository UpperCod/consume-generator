import { test } from "uvu";
import * as assert from "uvu/assert";
import { consumer } from "../src/module";

test("consumer", async (t) => {
    const values = [1, 2, 3, 4.1, 4.2, 4.3, 4.4, 4.5, 5];
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
        return new Promise((resolve) => setTimeout(resolve, 100, 5));
    }

    const task = consumer(count, 20, {
        set(value) {
            assert.is(value, values.shift());
            this.state = value;
        },
        get() {
            return this.state;
        },
    });

    const value = await task;

    assert.is(value, 5);
    assert.is(values.length, 0);
});

test("loop", async (t) => {
    async function* loop({ count }) {
        yield { count: count + 1 };
        await new Promise((resolve) => setTimeout(resolve, 100));
        return loop;
    }

    const context = {
        state: { count: 0 },
        set(value) {
            this.state = value;
        },
        get() {
            return this.state;
        },
    };

    const task = consumer(loop, { count: 0 }, context);

    await new Promise((resolve) => setTimeout(resolve, 500));

    task.expire();

    assert.is(JSON.stringify(context.state), JSON.stringify({ count: 5 }));
    assert.is();
});

test.run();

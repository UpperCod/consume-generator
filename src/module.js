export class Cycle extends Promise {
    isExpire = false;
    expire = () => (this.isExpire = true);
}

/**
 * Recursive asynchronous function capable of consuming functions, promises and generators for state exploration and definition
 * @template T
 * @param {*} value - value can be any value, but the only ones that will be consumed by set are promises, functions and generators
 * @param {*} payload - argument to use to execute the function
 * @param {{set(state:T):void,get():T}} context - argument to use to execute the function
 * @param {Cycle} [taskRoot] - argument to use to execute the function
 * @returns {Cycle}
 */
export function consumer(value, payload, context, taskRoot) {
    const task = Cycle.resolve(value).then((value) => {
        taskRoot = taskRoot || task;
        if (typeof value == "function") {
            return consumer(
                value(context.get(), payload),
                null,
                context,
                taskRoot
            );
        }

        if (
            value &&
            typeof value == "object" &&
            typeof value.next == "function"
        ) {
            return new Cycle((resolve) => {
                async function scan(generator) {
                    if (!taskRoot.isExpire) {
                        const { value, done } = await generator.next(
                            context.get()
                        );
                        await consumer(value, null, context, taskRoot);
                        done ? resolve(context.get()) : scan(generator);
                    }
                }
                scan(value);
            });
        }

        if (!taskRoot.isExpire) context.set(value);

        return context.get();
    });

    return task;
}

/**
 * Recursive asynchronous function capable of consuming functions, promises and generators for state exploration and definition
 * @template T
 * @param {*} value - value can be any value, but the only ones that will be consumed by set are promises, functions and generators
 * @param {*} payload - argument to use to execute the function
 * @param {{set(state:T):void,get():T}} context - argument to use to execute the function
 * @returns {Promise<T>}
 */
export function consumer(value, payload, context) {
    return Promise.resolve(value).then((value) => {
        if (typeof value == "function") {
            return consumer(value(context.get(), payload), null, context);
        }
        if (
            value &&
            typeof value == "object" &&
            typeof value.next == "function"
        ) {
            return new Promise((resolve) => {
                function scan(generator) {
                    Promise.resolve(generator.next(context.get())).then(
                        ({ value, done }) =>
                            consumer(value, null, context).then(() => {
                                done ? resolve(context.get()) : scan(generator);
                            })
                    );
                }
                scan(value);
            });
        }
        context.set(value);
        return context.get();
    });
}

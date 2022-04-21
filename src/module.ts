interface Value {
    value: any;
    done: boolean;
}

interface AnyGenerator {
    next(arg: any): Value | Cycle<Value>;
}

export class Cycle<A = any> extends Promise<A> {
    isExpire = false;
    expire = () => (this.isExpire = true);
}

/**
 * Recursive asynchronous function capable of consuming functions, promises and generators for state exploration and definition
 * @param value - value can be any value, but the only ones that will be consumed by set are promises, functions and generators
 * @param payload - argument to use to execute the function
 * @param context - argument to use to execute the function
 * @param [taskRoot] - argument to use to execute the function
 */
export function consumer<T = any>(
    value: any,
    payload: T | undefined,
    context: { set(state: T): void; get(): T },
    taskRoot: Cycle<T>
) {
    const task = Cycle.resolve(value).then((value) => {
        taskRoot = taskRoot || task;
        if (typeof value == "function") {
            return consumer<T>(
                value(context.get(), payload),
                undefined,
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
                async function scan(generator: AnyGenerator) {
                    if (!taskRoot.isExpire) {
                        const { value, done } = await generator.next(
                            context.get()
                        );
                        await consumer<T>(value, null, context, taskRoot);
                        done ? resolve(context.get()) : scan(generator);
                    }
                }
                scan(value);
            });
        }

        if (!taskRoot.isExpire) context.set(value);

        return context.get();
    }) as Cycle<T>;

    return task;
}

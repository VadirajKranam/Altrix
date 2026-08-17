import { registry } from "../metadata/registry.js";

export function Table(name: string) {
    return function <
        T extends abstract new (...args: any[]) => any
    >(
        target: T,
        context: ClassDecoratorContext<T>,
    ): void {
        registry.registerTable(
            target,
            context.metadata,
            name,
        );
    };
}
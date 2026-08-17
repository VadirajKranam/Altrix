if (!("metadata" in Symbol)) {
    Object.defineProperty(
        Symbol,
        "metadata",
        {
            value: Symbol("Symbol.metadata"),
            configurable: false,
            enumerable: false,
            writable: false,
        },
    );
}
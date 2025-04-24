type contextMenuDictItem = {
    title: string
    tooltip: string;
};

export type Dictionary = {
    action: Record<string, string>;
    form: Record<string, string>;
    map: {
        title: Record<string, string>;
        tooltip: Record<string, string>;
    };
    context: Record<string, contextMenuDictItem>;
    message: Record<string, string>;
    nav: {
        caption: Record<string, string>;
        title: Record<string, string>;
        tooltip: Record<string, string>;
    };
    title: Record<string, string>;
};

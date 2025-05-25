
declare const bootstrap: {
    Modal: new (element: Element, options?: any) => {
        show(): void;
        hide(): void;
        dispose(): void;
    };
};

declare const MathJax: any;
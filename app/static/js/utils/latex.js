export function toInlineLatex(str) {
    return `\\(${str}\\)`;
}
export function toBlockLatex(str) {
    return `$$\\begin{align}${str}\\end{align}$$`;
}

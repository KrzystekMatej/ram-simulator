
export function toInlineLatex(str: string): string {
    return `\\(${str}\\)`
}

export function toBlockLatex(str: string): string {
    return `$$\\begin{align}${str}\\end{align}$$`
}
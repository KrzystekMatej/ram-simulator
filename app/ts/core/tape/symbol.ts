
export enum TapeSymbol {
    Blank = '□',
    Zero = '0',
    One = '1',
    ZeroHat = '0^',
    OneHat = '1^',
    End = '$',
    Separator = '#',
    Colon = ':',
    Wildcard = '*'
}

export function symbolToLatex(symbol: TapeSymbol): string {
    switch (symbol) {
        case TapeSymbol.Blank:
            return '\\square';
        case TapeSymbol.Zero:
            return '0';
        case TapeSymbol.One:
            return '1';
        case TapeSymbol.ZeroHat:
            return '\\hat{0}';
        case TapeSymbol.OneHat:
            return '\\hat{1}';
        case TapeSymbol.End:
            return '\\$';
        case TapeSymbol.Separator:
            return '\\#';
        case TapeSymbol.Colon:
            return ':';
        case TapeSymbol.Wildcard:
            return '\\ast';
        default:
            return '?';
    }
}
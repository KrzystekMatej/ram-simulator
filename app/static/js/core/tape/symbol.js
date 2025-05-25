export var TapeSymbol;
(function (TapeSymbol) {
    TapeSymbol["Blank"] = "\u25A1";
    TapeSymbol["Zero"] = "0";
    TapeSymbol["One"] = "1";
    TapeSymbol["ZeroHat"] = "0^";
    TapeSymbol["OneHat"] = "1^";
    TapeSymbol["End"] = "$";
    TapeSymbol["Separator"] = "#";
    TapeSymbol["Colon"] = ":";
    TapeSymbol["Wildcard"] = "*";
})(TapeSymbol || (TapeSymbol = {}));
export function symbolToLatex(symbol) {
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

import { type Token, Tokenizr } from 'ts-tokenizr';

import { TokenTypes } from "./tokenTypes.ts";

const tokenizr = new Tokenizr();
//tokenizr.debug(true);

/*lexer.rule(/exec\s/, (ctx, match) => {
    ctx.accept("exec");
});*/
tokenizr.rule(/export\s([a-zA-Z0-9_]+)\s?=/, (ctx, match) => {
    ctx.accept(TokenTypes.EXPORT, match[1]);
});
tokenizr.rule(/import\s(\$[a-zA-Z0-9_]+)\sfrom/, (ctx, match) => {
    ctx.accept(TokenTypes.IMPORT, match[1]);
});
tokenizr.rule(/const\s?(\$[a-zA-Z0-9_]+)\s?=/, (ctx, match) => {
    ctx.accept(TokenTypes.DEFINE, match[1]);
});
tokenizr.rule(/\+?[$a-zA-Z][a-zA-Z0-9_.]*/, (ctx, match) => {
    ctx.accept(TokenTypes.CALL);
});
tokenizr.rule(/[+-]?[0-9]+/, (ctx, match) => {
    ctx.accept(TokenTypes.NUMBER, +match[0]);
});
tokenizr.rule(/"([\\/.-_+$a-zA-Z0-9\s]*)"/, (ctx, match) => {
    ctx.accept(TokenTypes.STRING, match[1].replace(/\\"/g, "\""));
});
tokenizr.rule(/\r?\n/, (ctx, match) => {
    ctx.accept(TokenTypes.NEWLINE);
});
tokenizr.rule(/;+/, (ctx, match) => {
    ctx.ignore();
});
tokenizr.rule(/\/\/[^\r\n]*\r?\n/, (ctx, match) => {
    ctx.ignore();
});
tokenizr.rule(/[\s\t\r\n]+/, (ctx, match) => {
    ctx.ignore();
});



export function lexer(content: string): Token[] {
	return tokenizr.tokenize(content);
};
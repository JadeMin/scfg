import { Tokenizr } from 'ts-tokenizr';

const lexer = new Tokenizr();
//lexer.debug(true);

/*lexer.rule(/exec\s/, (ctx, match) => {
    ctx.accept("exec");
});*/
lexer.rule(/export\s([a-zA-Z0-9_]+)\s?=/, (ctx, match) => {
    ctx.accept("export", match[1]);
});
lexer.rule(/import\s(\$[a-zA-Z0-9_]+)\sfrom/, (ctx, match) => {
    ctx.accept("import", match[1]);
});
lexer.rule(/const\s?(\$[a-zA-Z0-9_]+)\s?=/, (ctx, match) => {
    ctx.accept("define", match[1]);
});
lexer.rule(/[+]?[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
    ctx.accept("call");
});
lexer.rule(/[+-]?[0-9]+/, (ctx, match) => {
    ctx.accept("number", +match[0]);
});
lexer.rule(/"([\\/.-_+$a-zA-Z0-9\s]*)"/, (ctx, match) => {
    ctx.accept("string", match[1].replace(/\\"/g, "\""));
});
lexer.rule(/\r?\n/, (ctx, match) => {
    ctx.accept("newline");
});
lexer.rule(/;+/, (ctx, match) => {
    ctx.ignore();
});
lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx, match) => {
    ctx.ignore();
});
lexer.rule(/[\s\t\r\n]+/, (ctx, match) => {
    ctx.ignore();
});



export function tokenize(content: string) {
	return lexer.tokenize(content);
};
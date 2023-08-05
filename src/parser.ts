import { lexer } from "./lexer.ts";

import { TokenTypes } from "./tokenTypes.ts";



export function parse(content: string): any[] {
	const tokens = lexer(content);

	const root: any[] = [];
	let working = root;

	for(const token of tokens) {
		switch(token.type) {
			case TokenTypes.EXEC:
			case TokenTypes.IMPORT:
			case TokenTypes.EXPORT:
			case TokenTypes.DEFINE:
			case TokenTypes.CALL: {
				const newNode = {
					...token,
					args: [] as any[]
				};
				working.push(newNode);
				working = newNode.args;
				break;
			}
			case TokenTypes.NEWLINE:
			case TokenTypes.EOF: {
				working = root;
				break;
			}
			default: {
				working.push(token);
				break;
			}
		}
	}

	return root;
};
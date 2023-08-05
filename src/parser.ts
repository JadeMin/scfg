import { tokenize } from "./lexer.ts";



export function parse(content: string) {
	const tokens = tokenize(content);

	const root: any[] = [];
	let working = root;

	for(const token of tokens) {
		switch(token.type) {
			case "exec":
			case "import":
			case "export":
			case "define":
			case "call": {
				const newNode = {
					...token,
					children: [] as any[]
				};
				working.push(newNode);
				working = newNode.children;
				break;
			}
			case "newline":
			case "EOF": {
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
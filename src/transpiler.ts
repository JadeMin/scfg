import { join, dirname } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

import { parse } from "./parser.ts";
import { TokenTypes } from "./tokenTypes.ts";



export async function transpile(entryFile: string): Promise<string | never> {
	const ast = parse(await readFile(entryFile, "utf-8"));

	const constants: any = {};
	let output: string = '';

	const replaceConstants = (text: string): string => {
		if(typeof text !== "string") return text;
		if(Object.keys(constants).length === 0) return text;

		const re = new RegExp(`(\\${Object.keys(constants).join("|\\")})`, "g");
		return text.replace(re, (_: any, key: string) => constants[key]) || text;
	};


	for(const node of ast) {
		output += "\n";

		switch(node.type) {
			case TokenTypes.IMPORT: {
				if(node.args[0].type === TokenTypes.STRING) {
					try {
						const module = parse(
							await readFile(
								join(
									dirname(entryFile),
									node.args[0].value
								),
								"utf-8"
							)
						);
					
						module.forEach((moduleNode: any) => {
							if(moduleNode.type === TokenTypes.EXPORT) {
								constants[`${node.value}.${moduleNode.value}`] = replaceConstants(moduleNode.args[0].text);
							}
						});
					} catch(error: any) {
						if(error.code === "ENOENT") {
							throw new Error(`Module "${node.args[0].value}" not found.`, {
								cause: `${entryFile}@${node.args[0].line}:${node.args[0].column}`
							});
						} else throw error;
					}
				} else {
					throw new Error(`Invalid constant value type: ${node.args[0].type}`, {
						cause: `${entryFile}@${node.args[0].line}:${node.args[0].column}`
					});
				}
				break;
			};
			case TokenTypes.DEFINE: {
				if(
					node.args[0].type === TokenTypes.STRING ||
					node.args[0].type === TokenTypes.NUMBER ||
					node.args[0].type === TokenTypes.CALL
				) {
					constants[node.value] = replaceConstants(node.args[0].text);
				} else {
					throw new Error(`Invalid constant value type: ${node.args[0].type}`, {
						cause: `${entryFile}@${node.args[0].line}:${node.args[0].column}`
					});
				}
				break;
			};
			case TokenTypes.CALL: {
				if(node.args.some((child: any) => child.type === TokenTypes.CALL)) {
					throw new Error(`Calling an action with action arguments are not allowed.`, {
						cause: `${entryFile}@${node.args[0].line}:${node.args[0].column}`
					});
				}

				const args = node.args.map((child: any) => replaceConstants(child.text));
				output += `${replaceConstants(node.text)} ${args.join(" ")}`;
				break;
			};
			default: {
				const args = node.args.map((child: any) => replaceConstants(child.text));
				output += `${replaceConstants(node.text)}${args.join(" ")}`;
				break;
			};
		}
	}

	return output.trim();
};

export async function build(entryFile: string, outputFile: string): Promise<void> {
	const output = await transpile(entryFile);
	await mkdir(dirname(outputFile), { recursive: true });
	await writeFile(outputFile, output);
};
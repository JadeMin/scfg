import { join, dirname } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

import { parse } from "./parser.ts";



export async function transpile(entryFile: string) {
	const AST = parse(await readFile(entryFile, "utf-8"));

	const constants: any = {};
	let output: string = '';

	for(const node of AST) {
		output += "\n";

		switch(node.type) {
			case "import": {
				if(node.children[0].type === "string") {
					try {
						const module = parse(
							await readFile(
								join(
									dirname(entryFile),
									node.children[0].value
								), "utf-8"
							)
						);
					
						module.forEach((moduleNode: any) => {
							if(moduleNode.type === "export") {
								constants[`${node.value}.${moduleNode.value}`] = moduleNode.children[0].text;
							}
						});
					} catch(error: any) {
						if(error.code === "ENOENT") {
							throw new Error(`Module "${node.children[0].value}" not found.`, {
								cause: `${entryFile}@${node.children[0].line}:${node.children[0].column}`
							});
						} else throw error;
					}
				} else {
					throw new Error(`Invalid constant value type: ${node.children[0].type}`, {
						cause: `${entryFile}@${node.children[0].line}:${node.children[0].column}`
					});
				}
				break;
			}
			case "define": {
				if(
					node.children[0].type === "string" ||
					node.children[0].type === "number" ||
					node.children[0].type === "call"
				) {
					constants[node.value] = node.children[0].text;
				} else {
					throw new Error(`Invalid constant value type: ${node.children[0].type}`, {
						cause: `${entryFile}@${node.children[0].line}:${node.children[0].column}`
					});
				}
				break;
			}
			case "call": {
				if(node.children.some((child: any) => child.type === "call")) {
					throw new Error(`Calling an action with action arguments are not allowed.`, {
						cause: `${entryFile}@${node.children[0].line}:${node.children[0].column}`
					});
				}

				const args = node.children.map((child: any) => {
					if(child.type === "string") {
						const re = new RegExp(`(\\${Object.keys(constants).join("|\\")})`, "g");
						return child.text.replace(re, (_: any, key: string) => constants[key]) || child.text;
					} else {
						return child.value;
					}
				});

				output += `${node.value} ${args.join(" ")}`;
				break;
			}
			default: {
				output += `${node.value}${node.children.map((child: any) => child.text).join(" ")}`;
				break;
			}
		}
	}

	return output.trim();
};

export async function build(entryFile: string, outputFile: string) {
	const output = await transpile(entryFile);
	await mkdir(dirname(outputFile), { recursive: true });
	await writeFile(outputFile, output);
};
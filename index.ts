import BitcoinMiniscript from "./modules/bitcoin-miniscript";
import ElementsMiniscript from "./modules/elements-miniscript";

import { MiniscriptFragment, MiniscriptModule } from "./types";
import { MiniscriptParser } from "./parse/parser";
import Lexer from "./lex/lexer";

let miniscriptModules: MiniscriptModule[] = [BitcoinMiniscript];

let wrappers = miniscriptModules.flatMap((m) => m.wrappers);
let expressions = miniscriptModules.flatMap((m) => m.expressions);

export default class Miniscript {
  static parse(
    input: string,
    elementsSupport: boolean = false
  ): MiniscriptFragment {
    input = input?.toLowerCase().replace(/\s/g, "");

    if (elementsSupport) {
      wrappers.push(...ElementsMiniscript.wrappers);
      expressions.push(...ElementsMiniscript.expressions);
    }

    let lexer = new Lexer(wrappers, expressions);
    let tokens = lexer.lex(input);

    let parser = new MiniscriptParser(expressions, wrappers);
    return parser.parse(tokens);
  }

  static parseScript(
    input: string,
  ): string {
    let parser = new MiniscriptParser(expressions, wrappers);
    let reversedScript = input.split(" ").reverse();
    return parser.parseScript(reversedScript);
  }
}

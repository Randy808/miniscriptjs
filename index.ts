import BitcoinMiniscript from "./modules/bitcoin-miniscript";
import ElementsMiniscript from "./modules/elements-miniscript";

import { MiniscriptFragment, MiniscriptModule } from "./types";
import { Parser } from "./parser";
import Lexer from "./lexer";

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

    let parser = new Parser(expressions, wrappers);
    return parser.parse(tokens);
  }
}

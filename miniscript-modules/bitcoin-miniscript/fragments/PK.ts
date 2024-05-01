import { lexKeyword } from "../../../lex/lex-utils";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { MiniscriptParseContext } from "../../../parse/parser";
import { WRAP_C } from "./WRAP_C";
import { PK_K } from "./PK_K";

export class PK extends MiniscriptFragmentStatic implements MiniscriptFragment {
  static tokenType = "PK";
  children: MiniscriptFragment[];
  type: number;

  constructor(children: MiniscriptFragment[]) {
    super();
    this.children = children;
    this.type = this.getType();
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "pk(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: MiniscriptParseContext) => {
    //replace pk token type with WRAP_C for compatibility in parsing
    parseContext.eat(this.tokenType);

    parseContext.tokens.unshift({
      tokenType: PK_K.tokenType,
    });

    parseContext.tokens.unshift({
      tokenType: WRAP_C.tokenType,
    });

    return WRAP_C.parseWrapper(parseContext);
  };

  getType = () => {
    return this.children[0].getType();
  };

  getSize = () => {
    return this.children[0].getSize();
  };

  static fromScript = (scriptParseContext: any) => {
    let { reversedScript } = scriptParseContext;
    if (reversedScript[0] != "OP_CHECKSIG") {
      return;
    }

    reversedScript.shift();
    let keyExpression = scriptParseContext.parser.parseScript(reversedScript);
    return new WRAP_C([keyExpression]);
  };

  toScript = () => {
    return this.children[0].toScript();
  };
}

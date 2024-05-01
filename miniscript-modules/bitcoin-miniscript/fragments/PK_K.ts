import { OPEN_PAREN, CLOSE_PAREN, STRING } from "../../../lex/universal-tokens";
import { lexKeyword } from "../../../lex/lex-utils";
import { Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { MiniscriptParseContext } from "../../../parse/parser";

export class PK_K
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "PK_K";
  value: any;
  children: any[];
  isTaproot: boolean;
  type: number;

  constructor(v: any, isTaproot: boolean = false) {
    super();
    this.children = [];
    this.value = v;
    this.isTaproot = isTaproot;
    this.type = this.getType();
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "pk_k(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext:MiniscriptParseContext) => {
    parseContext.eat(this.tokenType);
    let key = parseContext.eat(STRING.tokenType);
    parseContext.eat(CLOSE_PAREN.tokenType);
    return new PK_K(key?.value);
  };

  getType = () => {
    return (
      Types.KeyType |
      Types.OneArgProperty |
      Types.NonzeroArgProperty |
      Types.UnitProperty |
      Types.DissatisfiableProperty |
      Types.ExpressionProperty |
      Types.NonmalleableProperty |
      Types.SafeProperty |
      Types.ExpensiveVerify |
      Types.NoCombinationHeightTimeLocks
    );
  };

  getSize = () => {
    return 34;
  };

  static fromScript = (scriptParseContext: any) => {
    let { reversedScript } = scriptParseContext;
    
    // TODO: Fix this to distinguish between strings (see miniscript-types.ts)
    // sloppy but this'll work as a last resort to parsing a string
    try {
      return scriptParseContext.parseScript(reversedScript)
    }
    catch(e) {
      // TODO: Change this like the above says
      // This can't tell an unimplemented opcode from a random string
      let k = reversedScript.shift();
      console.log("Unrecognized k", k)
      if(k == 'b') {
        console.log()
      }
      return new PK_K(k);
    }
  }

  toScript = () => {
    return this.value;
  };
}

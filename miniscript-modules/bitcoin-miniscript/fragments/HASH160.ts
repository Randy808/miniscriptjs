import { lexKeyword } from "../../../lex/lex-utils";
import { Types } from "../../../miniscript-types";
import { eat } from "../../../parse/parse-utils";
import { MiniscriptParseContext } from "../../../parse/parser";
import {
  MiniscriptFragmentStatic,
  MiniscriptFragment,
  LexState,
  Token,
} from "../../../types";
import { OPEN_PAREN, STRING, CLOSE_PAREN } from "../../../lex/universal-tokens";

export class HASH160
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "HASH160";
  type: number;
  hash: string;

  constructor(hash: string) {
    super();
    this.hash = hash;
    this.type = this.getType();
  }

  getType = () => {
    //Bonudmk
    return (
      Types.BaseType |
      Types.OneArgProperty |
      Types.NonzeroArgProperty |
      Types.UnitProperty |
      Types.DissatisfiableProperty |
      Types.NonmalleableProperty |
      Types.NoCombinationHeightTimeLocks
    );
  };

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "hash160", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext:MiniscriptParseContext) => {
    parseContext.eat(this.tokenType);

    parseContext.eat(OPEN_PAREN.tokenType);
    const stringToken = parseContext.eat(STRING.tokenType);
    parseContext.eat(CLOSE_PAREN.tokenType);

    if (!stringToken?.value) {
      throw new Error("String not found while parsing string in HASH160");
    }

    return new HASH160(stringToken.value as string);
  };

  getSize() {
    //21 bytes for push data and hash, rest for opcodes and pushdata
    return 27;
  }

  static fromScript = (scriptParseContext: any) => {
    let { reversedScript } = scriptParseContext;
    if (reversedScript[0] != "OP_EQUAL") {
      return;
    }

    if(reversedScript[2] != "OP_HASH160") {
      return;
    }

    reversedScript.shift();
    let hash = reversedScript.shift();
    reversedScript.shift();
    
    return new HASH160(hash);
  }

  toScript = () => {
    return `OP_SIZE 32 OP_EQUALVERIFY OP_HASH160 ${this.hash} OP_EQUAL`;
  };
}

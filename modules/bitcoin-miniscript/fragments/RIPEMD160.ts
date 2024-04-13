import { lexKeyword } from "../../../lex/lex-utils";
import { Types } from "../../../miniscript-types";
import { ParseContext } from "../../../parse/parser";
import {
  MiniscriptFragmentStatic,
  MiniscriptFragment,
  LexState,
  Token,
} from "../../../types";
import { OPEN_PAREN, STRING, CLOSE_PAREN } from "../../../lex/universal-tokens";

export class RIPEMD160
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "RIPEMD160";
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
    if (lexKeyword(s, "ripemd160", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: ParseContext) => {
    parseContext.eat(this.tokenType);

    parseContext.eat(OPEN_PAREN.tokenType);
    const stringToken = parseContext.eat(STRING.tokenType);
    parseContext.eat(CLOSE_PAREN.tokenType);

    if (!stringToken?.value) {
      throw new Error("String not found while parsing string in RIPEMD160");
    }

    return new RIPEMD160(stringToken.value as string);
  };

  getSize() {
    //21 bytes for push data and hash, rest for opcodes and pushdata
    return 27;
  }

  toScript = () => {
    return `OP_SIZE 32 OP_EQUALVERIFY OP_RIPEMD160 ${this.hash} OP_EQUAL`;
  };
}

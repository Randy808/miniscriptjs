import { lexKeyword } from "../../../lex-utils";
import { Types } from "../../../miniscript-types";
import { ParseContext } from "../../../parser";
import {
  MiniscriptFragmentStatic,
  MiniscriptFragment,
  LexState,
  Token,
} from "../../../types";
import { OPEN_PAREN, STRING, CLOSE_PAREN } from "../../../universal-tokens";

export class SHA256
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "SHA256";
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
    if (lexKeyword(s, "sha256", state)) {
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
      throw new Error(
        `String not found while parsing string in ${SHA256.tokenType}`
      );
    }

    return new SHA256(stringToken.value as string);
  };

  getSize() {
    //21 bytes for push data and hash, rest for opcodes and pushdata
    return 27;
  }

  toScript = () => {
    return `OP_SIZE 32 OP_EQUALVERIFY OP_SHA256 ${this.hash} OP_EQUAL`;
  };
}

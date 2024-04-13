import { CLOSE_PAREN, STRING } from "../../../lex/universal-tokens";
import { lexKeyword } from "../../../lex/lex-utils";
import { Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { MiniscriptParseContext } from "../../../parse/parser";

export class PK_H
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "PK_H";
  hash: string;
  type: number;

  constructor(hash: string) {
    super();
    this.hash = hash;
    this.type = this.getType();
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "pk_h(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext:MiniscriptParseContext) => {
    parseContext.eat(this.tokenType);
    let hash = parseContext.eat(STRING.tokenType);
    parseContext.eat(CLOSE_PAREN.tokenType);
    return new PK_H(hash.value);
  };

  getType = () => {
    //"Knudemsxk
    return (
      Types.KeyType |
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
    //21 for push and hash, 3 other opcodes
    return 24;
  };

  toScript = () => {
    return `OP_DUP OP_HASH160 ${this.hash} OP_EQUALVERIFY`;
  };
}

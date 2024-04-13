import { OPEN_PAREN, CLOSE_PAREN, STRING } from "../../../lex/universal-tokens";
import { lexKeyword } from "../../../lex/lex-utils";
import { Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parse/parser";

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

  static parse = (parseContext: ParseContext) => {
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

  toScript = () => {
    return this.value;
  };
}

import { OPEN_PAREN, CLOSE_PAREN } from "../../../universal-tokens";
import { lexKeyword } from "../../../lex-utils";
import { Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parser";
import { KEY } from "./KEY";

export class PK_K
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "PK_K";
  value: any;
  children: any[];
  isTaproot: boolean;

  constructor(v: any) {
    super();
    this.children = [];
    this.value = v;
    this.isTaproot = false;
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "pk_k", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: ParseContext) => {
    parseContext.eat(this.tokenType);
    parseContext.eat(OPEN_PAREN.tokenType);
    let key = parseContext.eat(KEY.tokenType);
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

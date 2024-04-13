import { lexKeyword } from "../../../lex/lex-utils";
import { Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parse/parser";

export class JUST_0
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "JUST_0";
  type: number;

  constructor() {
    super();
    this.type = this.getType();
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "0", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: ParseContext) => {
    parseContext.eat(this.tokenType);
    return new JUST_0();
  };

  getType = () => {
    //Bzudemsxk
    return (
      Types.BaseType |
      Types.ZeroArgProperty |
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
    return 1;
  };

  toScript = () => {
    return `0`;
  };
}

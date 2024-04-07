import { lexKeyword } from "../../../lex-utils";
import { Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parser";

export class JUST_1
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "JUST_1";
  type: number;

  constructor() {
    super();
    this.type = this.getType();
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (isNaN(parseInt(s[state.cursor + 1])) && lexKeyword(s, "1", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: ParseContext) => {
    parseContext.eat(this.tokenType);
    return new JUST_1();
  };

  getType = () => {
    return (
      Types.BaseType |
      Types.ZeroArgProperty |
      Types.UnitProperty |
      Types.ForcedProperty |
      Types.NonmalleableProperty |
      Types.ExpensiveVerify |
      Types.NoCombinationHeightTimeLocks
    );
  };

  getSize = () => {
    return 1;
  };

  toScript = () => {
    return `1`;
  };
}

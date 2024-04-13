import { COMMA, CLOSE_PAREN, NUMBER } from "../../../lex/universal-tokens";
import { lexKeyword } from "../../../lex/lex-utils";

import { sanityCheck, Types } from "../../../miniscript-types";
import {
  MiniscriptFragment,
  LexState,
  Token,
  MiniscriptFragmentStatic,
} from "../../../types";
import { MiniscriptParseContext } from "../../../parse/parser";
import { calculateByteLenForValue } from "../../../utils";

export class INP_VALUE
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "INP_VALUE";
  index: number;
  type: number;

  constructor(index: number) {
    super();
    this.index = index;
    this.type = this.getType();
    sanityCheck(this.type);
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "inp_value(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext:MiniscriptParseContext) => {
    parseContext.eat(this.tokenType);
    let inputIndex = parseContext.eat(NUMBER.tokenType)?.value;
    parseContext.eat(CLOSE_PAREN.tokenType);
    return new INP_VALUE(inputIndex);
  };

  getType = () => {
    return (
      Types.BaseType |
      Types.ZeroArgProperty |
      Types.ForcedProperty |
      Types.NonmalleableProperty |
      Types.ExpensiveVerify |
      Types.NoCombinationHeightTimeLocks
    );
  };

  getSize = () => {
    return calculateByteLenForValue(this.index) + 1;
  };

  toScript = () => {
    return `${this.index} INPSECTINPUTVALUE`;
  };
}

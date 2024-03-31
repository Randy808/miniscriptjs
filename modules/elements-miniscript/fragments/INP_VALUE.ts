import { COMMA, CLOSE_PAREN, NUMBER } from "../../../universal-tokens";
import { lexKeyword } from "../../../lex-utils";

import { TypeDescriptions, Types } from "../../../miniscript-types";
import {
  MiniscriptFragment,
  LexState,
  Token,
  MiniscriptFragmentStatic,
} from "../../../types";
import { ParseContext } from "../../../parser";
import { calculateByteLenForValue } from "../../../utils";

export class INP_VALUE extends MiniscriptFragmentStatic {
  static tokenType = "INP_VALUE";
  index: number;

  constructor(index: number) {
    super();
    this.index = index;
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

  static parse = (parseContext: ParseContext) => {
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

import {
  NUMBER,
} from "../../../universal-tokens";
import { lexKeyword } from "../../../lex-utils";
import { Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parser";
import { calculateByteLenForValue } from "../../../utils";

export class AFTER
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "AFTER";
  locktime: number;
  type: number;

  constructor(locktime: number) {
    super();
    this.locktime = locktime;
    this.type = this.getType();
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "after(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: ParseContext) => {
    parseContext.eat(this.tokenType);

    let locktime = NUMBER.parse(parseContext);

    if (locktime < 1 || locktime >= 0x80000000) {
      throw new Error("Locktime invalid");
    }

    return new AFTER(locktime);
  };

  getType = () => {
    const LOCKTIME_THRESHOLD = 500000000;
    let type = 0;

    if (this.locktime >= LOCKTIME_THRESHOLD) {
      type |= Types.ContainsTimeTimelock; // "i"_mst
    }

    if (this.locktime < LOCKTIME_THRESHOLD) {
      type |= Types.ContainsHeightTimelock; // "j"_mst
    }

    // "Bzfmxk"_mst
    type |=
      Types.BaseType |
      Types.ZeroArgProperty |
      Types.ForcedProperty |
      Types.NonmalleableProperty |
      Types.ExpensiveVerify |
      Types.NoCombinationHeightTimeLocks;

    return type;
  };

  getSize = () => {
    //+ 1 for CHECKLOCKTIMEVERIFY opcode
    return calculateByteLenForValue(this.locktime) + 1;
  };

  toScript = () => {
    return `${this.locktime} CHECKLOCKTIMEVERIFY`;
  };
}

import { CLOSE_PAREN, NUMBER } from "../../../lex/universal-tokens";
import { lexKeyword } from "../../../lex/lex-utils";
import { sanityCheck, Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { calculateByteLenForValue } from "../../../utils";
import { ParseContext } from "../../../parse/parser";

export class OLDER
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "OLDER";
  children: any[];
  k: number;
  type: number;

  constructor(k: number) {
    super();
    this.children = [];
    this.k = k;
    this.type = this.getType();
    sanityCheck(this.type);
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "older(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: ParseContext) => {
    parseContext.eat(this.tokenType);

    let seqNum = parseContext.eat(NUMBER.tokenType)?.value;

    if (isNaN(seqNum)) {
      throw new Error("sequence not valid");
    }

    if (seqNum < 1 || seqNum >= 0x80000000) {
      throw new Error("Sequence number invalid");
    }

    parseContext.eat(CLOSE_PAREN.tokenType);

    return new OLDER(seqNum);
  };

  getSize = () => {
    return 1 + calculateByteLenForValue(this.k);
  };

  getType = () => {
    let type = 0;
    const SEQUENCE_LOCKTIME_TYPE_FLAG = 1 << 22;

    // "g"_mst.If(k & CTxIn::SEQUENCE_LOCKTIME_TYPE_FLAG) |
    if (this.k & SEQUENCE_LOCKTIME_TYPE_FLAG) {
      type |= Types.ContainsRelativeTimeTimelock;
    } else {
      // "h"_mst.If(!(k & CTxIn::SEQUENCE_LOCKTIME_TYPE_FLAG)) |
      type |= Types.ContainsRelativeHeightTimelock;
    }

    // "Bzfmxk"_mst;
    type |=
      Types.BaseType |
      Types.ZeroArgProperty |
      Types.ForcedProperty |
      Types.NonmalleableProperty |
      Types.ExpensiveVerify |
      Types.NoCombinationHeightTimeLocks;

    return type;
  };

  toScript = () => {
    return `${this.k} OP_CHECKSEQUENCEVERIFY`;
  };
}

import { CLOSE_PAREN, COMMA, NUMBER, STRING } from "../../../universal-tokens";
import { lexKeyword } from "../../../lex-utils";
import { sanityCheck, Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parser";
import { PK_K } from "./PK_K";

export class MULTI
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "MULTI";
  children: any[];
  k: number;
  type: number;

  constructor(k: number, children: MiniscriptFragment[]) {
    super();
    this.k = k;
    this.children = children;
    this.type = this.getType();
    sanityCheck(this.type);
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "multi(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: ParseContext) => {
    parseContext.eat(this.tokenType);
    let k = parseContext.eat(NUMBER.tokenType)?.value;
    let children: MiniscriptFragment[] = [];

    while (parseContext.peekToken().tokenType != CLOSE_PAREN.tokenType) {
      parseContext.eat(COMMA.tokenType);
      //TODO: Add key validation with key validator passed into parser
      let key = parseContext.eat(STRING.tokenType);
      // multi can only be used on pre-taproot keys
      children.push(new PK_K(key?.value, false));
    }

    parseContext.eat(CLOSE_PAREN.tokenType);
    return new MULTI(k, children);
  };

  getSize = () => {
    //3 for max keys, thresh, and checkmultisig opcode
    return (
      3 +
      (this.children.length > 16 ? 1 : 0) +
      (this.k > 16 ? 1 : 0) +
      this.children.reduce((acc, child) => acc + child.getSize(), 0)
    );
  };

  getType = () => {
    return (
      Types.BaseType |
      Types.NonzeroArgProperty |
      Types.UnitProperty |
      Types.DissatisfiableProperty |
      Types.ExpressionProperty |
      Types.SafeProperty |
      Types.NoCombinationHeightTimeLocks
    );
  };

  toScript = (verify: boolean = false) => {
    let script = `${this.k}`;
    for (let i = 0; i < this.children.length; i++) {
      script = script + " " + `${this.children[i].toScript()}`;
    }
    return (
      script +
      " " +
      this.children.length +
      " " +
      (verify ? `OP_CHECKMULTISIGVEIFY` : `OP_CHECKMULTISIG`)
    );
  };
}

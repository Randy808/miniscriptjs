import { lexKeyword } from "../../../lex-utils";
import { Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parser";
import { WRAP_C } from "./WRAP_C";
import { PK_H } from "./PK_H";

export class PKH
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "PK_H";
  children: MiniscriptFragment[];
  type: number;

  constructor(children: MiniscriptFragment[]) {
    super();
    this.children = children;
    this.type = this.getType();
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "pkh(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: ParseContext) => {
    let alteredToken = parseContext.eat(this.tokenType);
    alteredToken.tokenType = PK_H.tokenType;

    parseContext.tokens.unshift(alteredToken);
    let pk_h = PK_H.parse(parseContext);
    let wrap_c = new WRAP_C([pk_h]);
    return new PKH([wrap_c]);
  };

  getType = () => {
    return this.children[0].getType();
  };

  getSize = () => {
    return this.children[0].getSize();
  };

  toScript = () => {
    return this.children[0].toScript();
  };
}

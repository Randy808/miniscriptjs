import { COMMA, CLOSE_PAREN } from "../../../universal-tokens";
import { lexKeyword } from "../../../lex-utils";
import {
  sanityCheck,
  TypeDescriptions,
  Types,
} from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  LexState,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parser";
import { JUST_0 } from "./JUST_0";
import { OR_I } from "./OR_I";

export class WRAP_U
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "WRAP_U";
  children: MiniscriptFragment[];
  type: number;

  constructor(children: MiniscriptFragment[]) {
    super();
    this.children = children;
    this.type = this.getType();
    sanityCheck(this.type);
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "u", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parseWrapper = (parseContext: any): MiniscriptFragment => {
    parseContext.eat(this.tokenType);
    let child = parseContext.parseWrappedExpression();
    let or_i = new OR_I([child, new JUST_0()]);
    return new WRAP_U([or_i]);
  };

  getType = () => this.children[0].getType();

  getSize = () => {
    return this.children[0].getSize();
  };

  toScript = () => this.children[0].toScript();
}

import { COMMA, CLOSE_PAREN } from "../../../lex/universal-tokens";
import { lexKeyword } from "../../../lex/lex-utils";
import {
  hasType,
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
import { ParseContext } from "../../../parse/parser";
import { JUST_0 } from "./JUST_0";
import { ANDOR } from "./ANDOR";

export class AND_N
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "AND_N";
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
    if (lexKeyword(s, "and_n(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: ParseContext) => {
    parseContext.eat(this.tokenType);

    let firstChild = parseContext.parseWrappedExpression();

    parseContext.eat(COMMA.tokenType);

    let secondChild = parseContext.parseWrappedExpression();
    parseContext.eat(CLOSE_PAREN.tokenType);

    let andor = new ANDOR([firstChild, secondChild, new JUST_0()]);
    return new AND_N([andor]);
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

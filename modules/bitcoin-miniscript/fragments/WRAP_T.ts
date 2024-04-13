import { lexKeyword } from "../../../lex/lex-utils";
import {
  MiniscriptFragmentStatic,
  LexState,
  Token,
  MiniscriptWrapper,
  MiniscriptFragment,
} from "../../../types";
import { AND_V } from "./AND_V";
import { JUST_1 } from "./JUST_1";

//Syntactic Sugar
export class WRAP_T
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment, MiniscriptWrapper
{
  static tokenType = "WRAP_T";
  children: MiniscriptFragment[];
  type: number;

  constructor(children: MiniscriptFragment[]) {
    super();
    this.children = children;
    this.type = this.getType();
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "t", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parseWrapper = (parseContext: any) => {
    parseContext.eat(this.tokenType);
    let subexp = parseContext.parseWrappedExpression();
    let child = new AND_V([subexp, new JUST_1()]);
    return new WRAP_T([child]);
  };

  getSize() {
    return this.children[0].getSize();
  }

  getType() {
    return this.children[0].getType();
  }

  toScript() {
    return this.children[0].toScript();
  }
}

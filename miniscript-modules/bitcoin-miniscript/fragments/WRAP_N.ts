import { lexKeyword } from "../../../lex/lex-utils";
import {
  sanityCheck,
  Types,
  TypeDescriptions,
} from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  LexState,
  Token,
  MiniscriptWrapper,
} from "../../../types";

export class WRAP_N
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment, MiniscriptWrapper
{
  static tokenType = "WRAP_N";
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
    if (lexKeyword(s, "n", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parseWrapper = (parseContext: any) => {
    parseContext.eat(this.tokenType);

    let child = parseContext.parseWrappedExpression();
    return new WRAP_N([child]);
  };

  getSize = () => {
    return this.children[0].getSize() + 1;
  };

  getType = () => {
    let type = 0;
    let firstChild = this.children[0];
    // (x & "ghijk"_mst) |
    type |=
      firstChild.type &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock |
        Types.NoCombinationHeightTimeLocks);

    // (x & "Bzondfems"_mst) |
    type |=
      firstChild.type &
      (Types.BaseType |
        Types.ZeroArgProperty |
        Types.OneArgProperty |
        Types.NonzeroArgProperty |
        Types.DissatisfiableProperty |
        Types.ForcedProperty |
        Types.ExpressionProperty |
        Types.NonmalleableProperty |
        Types.SafeProperty);

    // "ux"_mst;
    type |= Types.UnitProperty | Types.ExpensiveVerify;
    return type;
  };

  toScript = () => {
    return `${this.children[0].toScript()} OP_0NOTEQUAL`;
  };
}

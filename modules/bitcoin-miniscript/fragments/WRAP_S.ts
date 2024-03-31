import { lexKeyword } from "../../../lex-utils";
import { Types } from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  MiniscriptWrapper,
  LexState,
  Token,
} from "../../../types";

export class WRAP_S
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment, MiniscriptWrapper
{
  static tokenType = "WRAP_S";
  children: any[];
  type: number;

  constructor(children: any[]) {
    super();
    this.children = children;
    this.type = this.getType();
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "s", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parseWrapper = (parseContext: any) => {
    parseContext.eat(this.tokenType);

    let child = parseContext.parseWrappedExpression();
    return new WRAP_S([child]);
  };

  getSize = () => {
    let firstChild = this.children[0];
    return firstChild.getSize() + 1;
  };

  getType = () => {
    let type = 0;
    let firstChild = this.children[0];

    // "W"_mst.If(x << "Bo"_mst) |
    if (
      (firstChild.getType() & (Types.BaseType | Types.OneArgProperty)) ===
      (Types.BaseType | Types.OneArgProperty)
    ) {
      type |= Types.WrappedType;
    } else {
      throw new Error(
        `Failed to parse WRAP_S: The first argument ${firstChild} must be of Base Type and have the one arg property`
      );
    }

    // (x & "ghijk"_mst) |
    type |=
      firstChild.getType() &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock |
        Types.NoCombinationHeightTimeLocks);

    // (x & "udfemsx"_mst);
    type |=
      firstChild.getType() &
      (Types.UnitProperty |
        Types.DissatisfiableProperty |
        Types.ForcedProperty |
        Types.ExpressionProperty |
        Types.NonmalleableProperty |
        Types.SafeProperty |
        Types.ExpensiveVerify);

    return type;
  };

  toScript = () => {
    let firstChild = this.children[0];
    return `OP_SWAP ${firstChild.toScript()}`;
  };
}

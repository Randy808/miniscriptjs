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
  MiniscriptWrapper,
} from "../../../types";

export class WRAP_J
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment, MiniscriptWrapper
{
  static tokenType = "WRAP_J";
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
    if (lexKeyword(s, "j", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parseWrapper = (parseContext: any) => {
    parseContext.eat(this.tokenType);
    let child = parseContext.parseWrappedExpression();
    return new WRAP_J([child]);
  };

  getSize = () => {
    return this.children[0].getSize() + 4;
  };

  getType = () => {
    let type = 0;
    let firstChild = this.children[0];

    // "B"_mst.If(x << "Bn"_mst) | // B=B_x*n_x
    if (!hasType(firstChild.type, [Types.BaseType, Types.NonzeroArgProperty])) {
      let errorMessage = `${WRAP_J.tokenType} could not be constructed because it's first argument was not of type BASE.\n`;
      errorMessage += `Please make sure the first argument is an expression that consumes a non-zero stack argument and ${TypeDescriptions.BaseType}`;
      throw new Error(errorMessage);
    }

    type |= Types.BaseType;

    // "e"_mst.If(x << "f"_mst) | // e=f_x
    if (hasType(firstChild.type, [Types.ForcedProperty])) {
      type |= Types.ExpressionProperty;
    }

    // (x & "ghijk"_mst) | // g=g_x, h=h_x, i=i_x, j=j_x, k=k_x
    type |=
      firstChild.type &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock |
        Types.NoCombinationHeightTimeLocks);

    // (x & "oums"_mst) | // o=o_x, u=u_x, m=m_x, s=s_x
    type |=
      firstChild.type &
      (Types.OneArgProperty |
        Types.UnitProperty |
        Types.NonmalleableProperty |
        Types.SafeProperty);

    // "ndx"_mst; // n, d, x
    type |=
      Types.NonzeroArgProperty |
      Types.DissatisfiableProperty |
      Types.ExpensiveVerify;

    return type;
  };

  toScript = () => {
    return `OP_SIZE OP_0NOTEQUAL OP_IF ${this.children[0].toScript()} OP_ENDIF`;
  };
}

import { lexKeyword } from "../../../lex/lex-utils";
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
  MiniscriptWrapper,
} from "../../../types";

export class WRAP_A
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment, MiniscriptWrapper
{
  static tokenType = "WRAP_A";
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
    if (lexKeyword(s, "a", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parseWrapper = (parseContext: any) => {
    parseContext.eat(this.tokenType);
    let child = parseContext.parseWrappedExpression();
    return new WRAP_A([child]);
  };

  getSize = () => {
    return this.children[0].getSize() + 2;
  };

  getType = () => {
    let type = 0;
    let firstChild = this.children[0];

    //"W"_mst.If(x << "B"_mst) | // W=B_x
    if (!(firstChild.type & Types.BaseType)) {
      let errorMessage = `${WRAP_A.tokenType} could not be constructed because it's first argument was not of type BASE.\n`;
      errorMessage += `Please make sure the first argument is an expression that ${TypeDescriptions.BaseType}`;
      throw new Error(errorMessage);
    }

    type |= Types.WrappedType;

    //(x & "ghijk"_mst) | // g=g_x, h=h_x, i=i_x, j=j_x, k=k_x
    type |=
      firstChild.type &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock |
        Types.NoCombinationHeightTimeLocks);

    //(x & "udfems"_mst) | // u=u_x, d=d_x, f=f_x, e=e_x, m=m_x, s=s_x
    type |=
      firstChild.getType() &
      (Types.UnitProperty |
        Types.DissatisfiableProperty |
        Types.ForcedProperty |
        Types.ExpressionProperty |
        Types.NonmalleableProperty |
        Types.SafeProperty);

    //"x"_mst; // x
    type |= Types.ExpensiveVerify;

    return type;
  };

  toScript = () => {
    return `OP_TOALTSTACK ${this.children[0].toScript()} OP_FROMALTSTACK`;
  };
}

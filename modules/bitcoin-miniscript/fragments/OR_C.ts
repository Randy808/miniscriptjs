import { COMMA, CLOSE_PAREN } from "../../../universal-tokens";
import { lexKeyword } from "../../../lex-utils";
import {
  sanityCheck,
  TypeDescriptions,
  Types,
  hasType,
} from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  LexState,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parser";
import { indent } from "../../../utils";

export class OR_C
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "OR_C";
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
    if (lexKeyword(s, "or_c(", state)) {
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

    return new OR_C([firstChild, secondChild]);
  };

  getType = () => {
    let firstChild = this.children[0];
    let secondChild = this.children[1];

    let intersectionType = firstChild.getType() & secondChild.getType();
    let type = 0;

    //(y & "V"_mst).If(x << "Bdu"_mst) | // V=V_y*B_x*u_x*d_x
    let dissatisfiableTypePushesOneOnSatisfaction =
      Types.BaseType | Types.DissatisfiableProperty | Types.UnitProperty;

    let firstChildIsDissatisfiable =
      (firstChild.getType() & dissatisfiableTypePushesOneOnSatisfaction) ==
      dissatisfiableTypePushesOneOnSatisfaction;

    if (firstChildIsDissatisfiable) {
      type |= secondChild.getType() & Types.VerifyType ? Types.VerifyType : 0;
    }

    //(x & "o"_mst).If(y << "z"_mst) | // o=o_x*z_y
    if (
      hasType(secondChild.getType(), [Types.ZeroArgProperty]) &&
      hasType(firstChild.getType(), [Types.OneArgProperty])
    ) {
      type |= Types.OneArgProperty;
    }

    //(x & y & "m"_mst).If(x << "e"_mst && (x | y) << "s"_mst) | // m=m_x*m_y*e_x*(s_x+s_y)
    if (firstChild.getType() & Types.ExpressionProperty) {
      if (intersectionType & Types.SafeProperty) {
        type |= Types.NonmalleableProperty;
      }
    }

    //(x & y & "zs"_mst) | // z=z_x*z_y, s=s_x*s_y
    if (
      hasType(intersectionType, [Types.ZeroArgProperty, Types.SafeProperty])
    ) {
      type |= Types.ZeroArgProperty | Types.SafeProperty;
    }

    //"fx"_mst | // f, x
    type |= Types.ForcedProperty | Types.ExpensiveVerify;

    //((x | y) & "ghij"_mst) | // g=g_x+g_y, h=h_x+h_y, i=i_x+i_y, j=j_x+j_y
    type |=
      (firstChild.type | secondChild.type) &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock);

    //(x & y & "k"_mst); // k=k_x*k_y
    if (
      firstChild.type &
      secondChild.type &
      Types.NoCombinationHeightTimeLocks
    ) {
      type |= Types.NoCombinationHeightTimeLocks;
    }

    return type;
  };

  getSize = () => {
    return this.children.reduce((acc, child) => acc + child.getSize(), 2);
  };

  toScript = () => {
    return (
      `${this.children[0].toScript()} OP_NOTIF` +
      `\n${indent(this.children[1].toScript())}\n` +
      `OP_ENDIF`
    );
  };
}

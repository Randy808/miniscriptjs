import { COMMA, CLOSE_PAREN } from "../../../lex/universal-tokens";
import { lexKeyword } from "../../../lex/lex-utils";
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
import { ParseContext } from "../../../parse/parser";
import { indent } from "../../../utils";

export class OR_D
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "OR_D";
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
    if (lexKeyword(s, "or_d(", state)) {
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

    return new OR_D([firstChild, secondChild]);
  };

  getType = () => {
    let firstChild = this.children[0];
    let secondChild = this.children[1];

    let childrenAnd = firstChild.getType() & secondChild.getType();
    let childrenOr = firstChild.getType() | secondChild.getType();
    let type = 0;

    // (y & "B"_mst).If(x << "Bdu"_mst) | // B=B_y*B_x*d_x*u_x
    if (
      secondChild.type & Types.BaseType &&
      hasType(firstChild.type, [
        Types.BaseType,
        Types.DissatisfiableProperty,
        Types.UnitProperty,
      ])
    ) {
      type |= Types.BaseType;
    }

    // (x & "o"_mst).If(y << "z"_mst) | // o=o_x*z_y
    if (
      firstChild.type & Types.OneArgProperty &&
      secondChild.type & Types.ZeroArgProperty
    ) {
      type |= Types.OneArgProperty;
    }

    // (x & y & "m"_mst).If(x << "e"_mst && (x | y) << "s"_mst) | // m=m_x*m_y*e_x*(s_x+s_y)
    if (
      childrenAnd & Types.NonmalleableProperty &&
      firstChild.type & Types.ExpressionProperty &&
      childrenOr & Types.SafeProperty
    ) {
      type |= Types.NonmalleableProperty;
    }

    // (x & y & "zs"_mst) | // z=z_x*z_y, s=s_x*s_y
    type |= (childrenAnd & Types.ZeroArgProperty) | Types.SafeProperty;

    // (y & "ufde"_mst) | // u=u_y, f=f_y, d=d_y, e=e_y
    let unitSatisfactionWithMalleableSignatureDissatifaction =
      Types.UnitProperty |
      Types.ForcedProperty |
      Types.DissatisfiableProperty |
      Types.ExpressionProperty;

    type |=
      secondChild.type & unitSatisfactionWithMalleableSignatureDissatifaction;

    // "x"_mst | // x
    type |= Types.ExpensiveVerify;

    // ((x | y) & "ghij"_mst) | // g=g_x+g_y, h=h_x+h_y, i=i_x+i_y, j=j_x+j_y
    let timeRelatedPropertyMask =
      Types.ContainsRelativeHeightTimelock |
      Types.ContainsRelativeHeightTimelock |
      Types.ContainsTimeTimelock |
      Types.ContainsHeightTimelock;

    type |= childrenOr & timeRelatedPropertyMask;

    // (x & y & "k"_mst); // k=k_x*k_y
    type |= childrenAnd & Types.NoCombinationHeightTimeLocks;

    return type;
  };

  getSize = () => {
    return this.children.reduce((acc, child) => acc + child.getSize(), 3);
  };

  toScript = () => {
    //[X] IFDUP NOTIF [Z] ENDIF
    return (
      `${this.children[0].toScript()} OP_IFDUP OP_NOTIF` +
      `\n${indent(this.children[1].toScript())}\n` +
      `OP_ENDIF`
    );
  };
}

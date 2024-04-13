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
import { MiniscriptParseContext } from "../../../parse/parser";

export class OR_B
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "OR_B";
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
    if (lexKeyword(s, "or_b(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext:MiniscriptParseContext) => {
    parseContext.eat(this.tokenType);

    let firstChild = parseContext.parseWrappedExpression();

    parseContext.eat(COMMA.tokenType);

    let secondChild = parseContext.parseWrappedExpression();

    parseContext.eat(CLOSE_PAREN.tokenType);

    return new OR_B([firstChild, secondChild]);
  };

  getType = () => {
    let firstChild = this.children[0];
    let secondChild = this.children[1];

    let type = 0;

    //"B"_mst.If(x << "Bd"_mst && y << "Wd"_mst) | // B=B_x*d_x*W_x*d_y
    if (
      !hasType(firstChild.type, [Types.BaseType, Types.DissatisfiableProperty])
    ) {
      let errorMessage = `${OR_B.tokenType} could not be constructed because it's first argument was not of type BASE.\n`;
      errorMessage += `Please make sure the first argument is an expression that ${TypeDescriptions.BaseType}`;
      throw new Error(errorMessage);
    }

    if (
      !hasType(secondChild.type, [
        Types.WrappedType,
        Types.DissatisfiableProperty,
      ])
    ) {
      let errorMessage = `${OR_B.tokenType} could not be constructed because it's second argument was not of type WRAPPED.\n`;
      errorMessage += `Please make sure the second argument is an expression that ${TypeDescriptions.BaseType}`;
      throw new Error(errorMessage);
    }

    type |= Types.BaseType;

    let childrenOr = firstChild.type | secondChild.type;
    //((x | y) & "o"_mst).If((x | y) << "z"_mst) | // o=o_x*z_y+z_x*o_y
    if (hasType(childrenOr, [Types.ZeroArgProperty])) {
      type |= hasType(childrenOr, [Types.OneArgProperty])
        ? Types.OneArgProperty
        : 0;
    }

    let childrenAnd = firstChild.type & secondChild.type;
    //(x & y & "m"_mst).If((x | y) << "s"_mst && (x & y) << "e"_mst) | // m=m_x*m_y*e_x*e_y*(s_x+s_y)
    if (
      (hasType(childrenOr, [Types.SafeProperty]),
      hasType(childrenAnd, [Types.ExpressionProperty]))
    ) {
      type |= childrenAnd & Types.NonmalleableProperty;
    }

    //(x & y & "zse"_mst) | // z=z_x*z_y, s=s_x*s_y, e=e_x*e_y

    //"dux"_mst | // d, u, x
    type |=
      Types.DissatisfiableProperty | Types.UnitProperty | Types.ExpensiveVerify;

    //((x | y) & "ghij"_mst) | // g=g_x+g_y, h=h_x+h_y, i=i_x+i_y, j=j_x+j_y
    type |=
      (firstChild.type | secondChild.type) &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock);
    //(x & y & "k"_mst); // k=k_x*k_y
    type |=
      firstChild.type & secondChild.type & Types.NoCombinationHeightTimeLocks;
    return type;
  };

  getSize = () => {
    return this.children.reduce((acc, child) => acc + child.getSize(), 1);
  };

  toScript = () => {
    return `${this.children[0].toScript()} ${this.children[1].toScript()} OP_BOOLOR`;
  };
}

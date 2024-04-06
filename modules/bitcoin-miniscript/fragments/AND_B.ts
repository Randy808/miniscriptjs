import { COMMA, CLOSE_PAREN } from "../../../universal-tokens";
import { lexKeyword } from "../../../lex-utils";
import { sanityCheck, TypeDescriptions, Types } from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  LexState,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parser";

export class AND_B
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "AND_B";
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
    if (lexKeyword(s, "and_b(", state)) {
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

    return new AND_B([firstChild, secondChild]);
  };

  getType = () => {
    let firstChild = this.children[0];
    let secondChild = this.children[1];

    let type = 0;

    //(x & "B"_mst).If(y << "W"_mst) | // B=B_x*W_y
    if (!(firstChild.getType() & Types.BaseType)) {
      let errorMessage = `${AND_B.tokenType} could not be constructed because it's first argument was not of type BASE.\n`;
      errorMessage += `Please make sure the first argument is an expression that ${TypeDescriptions.BaseType}`;
      throw new Error(errorMessage);
    }

    if (!(secondChild.getType() & Types.WrappedType)) {
      let errorMessage = `${AND_B.tokenType} could not be constructed because it's second argument was not of type WRAPPED.\n`;
      errorMessage += `Please make sure the second argument is an expression that ${TypeDescriptions.WrappedType}`;
      throw new Error(errorMessage);
    }

    type |= Types.BaseType;

    //((x | y) & "o"_mst).If((x | y) << "z"_mst) | // o=o_x*z_y+z_x*o_y
    if (
      (firstChild.getType() | secondChild.getType()) &
      Types.ZeroArgProperty
    ) {
      type |=
        (firstChild.getType() | secondChild.getType()) & Types.OneArgProperty;
    }

    //(x & "n"_mst) | (y & "n"_mst).If(x << "z"_mst) | // n=n_x+z_x*n_y
    type |=
      (firstChild.getType() | secondChild.getType()) & Types.NonzeroArgProperty;

    //(x & y & "e"_mst).If((x & y) << "s"_mst) | // e=e_x*e_y*s_x*s_y
    if (firstChild.getType() & secondChild.getType() & Types.SafeProperty) {
      type |=
        firstChild.getType() & secondChild.getType() & Types.ExpressionProperty;
    }

    //(x & y & "dzm"_mst) | // d=d_x*d_y, z=z_x*z_y, m=m_x*m_y
    type |=
      firstChild.getType() &
      secondChild.getType() &
      (Types.DissatisfiableProperty |
        Types.ZeroArgProperty |
        Types.NonmalleableProperty);

    //"f"_mst.If(((x & y) << "f"_mst) || (x << "sf"_mst) || (y << "sf"_mst)) | // f=f_x*f_y + f_x*s_x + f_y*s_y
    if (
      (firstChild.getType() & secondChild.getType() & Types.ForcedProperty) ===
        Types.ForcedProperty ||
      (firstChild.getType() & (Types.SafeProperty | Types.ForcedProperty)) ===
        (Types.SafeProperty | Types.ForcedProperty) ||
      (secondChild.getType() & (Types.SafeProperty | Types.ForcedProperty)) ===
        (Types.SafeProperty | Types.ForcedProperty)
    ) {
      type |= Types.ForcedProperty;
    }

    //((x | y) & "s"_mst) | // s=s_x+s_y
    type |= (firstChild.getType() | secondChild.getType()) & Types.SafeProperty;

    //"ux"_mst | // u, x
    type |= Types.UnitProperty | Types.ExpensiveVerify;

    //TODO: Standardize this for all "ghij" property additions
    let timeRelatedPropertyMask =
      Types.ContainsRelativeHeightTimelock |
      Types.ContainsRelativeHeightTimelock |
      Types.ContainsTimeTimelock |
      Types.ContainsHeightTimelock;

    //((x | y) & "ghij"_mst) | // g=g_x+g_y, h=h_x+h_y, i=i_x+i_y, j=j_x+j_y
    type |=
      firstChild.getType() & secondChild.getType() & timeRelatedPropertyMask;

    if (
      (firstChild.getType() &
        secondChild.getType() &
        Types.NoCombinationHeightTimeLocks) ===
        Types.NoCombinationHeightTimeLocks &&
      !(
        (firstChild.getType() & Types.ContainsRelativeTimeTimelock &&
          secondChild.getType() & Types.ContainsRelativeHeightTimelock) ||
        (firstChild.getType() & Types.ContainsRelativeHeightTimelock &&
          secondChild.getType() & Types.ContainsRelativeTimeTimelock) ||
        (firstChild.getType() & Types.ContainsTimeTimelock &&
          secondChild.getType() & Types.ContainsHeightTimelock) ||
        (firstChild.getType() & Types.ContainsHeightTimelock &&
          secondChild.getType() & Types.ContainsTimeTimelock)
      )
    ) {
      type |= Types.NoCombinationHeightTimeLocks;
    }

    return type;
  };

  getSize = () => {
    return this.children.reduce((acc, child) => acc + child.getSize(), 1);
  };

  toScript = () => {
    return `${this.children[0].toScript()} ${this.children[1].toScript()} OP_BOOLAND`;
  };
}

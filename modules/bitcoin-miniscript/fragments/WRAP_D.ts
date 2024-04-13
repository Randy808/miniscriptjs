import { lexKeyword } from "../../../lex/lex-utils";
import { sanityCheck, Types } from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  LexState,
  Token,
  MiniscriptWrapper,
} from "../../../types";

export class WRAP_D
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment, MiniscriptWrapper
{
  static tokenType = "WRAP_D";
  children: MiniscriptFragment[];
  isTaproot: boolean;
  type: number;

  constructor(children: MiniscriptFragment[], isTaproot: boolean) {
    super();
    this.children = children;
    this.isTaproot = isTaproot;
    this.type = this.getType();
    sanityCheck(this.type);
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "d", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parseWrapper = (parseContext: any) => {
    parseContext.eat(this.tokenType);
    let child = parseContext.parseWrappedExpression();
    return new WRAP_D([child], false);
  };

  getSize = () => {
    return this.children[0].getSize() + 3;
  };

  getType = () => {
    let type = 0;
    let firstChild = this.children[0];

    // "B"_mst.If(x << "Vz"_mst) |
    if (
      (firstChild.type & (Types.VerifyType | Types.ZeroArgProperty)) ===
      (Types.VerifyType | Types.ZeroArgProperty)
    ) {
      type |= Types.BaseType;
    }

    // "o"_mst.If(x << "z"_mst) |
    if ((firstChild.type & Types.ZeroArgProperty) === Types.ZeroArgProperty) {
      type |= Types.OneArgProperty;
    }

    // "e"_mst.If(x << "f"_mst) |
    if ((firstChild.type & Types.ForcedProperty) === Types.ForcedProperty) {
      type |= Types.ExpressionProperty;
    }

    // (x & "ghijk"_mst) |
    type |=
      firstChild.type &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock |
        Types.NoCombinationHeightTimeLocks);

    // (x & "ms"_mst) |
    type |= firstChild.type & (Types.NonmalleableProperty | Types.SafeProperty);

    // "u"_mst.If(IsTapscript(ms_ctx)) |
    if (this.isTaproot) {
      type |= Types.UnitProperty;
    }

    // "ndx"_mst;
    type |=
      Types.NonzeroArgProperty |
      Types.DissatisfiableProperty |
      Types.ExpensiveVerify;

    return type;
  };

  toScript = () => {
    return `OP_DUP OP_IF ${this.children[0].toScript()} OP_ENDIF`;
  };
}

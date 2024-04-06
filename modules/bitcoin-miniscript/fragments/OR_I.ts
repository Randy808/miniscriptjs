import { COMMA, CLOSE_PAREN } from "../../../universal-tokens";
import { lexKeyword } from "../../../lex-utils";
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
} from "../../../types";
import { ParseContext } from "../../../parser";
import { indent } from "../../../utils";

export class OR_I
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "OR_I";
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
    if (lexKeyword(s, "or_i(", state)) {
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
    return new OR_I([firstChild, secondChild]);
  };

  getType = () => {
    let firstChild = this.children[0];
    let secondChild = this.children[1];
    let type = 0;

    // (x & y & "VBKufs"_mst) |
    type |=
      firstChild.type &
      secondChild.type &
      (Types.VerifyType |
        Types.BaseType |
        Types.KeyType |
        Types.UnitProperty |
        Types.ForcedProperty |
        Types.SafeProperty);

    // "o"_mst.If((x & y) << "z"_mst) |
    if (
      (firstChild.type & secondChild.type & Types.ZeroArgProperty) ===
      Types.ZeroArgProperty
    ) {
      type |= Types.OneArgProperty;
    }

    // ((x | y) & "e"_mst).If((x | y) << "f"_mst) |
    if (
      (firstChild.type | secondChild.type) & Types.ExpressionProperty &&
      (firstChild.type | secondChild.type) & Types.ForcedProperty
    ) {
      type |= Types.ExpressionProperty;
    }

    // (x & y & "m"_mst).If((x | y) << "s"_mst) |
    if (
      firstChild.type & secondChild.type & Types.NonmalleableProperty &&
      ((firstChild.type | secondChild.type) & Types.SafeProperty) ===
        Types.SafeProperty
    ) {
      type |= Types.NonmalleableProperty;
    }

    // ((x | y) & "d"_mst) |
    type |= (firstChild.type | secondChild.type) & Types.DissatisfiableProperty;

    // "x"_mst |
    type |= Types.ExpensiveVerify;

    // ((x | y) & "ghij"_mst) |
    type |=
      (firstChild.type | secondChild.type) &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock);

    // (x & y & "k"_mst);
    type |=
      firstChild.type & secondChild.type & Types.NoCombinationHeightTimeLocks;

    return type;
  };

  getSize = () => {
    return this.children.reduce((acc, child) => acc + child.getSize(), 3);
  };

  toScript = () => {
    return (
      `OP_IF` +
      `\n${indent(this.children[0].toScript())}\n` +
      `OP_ELSE` +
      `\n${this.children[1].toScript()}\n` +
      `OP_ENDIF`
    );
  };
}

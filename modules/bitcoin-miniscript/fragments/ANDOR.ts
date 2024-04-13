import { COMMA, CLOSE_PAREN } from "../../../lex/universal-tokens";
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
} from "../../../types";
import { MiniscriptParseContext } from "../../../parse/parser";
import { indent } from "../../../utils";

export class ANDOR
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "ANDOR";
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
    if (lexKeyword(s, "andor(", state)) {
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

    parseContext.eat(COMMA.tokenType);

    let thirdChild = parseContext.parseWrappedExpression();

    parseContext.eat(CLOSE_PAREN.tokenType);

    return new ANDOR([firstChild, secondChild, thirdChild]);
  };

  getType = () => {
    let firstChild = this.children[0];
    let secondChild = this.children[1];
    let thirdChild = this.children[2];

    let type = 0;

    // Adapted to use hasType:
    if (
      hasType(firstChild.type, [
        Types.BaseType,
        Types.DissatisfiableProperty,
        Types.UnitProperty,
      ])
    ) {
      type |=
        secondChild.type &
        thirdChild.type &
        (Types.BaseType | Types.KeyType | Types.VerifyType);
    }

    type |=
      firstChild.type &
      secondChild.type &
      thirdChild.type &
      Types.ZeroArgProperty;

    if (
      hasType(firstChild.type | (secondChild.type & thirdChild.type), [
        Types.ZeroArgProperty,
      ])
    ) {
      type |=
        (firstChild.type | (secondChild.type & thirdChild.type)) &
        Types.OneArgProperty;
    }

    type |= secondChild.type & thirdChild.type & Types.UnitProperty;

    if (
      hasType(firstChild.type, [Types.SafeProperty]) ||
      hasType(secondChild.type, [Types.ForcedProperty])
    ) {
      type |= thirdChild.type & Types.ForcedProperty;
    }

    type |= thirdChild.type & Types.DissatisfiableProperty;

    if (
      hasType(firstChild.type, [Types.SafeProperty]) ||
      hasType(secondChild.type, [Types.ForcedProperty])
    ) {
      type |= thirdChild.type & Types.ExpressionProperty;
    }

    if (
      hasType(firstChild.type, [Types.ExpressionProperty]) &&
      hasType(firstChild.type | secondChild.type | thirdChild.type, [
        Types.SafeProperty,
      ])
    ) {
      type |=
        firstChild.type &
        secondChild.type &
        thirdChild.type &
        Types.NonmalleableProperty;
    }

    type |=
      thirdChild.type &
      (firstChild.type | secondChild.type) &
      Types.SafeProperty;

    type |= Types.ExpensiveVerify;

    type |=
      (firstChild.type | secondChild.type | thirdChild.type) &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock);

    if (
      hasType(firstChild.type & secondChild.type & thirdChild.type, [
        Types.NoCombinationHeightTimeLocks,
      ]) &&
      !(
        (hasType(firstChild.type, [Types.ContainsRelativeTimeTimelock]) &&
          hasType(secondChild.type, [Types.ContainsRelativeHeightTimelock])) ||
        (hasType(firstChild.type, [Types.ContainsRelativeHeightTimelock]) &&
          hasType(secondChild.type, [Types.ContainsRelativeTimeTimelock])) ||
        (hasType(firstChild.type, [Types.ContainsTimeTimelock]) &&
          hasType(secondChild.type, [Types.ContainsHeightTimelock])) ||
        (hasType(firstChild.type, [Types.ContainsHeightTimelock]) &&
          hasType(secondChild.type, [Types.ContainsTimeTimelock]))
      )
    ) {
      type |= Types.NoCombinationHeightTimeLocks;
    }

    return type;
  };

  getSize = () => {
    return this.children.reduce((acc, child) => acc + child.getSize(), 3);
  };

  toScript = () => {
    return (
      `${this.children[0].toScript()} OP_NOTIF` +
      `\n${indent(this.children[2].toScript())}\n` +
      `OP_ELSE` +
      `\n${indent(this.children[1].toScript())}\n` +
      `OP_ENDIF\n`
    );
  };
}

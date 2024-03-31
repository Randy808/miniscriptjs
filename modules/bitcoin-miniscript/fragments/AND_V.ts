import { COMMA, CLOSE_PAREN } from "../../../universal-tokens";
import { lexKeyword } from "../../../lex-utils";
import { TypeDescriptions, Types } from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  LexState,
  Token,
} from "../../../types";
import { ParseContext } from "../../../parser";

export class AND_V extends MiniscriptFragmentStatic {
  static tokenType = "AND_V";
  children: MiniscriptFragment[];

  constructor(children: MiniscriptFragment[]) {
    super();
    this.children = children;
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "and_v(", state)) {
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

    return new AND_V([firstChild, secondChild]);
  };

  getType = () => {
    let firstChildType = this.children[0].getType();
    let secondChildType = this.children[1].getType();
    let type = 0;

    // (y & "KVB"_mst).If(x << "V"_mst) |
    if (!(firstChildType & Types.VerifyType)) {
      let errorMessage = `${AND_V.tokenType} could not be constructed because it's first argument was not of type VERIFY.\n`;
      errorMessage += `Please make sure the first argument is an expression that ${TypeDescriptions.VerifyType}`;
      throw new Error(errorMessage);
    }

    type |=
      secondChildType & (Types.KeyType | Types.BaseType | Types.VerifyType);

    // (x & "n"_mst) | (y & "n"_mst).If(x << "z"_mst) |
    type |= firstChildType & Types.NonzeroArgProperty;

    if (firstChildType & Types.ZeroArgProperty) {
      type |= secondChildType & Types.NonzeroArgProperty;
    }

    // ((x | y) & "o"_mst).If((x | y) << "z"_mst) |
    if ((firstChildType | secondChildType) & Types.ZeroArgProperty) {
      type |= (firstChildType | secondChildType) & Types.OneArgProperty;
    }

    // (x & y & "dmz"_mst) |
    type |=
      firstChildType &
      secondChildType &
      (Types.DissatisfiableProperty |
        Types.NonmalleableProperty |
        Types.ZeroArgProperty);

    // ((x | y) & "s"_mst) |
    type |= (firstChildType | secondChildType) & Types.SafeProperty;

    // "f"_mst.If((y << "f"_mst) || (x << "s"_mst)) |
    if (
      secondChildType & Types.ForcedProperty ||
      firstChildType & Types.SafeProperty
    ) {
      type |= Types.ForcedProperty;
    }

    // (y & "ux"_mst) |
    type |= secondChildType & (Types.UnitProperty | Types.ExpensiveVerify);

    // ((x | y) & "ghij"_mst) |
    type |=
      (firstChildType | secondChildType) &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock);

    // "k"_mst.If(((x & y) << "k"_mst) &&
    if (
      firstChildType & secondChildType & Types.NoCombinationHeightTimeLocks &&
      !(
        (firstChildType & Types.ContainsRelativeTimeTimelock &&
          secondChildType & Types.ContainsRelativeHeightTimelock) ||
        (firstChildType & Types.ContainsRelativeHeightTimelock &&
          secondChildType & Types.ContainsRelativeTimeTimelock) ||
        (firstChildType & Types.ContainsTimeTimelock &&
          secondChildType & Types.ContainsHeightTimelock) ||
        (firstChildType & Types.ContainsHeightTimelock &&
          secondChildType & Types.ContainsTimeTimelock)
      )
    ) {
      type |= Types.NoCombinationHeightTimeLocks;
    }
    return type;
  };

  getSize = () => {
    return this.children.reduce((acc, child) => acc + child.getSize(), 0);
  };

  toScript = () => {
    return `${this.children[0]?.toScript?.()} ${this.children[1]?.toScript?.()}`;
  };
}

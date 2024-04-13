import { lexKeyword } from "../../../lex/lex-utils";
import {
  sanityCheck,
  Types,
  TypeDescriptions,
} from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  LexState,
  Token,
  MiniscriptWrapper,
} from "../../../types";

export class WRAP_V
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment, MiniscriptWrapper
{
  static tokenType = "WRAP_V";
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
    if (lexKeyword(s, "v", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parseWrapper = (parseContext: any) => {
    parseContext.eat(this.tokenType);

    let child = parseContext.parseWrappedExpression();
    return new WRAP_V([child]);
  };

  getSize = () => {
    let firstChild = this.children[0];
    let scriptSize = firstChild.getSize();

    if (firstChild.getType() & Types.ExpensiveVerify) {
      scriptSize += 1;
    }

    return scriptSize;
  };

  getType = () => {
    let type = 0;
    let firstChildType = this.children[0].getType();

    // "V"_mst.If(x << "B"_mst) |
    if (!(firstChildType & Types.BaseType)) {
      let errorMessage = `${WRAP_V.tokenType} could not be constructed because it's first argument was not of type BASE.\n`;
      errorMessage += `Please make sure the first argument is an expression that ${TypeDescriptions.BaseType}`;
      throw new Error(errorMessage);
    }

    type |= Types.VerifyType;

    // (x & "ghijk"_mst) |
    type |=
      firstChildType &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock |
        Types.NoCombinationHeightTimeLocks);

    // (x & "zonms"_mst) |
    type |=
      firstChildType &
      (Types.ZeroArgProperty |
        Types.OneArgProperty |
        Types.NonzeroArgProperty |
        Types.NonmalleableProperty |
        Types.SafeProperty);

    // "fx"_mst; // f, x
    type |= Types.ForcedProperty | Types.ExpensiveVerify;
    return type;
  };

  toScript = () => {
    let firstChild = this.children[0];

    if (firstChild.getType() & Types.ExpensiveVerify) {
      return `${firstChild.toScript()} OP_VERIFY`;
    }

    return firstChild.toScript(true);
  };
}

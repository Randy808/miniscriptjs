import { lexKeyword } from "../../../lex/lex-utils";
import {
  sanityCheck,
  TypeDescriptions,
  Types,
} from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  MiniscriptWrapper,
  LexState,
  Token,
} from "../../../types";

export class WRAP_S
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment, MiniscriptWrapper
{
  static tokenType = "WRAP_S";
  children: any[];
  type: number;

  constructor(children: any[]) {
    super();
    this.children = children;
    this.type = this.getType();
    sanityCheck(this.type);
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "s", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parseWrapper = (parseContext: any) => {
    parseContext.eat(this.tokenType);

    let child = parseContext.parseWrappedExpression();
    return new WRAP_S([child]);
  };

  getSize = () => {
    let firstChild = this.children[0];
    return firstChild.getSize() + 1;
  };

  getType = () => {
    let type = 0;
    let firstChild = this.children[0];

    // "W"_mst.If(x << "Bo"_mst) |
    if (
      (firstChild.getType() & (Types.BaseType | Types.OneArgProperty)) ===
      (Types.BaseType | Types.OneArgProperty)
    ) {
      type |= Types.WrappedType;
    } else {
      let errorMessage = `${WRAP_S.tokenType} could not be constructed because it's first argument was not of type BASE.\n`;
      errorMessage += `Please make sure the first argument is an expression that takes one argument and ${TypeDescriptions.BaseType}`;
    }

    // (x & "ghijk"_mst) |
    type |=
      firstChild.getType() &
      (Types.ContainsRelativeTimeTimelock |
        Types.ContainsRelativeHeightTimelock |
        Types.ContainsTimeTimelock |
        Types.ContainsHeightTimelock |
        Types.NoCombinationHeightTimeLocks);

    // (x & "udfemsx"_mst);
    type |=
      firstChild.getType() &
      (Types.UnitProperty |
        Types.DissatisfiableProperty |
        Types.ForcedProperty |
        Types.ExpressionProperty |
        Types.NonmalleableProperty |
        Types.SafeProperty |
        Types.ExpensiveVerify);

    return type;
  };

  //TODO: Revisit this logic
  static fromScript = (scriptParseContext: any, s: any = undefined) => {
    let { reversedScript } = scriptParseContext;
    if (!s) {
      return;
    }

    try {
      //Try to wrap element in OP_SWAP
      let wrap_s = new WRAP_S([s]);
      reversedScript.shift();
      return wrap_s;
    } catch (e) {
      //Just return the element if it fails
      return s;
    }
  };

  toScript = () => {
    let firstChild = this.children[0];
    return `OP_SWAP ${firstChild.toScript()}`;
  };
}

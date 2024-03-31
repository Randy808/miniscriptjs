import { lexKeyword } from "../../../lex-utils";
import { Types } from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptWrapper,
  LexState,
  Token,
  MiniscriptFragmentStatic,
} from "../../../types";
import { PK_K } from "./PK_K";

export class WRAP_C
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment, MiniscriptWrapper
{
  static tokenType = "WRAP_C";
  children: any[];
  wrapper: boolean;

  constructor(children: any[]) {
    super();
    this.children = children;
    this.wrapper = false;
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "pk", state)) {
      return {
        tokenType: WRAP_C.tokenType,
        position,
        skipWrapper: true,
      };
    }

    if (lexKeyword(s, "c", state)) {
      return {
        tokenType: WRAP_C.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext: any) => {
    parseContext.eat(this.tokenType);

    try {
      parseContext.tokens.unshift({
        tokenType: PK_K.tokenType,
      });

      let child = PK_K.parse(parseContext);

      return new WRAP_C([child]);
    } catch (e: any) {
      throw new Error(`Error parsing PK:\n${e.stack}`);
    }
  };

  static parseWrapper = (parseContext: any): MiniscriptFragment => {
    parseContext.eat(this.tokenType);
    let child = parseContext.parseWrappedExpression();
    return new WRAP_C([child]);
  };

  getSize = () => {
    return 1 + (this.children[0] as any).getSize();
  };

  getType = () => {
    let firstChildType = this.children[0].getType();
    return (
      (firstChildType & Types.KeyType ? Types.BaseType : 0) |
      (firstChildType &
        (Types.ContainsRelativeTimeTimelock |
          Types.ContainsRelativeHeightTimelock |
          Types.ContainsTimeTimelock |
          Types.ContainsHeightTimelock |
          Types.NoCombinationHeightTimeLocks |
          Types.OneArgProperty |
          Types.NonzeroArgProperty |
          Types.DissatisfiableProperty |
          Types.ForcedProperty |
          Types.ExpressionProperty |
          Types.NonmalleableProperty)) |
      Types.UnitProperty |
      Types.SafeProperty
    );
  };

  toScript = (verify: boolean = false) => {
    return `${(this.children[0] as any).toScript()} CHECKSIG${
      verify ? "VERIFY" : ""
    }`;
  };
}

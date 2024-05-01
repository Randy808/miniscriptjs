import { lexKeyword } from "../../../lex/lex-utils";
import { sanityCheck, Types } from "../../../miniscript-types";
import {
  MiniscriptFragment,
  MiniscriptWrapper,
  LexState,
  Token,
  MiniscriptFragmentStatic,
} from "../../../types";
import { PK_K } from "./PK_K";

//TODO: Break out PK into separate class
export class WRAP_C
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment, MiniscriptWrapper
{
  static tokenType = "WRAP_C";
  children: any[];
  wrapper: boolean;
  type: number;

  constructor(children: any[]) {
    super();
    this.children = children;
    this.wrapper = false;
    this.type = this.getType();
    sanityCheck(this.type);
  }

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "c", state)) {
      return {
        tokenType: WRAP_C.tokenType,
        position,
      };
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
    return `${(this.children[0] as any).toScript()} OP_CHECKSIG${
      verify ? "VERIFY" : ""
    }`;
  };
}

import { COMMA, CLOSE_PAREN, NUMBER } from "../../../lex/universal-tokens";
import { lexKeyword } from "../../../lex/lex-utils";
import { sanityCheck, Types } from "../../../miniscript-types";
import {
  LexState,
  MiniscriptFragment,
  MiniscriptFragmentStatic,
  Token,
} from "../../../types";
import { calculateByteLenForValue } from "../../../utils";
import { MiniscriptParseContext } from "../../../parse/parser";

export class THRESH
  extends MiniscriptFragmentStatic
  implements MiniscriptFragment
{
  static tokenType = "THRESH";
  children: MiniscriptFragment[];
  k: number;
  type: number;
  primaryArray: any[] = [];
  secondaryArray: any[] = [];

  constructor(children: MiniscriptFragment[], k: number) {
    super();
    this.children = children;
    this.k = k;
    this.type = this.getType();
    sanityCheck(this.type);
  }

  getType = () => {
    //k, n_subs, and sub_types
    let k = this.k;
    let n_subs = this.children.length;
    let sub_types = this.children.map((c) => c.getType());

    let all_e = true;
    let all_m = true;
    let args = 0;
    let num_s = 0;
    let accumulatingTimelocks = Types.NoCombinationHeightTimeLocks; // Representing "k"_mst

    let hasType = (typeToCheck: number, type: number) => {
      return (typeToCheck & type) == type;
    };

    for (let i = 0; i < sub_types.length; ++i) {
      let childType = sub_types[i];

      // Require Bdu, Wdu, Wdu, ...
      if (i == 0) {
        if (!(childType & Types.BaseType)) {
          throw new Error(
            `${this} could not be constructed: argument ${
              i + 1
            } must take an element from the top of the stack and put an element on the stack`
          );
        }
      } else {
        if (!(childType & Types.WrappedType)) {
          throw new Error(
            `${this} could not be constructed: argument ${
              i + 1
            } must take an element from one or more element(s) below the top of the stack and put an element on the stack`
          );
        }
      }

      if (!(childType & Types.DissatisfiableProperty)) {
        throw new Error(
          `${this} could not be constructed: argument ${
            i + 1
          } must be dissatisfiable`
        );
      }

      if (!(childType & Types.UnitProperty)) {
        throw new Error(
          `${THRESH.tokenType} could not be constructed: argument ${
            i + 1
          } must have the unit property`
        );
      }

      if (!(childType & Types.ExpressionProperty)) all_e = false;
      if (!(childType & Types.NonmalleableProperty)) all_m = false;
      if (childType & Types.SafeProperty) num_s += 1;
      args +=
        childType & Types.ZeroArgProperty
          ? 0
          : childType & Types.OneArgProperty
          ? 1
          : 2;

      accumulatingTimelocks =
        (accumulatingTimelocks | childType) &
        (Types.ContainsRelativeTimeTimelock |
          Types.ContainsRelativeHeightTimelock |
          Types.ContainsTimeTimelock |
          Types.ContainsHeightTimelock);

      let retainedOrHasNoCombinationTimelocks =
        (accumulatingTimelocks &
          childType &
          Types.NoCombinationHeightTimeLocks) ==
        Types.NoCombinationHeightTimeLocks;

      if (retainedOrHasNoCombinationTimelocks) {
        if (k > 1) {
          //Check for relative combination timelocks
          let parentHasRelativeTimeAndChildHasRelativeHeight =
            hasType(
              accumulatingTimelocks,
              Types.ContainsRelativeTimeTimelock
            ) && hasType(childType, Types.ContainsRelativeHeightTimelock);

          let parentHasRelativeHeightAndChildHasRelativeTime =
            hasType(
              accumulatingTimelocks,
              Types.ContainsRelativeHeightTimelock
            ) && hasType(childType, Types.ContainsRelativeTimeTimelock);

          let conflictingRelativeTimeLocks =
            parentHasRelativeTimeAndChildHasRelativeHeight ||
            parentHasRelativeHeightAndChildHasRelativeTime;

          //Check for absolute combination timelocks

          let parentHasTimeAndChildHasHeight =
            hasType(accumulatingTimelocks, Types.ContainsTimeTimelock) &&
            hasType(childType, Types.ContainsHeightTimelock);

          let parentHasHeightAndChildHasTime =
            hasType(accumulatingTimelocks, Types.ContainsHeightTimelock) &&
            hasType(childType, Types.ContainsTimeTimelock);

          let conflictingAbsoluteTimelocks =
            parentHasTimeAndChildHasHeight && parentHasHeightAndChildHasTime;

          if (!(conflictingRelativeTimeLocks || conflictingAbsoluteTimelocks)) {
            accumulatingTimelocks |= Types.NoCombinationHeightTimeLocks;
          }
        } else {
          accumulatingTimelocks |= Types.NoCombinationHeightTimeLocks;
        }
      }
    }

    // Final return logic
    return (
      Types.BaseType |
      Types.DissatisfiableProperty |
      Types.UnitProperty |
      (args === 0 ? Types.ZeroArgProperty : 0) |
      (args === 1 ? Types.OneArgProperty : 0) |
      (all_e && num_s === n_subs ? Types.ExpressionProperty : 0) |
      (all_e && all_m && num_s >= n_subs - k ? Types.NonmalleableProperty : 0) |
      (num_s >= n_subs - k + 1 ? Types.SafeProperty : 0) |
      accumulatingTimelocks
    );
  };

  static lex = (s: string, state: LexState): Token | undefined => {
    let position = state.cursor;
    if (lexKeyword(s, "thresh(", state)) {
      return {
        tokenType: this.tokenType,
        position,
      };
    }
  };

  static parse = (parseContext:MiniscriptParseContext) => {
    parseContext.eat(this.tokenType);
    let k = parseContext.eat(NUMBER.tokenType)?.value;

    let children: any[] = [];
    while (parseContext.peekToken().tokenType != CLOSE_PAREN.tokenType) {
      parseContext.eat(COMMA.tokenType);
      children.push(parseContext.parseWrappedExpression());
    }
    parseContext.eat(CLOSE_PAREN.tokenType);

    return new THRESH(children, k);
  };

  getSize = () => {
    return (
      this.children.length +
      this.children.reduce((acc, child) => acc + child.getSize(), 0) +
      calculateByteLenForValue(this.k)
    );
  };

  toScript = (verify: boolean = false) => {
    let script = this.children[0].toScript();
    for (let i = 1; i < this.children.length; i++) {
      script = script + " " + `${this.children[i].toScript()} OP_ADD`;
    }
    return (
      script + " " + this.k + " " + (verify ? `OP_EQUALVERIFY` : `OP_EQUAL`)
    );
  };

  static fromScript = (scriptParseContext: any) => {
    let { reversedScript } = scriptParseContext;
    if (reversedScript[0] != "OP_EQUAL") {
      return;
    }
    let threshold = parseInt(reversedScript[1]);
    if (isNaN(threshold)) {
      return;
    }

    reversedScript.shift();
    reversedScript.shift();

    let i = threshold;
    let x;
    let children: any[] = [];
    do {
      if (i + 1 < threshold) {
        let OP_ADD = reversedScript.shift();
        if (OP_ADD != "OP_ADD") {
          throw new Error();
        }
      }

      x = scriptParseContext.parser.parseScript(reversedScript);
      if(x) {
        children.push(x);
      }
    } while (x);

    return new THRESH(children, threshold);
  };
}

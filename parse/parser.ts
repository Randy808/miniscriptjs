import { COLON } from "../lex/universal-tokens";
import {
  MiniscriptFragmentClass,
  MiniscriptWrapperClass,
  Token,
} from "../types";
import { matchToken } from "./parse-utils";

export class MiniscriptParser {
  expressions: MiniscriptFragmentClass[];
  wrappers: MiniscriptWrapperClass[];
  parseContext: MiniscriptParseContext;

  constructor(
    expressions: MiniscriptFragmentClass[],
    wrappers: MiniscriptWrapperClass[]
  ) {
    this.expressions = expressions;
    this.wrappers = wrappers;
    this.parseContext = new MiniscriptParseContext(
      this.parseExpression,
      this.parseWrappedExpression
    );
  }

  parse = (tokens: Token[]) => {
    this.parseContext.reset(tokens);
    return this.parseContext.parseWrappedExpression();
  };

  parseScript = (reversedScript: string[]): string => {
    let fragments = [...this.wrappers, ...this.expressions];
    while (reversedScript.length) {
      for (let c of fragments) {
        if ((c as any).fromScript) {
          let scriptParseContext = {
            parser: this,
            reversedScript: reversedScript,
          };
          let n = (c as any).fromScript(scriptParseContext);
          if (n) {
            return n;
          }
        }
      }
      throw new Error(
        `Failed to parse script ${reversedScript.reverse().join(" ")}`
      );
    }

    throw new Error(`Please enter a valid script`);
  };

  private parseWrappedExpression = (parseContext: MiniscriptParseContext) => {
    for (let wrapperClass of this.wrappers) {
      if (
        !parseContext.tokens[0].skipWrapper &&
        matchToken(parseContext.tokens, wrapperClass.tokenType)
      ) {
        parseContext.parsingWrapper = true;
        return wrapperClass.parseWrapper(parseContext);
      }
    }

    if (parseContext.parsingWrapper) {
      if (matchToken(parseContext.tokens, COLON.tokenType)) {
        parseContext.eat(COLON.tokenType);
        parseContext.parsingWrapper = false;
      } else {
        throw new Error(
          "Began parsing wrappers but never found the colon end delimiter"
        );
      }
    }
    return parseContext.parseExpression(parseContext);
  };

  private parseExpression = (parseContext: MiniscriptParseContext) => {
    for (let expression of this.expressions) {
      if (matchToken(parseContext.tokens, expression.tokenType)) {
        return expression.parse(parseContext);
      }
    }

    throw new Error(`Expression not found for token with value ${JSON.stringify(parseContext.peekToken().value)}`);
  };
}

export class MiniscriptParseContext {
  parseExpression: any;
  parseWrappedExpression: any;
  parsingWrapper: boolean;
  tokens: any;

  constructor(parseExpression: any, parseWrappedExpression: any) {
    this.tokens = [];
    this.parseExpression = () => parseExpression(this);
    this.parseWrappedExpression = () => parseWrappedExpression(this);
    this.parsingWrapper = false;
  }

  reset = (tokens: any[]) => {
    this.tokens = tokens;
  };

  eat = (tokenType: string) => {
    if (this.tokens.length && this.tokens[0].tokenType == tokenType) {
      return this.tokens.shift();
    }

    throw new Error(
      `Unable to eat token. Expected ${tokenType}, found ${this.tokens[0].tokenType}`
    );
  };

  peekToken = () => {
    return this.tokens[0];
  };
}

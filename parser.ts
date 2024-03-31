import { COLON } from "./universal-tokens";
import { matchToken } from "./parse-utils";

export class Parser {
  expressions: any[];
  wrappers: any;
  parseContext: any;

  constructor(expressions: any[], wrappers: any[]) {
    this.expressions = expressions;
    this.wrappers = wrappers;
  }

  parse = (tokens: any[]) => {
    this.parseContext = new ParseContext(
      tokens,
      this.parseExpression,
      this.parseWrappedExpression
    );

    return this.parseContext.parseWrappedExpression();
  };

  private parseWrappedExpression = (parseContext: any) => {
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

  private parseExpression = (parseContext: any) => {
    for (let expression of this.expressions) {
      if (matchToken(parseContext.tokens, expression.tokenType)) {
        return expression.parse(parseContext);
      }
    }

    throw new Error("Expression not found");
  };
}

export class ParseContext {
  parseExpression: any;
  parseWrappedExpression: any;
  tokens: any;

  constructor(tokens: any, parseExpression: any, parseWrappedExpression: any) {
    this.tokens = tokens;
    this.parseExpression = () => parseExpression(this);
    this.parseWrappedExpression = () => parseWrappedExpression(this);
  }

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

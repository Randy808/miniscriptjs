import { AFTER } from "../modules/bitcoin-miniscript/fragments/AFTER";
import { Parser } from "../parser";
import BitcoinMiniscript from "../modules/bitcoin-miniscript";

test("AFTER can decode Script", () => {
  let script = "4 OP_CHECKLOCKTIMEVERIFY";
  let parser = new Parser(
    BitcoinMiniscript.expressions,
    BitcoinMiniscript.wrappers
  );
  let parseContext = {
    reversedScript: script.split(" ").reverse(),
    parser,
  };

  let fragment = AFTER.fromScript(parseContext);
  expect(fragment).not.toBeNull();
  expect(fragment?.locktime).toBe(4);
  expect(fragment?.toScript()).toEqual(script);
});

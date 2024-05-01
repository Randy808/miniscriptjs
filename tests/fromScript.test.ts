import { AFTER } from "../miniscript-modules/bitcoin-miniscript/fragments/AFTER";
import { MiniscriptParser } from "../parse/parser";
import BitcoinMiniscript from "../miniscript-modules/bitcoin-miniscript";
import { HASH160 } from "../miniscript-modules/bitcoin-miniscript/fragments/HASH160";
import { THRESH } from "../miniscript-modules/bitcoin-miniscript/fragments/THRESH";

test("AFTER can decode Script", () => {
  let script = "4 OP_CHECKLOCKTIMEVERIFY";
  let parser = new MiniscriptParser(
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


test("HASH160 can decode Script", () => {
  const hash = "xxxxxxx";
  let script = `OP_SIZE 32 OP_EQUALVERIFY OP_HASH160 ${hash} OP_EQUAL`;
  let parser = new MiniscriptParser(
    BitcoinMiniscript.expressions,
    BitcoinMiniscript.wrappers
  );

  let parseContext = {
    reversedScript: script.split(" ").reverse(),
    parser,
  };

  let fragment = HASH160.fromScript(parseContext);
  expect(fragment).not.toBeNull();
  expect(fragment?.hash).toBe(hash);
  expect(fragment?.toScript()).toEqual(script);
});

test("THRESH can decode Script", () => {
  const key1 = "a";
  const key2 = "b";
  let script = `${key1} OP_CHECKSIG OP_SWAP ${key2} OP_CHECKSIG OP_ADD 2 OP_EQUAL`;
  let parser = new MiniscriptParser(
    BitcoinMiniscript.expressions,
    BitcoinMiniscript.wrappers
  );

  let parseContext = {
    reversedScript: script.split(" ").reverse(),
    parser,
  };

  let fragment = THRESH.fromScript(parseContext);
  expect(fragment).not.toBeNull();
  expect(fragment?.toScript()).toEqual(script);
});

import Miniscript from "..";

let rootExpression = Miniscript.parse("s:sha256(abc)");
console.log(rootExpression.toScript());

// console.log(Miniscript.parseScript("7 OP_CHECKLOCKTIMEVERIFY 4 OP_CHECKLOCKTIMEVERIFY 2 OP_EQUAL"));


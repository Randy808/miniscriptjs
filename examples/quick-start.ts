import Miniscript from "..";

let rootExpression = Miniscript.parse("thresh(1,pk(0xA),s:pk(0xB))");
console.log(rootExpression.toScript());

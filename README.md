## Miniscript JS

MiniscriptJS is a library designed for ease of use and extensibility. It is a work in progress and should not be used outside experimentation purposes.

## Quick start

```
let rootExpression = Miniscript.parse("thresh(1,pk(0xA),s:pk(0xB))");
console.log(rootExpression.toScript());
```

###### Currently the library will accept any string as a key expression as long as it starts with a '0'

More examples can be found [here](/examples)

## About miniscript

Miniscript is a language designed by Pieter Wuille, Andrew Poelstra, and Sanket Kanjalkar. It enhances the simplicity, composability, and verifiability of Bitcoin script creation. The essence of Miniscript lies in its ability to facilitate semantic reasoning about script correctness, minimize script malleability, and promote composability.

One of Miniscript's core strengths is its bidirectional compatibility with Bitcoin script: every Miniscript expression can be directly compiled to a Bitcoin script, and vice versa, allowing for seamless interchangeability between the two.

## Policy Language

Miniscript also introduces a policy language that simplifies scripting by abstracting common patterns into more straightforward expressions. For instance, specific operations like 'and_v' and 'and_b' are consolidated into a single 'and' operation in the policy language, making scripts more accessible and less error-prone to write. It also adds a syntax for encoding probabilities into subexpressions for which it accordingly picks the best miniscript representation of. Currently, MiniscriptJS does not support the policy language, but future updates may include this feature.

## Contributing

We welcome contributions from the community! Whether you're interested in fixing bugs, adding new features, or improving documentation, your help is invaluable to making MiniscriptJS better for everyone.

## License

MiniscriptJS is licensed under MIT License. Feel free to use, modify, and distribute the code according to the license agreement.

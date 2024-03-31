//Converted from https://github.com/bitcoin/bitcoin/blob/e69796c79c0aa202087a13ba62d9fbcc1c8754d4/src/script/miniscript.h#L157 with the help of chatgpt
let Types = {
  BaseType: 1 << 0, // Corresponds to *p == 'B'
  VerifyType: 1 << 1, // Corresponds to *p == 'V'
  KeyType: 1 << 2, // Corresponds to *p == 'K'
  WrappedType: 1 << 3, // Corresponds to *p == 'W'
  ZeroArgProperty: 1 << 4, // Corresponds to *p == 'z'
  OneArgProperty: 1 << 5, // Corresponds to *p == 'o'
  NonzeroArgProperty: 1 << 6, // Corresponds to *p == 'n'
  DissatisfiableProperty: 1 << 7, // Corresponds to *p == 'd'
  UnitProperty: 1 << 8, // Corresponds to *p == 'u'
  ExpressionProperty: 1 << 9, // Corresponds to *p == 'e'
  ForcedProperty: 1 << 10, // Corresponds to *p == 'f'
  SafeProperty: 1 << 11, // Corresponds to *p == 's'
  NonmalleableProperty: 1 << 12, // Corresponds to *p == 'm'
  ExpensiveVerify: 1 << 13, // Corresponds to *p == 'x'
  ContainsRelativeTimeTimelock: 1 << 14, // Corresponds to *p == 'g'
  ContainsRelativeHeightTimelock: 1 << 15, // Corresponds to *p == 'h'
  ContainsTimeTimelock: 1 << 16, // Corresponds to *p == 'i'
  ContainsHeightTimelock: 1 << 17, // Corresponds to *p == 'j'
  NoCombinationHeightTimeLocks: 1 << 18, // Corresponds to *p == 'k'
};

let TypeDescriptions = {
  BaseType:
    "takes inputs from the top of the stack and pushes a nonzero value of up to 4 bytes on satisfaction, or an exact 0 on dissatisfaction.",
  VerifyType: "leaves nothing on the stack.",
};

function sanityCheck(type: number) {
  let num_types =
    (type & Types.KeyType ? 1 : 0) +
    (type & Types.VerifyType ? 1 : 0) +
    (type & Types.BaseType ? 1 : 0) +
    (type & Types.WrappedType ? 1 : 0);

  if (num_types === 0) {
    throw new Error(
      `Type must be one of Key, Verify, Base, or Wrapped type. Type value: ${type}`
    );
  }

  if (num_types !== 1) {
    throw new Error(
      "Key, Verify, Base, and Wrapped types conflict with each other"
    );
  }

  if (type & Types.ZeroArgProperty && type & Types.OneArgProperty) {
    throw new Error("The ZeroArgProperty conflicts with the OneArgProperty");
  }

  if (type & Types.NonzeroArgProperty && type & Types.ZeroArgProperty) {
    throw new Error(
      "The NonzeroArgProperty conflicts with the ZeroArgProperty"
    );
  }

  if (type & Types.NonzeroArgProperty && type & Types.WrappedType) {
    throw new Error("The NonzeroArgProperty conflicts with the WrappedType");
  }

  if (type & Types.VerifyType && type & Types.DissatisfiableProperty) {
    throw new Error("The VerifyType conflicts with the DissatisfiableProperty");
  }

  if (type & Types.KeyType && !(type & Types.UnitProperty)) {
    throw new Error("The KeyType implies the UnitProperty");
  }

  if (type & Types.VerifyType && type & Types.UnitProperty) {
    throw new Error("The VerifyType conflicts with the UnitProperty");
  }

  if (type & Types.ExpressionProperty && type & Types.ForcedProperty) {
    throw new Error("The ExpressionProperty conflicts with the ForcedProperty");
  }

  if (
    type & Types.ExpressionProperty &&
    !(type & Types.DissatisfiableProperty)
  ) {
    throw new Error(
      "The ExpressionProperty implies the DissatisfiableProperty"
    );
  }

  if (type & Types.VerifyType && type & Types.ExpressionProperty) {
    throw new Error("The VerifyType conflicts with the ExpressionProperty");
  }

  if (type & Types.DissatisfiableProperty && type & Types.ForcedProperty) {
    throw new Error(
      "The DissatisfiableProperty conflicts with the ForcedProperty"
    );
  }

  if (type & Types.VerifyType && !(type & Types.ForcedProperty)) {
    throw new Error("The VerifyType implies the ForcedProperty");
  }

  if (type & Types.KeyType && !(type & Types.SafeProperty)) {
    throw new Error("The KeyType implies the SafeProperty");
  }

  if (type & Types.ZeroArgProperty && !(type & Types.NonmalleableProperty)) {
    throw new Error("The ZeroArgProperty implies the NonmalleableProperty");
  }

  return type;
}

export { Types, TypeDescriptions, sanityCheck };

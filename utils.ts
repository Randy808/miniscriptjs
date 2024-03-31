//Calculates the number of bytes needed to represent the value in script (including pushdata)
export function calculateByteLenForValue(value: number) {
  return (
    1 +
    (value > 16 ? 1 : 0) +
    (value > 0x7f ? 1 : 0) +
    (value > 0x7fff ? 1 : 0) +
    (value > 0x7fffff ? 1 : 0)
  );
}

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const bigrams = (value) => {
  const pairs = [];
  for (let i = 0; i < value.length - 1; i += 1) {
    pairs.push(value.slice(i, i + 2));
  }
  return pairs;
};

export const diceCoefficient = (a, b) => {
  const left = normalize(a);
  const right = normalize(b);

  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.length < 2 || right.length < 2) return 0;

  const leftPairs = bigrams(left);
  const rightPairs = bigrams(right);

  const rightMap = new Map();
  rightPairs.forEach((pair) => {
    rightMap.set(pair, (rightMap.get(pair) ?? 0) + 1);
  });

  let intersection = 0;
  leftPairs.forEach((pair) => {
    const count = rightMap.get(pair) ?? 0;
    if (count > 0) {
      intersection += 1;
      rightMap.set(pair, count - 1);
    }
  });

  return (2 * intersection) / (leftPairs.length + rightPairs.length);
};

export const normalizeTitle = normalize;

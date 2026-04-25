export type ProbabilityOption = {
  label: string;
  probability: number;
};

export type CalculatedOddsOption = {
  label: string;
  normalizedProbability: number;
  fairOdds: number;
  offeredOdds: number;
};

function roundTo(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

export function calculateRecommendedOdds(
  options: ProbabilityOption[],
  holdPercent: number,
): CalculatedOddsOption[] {
  const cleaned = options.map((option) => ({
    ...option,
    probability: Number(option.probability),
  }));

  const totalProbability = cleaned.reduce((sum, option) => sum + option.probability, 0);

  if (totalProbability <= 0) {
    return cleaned.map((option) => ({
      label: option.label,
      normalizedProbability: 0,
      fairOdds: 0,
      offeredOdds: 0,
    }));
  }

  const holdMultiplier = 1 + Math.max(0, holdPercent) / 100;

  return cleaned.map((option) => {
    const normalizedProbability = option.probability / totalProbability;
    const fairOdds = normalizedProbability > 0 ? 1 / normalizedProbability : 0;
    const offeredOdds =
      normalizedProbability > 0 ? 1 / (normalizedProbability * holdMultiplier) : 0;

    return {
      label: option.label,
      normalizedProbability: roundTo(normalizedProbability * 100, 2),
      fairOdds: roundTo(fairOdds),
      offeredOdds: roundTo(Math.max(1.01, offeredOdds)),
    };
  });
}

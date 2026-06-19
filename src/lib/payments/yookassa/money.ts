export function kopecksToRublesValue(kopecks: number): string {
  return (kopecks / 100).toFixed(2);
}

export function rublesValueToKopecks(value: string): number | null {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 100);
}

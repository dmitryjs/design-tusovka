const BIND_TO_NEXT_WORD = new Set([
  "а",
  "в",
  "во",
  "и",
  "к",
  "ко",
  "на",
  "о",
  "об",
  "обо",
  "с",
  "со",
  "у",
  "по",
  "от",
  "до",
  "из",
  "за",
  "при",
  "без",
  "над",
  "под",
  "про",
  "для",
  "но",
  "или",
  "ли",
  "ни",
  "не",
  "как",
]);

const BIND_TO_NEXT_PATTERN = `(^|[\\s(])(${[...BIND_TO_NEXT_WORD].join("|")})\\s+(?=[A-Za-zА-Яа-яЁё])`;

export function preventHangingPrepositions(text: string): string {
  return text.replace(new RegExp(BIND_TO_NEXT_PATTERN, "giu"), (_match, prefix, word) => {
    return `${prefix}${word}\u00A0`;
  });
}

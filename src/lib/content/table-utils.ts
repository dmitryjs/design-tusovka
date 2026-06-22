export const DEFAULT_TABLE_SIZE = 3;
export const MIN_TABLE_ROWS = 1;
export const MIN_TABLE_COLS = 1;

export function createEmptyRow(colCount: number): string[] {
  return Array(Math.max(MIN_TABLE_COLS, colCount)).fill("");
}

export function getTableColumnCount(rows: string[][]): number {
  if (rows.length === 0) {
    return DEFAULT_TABLE_SIZE;
  }

  return Math.max(MIN_TABLE_COLS, ...rows.map((row) => row.length));
}

/** Ensures a rectangular grid without trimming user-added rows/columns. */
export function normalizeTableRows(rows: string[][]): string[][] {
  if (rows.length === 0) {
    return Array.from({ length: DEFAULT_TABLE_SIZE }, () =>
      createEmptyRow(DEFAULT_TABLE_SIZE),
    );
  }

  const colCount = getTableColumnCount(rows);

  return rows.map((row) => {
    const cells = [...row];
    while (cells.length < colCount) {
      cells.push("");
    }
    return cells.slice(0, colCount);
  });
}

export function addTableRow(rows: string[][]): string[][] {
  const normalized = normalizeTableRows(rows);
  return [...normalized, createEmptyRow(getTableColumnCount(normalized))];
}

export function addTableColumn(rows: string[][]): string[][] {
  return normalizeTableRows(rows).map((row) => [...row, ""]);
}

export function insertTableColumnAt(rows: string[][], index: number): string[][] {
  const safeIndex = Math.max(0, Math.min(index, getTableColumnCount(rows)));
  return normalizeTableRows(rows).map((row) => {
    const next = [...row];
    next.splice(safeIndex, 0, "");
    return next;
  });
}

export function duplicateTableColumnAt(rows: string[][], index: number): string[][] {
  return normalizeTableRows(rows).map((row) => {
    const next = [...row];
    next.splice(index + 1, 0, row[index] ?? "");
    return next;
  });
}

export function clearTableColumnAt(rows: string[][], index: number): string[][] {
  return normalizeTableRows(rows).map((row) =>
    row.map((cell, colIndex) => (colIndex === index ? "" : cell)),
  );
}

export function deleteTableColumnAt(rows: string[][], index: number): string[][] {
  const normalized = normalizeTableRows(rows);
  if (getTableColumnCount(normalized) <= MIN_TABLE_COLS) {
    return normalized;
  }

  return normalized.map((row) => row.filter((_, colIndex) => colIndex !== index));
}

export function deleteTableRowAt(rows: string[][], index: number): string[][] {
  const normalized = normalizeTableRows(rows);
  if (normalized.length <= MIN_TABLE_ROWS) {
    return normalized;
  }

  return normalized.filter((_, rowIndex) => rowIndex !== index);
}

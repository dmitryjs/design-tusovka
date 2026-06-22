"use client";

import { useCallback, useRef, useState } from "react";

import type { MaterialBlock } from "@/lib/content/material-blocks";
import {
  addTableColumn,
  addTableRow,
  clearTableColumnAt,
  deleteTableColumnAt,
  duplicateTableColumnAt,
  getTableColumnCount,
  insertTableColumnAt,
  MIN_TABLE_COLS,
  normalizeTableRows,
} from "@/lib/content/table-utils";
import { cn } from "@/lib/utils";

import { RichTextField } from "./rich-text-field";
import { TableAddZone } from "./table-add-zone";
import { TableColumnGrip, TableColumnMenu } from "./table-column-menu";

type TableBlockEditorProps = {
  block: Extract<MaterialBlock, { type: "table" }>;
  disabled?: boolean;
  onChange: (block: MaterialBlock) => void;
};

export function TableBlockEditor({ block, disabled, onChange }: TableBlockEditorProps) {
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const columnGripRef = useRef<HTMLButtonElement>(null);
  const rows = normalizeTableRows(block.data.rows);
  const columnCount = getTableColumnCount(rows);

  const commitRows = useCallback(
    (nextRows: string[][]) => {
      onChange({
        ...block,
        data: {
          headers: block.data.headers,
          rows: nextRows,
        },
      });
    },
    [block, onChange],
  );

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    commitRows(
      rows.map((row, rowIdx) =>
        row.map((cell, colIdx) => (rowIdx === rowIndex && colIdx === colIndex ? value : cell)),
      ),
    );
  };

  const activeColumn = activeCell?.col ?? null;

  return (
    <div className="max-w-full">
      <div className="flex items-stretch">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-sm">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const isActive =
                      activeCell?.row === rowIndex && activeCell?.col === colIndex;

                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          "relative min-w-[80px] border border-neutral-200 p-0 align-top",
                          isActive && "ring-2 ring-inset ring-primary",
                        )}
                      >
                        {isActive ? (
                          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
                            <TableColumnGrip
                              ref={columnGripRef}
                              onClick={() => setColumnMenuOpen((open) => !open)}
                              className="pointer-events-auto -translate-y-1/2"
                            />
                          </div>
                        ) : null}
                        <RichTextField
                          value={cell}
                          onChange={(value) => updateCell(rowIndex, colIndex, value)}
                          disabled={disabled}
                          className="min-h-[36px] px-2 py-2 text-sm leading-6"
                          onFocus={() => {
                            setActiveCell({ row: rowIndex, col: colIndex });
                            setColumnMenuOpen(false);
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <TableAddZone
            orientation="row"
            disabled={disabled}
            title="Добавить строку"
            onAdd={() => commitRows(addTableRow(rows))}
          />
        </div>

        <TableAddZone
          orientation="column"
          disabled={disabled}
          title="Добавить колонку"
          onAdd={() => commitRows(addTableColumn(rows))}
        />
      </div>

      {activeColumn !== null ? (
        <TableColumnMenu
          open={columnMenuOpen}
          anchorRef={columnGripRef}
          columnIndex={activeColumn}
          canDelete={columnCount > MIN_TABLE_COLS}
          onClose={() => setColumnMenuOpen(false)}
          onInsertLeft={() => commitRows(insertTableColumnAt(rows, activeColumn))}
          onInsertRight={() => commitRows(insertTableColumnAt(rows, activeColumn + 1))}
          onDuplicate={() => commitRows(duplicateTableColumnAt(rows, activeColumn))}
          onClear={() => commitRows(clearTableColumnAt(rows, activeColumn))}
          onDelete={() => {
            commitRows(deleteTableColumnAt(rows, activeColumn));
            setActiveCell(null);
          }}
        />
      ) : null}
    </div>
  );
}

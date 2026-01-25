// app/(core)/components/theory/TheoryTable.tsx
import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { EditableProps } from "../types.ts";

interface TheoryTableProps extends EditableProps {
  columns: string[];
  data: Array<Record<string, unknown>>;
}

export const TheoryTable: React.FC<TheoryTableProps> = ({
  columns,
  data,
  isEditing,
  onContentUpdate,
  sectionIndex,
  blockIndex,
}) => {
  const isBlockEditable =
    isEditing &&
    onContentUpdate &&
    sectionIndex !== undefined &&
    blockIndex !== undefined;
  const suppressWarning = isBlockEditable;

  const updateTable = useCallback(
    (newColumns: string[], newData: Array<Record<string, unknown>>) => {
      if (!isBlockEditable) return;

      const newTableData = { columns: newColumns, data: newData };
      onContentUpdate(
        sectionIndex,
        blockIndex,
        "tableData",
        JSON.stringify(newTableData)
      );
    },
    [isBlockEditable, onContentUpdate, sectionIndex, blockIndex]
  );

  const handleHeaderBlur = (
    e: React.FocusEvent<HTMLElement>,
    colIndex: number,
    oldColName: string
  ) => {
    if (!isBlockEditable) return;

    const newColName = e.target.innerText || `Header ${colIndex + 1}`;
    if (newColName === oldColName) return;

    const newColumns = [...columns];
    newColumns[colIndex] = newColName;

    const newData = data.map((row) => {
      const newRow = { ...row };
      newRow[newColName] = newRow[oldColName];
      delete newRow[oldColName];
      return newRow;
    });

    updateTable(newColumns, newData);
  };

  const handleCellBlur = (
    e: React.FocusEvent<HTMLElement>,
    rowIndex: number,
    colName: string
  ) => {
    if (!isBlockEditable) return;

    const newContent = e.target.innerText;
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [colName]: newContent };

    updateTable(columns, newData);
  };

  const handleAddRow = () => {
    if (!isBlockEditable) return;

    const newRow: Record<string, unknown> = {};
    columns.forEach((col) => (newRow[col] = "New Data"));

    updateTable(columns, [...data, newRow]);
  };

  const handleAddColumn = () => {
    if (!isBlockEditable) return;

    const newColName = `New Column ${columns.length + 1}`;
    const newColumns = [...columns, newColName];

    const newData = data.map((row) => ({
      ...row,
      [newColName]: "New Data",
    }));

    updateTable(newColumns, newData);
  };

  return (
    <div className="theory-table-wrap">
      {isBlockEditable && (
        <div className="table-controls">
          <button
            type="button"
            onClick={handleAddRow}
            className="ph-btn ph-btn--small table-add-btn"
          >
            <FontAwesomeIcon icon={faPlus} /> Add Row
          </button>
          <button
            type="button"
            onClick={handleAddColumn}
            className="ph-btn ph-btn--small table-add-btn"
          >
            <FontAwesomeIcon icon={faPlus} /> Add Column
          </button>
        </div>
      )}
      <table className="theory-table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                contentEditable={isBlockEditable}
                suppressContentEditableWarning={suppressWarning}
                onBlur={(e) => handleHeaderBlur(e, i, c)}
                className={isBlockEditable ? "editable-block" : ""}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, r) => (
            <tr key={r}>
              {columns.map((c, i) => (
                <td
                  key={i}
                  contentEditable={isBlockEditable}
                  suppressContentEditableWarning={suppressWarning}
                  onBlur={(e) => handleCellBlur(e, r, c)}
                  className={isBlockEditable ? "editable-block" : ""}
                >
                  {row[c] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

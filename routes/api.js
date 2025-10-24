"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route("/api/check").post((req, res) => {
    const { puzzle, coordinate, value } = req.body;

    // 1️⃣ Kiểm tra thiếu field
    if (!puzzle || !coordinate || !value) {
      return res.json({ error: "Required field(s) missing" });
    }

    // 2️⃣ Kiểm tra tọa độ hợp lệ
    const row = coordinate[0];
    const column = coordinate[1];
    if (
      coordinate.length !== 2 ||
      !/^[A-I]$/i.test(row) ||
      !/^[1-9]$/.test(column)
    ) {
      return res.json({ error: "Invalid coordinate" });
    }

    // 3️⃣ Kiểm tra value hợp lệ (chỉ 1 ký tự 1–9)
    if (!/^[1-9]$/.test(value)) {
      return res.json({ error: "Invalid value" });
    }

    // 4️⃣ Kiểm tra puzzle hợp lệ
    if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }

    if (/[^0-9.]/.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    }

    // 5️⃣ Nếu giá trị đã có sẵn trong puzzle và trùng với value → valid: true
    const rowIndex = row.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
    const colIndex = parseInt(column) - 1;
    const puzzleValue = puzzle[rowIndex * 9 + colIndex];
    if (puzzleValue === value) {
      return res.json({ valid: true });
    }

    // 6️⃣ Kiểm tra xung đột hàng, cột, vùng
    const validRow = solver.checkRowPlacement(puzzle, row, column, value);
    const validCol = solver.checkColPlacement(puzzle, row, column, value);
    const validReg = solver.checkRegionPlacement(puzzle, row, column, value);

    const conflicts = [];
    if (validRow && validCol && validReg) {
      return res.json({ valid: true });
    } else {
      if (!validRow) conflicts.push("row");
      if (!validCol) conflicts.push("column");
      if (!validReg) conflicts.push("region");
      return res.json({ valid: false, conflict: conflicts });
    }
  });

  // ======== /api/solve ========
  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;

    if (!puzzle) {
      return res.json({ error: "Required field missing" });
    }

    if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }

    if (/[^0-9.]/.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    }

    const solvedString = solver.solve(puzzle);
    if (!solvedString) {
      return res.json({ error: "Puzzle cannot be solved" });
    }

    res.json({ solution: solvedString });
  });
};

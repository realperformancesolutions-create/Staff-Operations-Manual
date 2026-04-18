// PDF Download utility for Cheer Florida Staff Operations Manual
// Uses jsPDF to generate a branded, multi-page PDF from the manual data

import jsPDF from "jspdf";
import { SECTIONS, ContentBlock } from "./manualData";

const NAVY = [26, 42, 89] as const;
const RED = [190, 30, 45] as const;
const WHITE = [255, 255, 255] as const;
const LIGHT_GRAY = [248, 248, 250] as const;
const MID_GRAY = [100, 110, 130] as const;
const DARK = [35, 40, 55] as const;

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN_L = 18;
const MARGIN_R = 18;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;
const BODY_BOTTOM = PAGE_H - 18; // usable bottom edge (above footer)
const SECTION_HEADER_H = 35; // height needed to draw a section heading block

function addPageHeader(doc: jsPDF, sectionNum: string, sectionTitle: string) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 18, "F");
  doc.setFillColor(...RED);
  doc.rect(0, 18, PAGE_W, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text("CHEER FLORIDA", MARGIN_L, 11.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 190, 210);
  const label = `SECTION ${sectionNum}  ·  ${sectionTitle.toUpperCase()}`;
  doc.text(label, PAGE_W / 2, 11.5, { align: "center" });

  doc.setTextColor(180, 190, 210);
  doc.setFontSize(7.5);
  doc.text(`${doc.getCurrentPageInfo().pageNumber}`, PAGE_W - MARGIN_R, 11.5, { align: "right" });
}

function addPageFooter(doc: jsPDF) {
  doc.setFillColor(...NAVY);
  doc.rect(0, PAGE_H - 10, PAGE_W, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(180, 190, 210);
  doc.text("CHEER FLORIDA  ·  STAFF OPERATIONS MANUAL  ·  CONFIDENTIAL", PAGE_W / 2, PAGE_H - 3.5, { align: "center" });
  doc.setTextColor(...RED);
  doc.setFont("helvetica", "bold");
  doc.text("#GETAGRIP", PAGE_W - MARGIN_R, PAGE_H - 3.5, { align: "right" });
}

function newPage(doc: jsPDF, sectionNum: string, sectionTitle: string): number {
  addPageFooter(doc);
  doc.addPage();
  addPageHeader(doc, sectionNum, sectionTitle);
  return 28;
}

function wrapText(doc: jsPDF, text: string, maxWidth: number, fontSize: number): string[] {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth);
}

export async function downloadManualPdf(onProgress?: (pct: number) => void) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // ── Cover Page ────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Top red stripe
  doc.setFillColor(...RED);
  doc.rect(0, 0, PAGE_W, 6, "F");

  // Bottom red stripe
  doc.setFillColor(...RED);
  doc.rect(0, PAGE_H - 6, PAGE_W, 6, "F");

  // Horizontal divider line
  doc.setFillColor(...RED);
  doc.rect(0, PAGE_H * 0.58, PAGE_W, 2.5, "F");

  // "CHEER FLORIDA" wordmark top-left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text("CHEER FLORIDA", MARGIN_L, 20);

  // EST. 1998 tag
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(180, 190, 210);
  doc.text("EST. 1998", MARGIN_L, 26);

  // Large title block — left aligned, vertically centered
  doc.setFont("helvetica", "bold");
  doc.setFontSize(44);
  doc.setTextColor(...WHITE);
  doc.text("STAFF", MARGIN_L, 105);
  doc.text("OPERATIONS", MARGIN_L, 126);
  doc.text("MANUAL", MARGIN_L, 147);

  // Subtitle below red bar
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(180, 190, 210);
  doc.text("CHEER FLORIDA  ·  OFFICIAL PROGRAM DOCUMENT", MARGIN_L, PAGE_H * 0.58 + 12);

  // #GETAGRIP
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...RED);
  doc.text("#GETAGRIP", MARGIN_L, PAGE_H * 0.58 + 24);

  // Confidential notice
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 130, 155);
  doc.text("CONFIDENTIAL — FOR CHEER FLORIDA COACHING STAFF ONLY", MARGIN_L, PAGE_H - 14);

  addPageFooter(doc);

  // ── Table of Contents ─────────────────────────────────────────────────────
  doc.addPage();
  addPageHeader(doc, "00", "TABLE OF CONTENTS");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...NAVY);
  doc.text("TABLE OF CONTENTS", MARGIN_L, 34);

  doc.setFillColor(...RED);
  doc.rect(MARGIN_L, 37, 14, 1.5, "F");

  // Tighter row height (8mm) so all 24 entries fit on 2 pages
  const TOC_ROW_H = 8;
  let tocY = 46;

  SECTIONS.forEach((section, i) => {
    if (tocY + TOC_ROW_H > BODY_BOTTOM) {
      addPageFooter(doc);
      doc.addPage();
      addPageHeader(doc, "00", "TABLE OF CONTENTS");
      tocY = 28;
    }
    if (i % 2 === 0) {
      doc.setFillColor(...LIGHT_GRAY);
      doc.rect(MARGIN_L, tocY - 3, CONTENT_W, TOC_ROW_H, "F");
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...RED);
    doc.text(section.num, MARGIN_L + 2, tocY + 0.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text(section.title, MARGIN_L + 14, tocY + 0.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID_GRAY);
    doc.setFontSize(6.8);
    doc.text(section.sub, MARGIN_L + 14, tocY + 4);

    tocY += TOC_ROW_H;
  });

  addPageFooter(doc);

  // ── Sections ──────────────────────────────────────────────────────────────
  const totalSections = SECTIONS.length;
  let currentSection = "00";
  let currentSectionTitle = "CHEER FLORIDA STAFF OPERATIONS MANUAL";

  // Track current y across sections — start fresh on a new page only when needed
  let y = BODY_BOTTOM; // force a new page for the first section

  for (let si = 0; si < SECTIONS.length; si++) {
    const section = SECTIONS[si];
    currentSection = section.num;
    currentSectionTitle = section.title;

    if (onProgress) onProgress(Math.round((si / totalSections) * 90) + 5);

    // Start new page if not enough room for section header + at least one block
    if (y + SECTION_HEADER_H > BODY_BOTTOM) {
      y = newPage(doc, currentSection, currentSectionTitle);
    } else {
      // Continue on same page — update the header to reflect new section
      addPageHeader(doc, currentSection, currentSectionTitle);
      // Add a visual divider between sections on the same page
      doc.setFillColor(...NAVY);
      doc.rect(MARGIN_L, y, CONTENT_W, 0.5, "F");
      y += 6;
    }

    // Section heading block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...RED);
    doc.text(`SECTION ${section.num}`, MARGIN_L, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...NAVY);
    const titleLines = doc.splitTextToSize(section.title, CONTENT_W);
    doc.text(titleLines, MARGIN_L, y);
    y += titleLines.length * 7 + 1;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MID_GRAY);
    doc.text(section.sub, MARGIN_L, y);
    y += 4;

    doc.setFillColor(...RED);
    doc.rect(MARGIN_L, y, 12, 1.2, "F");
    y += 7;

    // Content blocks
    for (const block of section.content) {
      if (y > BODY_BOTTOM) {
        y = newPage(doc, currentSection, currentSectionTitle);
      }
      y = renderBlock(doc, block, y, currentSection, currentSectionTitle);
    }

    // Signature section special layout
    if (section.num === "24") {
      if (y > BODY_BOTTOM - 80) {
        y = newPage(doc, currentSection, currentSectionTitle);
      }
      y += 5;
      doc.setDrawColor(...NAVY);
      doc.setLineWidth(0.3);
      doc.rect(MARGIN_L, y, CONTENT_W, 60, "S");

      const col1X = MARGIN_L + 5;
      const col2X = MARGIN_L + CONTENT_W / 2 + 5;
      const colW = CONTENT_W / 2 - 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...NAVY);
      doc.text("COACH SIGNATURE", col1X, y + 8);
      doc.text("PROGRAM LEADERSHIP", col2X, y + 8);

      const lineY1 = y + 22;
      const lineY2 = y + 38;
      const lineY3 = y + 54;

      [col1X, col2X].forEach((cx) => {
        doc.setDrawColor(100, 110, 130);
        doc.setLineWidth(0.3);
        doc.line(cx, lineY1, cx + colW, lineY1);
        doc.line(cx, lineY2, cx + colW, lineY2);
        doc.line(cx, lineY3, cx + colW, lineY3);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...MID_GRAY);
        doc.text("Signature", cx, lineY1 + 3.5);
        doc.text("Printed Name", cx, lineY2 + 3.5);
        doc.text("Date", cx, lineY3 + 3.5);
      });
      y += 65;
    }
  }

  addPageFooter(doc);

  if (onProgress) onProgress(100);

  doc.save("CFA_Staff_Operations_Manual.pdf");
}

function renderBlock(
  doc: jsPDF,
  block: ContentBlock,
  y: number,
  sectionNum: string,
  sectionTitle: string
): number {
  const checkPage = (neededHeight: number): number => {
    if (y + neededHeight > BODY_BOTTOM) {
      addPageFooter(doc);
      doc.addPage();
      addPageHeader(doc, sectionNum, sectionTitle);
      return 28;
    }
    return y;
  };

  switch (block.type) {
    case "body": {
      const lines = wrapText(doc, block.text, CONTENT_W, 9.5);
      y = checkPage(lines.length * 5 + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      doc.text(lines, MARGIN_L, y);
      y += lines.length * 5 + 4;
      break;
    }

    case "italic_intro": {
      const lines = wrapText(doc, block.text, CONTENT_W - 8, 9);
      y = checkPage(lines.length * 5 + 8);
      doc.setFillColor(245, 245, 248);
      doc.rect(MARGIN_L, y - 3, CONTENT_W, lines.length * 5 + 7, "F");
      doc.setDrawColor(...RED);
      doc.setLineWidth(0.8);
      doc.line(MARGIN_L, y - 3, MARGIN_L, y + lines.length * 5 + 4);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(60, 70, 90);
      doc.text(lines, MARGIN_L + 5, y);
      y += lines.length * 5 + 10;
      break;
    }

    case "section_label": {
      // Prevent orphan: ensure at least 20mm of content space after the label
      y = checkPage(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...RED);
      doc.text(block.text.toUpperCase(), MARGIN_L, y);
      y += 2;
      doc.setDrawColor(...RED);
      doc.setLineWidth(0.5);
      doc.line(MARGIN_L, y, MARGIN_L + 30, y);
      y += 5;
      break;
    }

    case "bullet": {
      for (const item of block.items) {
        const lines = wrapText(doc, item, CONTENT_W - 8, 9);
        y = checkPage(lines.length * 5 + 2);
        doc.setFillColor(...RED);
        doc.rect(MARGIN_L + 1, y - 2, 2.5, 2.5, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(lines, MARGIN_L + 7, y);
        y += lines.length * 5 + 1;
      }
      y += 3;
      break;
    }

    case "numbered": {
      block.items.forEach((item, i) => {
        const lines = wrapText(doc, item, CONTENT_W - 10, 9);
        y = checkPage(lines.length * 5 + 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...NAVY);
        doc.text(`${i + 1}.`, MARGIN_L + 1, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(lines, MARGIN_L + 9, y);
        y += lines.length * 5 + 1;
      });
      y += 3;
      break;
    }

    case "link": {
      y = checkPage(12);
      doc.setFillColor(240, 242, 248);
      doc.rect(MARGIN_L, y - 3, CONTENT_W, 11, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...RED);
      doc.text(`→  ${block.label}`, MARGIN_L + 4, y + 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 100, 160);
      doc.text(block.url, MARGIN_L + 4, y + 6);
      y += 14;
      break;
    }

    case "grip_cards": {
      const cardW = (CONTENT_W - 6) / 4;
      const cardH = 50;
      y = checkPage(cardH + 6);
      block.cards.forEach((card, i) => {
        const cx = MARGIN_L + i * (cardW + 2);
        doc.setFillColor(...LIGHT_GRAY);
        doc.rect(cx, y, cardW, cardH, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...RED);
        doc.text(card.letter, cx + 4, y + 14);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...NAVY);
        doc.text(card.word, cx + 4, y + 20);

        doc.setFillColor(...RED);
        doc.rect(cx + 4, y + 22, 10, 0.8, "F");

        const descLines = doc.splitTextToSize(card.desc, cardW - 8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(60, 70, 90);
        doc.text(descLines.slice(0, 6), cx + 4, y + 27);
      });
      y += cardH + 8;
      break;
    }

    case "penalty_table":
    case "bonus_table": {
      const isBonus = block.type === "bonus_table";
      const rowH = 9;
      const descColW = 52;
      const notesColW = CONTENT_W - 28 - descColW - 4;

      // Header
      y = checkPage(rowH + 4);
      doc.setFillColor(...NAVY);
      doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...WHITE);
      doc.text("AMOUNT", MARGIN_L + 2, y + 6);
      doc.text("DESCRIPTION", MARGIN_L + 30, y + 6);
      doc.text("NOTES / QUALIFICATIONS", MARGIN_L + 30 + descColW + 2, y + 6);
      y += rowH;

      block.rows.forEach((row, i) => {
        // Wrap description and notes to calculate actual row height
        doc.setFontSize(7.5);
        const descLines = doc.splitTextToSize(row.description, descColW);
        const notesLines = doc.splitTextToSize(row.notes, notesColW);
        const maxLines = Math.max(descLines.length, notesLines.length, 1);
        const thisRowH = maxLines * 4.5 + 4;

        if (y + thisRowH > BODY_BOTTOM) {
          addPageFooter(doc);
          doc.addPage();
          addPageHeader(doc, sectionNum, sectionTitle);
          y = 28;
          // Repeat header
          doc.setFillColor(...NAVY);
          doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(...WHITE);
          doc.text("AMOUNT", MARGIN_L + 2, y + 6);
          doc.text("DESCRIPTION", MARGIN_L + 30, y + 6);
          doc.text("NOTES / QUALIFICATIONS", MARGIN_L + 30 + descColW + 2, y + 6);
          y += rowH;
        }

        if (i % 2 === 0) {
          doc.setFillColor(...LIGHT_GRAY);
          doc.rect(MARGIN_L, y, CONTENT_W, thisRowH, "F");
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(isBonus ? 40 : 190, isBonus ? 140 : 30, isBonus ? 60 : 45);
        doc.text(row.amount, MARGIN_L + 2, y + 5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...NAVY);
        doc.text(descLines, MARGIN_L + 30, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...DARK);
        doc.text(notesLines, MARGIN_L + 30 + descColW + 2, y + 5);

        y += thisRowH;
      });
      y += 5;
      break;
    }

    case "steps": {
      for (const step of block.items) {
        const descLines = wrapText(doc, step.desc, CONTENT_W - 16, 9);
        const stepH = descLines.length * 5 + 12;
        y = checkPage(stepH);

        doc.setFillColor(240, 242, 248);
        doc.rect(MARGIN_L, y, CONTENT_W, stepH, "F");
        doc.setFillColor(...NAVY);
        doc.rect(MARGIN_L, y, 3, stepH, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...NAVY);
        doc.text(step.title.toUpperCase(), MARGIN_L + 8, y + 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(descLines, MARGIN_L + 8, y + 11);

        y += stepH + 3;
      }
      y += 2;
      break;
    }

    case "comp_table": {
      // Columns: Team | Division | Placement | Field | Day1 | Day2 | Final
      const colX = [MARGIN_L, MARGIN_L + 34, MARGIN_L + 80, MARGIN_L + 104, MARGIN_L + 120, MARGIN_L + 138, MARGIN_L + 156];
      const colW = [32, 44, 22, 14, 16, 16, 18];
      const rowH = 7;

      y = checkPage(rowH + 4);
      doc.setFillColor(...NAVY);
      doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...WHITE);
      const headers = ["TEAM", "DIVISION", "PLACEMENT", "FIELD", "DAY 1", "DAY 2", "FINAL"];
      headers.forEach((h, i) => doc.text(h, colX[i] + 1, y + 5));
      y += rowH;

      block.rows.forEach((row, i) => {
        if (y + rowH > BODY_BOTTOM) {
          addPageFooter(doc);
          doc.addPage();
          addPageHeader(doc, sectionNum, sectionTitle);
          y = 28;
        }
        if (i % 2 === 0) {
          doc.setFillColor(...LIGHT_GRAY);
          doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...NAVY);
        doc.text(doc.splitTextToSize(row.team, colW[0] - 2)[0], colX[0] + 1, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...DARK);
        doc.text(doc.splitTextToSize(row.division, colW[1] - 2)[0], colX[1] + 1, y + 5);
        doc.text(row.placement, colX[2] + 1, y + 5);
        doc.text(String(row.field), colX[3] + 1, y + 5);

        doc.setTextColor(...MID_GRAY);
        doc.text(row.day1, colX[4] + 1, y + 5);
        doc.text(row.day2, colX[5] + 1, y + 5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...NAVY);
        doc.text(row.fs, colX[6] + 1, y + 5);

        y += rowH;
      });
      y += 5;
      break;
    }

    case "comp_table_placement": {
      // Columns: Team | Division | Placement | Field Size
      const colX = [MARGIN_L, MARGIN_L + 40, MARGIN_L + 110, MARGIN_L + 140];
      const colW = [38, 68, 28, 24];
      const rowH = 7;

      y = checkPage(rowH + 4);
      doc.setFillColor(...NAVY);
      doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...WHITE);
      ["TEAM", "DIVISION", "PLACEMENT", "FIELD SIZE"].forEach((h, i) => doc.text(h, colX[i] + 1, y + 5));
      y += rowH;

      block.rows.forEach((row, i) => {
        if (y + rowH > BODY_BOTTOM) {
          addPageFooter(doc);
          doc.addPage();
          addPageHeader(doc, sectionNum, sectionTitle);
          y = 28;
        }
        if (i % 2 === 0) {
          doc.setFillColor(...LIGHT_GRAY);
          doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...NAVY);
        doc.text(doc.splitTextToSize(row.team, colW[0] - 2)[0], colX[0] + 1, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...DARK);
        doc.text(doc.splitTextToSize(row.division, colW[1] - 2)[0], colX[1] + 1, y + 5);
        doc.text(row.placement, colX[2] + 1, y + 5);
        doc.text(String(row.field), colX[3] + 1, y + 5);
        y += rowH;
      });
      y += 5;
      break;
    }

    case "priority_table": {
      // Columns: Rank | Team | Win Pts | Major | Regular | Avg % | Avg Score
      const colX = [MARGIN_L, MARGIN_L + 14, MARGIN_L + 52, MARGIN_L + 72, MARGIN_L + 92, MARGIN_L + 116, MARGIN_L + 148];
      const rowH = 7;

      y = checkPage(rowH + 4);
      doc.setFillColor(...NAVY);
      doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...WHITE);
      ["#", "TEAM", "WIN PTS", "MAJOR", "REGULAR", "AVG PLACE %", "AVG SCORE"].forEach((h, i) =>
        doc.text(h, colX[i] + 1, y + 5)
      );
      y += rowH;

      block.rows.forEach((row, i) => {
        if (y + rowH > BODY_BOTTOM) {
          addPageFooter(doc);
          doc.addPage();
          addPageHeader(doc, sectionNum, sectionTitle);
          y = 28;
        }
        if (i % 2 === 0) {
          doc.setFillColor(...LIGHT_GRAY);
          doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
        }

        // Rank badge
        doc.setFillColor(...RED);
        doc.rect(colX[0] + 1, y + 1, 8, 5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...WHITE);
        doc.text(String(row.rank), colX[0] + 3, y + 5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...NAVY);
        doc.text(row.team, colX[1] + 1, y + 5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...RED);
        doc.text(String(row.win_pts), colX[2] + 1, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...DARK);
        doc.text(String(row.major_wins), colX[3] + 1, y + 5);
        doc.text(String(row.regular_wins), colX[4] + 1, y + 5);
        doc.text(row.avg_pct, colX[5] + 1, y + 5);
        doc.text(row.avg_score, colX[6] + 1, y + 5);

        y += rowH;
      });
      y += 5;
      break;
    }
  }

  return y;
}

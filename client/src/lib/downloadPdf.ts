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

// Minimum height needed for a section heading + at least one line of content
// so we never orphan a section title at the bottom of a page
const SECTION_HEADER_H = 55;

// Minimum space required after a section_label before we allow it to render
// (prevents subsection titles orphaned from their content)
const LABEL_MIN_FOLLOWING = 30;

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

async function loadImageAsDataURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function downloadManualPdf(onProgress?: (pct: number) => void) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // Load CFA logo
  let logoDataUrl: string | null = null;
  try {
    logoDataUrl = await loadImageAsDataURL(
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663270045816/N4rgkrRwWxtgy5x7UFcaiD/cfa-logo_508dfd17.png"
    );
  } catch {
    logoDataUrl = null;
  }

  // ── Cover Page ────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Top red stripe
  doc.setFillColor(...RED);
  doc.rect(0, 0, PAGE_W, 5, "F");

  // Bottom red stripe
  doc.setFillColor(...RED);
  doc.rect(0, PAGE_H - 5, PAGE_W, 5, "F");

  // Horizontal divider line — at 60% height
  doc.setFillColor(...RED);
  doc.rect(0, PAGE_H * 0.60, PAGE_W, 2, "F");

  // CFA Logo — top-left, generous padding from top stripe
  if (logoDataUrl) {
    // Logo is wide (approx 3:1 ratio) — render at 80mm wide
    const logoW = 80;
    const logoH = 27; // ~1:3 ratio
    doc.addImage(logoDataUrl, "PNG", MARGIN_L, 14, logoW, logoH);
  } else {
    // Fallback text wordmark
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...WHITE);
    doc.text("CHEER FLORIDA", MARGIN_L, 26);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(180, 190, 210);
    doc.text("EST. 1998", MARGIN_L, 32);
  }

  // Large title block — left aligned, vertically centered in upper half
  doc.setFont("helvetica", "bold");
  doc.setFontSize(46);
  doc.setTextColor(...WHITE);
  doc.text("STAFF", MARGIN_L, 110);
  doc.text("OPERATIONS", MARGIN_L, 133);
  doc.text("MANUAL", MARGIN_L, 156);

  // Subtitle below red divider bar
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(180, 190, 210);
  doc.text("CHEER FLORIDA  ·  OFFICIAL PROGRAM DOCUMENT", MARGIN_L, PAGE_H * 0.60 + 13);

  // #GETAGRIP
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...RED);
  doc.text("#GETAGRIP", MARGIN_L, PAGE_H * 0.60 + 26);

  // Confidential notice
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 110, 140);
  doc.text("CONFIDENTIAL — FOR CHEER FLORIDA COACHING STAFF ONLY", MARGIN_L, PAGE_H - 12);

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

  let y = BODY_BOTTOM; // force a new page for the first section

  for (let si = 0; si < SECTIONS.length; si++) {
    const section = SECTIONS[si];
    currentSection = section.num;
    currentSectionTitle = section.title;

    if (onProgress) onProgress(Math.round((si / totalSections) * 90) + 5);

    // Always start a new page for each section — this prevents section bleed
    // (e.g., 4.3 ending on a page and Section 5 starting on the same page
    // with its content continuing on the next)
    y = newPage(doc, currentSection, currentSectionTitle);

    // Section heading block — with proper spacing between label and title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...RED);
    doc.text(`SECTION ${section.num}`, MARGIN_L, y);
    y += 8; // <-- increased gap between "SECTION XX" label and the big title

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...NAVY);
    const titleLines = doc.splitTextToSize(section.title, CONTENT_W);
    doc.text(titleLines, MARGIN_L, y);
    y += titleLines.length * 8 + 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MID_GRAY);
    doc.text(section.sub, MARGIN_L, y);
    y += 5;

    doc.setFillColor(...RED);
    doc.rect(MARGIN_L, y, 12, 1.2, "F");
    y += 9;

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
      // Always use helvetica normal — never courier/monospace
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const lines = doc.splitTextToSize(block.text, CONTENT_W);
      y = checkPage(lines.length * 5.5 + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      doc.text(lines, MARGIN_L, y);
      y += lines.length * 5.5 + 4;
      break;
    }

    case "italic_intro": {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(block.text, CONTENT_W - 8);
      y = checkPage(lines.length * 5.5 + 10);
      doc.setFillColor(245, 245, 248);
      doc.rect(MARGIN_L, y - 3, CONTENT_W, lines.length * 5.5 + 8, "F");
      doc.setDrawColor(...RED);
      doc.setLineWidth(0.8);
      doc.line(MARGIN_L, y - 3, MARGIN_L, y + lines.length * 5.5 + 5);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(60, 70, 90);
      doc.text(lines, MARGIN_L + 5, y);
      y += lines.length * 5.5 + 12;
      break;
    }

    case "section_label": {
      // Prevent orphan: require LABEL_MIN_FOLLOWING mm of space after label
      y = checkPage(LABEL_MIN_FOLLOWING);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...RED);
      doc.text(block.text.toUpperCase(), MARGIN_L, y);
      y += 2.5;
      doc.setDrawColor(...RED);
      doc.setLineWidth(0.5);
      doc.line(MARGIN_L, y, MARGIN_L + 32, y);
      y += 6;
      break;
    }

    case "bullet": {
      for (const item of block.items) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(item, CONTENT_W - 9);
        y = checkPage(lines.length * 5.5 + 3);
        doc.setFillColor(...RED);
        doc.rect(MARGIN_L + 1, y - 2, 2.5, 2.5, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(lines, MARGIN_L + 7, y);
        y += lines.length * 5.5 + 1.5;
      }
      y += 3;
      break;
    }

    case "numbered": {
      block.items.forEach((item, i) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(item, CONTENT_W - 11);
        y = checkPage(lines.length * 5.5 + 3);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...NAVY);
        doc.text(`${i + 1}.`, MARGIN_L + 1, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(lines, MARGIN_L + 9, y);
        y += lines.length * 5.5 + 1.5;
      });
      y += 3;
      break;
    }

    case "link": {
      y = checkPage(13);
      doc.setFillColor(240, 242, 248);
      doc.rect(MARGIN_L, y - 3, CONTENT_W, 12, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...RED);
      doc.text(`→  ${block.label}`, MARGIN_L + 4, y + 2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 100, 160);
      doc.text(block.url, MARGIN_L + 4, y + 7);
      y += 15;
      break;
    }

    case "grip_cards": {
      const cardW = (CONTENT_W - 6) / 4;
      const cardH = 52;
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

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(60, 70, 90);
        const descLines = doc.splitTextToSize(card.desc, cardW - 8);
        doc.text(descLines.slice(0, 6), cx + 4, y + 27);
      });
      y += cardH + 8;
      break;
    }

    case "penalty_table":
    case "bonus_table": {
      const isBonus = block.type === "bonus_table";
      const rowH = 9;
      const amtColW = 26;
      const descColW = 52;
      const notesColW = CONTENT_W - amtColW - descColW - 4;
      const descX = MARGIN_L + amtColW + 2;
      const notesX = descX + descColW + 2;

      // Header
      y = checkPage(rowH + 4);
      doc.setFillColor(...NAVY);
      doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...WHITE);
      doc.text("AMOUNT", MARGIN_L + 2, y + 6);
      doc.text("DESCRIPTION", descX, y + 6);
      doc.text("NOTES / QUALIFICATIONS", notesX, y + 6);
      y += rowH;

      block.rows.forEach((row, i) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        const descLines = doc.splitTextToSize(row.description, descColW - 2);
        const notesLines = doc.splitTextToSize(row.notes, notesColW - 2);
        const maxLines = Math.max(descLines.length, notesLines.length, 1);
        const thisRowH = maxLines * 4.5 + 5;

        if (y + thisRowH > BODY_BOTTOM) {
          addPageFooter(doc);
          doc.addPage();
          addPageHeader(doc, sectionNum, sectionTitle);
          y = 28;
          // Repeat header on new page
          doc.setFillColor(...NAVY);
          doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(...WHITE);
          doc.text("AMOUNT", MARGIN_L + 2, y + 6);
          doc.text("DESCRIPTION", descX, y + 6);
          doc.text("NOTES / QUALIFICATIONS", notesX, y + 6);
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
        doc.text(descLines, descX, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...DARK);
        doc.text(notesLines, notesX, y + 5);

        y += thisRowH;
      });
      y += 5;
      break;
    }

    case "steps": {
      for (const step of block.items) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const descLines = doc.splitTextToSize(step.desc, CONTENT_W - 16);
        const stepH = descLines.length * 5.5 + 13;
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
        doc.text(descLines, MARGIN_L + 8, y + 12);

        y += stepH + 3;
      }
      y += 2;
      break;
    }

    case "comp_table": {
      const colX = [MARGIN_L, MARGIN_L + 34, MARGIN_L + 80, MARGIN_L + 104, MARGIN_L + 120, MARGIN_L + 138, MARGIN_L + 156];
      const colW = [32, 44, 22, 14, 16, 16, 18];
      const rowH = 7;

      y = checkPage(rowH + 4);
      doc.setFillColor(...NAVY);
      doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...WHITE);
      ["TEAM", "DIVISION", "PLACEMENT", "FIELD", "DAY 1", "DAY 2", "FINAL"].forEach((h, i) =>
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
      const colX = [MARGIN_L, MARGIN_L + 40, MARGIN_L + 110, MARGIN_L + 140];
      const colW = [38, 68, 28, 24];
      const rowH = 7;

      y = checkPage(rowH + 4);
      doc.setFillColor(...NAVY);
      doc.rect(MARGIN_L, y, CONTENT_W, rowH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...WHITE);
      ["TEAM", "DIVISION", "PLACEMENT", "FIELD SIZE"].forEach((h, i) =>
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

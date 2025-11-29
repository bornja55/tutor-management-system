// ============================================================
// 📊 DASHBOARD REPORT - VERSION 8.0
// ✅ Filter ใช้ร่วมกัน (ปี, เดือน, รอบ, นักเรียน, ติวเตอร์)
// ✅ 2 ปุ่ม: รายงานนักเรียน + รายงานติวเตอร์
// ✅ Compact Layout (~17 Rows)
// ✅ ใช้ Shared Config และ Utils
// 🆕 Version 8.0 Changes:
//    - displayTutorReport() ใช้ Payment Rules (เหมือน Dashboard Payment)
//    - เพิ่มคอลัมน์ยอดเงิน ในรายงานติวเตอร์
//    - แก้ไขกรอบยอดรวม (SOLID_MEDIUM → SOLID)
//    - แก้ไข layout calculation ป้องกันหัวตารางทับ checkbox
// ============================================================

// ============================================================
// 🔧 SETUP DASHBOARD REPORT
// ============================================================
function setupDashboardReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName(REPORT_CONFIG.DASHBOARD_SHEET);

  if (!dashboard) {
    dashboard = ss.insertSheet(REPORT_CONFIG.DASHBOARD_SHEET);
  }

  // Clear everything
  dashboard.clear();
  dashboard.clearConditionalFormatRules();
  const lastRow = dashboard.getMaxRows();
  const lastCol = dashboard.getMaxColumns();
  if (lastRow > 0 && lastCol > 0) {
    dashboard.getRange(1, 1, lastRow, lastCol).clearDataValidations();
  }

  // ============================================================
  // ROW 1: HEADER
  // ============================================================
  dashboard.getRange('A1:M1').merge()
    .setValue('📊 Dashboard Report - รายงานการเรียน')
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground(REPORT_CONFIG.COLORS.header)
    .setFontColor('#ffffff');
  dashboard.setRowHeight(1, 45);

  // ============================================================
  // ROW 3: ปี + รอบ + ปุ่มอัพเดต (แถวเดียว)
  // ============================================================
  // ปี
  dashboard.getRange('A3').setValue('📅 ปี').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('B3').setValue('2025').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('C3').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('D3').setValue('2026').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('E3').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod);

  // รอบ
  dashboard.getRange('F3').setValue('📅 รอบ').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('G3').setValue('1-15').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('H3').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('I3').setValue('16-31').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('J3').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod);

  // ปุ่มอัพเดต
  dashboard.getRange('K3:M3').merge()
    .setValue('🔄 อัพเดต')
    .setFontSize(10)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground(REPORT_CONFIG.COLORS.buttonUpdate)
    .setFontColor('#000000');

  dashboard.setRowHeight(3, 30);
  dashboard.getRange('A3:M3').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 5-6: เดือน (A5 = Label, B5-M5 = 12 เดือน)
  // ============================================================
  // A5: Label "เดือน"
  dashboard.getRange('A5').setValue('เดือน').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.month).setHorizontalAlignment('center');
  dashboard.getRange('A6').setBackground(REPORT_CONFIG.COLORS.month);

  // Row 5: ชื่อเดือน (B5-M5 = 12 เดือน)
  SHARED_CONFIG.MONTH_SHORT.forEach((month, index) => {
    dashboard.getRange(5, index + 2)  // B5-M5
      .setValue(month)
      .setHorizontalAlignment('center')
      .setFontSize(8)
      .setBackground(REPORT_CONFIG.COLORS.month);
  });

  // Row 6: Checkbox เดือน (B6-M6 = 12 เดือน)
  for (let i = 0; i < 12; i++) {
    dashboard.getRange(6, i + 2)  // B6-M6
      .insertCheckboxes()
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.month);
  }

  dashboard.setRowHeight(5, 22);
  dashboard.setRowHeight(6, 25);
  dashboard.getRange('A5:M6').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 8: นักเรียน Header
  // ============================================================
  dashboard.getRange('A8').setValue('👤 นักเรียน').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('B8').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('C8').setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('D8').setValue('(กด "อัพเดต" เพื่อแสดงรายชื่อ)').setFontSize(8).setFontColor('#999999').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.student);
  // E8:M8 ไว้ให้ dynamic checkbox ใช้
  dashboard.getRange('E8:M8').setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.setRowHeight(8, 25);

  // ROW 9-10: Placeholder นักเรียน (Label + Checkbox)
  dashboard.getRange('A9:M9').setBackground('#fffde7');
  dashboard.getRange('A10:M10').setBackground('#fffde7');
  dashboard.setRowHeight(9, 20);
  dashboard.setRowHeight(10, 22);
  dashboard.getRange('A8:M10').setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 12: ติวเตอร์ Header
  // ============================================================
  dashboard.getRange('A12').setValue('👨‍🏫 ติวเตอร์').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.getRange('B12').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.getRange('C12').setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.getRange('D12').setValue('(กด "อัพเดต" เพื่อแสดงรายชื่อ)').setFontSize(8).setFontColor('#999999').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.tutor);
  // E12:M12 ไว้ให้ dynamic checkbox ใช้
  dashboard.getRange('E12:M12').setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.setRowHeight(12, 25);

  // ROW 13-14: Placeholder ติวเตอร์ (Label + Checkbox)
  dashboard.getRange('A13:M13').setBackground('#e8f5e9');
  dashboard.getRange('A14:M14').setBackground('#e8f5e9');
  dashboard.setRowHeight(13, 20);
  dashboard.setRowHeight(14, 22);
  dashboard.getRange('A12:M14').setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 16+: ปุ่มรายงาน, Summary Cards, Table Header
  // ============================================================
  // NOTE: จะถูกสร้างใน updateReportCheckboxes() แบบ dynamic
  // เพื่อไม่ให้ถูกทับโดย checkbox sections

  // ============================================================
  // COLUMN WIDTHS
  // ============================================================
  dashboard.setColumnWidth(1, 90);   // A
  dashboard.setColumnWidth(2, 65);   // B
  dashboard.setColumnWidth(3, 65);   // C
  dashboard.setColumnWidth(4, 65);   // D
  dashboard.setColumnWidth(5, 65);   // E
  dashboard.setColumnWidth(6, 65);   // F
  dashboard.setColumnWidth(7, 65);   // G
  dashboard.setColumnWidth(8, 65);   // H
  dashboard.setColumnWidth(9, 65);   // I
  dashboard.setColumnWidth(10, 65);  // J
  dashboard.setColumnWidth(11, 65);  // K
  dashboard.setColumnWidth(12, 65);  // L
  dashboard.setColumnWidth(13, 65);  // M

  // NOTE: setFrozenRows จะถูกเรียกใน updateReportCheckboxes() แบบ dynamic

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Setup Dashboard Report สำเร็จ!\n\n' +
    'ขั้นตอนการใช้งาน:\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '1. เลือก ☐ ปี/เดือน/รอบ\n' +
    '2. กด Menu: "🔄 อัพเดต"\n' +
    '3. เลือก ☐ นักเรียน/ติวเตอร์\n' +
    '4. กด "📚 รายงานนักเรียน" หรือ "👨‍🏫 รายงานติวเตอร์"',
    '✅ พร้อมใช้งาน',
    10
  );
}

// ============================================================
// 📊 SETUP SUMMARY CARDS TEMPLATE
// ============================================================
function setupSummaryCardsTemplate(dashboard, startRow) {
  // Use 13 columns (A-M) divided into 4 cards
  // Cards: A-C (3), D-F (3), G-I (3), J-M (4)
  const labels = ['📚 รวมชั่วโมง', '⏳ คงเหลือ', '👥 จำนวน', '✅ คอร์สจบ'];
  const colWidths = [3, 3, 3, 4];  // Last card gets 4 columns

  let col = 1;
  labels.forEach((label, index) => {
    const width = colWidths[index];

    dashboard.getRange(startRow, col, 1, width).merge()
      .setValue(label)
      .setFontSize(10)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.summaryLabel);

    dashboard.getRange(startRow + 1, col, 1, width).merge()
      .setValue('-')
      .setFontSize(14)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.summaryValue);

    col += width;
  });

  dashboard.setRowHeight(startRow, 25);
  dashboard.setRowHeight(startRow + 1, 35);
}

// ============================================================
// 🔄 UPDATE STUDENT & TUTOR CHECKBOXES
// ============================================================
function updateReportCheckboxes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(REPORT_CONFIG.DASHBOARD_SHEET);
  const rawData = ss.getSheetByName(SHARED_CONFIG.RAW_DATA_SHEET);

  if (!dashboard || !rawData) {
    SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น');
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('กำลังอัพเดต...', '⏳ กรุณารอ', 3);

  // Get selected filters
  const selectedYears = getSelectedYearsReport(dashboard);
  const selectedMonths = getSelectedMonthsReport(dashboard);

  if (selectedYears.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ กรุณาเลือกปีอย่างน้อย 1 ปี');
    return;
  }

  if (selectedMonths.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ กรุณาเลือกเดือนอย่างน้อย 1 เดือน');
    return;
  }

  Logger.log('📅 Years: ' + selectedYears.join(', '));
  Logger.log('📅 Months: ' + selectedMonths.join(', '));

  // Filter data (ใช้ฟังก์ชันจาก utils shared.gs)
  const filteredData = filterDataByYearMonth(rawData, selectedYears, selectedMonths);

  Logger.log('✅ Filtered: ' + filteredData.length + ' rows');

  if (filteredData.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ ไม่พบข้อมูลในช่วงเวลาที่เลือก');
    return;
  }

  // Get unique students & tutors (ใช้ฟังก์ชันจาก utils shared.gs)
  const students = getUniqueStudents(filteredData);
  const tutors = getUniqueTutors(filteredData);

  // สร้าง mapping ระหว่าง Display Name กับ Line ID สำหรับติวเตอร์
  const tutorLineIdMap = getTutorLineIdMap(filteredData);
  saveTutorDisplayToLineIdMappingReport(dashboard, tutorLineIdMap);

  Logger.log('👤 Students: ' + students.length);
  Logger.log('👨‍🏫 Tutors: ' + tutors.length);

  // Display Student Checkboxes (Row 9-10, และอาจจะมีแถวเพิ่ม)
  const studentRowsUsed = displayCheckboxRow(dashboard, students, 9, 10, '#fffde7');

  // Calculate tutor start row (หลังจากนักเรียน + 2 แถวว่าง เพื่อไม่ให้ทับกัน)
  const tutorStartRow = 9 + studentRowsUsed + 2;

  // Setup Tutor Header ใหม่
  dashboard.getRange(tutorStartRow, 1).setValue('👨‍🏫 ติวเตอร์').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.getRange(tutorStartRow, 2).insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.getRange(tutorStartRow, 3).setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.getRange(tutorStartRow, 4, 1, 10).setValue('(' + tutors.length + ' คน)').setFontSize(8).setFontColor('#666666').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.setRowHeight(tutorStartRow, 25);

  // Display Tutor Checkboxes
  const tutorRowsUsed = displayCheckboxRow(dashboard, tutors, tutorStartRow + 1, tutorStartRow + 2, '#e8f5e9');

  // Border for tutor section
  const tutorEndRow = tutorStartRow + tutorRowsUsed;
  dashboard.getRange(tutorStartRow, 1, tutorRowsUsed + 1, 13).setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // Debug log เพื่อตรวจสอบ layout
  Logger.log(`🔍 Layout Check: student section ends at row ${9 + studentRowsUsed - 1}, tutor starts at ${tutorStartRow}, tutor ends at ${tutorEndRow}`);

  // Update student header (Row 8 ไม่เคลื่อนที่)
  dashboard.getRange('A8').setValue('👤 นักเรียน').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('B8').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('C8').setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('D8').setValue('(' + students.length + ' คน)').setFontSize(8).setFontColor('#666666').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('E8:M8').setValue('').setBackground(REPORT_CONFIG.COLORS.student);  // เคลียร์ E8:M8

  // Border for student section
  const studentEndRow = 9 + studentRowsUsed - 1;
  dashboard.getRange(8, 1, studentRowsUsed + 1, 13).setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // DYNAMIC LAYOUT: ลบปุ่มรายงานและ Summary Cards (ไม่ใช้แล้ว)
  // ============================================================
  const dataStartRow = tutorEndRow + 2;  // 2 แถวว่างหลัง tutor section

  // Clear old dynamic sections (ล้างแถว dataStartRow เป็นต้นไป)
  const maxClearRow = 50;
  if (dataStartRow < maxClearRow) {
    dashboard.getRange(dataStartRow, 1, maxClearRow - dataStartRow + 1, 13).clearContent().clearFormat();
  }

  // Update frozen rows
  dashboard.setFrozenRows(tutorEndRow);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ อัพเดตสำเร็จ!\n\n' +
    'นักเรียน: ' + students.length + ' คน\n' +
    'ติวเตอร์: ' + tutors.length + ' คน',
    '✅ สำเร็จ',
    5
  );
}

// ============================================================
// 📊 DISPLAY CHECKBOX ROW (Label Row + Checkbox Row)
// รองรับ 13 คน/แถว (A-M), ถ้ามากกว่า 13 ให้เพิ่มอีก 2 แถว
// Return: จำนวนแถวที่ใช้ (label + checkbox rows)
// ============================================================
function displayCheckboxRow(dashboard, items, labelRow, checkboxRow, bgColor) {
  const maxPerRow = 13;  // A-M = 13 คอลัม
  const maxRows = 3;     // รองรับสูงสุด 3 แถว (13+13+13 = 39 คน)

  // Calculate rows needed
  const rowsNeeded = Math.min(Math.ceil(items.length / maxPerRow), maxRows);

  // Clear old data (clear up to 6 rows: 3 label rows + 3 checkbox rows)
  for (let r = 0; r < maxRows * 2; r++) {
    dashboard.getRange(labelRow + r, 1, 1, 13).clearContent().clearDataValidations();
    dashboard.getRange(labelRow + r, 1, 1, 13).setBackground(bgColor);
  }

  if (items.length === 0) return 2;  // Return minimum rows (label + checkbox)

  let currentRow = labelRow;
  let itemIndex = 0;

  for (let rowGroup = 0; rowGroup < rowsNeeded; rowGroup++) {
    const itemsInThisRow = Math.min(maxPerRow, items.length - itemIndex);

    // Display labels
    for (let col = 0; col < itemsInThisRow; col++) {
      dashboard.getRange(currentRow, col + 1)
        .setValue(items[itemIndex + col])
        .setHorizontalAlignment('center')
        .setFontSize(8)
        .setBackground(bgColor);
    }

    // Display checkboxes
    for (let col = 0; col < itemsInThisRow; col++) {
      dashboard.getRange(currentRow + 1, col + 1)
        .insertCheckboxes()
        .setHorizontalAlignment('center')
        .setBackground(bgColor);
    }

    itemIndex += itemsInThisRow;
    currentRow += 2;  // Move to next label row

    if (itemIndex >= items.length) break;
  }

  // Return total rows used (2 rows per group: label + checkbox)
  return rowsNeeded * 2;
}

// ============================================================
// 📅 GET SELECTED YEARS
// ============================================================
function getSelectedYearsReport(dashboard) {
  const years = [];

  // 2025: C3
  if (dashboard.getRange('C3').getValue() === true) {
    years.push(2025);
  }

  // 2026: E3
  if (dashboard.getRange('E3').getValue() === true) {
    years.push(2026);
  }

  return years;
}

// ============================================================
// 📅 GET SELECTED MONTHS
// ============================================================
function getSelectedMonthsReport(dashboard) {
  const months = [];

  // B6-M6 = เดือน 0-11
  for (let i = 0; i < 12; i++) {
    if (dashboard.getRange(6, i + 2).getValue() === true) {
      months.push(i); // 0-11
    }
  }

  return months;
}

// ============================================================
// 📅 GET SELECTED PERIODS
// ============================================================
function getSelectedPeriodsReport(dashboard) {
  const periods = [];

  // 1-15: H3
  if (dashboard.getRange('H3').getValue() === true) {
    periods.push('1-15');
  }

  // 16-31: J3
  if (dashboard.getRange('J3').getValue() === true) {
    periods.push('16-31');
  }

  return periods;
}

// ============================================================
// 👤 GET SELECTED STUDENTS
// ============================================================
function getSelectedStudentsReport(dashboard) {
  // Check "ทั้งหมด"
  if (dashboard.getRange('B8').getValue() === true) {
    return [];
  }

  const selected = [];
  const maxRows = 3;  // รองรับ 3 แถว (Row 9-10, 11-12, 13-14)

  for (let rowGroup = 0; rowGroup < maxRows; rowGroup++) {
    const labelRow = 9 + (rowGroup * 2);
    const checkRow = labelRow + 1;

    const labels = dashboard.getRange(labelRow, 1, 1, 13).getValues()[0];  // A-M
    const checks = dashboard.getRange(checkRow, 1, 1, 13).getValues()[0];

    for (let i = 0; i < 13; i++) {
      if (checks[i] === true && labels[i]) {
        selected.push(String(labels[i]));
      }
    }
  }

  return selected;
}

// ============================================================
// 💾 SAVE/LOAD TUTOR MAPPING (Report Version)
// ============================================================
function saveTutorDisplayToLineIdMappingReport(dashboard, tutorLineIdMap) {
  const mapping = {};
  tutorLineIdMap.forEach((info, lineId) => {
    mapping[info.displayName] = lineId;
  });
  dashboard.getRange('Z1').setValue(JSON.stringify(mapping));
}

function loadTutorDisplayToLineIdMappingReport(dashboard) {
  const jsonString = dashboard.getRange('Z1').getValue();
  if (!jsonString) return {};
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return {};
  }
}

// ============================================================
// 👨‍🏫 GET SELECTED TUTORS (คืนค่าเป็น Line ID)
// ============================================================
function getSelectedTutorsReport(dashboard) {
  // Find tutor header row (ที่มี "👨‍🏫 ติวเตอร์")
  let tutorHeaderRow = 12;  // Default
  for (let row = 8; row <= 30; row++) {
    const value = dashboard.getRange(row, 1).getValue();
    if (String(value).includes('ติวเตอร์')) {
      tutorHeaderRow = row;
      break;
    }
  }

  // Check "ทั้งหมด"
  if (dashboard.getRange(tutorHeaderRow, 2).getValue() === true) {
    return [];
  }

  // โหลด mapping
  const displayToLineId = loadTutorDisplayToLineIdMappingReport(dashboard);

  const selectedLineIds = [];
  const maxRows = 3;  // รองรับ 3 แถว

  for (let rowGroup = 0; rowGroup < maxRows; rowGroup++) {
    const labelRow = tutorHeaderRow + 1 + (rowGroup * 2);
    const checkRow = labelRow + 1;

    const labels = dashboard.getRange(labelRow, 1, 1, 13).getValues()[0];  // A-M
    const checks = dashboard.getRange(checkRow, 1, 1, 13).getValues()[0];

    for (let i = 0; i < 13; i++) {
      if (checks[i] === true && labels[i]) {
        const displayName = String(labels[i]);
        const lineId = displayToLineId[displayName];

        if (lineId) {
          selectedLineIds.push(lineId);
        } else {
          Logger.log('⚠️ ไม่เจอ Line ID สำหรับ: ' + displayName);
          selectedLineIds.push(displayName);  // Fallback
        }
      }
    }
  }

  return selectedLineIds;
}

// ============================================================
// 📚 GENERATE STUDENT REPORT
// ============================================================
function generateStudentReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(REPORT_CONFIG.DASHBOARD_SHEET);
  const rawData = ss.getSheetByName(SHARED_CONFIG.RAW_DATA_SHEET);

  if (!dashboard || !rawData) {
    SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น');
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('กำลังสร้างรายงานนักเรียน...', '⏳ กรุณารอ', 3);

  // Get all filters
  const selectedYears = getSelectedYearsReport(dashboard);
  const selectedMonths = getSelectedMonthsReport(dashboard);
  const selectedPeriods = getSelectedPeriodsReport(dashboard);
  const selectedStudents = getSelectedStudentsReport(dashboard);
  const selectedTutors = getSelectedTutorsReport(dashboard);

  if (selectedYears.length === 0 || selectedMonths.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ กรุณาเลือกปีและเดือนก่อน');
    return;
  }

  // Filter data (ใช้ฟังก์ชันจาก utils shared.gs)
  let filteredData = filterDataByYearMonth(rawData, selectedYears, selectedMonths);
  filteredData = filterDataByPeriodOnly(filteredData, selectedPeriods);

  // Filter by students
  if (selectedStudents.length > 0) {
    filteredData = filteredData.filter(row => selectedStudents.includes(String(row[5])));
  }

  // Filter by tutors
  if (selectedTutors.length > 0) {
    filteredData = filteredData.filter(row => selectedTutors.includes(String(row[3])));
  }

  if (filteredData.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ ไม่พบข้อมูลตามเงื่อนไขที่เลือก');
    return;
  }

  // Group by Student
  const { summary, dataMap } = groupByStudent(filteredData);

  // Clear old data
  clearReportData(dashboard);

  // Display Student Details (ไม่มี Summary Cards แล้ว)
  displayStudentReport(dashboard, dataMap);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ รายงานนักเรียนสำเร็จ!\n\n' +
    'นักเรียน: ' + dataMap.size + ' คน\n' +
    'ข้อมูล: ' + filteredData.length + ' รายการ',
    '✅ สำเร็จ',
    5
  );
}

// ============================================================
// 👨‍🏫 GENERATE TUTOR REPORT
// ============================================================
function generateTutorReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(REPORT_CONFIG.DASHBOARD_SHEET);
  const rawData = ss.getSheetByName(SHARED_CONFIG.RAW_DATA_SHEET);

  if (!dashboard || !rawData) {
    SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น');
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('กำลังสร้างรายงานติวเตอร์...', '⏳ กรุณารอ', 3);

  // Get all filters
  const selectedYears = getSelectedYearsReport(dashboard);
  const selectedMonths = getSelectedMonthsReport(dashboard);
  const selectedPeriods = getSelectedPeriodsReport(dashboard);
  const selectedStudents = getSelectedStudentsReport(dashboard);
  const selectedTutors = getSelectedTutorsReport(dashboard);

  if (selectedYears.length === 0 || selectedMonths.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ กรุณาเลือกปีและเดือนก่อน');
    return;
  }

  // Filter data (ใช้ฟังก์ชันจาก utils shared.gs)
  let filteredData = filterDataByYearMonth(rawData, selectedYears, selectedMonths);
  filteredData = filterDataByPeriodOnly(filteredData, selectedPeriods);

  // Filter by students
  if (selectedStudents.length > 0) {
    filteredData = filteredData.filter(row => selectedStudents.includes(String(row[5])));
  }

  // Filter by tutors (ใช้ Line ID)
  if (selectedTutors.length > 0) {
    filteredData = filteredData.filter(row => {
      const lineId = String(row[4]).trim();  // Column E: Line ID
      return selectedTutors.includes(lineId);
    });
  }

  if (filteredData.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ ไม่พบข้อมูลตามเงื่อนไขที่เลือก');
    return;
  }

  // Load TutorDB (ใช้ฟังก์ชันจาก utils shared.gs)
  const tutorLookup = loadTutorDB();

  // อัพเดต Display Name ใน TutorDB ถ้ามีการเปลี่ยนแปลง
  const tutorLineIdMap = getTutorLineIdMap(filteredData);
  updateTutorDisplayNames(tutorLineIdMap);

  // Group by Tutor
  const { summary, dataMap } = groupByTutor(filteredData, tutorLookup);

  // Clear old data
  clearReportData(dashboard);

  // Display Tutor Details (ไม่มี Summary Cards แล้ว)
  displayTutorReport(dashboard, dataMap);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ รายงานติวเตอร์สำเร็จ!\n\n' +
    'ติวเตอร์: ' + dataMap.size + ' คน\n' +
    'ข้อมูล: ' + filteredData.length + ' รายการ\n' +
    'ยอดเงินรวม: ' + summary.totalAmount.toLocaleString() + ' บาท',
    '✅ สำเร็จ',
    5
  );
}

// ============================================================
// 📊 GROUP BY STUDENT
// ============================================================
function groupByStudent(filteredData) {
  const studentMap = new Map();

  filteredData.forEach(row => {
    const student = row[5];
    const tutor = row[3];
    const date = row[6];
    const time = row[7];
    const book = row[8];
    const topic = row[9];
    const totalHours = parseFloat(row[10]) || 0;
    const remaining = parseFloat(row[11]) || 0;
    const feedback = row[12];
    const duration = parseFloat(row[14]) || 0;

    if (!student) return;

    if (!studentMap.has(student)) {
      studentMap.set(student, {
        name: student,
        totalHours: totalHours,
        sessions: [],
        tutors: new Set(),
        books: new Map()  // เพิ่ม: เก็บข้อมูลแต่ละวิชา (Book)
      });
    }

    const data = studentMap.get(student);
    data.tutors.add(tutor);

    // เก็บข้อมูล Book แยกตาม remaining ล่าสุด
    if (!data.books.has(book)) {
      data.books.set(book, { remaining: remaining });
    } else {
      // อัพเดต remaining ถ้าเป็นค่าล่าสุด (น้อยกว่าหรือเท่ากับ 0)
      const currentBook = data.books.get(book);
      if (remaining <= currentBook.remaining) {
        currentBook.remaining = remaining;
      }
    }

    data.sessions.push({
      date: date,
      time: time,
      tutor: tutor,
      duration: duration,
      remaining: remaining,
      book: book,
      topic: topic,
      feedback: feedback,
      status: remaining === 0 ? '✅' : '⏳'
    });
  });

  // Sort & Calculate
  const summary = {
    totalHours: 0,
    totalRemaining: 0,
    totalCount: studentMap.size,
    completedCourses: 0
  };

  studentMap.forEach((data, student) => {
    // Sort sessions (วันที่ใหม่ → เก่า)
    data.sessions.sort((a, b) => {
      const dateA = parseDateValue(a.date);
      const dateB = parseDateValue(b.date);
      return dateB - dateA;
    });

    // Calculate
    data.usedHours = data.sessions.reduce((sum, s) => sum + s.duration, 0);
    const lastSession = data.sessions[data.sessions.length - 1];
    data.remainingHours = lastSession ? lastSession.remaining : 0;
    data.isCompleted = data.remainingHours === 0;

    // คำนวณจำนวนคอร์ส (Book)
    data.totalCourses = data.books.size;  // จำนวนคอร์สทั้งหมด = จำนวน Book ที่ไม่ซ้ำ
    data.completedCourses = Array.from(data.books.values()).filter(b => b.remaining === 0).length;  // คอร์สที่จบ = Book ที่ remaining = 0

    summary.totalHours += data.usedHours;
    summary.totalRemaining += data.remainingHours;
    if (data.isCompleted) summary.completedCourses++;
  });

  return { summary, dataMap: studentMap };
}

// ============================================================
// 📊 GROUP BY TUTOR
// ✅ Version 8.0: ใช้ Payment Rules แบบเดียวกับ Dashboard Payment
// ============================================================
function groupByTutor(filteredData, tutorLookup) {
  const tutorMap = new Map();
  const tutorLineIdMap = getTutorLineIdMap(filteredData);

  filteredData.forEach(row => {
    const displayName = row[3];  // Line Display Name
    const lineId = row[4];  // Line ID
    const student = row[5];
    const subject = row[8];  // Book/Subject
    const date = row[6];
    const time = row[7];
    const totalHours = parseFloat(row[10]) || 0;
    const remaining = parseFloat(row[11]) || 0;
    const courseType = row[13] || 'online1by1';
    const duration = parseFloat(row[14]) || 0;

    if (!lineId) return;  // ใช้ Line ID เป็นหลัก

    const lineIdStr = String(lineId).trim();

    if (!tutorMap.has(lineIdStr)) {
      const fullName = matchTutorName(displayName, lineId, tutorLookup);
      const latestInfo = tutorLineIdMap.get(lineIdStr);
      const latestDisplayName = latestInfo ? latestInfo.displayName : displayName;

      tutorMap.set(lineIdStr, {
        lineId: lineIdStr,
        displayName: latestDisplayName,  // ใช้ Display Name ล่าสุด
        fullName: fullName,
        sessions: [],
        students: new Set()
      });
    }

    const data = tutorMap.get(lineIdStr);
    data.students.add(student);

    // ✅ ใช้ Payment Rules แทนการคำนวณแบบเก่า
    // โหลด Payment Rules ของติวเตอร์คนนี้
    if (!data.tutorRules) {
      data.tutorRules = getTutorPaymentRules(lineIdStr);
    }

    // สร้าง session object สำหรับ calculatePaymentWithRules()
    const session = {
      totalHours: totalHours,
      remaining: remaining,
      courseType: courseType,
      duration: duration,
      date: date
    };

    // คำนวณเงินโดยใช้ Payment Rules
    const paymentResult = calculatePaymentWithRules(session, lineIdStr, data.tutorRules);

    data.sessions.push({
      date: date,
      time: time,
      student: student,
      subject: subject,
      duration: duration,
      totalHours: totalHours,
      remaining: remaining,
      courseType: courseType,
      amount: paymentResult.amount,
      rate: paymentResult.rate,
      shouldPay: paymentResult.shouldPay,
      status: paymentResult.shouldPay ? '✅' : '⏳'
    });
  });

  // Sort & Calculate
  const summary = {
    totalHours: 0,
    totalAmount: 0,
    totalCount: tutorMap.size,
    completedCourses: 0
  };

  tutorMap.forEach((data, tutor) => {
    // Sort sessions (วันที่ใหม่ → เก่า)
    data.sessions.sort((a, b) => {
      const dateA = parseDateValue(a.date);
      const dateB = parseDateValue(b.date);
      return dateB - dateA;
    });

    // Calculate
    data.totalDuration = data.sessions.reduce((sum, s) => sum + s.duration, 0);
    data.totalAmount = data.sessions.reduce((sum, s) => sum + s.amount, 0);
    data.completedCount = data.sessions.filter(s => s.status === '✅').length;

    summary.totalHours += data.totalDuration;
    summary.totalAmount += data.totalAmount;
    summary.completedCourses += data.completedCount;
  });

  return { summary, dataMap: tutorMap };
}

// ============================================================
// 🔍 FIND TABLE HEADER ROW (Dynamic)
// ============================================================
function findTableHeaderRow(dashboard) {
  // ค้นหาแถวสุดท้ายของ tutor section
  for (let row = 8; row <= 40; row++) {
    const value = dashboard.getRange(row, 1).getValue();
    if (String(value).includes('👨‍🏫 ติวเตอร์')) {
      // หาแถวสุดท้ายของ tutor section
      for (let checkRow = row + 1; checkRow <= row + 10; checkRow++) {
        const nextValue = dashboard.getRange(checkRow + 1, 1).getValue();
        if (!nextValue || String(nextValue).trim() === '') {
          return checkRow + 1;  // คืนแถวถัดจาก tutor section
        }
      }
    }
  }
  return 16;  // Default fallback
}

// ============================================================
// 🔍 FIND SUMMARY CARD ROW (Dynamic)
// ============================================================
function findSummaryCardRow(dashboard) {
  // ค้นหาแถวที่มี summary card labels
  for (let row = 15; row <= 40; row++) {
    const value = dashboard.getRange(row, 1).getValue();
    if (String(value).includes('รวมชั่วโมง')) {
      return row;
    }
  }
  return 20;  // Default fallback
}

// ============================================================
// 🗑️ CLEAR REPORT DATA
// ============================================================
function clearReportData(dashboard) {
  const tableHeaderRow = findTableHeaderRow(dashboard);
  const lastRow = dashboard.getLastRow();

  if (lastRow > tableHeaderRow) {
    dashboard.getRange(tableHeaderRow + 1, 1, lastRow - tableHeaderRow, 13).clearContent().clearFormat();
  }
}

// ============================================================
// 📊 UPDATE SUMMARY CARDS - STUDENT
// ============================================================
function updateSummaryCardsStudent(dashboard, summary) {
  const summaryCardRow = findSummaryCardRow(dashboard);

  // Update labels (A-C, D-F, G-I, J-M)
  dashboard.getRange(summaryCardRow, 1, 1, 3).merge().setValue('📚 รวมชั่วโมง').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(summaryCardRow, 4, 1, 3).merge().setValue('⏳ คงเหลือ').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(summaryCardRow, 7, 1, 3).merge().setValue('👥 นักเรียน').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(summaryCardRow, 10, 1, 4).merge().setValue('✅ คอร์สจบ').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);

  // Update values
  dashboard.getRange(summaryCardRow + 1, 1, 1, 3).merge().setValue(summary.totalHours.toFixed(1)).setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(summaryCardRow + 1, 4, 1, 3).merge().setValue(summary.totalRemaining.toFixed(1) + ' ชม.').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(summaryCardRow + 1, 7, 1, 3).merge().setValue(summary.totalCount + ' คน').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(summaryCardRow + 1, 10, 1, 4).merge().setValue(summary.completedCourses + ' คอร์ส').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
}

// ============================================================
// 📊 UPDATE SUMMARY CARDS - TUTOR
// ============================================================
function updateSummaryCardsTutor(dashboard, summary) {
  const summaryCardRow = findSummaryCardRow(dashboard);

  // Update labels (A-C, D-F, G-I, J-M)
  dashboard.getRange(summaryCardRow, 1, 1, 3).merge().setValue('📚 รวมชั่วโมง').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(summaryCardRow, 4, 1, 3).merge().setValue('💰 ยอดเงิน').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(summaryCardRow, 7, 1, 3).merge().setValue('👨‍🏫 ติวเตอร์').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(summaryCardRow, 10, 1, 4).merge().setValue('✅ คอร์สจบ').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);

  // Update values
  dashboard.getRange(summaryCardRow + 1, 1, 1, 3).merge().setValue(summary.totalHours.toFixed(1)).setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(summaryCardRow + 1, 4, 1, 3).merge().setValue(summary.totalAmount.toLocaleString() + ' บาท').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(summaryCardRow + 1, 7, 1, 3).merge().setValue(summary.totalCount + ' คน').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(summaryCardRow + 1, 10, 1, 4).merge().setValue(summary.completedCourses + ' คอร์ส').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
}

// ============================================================
// 📚 DISPLAY STUDENT REPORT
// ============================================================
function displayStudentReport(dashboard, studentMap) {
  const dataStartRow = findTableHeaderRow(dashboard);
  let currentRow = dataStartRow;

  // Get period range from filters
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboardSheet = ss.getSheetByName(REPORT_CONFIG.DASHBOARD_SHEET);
  const selectedYears = getSelectedYearsReport(dashboardSheet);
  const selectedMonths = getSelectedMonthsReport(dashboardSheet);
  const selectedPeriods = getSelectedPeriodsReport(dashboardSheet);

  // Format period string
  let periodText = '';
  let periodShort = '';
  if (selectedYears.length > 0 && selectedMonths.length > 0) {
    const monthNames = selectedMonths.map(m => SHARED_CONFIG.MONTH_SHORT[m]).join(', ');
    const yearText = selectedYears.join(', ');
    periodText = `${monthNames} ${yearText}`;
  }

  // Format period range (1-15, 16-31, or 1-31)
  if (selectedPeriods.length === 0) {
    periodShort = '1-31';
  } else if (selectedPeriods.length === 2) {
    periodShort = '1-31';
  } else {
    periodShort = selectedPeriods[0];
  }

  // Sort students A-Z
  const sortedStudents = Array.from(studentMap.keys()).sort((a, b) =>
    a.localeCompare(b, 'th')
  );

  sortedStudents.forEach((student, index) => {
    const data = studentMap.get(student);

    // Student Header (แบบใหม่)
    const headerText = `👤 ${student} | ${periodText} | ${periodShort} | คอร์ส: ${data.completedCourses}/${data.totalCourses} | 📚 ชม.รวม: ${data.totalHours} | ✅ ใช้ไป: ${data.usedHours.toFixed(1)} | ⏳ คงเหลือ: ${data.remainingHours.toFixed(1)}`;

    dashboard.getRange(currentRow, 1, 1, 13).merge()
      .setValue(headerText)
      .setFontSize(10)
      .setFontWeight('bold')
      .setHorizontalAlignment('left')
      .setBackground(REPORT_CONFIG.COLORS.studentHeader);
    dashboard.setRowHeight(currentRow, 28);
    currentRow++;

    // Table Headers
    const headers = ['วันที่', 'เวลา', 'ติวเตอร์', 'ชม.', 'คงเหลือ', 'Book', 'Topic', '', '', '', '', '', 'Status'];

    dashboard.getRange(currentRow, 1, 1, 13)
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(8)
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    // Merge H-L for "Feedback"
    dashboard.getRange(currentRow, 8, 1, 5).merge()
      .setValue('Feedback')
      .setFontWeight('bold')
      .setFontSize(8)
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    dashboard.setRowHeight(currentRow, 22);
    currentRow++;

    // Sessions
    data.sessions.forEach(session => {
      const dateStr = formatDateString(session.date);

      const rowData = [
        dateStr,
        session.time || '',
        session.tutor || '',
        session.duration,
        session.remaining,
        session.book || '',
        session.topic || '',
        '', '', '', '', '',  // H-L for Feedback (will merge)
        session.status       // M: Status
      ];

      dashboard.getRange(currentRow, 1, 1, 13).setValues([rowData]);

      // Merge H-L for Feedback
      dashboard.getRange(currentRow, 8, 1, 5).merge()
        .setValue(session.feedback || '')
        .setFontSize(7)
        .setWrap(true)
        .setVerticalAlignment('top')
        .setHorizontalAlignment('left');

      dashboard.getRange(currentRow, 4).setNumberFormat('#,##0.0');
      dashboard.getRange(currentRow, 5).setNumberFormat('#,##0.0');
      dashboard.getRange(currentRow, 1, 1, 13).setFontSize(8);

      // Conditional Formatting for Status (Column M)
      if (session.status === '✅') {
        dashboard.getRange(currentRow, 13).setBackground(REPORT_CONFIG.COLORS.statusOK);
      } else {
        dashboard.getRange(currentRow, 13).setBackground(REPORT_CONFIG.COLORS.statusPending);
      }

      currentRow++;
    });

    // Separator
    currentRow++;
  });
}

// ============================================================
// 👨‍🏫 DISPLAY TUTOR REPORT
// ============================================================
function displayTutorReport(dashboard, tutorMap) {
  const dataStartRow = findTableHeaderRow(dashboard);
  let currentRow = dataStartRow;

  // Sort tutors A-Z
  const sortedTutors = Array.from(tutorMap.keys()).sort((a, b) =>
    a.localeCompare(b, 'th')
  );

  // ============================================================
  // 📊 SUMMARY TABLE - ตารางสรุปยอดชำระเงินติวเตอร์
  // ============================================================

  // Summary Table Title
  dashboard.getRange(currentRow, 1, 1, 13).merge()
    .setValue('💰 ตารางสรุปยอดชำระเงินติวเตอร์')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#1a73e8')
    .setFontColor('#ffffff');
  dashboard.setRowHeight(currentRow, 35);
  currentRow++;

  // Summary Table Headers
  const summaryHeaders = ['#', 'รอบวันที่', 'Display Name', 'ชื่อจริง', 'ชม.รวม', 'ยอดเงิน (บาท)', '', '', '', '', '', '', ''];
  dashboard.getRange(currentRow, 1, 1, 13)
    .setValues([summaryHeaders])
    .setFontWeight('bold')
    .setFontSize(9)
    .setHorizontalAlignment('center')
    .setBackground('#4285f4')
    .setFontColor('#ffffff');

  // Merge F-M for "ยอดเงิน (บาท)"
  dashboard.getRange(currentRow, 6, 1, 8).merge()
    .setValue('ยอดเงิน (บาท)')
    .setFontWeight('bold')
    .setFontSize(9)
    .setHorizontalAlignment('center')
    .setBackground('#4285f4')
    .setFontColor('#ffffff');

  dashboard.setRowHeight(currentRow, 25);
  currentRow++;

  // Get period range from filters
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboardSheet = ss.getSheetByName(REPORT_CONFIG.DASHBOARD_SHEET);
  const selectedYears = getSelectedYearsReport(dashboardSheet);
  const selectedMonths = getSelectedMonthsReport(dashboardSheet);
  const selectedPeriods = getSelectedPeriodsReport(dashboardSheet);

  // Format period string
  let periodText = '';
  if (selectedYears.length > 0 && selectedMonths.length > 0) {
    const monthNames = selectedMonths.map(m => SHARED_CONFIG.MONTH_SHORT[m]).join(', ');
    const yearText = selectedYears.join(', ');
    periodText = `${monthNames} ${yearText}`;
    if (selectedPeriods.length > 0 && selectedPeriods.length < 2) {
      periodText += ` (${selectedPeriods[0] === 1 ? '1-15' : '16-31'})`;
    }
  }

  // Summary Table Rows
  sortedTutors.forEach((tutor, index) => {
    const data = tutorMap.get(tutor);

    const summaryRowData = [
      index + 1,                          // #
      periodText,                         // รอบวันที่
      data.displayName,                   // Display Name
      data.fullName,                      // ชื่อจริง
      data.totalDuration.toFixed(1),      // ชม.รวม
      '', '', '', '', '', '', '', ''      // F-M for ยอดเงิน (will merge)
    ];

    dashboard.getRange(currentRow, 1, 1, 13).setValues([summaryRowData]);

    // Format columns
    dashboard.getRange(currentRow, 1).setHorizontalAlignment('center').setFontSize(8);      // #
    dashboard.getRange(currentRow, 2).setHorizontalAlignment('center').setFontSize(8);      // รอบวันที่
    dashboard.getRange(currentRow, 3).setHorizontalAlignment('left').setFontSize(8);        // Display Name
    dashboard.getRange(currentRow, 4).setHorizontalAlignment('left').setFontSize(8);        // ชื่อจริง
    dashboard.getRange(currentRow, 5).setHorizontalAlignment('center').setFontSize(8).setNumberFormat('#,##0.0');  // ชม.รวม

    // Merge F-M for ยอดเงิน
    dashboard.getRange(currentRow, 6, 1, 8).merge()
      .setValue(data.totalAmount)
      .setNumberFormat('#,##0')
      .setFontSize(9)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    // Alternating row colors
    const bgColor = index % 2 === 0 ? '#e8f0fe' : '#ffffff';
    dashboard.getRange(currentRow, 1, 1, 13).setBackground(bgColor);

    // Border
    dashboard.getRange(currentRow, 1, 1, 13).setBorder(
      true, true, true, true, true, true,
      '#cccccc',
      SpreadsheetApp.BorderStyle.SOLID
    );

    dashboard.setRowHeight(currentRow, 24);
    currentRow++;
  });

  // Total Row
  const totalHours = Array.from(tutorMap.values()).reduce((sum, data) => sum + data.totalDuration, 0);
  const totalAmount = Array.from(tutorMap.values()).reduce((sum, data) => sum + data.totalAmount, 0);

  const totalRowData = [
    '', '', '', 'รวมทั้งหมด', totalHours.toFixed(1), '', '', '', '', '', '', '', ''
  ];

  dashboard.getRange(currentRow, 1, 1, 13).setValues([totalRowData]);
  dashboard.getRange(currentRow, 4).setHorizontalAlignment('right').setFontWeight('bold').setFontSize(9);
  dashboard.getRange(currentRow, 5).setHorizontalAlignment('center').setFontWeight('bold').setFontSize(9).setNumberFormat('#,##0.0');

  dashboard.getRange(currentRow, 6, 1, 8).merge()
    .setValue(totalAmount)
    .setNumberFormat('#,##0')
    .setFontSize(10)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  dashboard.getRange(currentRow, 1, 1, 13)
    .setBackground('#fef7e0')
    .setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  dashboard.setRowHeight(currentRow, 28);
  currentRow += 2;  // เว้น 1 แถว

  // ============================================================
  // 📋 DETAILED REPORT - รายละเอียดแต่ละติวเตอร์
  // ============================================================

  // Details Section Title
  dashboard.getRange(currentRow, 1, 1, 13).merge()
    .setValue('📋 รายละเอียดการสอนแต่ละติวเตอร์')
    .setFontSize(11)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#34a853')
    .setFontColor('#ffffff');
  dashboard.setRowHeight(currentRow, 32);
  currentRow++;  // ไม่เว้นบรรทัด

  sortedTutors.forEach((tutor, index) => {
    const data = tutorMap.get(tutor);

    // Tutor Header
    const headerText = `👨‍🏫 ${data.displayName} (${data.fullName}) | 📚 ชม.รวม: ${data.totalDuration.toFixed(1)} | 💰 ยอดเงิน: ${data.totalAmount.toLocaleString()} บาท`;

    dashboard.getRange(currentRow, 1, 1, 13).merge()
      .setValue(headerText)
      .setFontSize(10)
      .setFontWeight('bold')
      .setHorizontalAlignment('left')
      .setBackground(REPORT_CONFIG.COLORS.tutorHeader);
    dashboard.setRowHeight(currentRow, 28);
    currentRow++;

    // Table Headers (Version 8.0: เพิ่มคอลัมน์ยอดเงิน)
    const headers = ['วันที่', 'เวลา', 'นักเรียน', 'วิชา', 'CourseType', 'ชม.', '', '', 'Status', '', '', ''];

    dashboard.getRange(currentRow, 1, 1, 13)
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(8)
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    // Merge G-H for "ยอดเงิน"
    dashboard.getRange(currentRow, 7, 1, 2).merge()
      .setValue('ยอดเงิน')
      .setFontWeight('bold')
      .setFontSize(8)
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    // Merge J-M for "หมายเหตุ"
    dashboard.getRange(currentRow, 10, 1, 4).merge()
      .setValue('หมายเหตุ')
      .setFontWeight('bold')
      .setFontSize(8)
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    dashboard.setRowHeight(currentRow, 22);
    currentRow++;

    // Sessions (Version 8.0: เพิ่มวิชา และยอดเงิน)
    data.sessions.forEach(session => {
      const dateStr = formatDateString(session.date);

      const rowData = [
        dateStr,                    // A: วันที่
        session.time || '',         // B: เวลา
        session.student || '',      // C: นักเรียน
        session.subject || '',      // D: วิชา
        session.courseType || '',   // E: CourseType
        session.duration,           // F: ชม.
        '', '',                     // G-H: ยอดเงิน (will merge)
        session.status,             // I: Status
        '', '', '', ''              // J-M: หมายเหตุ (will merge)
      ];

      dashboard.getRange(currentRow, 1, 1, 13).setValues([rowData]);

      // Merge G-H for ยอดเงิน
      dashboard.getRange(currentRow, 7, 1, 2).merge()
        .setValue(session.amount)
        .setNumberFormat('#,##0')
        .setFontSize(8)
        .setHorizontalAlignment('center');

      // Merge J-M for หมายเหตุ (ว่างไว้ให้กรอก)
      dashboard.getRange(currentRow, 10, 1, 4).merge()
        .setValue('')
        .setFontSize(8)
        .setHorizontalAlignment('left');

      dashboard.getRange(currentRow, 6).setNumberFormat('#,##0.0');  // ชม.
      dashboard.getRange(currentRow, 1, 1, 13).setFontSize(8);

      // Conditional Formatting for Status (Column I)
      if (session.status === '✅') {
        dashboard.getRange(currentRow, 9).setBackground(REPORT_CONFIG.COLORS.statusOK);
      } else {
        dashboard.getRange(currentRow, 9).setBackground(REPORT_CONFIG.COLORS.statusPending);
      }

      currentRow++;
    });

    // Separator
    currentRow++;
  });
}

// ============================================================
// 📊 DASHBOARD REPORT - VERSION 8.3
// ✅ Filter ใช้ร่วมกัน (ปี, เดือน, รอบ, นักเรียน, ติวเตอร์)
// ✅ 2 ปุ่ม: รายงานนักเรียน + รายงานติวเตอร์
// ✅ Compact Layout (~17 Rows)
// ✅ ใช้ Shared Config และ Utils
// 🆕 Version 8.0 Changes:
//    - displayTutorReport() ใช้ Payment Rules (เหมือน Dashboard Payment)
//    - เพิ่มคอลัมน์ยอดเงิน ในรายงานติวเตอร์
//    - แก้ไขกรอบยอดรวม (SOLID_MEDIUM → SOLID)
//    - แก้ไข layout calculation ป้องกันหัวตารางทับ checkbox
// 🆕 Version 8.1 Changes:
//    - ขยายทุกส่วนเป็น 14 columns (A-N)
//    - เพิ่ม checkbox "ทั้งหมด" สำหรับ ปี, รอบ, เดือน
//    - แก้ไข tutor header ไม่ให้ซ้ำข้อมูล "(X คน)"
//    - ตารางสรุปติวเตอร์ใช้ layout เหมือน Dashboard Payment
// 🆕 Version 8.2 Changes:
//    - Compact layout: ลบ rows ที่ไม่จำเป็น
//    - แก้ไข payment calculation ให้ถูกต้อง (overlapping + onsiteDay per day)
//    - แก้ไข layout calculation + merge cells ในตารางสรุป
// 🆕 Version 8.3 Changes:
//    - ย้าย tutor mapping จาก Z1 → AA1
//    - ตั้งค่าสีฟอนต์เป็นสีขาวเพื่อซ่อนข้อมูล mapping (ไม่ให้ติดมาตอนปริ้น)
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
  dashboard.getRange('A1:N1').merge()
    .setValue('📊 Dashboard Report - รายงานการเรียน')
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground(REPORT_CONFIG.COLORS.header)
    .setFontColor('#ffffff');
  dashboard.setRowHeight(1, 45);

  // ============================================================
  // ROW 2: ปี + รอบ (แนวนอน 1 แถว) + checkbox "ทั้งหมด"
  // ============================================================
  // ปี
  dashboard.getRange('A2').setValue('📅 ปี').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('B2').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('C2').setValue('ทั้งหมด').setHorizontalAlignment('center').setFontSize(8).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('D2').setValue('2025').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('E2').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('F2').setValue('2026').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('G2').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);

  // รอบ
  dashboard.getRange('H2').setValue('📅 รอบ').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('I2').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('J2').setValue('ทั้งหมด').setHorizontalAlignment('center').setFontSize(8).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('K2').setValue('1-15').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('L2').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('M2').setValue('16-31').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('N2').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod).setVerticalAlignment('middle').setWrap(true);

  dashboard.setRowHeight(2, 30);
  dashboard.getRange('A2:N2').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 3-4: เดือน + checkbox "ทั้งหมด"
  // ============================================================
  // A3-A4: ไอคอนปฏิทิน
  dashboard.getRange('A3').setValue('📅').setFontSize(14).setBackground(REPORT_CONFIG.COLORS.month).setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('A4').setValue('').setBackground(REPORT_CONFIG.COLORS.month).setVerticalAlignment('middle').setWrap(true);

  // B3: Label "ทั้งหมด"
  dashboard.getRange('B3').setValue('ทั้งหมด').setHorizontalAlignment('center').setFontSize(8).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.month).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('B4').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.month).setVerticalAlignment('middle').setWrap(true);  // Checkbox "ทั้งหมด"

  // Row 3: ชื่อเดือน (C3-N3 = 12 เดือน)
  SHARED_CONFIG.MONTH_SHORT.forEach((month, index) => {
    dashboard.getRange(3, index + 3)  // C3-N3
      .setValue(month)
      .setHorizontalAlignment('center')
      .setFontSize(8)
      .setBackground(REPORT_CONFIG.COLORS.month)
      .setVerticalAlignment('middle')
      .setWrap(true);
  });

  // Row 4: Checkbox เดือน (C4-N4 = 12 เดือน)
  for (let i = 0; i < 12; i++) {
    dashboard.getRange(4, i + 3)  // C4-N4
      .insertCheckboxes()
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.month)
      .setVerticalAlignment('middle')
      .setWrap(true);
  }

  dashboard.setRowHeight(3, 22);
  dashboard.setRowHeight(4, 25);
  dashboard.getRange('A3:N4').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 5: นักเรียน Header
  // ============================================================
  dashboard.getRange('A5').setValue('👤 นักเรียน').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.student).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('B5').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.student).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('C5').setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.student).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('D5').setValue('(กด Menu "อัพเดต" เพื่อโหลดรายชื่อ)').setFontSize(8).setFontColor('#999999').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.student).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('E5:N5').setBackground(REPORT_CONFIG.COLORS.student).setVerticalAlignment('middle').setWrap(true);
  dashboard.setRowHeight(5, 25);

  // ROW 6-7: Placeholder นักเรียน (Label + Checkbox)
  dashboard.getRange('A6:N6').setBackground('#fffde7').setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('A7:N7').setBackground('#fffde7').setVerticalAlignment('middle').setWrap(true);
  dashboard.setRowHeight(6, 20);
  dashboard.setRowHeight(7, 22);
  dashboard.getRange('A5:N7').setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 8: ติวเตอร์ Header
  // ============================================================
  dashboard.getRange('A8').setValue('👨‍🏫 ติวเตอร์').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.tutor).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('B8').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.tutor).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('C8').setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.tutor).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('D8').setValue('(กด Menu "อัพเดต" เพื่อโหลดรายชื่อ)').setFontSize(8).setFontColor('#999999').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.tutor).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('E8:N8').setBackground(REPORT_CONFIG.COLORS.tutor).setVerticalAlignment('middle').setWrap(true);
  dashboard.setRowHeight(8, 25);

  // ROW 9-10: Placeholder ติวเตอร์ (Label + Checkbox)
  dashboard.getRange('A9:N9').setBackground('#e8f5e9').setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('A10:N10').setBackground('#e8f5e9').setVerticalAlignment('middle').setWrap(true);
  dashboard.setRowHeight(9, 20);
  dashboard.setRowHeight(10, 22);
  dashboard.getRange('A8:N10').setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 16+: ปุ่มรายงาน, Summary Cards, Table Header
  // ============================================================
  // NOTE: จะถูกสร้างใน updateReportCheckboxes() แบบ dynamic
  // เพื่อไม่ให้ถูกทับโดย checkbox sections

  // ============================================================
  // COLUMN WIDTHS (ขยายเป็น 14 columns)
  // ============================================================
  dashboard.setColumnWidth(1, 90);   // A
  for (let i = 2; i <= 14; i++) {
    dashboard.setColumnWidth(i, 65);  // B-N
  }

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

  // Display Student Checkboxes (Row 6-7, updated from 10-11)
  const studentRowsUsed = displayCheckboxRow(dashboard, students, 6, 7, '#fffde7');

  // Calculate tutor start row (หลังจากนักเรียน - ไม่มี gap)
  const tutorStartRow = 6 + studentRowsUsed;

  // Setup Tutor Header ใหม่
  dashboard.getRange(tutorStartRow, 1).setValue('👨‍🏫 ติวเตอร์').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.tutor).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange(tutorStartRow, 2).insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.tutor).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange(tutorStartRow, 3).setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.tutor).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange(tutorStartRow, 4).setValue('(' + tutors.length + ' คน)').setFontSize(8).setFontColor('#666666').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.tutor).setVerticalAlignment('middle').setWrap(true);  // แก้: ไม่ใช้ range 1,10
  dashboard.getRange(tutorStartRow, 5, 1, 10).setValue('').setBackground(REPORT_CONFIG.COLORS.tutor).setVerticalAlignment('middle').setWrap(true);  // เคลียร์ E-N
  dashboard.setRowHeight(tutorStartRow, 25);

  // Display Tutor Checkboxes
  const tutorRowsUsed = displayCheckboxRow(dashboard, tutors, tutorStartRow + 1, tutorStartRow + 2, '#e8f5e9');

  // Border for tutor section (14 columns, changed from 13)
  const tutorEndRow = tutorStartRow + tutorRowsUsed;
  dashboard.getRange(tutorStartRow, 1, tutorRowsUsed + 1, 14).setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // Debug log เพื่อตรวจสอบ layout
  Logger.log(`🔍 Layout Check: student section ends at row ${6 + studentRowsUsed - 1}, tutor starts at ${tutorStartRow}, tutor ends at ${tutorEndRow}`);

  // Update student header (Row 5, updated from row 9)
  dashboard.getRange('A5').setValue('👤 นักเรียน').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.student).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('B5').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.student).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('C5').setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.student).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('D5').setValue('(' + students.length + ' คน)').setFontSize(8).setFontColor('#666666').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.student).setVerticalAlignment('middle').setWrap(true);
  dashboard.getRange('E5:N5').setValue('').setBackground(REPORT_CONFIG.COLORS.student).setVerticalAlignment('middle').setWrap(true);  // เคลียร์ E5:N5 (updated from E9:N9)

  // Border for student section (14 columns, updated from row 9)
  const studentEndRow = 6 + studentRowsUsed - 1;
  dashboard.getRange(5, 1, studentRowsUsed + 1, 14).setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // DYNAMIC LAYOUT: ลบปุ่มรายงานและ Summary Cards (ไม่ใช้แล้ว)
  // ============================================================
  const dataStartRow = tutorEndRow + 2;  // 2 แถวว่างหลัง tutor section

  // Clear old dynamic sections (ล้างแถว dataStartRow เป็นต้นไป)
  const maxClearRow = 50;
  if (dataStartRow < maxClearRow) {
    dashboard.getRange(dataStartRow, 1, maxClearRow - dataStartRow + 1, 14).clearContent().clearFormat();
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
// รองรับ 14 คน/แถว (A-N), ถ้ามากกว่า 14 ให้เพิ่มอีก 2 แถว
// Return: จำนวนแถวที่ใช้ (label + checkbox rows)
// ============================================================
function displayCheckboxRow(dashboard, items, labelRow, checkboxRow, bgColor) {
  const maxPerRow = 14;  // A-N = 14 คอลัม (changed from 13)
  const maxRows = 3;     // รองรับสูงสุด 3 แถว (14+14+14 = 42 คน)

  // Calculate rows needed
  const rowsNeeded = Math.min(Math.ceil(items.length / maxPerRow), maxRows);

  // Clear old data (clear up to 6 rows: 3 label rows + 3 checkbox rows)
  for (let r = 0; r < maxRows * 2; r++) {
    dashboard.getRange(labelRow + r, 1, 1, 14).clearContent().clearDataValidations();
    dashboard.getRange(labelRow + r, 1, 1, 14).setBackground(bgColor);
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
        .setBackground(bgColor)
        .setVerticalAlignment('middle')
        .setWrap(true);
    }

    // Display checkboxes
    for (let col = 0; col < itemsInThisRow; col++) {
      dashboard.getRange(currentRow + 1, col + 1)
        .insertCheckboxes()
        .setHorizontalAlignment('center')
        .setBackground(bgColor)
        .setVerticalAlignment('middle')
        .setWrap(true);
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

  // Check "ทั้งหมด" checkbox at B2 (updated from B3)
  if (dashboard.getRange('B2').getValue() === true) {
    return [2025, 2026];  // Return all years
  }

  // 2025: E2 (updated from E3)
  if (dashboard.getRange('E2').getValue() === true) {
    years.push(2025);
  }

  // 2026: G2 (updated from G3)
  if (dashboard.getRange('G2').getValue() === true) {
    years.push(2026);
  }

  return years;
}

// ============================================================
// 📅 GET SELECTED MONTHS
// ============================================================
function getSelectedMonthsReport(dashboard) {
  const months = [];

  // Check "ทั้งหมด" checkbox at B4 (moved from A4)
  if (dashboard.getRange('B4').getValue() === true) {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];  // Return all months
  }

  // C4-N4 = เดือน 0-11 (updated from C6-N6)
  for (let i = 0; i < 12; i++) {
    if (dashboard.getRange(4, i + 3).getValue() === true) {
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

  // Check "ทั้งหมด" checkbox at I2 (updated from I3)
  if (dashboard.getRange('I2').getValue() === true) {
    return ['1-15', '16-31'];  // Return all periods
  }

  // 1-15: L2 (updated from L3)
  if (dashboard.getRange('L2').getValue() === true) {
    periods.push('1-15');
  }

  // 16-31: N2 (updated from N3)
  if (dashboard.getRange('N2').getValue() === true) {
    periods.push('16-31');
  }

  return periods;
}

// ============================================================
// 👤 GET SELECTED STUDENTS
// ============================================================
function getSelectedStudentsReport(dashboard) {
  // Check "ทั้งหมด" at B5 (updated from B9)
  if (dashboard.getRange('B5').getValue() === true) {
    return [];
  }

  const selected = [];
  const maxRows = 3;  // รองรับ 3 แถว (Row 6-7, 8-9, 10-11)

  for (let rowGroup = 0; rowGroup < maxRows; rowGroup++) {
    const labelRow = 6 + (rowGroup * 2);  // Updated from 10 to 6
    const checkRow = labelRow + 1;

    const labels = dashboard.getRange(labelRow, 1, 1, 14).getValues()[0];  // A-N (changed from 13 to 14)
    const checks = dashboard.getRange(checkRow, 1, 1, 14).getValues()[0];

    for (let i = 0; i < 14; i++) {  // Changed from 13 to 14
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
  // เก็บใน cell N5 (แถว student checkbox) และตั้งค่าสีฟอนต์เป็นสีขาว
  dashboard.getRange('N5')
    .setValue(JSON.stringify(mapping))
    .setFontColor('#ffffff');
}

function loadTutorDisplayToLineIdMappingReport(dashboard) {
  const jsonString = dashboard.getRange('N5').getValue();
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
  let tutorHeaderRow = 8;  // Default (updated from 13 to 8)
  for (let row = 5; row <= 30; row++) {  // Updated from 9 to 5
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

    const labels = dashboard.getRange(labelRow, 1, 1, 14).getValues()[0];  // A-N (changed from 13 to 14)
    const checks = dashboard.getRange(checkRow, 1, 1, 14).getValues()[0];

    for (let i = 0; i < 14; i++) {  // Changed from 13 to 14
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

  // ============================================================
  // Step 1: Group sessions by tutor → student (like Dashboard Payment)
  // ============================================================
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
        students: new Map(),  // Changed to Map for student grouping
        sessions: [],
        tutorRules: null  // เพิ่ม: เก็บ Payment Rules
      });
    }

    const tutorData = tutorMap.get(lineIdStr);

    // ประมวลผล Payment Conditions ก่อน Grouping (เหมือน Dashboard Payment)
    let effectiveCourseType = courseType;

    // โหลด Payment Rules ชั่วคราวเพื่อเช็ค conditions
    if (!tutorData.tutorRules) {
      tutorData.tutorRules = getTutorPaymentRules(lineIdStr);
    }

    const rules = tutorData.tutorRules.get(courseType);
    if (rules && rules.conditions) {
      const tempSession = {
        date: date,
        courseType: courseType
      };
      const conditionResult = applyPaymentConditions(rules.conditions, tempSession, tutorData.tutorRules);
      if (conditionResult.switchTo) {
        effectiveCourseType = conditionResult.switchTo;
        Logger.log(`🔄 Apply condition: ${student} on ${formatDateString(date)} switched from ${courseType} to ${effectiveCourseType}`);
      }
    }

    // Group by student (ใช้ effectiveCourseType แทน courseType)
    const studentKey = `${student}|${effectiveCourseType}`;
    if (!tutorData.students.has(studentKey)) {
      tutorData.students.set(studentKey, {
        studentName: student,
        courseType: effectiveCourseType,
        sessions: [],
        durationSum: 0,
        totalHours: totalHours,
        remaining: remaining
      });
    }

    const studentData = tutorData.students.get(studentKey);
    studentData.sessions.push({
      date: date,
      time: time,
      subject: subject,
      duration: duration,
      courseType: effectiveCourseType  // ใช้ effectiveCourseType
    });
    studentData.durationSum += duration;
    studentData.remaining = remaining;
    studentData.totalHours = totalHours;
    studentData.courseType = effectiveCourseType;  // ใช้ effectiveCourseType
  });

  // ============================================================
  // Step 2: Process each tutor's data with overlapping logic
  // ============================================================
  tutorMap.forEach((tutorData, lineIdStr) => {
    // Load Payment Rules
    const tutorRules = getTutorPaymentRules(lineIdStr);

    // Find onsiteDay dates for this tutor
    const onsiteDayDates = new Set();
    tutorData.students.forEach((studentData, key) => {
      studentData.sessions.forEach(session => {
        const sessionDate = formatDateString(session.date);
        if (session.courseType === 'onsiteDay') {
          onsiteDayDates.add(sessionDate);
        }
      });
    });

    // ✅ แก้ไข: คำนวณจำนวนวันที่ต้องจ่ายเงิน onsiteDay ก่อน (จ่ายครั้งเดียวต่อวัน)
    const onsiteDayPaymentAmount = onsiteDayDates.size * 850;  // 850 บาท/วัน
    let onsiteDayAmountDistributed = 0;  // ยอดเงินที่แจกจ่ายไปแล้ว

    // Process each student course
    tutorData.students.forEach((studentData, key) => {
      const totalHours = studentData.totalHours;
      const remaining = studentData.remaining;
      const courseType = studentData.courseType;
      let durationSum = studentData.durationSum;

      // Deduct overlapping hours for online1by1/onsiteGroup with onsiteDay
      if ((courseType === 'online1by1' || courseType === 'onsiteGroup') && onsiteDayDates.size > 0) {
        let overlappingHours = 0;
        studentData.sessions.forEach(session => {
          const sessionDate = formatDateString(session.date);
          if (onsiteDayDates.has(sessionDate)) {
            overlappingHours += session.duration || 0;
          }
        });
        durationSum -= overlappingHours;
      }

      // Create session object for payment calculation
      const session = {
        totalHours: totalHours,
        remaining: remaining,
        courseType: courseType,
        duration: durationSum,  // Use adjusted durationSum
        date: studentData.sessions.length > 0 ? studentData.sessions[0].date : null
      };

      // Calculate payment
      const paymentResult = calculatePaymentWithRules(session, lineIdStr, tutorRules);

      let amount = 0;
      let shouldPay = paymentResult.shouldPay;

      if (paymentResult.shouldPay) {
        // ✅ แก้ไข: สำหรับ onsiteDay แจกจ่ายเงินให้นักเรียนคนแรก
        if (courseType === 'onsiteDay') {
          if (onsiteDayAmountDistributed === 0) {
            // นักเรียนคนแรกที่เป็น onsiteDay รับเงินทั้งหมด
            amount = onsiteDayPaymentAmount;
            onsiteDayAmountDistributed = amount;
            shouldPay = true;
            Logger.log(`  ✅ onsiteDay payment (${onsiteDayDates.size} days): ${amount} บาท for ${studentData.studentName}`);
          } else {
            // นักเรียนคนอื่นๆ แสดงว่ารวมในยอดแล้ว
            amount = 0;
            shouldPay = false;
            Logger.log(`  ⏭️  onsiteDay for ${studentData.studentName}: included in day rate`);
          }
        } else {
          amount = paymentResult.amount;
        }
      }

      // Add sessions to tutor's session list
      studentData.sessions.forEach((session, sessionIndex) => {
        tutorData.sessions.push({
          date: session.date,
          time: session.time,
          student: studentData.studentName,
          subject: session.subject,
          duration: session.duration,
          totalHours: totalHours,
          remaining: remaining,
          courseType: courseType,
          amount: sessionIndex === 0 ? amount : 0,  // แสดงยอดเงินที่ session แรกเท่านั้น
          rate: paymentResult.rate,
          shouldPay: shouldPay,
          status: shouldPay ? '✅' : '⏳',
          topic: session.subject || '',  // เก็บ topic ไว้ใช้ในหมายเหตุ
          studentTotalHours: totalHours,
          studentRemaining: remaining
        });
      });
    });
  });

  // ============================================================
  // Step 3: Sort & Calculate totals
  // ============================================================
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

    // Calculate totals
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
  for (let row = 5; row <= 40; row++) {  // Updated from row 8 to row 5
    const value = dashboard.getRange(row, 1).getValue();
    if (String(value).includes('👨‍🏫 ติวเตอร์')) {
      // หาแถวสุดท้ายของ tutor section โดยหาแถวแรกที่ว่าง
      for (let checkRow = row + 1; checkRow <= row + 15; checkRow++) {  // เพิ่ม range จาก 10 → 15
        const currentValue = dashboard.getRange(checkRow, 1).getValue();
        const nextValue = dashboard.getRange(checkRow + 1, 1).getValue();

        // ถ้าแถวปัจจุบันและแถวถัดไปว่าง = tutor section จบแล้ว
        if ((!currentValue || String(currentValue).trim() === '') &&
            (!nextValue || String(nextValue).trim() === '')) {
          return checkRow + 2;  // คืนแถวที่ห่างจากแถวว่าง 2 แถว
        }
      }
      // ถ้าไม่เจอแถวว่าง ให้คืนแถวหลัง tutor header + 10 (สำรอง)
      return row + 10;
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
    // Clear all data and formatting from table area (including Column A dates)
    dashboard.getRange(tableHeaderRow + 1, 1, lastRow - tableHeaderRow, 14).clearContent().clearFormat();

    // Additionally, explicitly clear Column A to remove any leftover dates
    dashboard.getRange(tableHeaderRow + 1, 1, lastRow - tableHeaderRow, 1).clearContent();
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

    dashboard.getRange(currentRow, 1, 1, 14).merge()
      .setValue(headerText)
      .setFontSize(10)
      .setFontWeight('bold')
      .setHorizontalAlignment('left')
      .setBackground(REPORT_CONFIG.COLORS.studentHeader);
    dashboard.setRowHeight(currentRow, 28);
    currentRow++;

    // Table Headers (14 columns: A-N)
    const headers = ['วันที่', 'เวลา', 'ติวเตอร์', 'ชม.', 'คงเหลือ', 'Book', 'Topic', '', '', '', '', '', '', 'Status'];

    dashboard.getRange(currentRow, 1, 1, 14)
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(8)
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    // Merge H-M for "Feedback" (6 columns, expanded from 5)
    dashboard.getRange(currentRow, 8, 1, 6).merge()
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
        '', '', '', '', '', '',  // H-M for Feedback (will merge, 6 columns)
        session.status           // N: Status
      ];

      dashboard.getRange(currentRow, 1, 1, 14).setValues([rowData]);

      // Set alignment for all cells: Middle + Center + Wrap
      dashboard.getRange(currentRow, 1, 1, 14)
        .setVerticalAlignment('middle')
        .setHorizontalAlignment('center')
        .setWrap(true)
        .setFontSize(8);

      // Merge H-M for Feedback (6 columns, expanded from 5)
      dashboard.getRange(currentRow, 8, 1, 6).merge()
        .setValue(session.feedback || '')
        .setFontSize(7)
        .setWrap(true)
        .setVerticalAlignment('middle')
        .setHorizontalAlignment('left');

      dashboard.getRange(currentRow, 4).setNumberFormat('#,##0.0');
      dashboard.getRange(currentRow, 5).setNumberFormat('#,##0.0');

      // Conditional Formatting for Status (Column N)
      if (session.status === '✅') {
        dashboard.getRange(currentRow, 14).setBackground(REPORT_CONFIG.COLORS.statusOK);
      } else {
        dashboard.getRange(currentRow, 14).setBackground(REPORT_CONFIG.COLORS.statusPending);
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
  // 📊 SUMMARY TABLE - ตารางสรุปยอดชำระเงินติวเตอร์ (Version 8.1: 14 columns layout)
  // ============================================================

  // Summary Table Title
  dashboard.getRange(currentRow, 1, 1, 14).merge()
    .setValue('💰 ตารางสรุปยอดชำระเงินติวเตอร์')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#1a73e8')
    .setFontColor('#ffffff');
  dashboard.setRowHeight(currentRow, 35);
  currentRow++;

  // Summary Table Headers (14 columns: A-N, same as Dashboard Payment)
  const summaryHeaders = [
    '#', 'รอบวันที่', 'รอบ', 'Display Name', '', 'ชื่อจริง', '', 'CourseType', 'รายละเอียด', '', '', '', 'ชม.รวม', 'ยอดเงิน'
  ];

  dashboard.getRange(currentRow, 1, 1, 14)
    .setValues([summaryHeaders])
    .setFontWeight('bold')
    .setFontSize(9)
    .setHorizontalAlignment('center')
    .setBackground('#4285f4')
    .setFontColor('#ffffff');

  // Merge D-E: Display Name
  dashboard.getRange(currentRow, 4, 1, 2).merge()
    .setValue('Display Name')
    .setFontWeight('bold')
    .setFontSize(9)
    .setHorizontalAlignment('center')
    .setBackground('#4285f4')
    .setFontColor('#ffffff');

  // Merge F-G: ชื่อจริง
  dashboard.getRange(currentRow, 6, 1, 2).merge()
    .setValue('ชื่อจริง')
    .setFontWeight('bold')
    .setFontSize(9)
    .setHorizontalAlignment('center')
    .setBackground('#4285f4')
    .setFontColor('#ffffff');

  // Merge I-L: รายละเอียด (4 columns)
  dashboard.getRange(currentRow, 9, 1, 4).merge()
    .setValue('รายละเอียด')
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
    periodShort = selectedPeriods[0] || '1-31';
  }

  // Summary Table Rows - จัดกลุ่มตาม courseType เหมือน Dashboard Payment
  let totalHoursOverall = 0;
  let totalAmountOverall = 0;

  sortedTutors.forEach((tutor, index) => {
    const data = tutorMap.get(tutor);

    // จัดกลุ่ม sessions ตาม courseType
    const courseTypeGroups = new Map();

    data.sessions.forEach(session => {
      const courseType = session.courseType || 'online1by1';

      if (!courseTypeGroups.has(courseType)) {
        courseTypeGroups.set(courseType, {
          sessions: [],
          totalHours: 0,
          totalAmount: 0,
          students: new Set()
        });
      }

      const group = courseTypeGroups.get(courseType);
      group.sessions.push(session);
      group.totalHours += session.duration;
      group.totalAmount += session.amount;
      group.students.add(session.student);
    });

    // สร้างข้อความสรุปรายละเอียดสำหรับแต่ละ courseType
    // ใช้ฟังก์ชันเดียวกับ Dashboard Payment
    courseTypeGroups.forEach((group, courseType) => {
      const students = Array.from(group.students);

      // แปลง sessions เป็นรูปแบบที่ createSummaryDetailsText() ต้องการ
      const studentDetails = students.map(studentName => {
        const studentSessions = group.sessions.filter(sess => sess.student === studentName);
        const totalHrs = studentSessions.reduce((sum, sess) => sum + sess.duration, 0);
        const totalAmt = studentSessions.reduce((sum, sess) => sum + sess.amount, 0);
        const isPaid = studentSessions.some(sess => sess.shouldPay);

        return {
          studentName: studentName,
          durationSum: totalHrs,
          amount: totalAmt,
          status: isPaid ? '✅' : '⏳',  // Show only icon, no text
          rate: totalHrs > 0 ? Math.round(totalAmt / totalHrs) : 0,
          sessions: studentSessions,  // สำหรับ onsiteDay
          courseType: courseType
        };
      });

      // ใช้ฟังก์ชัน createSummaryDetailsText() จาก Dashboard Payment
      group.summaryText = createSummaryDetailsText(studentDetails, courseType);
    });

    const startRowForTutor = currentRow;
    let rowsForTutor = 0;

    // แสดงแต่ละ courseType เป็นแถวแยก
    courseTypeGroups.forEach((group, courseType) => {
      const summaryRowData = [
        '', '', '',                      // A-C: จะ merge ภายหลัง
        '', '',                          // D-E: จะ merge ภายหลัง
        '', '',                          // F-G: จะ merge ภายหลัง
        courseType || '',                // H: Course Type
        '', '', '', '',                  // I-L: รายละเอียด (will merge, 4 columns)
        group.totalHours || 0,           // M: ชม.รวม
        group.totalAmount || 0           // N: ยอดเงิน
      ];

      dashboard.getRange(currentRow, 1, 1, 14).setValues([summaryRowData]);

      // Set alignment for all cells: Middle + Center + Wrap
      dashboard.getRange(currentRow, 1, 1, 14)
        .setVerticalAlignment('middle')
        .setHorizontalAlignment('center')
        .setWrap(true)
        .setFontSize(8);

      // H: Course Type
      dashboard.getRange(currentRow, 8)
        .setFontWeight('bold');

      // I-L: รายละเอียด (merge 4 columns)
      dashboard.getRange(currentRow, 9, 1, 4).merge()
        .setValue(group.summaryText)
        .setHorizontalAlignment('left')
        .setFontSize(7)
        .setWrap(true)
        .setVerticalAlignment('middle');

      // M: ชม.รวม
      dashboard.getRange(currentRow, 13)
        .setNumberFormat('#,##0.0');

      // N: ยอดเงิน
      dashboard.getRange(currentRow, 14)
        .setNumberFormat('#,##0');

      // Border
      dashboard.getRange(currentRow, 1, 1, 14).setBorder(
        true, true, true, true, true, true,
        '#cccccc',
        SpreadsheetApp.BorderStyle.SOLID
      );

      dashboard.setRowHeight(currentRow, 24);
      currentRow++;
      rowsForTutor++;
    });

    // แถวรวมสำหรับติวเตอร์คนนี้
    const totalDuration = data.totalDuration || 0;
    const totalAmount = data.totalAmount || 0;

    totalHoursOverall += totalDuration;
    totalAmountOverall += totalAmount;

    // สร้างข้อความสรุปสำหรับแถว **รวม**
    const totalSummaryText = createTutorTotalSummaryFromSessions(courseTypeGroups);

    const tutorTotalData = [
      '', '', '',                        // A-C: จะ merge ภายหลัง
      '', '',                            // D-E: จะ merge ภายหลัง
      '', '',                            // F-G: จะ merge ภายหลัง
      '**รวม**',                         // H: รวม
      '', '', '', '',                    // I-L: รายละเอียดสรุป (will merge)
      totalDuration || 0,                // M: ชม.รวม
      totalAmount || 0                   // N: ยอดเงิน
    ];

    dashboard.getRange(currentRow, 1, 1, 14).setValues([tutorTotalData]);

    // H: รวม (bold)
    dashboard.getRange(currentRow, 8)
      .setHorizontalAlignment('right')
      .setFontSize(9)
      .setFontWeight('bold');

    // I-L: รายละเอียดสรุป (merge 4 columns)
    dashboard.getRange(currentRow, 9, 1, 4).merge()
      .setValue(totalSummaryText)
      .setHorizontalAlignment('left')
      .setFontSize(7)
      .setWrap(true)
      .setVerticalAlignment('middle');

    // M: ชม.รวม (bold)
    dashboard.getRange(currentRow, 13)
      .setHorizontalAlignment('center')
      .setFontSize(9)
      .setFontWeight('bold')
      .setNumberFormat('#,##0.0');

    // N: ยอดเงิน (bold)
    dashboard.getRange(currentRow, 14)
      .setNumberFormat('#,##0')
      .setFontSize(10)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    // Background สีเหลือง
    dashboard.getRange(currentRow, 1, 1, 14).setBackground('#fef7e0');

    // Border
    dashboard.getRange(currentRow, 1, 1, 14).setBorder(
      true, true, true, true, true, true,
      '#cccccc',
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    );

    dashboard.setRowHeight(currentRow, 26);
    currentRow++;
    rowsForTutor++;

    // Merge A-G สำหรับทุกแถวของติวเตอร์คนนี้ (เหมือน Dashboard Payment)
    if (rowsForTutor > 0) {
      // A: # (merge)
      dashboard.getRange(startRowForTutor, 1, rowsForTutor, 1).merge()
        .setValue(index + 1)
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setFontSize(8);

      // B: รอบวันที่ (merge)
      dashboard.getRange(startRowForTutor, 2, rowsForTutor, 1).merge()
        .setValue(periodText)
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setFontSize(8);

      // C: รอบ (merge)
      dashboard.getRange(startRowForTutor, 3, rowsForTutor, 1).merge()
        .setValue(periodShort)
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setFontSize(8);

      // D-E: Display Name (merge)
      dashboard.getRange(startRowForTutor, 4, rowsForTutor, 2).merge()
        .setValue(data.displayName)
        .setHorizontalAlignment('left')
        .setVerticalAlignment('middle')
        .setFontSize(8);

      // F-G: ชื่อจริง (merge)
      dashboard.getRange(startRowForTutor, 6, rowsForTutor, 2).merge()
        .setValue(data.fullName)
        .setHorizontalAlignment('left')
        .setVerticalAlignment('middle')
        .setFontSize(8);
    }
  });

  // Overall Total Row
  const overallTotalData = [
    '', '', '',                        // A-C: Empty
    '', '',                            // D-E: Empty (will merge)
    '', '',                            // F-G: Empty
    '', '', '', '', '',                // H-L: รวมทั้งหมด (will merge, 5 columns)
    totalHoursOverall || 0,            // M: ชม.รวม
    totalAmountOverall || 0            // N: ยอดเงิน
  ];

  dashboard.getRange(currentRow, 1, 1, 14).setValues([overallTotalData]);

  // H-L: รวมทั้งหมด (merge 5 columns)
  dashboard.getRange(currentRow, 8, 1, 5).merge()
    .setValue('รวมทั้งหมด')
    .setHorizontalAlignment('right')
    .setFontWeight('bold')
    .setFontSize(9);

  // M: ชม.รวม
  dashboard.getRange(currentRow, 13)
    .setHorizontalAlignment('center')
    .setFontWeight('bold')
    .setFontSize(9)
    .setNumberFormat('#,##0.0');

  // N: ยอดเงิน
  dashboard.getRange(currentRow, 14)
    .setValue(totalAmountOverall)
    .setNumberFormat('#,##0')
    .setFontSize(10)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  dashboard.getRange(currentRow, 1, 1, 14)
    .setBackground('#fef7e0');

  dashboard.setRowHeight(currentRow, 28);
  currentRow += 2;  // เว้น 1 แถว

  // ============================================================
  // 📋 DETAILED REPORT - รายละเอียดแต่ละติวเตอร์
  // ============================================================

  // Details Section Title
  dashboard.getRange(currentRow, 1, 1, 14).merge()
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

    dashboard.getRange(currentRow, 1, 1, 14).merge()
      .setValue(headerText)
      .setFontSize(10)
      .setFontWeight('bold')
      .setHorizontalAlignment('left')
      .setBackground(REPORT_CONFIG.COLORS.tutorHeader);
    dashboard.setRowHeight(currentRow, 28);
    currentRow++;

    // Table Headers (Version 8.3: Restructured layout)
    // A: วันที่, B: เวลา, C: นักเรียน, D-E: วิชา, F: CourseType, G: ชม., H: ยอดเงิน, I-M: หมายเหตุ, N: Status
    const headers = ['วันที่', 'เวลา', 'นักเรียน', 'วิชา', '', 'CourseType', 'ชม.', 'ยอดเงิน', '', '', '', '', '', 'Status'];

    dashboard.getRange(currentRow, 1, 1, 14)
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(8)
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    // Merge D-E for "วิชา"
    dashboard.getRange(currentRow, 4, 1, 2).merge()
      .setValue('วิชา')
      .setFontWeight('bold')
      .setFontSize(8)
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    // Merge I-M for "หมายเหตุ" (5 columns)
    dashboard.getRange(currentRow, 9, 1, 5).merge()
      .setValue('หมายเหตุ')
      .setFontWeight('bold')
      .setFontSize(8)
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    dashboard.setRowHeight(currentRow, 22);
    currentRow++;

    // Sessions (Version 8.3: Restructured layout)
    data.sessions.forEach(session => {
      const dateStr = formatDateString(session.date);

      const rowData = [
        dateStr,                    // A: วันที่
        session.time || '',         // B: เวลา
        session.student || '',      // C: นักเรียน
        session.subject || '',      // D: วิชา (will merge D-E)
        '',                         // E: (merged with D)
        session.courseType || '',   // F: CourseType
        session.duration,           // G: ชม.
        session.amount,             // H: ยอดเงิน
        '', '', '', '', '',         // I-M: หมายเหตุ (will merge, 5 columns)
        session.status              // N: Status
      ];

      dashboard.getRange(currentRow, 1, 1, 14).setValues([rowData]);

      // Set alignment for all cells: Middle + Center + Wrap
      dashboard.getRange(currentRow, 1, 1, 14)
        .setVerticalAlignment('middle')
        .setHorizontalAlignment('center')
        .setWrap(true)
        .setFontSize(8);

      // Merge D-E for วิชา
      dashboard.getRange(currentRow, 4, 1, 2).merge()
        .setValue(session.subject || '')
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');

      // Merge I-M for หมายเหตุ (5 columns)
      // Format: "Topic | Total Hours | Remaining Hours"
      const noteText = `${session.topic || session.subject || ''} | ${session.studentTotalHours || 0} | ${session.studentRemaining || 0}`;
      dashboard.getRange(currentRow, 9, 1, 5).merge()
        .setValue(noteText)
        .setHorizontalAlignment('left')
        .setVerticalAlignment('middle')
        .setFontSize(7);

      // Number formats
      dashboard.getRange(currentRow, 7).setNumberFormat('#,##0.0');  // ชม.
      dashboard.getRange(currentRow, 8).setNumberFormat('#,##0');    // ยอดเงิน

      // Conditional Formatting for Status (Column N)
      if (session.status === '✅') {
        dashboard.getRange(currentRow, 14).setBackground(REPORT_CONFIG.COLORS.statusOK);
      } else {
        dashboard.getRange(currentRow, 14).setBackground(REPORT_CONFIG.COLORS.statusPending);
      }

      currentRow++;
    });

    // Separator
    currentRow++;
  });
}

// ============================================================
// NOTE: Shared functions moved to utils shared.gs
// - createTutorTotalSummaryFromSessions()
// ============================================================



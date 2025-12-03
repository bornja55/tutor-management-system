// ============================================================
// 💰 DASHBOARD PAYMENT - VERSION 7.4
// ✅ Layout แนวนอนแบบ Compact (เหมือน Dashboard Report)
// ✅ ปี + เดือน + รอบ แนวนอน
// ✅ ติวเตอร์ Compact (14 คนต่อแถว) - ขยายจาก 13
// ✅ ใช้ Shared Config และ Utils
// 🆕 Payment-First: เน้น courseType เป็นหลัก
// 🆕 onsiteDay: แสดงวันที่ + รายชื่อนักเรียน(ชม.)
// 🆕 Version 7.3 Changes:
//    - ขยายทุกส่วนเป็น 14 columns (A-N)
//    - เพิ่ม checkbox "ทั้งหมด" สำหรับ ปี, รอบ, เดือน
//    - ติวเตอร์รองรับ 14 คนต่อแถว (เพิ่มจาก 13)
//    - ตารางสรุป: H=CourseType, I-L=รายละเอียด(4 คอลัมน์), M=ชม.รวม, N=ยอดเงิน
//    - ทุก cell ตั้งกึ่งกลาง ยกเว้นช่องรายละเอียด (left-aligned)
// 🆕 Version 7.4 Changes:
//    - ย้าย tutor mapping จาก Z1 → AA1
//    - ตั้งค่าสีฟอนต์เป็นสีขาวเพื่อซ่อนข้อมูล mapping (ไม่ให้ติดมาตอนปริ้น)
// ============================================================

// ============================================================
// 🔧 SETUP DASHBOARD PAYMENT
// ============================================================
function setupDashboardPayment() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName(PAYMENT_CONFIG.DASHBOARD_SHEET);

  if (!dashboard) {
    dashboard = ss.insertSheet(PAYMENT_CONFIG.DASHBOARD_SHEET);
  }

  dashboard.clear();
  dashboard.clearConditionalFormatRules();
  const lastRow = dashboard.getMaxRows();
  const lastCol = dashboard.getMaxColumns();
  if (lastRow > 0 && lastCol > 0) {
    dashboard.getRange(1, 1, lastRow, lastCol).clearDataValidations();
  }

  // ============================================================
  // ROW 1: HEADER (ขยายเป็น 14 columns)
  // ============================================================
  dashboard.getRange('A1:N1').merge()
    .setValue('💰 Dashboard Payment - รายงานสรุปการสอน')
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground(PAYMENT_CONFIG.COLORS.header)
    .setFontColor('#ffffff');
  dashboard.setRowHeight(1, 45);

  // ============================================================
  // ROW 3: ปี + รอบ + ปุ่มอัพเดต (แนวนอน 1 แถว) + เพิ่ม checkbox "ทั้งหมด"
  // ============================================================
  // ปี
  dashboard.getRange('A3').setValue('📅 ปี').setFontWeight('bold').setFontSize(10).setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('B3').insertCheckboxes().setHorizontalAlignment('center').setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);  // Checkbox "ทั้งหมด"
  dashboard.getRange('C3').setValue('ทั้งหมด').setHorizontalAlignment('center').setFontSize(8).setFontColor('#ea4335').setFontWeight('bold').setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('D3').setValue('2025').setHorizontalAlignment('center').setFontSize(9).setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('E3').insertCheckboxes().setHorizontalAlignment('center').setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('F3').setValue('2026').setHorizontalAlignment('center').setFontSize(9).setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('G3').insertCheckboxes().setHorizontalAlignment('center').setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);

  // รอบ
  dashboard.getRange('H3').setValue('📅 รอบ').setFontWeight('bold').setFontSize(10).setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('I3').insertCheckboxes().setHorizontalAlignment('center').setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);  // Checkbox "ทั้งหมด"
  dashboard.getRange('J3').setValue('ทั้งหมด').setHorizontalAlignment('center').setFontSize(8).setFontColor('#ea4335').setFontWeight('bold').setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('K3').setValue('1-15').setHorizontalAlignment('center').setFontSize(9).setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('L3').insertCheckboxes().setHorizontalAlignment('center').setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('M3').setValue('16-30').setHorizontalAlignment('center').setFontSize(9).setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('N3').insertCheckboxes().setHorizontalAlignment('center').setBackground(PAYMENT_CONFIG.COLORS.yearPeriod);

  dashboard.setRowHeight(3, 30);
  dashboard.getRange('A3:N3').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 5-6: เดือน + เพิ่ม checkbox "ทั้งหมด" + ปุ่มอัพเดต
  // ============================================================
  // A5: Label "เดือน"
  dashboard.getRange('A5').setValue('เดือน').setFontWeight('bold').setFontSize(10).setBackground(PAYMENT_CONFIG.COLORS.month).setHorizontalAlignment('center');
  dashboard.getRange('A6').insertCheckboxes().setHorizontalAlignment('center').setBackground(PAYMENT_CONFIG.COLORS.month);  // Checkbox "ทั้งหมด"

  // B5: Label "ทั้งหมด"
  dashboard.getRange('B5').setValue('ทั้งหมด').setHorizontalAlignment('center').setFontSize(8).setFontColor('#ea4335').setFontWeight('bold').setBackground(PAYMENT_CONFIG.COLORS.month);
  dashboard.getRange('B6').setBackground(PAYMENT_CONFIG.COLORS.month);

  // Row 5: ชื่อเดือน (C5-N5 = 12 เดือน)
  SHARED_CONFIG.MONTH_SHORT.forEach((month, index) => {
    dashboard.getRange(5, index + 3)  // C5-N5
      .setValue(month)
      .setHorizontalAlignment('center')
      .setFontSize(8)
      .setBackground(PAYMENT_CONFIG.COLORS.month);
  });

  // Row 6: Checkbox เดือน (C6-N6 = 12 เดือน)
  for (let i = 0; i < 12; i++) {
    dashboard.getRange(6, i + 3)  // C6-N6
      .insertCheckboxes()
      .setHorizontalAlignment('center')
      .setBackground(PAYMENT_CONFIG.COLORS.month);
  }

  dashboard.setRowHeight(5, 22);
  dashboard.setRowHeight(6, 25);
  dashboard.getRange('A5:N6').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 7: ปุ่มอัพเดต (ย้ายมาแถว 7)
  // ============================================================
  dashboard.getRange('A7:N7').merge()
    .setValue('🔄 อัพเดต')
    .setFontSize(10)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground(PAYMENT_CONFIG.COLORS.updateButton)
    .setFontColor('#000000');
  dashboard.setRowHeight(7, 30);
  dashboard.getRange('A7:N7').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 9: ติวเตอร์ Header (ย้ายจาก row 8 → row 9)
  // ============================================================
  dashboard.getRange('A9').setValue('👨‍🏫 ติวเตอร์').setFontWeight('bold').setFontSize(10).setBackground(PAYMENT_CONFIG.COLORS.tutor);
  dashboard.getRange('B9').insertCheckboxes().setHorizontalAlignment('center').setBackground(PAYMENT_CONFIG.COLORS.tutor);
  dashboard.getRange('C9').setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(PAYMENT_CONFIG.COLORS.tutor);
  dashboard.getRange('D9').setValue('(กด "อัพเดต" เพื่อแสดงรายชื่อ)').setFontSize(8).setFontColor('#999999').setFontStyle('italic').setBackground(PAYMENT_CONFIG.COLORS.tutor);
  // E9:N9 ไว้ให้ dynamic checkbox ใช้
  dashboard.getRange('E9:N9').setBackground(PAYMENT_CONFIG.COLORS.tutor);
  dashboard.setRowHeight(9, 25);

  // ROW 10-11: Placeholder ติวเตอร์ (Label + Checkbox)
  dashboard.getRange('A10:N10').setBackground('#d9ead3');
  dashboard.getRange('A11:N11').setBackground('#d9ead3');
  dashboard.setRowHeight(10, 20);
  dashboard.setRowHeight(11, 22);
  dashboard.getRange('A9:N11').setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // ROW 13+: ปุ่มสร้างรายงาน, Table Header
  // ============================================================
  // NOTE: จะถูกสร้างใน updateTutorCheckboxesPayment() แบบ dynamic
  // เพื่อไม่ให้ถูกทับโดย checkbox sections

  // ============================================================
  // COLUMN WIDTHS (ขยายเป็น 14 columns)
  // ============================================================
  for (let i = 1; i <= 14; i++) {
    dashboard.setColumnWidth(i, 70);
  }

  // NOTE: setFrozenRows จะถูกเรียกใน updateTutorCheckboxesPayment() แบบ dynamic

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Setup Dashboard Payment สำเร็จ!\n\n' +
    'ขั้นตอนการใช้งาน:\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '1. เลือก ☐ ปี/เดือน/รอบ\n' +
    '2. กด Menu: "🔄 อัพเดต"\n' +
    '3. เลือก ☐ ติวเตอร์\n' +
    '4. กด Menu: "📊 สร้างรายงาน"',
    '✅ พร้อมใช้งาน',
    10
  );
}

// ============================================================
// 🔄 UPDATE TUTOR CHECKBOXES
// ============================================================
function updateTutorCheckboxesPayment() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(PAYMENT_CONFIG.DASHBOARD_SHEET);
  const rawData = ss.getSheetByName(SHARED_CONFIG.RAW_DATA_SHEET);

  if (!dashboard || !rawData) {
    SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น');
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('กำลังอัพเดตติวเตอร์...', '⏳ กรุณารอ', 3);

  // Get selected filters
  const selectedYears = getSelectedYearsPayment(dashboard);
  const selectedMonths = getSelectedMonthsPayment(dashboard);
  const selectedPeriods = getSelectedPeriodsPayment(dashboard);

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
  Logger.log('📅 Periods: ' + selectedPeriods.join(', '));

  // Filter data (ใช้ฟังก์ชันจาก utils shared.gs)
  let filteredData = filterDataByYearMonth(rawData, selectedYears, selectedMonths);

  // กรองเพิ่มตาม Period ถ้ามีการเลือก
  if (selectedPeriods.length > 0) {
    filteredData = filterDataByPeriodOnly(filteredData, selectedPeriods);
  }

  Logger.log('✅ Filtered Data: ' + filteredData.length + ' rows');

  if (filteredData.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ ไม่พบข้อมูลในช่วงเวลาที่เลือก');
    return;
  }

  // Get unique tutors (ใช้ฟังก์ชันจาก utils shared.gs)
  const tutors = getUniqueTutors(filteredData);

  // สร้าง mapping ระหว่าง Display Name กับ Line ID
  const tutorLineIdMap = getTutorLineIdMap(filteredData);
  saveTutorDisplayToLineIdMapping(dashboard, tutorLineIdMap);

  Logger.log('👨‍🏫 Tutors: ' + tutors.length);

  // Display Tutor Checkboxes (Row 10-11, และอาจจะมีแถวเพิ่ม) - Changed from 9-10
  const tutorRowsUsed = displayCheckboxRowPayment(dashboard, tutors, 10, 11, '#d9ead3');

  // Update tutor header (Row 9 - moved from row 8)
  dashboard.getRange('A9').setValue('👨‍🏫 ติวเตอร์').setFontWeight('bold').setFontSize(10).setBackground(PAYMENT_CONFIG.COLORS.tutor);
  dashboard.getRange('B9').insertCheckboxes().setHorizontalAlignment('center').setBackground(PAYMENT_CONFIG.COLORS.tutor);
  dashboard.getRange('C9').setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(PAYMENT_CONFIG.COLORS.tutor);
  dashboard.getRange('D9').setValue('(' + tutors.length + ' คน)').setFontSize(8).setFontColor('#666666').setFontStyle('italic').setBackground(PAYMENT_CONFIG.COLORS.tutor);
  dashboard.getRange('E9:N9').setValue('').setBackground(PAYMENT_CONFIG.COLORS.tutor);  // เคลียร์ E9:N9 (changed from E8:M8)

  // Border for tutor section (14 columns, changed from 13)
  dashboard.getRange(9, 1, tutorRowsUsed + 1, 14).setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);

  // ============================================================
  // DYNAMIC LAYOUT: ไม่มีปุ่มสร้างรายงาน (ลบออกแล้ว)
  // ============================================================
  const tutorEndRow = 10 + tutorRowsUsed;  // Row 10 = tutor start (changed from 9), + tutorRowsUsed

  // Clear old dynamic sections (ล้างแถว 12 เป็นต้นไป)
  const maxClearRow = 50;
  const dataStartRow = tutorEndRow + 2;
  if (dataStartRow < maxClearRow) {
    dashboard.getRange(dataStartRow, 1, maxClearRow - dataStartRow + 1, 14).clearContent().clearFormat();
  }

  // Update frozen rows to tutor section
  dashboard.setFrozenRows(tutorEndRow);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ อัพเดตติวเตอร์สำเร็จ!\n\n' +
    'ติวเตอร์: ' + tutors.length + ' คน',
    '✅ สำเร็จ',
    5
  );
}

// ============================================================
// 📊 DISPLAY CHECKBOX ROW (Label Row + Checkbox Row) - PAYMENT
// รองรับ 14 คน/แถว (A-N), ถ้ามากกว่า 14 ให้เพิ่มอีก 2 แถว
// Return: จำนวนแถวที่ใช้ (label + checkbox rows)
// ============================================================
function displayCheckboxRowPayment(dashboard, items, labelRow, checkboxRow, bgColor) {
  const maxPerRow = 14;  // A-N = 14 คอลัม
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
function getSelectedYearsPayment(dashboard) {
  const years = [];

  // Check "ทั้งหมด" checkbox at B3
  if (dashboard.getRange('B3').getValue() === true) {
    return [2025, 2026];  // Return all years
  }

  // 2025: E3 (moved from C3)
  if (dashboard.getRange('E3').getValue() === true) {
    years.push(2025);
  }

  // 2026: G3 (moved from E3)
  if (dashboard.getRange('G3').getValue() === true) {
    years.push(2026);
  }

  return years;
}

// ============================================================
// 📅 GET SELECTED MONTHS
// ============================================================
function getSelectedMonthsPayment(dashboard) {
  const months = [];

  // Check "ทั้งหมด" checkbox at A6
  if (dashboard.getRange('A6').getValue() === true) {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];  // Return all months
  }

  // C6-N6 = เดือน 0-11 (moved from B6-M6)
  for (let i = 0; i < 12; i++) {
    if (dashboard.getRange(6, i + 3).getValue() === true) {
      months.push(i);  // 0-11
    }
  }

  return months;
}

// ============================================================
// 📅 GET SELECTED PERIODS
// ============================================================
function getSelectedPeriodsPayment(dashboard) {
  const periods = [];

  // Check "ทั้งหมด" checkbox at I3
  if (dashboard.getRange('I3').getValue() === true) {
    return ['1-15', '16-30'];  // Return all periods
  }

  // 1-15: L3 (moved from H3)
  if (dashboard.getRange('L3').getValue() === true) {
    periods.push('1-15');
  }

  // 16-30: N3 (moved from J3)
  if (dashboard.getRange('N3').getValue() === true) {
    periods.push('16-30');
  }

  return periods;
}

// ============================================================
// 💾 SAVE TUTOR DISPLAY-TO-LINEID MAPPING
// เก็บ mapping ไว้ใน Named Range เพื่อใช้ในการกรอง
// ============================================================
function saveTutorDisplayToLineIdMapping(dashboard, tutorLineIdMap) {
  // สร้าง JSON string จาก Map
  const mapping = {};
  tutorLineIdMap.forEach((info, lineId) => {
    mapping[info.displayName] = lineId;
  });

  const jsonString = JSON.stringify(mapping);

  // เก็บใน cell N9 (แถว tutor checkbox) และตั้งค่าสีฟอนต์เป็นสีขาว
  dashboard.getRange('N9')
    .setValue(jsonString)
    .setFontColor('#ffffff');
}

// ============================================================
// 📖 LOAD TUTOR DISPLAY-TO-LINEID MAPPING
// ============================================================
function loadTutorDisplayToLineIdMapping(dashboard) {
  const jsonString = dashboard.getRange('N9').getValue();
  if (!jsonString) return {};

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    Logger.log('Error parsing tutor mapping: ' + e.message);
    return {};
  }
}

// ============================================================
// 👥 GET SELECTED TUTORS (คืนค่าเป็น Line ID)
// ============================================================
function getSelectedTutorsPayment(dashboard) {
  // Check "ทั้งหมด" at B9 (moved from B8)
  if (dashboard.getRange('B9').getValue() === true) {
    return [];
  }

  // โหลด mapping
  const displayToLineId = loadTutorDisplayToLineIdMapping(dashboard);

  const selectedLineIds = [];
  const maxRows = 3;  // รองรับ 3 แถว

  for (let rowGroup = 0; rowGroup < maxRows; rowGroup++) {
    const labelRow = 10 + (rowGroup * 2);  // Changed from 9 to 10 (tutor section moved down)
    const checkRow = labelRow + 1;

    const labels = dashboard.getRange(labelRow, 1, 1, 14).getValues()[0];  // A-N (changed from 13 to 14)
    const checks = dashboard.getRange(checkRow, 1, 1, 14).getValues()[0];  // A-N (changed from 13 to 14)

    for (let i = 0; i < 14; i++) {  // Changed from 13 to 14
      if (checks[i] === true && labels[i]) {
        const displayName = String(labels[i]);
        const lineId = displayToLineId[displayName];

        if (lineId) {
          selectedLineIds.push(lineId);
        } else {
          // Fallback: ถ้าไม่เจอใน mapping ให้ใช้ display name
          Logger.log('⚠️ ไม่เจอ Line ID สำหรับ: ' + displayName);
          selectedLineIds.push(displayName);
        }
      }
    }
  }

  return selectedLineIds;
}

// ============================================================
// 🔄 GENERATE REPORT
// ============================================================
function generateReportPayment() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(PAYMENT_CONFIG.DASHBOARD_SHEET);
  const rawData = ss.getSheetByName(SHARED_CONFIG.RAW_DATA_SHEET);

  if (!dashboard || !rawData) {
    SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น');
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('กำลังประมวลผล...', '⏳ กรุณารอ', 3);

  // Get all filters
  const selectedYears = getSelectedYearsPayment(dashboard);
  const selectedMonths = getSelectedMonthsPayment(dashboard);
  const selectedPeriods = getSelectedPeriodsPayment(dashboard);
  const selectedTutors = getSelectedTutorsPayment(dashboard);

  if (selectedYears.length === 0 || selectedMonths.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ กรุณาเลือกปีและเดือนก่อน');
    return;
  }

  Logger.log('📅 Years: ' + selectedYears.length);
  Logger.log('📅 Months: ' + selectedMonths.length);
  Logger.log('📅 Periods: ' + selectedPeriods.length);
  Logger.log('👤 Tutors: ' + (selectedTutors.length === 0 ? 'ทั้งหมด' : selectedTutors.join(', ')));

  // Filter data (ใช้ฟังก์ชันจาก utils shared.gs)
  let filteredData = filterDataByYearMonth(rawData, selectedYears, selectedMonths);

  // กรองเพิ่มตาม Period ถ้ามีการเลือก
  if (selectedPeriods.length > 0) {
    filteredData = filterDataByPeriodOnly(filteredData, selectedPeriods);
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

  const tutorLookup = loadTutorDB();

  // อัพเดต Display Name ใน TutorDB ถ้ามีการเปลี่ยนแปลง
  const tutorLineIdMap = getTutorLineIdMap(filteredData);
  updateTutorDisplayNames(tutorLineIdMap);

  const { summary, details } = createSummaryWithDetailsPayment(filteredData, tutorLookup);

  // Find tutor section end row dynamically (ไม่มีปุ่มสร้างรายงานแล้ว)
  let tutorEndRow = 10;  // Default (Row 9-10 = tutor section minimum)
  for (let row = 8; row <= 30; row++) {
    const value = dashboard.getRange(row, 1).getValue();
    if (String(value).includes('👨‍🏫 ติวเตอร์')) {
      // หาแถวสุดท้ายของ tutor section โดยเช็ค checkbox
      for (let checkRow = row + 1; checkRow <= row + 10; checkRow++) {
        const cellValue = dashboard.getRange(checkRow, 1).getValue();
        if (cellValue && String(cellValue).trim() !== '') {
          tutorEndRow = checkRow + 1;  // +1 เพราะต้องนับ checkbox row ด้วย
        } else {
          break;
        }
      }
      break;
    }
  }

  const dataStartRow = tutorEndRow + 2;  // 2 แถวว่างหลัง tutor section

  // Clear old data
  const lastRow = dashboard.getLastRow();
  if (lastRow > dataStartRow) {
    const rowsToDelete = lastRow - dataStartRow + 1;
    if (rowsToDelete > 0) {
      dashboard.getRange(dataStartRow, 1, rowsToDelete, 14).clearContent();
      dashboard.getRange(dataStartRow, 1, rowsToDelete, 14).clearFormat();
    }
  }

  displaySummaryWithDetailsPayment(dashboard, dataStartRow, summary, details);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ สร้างรายงานสำเร็จ!\n' +
    'ติวเตอร์: ' + summary.length + ' คน\n' +
    'ข้อมูล: ' + filteredData.length + ' รายการ',
    '✅ สำเร็จ',
    8
  );
}

// ============================================================
// 📊 CREATE SUMMARY WITH DETAILS
// ============================================================
function createSummaryWithDetailsPayment(filteredData, tutorLookup) {
  const tutorMap = new Map();
  const tutorLineIdMap = getTutorLineIdMap(filteredData);

  filteredData.forEach(row => {
    const displayName = row[3];  // Line Display Name
    const lineId = row[4];  // Line ID
    const student = row[5];
    const date = row[6];
    const time = row[7];
    const subject = row[8];  // Book
    const topic = row[9];
    const totalHours = parseFloat(row[10]) || 0;
    const remaining = parseFloat(row[11]) || 0;
    const courseType = row[13];
    const duration = parseFloat(row[14]) || 0;

    if (!lineId || !student) return;  // ใช้ Line ID เป็นหลัก

    const lineIdStr = String(lineId).trim();

    if (!tutorMap.has(lineIdStr)) {
      const fullName = matchTutorName(displayName, lineId, tutorLookup);
      const latestInfo = tutorLineIdMap.get(lineIdStr);
      const latestDisplayName = latestInfo ? latestInfo.displayName : displayName;

      tutorMap.set(lineIdStr, {
        lineId: lineIdStr,
        displayName: latestDisplayName,  // ใช้ Display Name ล่าสุด
        fullName: fullName,
        totalDuration: 0,
        totalAmount: 0,
        students: new Map()
      });
    }

    const tutorData = tutorMap.get(lineIdStr);
    tutorData.totalDuration += duration;

    // ============================================================
    // ✨ ประมวลผล Payment Conditions ก่อน Grouping
    // เพื่อให้ courseType ถูกต้องตามเงื่อนไข (เช่น วันเสาร์-อาทิตย์ → onsiteDay)
    // ============================================================
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

    const key = `${student}|${subject}|${effectiveCourseType}`;  // Group by student + subject + effectiveCourseType

    if (!tutorData.students.has(key)) {
      tutorData.students.set(key, {
        studentName: student,
        subject: subject,
        sessions: [],
        sessionCount: 0,
        durationSum: 0,
        totalHours: totalHours,
        remaining: remaining,
        courseType: effectiveCourseType,
        amount: 0,
        status: ''
      });
    }

    const studentData = tutorData.students.get(key);
    studentData.sessions.push({
      date: date,
      time: time,
      courseType: effectiveCourseType,
      topic: topic,
      duration: duration
    });
    studentData.sessionCount++;
    studentData.durationSum += duration;

    if (remaining < studentData.remaining || remaining === 0) {
      studentData.remaining = remaining;
      studentData.totalHours = totalHours;
      studentData.courseType = effectiveCourseType;
    }
  });

  const summary = [];
  const details = [];

  tutorMap.forEach((tutorData, tutor) => {
    let totalAmount = 0;
    let coursesCompleted = 0;
    let coursesPending = 0;

    // โหลด Payment Rules ของติวเตอร์คนนี้
    const tutorRules = getTutorPaymentRules(tutorData.lineId);

    // ============================================================
    // ขั้นตอนที่ 1: หาวันที่ที่มี onsiteDay ของติวเตอร์คนนี้
    // ============================================================
    const onsiteDayDates = new Set();
    tutorData.students.forEach((studentData, key) => {
      studentData.sessions.forEach(session => {
        const sessionDate = formatDateString(session.date);  // Format เป็น string เพื่อเปรียบเทียบ
        const sessionCourseType = session.courseType;

        // เช็คว่าเป็น onsiteDay หรือไม่
        if (sessionCourseType === 'onsiteDay') {
          onsiteDayDates.add(sessionDate);
        }
      });
    });

    Logger.log(`Tutor ${tutorData.displayName} has onsiteDay on dates: ${Array.from(onsiteDayDates).join(', ')}`);

    // ============================================================
    // ขั้นตอนที่ 2: คำนวณเงินสำหรับแต่ละคอร์ส
    // ============================================================
    const studentDetails = [];

    // ✅ แก้ไข: คำนวณจำนวนวันที่ต้องจ่ายเงิน onsiteDay ก่อน (จ่ายครั้งเดียวต่อวัน)
    const onsiteDayPaymentAmount = onsiteDayDates.size * 850;  // 850 บาท/วัน
    let onsiteDayAmountDistributed = 0;  // ยอดเงินที่แจกจ่ายไปแล้ว
    const onsiteDayTotalStudents = Array.from(tutorData.students.values()).filter(s => s.courseType === 'onsiteDay').length;

    tutorData.students.forEach((studentData, key) => {
      const totalHours = studentData.totalHours;
      const remaining = studentData.remaining;
      const courseType = studentData.courseType;
      let durationSum = studentData.durationSum;

      // ============================================================
      // ถ้าเป็น online/onsiteGroup และมีการสอนในวันที่เหมา (onsiteDay)
      // ให้หักชั่วโมงที่ซ้ำซ้อนออก
      // ============================================================
      if ((courseType === 'online1by1' || courseType === 'onsiteGroup') && onsiteDayDates.size > 0) {
        let overlappingHours = 0;
        studentData.sessions.forEach(session => {
          const sessionDate = formatDateString(session.date);
          if (onsiteDayDates.has(sessionDate)) {
            overlappingHours += session.duration || 0;
            Logger.log(`  - ${studentData.studentName} (${courseType}): ${sessionDate} overlaps with onsiteDay, exclude ${session.duration} hours`);
          }
        });
        durationSum -= overlappingHours;  // หักชั่วโมงที่ซ้ำออก
      }

      // สร้าง session object สำหรับ calculatePaymentWithRules()
      const session = {
        totalHours: totalHours,
        remaining: remaining,
        courseType: courseType,
        duration: durationSum,  // ใช้ durationSum ที่หักชั่วโมงซ้ำแล้ว
        date: studentData.sessions.length > 0 ? studentData.sessions[0].date : null
      };

      // คำนวณเงินโดยใช้ Payment Rules
      const paymentResult = calculatePaymentWithRules(session, tutorData.lineId, tutorRules);

      let amount = 0;
      let status = '';
      let note = '';

      if (paymentResult.shouldPay) {
        // ============================================================
        // 🆕 สำหรับ onsiteDay: แจกจ่ายเงินให้นักเรียนคนแรก
        // ============================================================
        if (courseType === 'onsiteDay') {
          if (onsiteDayAmountDistributed === 0) {
            // นักเรียนคนแรกที่เป็น onsiteDay รับเงินทั้งหมด
            amount = onsiteDayPaymentAmount;
            onsiteDayAmountDistributed = amount;
            totalAmount += amount;
            coursesCompleted++;
            status = '✅ จ่าย';
            note = `850฿/วัน × ${onsiteDayDates.size} วัน`;
            Logger.log(`  ✅ onsiteDay payment (${onsiteDayDates.size} days): ${amount} บาท for ${studentData.studentName}`);
          } else {
            // นักเรียนคนอื่นๆ แสดงว่ารวมในยอดแล้ว
            coursesPending++;
            status = '✅ จ่าย';
            note = '✅ รวมในยอดเหมารายวัน';
            amount = 0;
            Logger.log(`  ⏭️  onsiteDay for ${studentData.studentName}: included in day rate`);
          }
        } else {
          // ประเภทอื่นๆ: จ่ายตามปกติ
          amount = paymentResult.amount;
          totalAmount += amount;
          coursesCompleted++;
          status = '✅ จ่าย';
          note = paymentResult.note;
        }
      } else {
        coursesPending++;
        status = '⏳ ยังไม่จ่าย';
        note = paymentResult.note;
      }

      studentData.amount = amount;
      studentData.status = status;
      studentData.note = note;
      studentData.rate = paymentResult.rate;
      studentData.trigger = paymentResult.trigger;
      studentData.durationSum = durationSum;  // อัพเดต durationSum ที่หักแล้ว

      // Sort sessions by date (newest first)
      studentData.sessions.sort((a, b) => {
        const dateA = parseDateValue(a.date);
        const dateB = parseDateValue(b.date);
        return dateB - dateA;
      });

      studentDetails.push(studentData);
    });

    const avgRate = tutorData.totalDuration > 0 ? totalAmount / tutorData.totalDuration : 0;
    const tutorStatus = coursesPending === 0 ? '✅ ทั้งหมดจบ' : '⏳ มีค้าง ' + coursesPending;

    // Sort studentDetails before creating summary text
    studentDetails.sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === '✅ จ่าย' ? -1 : 1;
    });

    // จัดกลุ่ม students ตาม courseType
    const courseTypeGroups = groupStudentsByCourseType(new Map(
      studentDetails.map((s, index) => [`${index}_${s.studentName}_${s.subject}`, s])
    ));

    // สร้างข้อความสรุปรายละเอียดสำหรับแต่ละ courseType
    const courseTypeGroupsWithSummary = new Map();
    courseTypeGroups.forEach((group, courseType) => {
      courseTypeGroupsWithSummary.set(courseType, {
        ...group,
        summaryText: createSummaryDetailsText(group.students, courseType)
      });
    });

    // สร้างข้อความสรุปรายละเอียดทั้งหมด
    const summaryDetailsText = createSummaryDetailsText(studentDetails);

    summary.push([
      tutorData.displayName,
      tutorData.fullName,
      tutorData.totalDuration,
      totalAmount,
      tutorData.students.size,
      coursesCompleted,
      coursesPending,
      avgRate,
      tutorStatus,
      summaryDetailsText,              // เพิ่มรายละเอียดสรุป
      courseTypeGroupsWithSummary      // เพิ่ม courseTypeGroups
    ]);

    details.push({
      tutor: tutorData.displayName,
      students: studentDetails
    });
  });

  summary.sort((a, b) => b[2] - a[2]);

  return { summary, details };
}

// ============================================================
// 📊 DISPLAY SUMMARY WITH DETAILS
// แบบใหม่: แสดงสรุปแต่ละติวเตอร์ก่อนรายละเอียดของคนนั้นๆ
// ============================================================
function displaySummaryWithDetailsPayment(dashboard, startRow, summary, details) {
  let currentRow = startRow;

  // Get period range from filters
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboardSheet = ss.getSheetByName(PAYMENT_CONFIG.DASHBOARD_SHEET);
  const selectedYears = getSelectedYearsPayment(dashboardSheet);
  const selectedMonths = getSelectedMonthsPayment(dashboardSheet);
  const selectedPeriods = getSelectedPeriodsPayment(dashboardSheet);

  // Format period string
  let periodText = '';
  let periodShort = '';
  if (selectedYears.length > 0 && selectedMonths.length > 0) {
    const monthNames = selectedMonths.map(m => SHARED_CONFIG.MONTH_SHORT[m]).join(', ');
    const yearText = selectedYears.join(', ');
    periodText = `${monthNames} ${yearText}`;
  } else {
    periodText = '-';  // Default value if no year/month selected
  }

  // Format period range (1-15, 16-30, or 1-30)
  if (selectedPeriods.length === 0) {
    periodShort = '1-30';
  } else if (selectedPeriods.length === 2) {
    periodShort = '1-30';
  } else {
    periodShort = selectedPeriods[0] || '1-30';  // Ensure default value
  }

  // ============================================================
  // 💰 SUMMARY TABLE - ตารางสรุปยอดชำระเงินติวเตอร์ (ทั้งหมดรวมกัน)
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

  // Summary Table Headers (14 columns: A-N)
  const overallSummaryHeaders = [
    '#', 'รอบวันที่', 'รอบ', 'Display Name', '', 'ชื่อจริง', '', 'CourseType', 'รายละเอียด', '', '', '', 'ชม.รวม', 'ยอดเงิน'
  ];

  dashboard.getRange(currentRow, 1, 1, 14)
    .setValues([overallSummaryHeaders])
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

  // Display all tutor summaries (แยกแถวตาม courseType)
  let totalHoursOverall = 0;
  let totalAmountOverall = 0;

  summary.forEach((tutorSummary, index) => {
    const displayName = tutorSummary[0];
    const fullName = tutorSummary[1];
    const totalDuration = tutorSummary[2];
    const totalAmount = tutorSummary[3];
    const courseTypeGroups = tutorSummary[10] || new Map();  // courseTypeGroups

    totalHoursOverall += totalDuration;
    totalAmountOverall += totalAmount;

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

      // Debug
      if (summaryRowData.length !== 14) {
        Logger.log(`ERROR at courseType summary: ${summaryRowData.length} elements (expected 14)`);
        Logger.log(`courseType: ${courseType}, group: ${JSON.stringify(group)}`);
        Logger.log(`Data: ${JSON.stringify(summaryRowData)}`);
        throw new Error(`summaryRowData has ${summaryRowData.length} elements, expected 14`);
      }

      dashboard.getRange(currentRow, 1, 1, 14).setValues([summaryRowData]);

      // H: Course Type
      dashboard.getRange(currentRow, 8)
        .setHorizontalAlignment('center')
        .setFontSize(8)
        .setFontWeight('bold');

      // I-L: รายละเอียด (merge 4 columns)
      dashboard.getRange(currentRow, 9, 1, 4).merge()
        .setValue(group.summaryText)
        .setHorizontalAlignment('left')
        .setFontSize(7)
        .setWrap(true)
        .setVerticalAlignment('top');

      // M: ชม.รวม
      dashboard.getRange(currentRow, 13)
        .setHorizontalAlignment('center')
        .setFontSize(8)
        .setNumberFormat('#,##0.0');

      // N: ยอดเงิน
      dashboard.getRange(currentRow, 14)
        .setNumberFormat('#,##0')
        .setFontSize(8)
        .setHorizontalAlignment('center');

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

    // สร้างข้อความสรุปสำหรับแถว **รวม**
    const totalSummaryText = createTutorTotalSummary(courseTypeGroups);

    // แถวรวมทั้งหมด
    const totalRowData = [
      '', '', '', '', '', '', '',
      '**รวม**',                         // H: รวม
      '', '', '', '',                    // I-L: รายละเอียดสรุป (will merge)
      totalDuration || 0,                // M: ชม.รวม
      totalAmount || 0                   // N: ยอดเงิน
    ];

    dashboard.getRange(currentRow, 1, 1, 14).setValues([totalRowData]);

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

    // Merge A-G สำหรับทุกแถวของติวเตอร์คนนี้
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
        .setValue(displayName)
        .setHorizontalAlignment('left')
        .setVerticalAlignment('middle')
        .setFontSize(8);

      // F-G: ชื่อจริง (merge)
      dashboard.getRange(startRowForTutor, 6, rowsForTutor, 2).merge()
        .setValue(fullName)
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
  currentRow += 3;  // เว้น 2 แถว เพื่อแยกส่วนสรุปกับรายละเอียดให้ชัดเจน

  // ============================================================
  // 📋 รายละเอียดการสอนแต่ละติวเตอร์ (ส่วนอ้างอิง)
  // ============================================================

  // Details Section Title with note
  dashboard.getRange(currentRow, 1, 1, 14).merge()
    .setValue('📋 รายละเอียดการสอนแต่ละติวเตอร์ (ตรวจสอบรายละเอียดเพิ่มเติม)')
    .setFontSize(11)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#93c47d')
    .setFontColor('#274e13');
  dashboard.setRowHeight(currentRow, 35);
  currentRow++;  // ไม่เว้นบรรทัด ไปที่ข้อมูลติวเตอร์เลย

  // ============================================================
  // วนลูปแสดงแต่ละติวเตอร์ (สรุป + รายละเอียด)
  // ============================================================

  // สร้าง Map เพื่อจับคู่ Summary กับ Details
  const summaryMap = new Map();
  summary.forEach((tutorSummary, index) => {
    const displayName = tutorSummary[0];
    summaryMap.set(displayName, {
      index: index + 1,
      displayName: tutorSummary[0],
      fullName: tutorSummary[1],
      totalDuration: tutorSummary[2],
      totalAmount: tutorSummary[3]
    });
  });

  let totalHoursAll = 0;
  let totalAmountAll = 0;

  details.forEach((tutorDetail, tutorIndex) => {
    const tutorSummary = summaryMap.get(tutorDetail.tutor);

    if (!tutorSummary) return;  // Skip if no summary found

    totalHoursAll += tutorSummary.totalDuration;
    totalAmountAll += tutorSummary.totalAmount;

    // ============================================================
    // TUTOR SUMMARY ROW (ข้อมูลสรุปติวเตอร์)
    // ============================================================

    // Summary Table Headers (14 columns: A-N)
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

    // สร้างข้อความสรุปรายละเอียดสำหรับติวเตอร์คนนี้
    const tutorDetailsText = createSummaryDetailsText(tutorDetail.students);

    // Summary Data Row (14 columns: A-N)
    const summaryRowData = [
      tutorSummary.index || 0,           // A: #
      periodText || '',                  // B: รอบวันที่
      periodShort || '',                 // C: รอบ
      '', '',                            // D-E: Display Name (will merge)
      '', '',                            // F-G: ชื่อจริง (will merge)
      '',                                // H: CourseType (leave empty for summary)
      '', '', '', '',                    // I-L: รายละเอียด (will merge, 4 columns)
      tutorSummary.totalDuration || 0,   // M: ชม.รวม
      tutorSummary.totalAmount || 0      // N: ยอดเงิน
    ];

    // Debug: Check array length
    if (summaryRowData.length !== 14) {
      Logger.log(`ERROR: summaryRowData has ${summaryRowData.length} elements, expected 14`);
      Logger.log(`Data: ${JSON.stringify(summaryRowData)}`);
      throw new Error(`summaryRowData has ${summaryRowData.length} elements, expected 14`);
    }

    dashboard.getRange(currentRow, 1, 1, 14).setValues([summaryRowData]);

    // Format individual cells
    dashboard.getRange(currentRow, 1).setHorizontalAlignment('center').setFontSize(8);
    dashboard.getRange(currentRow, 2).setHorizontalAlignment('center').setFontSize(8);
    dashboard.getRange(currentRow, 3).setHorizontalAlignment('center').setFontSize(8);

    // D-E: Display Name (merge)
    dashboard.getRange(currentRow, 4, 1, 2).merge()
      .setValue(tutorSummary.displayName)
      .setHorizontalAlignment('left')
      .setFontSize(8);

    // F-G: ชื่อจริง (merge)
    dashboard.getRange(currentRow, 6, 1, 2).merge()
      .setValue(tutorSummary.fullName)
      .setHorizontalAlignment('left')
      .setFontSize(8);

    // I-L: รายละเอียด (merge 4 columns)
    dashboard.getRange(currentRow, 9, 1, 4).merge()
      .setValue(tutorDetailsText)
      .setHorizontalAlignment('left')
      .setFontSize(7)
      .setWrap(true)
      .setVerticalAlignment('top');

    // M: ชม.รวม
    dashboard.getRange(currentRow, 13)
      .setHorizontalAlignment('center')
      .setFontSize(8)
      .setNumberFormat('#,##0.0');

    // N: ยอดเงิน
    dashboard.getRange(currentRow, 14)
      .setValue(tutorSummary.totalAmount)
      .setNumberFormat('#,##0')
      .setFontSize(9)
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    // Background color
    dashboard.getRange(currentRow, 1, 1, 14).setBackground('#e8f0fe');

    // Border
    dashboard.getRange(currentRow, 1, 1, 14).setBorder(
      true, true, true, true, true, true,
      '#cccccc',
      SpreadsheetApp.BorderStyle.SOLID
    );

    // ปรับ row height ตามจำนวนบรรทัดในรายละเอียด
    const tutorDetailLines = tutorDetailsText.split('\n').length;
    const tutorRowHeight = Math.max(24, Math.min(24 + (tutorDetailLines * 10), 120));
    dashboard.setRowHeight(currentRow, tutorRowHeight);
    currentRow++;

    // ============================================================
    // TUTOR DETAIL TABLE (ตารางรายละเอียดการสอน)
    // ============================================================

    // Detail Table Headers (เพิ่ม Course Type)
    const detailHeaders = [
      'ติวเตอร์', 'วิชา', 'นักเรียน', 'Course Type', 'จำนวนครั้ง', 'จำนวนชั่วโมง',
      'อัตรา/ชม.', 'ชม.รวม', 'ยอดเงิน', 'รายละเอียด', '', '', 'Status', 'หมายเหตุ'
    ];

    dashboard.getRange(currentRow, 1, 1, 14)
      .setValues([detailHeaders])
      .setFontWeight('bold')
      .setFontSize(9)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setBackground(PAYMENT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    // Merge J-L for "รายละเอียด"
    dashboard.getRange(currentRow, 10, 1, 3).merge()
      .setValue('รายละเอียด')
      .setFontWeight('bold')
      .setFontSize(9)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setBackground(PAYMENT_CONFIG.COLORS.tableHeader)
      .setFontColor('#ffffff');

    dashboard.getRange(currentRow, 1, 1, 14).setBorder(
      true, true, true, true, true, true,
      '#ffffff', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
    );

    dashboard.setRowHeight(currentRow, 28);
    currentRow++;

    // Detail Rows (เพิ่ม Course Type + merge ติวเตอร์)
    const tutorDetailStartRow = currentRow;

    tutorDetail.students.forEach(studentData => {
      const rate = studentData.rate || SHARED_CONFIG.RATES[studentData.courseType] || 150;

      const detailRow = [
        '',                                   // A: ติวเตอร์ (จะ merge ภายหลัง)
        studentData.subject || '',            // B: วิชา
        studentData.studentName,              // C: นักเรียน
        studentData.courseType,               // D: Course Type ← เพิ่มใหม่
        studentData.sessionCount,             // E: จำนวนครั้ง
        studentData.durationSum,              // F: จำนวนชั่วโมง
        rate,                                 // G: อัตรา/ชม.
        studentData.totalHours,               // H: ชม.รวม
        studentData.amount,                   // I: ยอดเงิน
        '', '', '',                           // J-L: รายละเอียด (will merge)
        studentData.status,                   // M: Status
        ''                                    // N: หมายเหตุ
      ];

      dashboard.getRange(currentRow, 1, 1, 14).setValues([detailRow]);

      // D: Course Type
      dashboard.getRange(currentRow, 4)
        .setHorizontalAlignment('center')
        .setFontSize(7)
        .setFontWeight('bold');

      // I: ยอดเงิน (single cell)
      dashboard.getRange(currentRow, 9)
        .setNumberFormat('#,##0.00')
        .setFontSize(8)
        .setHorizontalAlignment('center');

      // Merge J-L for รายละเอียด (session details)
      let detailsText = '';
      if (studentData.sessions && studentData.sessions.length > 0) {
        detailsText = '📝 รายละเอียดการสอน:\n';
        studentData.sessions.forEach((session, idx) => {
          const dateStr = formatDateString(session.date);
          const timeStr = session.time || '-';
          const topicStr = session.topic || '-';
          const durationStr = (session.duration || 0).toFixed(1);
          detailsText += `${idx + 1}. ${dateStr} ${timeStr} | ${topicStr} (${durationStr} ชม.)\n`;
        });
      }

      dashboard.getRange(currentRow, 10, 1, 3).merge()
        .setValue(detailsText)
        .setFontSize(7)
        .setWrap(true)
        .setVerticalAlignment('top')
        .setHorizontalAlignment('left');

      // N: หมายเหตุ (notes only)
      dashboard.getRange(currentRow, 14)
        .setValue(studentData.note || '')
        .setFontSize(7)
        .setWrap(true)
        .setVerticalAlignment('top')
        .setHorizontalAlignment('left');

      // Number formats
      dashboard.getRange(currentRow, 6).setNumberFormat('#,##0.0');  // จำนวนชั่วโมง
      dashboard.getRange(currentRow, 7).setNumberFormat('#,##0');    // อัตรา/ชม.
      dashboard.getRange(currentRow, 8).setNumberFormat('#,##0.0');  // ชม.รวม

      dashboard.getRange(currentRow, 1, 1, 14).setFontSize(8);

      // Status color (column M = 13)
      if (studentData.status === '✅ จ่าย') {
        dashboard.getRange(currentRow, 13).setBackground(PAYMENT_CONFIG.COLORS.completedBg);
      } else {
        dashboard.getRange(currentRow, 13).setBackground(PAYMENT_CONFIG.COLORS.pendingBg);
      }

      // Set row height (เพิ่มความสูงถ้ามี sessions เยอะ)
      const sessionCount = studentData.sessions ? studentData.sessions.length : 0;
      const rowHeight = sessionCount > 0 ? Math.min(24 + (sessionCount * 12), 150) : 24;
      dashboard.setRowHeight(currentRow, rowHeight);

      currentRow++;
    });

    // Merge Column A (ติวเตอร์) สำหรับทุกแถวของติวเตอร์คนนี้
    if (tutorDetail.students.length > 0) {
      dashboard.getRange(tutorDetailStartRow, 1, tutorDetail.students.length, 1).merge()
        .setValue(tutorDetail.tutor)
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setFontSize(8)
        .setFontWeight('bold');
    }

    // Separator after each tutor (2 แถวว่าง)
    currentRow += 2;
  });

  // Border for entire section
  dashboard.getRange(startRow, 1, currentRow - startRow, 14).setBorder(
    true, true, true, true, true, true,
    '#d3d3d3', SpreadsheetApp.BorderStyle.SOLID
  );
}

// ============================================================
// NOTE: Shared functions moved to utils shared.gs
// - createSummaryDetailsText()
// - groupStudentsByCourseType()
// - createTutorTotalSummary()
// - groupOnsiteDayByDate()
// ============================================================


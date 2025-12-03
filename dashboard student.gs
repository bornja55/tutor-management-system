// ============================================================
// 📊 DASHBOARD REPORT - VERSION 1.0
// ✅ Filter ใช้ร่วมกัน (ปี, เดือน, รอบ, นักเรียน, ติวเตอร์)
// ✅ 2 ปุ่ม: รายงานนักเรียน + รายงานติวเตอร์
// ✅ Compact Layout (~17 Rows)
// ============================================================

const REPORT_CONFIG = {
  RAW_DATA_SHEET: 'บันทึกลงเวลาจาก LineBot',
  DASHBOARD_SHEET: 'Dashboard Report',
  TUTOR_DB_SHEET_ID: '1zeRKFL52PVJi4hQddB5FoMIITdtAmO3NN7CJRolRgAo',
  
  COLORS: {
    header: '#673ab7',
    filterHeader: '#34a853',
    yearPeriod: '#e8f0fe',
    month: '#f3f3f3',
    student: '#fff2cc',
    tutor: '#d9ead3',
    buttonUpdate: '#fbbc04',
    buttonStudent: '#9c27b0',
    buttonTutor: '#1a73e8',
    summaryLabel: '#e0e0e0',
    summaryValue: '#f5f5f5',
    tableHeader: '#7b1fa2',
    studentHeader: '#e1bee7',
    tutorHeader: '#bbdefb',
    statusOK: '#c8e6c9',
    statusPending: '#fff9c4'
  },
  
  RATES: {
    'online1by1': 150,
    'onsite1by1': 250,
    'onsiteGroup': 250,
    'onsiteDay': 800
  }
};

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
  dashboard.getRange('A1:L1').merge()
    .setValue('📊 Dashboard Report - รายงานการเรียน')
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground(REPORT_CONFIG.COLORS.header)
    .setFontColor('#ffffff');
  dashboard.setRowHeight(1, 45);
  
  // ============================================================
  // ROW 3: FILTER HEADER
  // ============================================================
  dashboard.getRange('A3:L3').merge()
    .setValue('🔍 เลือกเงื่อนไขการค้นหา')
    .setFontSize(11)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground(REPORT_CONFIG.COLORS.filterHeader)
    .setFontColor('#ffffff');
  dashboard.setRowHeight(3, 28);
  
  // ============================================================
  // ROW 5: ปี + รอบ + ปุ่มอัพเดต (แถวเดียว)
  // ============================================================
  // ปี
  dashboard.getRange('A5').setValue('📅 ปี').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('B5').setValue('2025').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('C5').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('D5').setValue('2026').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('E5').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  
  // รอบ
  dashboard.getRange('F5').setValue('📅 รอบ').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('G5').setValue('1-15').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('H5').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('I5').setValue('16-31').setHorizontalAlignment('center').setFontSize(9).setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  dashboard.getRange('J5').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.yearPeriod);
  
  // ปุ่มอัพเดต
  dashboard.getRange('K5:L5').merge()
    .setValue('🔄 อัพเดต')
    .setFontSize(10)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground(REPORT_CONFIG.COLORS.buttonUpdate)
    .setFontColor('#000000');
  
  dashboard.setRowHeight(5, 30);
  dashboard.getRange('A5:L5').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
  
  // ============================================================
  // ROW 7: เดือน (Label + Checkbox แถวเดียว)
  // ============================================================
  const monthShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  
  dashboard.getRange('A7').setValue('📅 เดือน').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.month);
  
  // Row 7: ชื่อเดือน
  monthShort.forEach((month, index) => {
    dashboard.getRange(7, index + 2)
      .setValue(month)
      .setHorizontalAlignment('center')
      .setFontSize(8)
      .setBackground(REPORT_CONFIG.COLORS.month);
  });
  
  // Row 8: Checkbox เดือน
  dashboard.getRange('A8').setValue('').setBackground(REPORT_CONFIG.COLORS.month);
  for (let i = 0; i < 12; i++) {
    dashboard.getRange(8, i + 2)
      .insertCheckboxes()
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.month);
  }
  
  dashboard.setRowHeight(7, 22);
  dashboard.setRowHeight(8, 25);
  dashboard.getRange('A7:M8').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
  
  // ============================================================
  // ROW 10: นักเรียน Header
  // ============================================================
  dashboard.getRange('A10').setValue('👤 นักเรียน').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('B10').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('C10').setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('D10:M10').merge().setValue('(กด "อัพเดต" เพื่อแสดงรายชื่อ)').setFontSize(8).setFontColor('#999999').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.setRowHeight(10, 25);
  
  // ROW 11-12: Placeholder นักเรียน (Label + Checkbox)
  dashboard.getRange('A11:M11').setBackground('#fffde7');
  dashboard.getRange('A12:M12').setBackground('#fffde7');
  dashboard.setRowHeight(11, 20);
  dashboard.setRowHeight(12, 22);
  dashboard.getRange('A10:M12').setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
  
  // ============================================================
  // ROW 14: ติวเตอร์ Header
  // ============================================================
  dashboard.getRange('A14').setValue('👨‍🏫 ติวเตอร์').setFontWeight('bold').setFontSize(10).setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.getRange('B14').insertCheckboxes().setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.getRange('C14').setValue('ทั้งหมด').setFontSize(9).setFontColor('#ea4335').setFontWeight('bold').setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.getRange('D14:M14').merge().setValue('(กด "อัพเดต" เพื่อแสดงรายชื่อ)').setFontSize(8).setFontColor('#999999').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.tutor);
  dashboard.setRowHeight(14, 25);
  
  // ROW 15-16: Placeholder ติวเตอร์ (Label + Checkbox)
  dashboard.getRange('A15:M15').setBackground('#e8f5e9');
  dashboard.getRange('A16:M16').setBackground('#e8f5e9');
  dashboard.setRowHeight(15, 20);
  dashboard.setRowHeight(16, 22);
  dashboard.getRange('A14:M16').setBorder(true, true, true, true, null, null, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
  
  // ============================================================
  // ROW 18: ปุ่มสร้างรายงาน (2 ปุ่ม)
  // ============================================================
  dashboard.getRange('A18:F18').merge()
    .setValue('📚 รายงานนักเรียน')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground(REPORT_CONFIG.COLORS.buttonStudent)
    .setFontColor('#ffffff');
  
  dashboard.getRange('G18:L18').merge()
    .setValue('👨‍🏫 รายงานติวเตอร์')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground(REPORT_CONFIG.COLORS.buttonTutor)
    .setFontColor('#ffffff');
  
  dashboard.setRowHeight(18, 40);
  
  // ============================================================
  // ROW 20-21: Summary Cards
  // ============================================================
  setupSummaryCardsTemplate(dashboard, 20);
  
  // ============================================================
  // ROW 23: Table Header
  // ============================================================
  dashboard.getRange('A23:L23').merge()
    .setValue('📊 รายละเอียด')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground(REPORT_CONFIG.COLORS.tableHeader)
    .setFontColor('#ffffff');
  dashboard.setRowHeight(23, 32);
  
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
  
  dashboard.setFrozenRows(23);
  
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
  const labels = ['📚 รวมชั่วโมง', '⏳ คงเหลือ', '👥 จำนวน', '✅ คอร์สจบ'];
  
  let col = 1;
  labels.forEach((label, index) => {
    dashboard.getRange(startRow, col, 1, 3).merge()
      .setValue(label)
      .setFontSize(10)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.summaryLabel);
    
    dashboard.getRange(startRow + 1, col, 1, 3).merge()
      .setValue('-')
      .setFontSize(14)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setBackground(REPORT_CONFIG.COLORS.summaryValue);
    
    col += 3;
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
  const rawData = ss.getSheetByName(REPORT_CONFIG.RAW_DATA_SHEET);
  
  if (!dashboard || !rawData) {
    SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น');
    return;
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast('กำลังอัพเดต...', '⏳ กรุณารอ', 3);
  
  // Get selected filters
  const selectedYears = getSelectedYears(dashboard);
  const selectedMonths = getSelectedMonths(dashboard);
  
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
  
  // Filter data
  const filteredData = filterDataByYearMonth(rawData, selectedYears, selectedMonths);
  
  Logger.log('✅ Filtered: ' + filteredData.length + ' rows');
  
  if (filteredData.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ ไม่พบข้อมูลในช่วงเวลาที่เลือก');
    return;
  }
  
  // Get unique students & tutors
  const students = getUniqueStudents(filteredData);
  const tutors = getUniqueTutors(filteredData);
  
  Logger.log('👤 Students: ' + students.length);
  Logger.log('👨‍🏫 Tutors: ' + tutors.length);
  
  // Display Student Checkboxes (Row 11-12)
  displayCheckboxRow(dashboard, students, 11, 12, '#fffde7');
  
  // Display Tutor Checkboxes (Row 15-16)
  displayCheckboxRow(dashboard, tutors, 15, 16, '#e8f5e9');
  
  // Update placeholder text
  dashboard.getRange('D10:M10').merge().setValue('(' + students.length + ' คน)').setFontSize(8).setFontColor('#666666').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.student);
  dashboard.getRange('D14:M14').merge().setValue('(' + tutors.length + ' คน)').setFontSize(8).setFontColor('#666666').setFontStyle('italic').setBackground(REPORT_CONFIG.COLORS.tutor);
  
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
// ============================================================
function displayCheckboxRow(dashboard, items, labelRow, checkboxRow, bgColor) {
  // Clear old data
  dashboard.getRange(labelRow, 1, 1, 13).clearContent().clearDataValidations();
  dashboard.getRange(checkboxRow, 1, 1, 13).clearContent().clearDataValidations();
  dashboard.getRange(labelRow, 1, 1, 13).setBackground(bgColor);
  dashboard.getRange(checkboxRow, 1, 1, 13).setBackground(bgColor);
  
  if (items.length === 0) return;
  
  // Display up to 12 items per row
  const maxItems = Math.min(items.length, 12);
  
  for (let i = 0; i < maxItems; i++) {
    // Label
    dashboard.getRange(labelRow, i + 1)
      .setValue(items[i])
      .setHorizontalAlignment('center')
      .setFontSize(8)
      .setBackground(bgColor);
    
    // Checkbox
    dashboard.getRange(checkboxRow, i + 1)
      .insertCheckboxes()
      .setHorizontalAlignment('center')
      .setBackground(bgColor);
  }
  
  // If more than 12, show indicator
  if (items.length > 12) {
    dashboard.getRange(labelRow, 13)
      .setValue('+' + (items.length - 12) + ' อื่นๆ')
      .setFontSize(7)
      .setFontColor('#999999')
      .setHorizontalAlignment('center');
  }
}

// ============================================================
// 📅 GET SELECTED YEARS
// ============================================================
function getSelectedYears(dashboard) {
  const years = [];
  
  // 2025: C5
  if (dashboard.getRange('C5').getValue() === true) {
    years.push(2025);
  }
  
  // 2026: E5
  if (dashboard.getRange('E5').getValue() === true) {
    years.push(2026);
  }
  
  return years;
}

// ============================================================
// 📅 GET SELECTED MONTHS
// ============================================================
function getSelectedMonths(dashboard) {
  const months = [];
  
  for (let i = 0; i < 12; i++) {
    if (dashboard.getRange(8, i + 2).getValue() === true) {
      months.push(i); // 0-11
    }
  }
  
  return months;
}

// ============================================================
// 📅 GET SELECTED PERIODS
// ============================================================
function getSelectedPeriods(dashboard) {
  const periods = [];
  
  // 1-15: H5
  if (dashboard.getRange('H5').getValue() === true) {
    periods.push('1-15');
  }
  
  // 16-31: J5
  if (dashboard.getRange('J5').getValue() === true) {
    periods.push('16-31');
  }
  
  return periods;
}

// ============================================================
// 🔍 FILTER DATA BY YEAR/MONTH
// ============================================================
function filterDataByYearMonth(rawDataSheet, selectedYears, selectedMonths) {
  const allData = rawDataSheet.getDataRange().getValues();
  const filtered = [];
  
  for (let i = 1; i < allData.length; i++) {
    const row = allData[i];
    const reportDate = row[6];
    
    if (!reportDate) continue;
    
    try {
      let month, year;
      
      if (reportDate instanceof Date && !isNaN(reportDate.getTime())) {
        month = reportDate.getMonth();
        year = reportDate.getFullYear();
      } else {
        const dateStr = String(reportDate).replace(/^'/, '').trim();
        const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!match) continue;
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
      }
      
      // Check year
      if (!selectedYears.includes(year)) continue;
      
      // Check month
      if (!selectedMonths.includes(month)) continue;
      
      filtered.push(row);
      
    } catch (e) {
      // Skip
    }
  }
  
  return filtered;
}

// ============================================================
// 🔍 FILTER DATA BY PERIOD
// ============================================================
function filterDataByPeriodReport(data, selectedPeriods) {
  if (selectedPeriods.length === 0) return data;
  
  return data.filter(row => {
    const reportDate = row[6];
    if (!reportDate) return false;
    
    let day;
    
    if (reportDate instanceof Date && !isNaN(reportDate.getTime())) {
      day = reportDate.getDate();
    } else {
      const dateStr = String(reportDate).replace(/^'/, '').trim();
      const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (!match) return false;
      day = parseInt(match[1]);
    }
    
    for (const period of selectedPeriods) {
      if (period === '1-15' && day >= 1 && day <= 15) return true;
      if (period === '16-31' && day >= 16) return true;
    }
    
    return false;
  });
}

// ============================================================
// 👤 GET UNIQUE STUDENTS
// ============================================================
function getUniqueStudents(filteredData) {
  const students = new Set();
  filteredData.forEach(row => {
    const student = row[5];
    if (student) students.add(String(student));
  });
  return Array.from(students).sort((a, b) => a.localeCompare(b, 'th'));
}

// ============================================================
// 👨‍🏫 GET UNIQUE TUTORS
// ============================================================
function getUniqueTutors(filteredData) {
  const tutors = new Set();
  filteredData.forEach(row => {
    const tutor = row[3];
    if (tutor) tutors.add(String(tutor));
  });
  return Array.from(tutors).sort((a, b) => a.localeCompare(b, 'th'));
}

// ============================================================
// 👤 GET SELECTED STUDENTS
// ============================================================
function getSelectedStudentsReport(dashboard) {
  // Check "ทั้งหมด"
  if (dashboard.getRange('B10').getValue() === true) {
    return [];
  }
  
  const selected = [];
  const labels = dashboard.getRange(11, 1, 1, 12).getValues()[0];
  const checks = dashboard.getRange(12, 1, 1, 12).getValues()[0];
  
  for (let i = 0; i < 12; i++) {
    if (checks[i] === true && labels[i]) {
      selected.push(String(labels[i]));
    }
  }
  
  return selected;
}

// ============================================================
// 👨‍🏫 GET SELECTED TUTORS
// ============================================================
function getSelectedTutorsReport(dashboard) {
  // Check "ทั้งหมด"
  if (dashboard.getRange('B14').getValue() === true) {
    return [];
  }
  
  const selected = [];
  const labels = dashboard.getRange(15, 1, 1, 12).getValues()[0];
  const checks = dashboard.getRange(16, 1, 1, 12).getValues()[0];
  
  for (let i = 0; i < 12; i++) {
    if (checks[i] === true && labels[i]) {
      selected.push(String(labels[i]));
    }
  }
  
  return selected;
}

// ============================================================
// 📚 GENERATE STUDENT REPORT
// ============================================================
function generateStudentReportNew() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(REPORT_CONFIG.DASHBOARD_SHEET);
  const rawData = ss.getSheetByName(REPORT_CONFIG.RAW_DATA_SHEET);
  
  if (!dashboard || !rawData) {
    SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น');
    return;
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast('กำลังสร้างรายงานนักเรียน...', '⏳ กรุณารอ', 3);
  
  // Get all filters
  const selectedYears = getSelectedYears(dashboard);
  const selectedMonths = getSelectedMonths(dashboard);
  const selectedPeriods = getSelectedPeriods(dashboard);
  const selectedStudents = getSelectedStudentsReport(dashboard);
  const selectedTutors = getSelectedTutorsReport(dashboard);
  
  if (selectedYears.length === 0 || selectedMonths.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ กรุณาเลือกปีและเดือนก่อน');
    return;
  }
  
  // Filter data
  let filteredData = filterDataByYearMonth(rawData, selectedYears, selectedMonths);
  filteredData = filterDataByPeriodReport(filteredData, selectedPeriods);
  
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
  
  // Update Summary Cards (Student version)
  updateSummaryCardsStudent(dashboard, summary);
  
  // Display Student Details
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
function generateTutorReportNew() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(REPORT_CONFIG.DASHBOARD_SHEET);
  const rawData = ss.getSheetByName(REPORT_CONFIG.RAW_DATA_SHEET);
  
  if (!dashboard || !rawData) {
    SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น');
    return;
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast('กำลังสร้างรายงานติวเตอร์...', '⏳ กรุณารอ', 3);
  
  // Get all filters
  const selectedYears = getSelectedYears(dashboard);
  const selectedMonths = getSelectedMonths(dashboard);
  const selectedPeriods = getSelectedPeriods(dashboard);
  const selectedStudents = getSelectedStudentsReport(dashboard);
  const selectedTutors = getSelectedTutorsReport(dashboard);
  
  if (selectedYears.length === 0 || selectedMonths.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ กรุณาเลือกปีและเดือนก่อน');
    return;
  }
  
  // Filter data
  let filteredData = filterDataByYearMonth(rawData, selectedYears, selectedMonths);
  filteredData = filterDataByPeriodReport(filteredData, selectedPeriods);
  
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
  
  // Load TutorDB
  const tutorLookup = loadTutorDBReport();
  
  // Group by Tutor
  const { summary, dataMap } = groupByTutor(filteredData, tutorLookup);
  
  // Clear old data
  clearReportData(dashboard);
  
  // Update Summary Cards (Tutor version)
  updateSummaryCardsTutor(dashboard, summary);
  
  // Display Tutor Details
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
        tutors: new Set()
      });
    }
    
    const data = studentMap.get(student);
    data.tutors.add(tutor);
    
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
    
    summary.totalHours += data.usedHours;
    summary.totalRemaining += data.remainingHours;
    if (data.isCompleted) summary.completedCourses++;
  });
  
  return { summary, dataMap: studentMap };
}

// ============================================================
// 📊 GROUP BY TUTOR
// ============================================================
function groupByTutor(filteredData, tutorLookup) {
  const tutorMap = new Map();
  
  filteredData.forEach(row => {
    const tutor = row[3];
    const tutorId = row[4];
    const student = row[5];
    const date = row[6];
    const time = row[7];
    const totalHours = parseFloat(row[10]) || 0;
    const remaining = parseFloat(row[11]) || 0;
    const courseType = row[13] || 'online1by1';
    const duration = parseFloat(row[14]) || 0;
    
    if (!tutor) return;
    
    if (!tutorMap.has(tutor)) {
      const fullName = matchTutorNameReport(tutor, tutorId, tutorLookup);
      
      tutorMap.set(tutor, {
        displayName: tutor,
        fullName: fullName,
        sessions: [],
        students: new Set()
      });
    }
    
    const data = tutorMap.get(tutor);
    data.students.add(student);
    
    const rate = REPORT_CONFIG.RATES[courseType] || 150;
    const amount = remaining === 0 ? (totalHours * rate) : 0;
    
    data.sessions.push({
      date: date,
      time: time,
      student: student,
      duration: duration,
      totalHours: totalHours,
      remaining: remaining,
      courseType: courseType,
      amount: amount,
      status: remaining === 0 ? '✅' : '⏳'
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
// 📅 PARSE DATE VALUE
// ============================================================
function parseDateValue(dateValue) {
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue;
  }
  
  const dateStr = String(dateValue).replace(/^'/, '').trim();
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }
  
  return new Date(0);
}

// ============================================================
// 📅 FORMAT DATE STRING
// ============================================================
function formatDateString(dateValue) {
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    const day = String(dateValue.getDate()).padStart(2, '0');
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const year = dateValue.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  const dateStr = String(dateValue).replace(/^'/, '').trim();
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  
  if (match) {
    return `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`;
  }
  
  return dateStr;
}

// ============================================================
// 📖 LOAD TUTOR DB
// ============================================================
function loadTutorDBReport() {
  try {
    const paymentSS = SpreadsheetApp.openById(REPORT_CONFIG.TUTOR_DB_SHEET_ID);
    const tutorDB = paymentSS.getSheetByName('TutorDB');
    
    if (!tutorDB) return new Map();
    
    const tutorData = tutorDB.getDataRange().getValues();
    const lookup = new Map();
    
    for (let i = 1; i < tutorData.length; i++) {
      const row = tutorData[i];
      const fullName = row[0];
      const lineDisplay = row[11];
      const lineId = row[12];
      
      if (!fullName) continue;
      
      if (lineDisplay) lookup.set(String(lineDisplay).trim(), fullName);
      if (lineId) lookup.set(String(lineId).trim(), fullName);
      lookup.set(String(fullName).trim(), fullName);
    }
    
    return lookup;
  } catch (error) {
    Logger.log('Error loading TutorDB: ' + error.message);
    return new Map();
  }
}

// ============================================================
// 🔍 MATCH TUTOR NAME
// ============================================================
function matchTutorNameReport(displayName, lineId, tutorLookup) {
  if (!displayName) return '(ไม่มีชื่อ)';
  
  const displayTrim = String(displayName).trim();
  
  if (tutorLookup.has(displayTrim)) {
    return tutorLookup.get(displayTrim);
  }
  
  if (lineId) {
    const idTrim = String(lineId).trim();
    if (tutorLookup.has(idTrim)) {
      return tutorLookup.get(idTrim);
    }
  }
  
  return displayName;
}

// ============================================================
// 🗑️ CLEAR REPORT DATA
// ============================================================
function clearReportData(dashboard) {
  const lastRow = dashboard.getLastRow();
  if (lastRow > 24) {
    dashboard.getRange(24, 1, lastRow - 23, 13).clearContent().clearFormat();
  }
}

// ============================================================
// 📊 UPDATE SUMMARY CARDS - STUDENT
// ============================================================
function updateSummaryCardsStudent(dashboard, summary) {
  // Update labels
  dashboard.getRange(20, 1, 1, 3).merge().setValue('📚 รวมชั่วโมง').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(20, 4, 1, 3).merge().setValue('⏳ คงเหลือ').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(20, 7, 1, 3).merge().setValue('👥 นักเรียน').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(20, 10, 1, 3).merge().setValue('✅ คอร์สจบ').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  
  // Update values
  dashboard.getRange(21, 1, 1, 3).merge().setValue(summary.totalHours.toFixed(1)).setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(21, 4, 1, 3).merge().setValue(summary.totalRemaining.toFixed(1) + ' ชม.').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(21, 7, 1, 3).merge().setValue(summary.totalCount + ' คน').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(21, 10, 1, 3).merge().setValue(summary.completedCourses + ' คอร์ส').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
}

// ============================================================
// 📊 UPDATE SUMMARY CARDS - TUTOR
// ============================================================
function updateSummaryCardsTutor(dashboard, summary) {
  // Update labels
  dashboard.getRange(20, 1, 1, 3).merge().setValue('📚 รวมชั่วโมง').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(20, 4, 1, 3).merge().setValue('💰 ยอดเงิน').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(20, 7, 1, 3).merge().setValue('👨‍🏫 ติวเตอร์').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  dashboard.getRange(20, 10, 1, 3).merge().setValue('✅ คอร์สจบ').setFontSize(10).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryLabel);
  
  // Update values
  dashboard.getRange(21, 1, 1, 3).merge().setValue(summary.totalHours.toFixed(1)).setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(21, 4, 1, 3).merge().setValue(summary.totalAmount.toLocaleString() + ' บาท').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(21, 7, 1, 3).merge().setValue(summary.totalCount + ' คน').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
  dashboard.getRange(21, 10, 1, 3).merge().setValue(summary.completedCourses + ' คอร์ส').setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center').setBackground(REPORT_CONFIG.COLORS.summaryValue);
}

// ============================================================
// 📚 DISPLAY STUDENT REPORT
// ============================================================
function displayStudentReport(dashboard, studentMap) {
  let currentRow = 24;
  
  // Sort students A-Z
  const sortedStudents = Array.from(studentMap.keys()).sort((a, b) => 
    a.localeCompare(b, 'th')
  );
  
  sortedStudents.forEach((student, index) => {
    const data = studentMap.get(student);
    
    // Student Header
    const headerText = `👤 ${student} | 📚 ชม.รวม: ${data.totalHours} | ✅ ใช้ไป: ${data.usedHours.toFixed(1)} | ⏳ คงเหลือ: ${data.remainingHours.toFixed(1)}`;
    
    dashboard.getRange(currentRow, 1, 1, 12).merge()
      .setValue(headerText)
      .setFontSize(10)
      .setFontWeight('bold')
      .setHorizontalAlignment('left')
      .setBackground(REPORT_CONFIG.COLORS.studentHeader);
    dashboard.setRowHeight(currentRow, 28);
    currentRow++;
    
    // Table Headers
    const headers = ['วันที่', 'เวลา', 'ติวเตอร์', 'ชม.', 'คงเหลือ', 'Book', 'Topic', 'Feedback', 'Status', '', '', ''];
    
    dashboard.getRange(currentRow, 1, 1, 12)
      .setValues([headers])
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
        session.feedback || '',
        session.status,
        '', '', ''
      ];
      
      dashboard.getRange(currentRow, 1, 1, 12).setValues([rowData]);

      // Set alignment for all cells: Middle + Center + Wrap
      dashboard.getRange(currentRow, 1, 1, 12)
        .setVerticalAlignment('middle')
        .setHorizontalAlignment('center')
        .setWrap(true)
        .setFontSize(8);

      dashboard.getRange(currentRow, 4).setNumberFormat('#,##0.0');
      dashboard.getRange(currentRow, 5).setNumberFormat('#,##0.0');
      
      // Conditional Formatting
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

// ============================================================
// 👨‍🏫 DISPLAY TUTOR REPORT
// ============================================================
function displayTutorReport(dashboard, tutorMap) {
  let currentRow = 24;
  
  // Sort tutors A-Z
  const sortedTutors = Array.from(tutorMap.keys()).sort((a, b) => 
    a.localeCompare(b, 'th')
  );
  
  sortedTutors.forEach((tutor, index) => {
    const data = tutorMap.get(tutor);
    
    // Tutor Header
    const headerText = `👨‍🏫 ${data.displayName} (${data.fullName}) | 📚 ชม.รวม: ${data.totalDuration.toFixed(1)} | 💰 ยอดเงิน: ${data.totalAmount.toLocaleString()} บาท`;
    
    dashboard.getRange(currentRow, 1, 1, 12).merge()
      .setValue(headerText)
      .setFontSize(10)
      .setFontWeight('bold')
      .setHorizontalAlignment('left')
      .setBackground(REPORT_CONFIG.COLORS.tutorHeader);
    dashboard.setRowHeight(currentRow, 28);
    currentRow++;
    
    // Table Headers
    const headers = ['วันที่', 'เวลา', 'นักเรียน', 'ชม.', 'Total', 'คงเหลือ', 'Course Type', 'ยอดเงิน', 'Status', '', '', ''];
    
    dashboard.getRange(currentRow, 1, 1, 12)
      .setValues([headers])
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
        session.student || '',
        session.duration,
        session.totalHours,
        session.remaining,
        session.courseType || '',
        session.amount,
        session.status,
        '', '', ''
      ];
      
      dashboard.getRange(currentRow, 1, 1, 12).setValues([rowData]);

      // Set alignment for all cells: Middle + Center + Wrap
      dashboard.getRange(currentRow, 1, 1, 12)
        .setVerticalAlignment('middle')
        .setHorizontalAlignment('center')
        .setWrap(true)
        .setFontSize(8);

      dashboard.getRange(currentRow, 4).setNumberFormat('#,##0.0');
      dashboard.getRange(currentRow, 5).setNumberFormat('#,##0.0');
      dashboard.getRange(currentRow, 6).setNumberFormat('#,##0.0');
      dashboard.getRange(currentRow, 8).setNumberFormat('#,##0');
      
      // Conditional Formatting
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
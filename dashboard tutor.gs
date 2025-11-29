// ============================================================
// 📊 DASHBOARD COMPLETE - VERSION 6.0 FINAL
// ✅ ติวเตอร์อัพเดตตามช่วงเวลา (Dynamic)
// ✅ ฟอนต์เล็กลง ประหยัดพื้นที่ (Compact)
// ✅ แสดงรายละเอียดแต่ละนักเรียน
// ✅ Checkbox "ทั้งหมด"
// ✅ ลบ separator แถว 15
// ============================================================

const DASH_CONFIG = {
  RAW_DATA_SHEET: 'บันทึกลงเวลาจาก LineBot',
  DASHBOARD_SHEET: 'Dashboard',
  TUTOR_DB_FILE_ID: '1zeRKFL52PVJi4hQddB5FoMIITdtAmO3NN7CJRolRgAo',
  
  RECENT_MONTHS: 3,
  
  RATES: {
    'online1by1': 150,
    'onsite1by1': 250,
    'onsiteGroup': 250
  }
};

// ============================================================
// 🔧 SETUP DASHBOARD
// ============================================================
function setupDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName(DASH_CONFIG.DASHBOARD_SHEET);
  
  if (!dashboard) {
    dashboard = ss.insertSheet(DASH_CONFIG.DASHBOARD_SHEET);
  }
  
  dashboard.clear();
  dashboard.clearConditionalFormatRules();
  const lastRow = dashboard.getMaxRows();
  const lastCol = dashboard.getMaxColumns();
  dashboard.getRange(1, 1, lastRow, lastCol).clearDataValidations();
  
  // ============================================================
  // ROW 1: HEADER
  // ============================================================
  dashboard.getRange('A1:L1').merge()
    .setValue('📊 Dashboard - รายงานสรุปการสอน')
    .setFontSize(16)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#1a73e8')
    .setFontColor('#ffffff');
  dashboard.setRowHeight(1, 45);
  
  // ============================================================
  // ROW 3: FILTER SECTION
  // ============================================================
  dashboard.getRange('A3:L3').merge()
    .setValue('🔍 เลือกเงื่อนไขการค้นหา')
    .setFontSize(11)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#34a853')
    .setFontColor('#ffffff');
  dashboard.setRowHeight(3, 28);
  
  // ============================================================
  // ROW 5: PERIOD HEADER
  // ============================================================
  dashboard.getRange('A5:C5').merge()
    .setValue('📅 เลือกช่วงเวลา')
    .setFontSize(10)
    .setFontWeight('bold')
    .setBackground('#e8f0fe')
    .setHorizontalAlignment('center');
  dashboard.setRowHeight(5, 25);
  
  dashboard.getRange('A6').setValue('เดือน/ปี').setFontWeight('bold').setFontSize(9).setHorizontalAlignment('center').setBackground('#f3f3f3');
  dashboard.getRange('B6').setValue('1-15').setFontWeight('bold').setFontSize(9).setHorizontalAlignment('center').setBackground('#f3f3f3');
  dashboard.getRange('C6').setValue('16-30').setFontWeight('bold').setFontSize(9).setHorizontalAlignment('center').setBackground('#f3f3f3');
  
  dashboard.getRange('A6:C6').setBorder(
    true, true, true, true, true, true,
    '#cccccc', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  );
  
  // ============================================================
  // ROW 7+: PERIOD CHECKBOXES
  // ============================================================
  const monthCount = setupPeriodCheckboxes(dashboard);
  
  // ============================================================
  // TUTOR SECTION (Column E+)
  // ============================================================
  dashboard.getRange('E5:L5').merge()
    .setValue('👤 เลือกติวเตอร์ (จะแสดงตามช่วงเวลาที่เลือก)')
    .setFontSize(10)
    .setFontWeight('bold')
    .setBackground('#e8f0fe')
    .setHorizontalAlignment('center');
  
  // Checkbox "ทั้งหมด"
  dashboard.getRange('E6')
    .insertCheckboxes()
    .setHorizontalAlignment('center')
    .setBackground('#fff2cc');
  
  dashboard.getRange('F6')
    .setValue('✅ ทั้งหมด')
    .setFontWeight('bold')
    .setFontSize(9)
    .setFontColor('#ea4335')
    .setBackground('#fff2cc');
  
  dashboard.getRange('G6:L6').merge()
    .setValue('(กด "🔄 อัพเดตติวเตอร์" เพื่ออัพเดต)')
    .setFontSize(8)
    .setFontColor('#666666')
    .setFontStyle('italic')
    .setBackground('#fff2cc');
  
  dashboard.getRange('E6:L6').setBorder(
    true, true, true, true, true, true,
    '#fbbc04', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  );
  
  // Placeholder
  dashboard.getRange('E7:L7').merge()
    .setValue('💡 กรุณาเลือกช่วงเวลา แล้วกด "🔄 อัพเดตติวเตอร์"')
    .setFontSize(9)
    .setFontColor('#999999')
    .setFontStyle('italic')
    .setHorizontalAlignment('center');
  
  // ============================================================
  // BUTTON SECTION
  // ============================================================
  const buttonRow = Math.max(7 + monthCount, 8) + 1;
  
  dashboard.getRange(buttonRow, 1, 1, 4).merge()
    .setValue('🔄 อัพเดตติวเตอร์')
    .setFontSize(11)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#fbbc04')
    .setFontColor('#000000');
  dashboard.setRowHeight(buttonRow, 35);
  
  dashboard.getRange(buttonRow, 5, 1, 4).merge()
    .setValue('📊 สร้างรายงาน')
    .setFontSize(11)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#34a853')
    .setFontColor('#ffffff');
  
  dashboard.getRange(buttonRow, 9, 1, 4).merge()
    .setValue('💡 เลือก Checkbox → อัพเดตติวเตอร์ → สร้างรายงาน')
    .setFontSize(8)
    .setFontColor('#666666')
    .setWrap(true)
    .setVerticalAlignment('middle');
  
  // ============================================================
  // TABLE HEADER
  // ============================================================
  const tableHeaderRow = buttonRow + 2;
  setupTableHeader(dashboard, tableHeaderRow);
  
  // ============================================================
  // COLUMN WIDTHS
  // ============================================================
  dashboard.setColumnWidth(1, 100);
  dashboard.setColumnWidth(2, 130);
  dashboard.setColumnWidth(3, 70);
  dashboard.setColumnWidth(4, 90);
  dashboard.setColumnWidth(5, 70);
  dashboard.setColumnWidth(6, 70);
  dashboard.setColumnWidth(7, 70);
  dashboard.setColumnWidth(8, 90);
  dashboard.setColumnWidth(9, 100);
  dashboard.setColumnWidth(10, 130);
  
  dashboard.setFrozenRows(tableHeaderRow);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Setup Dashboard สำเร็จ!\n\n' +
    'ขั้นตอนการใช้งาน:\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '1. เลือก Checkbox ช่วงเวลา\n' +
    '2. กด Menu: อัพเดตติวเตอร์\n' +
    '3. เลือก Checkbox ติวเตอร์\n' +
    '4. กด Menu: สร้างรายงาน\n\n' +
    '💡 ติวเตอร์จะแสดงเฉพาะที่มีข้อมูล\nในช่วงเวลาที่เลือก!',
    '✅ พร้อมใช้งาน',
    10
  );
}

// ============================================================
// 📅 SETUP PERIOD CHECKBOXES (แก้ไขแล้ว - Fix ปี พ.ศ.)
// ============================================================
function setupPeriodCheckboxes(dashboard) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawData = ss.getSheetByName(DASH_CONFIG.RAW_DATA_SHEET);
  
  if (!rawData) return 0;
  
  const lastRow = rawData.getLastRow();
  if (lastRow < 2) return 0;
  
  const dates = rawData.getRange(2, 7, lastRow - 1, 1).getValues();
  
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const monthYearSet = new Set();
  
  dates.forEach(row => {
    const dateValue = row[0];
    if (!dateValue) return;
    
    try {
      let month, year;
      
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        // Date Object
        month = dateValue.getMonth() + 1;
        year = dateValue.getFullYear();
      } else {
        // String - Parse DD/MM/YYYY
        const dateStr = String(dateValue).replace(/^'/, '');
        const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!match) return;
        month = parseInt(match[2]);
        year = parseInt(match[3]);
      }
      
      // ⭐ แก้ไข: แปลงปี ค.ศ. เป็น พ.ศ. อย่างถูกต้อง
      let buddhistYear;
      if (year > 2500) {
        // ถ้าเป็น พ.ศ. อยู่แล้ว (เช่น 2568)
        buddhistYear = year;
      } else if (year >= 1900 && year <= 2100) {
        // ถ้าเป็น ค.ศ. (เช่น 2025)
        buddhistYear = year + 543;
      } else {
        // ปีผิดปกติ - ข้าม
        return;
      }
      
      const monthYear = monthNames[month - 1] + ' ' + buddhistYear;
      monthYearSet.add(monthYear);
      
    } catch (e) {
      // Skip
    }
  });
  
  // เรียง (ใหม่ไปเก่า)
  const sortedMonthYears = Array.from(monthYearSet).sort((a, b) => {
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    
    if (yearA !== yearB) {
      return parseInt(yearB) - parseInt(yearA);
    }
    
    return monthNames.indexOf(monthB) - monthNames.indexOf(monthA);
  });
  
  const recentMonths = sortedMonthYears.slice(0, DASH_CONFIG.RECENT_MONTHS);
  
  Logger.log('✅ Period Checkboxes:');
  recentMonths.forEach((monthYear, i) => {
    Logger.log('  ' + (i + 1) + '. "' + monthYear + '"');
  });
  
  let row = 7;
  recentMonths.forEach((monthYear, index) => {
    dashboard.getRange(row, 1)
      .setValue(monthYear)
      .setHorizontalAlignment('left')
      .setFontSize(9)
      .setFontWeight(index === 0 ? 'bold' : 'normal')
      .setFontColor(index === 0 ? '#1a73e8' : '#000000')
      .setBackground(index % 2 === 0 ? '#ffffff' : '#f9f9f9');
    
    dashboard.getRange(row, 2)
      .insertCheckboxes()
      .setHorizontalAlignment('center')
      .setBackground(index % 2 === 0 ? '#ffffff' : '#f9f9f9');
    
    dashboard.getRange(row, 3)
      .insertCheckboxes()
      .setHorizontalAlignment('center')
      .setBackground(index % 2 === 0 ? '#ffffff' : '#f9f9f9');
    
    row++;
  });
  
  if (recentMonths.length > 0) {
    dashboard.getRange(7, 1, recentMonths.length, 3).setBorder(
      true, true, true, true, true, true,
      '#d3d3d3', SpreadsheetApp.BorderStyle.SOLID
    );
  }
  
  const totalMonths = sortedMonthYears.length;
  const hiddenMonths = totalMonths - recentMonths.length;
  
  if (hiddenMonths > 0) {
    dashboard.getRange(row, 1, 1, 3).merge()
      .setValue('💡 มีข้อมูลเก่าอีก ' + hiddenMonths + ' เดือน')
      .setFontColor('#999999')
      .setFontSize(8)
      .setFontStyle('italic')
      .setHorizontalAlignment('center');
  }
  
  return recentMonths.length;
}

// ============================================================
// 🔄 UPDATE TUTOR CHECKBOXES (แก้ไขแล้ว - มี Debug)
// ============================================================
function updateTutorCheckboxes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(DASH_CONFIG.DASHBOARD_SHEET);
  const rawData = ss.getSheetByName(DASH_CONFIG.RAW_DATA_SHEET);
  
  if (!dashboard || !rawData) {
    SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น');
    return;
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'กำลังอัพเดตติวเตอร์...',
    '⏳ กรุณารอ',
    3
  );
  
  const selectedPeriods = getSelectedPeriods(dashboard);
  
  if (selectedPeriods.length === 0) {
    SpreadsheetApp.getUi().alert(
      '⚠️ กรุณาเลือก Checkbox ช่วงเวลาก่อน\n\n' +
      'จากนั้นจึงกด Menu: อัพเดตติวเตอร์'
    );
    return;
  }
  
  // ⭐ Debug: แสดงช่วงเวลาที่เลือก
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('🔍 DEBUG: updateTutorCheckboxes');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('📅 Selected Periods:');
  selectedPeriods.forEach((p, i) => {
    Logger.log('  ' + (i + 1) + '. "' + p.monthYear + '" - ' + p.period);
  });
  
  // ⭐ อ่านข้อมูลทั้งหมด
  const lastRow = rawData.getLastRow();
  Logger.log('\n📊 Raw Data:');
  Logger.log('  Total Rows: ' + lastRow);
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('❌ ไม่มีข้อมูลใน Raw Data');
    return;
  }
  
  // ⭐ ดูตัวอย่างวันที่ 5 แถวแรก
  const sampleDates = rawData.getRange(2, 7, Math.min(5, lastRow - 1), 1).getValues();
  Logger.log('\n📅 Sample Dates (5 rows):');
  sampleDates.forEach((row, i) => {
    const dateValue = row[0];
    const dateStr = String(dateValue).replace(/^'/, '');
    Logger.log('  ' + (i + 2) + '. "' + dateStr + '" (Type: ' + typeof dateValue + ')');
  });
  
  // ⭐ กรองข้อมูล
  const filteredData = filterDataByPeriod(rawData, selectedPeriods);
  
  Logger.log('\n✅ Filtered Data: ' + filteredData.length + ' rows');
  
  // ⭐ หาติวเตอร์
  const tutorsInPeriod = new Set();
  const tutorCounts = {};
  
  filteredData.forEach(row => {
    const tutor = row[3];
    if (tutor) {
      const tutorStr = String(tutor);
      tutorsInPeriod.add(tutorStr);
      tutorCounts[tutorStr] = (tutorCounts[tutorStr] || 0) + 1;
    }
  });
  
  const uniqueTutors = Array.from(tutorsInPeriod).sort();
  
  Logger.log('\n👤 Tutors Found: ' + uniqueTutors.length);
  uniqueTutors.forEach((tutor, i) => {
    Logger.log('  ' + (i + 1) + '. "' + tutor + '" (' + tutorCounts[tutor] + ' rows)');
  });
  
  // ⭐ ลบ Checkbox เก่า
  dashboard.getRange('E7:L25').clearContent();
  dashboard.getRange('E7:L25').clearFormat();
  dashboard.getRange('E7:L25').clearDataValidations();
  
  if (uniqueTutors.length === 0) {
    Logger.log('\n❌ ไม่พบติวเตอร์!');
    Logger.log('\n🔍 Possible Issues:');
    Logger.log('1. วันที่ใน Raw Data ไม่ตรงกับช่วงเวลาที่เลือก');
    Logger.log('2. Format วันที่ผิด');
    Logger.log('3. Column D (Tutor) ว่าง');
    
    dashboard.getRange('E7:L7').merge()
      .setValue('⚠️ ไม่พบติวเตอร์ในช่วงเวลาที่เลือก\n(ดู Logs สำหรับรายละเอียด)')
      .setFontSize(9)
      .setFontColor('#ea4335')
      .setHorizontalAlignment('center')
      .setWrap(true);
    
    SpreadsheetApp.getUi().alert(
      '⚠️ ไม่พบติวเตอร์!\n\n' +
      'กรุณาเช็ค:\n' +
      '1. วันที่ใน Raw Data (Column G)\n' +
      '2. ช่วงเวลาที่เลือกถูกต้องหรือไม่?\n' +
      '3. ดู Logs: Apps Script → View → Logs'
    );
    return;
  }
  
  // สร้าง Checkbox ใหม่
  let row = 7;
  let col = 5;
  let count = 0;
  
  uniqueTutors.forEach((tutor, index) => {
    dashboard.getRange(row, col)
      .insertCheckboxes()
      .setHorizontalAlignment('center')
      .setBackground(row % 2 === 0 ? '#ffffff' : '#f9f9f9');
    
    dashboard.getRange(row, col + 1)
      .setValue(tutor)
      .setFontSize(9)
      .setBackground(row % 2 === 0 ? '#ffffff' : '#f9f9f9');
    
    count++;
    
    if (count % 3 === 0) {
      row++;
      col = 5;
    } else {
      col += 2;
    }
  });
  
  const tutorRows = Math.ceil(uniqueTutors.length / 3);
  
  if (uniqueTutors.length > 0) {
    dashboard.getRange(7, 5, tutorRows, 8).setBorder(
      true, true, true, true, true, true,
      '#d3d3d3', SpreadsheetApp.BorderStyle.SOLID
    );
  }
  
  Logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('✅ Success!');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ อัพเดตติวเตอร์สำเร็จ!\n\n' +
    'ช่วงเวลา: ' + selectedPeriods.length + ' ช่วง\n' +
    'ติวเตอร์: ' + uniqueTutors.length + ' คน\n\n' +
    'ดู Logs สำหรับรายละเอียด',
    '✅ สำเร็จ',
    8
  );
}

// ============================================================
// 🔍 FILTER DATA BY PERIOD (แก้ไข - รองรับทุกรูปแบบ)
// ============================================================
function filterDataByPeriod(rawDataSheet, selectedPeriods) {
  const allData = rawDataSheet.getDataRange().getValues();
  const filtered = [];
  
  const periodMap = new Map();
  selectedPeriods.forEach(p => {
    const key = p.monthYear.trim();
    if (!periodMap.has(key)) {
      periodMap.set(key, []);
    }
    periodMap.get(key).push(p.period);
  });
  
  Logger.log('\n🗺️ Period Map:');
  periodMap.forEach((periods, monthYear) => {
    Logger.log('  "' + monthYear + '" → ' + periods.join(', '));
  });
  
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  let matchCount = 0;
  let totalRows = 0;
  
  for (let i = 1; i < allData.length; i++) {
    const row = allData[i];
    const reportDate = row[6];
    
    if (!reportDate) continue;
    
    totalRows++;
    
    try {
      let day, month, year;
      
      // ⭐ แยก Parse Date Object และ String
      if (reportDate instanceof Date && !isNaN(reportDate.getTime())) {
        // Date Object
        day = reportDate.getDate();
        month = reportDate.getMonth() + 1;
        year = reportDate.getFullYear();
      } else {
        // String - ลอง Parse หลายรูปแบบ
        const dateStr = String(reportDate).replace(/^'/, '').trim();
        
        // รูปแบบ DD/MM/YYYY
        let match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        
        if (match) {
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]);
        } else {
          // รูปแบบอื่นๆ
          continue;
        }
      }
      
      // ⭐ แปลงเป็นปี พ.ศ.
      const buddhistYear = year > 2500 ? year : year + 543;
      const rowMonthYear = monthNames[month - 1] + ' ' + buddhistYear;
      
      // ⭐ Debug แถว 5 แรกที่ match
      if (matchCount < 5) {
        Logger.log('\n  Row ' + (i + 1) + ':');
        Logger.log('    Date: ' + reportDate);
        Logger.log('    Parsed: ' + day + '/' + month + '/' + year + ' → ' + rowMonthYear);
        Logger.log('    Match Period Map? ' + periodMap.has(rowMonthYear));
      }
      
      if (!periodMap.has(rowMonthYear)) continue;
      
      const periods = periodMap.get(rowMonthYear);
      let matchPeriod = false;
      
      for (const period of periods) {
        if (period === '1-15' && day >= 1 && day <= 15) {
          matchPeriod = true;
          break;
        }
        if (period === '16-30' && day >= 16) {
          matchPeriod = true;
          break;
        }
      }
      
      if (matchPeriod) {
        filtered.push(row);
        matchCount++;
      }
      
    } catch (e) {
      Logger.log('  ❌ Parse Error Row ' + (i + 1) + ': ' + e.message);
    }
  }
  
  Logger.log('\n📊 Filter Summary:');
  Logger.log('  Total Rows Checked: ' + totalRows);
  Logger.log('  Matched: ' + matchCount);
  
  return filtered;
}

// ============================================================
// 📊 SETUP TABLE HEADER
// ============================================================
function setupTableHeader(dashboard, startRow) {
  dashboard.getRange(startRow, 1, 1, 10).merge()
    .setValue('📊 รายงานสรุปการสอน (พร้อมรายละเอียดแต่ละนักเรียน)')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#ea4335')
    .setFontColor('#ffffff');
  dashboard.setRowHeight(startRow, 32);
  
  const headers = [
    'ติวเตอร์', 'ชื่อเต็ม', 'ชม.รวม', 'ยอดเงิน', 'นักเรียน',
    'คอร์สจบ', 'คอร์สค้าง', 'อัตราเฉลี่ย', 'Status', 'หมายเหตุ'
  ];
  
  dashboard.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight('bold')
    .setFontSize(9)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#4285f4')
    .setFontColor('#ffffff');
  
  dashboard.getRange(startRow + 1, 1, 1, headers.length).setBorder(
    true, true, true, true, true, true,
    '#ffffff', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  );
  
  dashboard.setRowHeight(startRow + 1, 28);
}

// ============================================================
// 🔄 GENERATE REPORT
// ============================================================
function generateReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(DASH_CONFIG.DASHBOARD_SHEET);
  const rawData = ss.getSheetByName(DASH_CONFIG.RAW_DATA_SHEET);
  
  if (!dashboard || !rawData) {
    SpreadsheetApp.getUi().alert('❌ ไม่พบ Sheet ที่จำเป็น');
    return;
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'กำลังประมวลผล...',
    '⏳ กรุณารอ',
    3
  );
  
  const selectedPeriods = getSelectedPeriods(dashboard);
  const selectedTutors = getSelectedTutors(dashboard);
  
  if (selectedPeriods.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ กรุณาเลือก Checkbox ช่วงเวลาอย่างน้อย 1 ช่วง');
    return;
  }
  
  Logger.log('📅 Periods: ' + selectedPeriods.length);
  Logger.log('👤 Tutors: ' + (selectedTutors.length === 0 ? 'ทั้งหมด' : selectedTutors.join(', ')));
  
  const tutorLookup = loadTutorDB();
  const filteredData = filterData(rawData, selectedPeriods, selectedTutors);
  
  if (filteredData.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ ไม่พบข้อมูลในช่วงเวลาที่เลือก');
    return;
  }
  
  const { summary, details } = createSummaryWithDetails(filteredData, tutorLookup);
  
  let tableHeaderRow = 15;
  for (let i = 10; i <= 30; i++) {
    const value = dashboard.getRange(i, 1).getValue();
    if (String(value).includes('รายงานสรุป')) {
      tableHeaderRow = i + 1;
      break;
    }
  }
  
  const dataStartRow = tableHeaderRow + 1;
  
  const lastRow = dashboard.getLastRow();
  if (lastRow > dataStartRow) {
    const rowsToDelete = lastRow - dataStartRow + 1;
    if (rowsToDelete > 0) {
      dashboard.getRange(dataStartRow, 1, rowsToDelete, 10).clearContent();
      dashboard.getRange(dataStartRow, 1, rowsToDelete, 10).clearFormat();
    }
  }
  
  displaySummaryWithDetails(dashboard, dataStartRow, summary, details);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ สร้างรายงานสำเร็จ!\n' +
    'ช่วงเวลา: ' + selectedPeriods.length + ' ช่วง\n' +
    'ติวเตอร์: ' + summary.length + ' คน\n' +
    'ข้อมูล: ' + filteredData.length + ' รายการ',
    '✅ สำเร็จ',
    8
  );
}

// ============================================================
// 📊 CREATE SUMMARY WITH DETAILS
// ============================================================
function createSummaryWithDetails(filteredData, tutorLookup) {
  const tutorMap = new Map();
  
  filteredData.forEach(row => {
    const tutor = row[3];
    const tutorId = row[4];
    const student = row[5];
    const totalHours = parseFloat(row[10]) || 0;
    const remaining = parseFloat(row[11]) || 0;
    const courseType = row[13];
    const duration = parseFloat(row[14]) || 0;
    
    if (!tutor || !student) return;
    
    if (!tutorMap.has(tutor)) {
      const fullName = matchTutorName(tutor, tutorId, tutorLookup);
      
      tutorMap.set(tutor, {
        displayName: tutor,
        fullName: fullName,
        totalDuration: 0,
        totalAmount: 0,
        students: new Map()
      });
    }
    
    const tutorData = tutorMap.get(tutor);
    tutorData.totalDuration += duration;
    
    if (!tutorData.students.has(student)) {
      tutorData.students.set(student, {
        studentName: student,
        durationSum: 0,
        totalHours: totalHours,
        remaining: remaining,
        courseType: courseType
      });
    }
    
    const studentData = tutorData.students.get(student);
    studentData.durationSum += duration;
    
    if (remaining < studentData.remaining || remaining === 0) {
      studentData.remaining = remaining;
      studentData.totalHours = totalHours;
      studentData.courseType = courseType;
    }
  });
  
  const summary = [];
  const details = [];
  
  tutorMap.forEach((tutorData, tutor) => {
    let totalAmount = 0;
    let coursesCompleted = 0;
    let coursesPending = 0;
    
    const studentDetails = [];
    
    tutorData.students.forEach((studentData, student) => {
      const totalHours = studentData.totalHours;
      const remaining = studentData.remaining;
      const courseType = studentData.courseType;
      const rate = DASH_CONFIG.RATES[courseType] || 150;
      const durationSum = studentData.durationSum;
      
      let amount = 0;
      let status = '';
      
      if (remaining === 0) {
        amount = totalHours * rate;
        totalAmount += amount;
        coursesCompleted++;
        status = '✅ จบ';
      } else {
        coursesPending++;
        status = '⏳ ค้าง';
      }
      
      studentDetails.push({
        tutor: tutorData.displayName,
        student: student,
        durationSum: durationSum,
        totalHours: totalHours,
        remaining: remaining,
        courseType: courseType,
        amount: amount,
        status: status
      });
    });
    
    const avgRate = tutorData.totalDuration > 0 ? totalAmount / tutorData.totalDuration : 0;
    const tutorStatus = coursesPending === 0 ? '✅ ทั้งหมดจบ' : '⏳ มีค้าง ' + coursesPending;
    
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
      ''
    ]);
    
    studentDetails.sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === '✅ จบ' ? -1 : 1;
    });
    
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
// ============================================================
function displaySummaryWithDetails(dashboard, startRow, summary, details) {
  let currentRow = startRow;
  
  summary.forEach((summaryRow, index) => {
    const tutorName = summaryRow[0];
    
    dashboard.getRange(currentRow, 1, 1, 10).setValues([summaryRow]);
    
    dashboard.getRange(currentRow, 3, 1, 1).setNumberFormat('#,##0.00');
    dashboard.getRange(currentRow, 4, 1, 1).setNumberFormat('#,##0.00');
    dashboard.getRange(currentRow, 8, 1, 1).setNumberFormat('#,##0.00');
    
    dashboard.getRange(currentRow, 1, 1, 10)
      .setBackground('#e8f0fe')
      .setFontWeight('bold')
      .setFontSize(9);
    
    currentRow++;
    
    const tutorDetails = details.find(d => d.tutor === tutorName);
    
    if (tutorDetails && tutorDetails.students.length > 0) {
      const detailHeader = [
        '', 'นักเรียน', 'ชม.สอน', 'Total', 'Remaining', 'Course Type', 'ยอดเงิน', 'Status', '', ''
      ];
      
      dashboard.getRange(currentRow, 1, 1, 10)
        .setValues([detailHeader])
        .setFontWeight('bold')
        .setFontSize(8)
        .setBackground('#f3f3f3')
        .setFontColor('#666666');
      
      currentRow++;
      
      tutorDetails.students.forEach(student => {
        const detailRow = [
          '',
          student.student,
          student.durationSum,
          student.totalHours,
          student.remaining,
          student.courseType,
          student.amount,
          student.status,
          '',
          ''
        ];
        
        dashboard.getRange(currentRow, 1, 1, 10).setValues([detailRow]);
        
        dashboard.getRange(currentRow, 3, 1, 1).setNumberFormat('#,##0.00');
        dashboard.getRange(currentRow, 7, 1, 1).setNumberFormat('#,##0.00');
        dashboard.getRange(currentRow, 1, 1, 10).setFontSize(8);
        
        if (student.status === '✅ จบ') {
          dashboard.getRange(currentRow, 8).setBackground('#d9ead3');
        } else {
          dashboard.getRange(currentRow, 8).setBackground('#fff2cc');
        }
        
        currentRow++;
      });
      
      dashboard.getRange(currentRow, 1, 1, 10)
        .setBorder(false, false, true, false, false, false, '#cccccc', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      
      currentRow++;
    }
  });
  
  dashboard.getRange(startRow, 1, currentRow - startRow, 10).setBorder(
    true, true, true, true, true, true,
    '#d3d3d3', SpreadsheetApp.BorderStyle.SOLID
  );
}

// ============================================================
// 📅 GET SELECTED PERIODS
// ============================================================
function getSelectedPeriods(dashboard) {
  const selected = [];
  
  for (let row = 7; row <= 15; row++) {
    const monthYearValue = dashboard.getRange(row, 1).getValue();
    if (!monthYearValue || String(monthYearValue).includes('💡')) break;
    
    let monthYear = '';
    
    if (monthYearValue instanceof Date && !isNaN(monthYearValue.getTime())) {
      const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
        'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
        'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const month = monthYearValue.getMonth() + 1;
      const year = monthYearValue.getFullYear();
      const buddhistYear = year + 543;
      monthYear = monthNames[month - 1] + ' ' + buddhistYear;
    } else {
      monthYear = String(monthYearValue).trim();
    }
    
    const check1_15 = dashboard.getRange(row, 2).getValue();
    const check16_30 = dashboard.getRange(row, 3).getValue();
    
    if (check1_15 === true) {
      selected.push({ monthYear: monthYear, period: '1-15' });
    }
    
    if (check16_30 === true) {
      selected.push({ monthYear: monthYear, period: '16-30' });
    }
  }
  
  return selected;
}

// ============================================================
// 👥 GET SELECTED TUTORS
// ============================================================
function getSelectedTutors(dashboard) {
  const selectAll = dashboard.getRange('E6').getValue();
  
  if (selectAll === true) {
    return [];
  }
  
  const selected = [];
  
  for (let row = 7; row <= 25; row++) {
    for (let col = 5; col <= 11; col += 2) {
      const checkbox = dashboard.getRange(row, col).getValue();
      const tutorName = dashboard.getRange(row, col + 1).getValue();
      
      if (checkbox === true && tutorName) {
        selected.push(String(tutorName));
      }
    }
  }
  
  return selected;
}

// ============================================================
// 🔍 FILTER DATA BY PERIOD
// ============================================================
function filterDataByPeriod(rawDataSheet, selectedPeriods) {
  const allData = rawDataSheet.getDataRange().getValues();
  const filtered = [];
  
  const periodMap = new Map();
  selectedPeriods.forEach(p => {
    const key = p.monthYear.trim();
    if (!periodMap.has(key)) {
      periodMap.set(key, []);
    }
    periodMap.get(key).push(p.period);
  });
  
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  for (let i = 1; i < allData.length; i++) {
    const row = allData[i];
    const reportDate = row[6];
    
    if (!reportDate) continue;
    
    try {
      let day, month, year;
      
      if (reportDate instanceof Date && !isNaN(reportDate.getTime())) {
        day = reportDate.getDate();
        month = reportDate.getMonth() + 1;
        year = reportDate.getFullYear();
      } else {
        const dateStr = String(reportDate).replace(/^'/, '');
        const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!match) continue;
        day = parseInt(match[1]);
        month = parseInt(match[2]);
        year = parseInt(match[3]);
      }
      
      const buddhistYear = year + 543;
      const rowMonthYear = monthNames[month - 1] + ' ' + buddhistYear;
      
      if (!periodMap.has(rowMonthYear)) continue;
      
      const periods = periodMap.get(rowMonthYear);
      let matchPeriod = false;
      
      for (const period of periods) {
        if (period === '1-15' && day >= 1 && day <= 15) {
          matchPeriod = true;
          break;
        }
        if (period === '16-30' && day >= 16) {
          matchPeriod = true;
          break;
        }
      }
      
      if (matchPeriod) {
        filtered.push(row);
      }
      
    } catch (e) {
      // Skip
    }
  }
  
  return filtered;
}

// ============================================================
// 🔍 FILTER DATA BY PERIOD (แก้ไขแล้ว - Checkbox = พ.ศ.)
// ============================================================
function filterDataByPeriod(rawDataSheet, selectedPeriods) {
  const allData = rawDataSheet.getDataRange().getValues();
  const filtered = [];
  
  // selectedPeriods = [{ monthYear: "พฤศจิกายน 2568", period: "1-15" }]
  const periodMap = new Map();
  selectedPeriods.forEach(p => {
    const key = p.monthYear.trim();
    if (!periodMap.has(key)) {
      periodMap.set(key, []);
    }
    periodMap.get(key).push(p.period);
  });
  
  Logger.log('\n🗺️ Period Map:');
  periodMap.forEach((periods, monthYear) => {
    Logger.log('  "' + monthYear + '" → ' + periods.join(', '));
  });
  
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  let matchCount = 0;
  let debugCount = 0;
  
  for (let i = 1; i < allData.length; i++) {
    const row = allData[i];
    const reportDate = row[6];
    
    if (!reportDate) continue;
    
    try {
      let day, month, year;
      
      if (reportDate instanceof Date && !isNaN(reportDate.getTime())) {
        // Date Object
        day = reportDate.getDate();
        month = reportDate.getMonth() + 1;
        year = reportDate.getFullYear();
      } else {
        // String - Parse DD/MM/YYYY
        const dateStr = String(reportDate).replace(/^'/, '').trim();
        const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        
        if (!match) continue;
        
        day = parseInt(match[1]);
        month = parseInt(match[2]);
        year = parseInt(match[3]);
      }
      
      // ⭐ แก้ไข: Raw Data = ค.ศ. → แปลงเป็น พ.ศ.
      // "20/11/2025" → พฤศจิกายน 2568
      const buddhistYear = year + 543;
      const rowMonthYear = monthNames[month - 1] + ' ' + buddhistYear;
      
      // Debug 3 แถวแรก
      if (debugCount < 3) {
        Logger.log('\n  📍 Row ' + (i + 1) + ':');
        Logger.log('    Raw: "' + reportDate + '"');
        Logger.log('    Day: ' + day + ', Month: ' + month + ', Year: ' + year + ' (ค.ศ.)');
        Logger.log('    Convert: ' + rowMonthYear + ' (พ.ศ.)');
        Logger.log('    In Map? ' + periodMap.has(rowMonthYear));
        debugCount++;
      }
      
      // เช็คว่าตรงกับ Period ที่เลือกไหม
      if (!periodMap.has(rowMonthYear)) continue;
      
      const periods = periodMap.get(rowMonthYear);
      let matchPeriod = false;
      
      for (const period of periods) {
        if (period === '1-15' && day >= 1 && day <= 15) {
          matchPeriod = true;
          break;
        }
        if (period === '16-30' && day >= 16) {
          matchPeriod = true;
          break;
        }
      }
      
      if (matchPeriod) {
        filtered.push(row);
        matchCount++;
        
        // Debug 3 แถวแรกที่ Match
        if (matchCount <= 3) {
          Logger.log('    ✅ MATCH! (Day ' + day + ' in period ' + periods.join(',') + ')');
        }
      }
      
    } catch (e) {
      Logger.log('  ❌ Parse Error Row ' + (i + 1) + ': ' + e.message);
    }
  }
  
  Logger.log('\n📊 Filter Summary:');
  Logger.log('  Total Matched: ' + matchCount + ' rows');
  
  return filtered;
}

// ============================================================
// 📖 LOAD TUTOR DB
// ============================================================
function loadTutorDB() {
  try {
    const paymentSS = SpreadsheetApp.openById(DASH_CONFIG.TUTOR_DB_FILE_ID);
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
      
      if (lineDisplay) {
        lookup.set(String(lineDisplay).trim(), fullName);
      }
      if (lineId) {
        lookup.set(String(lineId).trim(), fullName);
      }
      lookup.set(String(fullName).trim(), fullName);
    }
    
    return lookup;
  } catch (error) {
    return new Map();
  }
}

// ============================================================
// 🔍 MATCH TUTOR NAME
// ============================================================
function matchTutorName(displayName, lineId, tutorLookup) {
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

// ==================== CONFIG ====================
const CONFIG = {
  FOLDER_ID: '1jK5WZB78dvPyJ4TrqCjfIJ7o2Dg_Y7lU',
  SHEET_NAME: 'บันทึกลงเวลาจาก LineBot',
  
  TARGET_GROUPS: [
    'English Mania ติวเตอร์'
  ],
  
  DAYS_BACK: 2,
  DEBUG: false,
  AUTO_DELETE_DUPLICATES: true
};

// ==================== ⭐ HELPER: CREATE UNIQUE KEY ====================
/**
 * สร้าง Unique Key สำหรับเช็คซ้ำ (4 Fields)
 */
function createUniqueKey(tutor, studentName, reportDate, time) {
  const cleanTutor = String(tutor || '').trim().toLowerCase();
  const cleanStudent = String(studentName || '').trim().toLowerCase();
  const cleanDate = normalizeDate(reportDate);
  const cleanTime = normalizeTime(time);
  
  return `${cleanTutor}|${cleanStudent}|${cleanDate}|${cleanTime}`;
}

function normalizeDate(dateValue) {
  if (!dateValue) return '';
  
  try {
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      const d = String(dateValue.getDate()).padStart(2, '0');
      const m = String(dateValue.getMonth() + 1).padStart(2, '0');
      const y = dateValue.getFullYear();
      return `${d}/${m}/${y}`;
    }
    
    const dateStr = String(dateValue).trim();
    const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const d = match[1].padStart(2, '0');
      const m = match[2].padStart(2, '0');
      const y = match[3];
      return `${d}/${m}/${y}`;
    }
    
    return dateStr;
  } catch (error) {
    return String(dateValue);
  }
}

function normalizeTime(timeValue) {
  if (!timeValue) return '';
  return String(timeValue).trim().toLowerCase().replace(/\s+/g, '');
}

// ==================== ⭐ FIX: EXTRACT DATE AS DD/MM/YYYY STRING ====================
/**
 * ดึงวันที่จากชื่อไฟล์และแปลงเป็น DD/MM/YYYY (String)
 * ป้องกัน Google Sheets แปลงเป็น Date Object
 */
function extractDateFromFileName(fileName) {
  const match = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  
  const year = match[1];
  const month = match[2];
  const day = match[3];
  
  // ⭐ แปลงเป็น DD/MM/YYYY (String) ทันที
  // เพิ่ม ' ข้างหน้าเพื่อบังคับให้ Google Sheets เก็บเป็น Text
  return `'${day}/${month}/${year}`;
}

// ==================== ⭐ CONVERT DATE WITH FILE DATE REFERENCE ====================
/**
 * แปลงวันที่โดยใช้ File Date เป็นตัวอ้างอิง
 */
function convertDateWithFileReference(reportDateStr, fileDateStr) {
  if (!reportDateStr) return '';
  
  // ตัดข้อความในวงเล็บออก
  reportDateStr = String(reportDateStr).trim().replace(/\s*\(.*?\)\s*/g, '');
  
  // Parse Report Date: DD/MM/YY
  const match = reportDateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})/);
  if (!match) return reportDateStr;
  
  let part1 = parseInt(match[1]);
  let part2 = parseInt(match[2]);
  let year = parseInt(match[3]);
  
  // แปลงปี 2 หลัก → 4 หลัก
  if (year > 25) {
    year = 2500 + year - 543;  // พ.ศ. → ค.ศ.
  } else {
    year = 2000 + year;
  }
  
  // ⭐ ถ้าไม่มี File Date ให้อ้างอิง
  if (!fileDateStr) {
    return `'${String(part1).padStart(2, '0')}/${String(part2).padStart(2, '0')}/${year}`;
  }
  
  // Parse File Date: 'DD/MM/YYYY หรือ DD/MM/YYYY
  const cleanFileDate = String(fileDateStr).replace(/^'/, '');
  const fileMatch = cleanFileDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!fileMatch) {
    return `'${String(part1).padStart(2, '0')}/${String(part2).padStart(2, '0')}/${year}`;
  }
  
  const fileDay = parseInt(fileMatch[1]);
  const fileMonth = parseInt(fileMatch[2]);
  const fileYear = parseInt(fileMatch[3]);
  const fileDate = new Date(fileYear, fileMonth - 1, fileDay);
  
  // ⭐ ลองทั้ง 2 กรณี
  const option1Date = new Date(year, part2 - 1, part1);  // DD/MM/YYYY
  const option2Date = new Date(year, part1 - 1, part2);  // MM/DD/YYYY (สลับ)
  
  const diff1 = Math.abs(option1Date - fileDate) / (1000 * 60 * 60 * 24);
  const diff2 = Math.abs(option2Date - fileDate) / (1000 * 60 * 60 * 24);
  
  let day, month;
  
  if (diff1 <= diff2) {
    day = part1;
    month = part2;
  } else {
    day = part2;
    month = part1;
    Logger.log(`🔄 แก้สลับ: "${reportDateStr}" → ${day}/${month}/${year} (File: ${cleanFileDate})`);
  }
  
  // ⭐ เพิ่ม ' ข้างหน้า
  return `'${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

// ==================== MAIN FUNCTION ====================
function importReportsFromLineOA() {
  try {
    const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - CONFIG.DAYS_BACK);
    
    Logger.log('🔍 ค้นหาไฟล์ตั้งแต่: ' + Utilities.formatDate(startDate, 'GMT+7', 'yyyy-MM-dd'));
    
    const files = folder.getFilesByType(MimeType.PLAIN_TEXT);
    let processedCount = 0;
    let totalReports = 0;
    const processedFiles = new Set();
    
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const fileId = file.getId();
      
      if (processedFiles.has(fileId)) {
        Logger.log('⏭️ ข้าม (ประมวลผลแล้ว): ' + fileName);
        continue;
      }
      
      const fileDate = extractDateFromFileName(fileName);
      
      if (fileDate && isTargetGroup(fileName)) {
        // ⭐ แปลง fileDate กลับเป็น Date Object เพื่อเช็ควันที่
        const cleanDate = String(fileDate).replace(/^'/, '');
        const dateParts = cleanDate.split('/');
        const fileDateObj = new Date(
          parseInt(dateParts[2]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[0])
        );
        
        if (fileDateObj >= startDate && fileDateObj <= endDate) {
          Logger.log('✅ ประมวลผล: ' + fileName);
          const reportCount = processFile(file, sheet, fileDate, fileName);
          totalReports += reportCount;
          processedCount++;
          processedFiles.add(fileId);
        }
      }
    }
    
    Logger.log('✨ เสร็จสิ้น! ' + processedCount + ' ไฟล์, ' + totalReports + ' รายงาน');
    
    const actualRows = countActualRows(sheet);
    Logger.log('📊 จำนวนแถวทั้งหมดใน Sheet: ' + actualRows + ' แถว');
    
    const duplicates = checkForDuplicatesNew(sheet);
    
    if (duplicates > 0 && CONFIG.AUTO_DELETE_DUPLICATES) {
      Logger.log('🤖 กำลังลบข้อมูลซ้ำอัตโนมัติ...');
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'พบข้อมูลซ้ำ ' + duplicates + ' แถว\nกำลังลบอัตโนมัติ...',
        '🤖 กำลังดำเนินการ',
        5
      );
      
      removeDuplicateReportsSafe();
      
      const finalRows = countActualRows(sheet);
      const deletedCount = actualRows - finalRows;
      
      Logger.log('✅ ลบข้อมูลซ้ำอัตโนมัติเรียบร้อย: ' + deletedCount + ' แถว');
      
      SpreadsheetApp.getActiveSpreadsheet().toast(
        '✅ ดำเนินการสำเร็จ!\nนำเข้า: ' + totalReports + ' รายงาน\nลบซ้ำ: ' + deletedCount + ' แถว',
        '✅ เสร็จสิ้น',
        5
      );
    } else if (duplicates > 0) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        '⚠️ พบข้อมูลซ้ำ ' + duplicates + ' แถว\nกรุณารัน "ลบข้อมูลซ้ำ"',
        '⚠️ คำเตือน',
        10
      );
    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'นำเข้าเรียบร้อย ' + totalReports + ' รายงาน',
        '✅ สำเร็จ',
        5
      );
    }
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'ข้อผิดพลาด: ' + error.message,
      '❌ Error',
      10
    );
  }
}

// ==================== CHECK DUPLICATES ====================
function checkForDuplicatesNew(sheet) {
  if (!sheet) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) return 0;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return 0;
  
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const uniqueKeys = new Set();
  let duplicateCount = 0;
  
  for (let i = 0; i < data.length; i++) {
    const tutor = data[i][3];
    const studentName = data[i][5];
    const reportDate = data[i][6];
    const time = data[i][7];
    
    const key = createUniqueKey(tutor, studentName, reportDate, time);
    
    if (uniqueKeys.has(key)) {
      duplicateCount++;
    } else {
      uniqueKeys.add(key);
    }
  }
  
  return duplicateCount;
}

// ==================== REMOVE DUPLICATES ====================
function removeDuplicateReportsSafe() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  const uniqueRows = new Map();
  const rowsToDelete = [];
  
  for (let i = 0; i < data.length; i++) {
    const tutor = data[i][3];
    const studentName = data[i][5];
    const reportDate = data[i][6];
    const time = data[i][7];
    const remaining = parseFloat(data[i][11]) || 999;
    
    const key = createUniqueKey(tutor, studentName, reportDate, time);
    
    if (!uniqueRows.has(key)) {
      uniqueRows.set(key, {
        index: i,
        remaining: remaining,
        rowNumber: i + 2
      });
    } else {
      const existing = uniqueRows.get(key);
      
      if (remaining < existing.remaining) {
        rowsToDelete.push(existing.rowNumber);
        uniqueRows.set(key, {
          index: i,
          remaining: remaining,
          rowNumber: i + 2
        });
      } else {
        rowsToDelete.push(i + 2);
      }
    }
  }
  
  if (rowsToDelete.length === 0) return;
  
  rowsToDelete.sort((a, b) => b - a);
  
  Logger.log('พบแถวซ้ำ: ' + rowsToDelete.length + ' แถว');
  
  let deleted = 0;
  for (const rowNum of rowsToDelete) {
    if (rowNum > 1) {
      try {
        sheet.deleteRow(rowNum - deleted);
        deleted++;
      } catch (e) {
        Logger.log('ไม่สามารถลบแถว ' + rowNum);
      }
    }
  }
  
  Logger.log('✅ ลบแถวซ้ำเรียบร้อย: ' + deleted + ' แถว');
}

// ==================== UPDATE OR INSERT ====================
function updateOrInsertReport(sheet, report) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow < 2) {
    const rowData = [
      report.fileDate, report.timestamp, report.group, report.tutor, report.tutorId,
      report.studentName, report.reportDate, report.time, report.book, report.topic,
      report.totalHours, report.remainingHours, report.feedback,
      report.courseType, report.duration
    ];
    sheet.appendRow(rowData);
    Logger.log('    ➕ เพิ่มใหม่');
    return;
  }
  
  const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
  const data = dataRange.getValues();
  
  const reportKey = createUniqueKey(
    report.tutor,
    report.studentName,
    report.reportDate,
    report.time
  );
  
  let rowIndex = -1;
  
  for (let i = 0; i < data.length; i++) {
    const rowKey = createUniqueKey(
      data[i][3],
      data[i][5],
      data[i][6],
      data[i][7]
    );
    
    if (rowKey === reportKey) {
      rowIndex = i + 2;
      break;
    }
  }
  
  const rowData = [
    report.fileDate, report.timestamp, report.group, report.tutor, report.tutorId,
    report.studentName, report.reportDate, report.time, report.book, report.topic,
    report.totalHours, report.remainingHours, report.feedback,
    report.courseType, report.duration
  ];
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    Logger.log('    🔄 อัพเดต row ' + rowIndex);
  } else {
    sheet.appendRow(rowData);
    Logger.log('    ➕ เพิ่มใหม่');
  }
}

// ==================== HELPER FUNCTIONS ====================

function isTargetGroup(fileName) {
  return CONFIG.TARGET_GROUPS.some(group => fileName.includes(group));
}

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = [
      'File Date', 'Timestamp', 'Group', 'Tutor', 'Tutor ID',
      'Student Name', 'Report Date', 'Time', 'Book', 'Topic', 
      'Total Hours', 'Remaining Hours', 'Feedback', 
      'Course Type', 'Duration'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    
    [90, 80, 150, 120, 200, 120, 90, 100, 200, 200, 80, 100, 450, 120, 80].forEach((w, i) => 
      sheet.setColumnWidth(i + 1, w)
    );
  }
  
  return sheet;
}

function processFile(file, sheet, fileDate, fileName) {
  const content = file.getBlob().getDataAsString('UTF-8');
  const reports = extractReports(content, fileDate, fileName);
  
  Logger.log('📊 ' + file.getName() + ' - พบ ' + reports.length + ' รายงาน');
  
  reports.forEach((report) => {
    updateOrInsertReport(sheet, report);
  });
  
  return reports.length;
}

function countActualRows(sheet) {
  const lastRow = sheet.getLastRow();
  return lastRow <= 1 ? 0 : lastRow - 1;
}

function extractReports(content, fileDate, fileName) {
  const reports = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('Message:') && line.toUpperCase().includes('REPORT')) {
      const report = parseReport(lines, i, fileDate, fileName);
      if (report) {
        reports.push(report);
      }
    }
  }
  
  return reports;
}

function parseReport(lines, startIndex, fileDate, fileName) {
  try {
    let headerLine = '';
    for (let j = startIndex; j >= Math.max(0, startIndex - 3); j--) {
      if (lines[j].includes('[') && lines[j].includes(']') && lines[j].includes('User:')) {
        headerLine = lines[j];
        break;
      }
    }
    
    if (!headerLine) return null;
    
    const timestampMatch = headerLine.match(/\[(\d{2}:\d{2}:\d{2})\]/);
    const timestamp = timestampMatch ? timestampMatch[1] : '';
    
    const groupMatch = headerLine.match(/Group:\s*(.+?)\s*\|/);
    const group = groupMatch ? groupMatch[1].trim() : '';
    
    let tutor = '';
    let tutorId = '';
    
    if (headerLine.includes('| ID:')) {
      const userMatch = headerLine.match(/User:\s*(.+?)\s*\|\s*ID:/);
      if (userMatch) tutor = userMatch[1].trim();
      
      const idMatch = headerLine.match(/ID:\s*(.+?)$/);
      if (idMatch) tutorId = idMatch[1].trim();
    } else {
      const userMatch = headerLine.match(/User:\s*(.+?)$/);
      if (userMatch) tutor = userMatch[1].trim();
    }
    
    let reportText = '';
    for (let i = startIndex + 1; i < lines.length && i < startIndex + 50; i++) {
      const nextLine = lines[i];
      if (nextLine.includes('----------------------------------------')) break;
      if (nextLine.includes('[') && nextLine.includes(']') && nextLine.includes('User:')) break;
      reportText += nextLine + '\n';
    }
    
    const studentName = extractField(reportText, 'Name of Student');
    const reportDate = extractField(reportText, 'Date');
    const time = extractField(reportText, 'Time');
    const book = extractField(reportText, 'Book');
    const topic = extractField(reportText, 'Topic');
    const totalHr = extractField(reportText, 'Total hr');
    const remainingHr = extractField(reportText, 'ชั่วโมงคงเหลือ');
    const feedback = extractFeedback(reportText);
    
    if (!studentName) return null;

    const finalReportDate = convertDateWithFileReference(reportDate, fileDate);  // ⭐ ใช้ File Date อ้างอิง

    return {
      fileDate: fileDate,  // ⭐ 'DD/MM/YYYY (String with apostrophe)
      timestamp: timestamp,
      group: group,
      tutor: tutor,
      tutorId: tutorId,
      studentName: studentName,
      reportDate: finalReportDate,
      time: time,
      book: book,
      topic: topic,
      totalHours: totalHr,
      remainingHours: remainingHr,
      feedback: feedback,
      courseType: parseCourseType(lines[startIndex], finalReportDate),  // ⭐ ส่ง reportDate เพื่อเช็ค dayOfWeek
      duration: calculateDuration(time)
    };
    
  } catch (error) {
    Logger.log('⚠️ Parse error: ' + error.toString());
    return null;
  }
}

function parseCourseType(messageLine, reportDate) {
  if (!messageLine) return 'online1by1';
  const upperLine = messageLine.toUpperCase();

  // ถ้าเป็น REPORT ONSITE DAY ให้เช็คว่าเป็นวันเสาร์/อาทิตย์จริงหรือไม่
  if (upperLine.includes('REPORT ONSITE DAY')) {
    // ตรวจสอบว่าเป็น Sat/Sun หรือไม่
    const date = parseDateFromReport(reportDate);
    if (date && (date.getDay() === 0 || date.getDay() === 6)) {
      // 0 = Sunday, 6 = Saturday
      return 'onsiteDay';
    } else {
      // ไม่ใช่วันเสาร์/อาทิตย์ ให้เป็น onsiteGroup แทน
      return 'onsiteGroup';
    }
  }

  if (upperLine.includes('REPORT ONSITE GROUP')) return 'onsiteGroup';
  if (upperLine.includes('REPORT ONSITE')) return 'onsite1by1';
  return 'online1by1';
}

/**
 * Parse date จาก reportDate string
 */
function parseDateFromReport(dateValue) {
  if (!dateValue) return null;

  try {
    // ถ้าเป็น Date object แล้ว
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue;
    }

    // ถ้าเป็น string รูปแบบ DD/MM/YYYY
    const dateStr = String(dateValue).trim();
    const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;  // month เริ่มจาก 0
      const year = parseInt(match[3]);
      return new Date(year, month, day);
    }

    return null;
  } catch (error) {
    Logger.log('⚠️ Cannot parse date: ' + error.toString());
    return null;
  }
}

function calculateDuration(timeStr) {
  if (!timeStr) return 0;
  let cleanTime = String(timeStr).split('(')[0].trim();
  const timePattern = /(\d{1,2})[:.:](\d{2})\s*-\s*(\d{1,2})[:.:](\d{2})/;
  const match = cleanTime.match(timePattern);
  if (!match) return 0;
  
  const startHour = parseInt(match[1]);
  const startMin = parseInt(match[2]);
  const endHour = parseInt(match[3]);
  const endMin = parseInt(match[4]);
  
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  let durationMin = endTotalMin - startTotalMin;
  if (durationMin < 0) durationMin += 24 * 60;
  
  return Math.round((durationMin / 60) * 100) / 100;
}

function extractField(text, fieldName) {
  const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escapedFieldName + '\\s*:\\s*([^\\n]+)', 'i');
  const match = text.match(pattern);
  return match && match[1] ? match[1].trim() : '';
}

function extractFeedback(text) {
  const match = text.match(/FEEDBACK:\s*(.+?)(?=\n-{10,}|$)/is);
  if (match && match[1]) {
    let feedback = match[1].trim();
    feedback = feedback.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    feedback = feedback.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
    return feedback.trim();
  }
  return '';
}

// ==================== ⭐ FIX ALL EXISTING DATES ====================
/**
 * แก้ไขวันที่ในข้อมูลเก่าทั้งหมด
 */
function fixAllExistingDates() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('ไม่พบ Sheet');
      return;
    }
    
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '🔧 แก้ไขวันที่ทั้งหมด',
      'จะแก้ไข:\n' +
      '1. File Date (Column A) → เป็น Text\n' +
      '2. Report Date (Column G) → ใช้ File Date อ้างอิง\n\n' +
      'ต้องการดำเนินการต่อหรือไม่?',
      ui.ButtonSet.YES_NO
    );
    
    if (response !== ui.Button.YES) return;
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      SpreadsheetApp.getUi().alert('ไม่มีข้อมูล');
      return;
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    
    let fixedFileDate = 0;
    let fixedReportDate = 0;
    const newFileDates = [];
    const newReportDates = [];
    
    Logger.log('🔧 เริ่มแก้ไขวันที่ ' + (lastRow - 1) + ' แถว...');
    
    for (let i = 0; i < data.length; i++) {
      const originalFileDate = data[i][0];
      const originalReportDate = data[i][6];
      
      // แก้ไข File Date
      let fixedFile = String(originalFileDate);
      if (!fixedFile.startsWith("'")) {
        fixedFile = "'" + fixedFile;
        fixedFileDate++;
      }
      newFileDates.push([fixedFile]);
      
      // แก้ไข Report Date โดยใช้ File Date อ้างอิง
      const fixedReport = convertDateWithFileReference(originalReportDate, fixedFile);
      newReportDates.push([fixedReport]);
      
      if (String(originalReportDate) !== String(fixedReport)) {
        fixedReportDate++;
      }
      
      if ((i + 1) % 100 === 0) {
        Logger.log('  ประมวลผลแล้ว: ' + (i + 1) + '/' + data.length);
      }
    }
    
    // อัพเดท Column A (File Date)
    sheet.getRange(2, 1, lastRow - 1, 1).setValues(newFileDates);
    
    // อัพเดท Column G (Report Date)
    sheet.getRange(2, 7, lastRow - 1, 1).setValues(newReportDates);
    
    Logger.log(`✅ แก้ไขเสร็จสิ้น: File Date ${fixedFileDate}, Report Date ${fixedReportDate}`);
    
    SpreadsheetApp.getUi().alert(
      '✅ แก้ไขวันที่เสร็จสิ้น!\n\n' +
      'File Date (Column A): ' + fixedFileDate + ' รายการ\n' +
      'Report Date (Column G): ' + fixedReportDate + ' รายการ'
    );
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    SpreadsheetApp.getUi().alert('ข้อผิดพลาด: ' + error.message);
  }
}

// ==================== ⭐ CHECK DATE CONSISTENCY ====================
/**
 * ตรวจสอบความสอดคล้องระหว่าง File Date และ Report Date
 */
function checkDateConsistency() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('ไม่พบ Sheet');
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      SpreadsheetApp.getUi().alert('ไม่มีข้อมูล');
      return;
    }
    
    const data = sheet.getRange(2, 1, Math.min(20, lastRow - 1), 7).getValues();
    
    let report = '🔍 ตรวจสอบความสอดคล้องของวันที่ (20 แถวแรก):\n\n';
    report += 'แถว | File Date   | Report Date | ต่าง | สถานะ\n';
    report += '─────────────────────────────────────────────────────\n';
    
    let inconsistentCount = 0;
    
    for (let i = 0; i < data.length; i++) {
      const fileDate = String(data[i][0]).replace(/^'/, '');
      const reportDate = String(data[i][6]).replace(/^'/, '');
      
      const fileParts = fileDate.split('/');
      const reportParts = reportDate.split('/');
      
      if (fileParts.length === 3 && reportParts.length === 3) {
        const fileDateObj = new Date(
          parseInt(fileParts[2]),
          parseInt(fileParts[1]) - 1,
          parseInt(fileParts[0])
        );
        
        const reportDateObj = new Date(
          parseInt(reportParts[2]),
          parseInt(reportParts[1]) - 1,
          parseInt(reportParts[0])
        );
        
        const diff = Math.abs(reportDateObj - fileDateObj) / (1000 * 60 * 60 * 24);
        
        let status = '✅ OK';
        if (diff > 7) {
          status = '⚠️ ต่างกันมาก';
          inconsistentCount++;
        }
        
        report += `${i + 2} | ${fileDate} | ${reportDate} | ${diff.toFixed(0)} วัน | ${status}\n`;
      }
    }
    
    report += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    report += `สรุป: ต่างกันเกิน 7 วัน = ${inconsistentCount} รายการ\n`;
    
    if (inconsistentCount > 0) {
      report += '\n💡 แนะนำ: รัน "แก้ไขวันที่ทั้งหมด"';
    }
    
    Logger.log(report);
    SpreadsheetApp.getUi().alert(report);
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    SpreadsheetApp.getUi().alert('ข้อผิดพลาด: ' + error.message);
  }
}

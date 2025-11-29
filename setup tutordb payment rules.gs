// ============================================================
// 🔧 SETUP TUTORDB PAYMENT RULES SHEET
// สำหรับสร้าง Sheet "TutorPaymentRules" ใน TutorDB File
// ============================================================
//
// ⚠️ DEPRECATED - ไฟล์นี้ไม่ถูกใช้งานแล้ว (Version 3.2+)
// ============================================================
// ระบบ Payment Rules ได้เปลี่ยนไปใช้คอลัมน์ P-T ใน TutorDB Sheet แทน
// ไม่ต้องสร้าง Sheet "TutorPaymentRules" แยกต่างหาก
//
// วิธีใช้งานใหม่:
// 1. เปิด TutorDB Sheet
// 2. เพิ่มคอลัมน์ P-T (ถ้ายังไม่มี):
//    - P: Online1by1 Trigger
//    - Q: Onsite1by1 Trigger
//    - R: OnsiteGroup Trigger
//    - S: OnsiteDay Trigger
//    - T: Conditions
// 3. กรอกข้อมูล Payment Triggers และ Conditions สำหรับแต่ละติวเตอร์
// 4. ดูคู่มือเพิ่มเติมที่: PAYMENT_RULES_GUIDE.md
//
// หมายเหตุ: ไฟล์นี้ถูกเก็บไว้เพื่อเป็นข้อมูลอ้างอิงเท่านั้น
// ============================================================

/**
 * สร้าง Sheet "TutorPaymentRules" พร้อม Template ตัวอย่าง
 *
 * วิธีใช้:
 * 1. เปิด Apps Script Editor
 * 2. รันฟังก์ชัน setupTutorPaymentRulesSheet()
 * 3. ไปที่ TutorDB File จะเห็น Sheet ใหม่ชื่อ "TutorPaymentRules"
 */
function setupTutorPaymentRulesSheet() {
  try {
    // เปิด TutorDB File
    const tutorDBFile = SpreadsheetApp.openById(SHARED_CONFIG.TUTOR_DB_FILE_ID);

    // เช็คว่ามี Sheet นี้อยู่แล้วหรือไม่
    let rulesSheet = tutorDBFile.getSheetByName('TutorPaymentRules');

    if (rulesSheet) {
      const response = SpreadsheetApp.getUi().alert(
        '⚠️ Sheet "TutorPaymentRules" มีอยู่แล้ว',
        'ต้องการลบและสร้างใหม่หรือไม่? (ข้อมูลเดิมจะหายทั้งหมด)',
        SpreadsheetApp.getUi().ButtonSet.YES_NO
      );

      if (response === SpreadsheetApp.getUi().Button.YES) {
        tutorDBFile.deleteSheet(rulesSheet);
      } else {
        SpreadsheetApp.getUi().alert('ยกเลิกการสร้าง Sheet');
        return;
      }
    }

    // สร้าง Sheet ใหม่
    rulesSheet = tutorDBFile.insertSheet('TutorPaymentRules');

    // ============================================================
    // HEADER ROW (Row 1)
    // ============================================================
    const headers = ['Line ID', 'Course Type', 'Rate', 'Payment Trigger', 'Conditions'];
    rulesSheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(10)
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    rulesSheet.setRowHeight(1, 35);

    // ============================================================
    // EXAMPLE DATA (Row 2-9)
    // ============================================================
    const exampleData = [
      // Tutor A - ทุกแบบคิดเงินหลังจบคอร์ส
      ['Uaaa', 'online1by1', 150, 'onCourseComplete', ''],
      ['Uaaa', 'onsite1by1', 250, 'onCourseComplete', ''],
      ['Uaaa', 'onsiteGroup', 150, 'onCourseComplete', ''],
      ['Uaaa', 'onsiteDay', 850, 'onCourseComplete', ''],

      // Tutor B - Online จบคอร์ส, Onsite ทุกรอบ + เสาร์/อาทิตย์ เป็น onsiteDay
      ['Ubbb', 'online1by1', 150, 'onCourseComplete', ''],
      ['Ubbb', 'onsite1by1', 250, 'everyPeriod', 'dayOfWeek:Sat,Sun→onsiteDay'],
      ['Ubbb', 'onsiteDay', 850, 'everyPeriod', '']
    ];

    rulesSheet.getRange(2, 1, exampleData.length, headers.length)
      .setValues(exampleData)
      .setFontSize(9)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    // Highlight example rows
    rulesSheet.getRange(2, 1, exampleData.length, headers.length)
      .setBackground('#fff3cd')
      .setBorder(true, true, true, true, true, true, '#999999', SpreadsheetApp.BorderStyle.SOLID);

    // ============================================================
    // INSTRUCTION ROW (Row 10)
    // ============================================================
    rulesSheet.getRange('A10:E10').merge()
      .setValue('⬆️ ข้างบนเป็นตัวอย่าง (Uaaa, Ubbb = Line ID สมมติ) กรุณาลบและใส่ข้อมูลจริงของคุณ')
      .setFontSize(8)
      .setFontColor('#856404')
      .setFontStyle('italic')
      .setBackground('#fff3cd')
      .setHorizontalAlignment('center')
      .setBorder(true, true, true, true, false, false, '#999999', SpreadsheetApp.BorderStyle.SOLID);

    // ============================================================
    // HELP SECTION (Row 12+)
    // ============================================================
    rulesSheet.getRange('A12').setValue('📖 คำอธิบายคอลัมน์:').setFontWeight('bold').setFontSize(10);

    const helpData = [
      ['', 'Line ID', '= Line ID ของติวเตอร์ (ต้องตรงกับข้อมูลใน Raw Data คอลัมน์ E)'],
      ['', 'Course Type', '= online1by1, onsite1by1, onsiteGroup, onsiteDay'],
      ['', 'Rate', '= อัตราค่าสอน (บาท/ชั่วโมง)'],
      ['', 'Payment Trigger', '= onCourseComplete (จบคอร์ส), everyPeriod (ทุกรอบ), monthly (รายเดือน)'],
      ['', 'Conditions', '= เงื่อนไขพิเศษ เช่น dayOfWeek:Sat,Sun→onsiteDay'],
      ['', '', ''],
      ['', '📌 ตัวอย่าง Conditions:', ''],
      ['', 'dayOfWeek:Sat,Sun→onsiteDay', '= ถ้าวันเสาร์/อาทิตย์ ให้เปลี่ยนเป็น onsiteDay'],
      ['', 'dayOfWeek:Mon,Tue,Wed,Thu,Fri→onsite1by1', '= ถ้าวันจันทร์-ศุกร์ ให้ใช้ onsite1by1'],
      ['', '', ''],
      ['', '💡 เคล็ดลับ:', ''],
      ['', '- ติวเตอร์ 1 คน สามารถมีหลายแถวได้ (แยกตาม Course Type)', ''],
      ['', '- ถ้าไม่มีข้อมูลของติวเตอร์คนใด ระบบจะใช้ค่า Default', ''],
      ['', '- Conditions เป็น Optional (เว้นว่างได้ถ้าไม่ใช้)', '']
    ];

    rulesSheet.getRange(13, 1, helpData.length, 3)
      .setValues(helpData)
      .setFontSize(8)
      .setWrap(true);

    // Format help section
    rulesSheet.getRange(13, 2, helpData.length, 1).setFontWeight('bold');

    // ============================================================
    // COLUMN WIDTHS
    // ============================================================
    rulesSheet.setColumnWidth(1, 100);  // Line ID
    rulesSheet.setColumnWidth(2, 120);  // Course Type
    rulesSheet.setColumnWidth(3, 80);   // Rate
    rulesSheet.setColumnWidth(4, 150);  // Payment Trigger
    rulesSheet.setColumnWidth(5, 300);  // Conditions

    // ============================================================
    // FREEZE HEADER
    // ============================================================
    rulesSheet.setFrozenRows(1);

    // ============================================================
    // SUCCESS MESSAGE
    // ============================================================
    SpreadsheetApp.getUi().alert(
      '✅ สร้าง Sheet "TutorPaymentRules" สำเร็จ!\n\n' +
      'ขั้นตอนต่อไป:\n' +
      '━━━━━━━━━━━━━━━━━━\n' +
      '1. ไปที่ TutorDB File\n' +
      '2. เปิด Sheet "TutorPaymentRules"\n' +
      '3. ลบข้อมูลตัวอย่าง (แถว 2-9)\n' +
      '4. ใส่ข้อมูลจริงของติวเตอร์ของคุณ\n' +
      '5. บันทึกแล้วกลับมาทดสอบที่ Dashboard Payment\n\n' +
      '📖 อ่านคู่มือเพิ่มเติมได้ที่:\n' +
      'PAYMENT_RULES_GUIDE.md'
    );

    Logger.log('✅ TutorPaymentRules sheet created successfully');
    Logger.log('Sheet ID: ' + rulesSheet.getSheetId());

  } catch (error) {
    SpreadsheetApp.getUi().alert(
      '❌ เกิดข้อผิดพลาด:\n' + error.message + '\n\n' +
      'กรุณาตรวจสอบว่า TUTOR_DB_FILE_ID ใน shared config.gs ถูกต้อง'
    );
    Logger.log('Error: ' + error.message);
  }
}

/**
 * ฟังก์ชันสำหรับเพิ่มติวเตอร์ใหม่ใน TutorPaymentRules
 * (สามารถรันได้หลายครั้ง)
 *
 * @param {string} lineId - Line ID ของติวเตอร์
 * @param {Array} rules - Array ของ rules เช่น [{courseType: 'online1by1', rate: 150, trigger: 'onCourseComplete', conditions: ''}]
 */
function addTutorPaymentRules(lineId, rules) {
  try {
    const tutorDBFile = SpreadsheetApp.openById(SHARED_CONFIG.TUTOR_DB_FILE_ID);
    const rulesSheet = tutorDBFile.getSheetByName('TutorPaymentRules');

    if (!rulesSheet) {
      throw new Error('Sheet "TutorPaymentRules" ไม่พบ กรุณารัน setupTutorPaymentRulesSheet() ก่อน');
    }

    const lastRow = rulesSheet.getLastRow();
    const newRows = [];

    rules.forEach(rule => {
      newRows.push([
        lineId,
        rule.courseType,
        rule.rate,
        rule.trigger || 'onCourseComplete',
        rule.conditions || ''
      ]);
    });

    rulesSheet.getRange(lastRow + 1, 1, newRows.length, 5)
      .setValues(newRows)
      .setFontSize(9)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    Logger.log('✅ เพิ่ม ' + newRows.length + ' rules สำหรับ ' + lineId);

  } catch (error) {
    Logger.log('Error: ' + error.message);
    throw error;
  }
}

/**
 * ตัวอย่างการใช้งาน addTutorPaymentRules()
 */
function exampleAddTutor() {
  // Tutor C - Online จบคอร์ส, Onsite ทุกรอบ
  addTutorPaymentRules('Uccc', [
    {courseType: 'online1by1', rate: 150, trigger: 'onCourseComplete', conditions: ''},
    {courseType: 'onsite1by1', rate: 250, trigger: 'everyPeriod', conditions: ''},
    {courseType: 'onsiteDay', rate: 850, trigger: 'everyPeriod', conditions: ''}
  ]);

  Logger.log('✅ เพิ่มติวเตอร์ Uccc เรียบร้อย');
}

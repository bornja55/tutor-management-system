function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // Menu 1: 📥 Import & Data
  ui.createMenu('📥 Import & Data')
    .addItem('🔄 Import ย้อนหลัง 2 วัน & ลบซ้ำอัตโนมัติ', 'importReportsFromLineOA')
    .addSeparator()
    .addItem('🔍 ตรวจสอบข้อมูลซ้ำ (Safe)', 'checkForDuplicatesSafe')
    .addItem('🗑️ ลบข้อมูลซ้ำ (Safe)', 'removeDuplicateReportsSafe')
    .addSeparator()
    .addItem('📅 แปลงวันที่ให้เป็น ค.ศ.', 'standardizeReportDates')
    .addToUi();
  
  // Menu 2: 💰 Dashboard Payment
  ui.createMenu('💰 Dashboard Payment')
    .addItem('🔧 Setup Dashboard', 'setupDashboardPayment')
    .addSeparator()
    .addItem('🔄 อัพเดตติวเตอร์', 'updateTutorCheckboxesPayment')
    .addItem('📊 สร้างรายงาน', 'generateReportPayment')
    .addSeparator()
    .addItem('📚 วิธีใช้งาน', 'showPaymentHelp')
    .addToUi();

  // Menu 3: 📊 Dashboard Report
  ui.createMenu('📊 Dashboard Report')
    .addItem('🔧 Setup Dashboard', 'setupDashboardReport')
    .addSeparator()
    .addItem('🔄 อัพเดต', 'updateReportCheckboxes')
    .addItem('📚 รายงานนักเรียน', 'generateStudentReport')
    .addItem('👨‍🏫 รายงานติวเตอร์', 'generateTutorReport')
    .addSeparator()
    .addItem('📚 วิธีใช้งาน', 'showReportHelp')
    .addToUi();
}

// ============================================================
// 📚 HELP FUNCTIONS
// ============================================================
function showPaymentHelp() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    '💰 วิธีใช้งาน Dashboard Payment\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '1️⃣ Setup ครั้งแรก:\n' +
    '   • กด "🔧 Setup Dashboard"\n' +
    '   • ตั้งค่า Payment Rules ใน TutorDB (ดูคู่มือ PAYMENT_RULES_GUIDE.md)\n\n' +
    '2️⃣ สร้างรายงาน:\n' +
    '   • เลือก ✅ Checkbox ช่วงเวลา\n' +
    '   • กด "🔄 อัพเดตติวเตอร์"\n' +
    '   • เลือก ✅ ติวเตอร์\n' +
    '   • กด "📊 สร้างรายงาน"\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━\n' +
    '💡 Payment Rules (Version 3.2+):\n' +
    '   • ระบบคำนวณตาม TutorDB Columns P-T\n' +
    '   • รองรับ Payment Trigger แยกตามประเภทคอร์ส\n' +
    '   • รองรับ Conditions พิเศษ (เช่น เสาร์/อาทิตย์)\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━\n' +
    '📖 ดูคู่มือเพิ่มเติม: PAYMENT_RULES_GUIDE.md'
  );
}

function showReportHelp() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    '📊 วิธีใช้งาน Dashboard Report\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '1️⃣ Setup ครั้งแรก:\n' +
    '   • กด "🔧 Setup Dashboard"\n\n' +
    '2️⃣ สร้างรายงาน:\n' +
    '   • เลือก ✅ ปี/เดือน/รอบ\n' +
    '   • กด "🔄 อัพเดต"\n' +
    '   • เลือก ✅ นักเรียน + ติวเตอร์\n' +
    '   • กด "📚 รายงานนักเรียน" หรือ "👨‍🏫 รายงานติวเตอร์"\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━\n' +
    '💡 ใช้สำหรับ: ติดตามความคืบหน้าการเรียน'
  );
}
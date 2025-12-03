// --- !! ส่วนที่ต้องแก้ไข !! ---
// 1. วาง "ลิงก์สำหรับกรอก Form" (ลิงก์จากปุ่ม "ส่ง" ของ Form)
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeDdD1W0RFNSFfBZvWea09ofPr5bTl7hMHAtE_CzQZCdiPMpw/viewform?usp=publish-editor"; 
// --- จบส่วนที่ต้องแก้ไข ---


/**
 * สร้าง "เมนู" เมื่อเปิด Sheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 Portal สร้าง PDF') 
      .addItem('เปิด Portal อัปโหลดสลิป (ในแท็บใหม่)', 'openFormInNewTab') // เปลี่ยนชื่อฟังก์ชัน
      .addToUi();
}

/**
 * --- !! นี่คือฟังก์ชันที่แก้ไขใหม่ !! ---
 * แสดง Pop-up ที่มี "ลิงก์" ให้คลิก
 * (Script ไม่สามารถเปิดแท็บใหม่เองได้ แต่เราสามารถสร้าง Pop-up ที่มีลิงก์ <a target="_blank">)
 */
function openFormInNewTab() {
  
  // สร้าง HTML สำหรับ Pop-up
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 20px;">
        <h3>กรุณาคลิกปุ่มด้านล่างเพื่อเปิด Portal</h3>
        <p>(Form จะเปิดขึ้นมาในแท็บใหม่)</p>
        <br>
        <a href="${FORM_URL}" 
           target="_blank" 
           style="font-size: 16px; padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 5px;"
           onclick="google.script.host.close()" 
        >
          คลิกที่นี่เพื่อเปิด Portal
        </a>
      </body>
    </html>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
      .setWidth(400)  // ทำให้ Pop-up เล็กลง
      .setHeight(150);
      
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'เปิด Portal ในแท็บใหม่');
}

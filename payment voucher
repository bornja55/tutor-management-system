// ============================================================
// ตั้งค่า ID และชื่อต่างๆ
// ============================================================
const TEMPLATE_ID = "1pZlskf1xbesf-cq29AiUcF-iWM-18QvRS6WYNXs8f7c";
const FOLDER_ID = "1qDmfre8x16BoMFMZnM6fG3Tz8K4ryUDX";     
const SLIP_FOLDER_ID = "19NF9AuxN7_uUPCn6DXNDxzyKse6sLDIhHP1VsaRoKFremwo6RH7HZNBwxc-QcY5_xH-WuNgh";
const DATABASE_SHEET_NAME = "TutorDB";                    
const SHEET_FILE_ID = "1zeRKFL52PVJi4hQddB5FoMIITdtAmO3NN7CJRolRgAo"; 
const PAYMENT_SHEET_NAME = "Payment"; 
const VOUCHER_NO_QUESTION_ID = "1084017006";


// ============================================================
// ฟังก์ชันอัปเดต Dropdown ใน Google Form
// ============================================================
function updateVoucherList() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_FILE_ID);
    const sheet = ss.getSheetByName(PAYMENT_SHEET_NAME);
    
    if (!sheet) return;
    
    const range = sheet.getRange("A2:F" + sheet.getLastRow()).getValues();
    
    // กรองเฉพาะรายการที่ยังไม่สร้าง PDF
    const voucherList = range
      .filter(row => row[0] && !row[5])
      .map(row => {
        let monthName = "";
        if (row[4]) {
          const date = new Date(row[4]);
          monthName = date.toLocaleString("th-TH", { month: 'short' });
        }
        let formattedAmount = "";
        if (row[2]) {
          const amount = parseFloat(String(row[2]).replace(/,/g, ''));
          formattedAmount = amount.toLocaleString('en-US', {
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2
          });
        }
        return `(${monthName}) ${row[0]} | ${row[1]} | ${formattedAmount} บาท`;
      });
      
    if (voucherList.length === 0) {
      voucherList.push("ไม่พบรายการที่ต้องดำเนินการ");
    }

    // อัปเดต Dropdown ใน Form
    const form = FormApp.getActiveForm();
    const item = form.getItemById(VOUCHER_NO_QUESTION_ID).asListItem();
    item.setChoiceValues(voucherList);
    
  } catch (e) {
    // ไม่ทำอะไร
  }
}


// ============================================================
// ฟังก์ชันหลัก - ทำงานเมื่อมีการ Submit Form
// ============================================================
function onFormSubmit(e) {
  try {
    // ดึงข้อมูลจาก Form Response
    const itemResponses = e.response.getItemResponses();
    const selectedDropdownText = itemResponses[0].getResponse(); 
    const uploadedFileId = itemResponses[1].getResponse(); 
    const voucherNo = selectedDropdownText.split(' | ')[0].split(') ')[1];
    
    if (!uploadedFileId || uploadedFileId.length === 0) return;
    
    Utilities.sleep(1000);
    
    // เข้าถึง Google Sheet
    const ss = SpreadsheetApp.openById(SHEET_FILE_ID);
    const sheet = ss.getSheetByName(PAYMENT_SHEET_NAME);
    
    // โหลดข้อมูลติวเตอร์
    const tutorLookupMap = getTutorLookupMap(ss);
    if (!tutorLookupMap) return;
    
    // ค้นหาแถวที่ตรงกับ Voucher No
    const dataRange = sheet.getRange("A:A").getValues();
    let foundRow = -1;
    for (let i = 0; i < dataRange.length; i++) {
      if (dataRange[i][0] == voucherNo) {
        foundRow = i + 1; 
        break;
      }
    }
    
    if (foundRow === -1) return;
    
    // ดึงข้อมูลจากแถวที่เจอ
    const rowData = sheet.getRange(foundRow, 1, 1, 7).getValues()[0];
    const tutorName = rowData[1];
    const amount = rowData[2];
    const details = rowData[3];
    const paymentDateValue = rowData[4];
    const amountInWords = rowData[6];
    
    const tutorInfo = tutorLookupMap[tutorName];
    if (!tutorInfo) return;
    
    const address = tutorInfo.address;
    const nationalID = tutorInfo.id;
    
    // จัดการไฟล์สลิป
    const file = DriveApp.getFileById(uploadedFileId[0]);
    const fileExtension = file.getName().split('.').pop(); 
    const baseFileName = `${voucherNo}-${tutorName}-${amount}`;
    const pdfFileName = `${baseFileName}.pdf`;
    const slipFileName = `${baseFileName}.${fileExtension}`; 

    const slipFolder = DriveApp.getFolderById(SLIP_FOLDER_ID);
    const slipBlob = file.getBlob().setName(slipFileName); 
    const finalSlipFile = slipFolder.createFile(slipBlob);
    file.setTrashed(true);
    
    Utilities.sleep(1000);
    
    // จัดรูปแบบวันที่
    const paymentDateObj = new Date(paymentDateValue);
    const formattedDate = paymentDateObj.toLocaleDateString("th-TH", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // สร้างและแก้ไข Google Docs (พร้อม Retry)
    let newDocFile = null;
    let retries = 3;
    
    while (retries > 0 && !newDocFile) {
      try {
        newDocFile = copyTemplateAndFillData(
          voucherNo, tutorName, amount, details, formattedDate, 
          amountInWords, address, nationalID, finalSlipFile.getBlob()
        );
        break;
      } catch (driveError) {
        retries--;
        if (retries > 0) {
          Utilities.sleep(3000);
        } else {
          throw driveError;
        }
      }
    }
    
    // แปลงเป็น PDF
    const pdfFile = createPdf(newDocFile, pdfFileName);
    
    // บันทึก URL ลงใน Sheet
    sheet.getRange(foundRow, 6).setValue(pdfFile.getUrl());
    
    // ลบไฟล์ Docs ชั่วคราวทิ้ง
    DriveApp.getFileById(newDocFile.getId()).setTrashed(true);
    
  } catch (error) {
    // ไม่ทำอะไร
  }
}


// ============================================================
// ฟังก์ชันโหลดข้อมูลติวเตอร์จากฐานข้อมูล
// ============================================================
function getTutorLookupMap(ss) { 
  const dbSheet = ss.getSheetByName(DATABASE_SHEET_NAME);
  if (!dbSheet) return null;
  
  const dbData = dbSheet.getRange(2, 1, dbSheet.getLastRow() - 1, 3).getValues();
  const tutorMap = {};
  
  for (const row of dbData) {
    const name = row[0]; 
    const address = row[1]; 
    const nationalID = row[2];
    if (name) { 
      tutorMap[name] = { address: address, id: nationalID }; 
    }
  }
  
  return tutorMap;
}


// ============================================================
// ฟังก์ชันค้นหารูป Placeholder ใน Table
// ============================================================
function findPlaceholderImage(element, altText) {
  // ค้นหาใน Table
  if (element.getType() == DocumentApp.ElementType.TABLE) {
    const table = element.asTable();
    
    for (let r = 0; r < table.getNumRows(); r++) {
      const row = table.getRow(r);
      for (let c = 0; c < row.getNumCells(); c++) {
        const cell = row.getCell(c);
        
        for (let p = 0; p < cell.getNumChildren(); p++) {
          const para = cell.getChild(p);
          
          if (para.getType() == DocumentApp.ElementType.PARAGRAPH) {
            const paragraph = para.asParagraph();
            
            for (let i = 0; i < paragraph.getNumChildren(); i++) {
              const child = paragraph.getChild(i);
              
              if (child.getType() == DocumentApp.ElementType.INLINE_IMAGE) {
                const image = child.asInlineImage();
                const altTitle = image.getAltTitle() || "";
                const altDesc = image.getAltDescription() || "";
                
                if (altTitle === altText || altDesc === altText) {
                  return image;
                }
              }
            }
          }
        }
      }
    }
  }

  // ค้นหาแบบ Recursive
  if (element.getNumChildren) {
    for (let i = 0; i < element.getNumChildren(); i++) {
      const child = element.getChild(i);
      const image = findPlaceholderImage(child, altText);
      if (image) return image;
    }
  }
  
  return null;
}


// ============================================================
// ฟังก์ชันคัดลอก Template และกรอกข้อมูล
// ============================================================
function copyTemplateAndFillData(voucherNo, tutorName, amount, details, paymentDate, amountInWords, address, nationalID, slipImageBlob) {
  // คัดลอก Template
  const templateFile = DriveApp.getFileById(TEMPLATE_ID);
  const newFile = templateFile.makeCopy(`Temp_${voucherNo}`); 
  const doc = DocumentApp.openById(newFile.getId());
  const body = doc.getBody();
  
  // จัดรูปแบบจำนวนเงิน
  const amountAsNumber = parseFloat(String(amount).replace(/,/g, '')); 
  const formattedAmount = amountAsNumber.toLocaleString('en-US', {
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2
  });
  
  // จัดรูปแบบเลขบัตรประชาชน
  let formattedID = "";
  const idStr = String(nationalID).replace(/[-\s]/g, ''); 
  if (idStr.length === 13) {
    formattedID = idStr.substring(0, 1) + " " + 
                  idStr.substring(1, 5) + " " + 
                  idStr.substring(5, 10) + " " + 
                  idStr.substring(10, 12) + " " + 
                  idStr.substring(12, 13);
  } else {
    formattedID = nationalID; 
  }

  // แทนที่รูปสลิป
  if (slipImageBlob) {
    const placeholderImage = findPlaceholderImage(body, "SLIP_PLACEHOLDER");
    
    if (placeholderImage) {
      const parent = placeholderImage.getParent().asParagraph();
      const childIndex = parent.getChildIndex(placeholderImage);
      const targetWidth = placeholderImage.getWidth();
      const targetHeight = placeholderImage.getHeight();
      
      const newImage = parent.insertInlineImage(childIndex, slipImageBlob);
      newImage.setWidth(targetWidth);
      newImage.setHeight(targetHeight);
      
      placeholderImage.removeFromParent();
    }
  }
  
  // แทนที่ข้อความทั้งหมด
  body.replaceText('{{VoucherNo}}', voucherNo);
  body.replaceText('{{TutorName}}', tutorName);
  body.replaceText('{{Amount}}', formattedAmount); 
  body.replaceText('{{AmountInWords}}', amountInWords); 
  body.replaceText('{{Details}}', details);
  body.replaceText('{{PaymentDate}}', paymentDate);
  body.replaceText('{{Address}}', address);         
  body.replaceText('{{NationalID}}', formattedID);
  
  // แก้ไขปี พ.ศ. ที่ผิด (2600-2650) เป็นปีปัจจุบัน
  const currentYear = new Date().getFullYear(); // 2024
  const buddhistYear = currentYear + 543; // 2568 (หรือ 2569 ในปีหน้า)

  for (let wrongYear = 2600; wrongYear <= 2650; wrongYear++) {
    body.replaceText(String(wrongYear), String(buddhistYear));
  }
  
  doc.saveAndClose();
  
  // Return Drive File object
  return DriveApp.getFileById(newFile.getId());
}


// ============================================================
// ฟังก์ชันแปลง Google Docs เป็น PDF
// ============================================================
function createPdf(docFile, fileName) {
  if (!docFile) return null;
  
  const destinationFolder = DriveApp.getFolderById(FOLDER_ID);
  const blob = docFile.getBlob().getAs('application/pdf');
  blob.setName(fileName);
  const pdfFile = destinationFolder.createFile(blob);
  
  return pdfFile;
}
# ระบบยืนยันตัวตน (Identity Verification System)

**เอกสารนี้:** ออกแบบระบบยืนยันตัวตนสำหรับติวเตอร์และนักเรียน/ผู้ปกครอง ในระบบ LINE OA

**ปัญหา:** LINE User ID แตกต่างกันในแต่ละบริบท (Group vs OA)

---

## 🔍 ปัญหาที่พบ

### LINE User ID ไม่สอดคล้องกัน

```
┌──────────────────┬─────────────────────────────────────────┐
│ บริบท            │ User ID                                 │
├──────────────────┼─────────────────────────────────────────┤
│ LINE Group       │ U1234abcd (เปลี่ยนแปลงตามกลุ่ม)         │
│ LINE OA (Chat)   │ U5678efgh (เปลี่ยนแปลงตาม OA)          │
│ Display Name     │ "ครูเอ" (ผู้ใช้เปลี่ยนได้ตลอดเวลา)       │
└──────────────────┴─────────────────────────────────────────┘
```

**ปัญหาหลัก:**
1. ติวเตอร์ส่งรายงานผ่าน **LINE Group** → ได้ Group User ID
2. ระบบส่งยืนยันผ่าน **LINE OA** → ต้องใช้ OA User ID
3. **Group User ID ≠ OA User ID** → ส่งข้อความไม่ถึงคนที่ถูกต้อง!

---

## ✅ แนวทางแก้ไข

### Option 1: ลงทะเบียนผ่าน Rich Menu (แนะนำ) ⭐

ให้ติวเตอร์ลงทะเบียนผ่าน LINE OA เพื่อผูก OA User ID กับข้อมูลในระบบ

```
┌─────────────────────────────────────────────────────────────┐
│  📱 LINE Official Account: "English Mania Tutor System"    │
│                                                             │
│  Rich Menu:                                                 │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ 📝 ลงทะเบียน  │ ✅ ยืนยันข้อมูล │ 📊 รายงาน    │            │
│  └──────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

#### Workflow การลงทะเบียน:

1. **ติวเตอร์กดปุ่ม "📝 ลงทะเบียน" ใน Rich Menu**
   - ระบบดึง OA User ID อัตโนมัติ
   - เปิด LIFF App (LINE Front-end Framework)

2. **กรอกข้อมูล:**
   ```
   ชื่อ-นามสกุล: [ป้อนชื่อเต็ม]
   เบอร์โทร: [สำหรับยืนยันตัวตน]
   รหัสติวเตอร์: [ดึงจาก TutorDB]
   ```

3. **ยืนยัน OTP (Optional):**
   - ส่ง SMS OTP ไปยังเบอร์โทร
   - ติวเตอร์กรอก OTP เพื่อยืนยัน

4. **บันทึกข้อมูล:**
   ```
   TutorDB (Sheet):
   Column L: lineDisplay (ชื่อจาก Group - เก่า)
   Column M: lineGroupId (Group User ID - เก่า)
   Column N: lineOaUserId (OA User ID - ใหม่!) ⭐
   Column O: phoneNumber (เบอร์โทร - ใหม่!)
   Column P: registeredAt (วันที่ลงทะเบียน - ใหม่!)
   Column Q: verificationStatus (สถานะ: ✅ Verified / ⏳ Pending)
   ```

#### ข้อดี:
- ✅ ได้ OA User ID ที่ถูกต้อง
- ✅ ยืนยันตัวตนด้วยเบอร์โทร (ไม่ซ้ำกัน)
- ✅ ติวเตอร์ทำเองผ่าน LINE OA
- ✅ ป้องกันการปลอมแปลง

#### ข้อเสีย:
- ❌ ต้องพัฒนา LIFF App (ใช้เวลา)
- ❌ ติวเตอร์ทุกคนต้องลงทะเบียนก่อน

---

### Option 2: ส่ง "คีย์ลงทะเบียน" ทาง Line Group (ทางลัด)

ใช้ในช่วงเริ่มต้น หรือถ้าไม่มีเวลาพัฒนา LIFF

```
Workflow:
1. Admin สร้าง "Registration Key" ให้แต่ละติวเตอร์
   Example: "TUTOR-001-ABC123"

2. แจ้งในกลุ่ม LINE Group:
   "ติวเตอร์ทุกคนกรุณาส่งข้อความส่วนตัวมาที่ LINE OA
    พร้อมคีย์: TUTOR-XXX-XXXXXX
    เพื่อเชื่อมโยงบัญชีของคุณ"

3. ติวเตอร์ส่งคีย์มาที่ LINE OA
   LINE OA Bot ตอบกลับ:
   "ยืนยันตัวตน: ครูเอ (TUTOR-001) สำเร็จ ✅"

4. ระบบบันทึก OA User ID + Registration Key
```

**TutorDB Structure:**
```
Column A: Full Name (ชื่อเต็ม)
Column B: Nick Name (ชื่อเล่น)
...
Column L: lineDisplay (Display Name จาก Group)
Column M: lineGroupId (Group User ID)
Column N: lineOaUserId (OA User ID - จากการลงทะเบียน) ⭐
Column O: registrationKey (คีย์ลงทะเบียน - ใช้ครั้งเดียว)
Column P: registeredAt (วันที่ลงทะเบียน)
Column Q: verificationStatus (✅ Verified / ⏳ Pending / ❌ Unregistered)
```

#### ข้อดี:
- ✅ ง่าย ไม่ต้องพัฒนา LIFF
- ✅ ใช้เวลาน้อย
- ✅ ได้ OA User ID ที่ถูกต้อง

#### ข้อเสีย:
- ❌ ต้องสร้างคีย์ให้ทุกคน (manual)
- ❌ อาจมีคนใช้คีย์ผิด/ลืม

---

### Option 3: ใช้เบอร์โทรเป็นตัวยืนยัน (Hybrid)

รวมทั้ง 2 วิธี: ลงทะเบียนด้วยเบอร์โทร + LINE OA

```
Workflow:
1. Admin เพิ่มเบอร์โทรติวเตอร์ใน TutorDB (Column O)

2. ติวเตอร์ส่งข้อความมาที่ LINE OA:
   "ลงทะเบียน [เบอร์โทร]"
   Example: "ลงทะเบียน 0812345678"

3. ระบบตรวจสอบ:
   - เบอร์โทรตรงกับ TutorDB หรือไม่?
   - ถ้าตรง → บันทึก OA User ID
   - ถ้าไม่ตรง → แจ้งเตือน "เบอร์โทรไม่ถูกต้อง"

4. ส่ง OTP ไปยังเบอร์โทร (Optional - เพิ่มความปลอดภัย)

5. ยืนยันสำเร็จ → บันทึก OA User ID ใน TutorDB
```

#### ข้อดี:
- ✅ ปลอดภัย (ใช้เบอร์โทรยืนยัน)
- ✅ ไม่ต้องสร้างคีย์
- ✅ ติวเตอร์ทำเองง่ายๆ

#### ข้อเสีย:
- ❌ ต้องมีข้อมูลเบอร์โทรล่วงหน้า
- ❌ ต้องพัฒนา OTP System (ถ้าต้องการ)

---

## 📊 เปรียบเทียบทั้ง 3 วิธี

| เกณฑ์ | Option 1: Rich Menu + LIFF | Option 2: Registration Key | Option 3: Phone Verification |
|-------|----------------------------|----------------------------|------------------------------|
| **ความปลอดภัย** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **ความยาก** | สูง (ต้อง LIFF) | ต่ำ | กลาง |
| **เวลาพัฒนา** | 2-3 วัน | 2-3 ชม. | 1 วัน |
| **ความสะดวก (ติวเตอร์)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Scalability** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 คำแนะนำ

### สำหรับ MVP (เริ่มต้น):
**Option 2: Registration Key**
- ทำได้เร็ว ใช้งานได้ทันที
- เหมาะสำหรับทีมเล็ก (ติวเตอร์ 5-20 คน)

### สำหรับระยะยาว:
**Option 3: Phone Verification** หรือ **Option 1: Rich Menu + LIFF**
- ปลอดภัยกว่า, สะดวกกว่า
- เหมาะสำหรับทีมใหญ่ (20+ คน)

---

## 🔧 การปรับปรุง TutorDB

### โครงสร้างปัจจุบัน (ห้ามแก้ไข):

```
Column A-K: ข้อมูลติวเตอร์ (Full Name, Nick, Contact, etc.)
Column L: lineDisplay (LINE Display Name จาก Group)
Column M: lineGroupId (LINE Group User ID)
Column N: (ว่าง - พร้อมใช้งาน)
Column O: (ว่าง - พร้อมใช้งาน)
Column P-T: Payment Rules (ต้องไม่แก้ไข!) ⚠️
  - Column P (15): online1by1Trigger
  - Column Q (16): onsite1by1Trigger
  - Column R (17): onsiteGroupTrigger
  - Column S (18): onsiteDayTrigger
  - Column T (19): conditions
```

### คอลัมน์ใหม่ที่เพิ่ม (ไม่กระทบโค้ดเดิม):

```
Column N: lineOaUserId (LINE OA User ID) ⭐ สำคัญมาก!
Column O: phoneNumber (เบอร์โทร - สำหรับยืนยันตัวตน)
Column U: registeredAt (วันที่ลงทะเบียน) - เพิ่มหลัง Column T
Column V: verificationStatus (สถานะการยืนยัน)
  - ✅ Verified (ยืนยันแล้ว)
  - ⏳ Pending (รอยืนยัน)
  - ❌ Unregistered (ยังไม่ลงทะเบียน)
Column W: lastUpdated (อัปเดตล่าสุด)
```

**⚠️ สำคัญ:** Columns P-T ใช้งานอยู่ในโค้ด Payment Rules ห้ามแก้ไข!

---

## 📱 ตัวอย่าง Webhook Handler (LINE OA)

### ไฟล์: `lineoa webhook.gs` (ใหม่)

```javascript
/**
 * Webhook สำหรับรับข้อความจาก LINE OA
 */
function doPost(e) {
  const events = JSON.parse(e.postData.contents).events;

  events.forEach(event => {
    if (event.type === 'message' && event.message.type === 'text') {
      handleTextMessage(event);
    } else if (event.type === 'postback') {
      handlePostback(event);
    }
  });

  return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * จัดการข้อความที่ติวเตอร์ส่งมา
 */
function handleTextMessage(event) {
  const userId = event.source.userId; // OA User ID ⭐
  const messageText = event.message.text;

  // ลงทะเบียนด้วยเบอร์โทร (Option 3)
  if (messageText.startsWith('ลงทะเบียน ')) {
    const phoneNumber = messageText.replace('ลงทะเบียน ', '').trim();
    registerTutorByPhone(userId, phoneNumber);
  }

  // ลงทะเบียนด้วย Registration Key (Option 2)
  else if (messageText.match(/^TUTOR-\d{3}-[A-Z0-9]{6}$/)) {
    registerTutorByKey(userId, messageText);
  }
}

/**
 * ลงทะเบียนติวเตอร์ด้วยเบอร์โทร
 */
function registerTutorByPhone(userId, phoneNumber) {
  const tutorDB = getTutorDBSheet();
  const data = tutorDB.getDataRange().getValues();

  // หา row ที่มีเบอร์โทรตรง (Column O = 15)
  for (let i = 1; i < data.length; i++) {
    if (data[i][14] === phoneNumber) { // Column O
      // บันทึก OA User ID (Column N = 13)
      tutorDB.getRange(i + 1, 14).setValue(userId);
      tutorDB.getRange(i + 1, 16).setValue(new Date()); // registeredAt
      tutorDB.getRange(i + 1, 17).setValue('✅ Verified'); // status

      const tutorName = data[i][0]; // Full Name
      replyMessage(userId, `ยืนยันตัวตนสำเร็จ! ✅\n\nสวัสดีค่ะ คุณ${tutorName}\nบัญชีของคุณถูกเชื่อมโยงกับระบบแล้ว`);
      return;
    }
  }

  // ไม่พบเบอร์โทร
  replyMessage(userId, '❌ ไม่พบเบอร์โทรนี้ในระบบ\nกรุณาติดต่อแอดมิน');
}

/**
 * ส่งข้อความตอบกลับผ่าน LINE OA
 */
function replyMessage(userId, text) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: userId,
    messages: [{ type: 'text', text: text }]
  };

  UrlFetchApp.fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload)
  });
}
```

---

## 🔄 การส่งข้อความยืนยันให้ติวเตอร์ (Phase 2)

### ปรับปรุง `Tutor Confirmation.gs`

```javascript
/**
 * ส่งข้อมูลให้ติวเตอร์ยืนยันผ่าน LINE OA
 */
function sendConfirmationToTutors(period, tutorPayments) {
  const tutorDB = loadTutorDB();

  tutorPayments.forEach(payment => {
    const tutorName = payment.tutor;

    // ดึง OA User ID จาก TutorDB (Column N)
    const oaUserId = getOaUserId(tutorName, tutorDB);

    if (!oaUserId) {
      Logger.log(`⚠️ ติวเตอร์ ${tutorName} ยังไม่ได้ลงทะเบียน LINE OA`);
      return; // ข้าม
    }

    // สร้างข้อความ Flex Message
    const message = createConfirmationMessage(period, payment);

    // ส่งข้อความ
    pushMessage(oaUserId, message);

    // บันทึกใน Tutor Confirmation Log
    logConfirmationSent(tutorName, period, oaUserId);
  });
}

/**
 * ดึง OA User ID จาก TutorDB
 */
function getOaUserId(tutorName, tutorDB) {
  const tutorData = tutorDB.getDataRange().getValues();

  for (let i = 1; i < tutorData.length; i++) {
    const fullName = tutorData[i][0]; // Column A
    if (fullName === tutorName) {
      return tutorData[i][13]; // Column N: lineOaUserId
    }
  }

  return null;
}
```

---

## 📋 Next Steps

1. **เลือกวิธียืนยันตัวตน** (Option 1/2/3)
2. **เพิ่มคอลัมน์ใน TutorDB** (Column N-R)
3. **พัฒนา Webhook Handler** (lineoa webhook.gs)
4. **ทดสอบการลงทะเบียน** กับติวเตอร์ 1-2 คน
5. **Roll out ให้ติวเตอร์ทั้งหมด**

---

*เอกสารสร้างโดย: Claude Code (Sonnet 4.5)*
*วันที่: 6 ธันวาคม 2568*

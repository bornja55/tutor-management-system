# 📚 English Mania - ระบบบันทึกและรายงานผลการสอนอัตโนมัติ

> **Last Updated:** 6 ธันวาคม 2568
> **Version:** 8.6 (Payment 7.6)
> **Status:** 🟢 Active

---

## 📋 สารบัญ

1. [ภาพรวมระบบ](#-ภาพรวมระบบ)
2. [สถาปัตยกรรม](#️-สถาปัตยกรรม)
3. [Workflow การทำงาน](#-workflow-การทำงาน)
4. [โครงสร้างไฟล์และชีต](#-โครงสร้างไฟล์และชีต)
5. [ฟีเจอร์หลัก](#-ฟีเจอร์หลัก)
6. [การติดตั้งและใช้งาน](#-การติดตั้งและใช้งาน)

---

## 🎯 ภาพรวมระบบ

ระบบอัตโนมัติสำหรับจัดการและรายงานผลการสอนของติวเตอร์ สร้างบน Google Sheets และ Apps Script โดยมีเป้าหมายเพื่อลดขั้นตอนการทำงาน manual, เพิ่มความถูกต้องของข้อมูล และสร้างรายงานเชิงวิเคราะห์ที่นำไปใช้งานต่อได้ทันที

ระบบประกอบด้วย 6 ส่วนหลัก:

### **1. ระบบ Import ข้อมูลจาก LINE OA (อัตโนมัติ)** ✅ เสร็จสิ้น
- ติวเตอร์ส่งรายงานการสอนผ่าน LINE Group ที่กำหนด
- Script อ่านข้อมูลจากไฟล์ Log (.txt) ที่ Export มาเก็บไว้ใน Google Drive
- ทำการประมวลผล (Parse), แก้ไขรูปแบบข้อมูล (Normalize), และคำนวณค่าที่จำเป็น (เช่น ระยะเวลาสอน)
- นำเข้าข้อมูลสู่ชีตหลัก `บันทึกลงเวลาจาก LineBot` พร้อมระบบตรวจจับและลบข้อมูลซ้ำที่ซับซ้อน

### **2. ระบบตรวจสอบและยืนยันข้อมูล (Validation & Confirmation)** ⚙️ กำลังพัฒนา

- **Validation Dashboard**: แอดมินตรวจสอบความถูกต้องของข้อมูลก่อนส่งให้ติวเตอร์ยืนยัน
- **Tutor Confirmation**: ส่งข้อมูลให้ติวเตอร์ยืนยันผ่าน LINE OA พร้อมตัวเลือกแจ้งปัญหา
- **Admin Alerts**: ระบบจัดการปัญหาและข้อสงสัยที่ติวเตอร์แจ้งมา
- **Admin Dashboard - Confirmation**: ติดตามสถานะการยืนยันของติวเตอร์แต่ละคน
- **Data Correction**: ระบบแก้ไขข้อมูลและส่งให้ติวเตอร์ยืนยันใหม่

### **3. ระบบทบทวนและอนุมัติการจ่าย (Payment Review)** ⚙️ กำลังพัฒนา

- **Payment Review**: ทบทวนข้อมูลการจ่ายเงินที่ติวเตอร์ยืนยันแล้ว
- **Payment Log**: บันทึกประวัติการจ่ายเงินทั้งหมด พร้อม SR No. และ Voucher No.
- เชื่อมต่อกับระบบสร้างใบสำคัญจ่าย (Payment Voucher)

### **4. Dashboard สำหรับคำนวณยอดจ่าย (Payment Dashboard)** ✅ เสร็จสิ้น
- หน้า Dashboard สำหรับฝ่ายบัญชีเพื่อคำนวณยอดเงินที่ต้องจ่ายให้ติวเตอร์
- ผู้ใช้สามารถกรองข้อมูลตาม **ปี, เดือน, และรอบวันที่ (1-15, 16-31)**
- ระบบใช้ **Payment Rules** ที่ยืดหยุ่น สามารถกำหนดเงื่อนไขการจ่ายเงินแยกรายบุคคลได้ (onCourseComplete, everyPeriod, monthly)
- รองรับ **Conditions** พิเศษ เช่น เปลี่ยนอัตราค่าสอนตามวัน (เสาร์/อาทิตย์ → onsiteDay)
- มาพร้อมตาราง **แจกแจงรายละเอียด** การสอนของแต่ละคอร์สประกอบการจ่ายเงิน พร้อมแสดง Payment Trigger และหมายเหตุ

### **5. Dashboard สำหรับรายงานผล (Report Dashboard)** ✅ เสร็จสิ้น
- หน้า Dashboard สำหรับดูรายงานและสถิติการสอนในภาพรวม
- สามารถกรองข้อมูลได้ทั้ง **ปี, เดือน, รอบวันที่, นักเรียน, และติวเตอร์**
- มีปุ่มสร้างรายงาน 2 รูปแบบหลัก:
  - **รายงานนักเรียน**: แสดงประวัติการเรียนของนักเรียนแต่ละคน พร้อมสรุปจำนวนคอร์ส (ทั้งหมด/จบแล้ว), ชั่วโมงรวม, และช่วงเวลาที่เรียน
  - **รายงานติวเตอร์**: สรุปผลงานของติวเตอร์แต่ละคน ทั้งชั่วโมงสอน, จำนวนนักเรียน, และยอดเงินค่าสอนที่เกิดขึ้น พร้อมตารางรายละเอียดการสอนแต่ละคอร์ส
- **Dynamic Layout**: ระบบปรับ UI อัตโนมัติตามจำนวนนักเรียนและติวเตอร์ที่กรอง (รองรับได้ถึง 39 คนต่อหมวด)

### **6. ระบบจัดการฐานข้อมูล (Shared Utilities)** ✅ เสร็จสิ้น
- **TutorDB**: ใช้ชีตแยกต่างหากเป็นฐานข้อมูลกลางสำหรับติวเตอร์ เพื่อให้สามารถอ้างอิง "ชื่อจริง" ของติวเตอร์ได้ แม้ชื่อที่แสดงใน LINE จะเปลี่ยนไป
- **TutorDB Identity (Columns U-Y)** ⚙️: เก็บข้อมูลยืนยันตัวตน (**LINE OA User ID U**, Phone Number V, Registration Date W, Verification Status X, Last Updated Y)
- **TutorDB Payment Rules (Columns P-T)** ✅: เก็บเงื่อนไขการจ่ายเงินแยกรายบุคคล (online1by1 P, onsite1by1 Q, onsiteGroup R, onsiteDay S, Conditions T)
- **TutorDB Bank Info (Columns N-O)** ✅: ข้อมูลบัญชีธนาคาร (Book Bank N, Book Bank ID O)
- **Shared Config & Functions**: รวมการตั้งค่า (เช่น เรทค่าสอน) และฟังก์ชันที่ใช้ร่วมกันไว้ที่ส่วนกลาง ทำให้ง่ายต่อการบำรุงรักษา
- **Payment Rules Engine**: ระบบคำนวณเงินอัตโนมัติตาม rules ที่กำหนด รองรับ conditions และ triggers ต่างๆ

---

## 🏗️ สถาปัตยกรรม

```
┌─────────────────────────────────────────────────────────────┐
│                    📱 LINE Group                            │
│              (ติวเตอร์ส่งรายงานการสอน)                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              📄 Google Drive (Text Files)                   │
│         /folder/2025-11-26-English Mania.txt               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          🤖 Google Apps Script (Importer)                   │
│         (LineOA Report Importer.gs)                         │
│   - อ่านไฟล์, Parse ข้อมูล, คำนวณ Duration, จัดการวันที่      │
│   - ตรวจจับและลบข้อมูลซ้ำ                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│     📊 Google Sheet: "ระบบบันทึกการสอน"                      │
│                                                             │
│  ├─ **ชีต 1: บันทึกลงเวลาจาก LineBot** (Raw Data)           │
│  ├─ **ชีต 2: Validation Dashboard** (ตรวจสอบ) ⚙️           │
│  ├─ **ชีต 3: Admin Dashboard - Confirmation** (ติดตาม) ⚙️  │
│  ├─ **ชีต 4: Tutor Confirmation Log** (บันทึกยืนยัน) ⚙️     │
│  ├─ **ชีต 5: Admin Alerts** (แจ้งปัญหา) ⚙️                  │
│  ├─ **ชีต 6: Payment Review** (ทบทวนจ่าย) ⚙️                │
│  ├─ **ชีต 7: Payment Log** (บันทึกจ่าย) ⚙️                  │
│  ├─ **ชีต 8: Dashboard Payment** (คำนวณยอดจ่าย) ⭐          │
│  └─ **ชีต 9: Dashboard Report** (รายงาน) ⭐                 │
│                                                             │
│  (Script ภายใน):                                           │
│  ├─ LineOA Report Importer.gs (Import)                     │
│  ├─ Dashboard Validation.gs (ตรวจสอบ) ⚙️                   │
│  ├─ Tutor Confirmation.gs (ยืนยัน) ⚙️                       │
│  ├─ Dashboard Payment.gs (จ่ายเงิน)                        │
│  ├─ Dashboard Report.gs (รายงาน)                           │
│  ├─ utils shared.gs (ฟังก์ชันร่วม)                           │
│  └─ shared config.gs (ตั้งค่ากลาง)                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ├───────────┐
                          │           │
                          ↓           ↓
┌──────────────────────────────┐  ┌──────────────────────────┐
│ 📂 Tutor Database (แยกไฟล์)  │  │  📱 LINE OA API ⚙️       │
│ - Master Data ติวเตอร์       │  │  - ส่งข้อมูลยืนยัน        │
│ - Payment Rules (P-T)        │  │  - รับการตอบกลับ          │
└──────────────────────────────┘  └──────────────────────────┘
```

**สัญลักษณ์:**

- ⭐ = ใช้งานอยู่
- ⚙️ = กำลังพัฒนา/ออกแบบ

---

## 🔄 Workflow การทำงาน

### **Phase 1: Import & Clean Data (อัตโนมัติ)** ✅

กระบวนการนี้ทำงานเบื้องหลังโดยอัตโนมัติผ่าน Time-driven trigger ทุกชั่วโมง

1. **Scan & Read**: Script `LineOA Report Importer.gs` สแกนหาไฟล์ .txt ใหม่ในโฟลเดอร์ Google Drive
2. **Parse & Extract**: ดึงข้อมูลที่จำเป็นจากข้อความ Report ของติวเตอร์
3. **Calculate & Normalize**:
   - คำนวณ `Duration` (ระยะเวลาสอน) จากเวลาเริ่มต้น-สิ้นสุด
   - แปลง `Course Type` ให้อยู่ในรูปแบบมาตรฐาน (เช่น `online1by1`)
   - **จัดการวันที่ที่กำกวม**: แก้ไขรูปแบบวันที่ `DD/MM/YY` หรือ `MM/DD/YY` ที่ผิดพลาดโดยอ้างอิงจากวันที่ของไฟล์
4. **Write to Sheet**: เขียนข้อมูลที่สะอาดแล้วลงในชีต `บันทึกลงเวลาจาก LineBot`
5. **Deduplication**: ตรวจจับและลบรายการสอนที่ซ้ำซ้อน (เช็คจาก Tutor + Student + Date + Time) โดยจะเก็บรายการที่มี `ชั่วโมงคงเหลือ` น้อยที่สุดไว้ (ถือว่าอัปเดตสุด)

---

### **Phase 2: Validation & Tutor Confirmation** ⚙️ กำลังพัฒนา

#### **2.1 Validation Dashboard (แอดมินตรวจสอบ)**

แอดมินใช้หน้า `Validation Dashboard` เพื่อตรวจสอบข้อมูลก่อนส่งให้ติวเตอร์ยืนยัน

1. **เลือกรอบจ่าย**: เลือก ปี, เดือน, รอบวันที่ (1-15 หรือ 16-31)
2. **ตรวจสอบข้อมูล**: ระบบแสดงสรุปตามติวเตอร์ พร้อมเครื่องหมาย ⚠️ หากมีข้อมูลผิดปกติ
   - คอร์สที่จบแล้ว (remaining = 0)
   - ชั่วโมงรวม
   - ยอดเงินที่จะจ่าย
   - ข้อผิดพลาดที่ตรวจพบ (เช่น วันที่ไม่ตรงรอบ, ยอดเงินผิดปกติ)
3. **แก้ไขข้อมูล**: หากพบข้อผิดพลาด แอดมินสามารถแก้ไขได้ที่ชีตต้นฉบับ
4. **อนุมัติส่งยืนยัน**: กดปุ่ม "ส่งให้ติวเตอร์ยืนยัน" เมื่อข้อมูลถูกต้องครบถ้วน

#### **2.2 ส่งข้อมูลให้ติวเตอร์ยืนยัน (LINE OA)**

**⚠️ การยืนยันตัวตน:**

ติวเตอร์ต้องลงทะเบียนผ่าน LINE OA ก่อนเพื่อผูก LINE OA User ID กับระบบ

**เหตุผล:** LINE User ID จาก Group ≠ LINE User ID จาก OA

- ติวเตอร์ส่งรายงานผ่าน **LINE Group** → Group User ID
- ระบบส่งยืนยันผ่าน **LINE OA** → OA User ID (ต่างกัน!)

**วิธีลงทะเบียน (Option 2: Registration Key):**

1. Admin สร้าง Registration Key ให้ติวเตอร์ (เช่น `TUTOR-001-ABC123`)
2. ติวเตอร์ส่งข้อความส่วนตัวมาที่ LINE OA: "ลงทะเบียน [คีย์]"
3. ระบบบันทึก OA User ID ใน TutorDB (Column N)
4. ยืนยันตัวตนสำเร็จ ✅

**ดูรายละเอียดเพิ่มเติม:** [IDENTITY_VERIFICATION_DESIGN.md](IDENTITY_VERIFICATION_DESIGN.md)

---

ระบบส่งข้อความผ่าน LINE OA ไปยังติวเตอร์แต่ละคน (ใช้ OA User ID จาก TutorDB)

**ข้อความที่ส่ง:**

```
📊 ยืนยันข้อมูลการจ่าย - รอบที่ 1-15 พ.ย. 2568

สวัสดีค่ะคุณครู [ชื่อติวเตอร์]

💰 ยอดเงินที่จะได้รับ: X,XXX บาท

📚 รายละเอียด:
- Online 1-1: X ชม. = X,XXX บาท
- Onsite 1-1: X ชม. = X,XXX บาท
- Onsite Day: X วัน = X,XXX บาท

กรุณายืนยัน:
✅ ถูกต้อง
❌ มีปัญหา (แจ้งรายละเอียด)
```

**การตอบกลับ:**

- ติวเตอร์กด "✅ ถูกต้อง" → บันทึกใน `Tutor Confirmation Log`
- ติวเตอร์กด "❌ มีปัญหา" → เปิดฟอร์มให้แจ้งรายละเอียด → บันทึกใน `Admin Alerts`

#### **2.3 Tutor Confirmation Log (บันทึกการยืนยัน)**

ระบบบันทึกการยืนยันทั้งหมดในชีตนี้:

**คอลัมน์:**

- `Timestamp`: เวลาที่ยืนยัน
- `Tutor`: ชื่อติวเตอร์
- `Period`: รอบที่ (เช่น "พ.ย. 2568 (1-15)")
- `Status`: สถานะ (✅ Confirmed / ⚠️ Issue Reported / ⏳ Pending)
- `Note`: หมายเหตุ (ถ้ามี)
- `Confirmed Date`: วันที่ยืนยัน
- `Sent By`: ผู้ส่ง (Admin)
- `SR No.`: เลขที่ใบสำคัญรับ (หลังอนุมัติ)

#### **2.4 Admin Alerts (จัดการปัญหา)**

เมื่อติวเตอร์แจ้งปัญหา ระบบจะบันทึกใน `Admin Alerts`:

**คอลัมน์:**

- `Timestamp`: เวลาที่แจ้ง
- `Type`: ประเภทปัญหา (❌ ข้อมูลผิด / ❓ สอบถาม / 💰 ยอดเงินไม่ตรง)
- `Tutor`: ชื่อติวเตอร์
- `Message`: รายละเอียดปัญหา
- `Status`: สถานะ (⏳ รอดำเนินการ / 🔄 กำลังแก้ไข / ✅ แก้ไขแล้ว)
- `Resolved By`: ผู้แก้ไข
- `Resolved At`: เวลาที่แก้ไขเสร็จ

**Workflow การแก้ไข:**

1. แอดมินดูปัญหาจาก `Admin Alerts`
2. ตรวจสอบและแก้ไขข้อมูลในชีตต้นฉบับ
3. อัปเดตสถานะเป็น "แก้ไขแล้ว"
4. ส่งข้อมูลใหม่ให้ติวเตอร์ยืนยันอีกครั้ง

#### **2.5 Admin Dashboard - Confirmation (ติดตามสถานะ)**

หน้าจอสำหรับแอดมินติดตามสถานะการยืนยันแบบ real-time:

**แสดง:**

- รอบที่เลือก
- รายชื่อติวเตอร์ทั้งหมด
- ยอดเงินแต่ละคน
- สถานะการยืนยัน (✅ / ⚠️ / ⏳)
- เวลาที่ยืนยัน
- หมายเหตุ

**สีแจ้งเตือน:**

- 🟢 เขียว = ยืนยันแล้ว
- 🔴 แดง = มีปัญหา
- 🟡 เหลือง = รอยืนยัน

---

### **Phase 3: Payment Review & Approval** ⚙️ กำลังพัฒนา

เป็นกระบวนการทบทวนก่อนจ่ายเงินจริง (เฉพาะที่ติวเตอร์ยืนยันแล้ว)

1. **Payment Review**: แอดมินทบทวนข้อมูลที่ติวเตอร์ยืนยันแล้ว
   - ตรวจสอบความครบถ้วน
   - ตรวจสอบยอดเงิน
   - สร้าง Voucher No. และ SR No.
2. **สร้างเอกสาร**: สร้างใบสำคัญจ่าย (Payment Voucher) พร้อม PDF
3. **บันทึก Payment Log**: บันทึกประวัติการจ่ายทั้งหมดพร้อม Link ไฟล์
4. **ส่งต่อฝ่ายบัญชี**: ส่งเอกสารให้ฝ่ายบัญชีดำเนินการจ่ายเงิน

---

### **Phase 4: Payment Dashboard (สำหรับฝ่ายบัญชี)** ✅

เป็นกระบวนการที่ทำผ่านหน้า `Dashboard Payment`
1.  **Setup UI**: หากเป็นครั้งแรก ให้รัน `setupDashboardPayment` เพื่อสร้างหน้าตาและส่วนควบคุมทั้งหมด
2.  **Filter Period**: ผู้ใช้ (ฝ่ายบัญชี) ทำการเลือก **ปี, เดือน, และรอบวันที่ (1-15 หรือ 16-31)** ที่ต้องการคำนวณยอดจ่าย
3.  **Update Tutors**: กดปุ่ม **"🔄 อัพเดต"**.
    *   Script จะไปกรองข้อมูลจากชีตหลัก และแสดงรายชื่อติวเตอร์ (พร้อม Checkbox) ที่มีสอนในช่วงเวลาที่เลือกเท่านั้น
4.  **Select Tutors**: ผู้ใช้เลือกว่าจะสร้างรายงานของติวเตอร์คนไหนบ้าง (หรือเลือกทั้งหมด)
5.  **Generate Report**: กดปุ่ม **"📊 สร้างรายงาน"**.
    *   Script `Dashboard Payment.gs` จะทำงานโดยเรียกใช้ฟังก์ชันจาก `utils shared.gs` และ `shared config.gs`
    *   **คำนวณยอดเงิน**: จะคำนวณเงินเฉพาะคอร์สที่ `ชั่วโมงคงเหลือ` เท่ากับ 0 เท่านั้น
    *   **แสดงผล**: สร้างตารางสรุปยอดจ่าย และตารางแจกแจงรายละเอียดของแต่ละคอร์สที่จ่ายเงินในรอบนั้นๆ

---

### **Phase 3: Report & Analytics Workflow**

เป็นกระบวนการที่ทำผ่านหน้า `Dashboard Report`
1. **Setup UI**: หากเป็นครั้งแรก ให้รัน `setupDashboardReport` เพื่อสร้างหน้าตาและส่วนควบคุมทั้งหมด
2. **Filter Data**: ผู้ใช้สามารถเลือกเงื่อนไขการกรองได้หลากหลาย: **ปี, เดือน, รอบวันที่, นักเรียน, ติวเตอร์**
3. **Update Filters**: กดปุ่ม **"🔄 อัพเดต"** จาก Menu.
   - Script จะกรองข้อมูลและแสดงรายชื่อนักเรียนและติวเตอร์ที่เกี่ยวข้องในช่วงเวลานั้นๆ เป็น Checkbox
   - ระบบจัดการ Layout แบบ Dynamic: รองรับได้ถึง 39 คนต่อหมวด (13 คน x 3 แถว)
   - Header และ Freeze Row จะปรับตามจำนวนข้อมูลอัตโนมัติ
4. **Select Items**: เลือก Checkbox นักเรียนและ/หรือติวเตอร์ที่ต้องการดูรายงาน (หรือเลือก "ทั้งหมด")
5. **Generate Report**: กด Menu เลือกประเภทรายงาน:
   - **"📚 รายงานนักเรียน"**: แสดงประวัติการเรียนพร้อมข้อมูล: คอร์ส (X/Y), ชั่วโมงรวม, ช่วงเวลา (เดือน + รอบ), และรายละเอียดการเรียนแต่ละครั้ง
   - **"👨‍🏫 รายงานติวเตอร์"**: แสดงตารางสรุปยอดจ่ายและรายละเอียดการสอนแต่ละคอร์ส โดยแบ่งเป็น 2 ส่วน: (1) ตารางสรุปยอดชำระเงินทั้งหมด และ (2) รายละเอียดการสอนแต่ละติวเตอร์

---

## 📂 โครงสร้างไฟล์และชีต

### **ไฟล์ Apps Script หลัก (ใน Google Sheet "ระบบบันทึกการสอน")**

*   `LineOA Report Importer.gs`: **(ไฟล์หลัก)** สคริปต์สำหรับ Import ข้อมูลจาก LINE OA, ทำความสะอาดข้อมูล, และจัดการข้อมูลซ้ำซ้อน
*   `Dashboard Payment.gs`: สคริปต์ควบคุม UI และ Logic ทั้งหมดของหน้า `Dashboard Payment`
*   `Dashboard Report.gs`: สคริปต์ควบคุม UI และ Logic ทั้งหมดของหน้า `Dashboard Report`
*   `utils shared.gs`: **(ส่วนกลาง)** คลังฟังก์ชันที่ใช้ร่วมกันระหว่าง Dashboard ทั้งสอง เช่น การกรองข้อมูล, การเชื่อมต่อ TutorDB, การจัดการวันที่
*   `shared config.gs`: **(ส่วนกลาง)** ไฟล์เก็บค่าคงที่ทั้งหมด เช่น ID ของชีต, เรทค่าสอน, ชื่อเดือน, โค้ดสีสำหรับ UI

### **โครงสร้างชีต (ใน Google Sheet "ระบบบันทึกการสอน")**

#### **ชีทที่ใช้งานอยู่** ✅

*   `บันทึกลงเวลาจาก LineBot`: ชีตหลักสำหรับเก็บข้อมูลดิบ (Raw Data) ทั้งหมดที่ Import เข้ามา
*   `Dashboard Payment`: ชีตสำหรับคำนวณและสรุปยอดจ่ายเงินให้ติวเตอร์
*   `Dashboard Report`: ชีตสำหรับดูรายงานและสถิติการสอนในภาพรวม

#### **ชีทสำหรับระบบยืนยัน** ⚙️ กำลังพัฒนา

*   **Validation Dashboard**: หน้าจอตรวจสอบข้อมูลก่อนส่งให้ติวเตอร์ยืนยัน (แสดงสรุปยอดเงินตามติวเตอร์, ตรวจจับข้อมูลผิดปกติอัตโนมัติ, เลือกรอบจ่ายและส่งข้อมูลให้ติวเตอร์)
*   **Admin Dashboard - Confirmation**: หน้าจอติดตามสถานะการยืนยัน (แสดงสถานะ real-time: ✅ Confirmed / ⚠️ Issue / ⏳ Pending)
*   **Tutor Confirmation Log**: บันทึกการยืนยันจากติวเตอร์ (Timestamp, Tutor, Period, Status, Note, SR No.)
*   **Admin Alerts**: บันทึกปัญหาที่ติวเตอร์แจ้งมา (Type, Tutor, Message, Status, Resolved By + Workflow การแก้ไขและส่งยืนยันใหม่)
*   **Payment Review**: ทบทวนข้อมูลก่อนจ่ายเงิน (เฉพาะที่ติวเตอร์ยืนยันแล้ว, สร้าง Voucher No. และ SR No., เชื่อมโยง PDF)
*   **Payment Log**: บันทึกประวัติการจ่ายเงินทั้งหมด (Timestamp, Voucher No., SR No., Tutor, Amount, Link ไฟล์ PDF)

### **ไฟล์ภายนอก**

*   **Google Sheet "TutorDB"**: ไฟล์ชีตแยกต่างหาก ทำหน้าที่เป็นฐานข้อมูล Master Data ของติวเตอร์ทุกคน (เก็บชื่อจริง, Line ID, ข้อมูลส่วนตัวอื่นๆ)

---

## ✨ ฟีเจอร์หลัก

### **1. Data Import & Cleaning Engine**
- **Import อัตโนมัติ**: ทำงานเบื้องหลังทุกชั่วโมง
- **Date Correction**: แก้ไขรูปแบบวันที่ `DD/MM/YY` vs `MM/DD/YY` ที่ผิดพลาดโดยอัตโนมัติ
- **Smart Deduplication**: ลบข้อมูลซ้ำโดยเก็บรายการที่อัปเดตที่สุดไว้ (อิงตาม `ชั่วโมงคงเหลือ`)
- **Dynamic Calculation**: คำนวณ `Duration` และ `Course Type` จากข้อความโดยตรง

### **2. Interactive Payment Dashboard**
- **Dynamic UI**: หน้าจอปรับเปลี่ยนตามข้อมูลที่เลือก (เช่น รายชื่อติวเตอร์จะเปลี่ยนไปตามช่วงเวลา)
- **Accurate Calculation**: คำนวณยอดจ่ายจากคอร์สที่จบแล้ว (`ชั่วโมงคงเหลือ` = 0) เท่านั้น
- **Tutor Name Matching**: ดึง "ชื่อจริง" จากฐานข้อมูล `TutorDB` มาแสดงคู่กับ "ชื่อใน LINE"
- **Drill-down Report**: มีทั้งตารางสรุปยอดและตารางแจกแจงรายละเอียดในหน้าเดียว

### **3. Comprehensive Report Dashboard**
- **Multi-dimensional Filtering**: กรองข้อมูลได้หลายมิติพร้อมกัน (เวลา, คนสอน, คนเรียน)
- **Dual-View Reports**: สามารถสร้างรายงานได้ทั้งในมุมมองของ "นักเรียน" และ "ติวเตอร์"
- **Course Tracking**: ติดตามจำนวนคอร์ส (Book) ของนักเรียนแต่ละคน แยกเป็นคอร์สทั้งหมดและคอร์สที่เรียนจบ (remaining = 0)
- **Period Information**: แสดงช่วงเวลาที่เลือกดู (เดือน, ปี, รอบวันที่) ในหัวรายงาน
- **Compact & Clean UI**: ลบ Summary Cards และปุ่มรายงานออก ทำให้หน้าจอกระชับและโฟกัสที่ข้อมูล
- **Smart Layout Management**: ระบบจัดการ header และ freeze row แบบ dynamic ไม่ให้หายเมื่อข้อมูลเพิ่มขึ้น

---

## 🚀 การติดตั้งและใช้งาน

### **การตั้งค่าครั้งแรก (First-time Setup)**
1.  **คัดลอกไฟล์**: สร้างไฟล์สคริปต์ทั้ง 5 ไฟล์ (`LineOA Report Importer.gs`, `Dashboard Payment.gs`, `Dashboard Report.gs`, `utils shared.gs`, `shared config.gs`) ลงใน Apps Script Editor ของ Google Sheet "ระบบบันทึกการสอน"
2.  **ตั้งค่า Config**: ตรวจสอบและแก้ไขค่าใน `shared config.gs` ให้ถูกต้อง (โดยเฉพาะ `TUTOR_DB_FILE_ID`)
3.  **สร้างหน้า Dashboard**:
    *   รันฟังก์ชัน `setupDashboardPayment()` หนึ่งครั้งเพื่อสร้างชีตและ UI ของ Payment Dashboard
    *   รันฟังก์ชัน `setupDashboardReport()` หนึ่งครั้งเพื่อสร้างชีตและ UI ของ Report Dashboard
4.  **ตั้งค่า Trigger**:
    *   ใน Apps Script Editor ไปที่เมนู `Triggers`
    *   สร้าง Trigger ใหม่ให้รันฟังก์ชัน `importReportsFromLineOA` แบบ `Time-driven` ทุกๆ 1 ชั่วโมง

### **การใช้งานประจำวัน**
*   **การ Import ข้อมูล**: ระบบทำงานอัตโนมัติ ไม่ต้องดำเนินการใดๆ
*   **การคำนวณยอดจ่าย**:
    1.  ไปที่ชีต `Dashboard Payment`
    2.  เลือกช่วงเวลาที่ต้องการ
    3.  กด "🔄 อัพเดต"
    4.  เลือกติวเตอร์ แล้วกด "📊 สร้างรายงาน"
*   **การดูรายงาน**:
    1.  ไปที่ชีต `Dashboard Report`
    2.  เลือกเงื่อนไขการกรอง
    3.  กด Menu "🔄 อัพเดต"
    4.  เลือกนักเรียน/ติวเตอร์ที่ต้องการ
    5.  กด Menu "📚 รายงานนักเรียน" หรือ "👨‍🏫 รายงานติวเตอร์"

---

## 📝 Change Log

### **Version 8.6** (6 ธันวาคม 2568) - 🐛 Bug Fix: Wrap Text Display Issue

**🐛 Bug Fixes:**

- ✅ **Fixed Wrap Text Display in Column N:**
  - แก้ปัญหา Column N (tutor name temp mapping / หมายเหตุ) มี wrap text ทำให้ display ยาวเกิน 1 หน้าจอ
  - เอา wrap text ออกจาก Column N ในทั้ง Dashboard Payment และ Dashboard Report
  - Column N ยังคง vertical + horizontal alignment แต่ไม่ wrap text อีกต่อไป

**🔧 Technical Details:**

- Dashboard Payment (3 ตำแหน่ง):
  - Line 998-1008: ตารางสรุปติวเตอร์ - เปลี่ยนจาก wrap A-N เป็น A-M only
  - Line 1416-1426: ตารางรายละเอียดนักเรียน - เปลี่ยนจาก wrap A-N เป็น A-M only
  - Line 1458: Column N - ตั้งค่า alignment แยกโดยไม่มี wrap
- Dashboard Report (3 ตำแหน่ง):
  - Line 1214-1224: Student Report sessions - เปลี่ยนจาก wrap A-N เป็น A-M only
  - Line 1422-1432: Tutor Report summary - เปลี่ยนจาก wrap A-N เป็น A-M only
  - Line 1693-1703: Tutor Report detail - เปลี่ยนจาก wrap A-N เป็น A-M only
- Commit: `9e0e9fa Fix wrap text display issue in column N`

---

### **Version 8.5 / Payment 7.6** (4 ธันวาคม 2568) - 🎨 UX Enhancement & Default Filters

**🎯 Major Changes:**

- ✅ **Cell Alignment ทุก Dashboard:**
  - เพิ่ม Middle + Center + Wrap text ให้ส่วน filter ทั้งหมด
  - Dashboard Payment: Row 3 (ปี+รอบ), Row 5-6 (เดือน), Row 9-11 (ติวเตอร์)
  - Dashboard Report: Row 2 (ปี+รอบ), Row 3-4 (เดือน), Row 5-7 (นักเรียน), Row 8-10 (ติวเตอร์)
  - เพิ่ม alignment ใน dynamic checkbox functions

- ✅ **Month Checkbox Reorganization:**
  - Dashboard Payment: ย้าย checkbox "ทั้งหมด" จาก A6 → B6, เพิ่มไอคอน 📅 ที่ A5
  - Dashboard Report: ย้าย checkbox "ทั้งหมด" จาก A4 → B4, เพิ่มไอคอน 📅 ที่ A3
  - อัปเดต `getSelectedMonths*` functions ให้อ่านจาก position ใหม่

- ✅ **Default Filter Selection:**
  - Dashboard Payment v7.6: ตั้งค่า default ให้เลือก ปี, รอบ, เดือน, ติวเตอร์ = ทั้งหมด
  - Dashboard Report v8.5: ตั้งค่า default ให้เลือก ปี, รอบ, เดือน, นักเรียน, ติวเตอร์ = ทั้งหมด
  - ผู้ใช้สามารถเริ่มใช้งานได้ทันทีหลัง setup โดยไม่ต้องเลือก filter เอง

**🔧 Technical Details:**

- เพิ่ม `.setVerticalAlignment('middle').setWrap(true)` ให้ทุก cell ใน filter section
- ปรับ vertical alignment ของ merged cells จาก 'top' เป็น 'middle'
- เพิ่มการ `setValue(true)` ให้ checkbox "ทั้งหมด" ในทุก filter category
- Commits: 92087a0, ca00a76, 97149c3

---

### **Version 8.3** (3 ธันวาคม 2568) - 🎨 UI/UX Enhancement & Bug Fixes

**🎯 Major Changes:**

- ✅ **Dashboard Report (Tutor) Improvements:**
  - แก้ไขการคำนวณยอดเงิน: แสดงยอดเต็มที่ session แรก (ไม่แบ่งเฉลี่ยอีกต่อไป)
  - เพิ่มข้อมูลในหมายเหตุ: รูปแบบ `Topic | Total Hours | Remaining Hours`
  - Restructure detail table columns:
    - D-E: วิชา (merged)
    - F: CourseType
    - G: ชม.
    - H: ยอดเงิน (unmerged)
    - I-M: หมายเหตุ (5 columns)
    - N: Status (ย้ายจาก column I)
  - Status column: แสดงแค่ icon (✅/⏳) ไม่มี text

- ✅ **Cell Formatting ทุก Dashboard:**
  - ตั้งค่า Middle + Center + Wrap text ในทุก cell ของตาราง
  - ใช้กับ Dashboard Payment, Dashboard Report, และ Dashboard Student
  - ทั้งตารางสรุปและตารางรายละเอียด

- ✅ **Code Refactoring:**
  - ย้าย shared functions ไปยัง `utils shared.gs`:
    - `createSummaryDetailsText()`
    - `groupStudentsByCourseType()`
    - `createTutorTotalSummary()`
    - `createTutorTotalSummaryFromSessions()`
    - `groupOnsiteDayByDate()`
  - ลบ duplicate functions จาก dashboard files
  - ปรับปรุงโครงสร้างโค้ดให้สะอาดและบำรุงรักษาง่ายขึ้น

**🐛 Bug Fixes:**

- ✅ **Fixed ReferenceError:** แก้ไข malformed 'n' character จาก sed command artifacts
- ✅ **Fixed Column A clearing:** เพิ่ม explicit clear เพื่อลบวันที่เก่าออกจากรายงาน
- ✅ **Fixed Payment Calculation:** แก้ปัญหายอดเงินถูกแบ่งเฉลี่ยผิดพลาด

**🔧 Technical Details:**

- Extended layout to 14 columns (A-N) ในทุก dashboard
- Improved table summary with merged cells และ border styling
- Added table header alignment และ wrap text support
- Version bumped from 7.5 → 8.3

---

### **Version 7.2** (28 พฤศจิกายน 2568) - 💰 Payment-First Design

**🎯 Major Feature: Payment-Centric Dashboard Redesign**
- ✅ **Payment-First Philosophy**: ออกแบบ Dashboard Payment ให้เน้นการตรวจสอบและจ่ายเงินเป็นหลัก
- ✅ **onsiteDay Date-Based Display**:
  - แสดงข้อมูล onsiteDay จัดกลุ่มตามวันที่แทนนักเรียน
  - รูปแบบ: `วันที่ + รายชื่อนักเรียน(ชม.)`
  - ตัวอย่าง: `01/12/68 น้องชานนท์(3.0) น้องณิชา(2.5)`
  - ทำให้ตรวจสอบวันสอนได้ง่ายขึ้น สำหรับอัตราเหมารายวัน
- ✅ **Enhanced Summary Text Generation**:
  - ฟังก์ชัน `createSummaryDetailsText()` รองรับพารามิเตอร์ `courseType`
  - จัดกลุ่ม onsiteDay ด้วยฟังก์ชัน `groupOnsiteDayByDate()`
  - แยกการแสดงผลตาม courseType อัตโนมัติ
- ✅ **Detail Section Redesign**:
  - เพิ่มระยะห่างระหว่างส่วนสรุปและรายละเอียด (3 แถว)
  - เปลี่ยนสี header เป็น #93c47d (เขียวอ่อน) และข้อความสี #274e13
  - เพิ่มคำอธิบาย "(ตรวจสอบรายละเอียดเพิ่มเติม)" เพื่อบอกจุดประสงค์
  - ทำให้ section สรุปยอดจ่ายโดดเด่นชัดเจนขึ้น

**🔧 Technical Improvements:**
- ✅ **New Function**: `groupOnsiteDayByDate()`
  - จัดกลุ่ม onsiteDay sessions ตามวันที่
  - เรียงลำดับวันที่จากล่าสุดก่อน
  - คำนวณชั่วโมงและยอดเงินรวมต่อวัน
- ✅ **Version Update**: อัปเดต header เป็น "VERSION 7.2 PAYMENT-FIRST DESIGN"

---

### **Version 7.1** (28 พฤศจิกายน 2568) - 📊 Course Type Grouping & Display Enhancement

**🎯 Major Feature: Course Type Organization & Separation**
- ✅ **Grouping Key Update**: เปลี่ยนจาก `student|subject` เป็น `student|subject|courseType`
  - นักเรียนคนเดียวกันที่เรียนวิชาเดียวกัน แต่ต่าง courseType จะถูกแยกเป็นแถวต่างกัน
  - ช่วยให้เห็นการแยก courseType ได้ชัดเจน ไม่งงตอนดูเอกสาร
- ✅ **Summary Table Enhancement** (ตารางสรุป):
  - แยกแถวตาม courseType: `online1by1` → `onsite1by1` → `onsiteGroup` → `onsiteDay`
  - Merge cells สำหรับข้อมูลติวเตอร์ (A-G) ในทุกแถวของติวเตอร์คนเดียวกัน
  - เพิ่มแถว **"รวม"** (bold, สีเหลือง) แสดงยอดรวมทั้งหมดของแต่ละติวเตอร์
  - แสดงรายละเอียดสรุปแยกตาม courseType
- ✅ **Detail Table Enhancement** (ตารางรายละเอียด):
  - เพิ่ม **Column D: "Course Type"** แสดงประเภทคอร์สอย่างชัดเจน
  - Merge Column A (ติวเตอร์) สำหรับทุกแถวของติวเตอร์คนเดียวกัน
  - Sessions เรียงจาก**วันที่มากไปน้อย** (ล่าสุดก่อน)
  - ปรับ column layout จาก 13 เป็น 14 columns
- ✅ **New Helper Function**: `groupStudentsByCourseType()`
  - จัดกลุ่ม students ตาม courseType พร้อมคำนวณ totalHours และ totalAmount
  - เรียงลำดับตาม courseTypeOrder ที่กำหนด

**🐛 Bug Fixes:**
- ✅ **Fixed courseType Validation in LineOA Importer**:
  - แก้ไขปัญหาวันธรรมดา (จันทร์-ศุกร์) ถูกจัดเป็น `onsiteDay` โดยผิดพลาด
  - เพิ่มฟังก์ชัน `parseDateFromReport()` เพื่อตรวจสอบวันในสัปดาห์
  - ตรวจสอบว่า "REPORT ONSITE DAY" เป็น Saturday/Sunday จริงก่อนกำหนด courseType
  - ถ้าไม่ใช่วันเสาร์/อาทิตย์ → เปลี่ยนเป็น `onsiteGroup` แทน
- ✅ **Fixed Duplicate Payment Calculation**:
  - แก้ปัญหาการคำนวณซ้ำซ้อนเมื่อติวเตอร์สอน onsiteDay + online/onsiteGroup ในวันเดียวกัน
  - เพิ่ม logic หักชั่วโมงที่ overlap กับ onsiteDay ออกจาก online/onsiteGroup
  - ป้องกันการจ่ายเงินซ้ำสำหรับชั่วโมงเดียวกัน

---

### **Version 3.2** (27 พฤศจิกายน 2568) - 💰 Payment Rules System

**🎯 Major Feature: Flexible Payment Rules**
- ✅ **TutorDB Payment Rules (Columns P-T)**: ระบบกำหนดเงื่อนไขการจ่ายเงินแยกรายบุคคลใน TutorDB Sheet
  - **Column P-S**: Payment Triggers แยกตามประเภทคอร์ส (Online1by1, Onsite1by1, OnsiteGroup, OnsiteDay)
  - **Column T**: Conditions พิเศษ เช่น `dayOfWeek:Sat,Sun→onsiteDay`
  - อ่านอัตราค่าสอนจาก Columns F-I ที่มีอยู่แล้ว
  - ใช้ Line ID (Column M) เป็น Primary Key
- ✅ **Payment Rules Engine** (`utils shared.gs`):
  - `getTutorPaymentRules()` - โหลด rules จาก TutorDB Columns P-T
  - `calculatePaymentWithRules()` - คำนวณเงินตาม rules
  - `checkPaymentTrigger()` - ตรวจสอบเงื่อนไขการจ่าย (`onCourseComplete`, `everyPeriod`, `monthly`)
  - `applyPaymentConditions()` - ประมวลผล conditions (dayOfWeek)
- ✅ **Dashboard Payment Integration**:
  - ปรับโครงสร้างตาราง: คอลัมน์ F (อัตรา/ชม.), G (ชม.รวม), H-I (ยอดเงิน), J (Status), K-M (หมายเหตุ)
  - แสดง Payment Trigger ในหมายเหตุ (✅ จบคอร์ส, ✅ ตามรอบ, ⏳ รอจบคอร์ส)
  - คำนวณเงินแบบอัตโนมัติตาม rules ของแต่ละคน
  - รองรับการมี Payment Trigger แยกกันในแต่ละประเภทคอร์สของติวเตอร์คนเดียวกัน
- ✅ **Documentation**:
  - `PAYMENT_RULES_GUIDE.md` - คู่มือฉบับสมบูรณ์พร้อมตัวอย่างและ Data Validation Guide

**ดูคู่มือการใช้งาน Payment Rules ที่:** [PAYMENT_RULES_GUIDE.md](PAYMENT_RULES_GUIDE.md)

---

### **Version 3.1** (27 พฤศจิกายน 2568)

**Dashboard Report Improvements:**
- ✅ **ลบ Summary Cards และปุ่มรายงาน**: ทำให้หน้าจอกระชับและใช้พื้นที่ได้ดีขึ้น
- ✅ **เพิ่มข้อมูลคอร์สในรายงานนักเรียน**: แสดงจำนวนคอร์สทั้งหมด/จบแล้ว (คำนวณจาก Book ที่ไม่ซ้ำ)
- ✅ **เพิ่มข้อมูลช่วงเวลาในหัวรายงาน**: แสดงเดือน, ปี, และรอบวันที่ที่เลือก
- ✅ **ปรับ spacing**: ลดระยะห่างระหว่าง student-tutor sections, ระหว่างตาราง และภายในรายงานติวเตอร์
- ✅ **ปรับโครงสร้างตารางติวเตอร์**: แก้คอลัมน์ยอดเงิน (H-I), Status (J), และหมายเหตุ (K-M)
- ✅ **แก้ปัญหา Dynamic Layout**:
  - แก้ไขปัญหา merge cells ที่ทำให้ dynamic checkbox เพี้ยน
  - แก้ header หายเมื่อข้อมูลเพิ่มขึ้น โดยสร้าง header ใหม่ทุกครั้งที่อัพเดต
  - แก้ freeze row ให้ปรับตามจำนวนข้อมูลจริง (dynamic)
  - เพิ่ม border สำหรับ student และ tutor sections

**Dashboard Payment Improvements:**
- ✅ **แก้ปัญหา Dynamic Layout**: ใช้การแก้ไขเดียวกับ Dashboard Report
- ✅ **ปรับ UI ให้สอดคล้องกัน**: ทำให้ทั้ง 2 dashboard ทำงานแบบเดียวกัน

---

### **Version 3.0** (26 พฤศจิกายน 2568)
- เวอร์ชันแรกที่มี Dashboard Report และ Payment แยกออกจากกัน
- รองรับการกรองข้อมูลแบบหลายมิติ
- เพิ่ม TutorDB สำหรับจัดการข้อมูลติวเตอร์

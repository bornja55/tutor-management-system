# 📚 English Mania - ระบบบันทึกและรายงานผลการสอนอัตโนมัติ

> **Last Updated:** 3 ธันวาคม 2568
> **Version:** 8.3
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

ระบบประกอบด้วย 4 ส่วนหลัก:

### **1. ระบบ Import ข้อมูลจาก LINE OA (อัตโนมัติ)** ✅ เสร็จสิ้น
- ติวเตอร์ส่งรายงานการสอนผ่าน LINE Group ที่กำหนด
- Script อ่านข้อมูลจากไฟล์ Log (.txt) ที่ Export มาเก็บไว้ใน Google Drive
- ทำการประมวลผล (Parse), แก้ไขรูปแบบข้อมูล (Normalize), และคำนวณค่าที่จำเป็น (เช่น ระยะเวลาสอน)
- นำเข้าข้อมูลสู่ชีตหลัก `บันทึกลงเวลาจาก LineBot` พร้อมระบบตรวจจับและลบข้อมูลซ้ำที่ซับซ้อน

### **2. Dashboard สำหรับคำนวณยอดจ่าย (Payment Dashboard)** ✅ เสร็จสิ้น
- หน้า Dashboard สำหรับฝ่ายบัญชีเพื่อคำนวณยอดเงินที่ต้องจ่ายให้ติวเตอร์
- ผู้ใช้สามารถกรองข้อมูลตาม **ปี, เดือน, และรอบวันที่ (1-15, 16-31)**
- ระบบใช้ **Payment Rules** ที่ยืดหยุ่น สามารถกำหนดเงื่อนไขการจ่ายเงินแยกรายบุคคลได้ (onCourseComplete, everyPeriod, monthly)
- รองรับ **Conditions** พิเศษ เช่น เปลี่ยนอัตราค่าสอนตามวัน (เสาร์/อาทิตย์ → onsiteDay)
- มาพร้อมตาราง **แจกแจงรายละเอียด** การสอนของแต่ละคอร์สประกอบการจ่ายเงิน พร้อมแสดง Payment Trigger และหมายเหตุ

### **3. Dashboard สำหรับรายงานผล (Report Dashboard)** ✅ เสร็จสิ้น
- หน้า Dashboard สำหรับดูรายงานและสถิติการสอนในภาพรวม
- สามารถกรองข้อมูลได้ทั้ง **ปี, เดือน, รอบวันที่, นักเรียน, และติวเตอร์**
- มีปุ่มสร้างรายงาน 2 รูปแบบหลัก:
  - **รายงานนักเรียน**: แสดงประวัติการเรียนของนักเรียนแต่ละคน พร้อมสรุปจำนวนคอร์ส (ทั้งหมด/จบแล้ว), ชั่วโมงรวม, และช่วงเวลาที่เรียน
  - **รายงานติวเตอร์**: สรุปผลงานของติวเตอร์แต่ละคน ทั้งชั่วโมงสอน, จำนวนนักเรียน, และยอดเงินค่าสอนที่เกิดขึ้น พร้อมตารางรายละเอียดการสอนแต่ละคอร์ส
- **Dynamic Layout**: ระบบปรับ UI อัตโนมัติตามจำนวนนักเรียนและติวเตอร์ที่กรอง (รองรับได้ถึง 39 คนต่อหมวด)

### **4. ระบบจัดการฐานข้อมูล (Shared Utilities)** ✅ เสร็จสิ้น
- **TutorDB**: ใช้ชีตแยกต่างหากเป็นฐานข้อมูลกลางสำหรับติวเตอร์ เพื่อให้สามารถอ้างอิง "ชื่อจริง" ของติวเตอร์ได้ แม้ชื่อที่แสดงใน LINE จะเปลี่ยนไป
- **TutorDB Payment Rules (Columns P-T)**: เก็บเงื่อนไขการจ่ายเงินแยกรายบุคคลในคอลัมน์เดียวกับข้อมูลติวเตอร์ (อัตรา F-I, Payment Triggers P-S, Conditions T)
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
│  ├─ **ชีต 2: Dashboard Payment** (สำหรับฝ่ายบัญชี) ⭐       │
│  └─ **ชีต 3: Dashboard Report** (สำหรับดูรายงาน) ⭐         │
│                                                             │
│  (Script ภายใน):                                           │
│  ├─ Dashboard Payment.gs                                   │
│  ├─ Dashboard Report.gs                                    │
│  ├─ utils shared.gs (ฟังก์ชันใช้งานร่วม)                      │
│  └─ shared config.gs (ตั้งค่ากลาง)                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          └───────────┐
                                      ↓
┌─────────────────────────────────────────────────────────────┐
│ 📂 Google Sheet: "Tutor Database" (ไฟล์แยก)                │
│    - เก็บข้อมูล Master ของติวเตอร์ (ชื่อจริง, Line ID, etc.) │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflow การทำงาน

### **Phase 1: Import & Clean Data (อัตโนมัติ)**

กระบวนการนี้ทำงานเบื้องหลังโดยอัตโนมัติผ่าน Time-driven trigger ทุกชั่วโมง
1.  **Scan & Read**: Script `LineOA Report Importer.gs` สแกนหาไฟล์ .txt ใหม่ในโฟลเดอร์ Google Drive
2.  **Parse & Extract**: ดึงข้อมูลที่จำเป็นจากข้อความ Report ของติวเตอร์
3.  **Calculate & Normalize**:
    *   คำนวณ `Duration` (ระยะเวลาสอน) จากเวลาเริ่มต้น-สิ้นสุด
    *   แปลง `Course Type` ให้อยู่ในรูปแบบมาตรฐาน (เช่น `online1by1`)
    *   **จัดการวันที่ที่กำกวม**: แก้ไขรูปแบบวันที่ `DD/MM/YY` หรือ `MM/DD/YY` ที่ผิดพลาดโดยอ้างอิงจากวันที่ของไฟล์
4.  **Write to Sheet**: เขียนข้อมูลที่สะอาดแล้วลงในชีต `บันทึกลงเวลาจาก LineBot`
5.  **Deduplication**: ตรวจจับและลบรายการสอนที่ซ้ำซ้อน (เช็คจาก Tutor + Student + Date + Time) โดยจะเก็บรายการที่มี `ชั่วโมงคงเหลือ` น้อยที่สุดไว้ (ถือว่าอัปเดตสุด)

---

### **Phase 2: Payment Workflow (สำหรับฝ่ายบัญชี)**

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

*   `บันทึกลงเวลาจาก LineBot`: ชีตหลักสำหรับเก็บข้อมูลดิบ (Raw Data) ทั้งหมดที่ Import เข้ามา
*   `Dashboard Payment`: ชีตสำหรับคำนวณและสรุปยอดจ่ายเงินให้ติวเตอร์
*   `Dashboard Report`: ชีตสำหรับดูรายงานและสถิติการสอนในภาพรวม

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

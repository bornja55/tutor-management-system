# 💰 คู่มือการตั้งค่า Payment Rules สำหรับติวเตอร์

> **Version:** 7.1+
> **Last Updated:** 28 พฤศจิกายน 2568

---

## 📋 ภาพรวม

ระบบ Payment Rules ใหม่ช่วยให้คุณสามารถกำหนดเงื่อนไขการจ่ายเงินให้กับติวเตอร์แต่ละคนได้อย่างยืดหยุ่น โดยเพิ่มคอลัมน์ในชีต **TutorDB** เพื่อเก็บข้อมูล Payment Triggers และ Conditions

### ความสามารถหลัก:
- ✅ กำหนดอัตราค่าสอน (Rate) แยกตามประเภทคอร์สของแต่ละคน (มีอยู่แล้วในคอลัมน์ F-I)
- ✅ กำหนด Payment Trigger แยกตามประเภทคอร์ส (คอลัมน์ P-S)
- ✅ กำหนดเงื่อนไขพิเศษ (Conditions) เช่น เปลี่ยนอัตราตามวัน (คอลัมน์ T)

---

## 🏗️ โครงสร้าง TutorDB Sheet

### **คอลัมน์เดิม (มีอยู่แล้ว):**
- **Column F** (`Online 1by1`): อัตราค่าสอน Online 1 ต่อ 1 (บาท/ชม.)
- **Column G** (`Onsite 1by1`): อัตราค่าสอน Onsite 1 ต่อ 1 (บาท/ชม.)
- **Column H** (`Onsite group`): อัตราค่าสอน Onsite กลุ่ม (บาท/ชม.)
- **Column I** (`Onsite Day`): อัตราค่าสอน Onsite เต็มวัน (บาท/ชม.)
- **Column M** (`Line ID`): Line ID ของติวเตอร์ (Primary Key)

### **คอลัมน์ใหม่ (Payment Rules):**
- **Column P** (`Online1by1 Trigger`): เงื่อนไขการจ่ายเงินสำหรับ Online 1by1
- **Column Q** (`Onsite1by1 Trigger`): เงื่อนไขการจ่ายเงินสำหรับ Onsite 1by1
- **Column R** (`OnsiteGroup Trigger`): เงื่อนไขการจ่ายเงินสำหรับ Onsite Group
- **Column S** (`OnsiteDay Trigger`): เงื่อนไขการจ่ายเงินสำหรับ Onsite Day
- **Column T** (`Conditions`): เงื่อนไขพิเศษ (ใช้ร่วมกันทุกประเภทคอร์ส)

---

## 🎯 Payment Triggers (เงื่อนไขการจ่ายเงิน)

| Trigger | คำอธิบาย | ใช้เมื่อ |
|---------|----------|---------|
| `onCourseComplete` | คิดเงินเมื่อนักเรียนเรียนจบคอร์ส | ต้องการจ่ายเงินเมื่อ `ชั่วโมงคงเหลือ = 0` เท่านั้น |
| `everyPeriod` | คิดเงินทุกรอบที่กรอง | ทุกครั้งที่มีข้อมูลในรอบที่เลือก (1-15, 16-31) |
| `monthly` | คิดเงินรายเดือน | รอบสุดท้ายของเดือน (ยังไม่เปิดใช้งาน) |
| (เว้นว่าง) | ใช้ค่า default | ระบบจะใช้ `onCourseComplete` |

---

## 📝 Conditions (เงื่อนไขพิเศษ)

### รูปแบบ:
```
type:values→action
```

**⚠️ สำคัญ:** ต้องใช้ลูกศรขวา `→` (Alt+26) **ไม่ใช่** `->` หรือ `->`

### Condition Types ที่รองรับ:

#### 1. **dayOfWeek** - เปลี่ยนประเภทคอร์สตามวัน

**รูปแบบ:**
```
dayOfWeek:Sat,Sun→onsiteDay
```

**คำอธิบาย:**
- ถ้าวันที่สอนเป็นวันเสาร์ หรือ วันอาทิตย์
- ให้เปลี่ยนจากประเภทคอร์สเดิม เป็น `onsiteDay` แทน
- ระบบจะใช้ Rate และ Trigger ของ `onsiteDay` แทน

**ชื่อวันที่ใช้ได้:**
- `Sun`, `Sunday` = อาทิตย์
- `Mon`, `Monday` = จันทร์
- `Tue`, `Tuesday` = อังคาร
- `Wed`, `Wednesday` = พุธ
- `Thu`, `Thursday` = พฤหัสบดี
- `Fri`, `Friday` = ศุกร์
- `Sat`, `Saturday` = เสาร์

**ตัวอย่างอื่นๆ:**
```
dayOfWeek:Mon,Tue,Wed,Thu,Fri→onsite1by1
dayOfWeek:Saturday,Sunday→onsiteDay
```

#### 2. **minHours** - บวกเงินถ้าสอนครบชั่วโมง (Coming Soon)
```
minHours:10→+10
```
ถ้าสอนครบ 10 ชั่วโมงขึ้นไป ให้บวก 10 บาท/ชม.

#### 3. **studentCount** - คูณอัตราตามจำนวนนักเรียน (Coming Soon)
```
studentCount:6+→*1.2
```
ถ้ามีนักเรียน 6 คนขึ้นไป ให้คูณอัตราด้วย 1.2

---

## 💡 ตัวอย่างการใช้งาน

### **ตัวอย่างที่ 1: ติวเตอร์ A - จ่ายทุกแบบหลังจบคอร์ส**

| Line ID | ... | F (Online) | G (Onsite) | H (Group) | I (Day) | ... | P | Q | R | S | T |
|---------|-----|------------|------------|-----------|---------|-----|---|---|---|---|---|
| Uaaa | ... | 150 | 250 | 150 | 850 | ... | onCourseComplete | onCourseComplete | onCourseComplete | onCourseComplete | |

**ผลลัพธ์:**
- ทุกประเภทคอร์สจะคิดเงินเมื่อนักเรียนเรียนจบ (remaining = 0) เท่านั้น

---

### **ตัวอย่างที่ 2: ติวเตอร์ B - Online จบคอร์ส, Onsite ทุกรอบ**

| Line ID | ... | F | G | H | I | ... | P | Q | R | S | T |
|---------|-----|---|---|---|---|-----|---|---|---|---|---|
| Ubbb | ... | 150 | 250 | - | 850 | ... | onCourseComplete | everyPeriod | | everyPeriod | |

**ผลลัพธ์:**
- `online1by1` = คิดเงินเมื่อจบคอร์ส
- `onsite1by1` และ `onsiteDay` = คิดเงินทุกรอบ (1-15, 16-31)
- `onsiteGroup` = ไม่สอน (เว้นว่างได้)

---

### **ตัวอย่างที่ 3: ติวเตอร์ C - เสาร์/อาทิตย์ เป็น onsiteDay**

| Line ID | ... | F | G | H | I | ... | P | Q | R | S | T |
|---------|-----|---|---|---|---|-----|---|---|---|---|---|
| Uccc | ... | 150 | 250 | - | 850 | ... | onCourseComplete | everyPeriod | | everyPeriod | dayOfWeek:Sat,Sun→onsiteDay |

**ผลลัพธ์:**
- ถ้าสอน `onsite1by1` ในวันเสาร์/อาทิตย์ → ระบบจะเปลี่ยนเป็น `onsiteDay` อัตรา 850 บาท/ชม. อัตโนมัติ
- ถ้าสอน `onsite1by1` ในวันอื่นๆ → คิดอัตรา 250 บาท/ชม. ตามปกติ

---

## 🔧 วิธีการตั้งค่า

### **ขั้นตอนที่ 1: เปิด TutorDB Sheet**
1. เปิด Google Sheet "TutorDB"
2. ตรวจสอบว่ามีคอลัมน์ P, Q, R, S, T แล้วหรือไม่

### **ขั้นตอนที่ 2: เพิ่มคอลัมน์ (ถ้ายังไม่มี)**
เพิ่มคอลัมน์ใหม่ตำแหน่ง P-T พร้อม Header:

| P | Q | R | S | T |
|---|---|---|---|---|
| Online1by1 Trigger | Onsite1by1 Trigger | OnsiteGroup Trigger | OnsiteDay Trigger | Conditions |

### **ขั้นตอนที่ 3: ตั้งค่า Data Validation**
ดู [Data Validation Guide](#-data-validation-guide) ด้านล่าง

### **ขั้นตอนที่ 4: กรอกข้อมูล**
กรอกข้อมูลลงในคอลัมน์ P-T สำหรับแต่ละติวเตอร์

**ตัวอย่าง:**

| Line ID | ... | P | Q | R | S | T |
|---------|-----|---|---|---|---|---|
| Uaaa | ... | onCourseComplete | onCourseComplete | onCourseComplete | onCourseComplete | |
| Ubbb | ... | onCourseComplete | everyPeriod | | everyPeriod | |
| Uccc | ... | onCourseComplete | everyPeriod | | everyPeriod | dayOfWeek:Sat,Sun→onsiteDay |

### **ขั้นตอนที่ 5: บันทึกและทดสอบ**
1. บันทึกไฟล์
2. กลับไปที่ Dashboard Payment
3. ลองสร้างรายงานดู

---

## 📋 Data Validation Guide

### **คอลัมน์ P, Q, R, S (Payment Triggers):**

**วิธีตั้งค่า:**
1. เลือกช่วง P2:P (หรือ Q2:Q, R2:R, S2:S)
2. Data → Data validation
3. Criteria: **List of items**
4. ค่า: `onCourseComplete,everyPeriod`
5. ✅ Show dropdown list in cell
6. ❌ Reject input (ปิด - เพื่อให้เว้นว่างได้)
7. Help text: `เลือก onCourseComplete (จ่ายเมื่อจบคอร์ส) หรือ everyPeriod (จ่ายทุกรอบ) หรือเว้นว่างถ้าไม่สอน`

### **คอลัมน์ T (Conditions):**

**Option 1: ตรวจสอบรูปแบบด้วย Custom Formula**
1. เลือกช่วง T2:T
2. Data → Data validation
3. Criteria: **Custom formula is**
4. Formula:
```
=OR(T2="", REGEXMATCH(T2, "^\w+:[^→]+→\w+$"))
```
5. ❌ Reject input (เปิด)
6. Help text: `รูปแบบ: type:values→action เช่น dayOfWeek:Sat,Sun→onsiteDay (หรือเว้นว่างได้)`

**Option 2: แค่ Help Text (แนะนำ)**
1. เลือกช่วง T2:T
2. Data → Data validation
3. Criteria: **Text** → **Contains** → (เว้นว่าง)
4. ❌ Reject input (ปิด)
5. Help text: `รูปแบบ: type:values→action เช่น dayOfWeek:Sat,Sun→onsiteDay (ใช้ลูกศรขวา → ไม่ใช่ ->) หรือเว้นว่างถ้าไม่มีเงื่อนไข`

---

## 🚨 ข้อควรระวัง

1. **Line ID ต้องถูกต้อง (Column M)**
   - Line ID จะใช้เป็น Primary Key ในการค้นหา rules

2. **อัตราค่าสอน (Columns F-I) ต้องเป็นตัวเลข**
   - ถ้าเว้นว่าง ระบบจะใช้ค่า default จาก `SHARED_CONFIG.RATES`

3. **Payment Trigger ต้องใช้ค่าที่รองรับ**
   - `onCourseComplete`, `everyPeriod`, `monthly`
   - ห้ามมีเว้นวรรค หรือ ตัวพิมพ์ผิด

4. **Conditions ต้องเขียนถูกรูปแบบ**
   - ต้องมี `:` และ `→` (ลูกศรขวา)
   - ตัวอย่าง: `dayOfWeek:Sat,Sun→onsiteDay`

5. **ถ้าเว้นว่างในคอลัมน์ P-S:**
   - ระบบจะใช้ค่า default = `onCourseComplete`

6. **ถ้าเว้นว่างในคอลัมน์ T:**
   - ไม่มี Conditions พิเศษ

7. **ลูกศรขวา `→` ใน Windows:**
   - พิมพ์: กด Alt ค้างไว้ แล้วพิมพ์ `26` บน Numpad แล้วปล่อย Alt
   - หรือ Copy-Paste จาก: `→`

8. **ลูกศรขวา `→` ใน Mac:**
   - Option + Shift + 2
   - หรือ Copy-Paste จาก: `→`

---

## 📊 การแสดงผลใน Dashboard Payment

หลังจากตั้งค่าแล้ว ตารางรายงานจะแสดง:

| วันที่ | เวลา | นักเรียน | ชม. | Total | คงเหลือ | Course Type | อัตรา/ชม. | ชม.รวม | ยอดเงิน | Status | หมายเหตุ |
|--------|------|----------|-----|-------|---------|-------------|-----------|--------|---------|--------|----------|
| 15/11/2025 | 09:00 | น้องเอ | 2 | 10 | 8 | online1by1 | 150 | 10 | 0 | ⏳ ยังไม่จ่าย | ⏳ รอจบคอร์ส |
| 16/11/2025 | 14:00 | น้องบี | 2 | 10 | 0 | online1by1 | 150 | 10 | 1500 | ✅ จ่าย | ✅ จบคอร์ส |
| 17/11/2025 | 10:00 | น้องซี | 3 | 3 | 3 | onsiteDay | 850 | 3 | 2550 | ✅ จ่าย | ✅ ตามรอบ |

**คอลัมน์ "หมายเหตุ"** จะแสดง:
- `✅ จบคอร์ส` = คิดเงินเพราะ onCourseComplete
- `✅ ตามรอบ` = คิดเงินเพราะ everyPeriod
- `⏳ รอจบคอร์ส` = ยังไม่คิดเงินเพราะรอให้คอร์สจบ

---

## 🔄 Workflow การทำงาน

```
1. ผู้ใช้กรองข้อมูล (ปี, เดือน, รอบ, ติวเตอร์)
           ↓
2. กด "📊 สร้างรายงาน"
           ↓
3. ระบบโหลด Payment Rules จาก TutorDB (Columns P-T)
           ↓
4. วนลูปแต่ละ session:
   - ดึง rules ของติวเตอร์คนนั้น (ตาม Line ID)
   - อ่าน Rate จาก Column F-I
   - อ่าน Trigger จาก Column P-S (ตาม Course Type)
   - อ่าน Conditions จาก Column T
   - ตรวจสอบ Conditions (เช่น เปลี่ยน courseType ตามวัน)
   - ตรวจสอบ Payment Trigger (ควรจ่ายหรือไม่)
   - คำนวณยอดเงิน (totalHours × rate)
           ↓
5. แสดงผลในตาราง
```

---

## 🆘 Troubleshooting

### ❓ ทำไมระบบไม่คิดเงิน?
- ✅ เช็คว่า Line ID ตรงกับข้อมูลใน Raw Data หรือไม่ (Column E)
- ✅ เช็คว่า Payment Trigger เป็น `onCourseComplete` แต่คอร์สยังไม่จบ (remaining > 0)
- ✅ เช็คว่า Course Type ถูกต้องหรือไม่

### ❓ Conditions ไม่ทำงาน?
- ✅ เช็ครูปแบบให้ถูกต้อง: `type:values→action`
- ✅ เช็คว่าใช้ลูกศรขวา `→` (ไม่ใช่ `->`)
- ✅ เช็คว่าชื่อวันเขียนถูกต้อง (Sat, Sun, Monday, etc.)

### ❓ ระบบใช้ค่า Default อยู่เรื่อยๆ?
- ✅ เช็คว่ามีคอลัมน์ P-T ใน TutorDB หรือไม่
- ✅ เช็คว่า Line ID ในคอลัมน์ M ถูกต้องหรือไม่
- ✅ ดูใน Logs (Extensions → Apps Script → View Logs) มี error อะไรไหม

### ❓ อัตราค่าสอนไม่ถูกต้อง?
- ✅ เช็คว่าคอลัมน์ F-I มีตัวเลขถูกต้องหรือไม่
- ✅ ถ้าเว้นว่าง ระบบจะใช้ค่า default จาก `SHARED_CONFIG.RATES`

---

## 📚 ตัวอย่าง Template

คัดลอกตารางนี้ไปเป็นแนวทางในการกรอกข้อมูล:

| Line ID | ... | F | G | H | I | ... | P | Q | R | S | T |
|---------|-----|---|---|---|---|-----|---|---|---|---|---|
| Uxxxxx | ... | 150 | 250 | 150 | 850 | ... | onCourseComplete | onCourseComplete | onCourseComplete | everyPeriod | |

**แทนที่:**
- `Uxxxxx` = Line ID ของติวเตอร์จริง
- F-I = อัตราค่าสอนจริง
- P-S = Payment Trigger ที่ต้องการ
- T = Conditions (ถ้ามี)

---

## 🔗 เอกสารที่เกี่ยวข้อง

- [README.md](README.md) - เอกสารหลักของระบบ
- [shared config.gs](shared%20config.gs) - ไฟล์ Config และค่า default rates

---

**Happy Teaching! 📚✨**

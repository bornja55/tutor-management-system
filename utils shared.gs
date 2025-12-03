// ============================================================
// 🔧 SHARED UTILITY FUNCTIONS
// ฟังก์ชันที่ใช้ร่วมกันระหว่าง Dashboard Payment และ Dashboard Report
// ============================================================

// ============================================================
// 📖 TUTOR DATABASE
// ============================================================

/**
 * โหลดข้อมูล Tutor Database จากไฟล์ Payment
 * @returns {Map} Map ของ lineDisplay/lineId → fullName
 */
function loadTutorDB() {
  try {
    const paymentSS = SpreadsheetApp.openById(SHARED_CONFIG.TUTOR_DB_FILE_ID);
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
    Logger.log('Error loading TutorDB: ' + error.message);
    return new Map();
  }
}

/**
 * จับคู่ชื่อติวเตอร์จาก Display Name และ Line ID
 * @param {string} displayName - ชื่อที่แสดง
 * @param {string} lineId - Line ID
 * @param {Map} tutorLookup - Map จาก loadTutorDB()
 * @returns {string} ชื่อเต็มของติวเตอร์
 */
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

// ============================================================
// 📅 DATE UTILITIES
// ============================================================

/**
 * แปลงค่าวันที่เป็น Date Object
 * @param {Date|string} dateValue - ค่าวันที่
 * @returns {Date} Date Object
 */
function parseDateValue(dateValue) {
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue;
  }

  const dateStr = String(dateValue).replace(/^'/, '').trim();
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }

  return new Date(0);
}

/**
 * จัดรูปแบบวันที่เป็น String DD/MM/YYYY
 * @param {Date|string} dateValue - ค่าวันที่
 * @returns {string} วันที่ในรูปแบบ DD/MM/YYYY
 */
function formatDateString(dateValue) {
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    const day = String(dateValue.getDate()).padStart(2, '0');
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const year = dateValue.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const dateStr = String(dateValue).replace(/^'/, '').trim();
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

  if (match) {
    return `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`;
  }

  return dateStr;
}

/**
 * แปลงปี ค.ศ. เป็น พ.ศ.
 * @param {number} year - ปี ค.ศ. หรือ พ.ศ.
 * @returns {number} ปี พ.ศ.
 */
function convertToBuddhistYear(year) {
  if (year > 2500) {
    // เป็น พ.ศ. อยู่แล้ว
    return year;
  } else if (year >= 1900 && year <= 2100) {
    // เป็น ค.ศ. → แปลงเป็น พ.ศ.
    return year + 543;
  }
  return year;
}

// ============================================================
// 🔍 DATA FILTERING
// ============================================================

/**
 * กรองข้อมูลตามช่วงเวลา (Month-Year และ Period)
 * รองรับทั้งแบบ Dashboard Payment (พ.ศ.) และ Dashboard Report (ค.ศ.)
 *
 * @param {Sheet} rawDataSheet - Sheet ข้อมูลดิบ
 * @param {Array} selectedPeriods - Array ของ { monthYear, period }
 * @param {boolean} useBuddhistYear - true = ใช้ พ.ศ. (Payment), false = ใช้ ค.ศ. (Report)
 * @returns {Array} Array ของ rows ที่กรองแล้ว
 */
function filterDataByPeriod(rawDataSheet, selectedPeriods, useBuddhistYear = true) {
  const allData = rawDataSheet.getDataRange().getValues();
  const filtered = [];

  // สร้าง Period Map
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

      // แปลงปีตาม mode
      let displayYear;
      if (useBuddhistYear) {
        // Dashboard Payment: แปลง ค.ศ. → พ.ศ.
        displayYear = convertToBuddhistYear(year);
      } else {
        // Dashboard Report: ใช้ ค.ศ. ตรงๆ
        displayYear = year;
      }

      const rowMonthYear = SHARED_CONFIG.MONTH_NAMES[month - 1] + ' ' + displayYear;

      // Debug แถวแรกๆ
      if (debugCount < 3) {
        Logger.log('\n  📍 Row ' + (i + 1) + ':');
        Logger.log('    Raw: "' + reportDate + '"');
        Logger.log('    Day: ' + day + ', Month: ' + month + ', Year: ' + year);
        Logger.log('    Convert: ' + rowMonthYear);
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
        if ((period === '16-30' || period === '16-31') && day >= 16) {
          matchPeriod = true;
          break;
        }
      }

      if (matchPeriod) {
        filtered.push(row);
        matchCount++;

        // Debug แถวแรกๆ ที่ Match
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

/**
 * กรองข้อมูลตามปีและเดือน (สำหรับ Dashboard Report)
 * @param {Sheet} rawDataSheet - Sheet ข้อมูลดิบ
 * @param {Array} selectedYears - Array ของปี (ค.ศ.) เช่น [2025, 2026]
 * @param {Array} selectedMonths - Array ของเดือน (0-11) เช่น [0, 1, 10, 11]
 * @returns {Array} Array ของ rows ที่กรองแล้ว
 */
function filterDataByYearMonth(rawDataSheet, selectedYears, selectedMonths) {
  const allData = rawDataSheet.getDataRange().getValues();
  const filtered = [];

  for (let i = 1; i < allData.length; i++) {
    const row = allData[i];
    const reportDate = row[6];

    if (!reportDate) continue;

    try {
      let month, year;

      if (reportDate instanceof Date && !isNaN(reportDate.getTime())) {
        month = reportDate.getMonth();
        year = reportDate.getFullYear();
      } else {
        const dateStr = String(reportDate).replace(/^'/, '').trim();
        const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!match) continue;
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
      }

      // Check year
      if (!selectedYears.includes(year)) continue;

      // Check month
      if (!selectedMonths.includes(month)) continue;

      filtered.push(row);

    } catch (e) {
      // Skip
    }
  }

  return filtered;
}

/**
 * กรองข้อมูลตามรอบวันที่ (1-15 หรือ 16-31)
 * @param {Array} data - ข้อมูลที่กรองจากปี/เดือนแล้ว
 * @param {Array} selectedPeriods - Array ของ period เช่น ['1-15', '16-31']
 * @returns {Array} Array ของ rows ที่กรองแล้ว
 */
function filterDataByPeriodOnly(data, selectedPeriods) {
  if (selectedPeriods.length === 0) return data;

  return data.filter(row => {
    const reportDate = row[6];
    if (!reportDate) return false;

    let day;

    if (reportDate instanceof Date && !isNaN(reportDate.getTime())) {
      day = reportDate.getDate();
    } else {
      const dateStr = String(reportDate).replace(/^'/, '').trim();
      const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (!match) return false;
      day = parseInt(match[1]);
    }

    for (const period of selectedPeriods) {
      if (period === '1-15' && day >= 1 && day <= 15) return true;
      if ((period === '16-30' || period === '16-31') && day >= 16) return true;
    }

    return false;
  });
}

// ============================================================
// 📊 DATA EXTRACTION
// ============================================================

/**
 * ดึงรายชื่อนักเรียนที่ไม่ซ้ำ (เรียงตาม Thai alphabetical)
 * @param {Array} filteredData - ข้อมูลที่กรองแล้ว
 * @returns {Array} Array ของชื่อนักเรียน
 */
function getUniqueStudents(filteredData) {
  const students = new Set();
  filteredData.forEach(row => {
    const student = row[5];
    if (student) students.add(String(student));
  });
  return Array.from(students).sort((a, b) => a.localeCompare(b, 'th'));
}

/**
 * ดึงรายชื่อติวเตอร์ที่ไม่ซ้ำ (ใช้ Line ID เป็นหลัก และดึง Display Name ล่าสุด)
 * @param {Array} filteredData - ข้อมูลที่กรองแล้ว
 * @returns {Array} Array ของ { lineId, displayName, latestDate }
 */
function getUniqueTutors(filteredData) {
  const tutorMap = new Map();

  filteredData.forEach(row => {
    const lineId = row[4];  // Column E: Line ID
    const displayName = row[3];  // Column D: Line Display Name
    const dateValue = row[6];  // Column G: Date

    if (!lineId) return;  // ข้ามถ้าไม่มี Line ID

    const lineIdStr = String(lineId).trim();
    const displayNameStr = String(displayName || '(ไม่มีชื่อ)').trim();

    // Parse date
    const date = parseDateValue(dateValue);

    if (!tutorMap.has(lineIdStr)) {
      tutorMap.set(lineIdStr, {
        lineId: lineIdStr,
        displayName: displayNameStr,
        latestDate: date
      });
    } else {
      // อัพเดตถ้าวันที่ใหม่กว่า
      const existing = tutorMap.get(lineIdStr);
      if (date > existing.latestDate) {
        existing.displayName = displayNameStr;
        existing.latestDate = date;
      }
    }
  });

  // แปลงเป็น Array และเรียงตามชื่อ
  return Array.from(tutorMap.values())
    .map(tutor => tutor.displayName)
    .sort((a, b) => a.localeCompare(b, 'th'));
}

/**
 * ดึง Line ID และ Display Name ล่าสุดของติวเตอร์ทั้งหมด
 * @param {Array} filteredData - ข้อมูลที่กรองแล้ว
 * @returns {Map} Map ของ lineId → { displayName, latestDate }
 */
function getTutorLineIdMap(filteredData) {
  const tutorMap = new Map();

  filteredData.forEach(row => {
    const lineId = row[4];  // Column E: Line ID
    const displayName = row[3];  // Column D: Line Display Name
    const dateValue = row[6];  // Column G: Date

    if (!lineId) return;

    const lineIdStr = String(lineId).trim();
    const displayNameStr = String(displayName || '(ไม่มีชื่อ)').trim();
    const date = parseDateValue(dateValue);

    if (!tutorMap.has(lineIdStr)) {
      tutorMap.set(lineIdStr, {
        displayName: displayNameStr,
        latestDate: date
      });
    } else {
      const existing = tutorMap.get(lineIdStr);
      if (date > existing.latestDate) {
        existing.displayName = displayNameStr;
        existing.latestDate = date;
      }
    }
  });

  return tutorMap;
}

/**
 * อัพเดต Display Name ใน TutorDB ถ้าพบว่าเปลี่ยน
 * @param {Map} tutorLineIdMap - Map จาก getTutorLineIdMap()
 */
function updateTutorDisplayNames(tutorLineIdMap) {
  try {
    const paymentSS = SpreadsheetApp.openById(SHARED_CONFIG.TUTOR_DB_FILE_ID);
    const tutorDB = paymentSS.getSheetByName('TutorDB');

    if (!tutorDB) return;

    const tutorData = tutorDB.getDataRange().getValues();
    const updates = [];

    for (let i = 1; i < tutorData.length; i++) {
      const row = tutorData[i];
      const lineId = row[12];  // Column M: Line ID
      const currentDisplayName = row[11];  // Column L: Line Display

      if (!lineId) continue;

      const lineIdStr = String(lineId).trim();

      if (tutorLineIdMap.has(lineIdStr)) {
        const latestInfo = tutorLineIdMap.get(lineIdStr);
        const latestDisplayName = latestInfo.displayName;

        // ถ้า Display Name เปลี่ยน ให้อัพเดต
        if (currentDisplayName !== latestDisplayName) {
          updates.push({
            row: i + 1,
            oldName: currentDisplayName,
            newName: latestDisplayName
          });

          tutorDB.getRange(i + 1, 12).setValue(latestDisplayName);  // Update Column L
        }
      }
    }

    if (updates.length > 0) {
      Logger.log('📝 อัพเดต Display Name ใน TutorDB:');
      updates.forEach(u => {
        Logger.log(`  Row ${u.row}: "${u.oldName}" → "${u.newName}"`);
      });
    }

  } catch (error) {
    Logger.log('Error updating TutorDB: ' + error.message);
  }
}

// ============================================================
// 📅 PERIOD SELECTION
// ============================================================

/**
 * ดึงช่วงเวลาที่เลือกจาก Dashboard (สำหรับ Dashboard Payment)
 * @param {Sheet} dashboard - Dashboard Sheet
 * @returns {Array} Array ของ { monthYear, period }
 */
function getSelectedPeriodsPayment(dashboard) {
  const selected = [];

  for (let row = 7; row <= 15; row++) {
    const monthYearValue = dashboard.getRange(row, 1).getValue();
    if (!monthYearValue || String(monthYearValue).includes('💡')) break;

    let monthYear = '';

    if (monthYearValue instanceof Date && !isNaN(monthYearValue.getTime())) {
      const month = monthYearValue.getMonth() + 1;
      const year = monthYearValue.getFullYear();
      const buddhistYear = convertToBuddhistYear(year);
      monthYear = SHARED_CONFIG.MONTH_NAMES[month - 1] + ' ' + buddhistYear;
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

/**
 * ดึงรอบวันที่ที่เลือกจาก Dashboard (สำหรับ Dashboard Report)
 * @param {Sheet} dashboard - Dashboard Sheet
 * @returns {Array} Array ของ period เช่น ['1-15', '16-31']
 */
function getSelectedPeriodsReport(dashboard) {
  const periods = [];

  // 1-15: H5
  if (dashboard.getRange('H5').getValue() === true) {
    periods.push('1-15');
  }

  // 16-31: J5
  if (dashboard.getRange('J5').getValue() === true) {
    periods.push('16-31');
  }

  return periods;
}

// ============================================================
// 💰 TUTOR PAYMENT RULES (Version 3.2+)
// ============================================================

/**
 * โหลด Payment Rules ของติวเตอร์แต่ละคนจาก TutorDB Sheet (Columns P-T)
 * @param {string} lineId - Line ID ของติวเตอร์
 * @returns {Map} Map ของ courseType → {rate, paymentTrigger, conditions}
 */
function getTutorPaymentRules(lineId) {
  try {
    const paymentSS = SpreadsheetApp.openById(SHARED_CONFIG.TUTOR_DB_FILE_ID);
    const tutorDB = paymentSS.getSheetByName('TutorDB');

    if (!tutorDB) {
      Logger.log('TutorDB sheet not found, using default rates');
      return getDefaultPaymentRules();
    }

    const data = tutorDB.getDataRange().getValues();
    const rules = new Map();

    // Find the tutor row by Line ID (Column M = index 12)
    let tutorRow = null;
    for (let i = 1; i < data.length; i++) {
      const rowLineId = String(data[i][12]).trim();  // Column M: Line ID
      if (rowLineId === lineId) {
        tutorRow = data[i];
        break;
      }
    }

    // ถ้าไม่เจอติวเตอร์คนนี้ ให้ใช้ default
    if (!tutorRow) {
      Logger.log('Tutor ' + lineId + ' not found in TutorDB, using default rules');
      return getDefaultPaymentRules();
    }

    // อ่านข้อมูลจาก columns
    const online1by1Rate = parseFloat(tutorRow[5]) || SHARED_CONFIG.RATES.online1by1 || 150;     // Column F
    const onsite1by1Rate = parseFloat(tutorRow[6]) || SHARED_CONFIG.RATES.onsite1by1 || 250;     // Column G
    const onsiteGroupRate = parseFloat(tutorRow[7]) || SHARED_CONFIG.RATES.onsiteGroup || 150;   // Column H
    const onsiteDayRate = parseFloat(tutorRow[8]) || SHARED_CONFIG.RATES.onsiteDay || 850;       // Column I

    const online1by1Trigger = String(tutorRow[15] || '').trim() || 'onCourseComplete';   // Column P
    const onsite1by1Trigger = String(tutorRow[16] || '').trim() || 'onCourseComplete';   // Column Q
    const onsiteGroupTrigger = String(tutorRow[17] || '').trim() || 'onCourseComplete';  // Column R
    const onsiteDayTrigger = String(tutorRow[18] || '').trim() || 'onCourseComplete';    // Column S
    const conditions = String(tutorRow[19] || '').trim();  // Column T

    // สร้าง rules map
    rules.set('online1by1', {
      rate: online1by1Rate,
      paymentTrigger: online1by1Trigger,
      conditions: conditions
    });

    rules.set('onsite1by1', {
      rate: onsite1by1Rate,
      paymentTrigger: onsite1by1Trigger,
      conditions: conditions
    });

    rules.set('onsiteGroup', {
      rate: onsiteGroupRate,
      paymentTrigger: onsiteGroupTrigger,
      conditions: conditions
    });

    rules.set('onsiteDay', {
      rate: onsiteDayRate,
      paymentTrigger: onsiteDayTrigger,
      conditions: conditions
    });

    Logger.log('✅ Loaded payment rules for ' + lineId);
    return rules;

  } catch (error) {
    Logger.log('Error loading payment rules for ' + lineId + ': ' + error.message);
    return getDefaultPaymentRules();
  }
}

/**
 * ดึง Default Payment Rules (ใช้เมื่อไม่มีการตั้งค่าใน Sheet)
 * @returns {Map} Default payment rules
 */
function getDefaultPaymentRules() {
  const rules = new Map();

  rules.set('online1by1', {
    rate: SHARED_CONFIG.RATES.online1by1 || 150,
    paymentTrigger: 'onCourseComplete',
    conditions: ''
  });

  rules.set('onsite1by1', {
    rate: SHARED_CONFIG.RATES.onsite1by1 || 250,
    paymentTrigger: 'onCourseComplete',
    conditions: ''
  });

  rules.set('onsiteGroup', {
    rate: SHARED_CONFIG.RATES.onsiteGroup || 150,
    paymentTrigger: 'onCourseComplete',
    conditions: ''
  });

  rules.set('onsiteDay', {
    rate: SHARED_CONFIG.RATES.onsiteDay || 850,
    paymentTrigger: 'everyPeriod',
    conditions: ''
  });

  return rules;
}

/**
 * คำนวณเงินตาม Payment Rules
 * @param {Object} session - ข้อมูล session {date, courseType, totalHours, remaining, duration}
 * @param {string} lineId - Line ID ของติวเตอร์
 * @param {Map} tutorRules - Payment rules จาก getTutorPaymentRules()
 * @returns {Object} {amount, shouldPay, rate, trigger, note}
 */
function calculatePaymentWithRules(session, lineId, tutorRules) {
  let courseType = session.courseType || 'online1by1';
  let rules = tutorRules.get(courseType);

  if (!rules) {
    // ถ้าไม่มี rules สำหรับ courseType นี้ ให้ใช้ default
    rules = {
      rate: SHARED_CONFIG.RATES[courseType] || 150,
      paymentTrigger: 'onCourseComplete',
      conditions: ''
    };
  }

  // Apply conditions (เช่น เปลี่ยน courseType ตามวัน)
  const conditionResult = applyPaymentConditions(rules.conditions, session, tutorRules);
  if (conditionResult.switchTo) {
    courseType = conditionResult.switchTo;
    rules = tutorRules.get(courseType) || rules;
  }

  // Check payment trigger
  const shouldPay = checkPaymentTrigger(rules.paymentTrigger, session);

  if (!shouldPay) {
    return {
      amount: 0,
      shouldPay: false,
      rate: rules.rate,
      trigger: rules.paymentTrigger,
      note: getPaymentTriggerNote(rules.paymentTrigger, false)
    };
  }

  // Calculate amount
  let rate = rules.rate;

  // Apply rate modifiers from conditions
  if (conditionResult.rateModifier) {
    rate += conditionResult.rateModifier;
  }
  if (conditionResult.rateMultiplier) {
    rate *= conditionResult.rateMultiplier;
  }

  // คำนวณยอดเงินตาม Payment Trigger
  let amount = 0;
  let hoursUsed = 0;

  if (rules.paymentTrigger === 'onCourseComplete') {
    // จบคอร์ส: ใช้ totalHours (ชั่วโมงรวมทั้งคอร์ส)
    hoursUsed = session.totalHours;
    if (courseType === 'onsiteDay') {
      // onsiteDay: คิดเหมาทั้งวัน (ไม่คูณชั่วโมง)
      amount = rate;  // 850 บาท/วัน
    } else {
      amount = hoursUsed * rate;
    }
  } else if (rules.paymentTrigger === 'everyPeriod') {
    // จ่ายตามรอบ: ใช้ duration (ชั่วโมงที่สอนในรอบนี้)
    hoursUsed = session.duration || 0;
    if (courseType === 'onsiteDay') {
      // onsiteDay: คิดเหมาทั้งวัน (ไม่คูณชั่วโมง)
      amount = rate;  // 850 บาท/วัน
    } else {
      amount = hoursUsed * rate;
    }
  } else {
    // Default: ใช้ totalHours
    hoursUsed = session.totalHours;
    if (courseType === 'onsiteDay') {
      amount = rate;
    } else {
      amount = hoursUsed * rate;
    }
  }

  return {
    amount: amount,
    shouldPay: true,
    rate: rate,
    trigger: rules.paymentTrigger,
    note: getPaymentTriggerNote(rules.paymentTrigger, true),
    hoursUsed: hoursUsed  // เพิ่มข้อมูลชั่วโมงที่ใช้คำนวณ
  };
}

/**
 * ตรวจสอบเงื่อนไขการจ่ายเงิน (Payment Trigger)
 * @param {string} trigger - Payment trigger type
 * @param {Object} session - Session data
 * @returns {boolean} ควรจ่ายเงินหรือไม่
 */
function checkPaymentTrigger(trigger, session) {
  switch (trigger) {
    case 'onCourseComplete':
      return session.remaining === 0;

    case 'everyPeriod':
      return true;

    case 'monthly':
      // TODO: Implement monthly logic (check if last period of month)
      return false;

    default:
      return session.remaining === 0;  // Default to onCourseComplete
  }
}

/**
 * สร้างข้อความอธิบาย Payment Trigger
 * @param {string} trigger - Payment trigger type
 * @param {boolean} paid - จ่ายแล้วหรือไม่
 * @returns {string} ข้อความอธิบาย
 */
function getPaymentTriggerNote(trigger, paid) {
  if (!paid) {
    switch (trigger) {
      case 'onCourseComplete':
        return '⏳ รอจบคอร์ส';
      case 'everyPeriod':
        return '⏳ ไม่อยู่ในรอบจ่าย';
      case 'monthly':
        return '⏳ รอสิ้นเดือน';
      default:
        return '⏳ ค้าง';
    }
  }

  switch (trigger) {
    case 'onCourseComplete':
      return '✅ จบคอร์ส';
    case 'everyPeriod':
      return '✅ ตามรอบ';
    case 'monthly':
      return '✅ รายเดือน';
    default:
      return '✅ จ่าย';
  }
}

/**
 * ประมวลผล Conditions (เงื่อนไขพิเศษ)
 * รูปแบบ: "type:values→action"
 * ตัวอย่าง:
 *   - "dayOfWeek:Sat,Sun→onsiteDay" = เปลี่ยนเป็น onsiteDay ถ้าเป็นเสาร์/อาทิตย์
 *   - "minHours:10→+10" = บวก 10 บาท/ชม. ถ้าสอนครบ 10 ชม.
 *
 * @param {string} conditionsStr - Conditions string
 * @param {Object} session - Session data
 * @param {Map} tutorRules - Tutor rules map
 * @returns {Object} {switchTo, rateModifier, rateMultiplier}
 */
function applyPaymentConditions(conditionsStr, session, tutorRules) {
  const result = {
    switchTo: null,
    rateModifier: 0,
    rateMultiplier: 1
  };

  if (!conditionsStr || conditionsStr.trim() === '') {
    return result;
  }

  // Parse condition: "type:values→action"
  const match = conditionsStr.match(/^(\w+):([^→]+)→(.+)$/);
  if (!match) {
    Logger.log('Invalid condition format: ' + conditionsStr);
    return result;
  }

  const type = match[1];
  const values = match[2];
  const action = match[3];

  // Apply condition based on type
  if (type === 'dayOfWeek') {
    const sessionDate = parseDateValue(session.date);
    const dayOfWeek = getDayOfWeek(sessionDate);
    const allowedDays = values.split(',').map(d => d.trim());

    if (allowedDays.includes(dayOfWeek) || allowedDays.includes(dayOfWeek.substring(0, 3))) {
      // Action: switch to another course type
      if (tutorRules.has(action)) {
        result.switchTo = action;
      }
    }
  }

  // TODO: Add more condition types (minHours, studentCount, etc.)

  return result;
}

/**
 * ดึงชื่อวัน (Day of Week) จาก Date object
 * @param {Date} date - Date object
 * @returns {string} ชื่อวัน (เช่น "Saturday")
 */
function getDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// ============================================================
// SHARED DISPLAY FUNCTIONS (Used by both Dashboard Payment & Report)
// ============================================================

/**
 * CREATE SUMMARY DETAILS TEXT
 * สร้างข้อความสรุปรายละเอียดแบบย่อสำหรับแต่ละติวเตอร์
 */
function createSummaryDetailsText(studentDetails, courseType) {
  const lines = [];
  
  if (courseType === "onsiteDay") {
    const dateGroups = groupOnsiteDayByDate(studentDetails);
    dateGroups.forEach((dateGroup, dateKey) => {
      const studentsText = dateGroup.students
        .map(s => s.name + "(" + s.hours.toFixed(1) + ")")
        .join(" ");
      lines.push(dateKey + " " + studentsText);
    });
    return lines.join("\n");
  }
  
  const paidStudents = [];
  const pendingStudents = [];
  
  studentDetails.forEach(studentData => {
    const studentName = studentData.studentName;
    const rate = studentData.rate || 0;
    const hoursUsed = studentData.durationSum || 0;
    const amount = studentData.amount || 0;
    
    if (studentData.status === "✅ จ่าย") {
      const detail = studentName + " " + rate + "×" + hoursUsed.toFixed(1) + "=" + amount.toLocaleString("th-TH");
      paidStudents.push(detail);
    } else {
      const detail = studentName + " " + hoursUsed.toFixed(1) + "ชม. (รอจบคอร์ส)";
      pendingStudents.push(detail);
    }
  });
  
  if (paidStudents.length > 0) {
    lines.push(...paidStudents);
  }
  if (pendingStudents.length > 0) {
    if (paidStudents.length > 0) lines.push("---");
    lines.push(...pendingStudents);
  }
  
  return lines.join("\n");
}


/**
 * GROUP STUDENTS BY COURSE TYPE
 * จัดกลุ่ม students ตาม courseType พร้อมเรียงลำดับ
 */
function groupStudentsByCourseType(students) {
  const grouped = new Map();
  const courseTypeOrder = ["online1by1", "onsite1by1", "onsiteGroup", "onsiteDay"];
  
  students.forEach((studentData, key) => {
    const courseType = studentData.courseType;
    if (!grouped.has(courseType)) {
      grouped.set(courseType, {
        courseType: courseType,
        students: [],
        totalHours: 0,
        totalAmount: 0
      });
    }
    const group = grouped.get(courseType);
    group.students.push(studentData);
    group.totalHours += studentData.durationSum;
    group.totalAmount += studentData.amount;
  });
  
  const sorted = new Map();
  courseTypeOrder.forEach(type => {
    if (grouped.has(type)) sorted.set(type, grouped.get(type));
  });
  return sorted;
}


/**
 * GROUP ONSITEDAY BY DATE
 * จัดกลุ่ม onsiteDay sessions ตามวันที่
 */
function groupOnsiteDayByDate(students) {
  const dateGroups = new Map();
  students.forEach(studentData => {
    if (studentData.courseType !== "onsiteDay") return;
    studentData.sessions.forEach(session => {
      const dateKey = formatDateString(session.date);
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, {
          date: session.date,
          dateStr: dateKey,
          students: [],
          totalHours: 0,
          totalAmount: 0,
          isPaid: false
        });
      }
      const dateGroup = dateGroups.get(dateKey);
      dateGroup.students.push({ name: studentData.studentName, hours: session.duration });
      dateGroup.totalHours += session.duration;
      if (studentData.status === "✅ จ่าย" && !dateGroup.isPaid) {
        dateGroup.totalAmount = 850;
        dateGroup.isPaid = true;
      }
    });
  });
  Logger.log("📅 groupOnsiteDayByDate found " + dateGroups.size + " days");
  return dateGroups;
}


/**
 * CREATE TUTOR TOTAL SUMMARY
 * สร้างข้อความสรุปสำหรับแถว **รวม** (Dashboard Payment style)
 * Format: "online1by1: สอนจบ 3 คอร์ส | onsiteDay: สอน 5 วัน"
 */
function createTutorTotalSummary(courseTypeGroups) {
  const summaries = [];
  courseTypeGroups.forEach((group, courseType) => {
    const students = group.students || [];
    if (courseType === "onsiteDay") {
      const uniqueDates = new Set();
      students.forEach(studentData => {
        if (studentData.sessions) {
          studentData.sessions.forEach(session => {
            uniqueDates.add(formatDateString(session.date));
          });
        }
      });
      if (uniqueDates.size > 0) {
        summaries.push(courseType + ": สอน " + uniqueDates.size + " วัน");
      }
    } else {
      const paidCourses = students.filter(s => s.status === "✅ จ่าย").length;
      if (paidCourses > 0) {
        summaries.push(courseType + ": สอนจบ " + paidCourses + " คอร์ส");
      }
    }
  });
  return summaries.join(" | ");
}


/**
 * CREATE TUTOR TOTAL SUMMARY FROM SESSIONS  
 * สร้างข้อความสรุปจาก courseTypeGroups ที่มี sessions (Dashboard Report style)
 */
function createTutorTotalSummaryFromSessions(courseTypeGroups) {
  const summaries = [];
  courseTypeGroups.forEach((group, courseType) => {
    const sessions = group.sessions || [];
    if (courseType === "onsiteDay") {
      const uniqueDates = new Set();
      sessions.forEach(session => uniqueDates.add(formatDateString(session.date)));
      if (uniqueDates.size > 0) {
        summaries.push(courseType + ": สอน " + uniqueDates.size + " วัน");
      }
    } else {
      const paidSessions = sessions.filter(s => (s.amount || 0) > 0).length;
      if (paidSessions > 0) {
        summaries.push(courseType + ": สอนจบ " + paidSessions + " คอร์ส");
      }
    }
  });
  return summaries.join(" | ");
}


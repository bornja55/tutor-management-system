// ============================================================
// 🔧 SHARED CONFIGURATION
// Config ที่ใช้ร่วมกันระหว่าง Dashboard Payment และ Dashboard Report
// ============================================================

const SHARED_CONFIG = {
  // Raw Data Source
  RAW_DATA_SHEET: 'บันทึกลงเวลาจาก LineBot',

  // Tutor Database
  TUTOR_DB_FILE_ID: '1zeRKFL52PVJi4hQddB5FoMIITdtAmO3NN7CJRolRgAo',

  // Rate Configuration
  RATES: {
    'online1by1': 150,
    'onsite1by1': 250,
    'onsiteGroup': 250,
    'onsiteDay': 800
  },

  // Month Names (Thai)
  MONTH_NAMES: [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ],

  // Month Names (Short)
  MONTH_SHORT: [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ]
};

// ============================================================
// 💰 DASHBOARD PAYMENT CONFIG
// ============================================================
const PAYMENT_CONFIG = {
  DASHBOARD_SHEET: 'Dashboard Payment',
  RECENT_MONTHS: 3,

  COLORS: {
    header: '#1a73e8',
    filterHeader: '#34a853',
    yearPeriod: '#e8f0fe',
    month: '#f3f3f3',
    tutor: '#d9ead3',
    updateButton: '#fbbc04',
    reportButton: '#34a853',
    tableHeader: '#4285f4',
    summaryBg: '#e8f0fe',
    detailHeaderBg: '#f3f3f3',
    completedBg: '#d9ead3',
    pendingBg: '#fff2cc'
  }
};

// ============================================================
// 📊 DASHBOARD REPORT CONFIG
// ============================================================
const REPORT_CONFIG = {
  DASHBOARD_SHEET: 'Dashboard Report',

  COLORS: {
    header: '#673ab7',
    filterHeader: '#34a853',
    yearPeriod: '#e8f0fe',
    month: '#f3f3f3',
    student: '#fff2cc',
    tutor: '#d9ead3',
    buttonUpdate: '#fbbc04',
    buttonStudent: '#9c27b0',
    buttonTutor: '#1a73e8',
    summaryLabel: '#e0e0e0',
    summaryValue: '#f5f5f5',
    tableHeader: '#7b1fa2',
    studentHeader: '#e1bee7',
    tutorHeader: '#bbdefb',
    statusOK: '#c8e6c9',
    statusPending: '#fff9c4'
  }
};

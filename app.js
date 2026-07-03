const translations = {
  en: {
    brandSubtitle: "Admin System",
    navDashboard: "Dashboard",
    navStudents: "Students",
    navFinance: "School Fees",
    navStaff: "Staff",
    navInventory: "Facilities",
    navLetters: "Letters",
    navUsers: "Users",
    navAudit: "Audit Log",
    searchPlaceholder: "Search dashboard",
    moduleSuperAdmin: "Super Admin",
    dashboardTitle: "Admin Dashboard",
    overview: "Overview",
    today: "Today",
    reports: "Reports",
    studentsTotal: "Total Students",
    activeClasses: "Active Classes",
    schoolFees: "School Fees",
    staffAttendance: "Staff Attendance",
    thisMonth: "this month",
    thisTerm: "this term",
    paidStatus: "paid this month",
    todayAttendance: "today",
    recentStudents: "Recent Students",
    pendingRequests: "Pending Requests",
    recentLetters: "Recent Letters",
    active: "Active",
    pending: "Pending",
    studentMutation: "Student mutation",
    dataRevision: "Data revision",
    borrowApproval: "Borrow approval",
    done: "Done",
    review: "Review",
    sent: "Sent",
    studentOverview: "Student Overview",
    export: "Export",
    name: "Name",
    class: "Class",
    guardian: "Guardian",
    feeStatus: "Fee Status",
    status: "Status",
    actions: "Actions",
    paid: "Paid",
    partial: "Partial",
    overdue: "Overdue",
    view: "View",
    pageStudentsTitle: "Students",
    pageStudentsSubtitle: "Data, ledger, class list, recap, mutation, and master book.",
    pageFinanceTitle: "School Fees",
    pageFinanceSubtitle: "Payments, student billing, monthly status, and PSB finance.",
    pageStaffTitle: "Staff",
    pageStaffSubtitle: "Attendance, transport, and employee attendance statistics.",
    pageInventoryTitle: "Facilities",
    pageInventorySubtitle: "Stock, transactions, borrowing, budget control, and inventory.",
    pageLettersTitle: "Letters",
    pageLettersSubtitle: "Incoming letters, outgoing letters, and letter numbering.",
    pageUsersTitle: "Users",
    pageUsersSubtitle: "User accounts, roles, permissions, and access scope.",
    pageAuditTitle: "Audit Log",
    pageAuditSubtitle: "Activity history with own-record scope for regular roles.",
    quickActions: "Quick Actions",
    recentRecords: "Recent Records",
    requestUpdate: "Request Update",
    addRecord: "Add Record",
    approve: "Approve",
    module: "Module",
    owner: "Owner",
    scope: "Scope",
    invTabOverview: "Overview",
    invTabQrcr: "QR / OCR",
    invTabMaster: "Master",
    invTabInventory: "Inventory",
    invTabOpname: "Stock Opname",
    invTabAsset: "Asset",
    invTabBorrow: "Borrow",
    invTabMaintenance: "Maintenance",
    invTabActivity: "Activity",
    invTabReports: "Reports",
    invActSearch: "Search token / item...",
    invActAll: "All",
    invActIn: "In",
    invActOut: "Out",
    invActExport: "Export",
    invActClear: "Clear All",
    invActEmpty: "No transaction history.",
    invActToken: "Token",
    invActType: "Type",
    invActDate: "Date",
    invActItems: "Items",
    invActTotalQty: "Total Qty",
    invActOfficer: "Officer",
    invActStatus: "Status",
    invActDetail: "Detail",
    invActCode: "Code",
    invActItemName: "Item Name",
    invActQty: "Qty",
    invActItem: "item",
    invActNoDetail: "No item details",
    invActClearConfirm: "Delete all transaction history? This action is permanent.",
    invActExportDone: "transactions exported",
    invActTransaction: "transaction",
    invActConfirmDelete: "Delete",
    invActPlaceholderTitle: "Activity Log",
    invActPlaceholderDesc: "A unified log for incoming items, outgoing items, mutations, stock opname, adjustments, maintenance, and borrowing.",
    invActPlaceholderScope: "Date filter, Activity type, Items, Officer, Location",
    invMasterCode: "Code",
    invMasterName: "Item Name",
    invMasterCategory: "Category",
    invMasterLocation: "Location",
    invMasterStock: "Stock",
    invMasterFreq: "Freq",
    invMasterTimestamp: "Timestamp",
    invMasterActions: "Actions",
    invMasterEmpty: "No data yet.",
    invMasterSearch: "Search item...",
    invMasterAdd: "+ Add",
    invMasterExport: "Export",
    invMasterImport: "Import",
    invMasterSave: "Save to DB",
    invMasterLoad: "Load from DB",
    invMasterData: "data",
    invMasterShow: "Show",
    invMasterEdit: "Edit",
    invMasterDelete: "Delete",
    invMasterModalAdd: "Add Item",
    invMasterModalEdit: "Edit Item",
    invMasterSaveBtn: "Save",
    invMasterCancelBtn: "Cancel",
    invMasterImportSuccess: "items imported",
    invMasterImportFail: "Import failed",
    invMasterReadFail: "Failed to read file",
    invMasterTemplate: "Download Template",
    invMasterUpload: "Upload File",
    invOverviewTotalItems: "Total Items",
    invOverviewTotalStock: "Total Stock Units",
    invOverviewCategories: "Categories",
    invOverviewLowStock: "Low Stock",
    invOverviewZeroStock: "Out of Stock",
    invOverviewTransactionChart: "Transaction Volume",
    invOverviewTopItems: "Top Items by Frequency",
    invOverviewFreqRanking: "Frequency Ranking",
    invOverviewRank: "Rank",
    invOverviewCode: "Code",
    invOverviewName: "Name",
    invOverviewCategory: "Category",
    invOverviewFreq: "Freq",
    invOverviewQuickActions: "Quick Actions",
    invOverviewNoData: "No data yet — start by adding items in Master, then record transactions in Inventory.",
    invOpSearch: "Search / Scan item code...",
    invOpTypeIn: "Check In",
    invOpTypeOut: "Check Out",
    invOpToken: "Token",
    invOpOrderList: "Order List",
    invOpEmpty: "No items yet. Scan or search item code.",
    invOpConfirm: "Confirm",
    invOpClear: "Clear",
    invOpSummary: "Summary",
    invOpUnique: "Unique Items",
    invOpTotal: "Total Qty",
    invOpCategory: "Category",
    invRepTitle: "Reports",
    invRepMonthly: "Monthly",
    invRepQuarterly: "3-Month",
    invRepTahapan: "Tahapan (6-Month)",
    invRepGenerate: "Generate",
    invRepExport: "Export XLSX",
    invRepNo: "No",
    invRepCategory: "Category",
    invRepCode: "Code",
    invRepName: "Item Name",
    invRepStockAwal: "Opening Stock",
    invRepMasuk: "In",
    invRepKeluar: "Out",
    invRepTotalMasuk: "Total In",
    invRepTotalKeluar: "Total Out",
    invRepSisaStock: "Stock",
    invRepNoData: "No transactions for this period.",
    invRepBulan: "Month",
    invRepTahun: "Year",
    invRepTahapan1: "Phase 1 (Jan–Jun)",
    invRepTahapan2: "Phase 2 (Jul–Dec)",
    invRepConfirmLoad: "Have you loaded data from DB?",
    invRepLedger: "Ledger",
    invRepCards: "Cards",
    invRepSelectItem: "Select Item...",
    invRepDate: "Date",
    invRepIn: "In",
    invRepOut: "Out",
    invRepBalance: "Balance",
    invRepExportCard: "Export Card",
    invRepExportAll: "Export All",
    invRepCardNoTx: "No transactions for this item.",
    invRepCardOf: "Officer",
    invRepToken: "Token",
    invRepCurrentStock: "Current Stock",
    invOpTokenReq: "Token must be 6 digits.",
    invOpNoItems: "No items in the list.",
    invOpQty: "Qty",
    invOpRemove: "Remove",
    invOpConfirmTitle: "Confirm Check {type}",
    invOpTokenReEnter: "Re-enter the 6-digit token to confirm",
    invOpInvalidToken: "Invalid token. Transaction cancelled.",
    invOpSuccess: "success",
    invOpInStock: "Insufficient stock:",
    invOpAvail: "available",
    invOpRequested: "requested"
  },
  id: {
    brandSubtitle: "Sistem Admin",
    navDashboard: "Dashboard",
    navStudents: "Peserta Didik",
    navFinance: "Uang Sekolah",
    navStaff: "Kepegawaian",
    navInventory: "Sarpras",
    navLetters: "Surat",
    navUsers: "Users",
    navAudit: "Log Audit",
    searchPlaceholder: "Cari dashboard",
    moduleSuperAdmin: "Super Admin",
    dashboardTitle: "Dashboard Admin",
    overview: "Ringkasan",
    today: "Hari Ini",
    reports: "Laporan",
    studentsTotal: "Total Siswa",
    activeClasses: "Kelas Aktif",
    schoolFees: "Uang Sekolah",
    staffAttendance: "Kehadiran Pegawai",
    thisMonth: "bulan ini",
    thisTerm: "semester ini",
    paidStatus: "terbayar bulan ini",
    todayAttendance: "hari ini",
    recentStudents: "Siswa Terbaru",
    pendingRequests: "Pengajuan Tertunda",
    recentLetters: "Surat Terbaru",
    active: "Aktif",
    pending: "Tertunda",
    studentMutation: "Mutasi siswa",
    dataRevision: "Revisi data",
    borrowApproval: "Persetujuan pinjam",
    done: "Selesai",
    review: "Review",
    sent: "Terkirim",
    studentOverview: "Ringkasan Siswa",
    export: "Ekspor",
    name: "Nama",
    class: "Kelas",
    guardian: "Wali",
    feeStatus: "Status Biaya",
    status: "Status",
    actions: "Aksi",
    paid: "Lunas",
    partial: "Sebagian",
    overdue: "Terlambat",
    view: "Lihat",
    pageStudentsTitle: "Peserta Didik",
    pageStudentsSubtitle: "Data, ledger, daftar kelas, rekap, mutasi, dan buku induk.",
    pageFinanceTitle: "Uang Sekolah",
    pageFinanceSubtitle: "Pembayaran, tagihan siswa, status bulanan, dan keuangan PSB.",
    pageStaffTitle: "Kepegawaian",
    pageStaffSubtitle: "Kehadiran, transport, dan statistik kehadiran pegawai.",
    pageInventoryTitle: "Sarpras",
    pageInventorySubtitle: "Stok, transaksi, peminjaman, kontrol anggaran, dan inventaris.",
    pageLettersTitle: "Surat",
    pageLettersSubtitle: "Surat masuk, surat keluar, dan nomor surat.",
    pageUsersTitle: "Users",
    pageUsersSubtitle: "Akun pengguna, role, permission, dan scope akses.",
    pageAuditTitle: "Log Audit",
    pageAuditSubtitle: "Riwayat aktivitas dengan scope data sendiri untuk role biasa.",
    quickActions: "Aksi Cepat",
    recentRecords: "Data Terbaru",
    requestUpdate: "Ajukan Perubahan",
    addRecord: "Tambah Data",
    approve: "Setujui",
    module: "Modul",
    owner: "Pemilik",
    scope: "Scope",
    invTabOverview: "Ringkasan",
    invTabQrcr: "QR / OCR",
    invTabMaster: "Master",
    invTabInventory: "Inventory",
    invTabOpname: "Stock Opname",
    invTabAsset: "Asset",
    invTabBorrow: "Peminjaman",
    invTabMaintenance: "Maintenance",
    invTabActivity: "Riwayat",
    invTabReports: "Laporan",
    invActSearch: "Cari token / barang...",
    invActAll: "Semua",
    invActIn: "Masuk",
    invActOut: "Keluar",
    invActExport: "Export",
    invActClear: "Clear All",
    invActEmpty: "Belum ada riwayat transaksi.",
    invActToken: "Token",
    invActType: "Tipe",
    invActDate: "Tanggal",
    invActItems: "Barang",
    invActTotalQty: "Total Qty",
    invActOfficer: "Petugas",
    invActStatus: "Status",
    invActDetail: "Detail",
    invActCode: "Kode",
    invActItemName: "Nama Barang",
    invActQty: "Jml",
    invActItem: "item",
    invActNoDetail: "Tidak ada detail item",
    invActClearConfirm: "Hapus semua riwayat transaksi? Data akan hilang permanen.",
    invActExportDone: "transaksi diexport",
    invActTransaction: "transaksi",
    invActConfirmDelete: "Hapus",
    invActPlaceholderTitle: "Riwayat Aktivitas",
    invActPlaceholderDesc: "Satu tempat untuk log barang masuk, keluar, mutasi, stock opname, penyesuaian, maintenance, dan peminjaman.",
    invActPlaceholderScope: "Filter tanggal, Jenis aktivitas, Barang, Petugas, Lokasi",
    invMasterCode: "Kode",
    invMasterName: "Nama Barang",
    invMasterCategory: "Kategori",
    invMasterLocation: "Location",
    invMasterStock: "Stock",
    invMasterFreq: "Freq",
    invMasterTimestamp: "Timestamp",
    invMasterActions: "Aksi",
    invMasterEmpty: "Belum ada data.",
    invMasterSearch: "Cari barang...",
    invMasterAdd: "+ Tambah",
    invMasterExport: "Export",
    invMasterImport: "Import",
    invMasterSave: "Save to DB",
    invMasterLoad: "Load from DB",
    invMasterData: "data",
    invMasterShow: "Tampil",
    invMasterEdit: "Edit",
    invMasterDelete: "Hapus",
    invMasterModalAdd: "Tambah Barang",
    invMasterModalEdit: "Edit Barang",
    invMasterSaveBtn: "Simpan",
    invMasterCancelBtn: "Batal",
    invMasterImportSuccess: "barang berhasil diimport",
    invMasterImportFail: "Gagal import",
    invMasterReadFail: "Gagal membaca file",
    invMasterTemplate: "Download Template",
    invMasterUpload: "Upload File",
    invOverviewTotalItems: "Total Barang",
    invOverviewTotalStock: "Total Stok Unit",
    invOverviewCategories: "Kategori",
    invOverviewLowStock: "Stok Minimum",
    invOverviewZeroStock: "Stok Habis",
    invOverviewTransactionChart: "Volume Transaksi",
    invOverviewTopItems: "Barang Teratas",
    invOverviewFreqRanking: "Peringkat Frekuensi",
    invOverviewRank: "Peringkat",
    invOverviewCode: "Kode",
    invOverviewName: "Nama",
    invOverviewCategory: "Kategori",
    invOverviewFreq: "Frekuensi",
    invOverviewQuickActions: "Aksi Cepat",
    invOverviewNoData: "Belum ada data — mulai dengan menambah barang di Master, lalu catat transaksi di Inventory.",
    invOpSearch: "Cari / Scan kode barang...",
    invOpTypeIn: "Barang Masuk",
    invOpTypeOut: "Barang Keluar",
    invOpToken: "Token",
    invOpOrderList: "Daftar barang",
    invOpEmpty: "Belum ada barang. Scan atau cari kode barang.",
    invOpConfirm: "Check {type}",
    invOpClear: "Clear",
    invOpSummary: "Ringkasan",
    invOpUnique: "Item Unik",
    invOpTotal: "Total Qty",
    invOpCategory: "Kategori",
    invRepTitle: "Laporan",
    invRepMonthly: "Bulanan",
    invRepQuarterly: "3 Bulanan",
    invRepTahapan: "Tahapan (6 Bulan)",
    invRepGenerate: "Generate",
    invRepExport: "Export XLSX",
    invRepNo: "No",
    invRepCategory: "Kategori",
    invRepCode: "Kode",
    invRepName: "Nama Barang",
    invRepStockAwal: "Stock Awal",
    invRepMasuk: "Msk",
    invRepKeluar: "Klr",
    invRepTotalMasuk: "Total Masuk",
    invRepTotalKeluar: "Total Keluar",
    invRepSisaStock: "Stok",
    invRepNoData: "Belum ada transaksi untuk periode ini.",
    invRepBulan: "Bulan",
    invRepTahun: "Tahun",
    invRepTahapan1: "Tahapan 1 (Jan–Jun)",
    invRepTahapan2: "Tahapan 2 (Jul–Dec)",
    invRepConfirmLoad: "Apakah sudah load DB?",
    invRepLedger: "Buku Besar",
    invRepCards: "Kartu Stok",
    invRepSelectItem: "Pilih Barang...",
    invRepDate: "Tanggal",
    invRepIn: "Masuk",
    invRepOut: "Keluar",
    invRepBalance: "Saldo",
    invRepExportCard: "Export Kartu",
    invRepExportAll: "Export Semua",
    invRepCardNoTx: "Belum ada transaksi untuk barang ini.",
    invRepCardOf: "Petugas",
    invRepToken: "Token",
    invRepCurrentStock: "Stok Saat Ini",
    invOpTokenReq: "Token harus 6 digit angka.",
    invOpNoItems: "Belum ada barang dalam daftar.",
    invOpQty: "Qty",
    invOpRemove: "Hapus",
    invOpConfirmTitle: "Konfirmasi Check {type}",
    invOpTokenReEnter: "Masukkan ulang 6 digit token untuk konfirmasi",
    invOpInvalidToken: "Token tidak valid. Transaksi dibatalkan.",
    invOpSuccess: "berhasil",
    invOpInStock: "Stok tidak mencukupi:",
    invOpAvail: "tersedia",
    invOpRequested: "diminta"
  }
};

const students = [
  ["Raka Pratama", "XI IPA 1", "Siti Aminah", "paid", "active"],
  ["Nabila Putri", "X IPS 2", "Budi Santoso", "partial", "active"],
  ["Galih Saputra", "XII IPA 3", "Ratna Dewi", "overdue", "pending"],
  ["Alya Kirana", "IX A", "Dimas Putra", "paid", "active"],
  ["Fajar Nugraha", "VIII C", "Lina Marlina", "partial", "active"]
];

const pageData = {
  students: {
    features: ["Ledger", "Daftar Kelas", "Rekap", "Mutasi", "Buku Induk", "Request Update"],
    stats: [["842", "Total"], ["27", "Classes"], ["5", "Requests"], ["12", "Mutasi"]],
    columns: ["Name", "Class", "Guardian", "Scope", "Status"],
    rows: [
      ["Raka Pratama", "XI IPA 1", "Siti Aminah", "Assigned", "Active"],
      ["Nabila Putri", "X IPS 2", "Budi Santoso", "All", "Active"],
      ["Galih Saputra", "XII IPA 3", "Ratna Dewi", "Request", "Pending"]
    ]
  },
  staff: {
    features: ["Kehadiran", "Transport", "Statistik Kehadiran", "View Own", "Rekap", "Export"],
    stats: [["126", "Employees"], ["94%", "Present"], ["8", "Transport"], ["3", "Late"]],
    columns: ["Employee", "Unit", "Attendance", "Scope", "Status"],
    rows: [
      ["Daniel Wijaya", "TU", "Present", "Own", "Active"],
      ["Maria Santoso", "Kurikulum", "Present", "All", "Active"],
      ["Andre Lim", "Sarpras", "Late", "Own", "Pending"]
    ]
  },
  inventory: {
    features: ["Barang Masuk", "Barang Keluar", "Peminjaman", "Stok Barang", "Kontrol Anggaran", "Inventaris", "QR / OCR"],
    stats: [["1,248", "Items"], ["36", "Borrowed"], ["12", "Low Stock"], ["84%", "Budget"]],
    columns: ["Item", "Category", "Location", "Stock", "Status"],
    rows: [
      ["LCD Projector", "Electronics", "Lab 2", "14", "Active"],
      ["Student Desk", "Furniture", "Warehouse", "240", "Active"],
      ["Basketball", "Sport", "Gym", "3", "Pending"]
    ]
  },
  letters: {
    features: ["Surat Masuk", "Surat Keluar", "Nomor Surat", "Arsip", "Review", "Export"],
    stats: [["119", "Incoming"], ["54", "Outgoing"], ["7", "Review"], ["3", "Drafts"]],
    columns: ["Number", "Subject", "Type", "Owner", "Status"],
    rows: [
      ["IN/119/IV/2026", "Undangan dinas", "Incoming", "TU", "Review"],
      ["OUT/054/IV/2026", "Surat keterangan", "Outgoing", "Admin", "Sent"],
      ["SK/034/IV/2026", "Nomor surat", "Numbering", "TU", "Done"]
    ]
  },
  users: {
    features: ["Users", "Roles", "Permissions", "Scopes", "Invitations", "Access Review"],
    stats: [["48", "Users"], ["8", "Roles"], ["74", "Permissions"], ["6", "Review"]],
    columns: ["User", "Role", "Email", "Scope", "Status"],
    rows: [
      ["Admin User", "Super Admin", "admin@school.test", "All", "Active"],
      ["US Staff", "US/PSB", "us@school.test", "All", "Active"],
      ["Wali Kelas X-1", "Wali Kelas", "wali@school.test", "Assigned", "Pending"]
    ]
  },
  audit: {
    features: ["Activity", "Actor", "Module", "Scope Own", "Timestamp", "Export"],
    stats: [["1,209", "Events"], ["41", "Today"], ["6", "Warnings"], ["0", "Critical"]],
    columns: ["Actor", "Module", "Action", "Scope", "Status"],
    rows: [
      ["Admin User", "Users", "Updated role", "All", "Done"],
      ["US Staff", "Uang Sekolah", "Exported report", "Own", "Done"],
      ["Sarpras Staff", "Inventory", "Changed stock", "Own", "Review"]
    ]
  }
};

function nowStamp() { return nowStampWIB(); }
function nowStampWIB() {
  const d = new Date();
  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 16).replace("T", " ");
}

let masterPageSize = 10;
let masterCurrentPage = 1;
let invActivityPageSize = 20;
let invActivityCurrentPage = 1;
let invActivityFilter = "semua";
let invActivitySearch = "";

/* ── Inventory operations state ── */
let invTransactionType = "masuk";
let invToken = "000001";
let invTokenDate = "";
let invTokenVisible = false;
let invCurrentOrder = [];

function loadInvTokenState() {
  const today = nowStampWIB().slice(0, 10);
  const storedDate = localStorage.getItem("reload_sarpras_token_date");
  const storedToken = localStorage.getItem("reload_sarpras_token");
  if (storedDate === today && storedToken) {
    invToken = storedToken;
    invTokenDate = today;
  } else {
    invToken = "000001";
    invTokenDate = today;
    localStorage.setItem("reload_sarpras_token_date", today);
    localStorage.setItem("reload_sarpras_token", invToken);
  }
}
function saveInvTokenState() {
  const today = nowStampWIB().slice(0, 10);
  if (invTokenDate !== today) {
    invToken = "000001";
    invTokenDate = today;
  }
  localStorage.setItem("reload_sarpras_token_date", invTokenDate);
  localStorage.setItem("reload_sarpras_token", invToken);
}

const inventoryMasterData = {
  items: [
      ["MHP-ATK-001", "Kertas A4", "Alat Tulis", "Gudang ATK", "420", "2026-06-30 10:00", "0"],
      ["MHP-ELK-001", "Mouse Wireless", "Elektronik", "Lab Komputer", "18", "2026-06-30 10:05", "0"],
      ["MHP-BRS-001", "Cairan Pel", "Kebersihan", "Gudang Kebersihan", "6", "2026-06-30 10:10", "0"],
      ["MHP-ARS-001", "Ordner Arsip", "Arsip", "TU", "14", "2026-06-30 10:15", "0"],
      ["MHP-TIN-001", "Tinta Printer", "Tinta & Toner", "Gudang ATK", "8", "2026-06-30 10:20", "0"]
  ],
  categories: ["ATK", "Kebersihan", "Elektronik", "Kertas", "Arsip", "Tinta", "Peralatan"],
  kategoriList: [
      ["MHP-ATK", "Alat Tulis"],
      ["MHP-KRT", "Kertas"],
      ["MHP-ARS", "Arsip"],
      ["MHP-PRT", "Peralatan"],
      ["MHP-TIN", "Tinta & Toner"],
      ["MHP-BRS", "Kebersihan"],
      ["MHP-ELK", "Elektronik"],
      ["MHP-LKS", "Perekat"],
      ["MHP-KSM", "Konsumabel"]
  ],
  locations: ["Gudang Utama", "Gudang ATK", "Gudang Kebersihan", "TU", "Perpustakaan", "Lab Komputer"],
  suppliers: [
    ["CV Sumber Kertas", "Mira", "Aktif"],
    ["PT Edukasi Teknologi", "Rian", "Aktif"],
    ["UD Bersih Jaya", "Sinta", "Pending update"]
  ]
};

const inventoryTransactionData = {
  metrics: [
    { value: "0", label: "Masuk bulan ini", tone: "mint" },
    { value: "0", label: "Keluar bulan ini", tone: "sand" },
    { value: "0", label: "Mutasi lokasi", tone: "sky" },
    { value: "0", label: "Penyesuaian", tone: "rose" }
  ],
  transactions: []
};

const inventoryOpnameData = {
  metrics: [
    { value: "3", label: "Sesi aktif", tone: "sky" },
    { value: "128", label: "Barang diaudit", tone: "mint" },
    { value: "9", label: "Selisih ditemukan", tone: "rose" },
    { value: "93%", label: "Akurasi awal", tone: "sand" }
  ],
  sessions: [
    ["OPN-0626-01", "Gudang ATK", "30 Jun 2026", "Nadia", "Draft"],
    ["OPN-0626-02", "Gudang Kebersihan", "29 Jun 2026", "Farhan", "Selesai"],
    ["OPN-0626-03", "Lab Komputer", "28 Jun 2026", "Rizki", "Selesai"]
  ],
  discrepancies: [
    ["Cairan Pel Lemon", "Gudang Kebersihan", "12", "6", "-6", "Barang rusak / bocor"],
    ["Mouse Wireless Logitech", "Lab Komputer", "20", "18", "-2", "Dipakai belum tercatat"],
    ["Ordner Arsip Biru", "TU", "10", "12", "+2", "Ada stok pindahan"]
  ]
};

const inventoryStorageKeys = {
  items: "reload_sarpras_items",
  categories: "reload_sarpras_categories",
  kategoriList: "reload_sarpras_kategori_list",
  locations: "reload_sarpras_locations",
  units: "reload_sarpras_units",
  suppliers: "reload_sarpras_suppliers",
  transactions: "reload_sarpras_transactions",
  opnames: "reload_sarpras_opnames",
  discrepancies: "reload_sarpras_discrepancies"
};

const inventorySyncState = {
  master: "Local browser data aktif",
  inventory: "Transaksi tersimpan di browser",
  opname: "Local browser data aktif"
};

let inventoryState = null;

function cloneInventoryData(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadInventoryStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : cloneInventoryData(fallback);
  } catch {
    return cloneInventoryData(fallback);
  }
}

function persistInventoryStore() {
  if (!inventoryState) return;
  localStorage.setItem(inventoryStorageKeys.items, JSON.stringify(inventoryState.items));
  localStorage.setItem(inventoryStorageKeys.categories, JSON.stringify(inventoryState.categories));
  localStorage.setItem(inventoryStorageKeys.kategoriList, JSON.stringify(inventoryState.kategoriList));
  localStorage.setItem(inventoryStorageKeys.locations, JSON.stringify(inventoryState.locations));
  localStorage.setItem(inventoryStorageKeys.units, JSON.stringify(inventoryState.units));
  localStorage.setItem(inventoryStorageKeys.suppliers, JSON.stringify(inventoryState.suppliers));
  localStorage.setItem(inventoryStorageKeys.transactions, JSON.stringify(inventoryState.transactions));
  localStorage.setItem(inventoryStorageKeys.opnames, JSON.stringify(inventoryState.opnames));
  localStorage.setItem(inventoryStorageKeys.discrepancies, JSON.stringify(inventoryState.discrepancies));
}

function ensureInventoryState() {
  if (inventoryState) return inventoryState;
  inventoryState = {
    items: loadInventoryStore(inventoryStorageKeys.items, inventoryMasterData.items),
    categories: loadInventoryStore(inventoryStorageKeys.categories, inventoryMasterData.categories),
    kategoriList: loadInventoryStore(inventoryStorageKeys.kategoriList, inventoryMasterData.kategoriList),
    locations: loadInventoryStore(inventoryStorageKeys.locations, inventoryMasterData.locations),
    units: loadInventoryStore(inventoryStorageKeys.units, ["pcs", "box", "rim", "liter", "kg", "pack", "lusin"]),
    suppliers: loadInventoryStore(inventoryStorageKeys.suppliers, inventoryMasterData.suppliers),
    transactions: loadInventoryStore(inventoryStorageKeys.transactions, inventoryTransactionData.transactions),
    opnames: loadInventoryStore(inventoryStorageKeys.opnames, inventoryOpnameData.sessions),
    discrepancies: loadInventoryStore(inventoryStorageKeys.discrepancies, inventoryOpnameData.discrepancies)
  };
  /* Normalize freq field — old items may not have row[6] */
  inventoryState.items.forEach((row) => {
    if (row.length < 7) row.push("0");
  });
  return inventoryState;
}

/* ── Data helpers for live overview dashboard ── */
function getTransactionTimeline() {
  const state = ensureInventoryState();
  const tx = state.transactions;
  if (!tx.length) return [];
  const byDay = {};
  let earliest = null, latest = null;
  tx.forEach((row) => {
    const day = row[2].slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
    if (!earliest || day < earliest) earliest = day;
    if (!latest || day > latest) latest = day;
  });
  const start = new Date(earliest);
  const end = new Date(latest);
  const diffDays = Math.round((end - start) / 86400000) + 1;
  const useMonthly = diffDays > 365;
  const useWeekly = diffDays > 60 && !useMonthly;
  const result = [];
  if (useMonthly) {
    const byMonth = {};
    tx.forEach((row) => {
      const m = row[2].slice(0, 7);
      byMonth[m] = (byMonth[m] || 0) + 1;
    });
    const mStart = new Date(earliest.slice(0, 7) + "-01");
    const mEnd = new Date(latest.slice(0, 7) + "-01");
    for (let d = new Date(mStart); d <= mEnd; d.setMonth(d.getMonth() + 1)) {
      const key = d.toISOString().slice(0, 7);
      result.push({ label: key, value: byMonth[key] || 0 });
    }
  } else if (useWeekly) {
    const byWeek = {};
    tx.forEach((row) => {
      const d = new Date(row[2].slice(0, 10));
      const wkStart = new Date(d);
      wkStart.setDate(d.getDate() - d.getDay());
      const key = wkStart.toISOString().slice(0, 10);
      byWeek[key] = (byWeek[key] || 0) + 1;
    });
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
      const key = d.toISOString().slice(0, 10);
      result.push({ label: key, value: byWeek[key] || 0 });
    }
  } else {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      result.push({ label: key, value: byDay[key] || 0 });
    }
  }
  return result;
}
function getTopItemsByFreq(n) {
  const state = ensureInventoryState();
  return state.items
    .filter((row) => Number(row[6]) > 0)
    .sort((a, b) => Number(b[6]) - Number(a[6]))
    .slice(0, n || 3)
    .map((row) => ({ code: row[0], name: row[1], freq: Number(row[6]) }));
}
function getFreqRanking(n) {
  const state = ensureInventoryState();
  return state.items
    .filter((row) => Number(row[6]) > 0)
    .sort((a, b) => Number(b[6]) - Number(a[6]))
    .slice(0, n || 10)
    .map((row, i) => ({ rank: i + 1, code: row[0], name: row[1], kategori: row[2] || "—", freq: Number(row[6]) }));
}
function getOverviewMetrics() {
  const state = ensureInventoryState();
  const items = state.items;
  const totalItems = items.length;
  const totalStock = items.reduce((s, r) => s + (Number(r[4]) || 0), 0);
  const kategoriSet = new Set(items.map((r) => r[2]).filter(Boolean));
  const lowStock = items.filter((r) => Number(r[4]) <= 1 && Number(r[4]) > 0).length;
  const zeroStock = items.filter((r) => Number(r[4]) === 0).length;
  return [
    { value: String(totalItems), label: "invOverviewTotalItems", tone: "mint" },
    { value: String(totalStock), label: "invOverviewTotalStock", tone: "sand" },
    { value: String(kategoriSet.size), label: "invOverviewCategories", tone: "sky" },
    { value: String(lowStock), label: "invOverviewLowStock", tone: "rose" },
    { value: String(zeroStock), label: "invOverviewZeroStock", tone: "rose" }
  ];
}

function getInventorySupabaseClient() {
  return window.authModule?.getSupabaseClient?.() || window.schoolAuth?.sb || window._sb || null;
}

let language = localStorage.getItem("schoolos_language") || "en";

const languageSelect = document.querySelector("#languageSelect");
const themeMode      = document.querySelector("#themeMode");
const themeColor     = document.querySelector("#themeColor");
const studentRows    = document.querySelector("#studentRows");
const menuToggle     = document.querySelector("#menuToggle");
const sidebar        = document.querySelector("#sidebar");

function t(key) {
  return translations[language][key] || translations.en[key] || key;
}

function refreshInventoryLanguage() {
  const invPage = document.querySelector("#inventory .module-page");
  if (!invPage) return;
  const tabMap = { "inv-overview": "invTabOverview", "inv-qrocr": "invTabQrcr", "inv-master": "invTabMaster", "inv-inventory": "invTabInventory", "inv-opname": "invTabOpname", "inv-asset": "invTabAsset", "inv-borrow": "invTabBorrow", "inv-maintenance": "invTabMaintenance", "inv-activity": "invTabActivity", "inv-reports": "invTabReports" };
  invPage.querySelectorAll("[data-invpage]").forEach((btn) => {
    const key = tabMap[btn.dataset.invpage];
    if (key) btn.textContent = t(key);
  });
  refreshInventorySubpages(invPage);
}

function applyLanguage() {
  document.documentElement.lang = language;
  languageSelect.value = language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  renderRows();
  renderSimplePages();
  enhanceStaffPage();
  /* Only call enhanceInventoryPage on the first run; language switch uses refreshInventoryLanguage */
  if (!document.querySelector("#inventory .module-page .module-subnav")) {
    enhanceInventoryPage();
  } else {
    refreshInventoryLanguage();
  }
  window.userManagementModule?.mount?.();
}

function renderRows() {
  studentRows.innerHTML = students
    .map(([name, className, guardian, fee, status]) => {
      const feeClass    = fee === "paid" ? "green" : fee === "partial" ? "yellow" : "gray";
      const statusClass = status === "active" ? "green" : "yellow";
      return `
        <tr>
          <td data-label="${t("name")}">${name}</td>
          <td data-label="${t("class")}">${className}</td>
          <td data-label="${t("guardian")}">${guardian}</td>
          <td data-label="${t("feeStatus")}"><b class="pill ${feeClass}">${t(fee)}</b></td>
          <td data-label="${t("status")}"><b class="pill ${statusClass}">${t(status)}</b></td>
          <td data-label="${t("actions")}"><button class="action-button" aria-label="${t("view")}">⋯</button></td>
        </tr>
      `;
    })
    .join("");
}

function renderSimplePages() {
  document.querySelectorAll("[data-simple-page]").forEach((section) => {
    const key = section.dataset.simplePage;
    /* Don't rebuild inventory if it has already been enhanced (subnav exists) */
    if (key === "inventory" && section.querySelector(".module-page .module-subnav")) return;
    const title    = t(`page${capitalize(key)}Title`);
    const subtitle = t(`page${capitalize(key)}Subtitle`);
    const data     = pageData[key] || pageData.students;
    const features = data.features || [];
    section.innerHTML = `
      <div class="module-page">
        <div class="page-heading module-heading">
          <div>
            <p class="eyebrow">${t("module")}</p>
            <h1>${title}</h1>
            <span>${subtitle}</span>
          </div>
          ${key !== "inventory" ? `
          <div class="module-actions">
            <button class="primary-button secondary">${t("export")}</button>
            <button class="primary-button">${t("addRecord")}</button>
          </div>` : ""}
        </div>

        <div class="module-stat-grid">
          ${data.stats
            .map(([value, label]) => `
              <article class="module-stat">
                <span>${label}</span>
                <strong>${value}</strong>
              </article>
            `)
            .join("")}
        </div>

        <div class="module-toolbar">
          <div class="module-search"><span>⌕</span><input type="search" placeholder="${t("searchPlaceholder")}" /></div>
          <select><option>All Status</option><option>${t("active")}</option><option>${t("pending")}</option></select>
          <select><option>All Scope</option><option>All</option><option>Assigned</option><option>Own</option></select>
        </div>

        <div class="module-layout">
          <section class="module-table-card">
            <div class="panel-heading">
              <h2>${title}</h2>
              <span class="module-count">${data.rows.length} records</span>
            </div>
            <div class="module-table-scroll">
              <table class="module-table">
                <thead>
                  <tr>
                    ${data.columns.map((column) => `<th>${column}</th>`).join("")}
                    <th>${t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.rows
                    .map((row) => `
                      <tr>
                        ${row.map((cell, index) => `<td>${formatModuleCell(cell, index)}</td>`).join("")}
                        <td><button class="action-button" aria-label="${t("view")}">...</button></td>
                      </tr>
                    `)
                    .join("")}
                </tbody>
              </table>
            </div>
          </section>

          <aside class="module-side-card">
            <h2>${t("quickActions")}</h2>
            <div class="module-feature-list">
              ${features.map((feature) => `<button type="button">${feature}</button>`).join("")}
            </div>
            <h2>${t("recentRecords")}</h2>
            <ul class="status-list">
              <li><span>${title} 001</span><b class="pill green">${t("active")}</b></li>
              <li><span>${title} 002</span><b class="pill yellow">${t("pending")}</b></li>
              <li><span>${title} 003</span><b class="pill green">${t("done")}</b></li>
            </ul>
          </aside>
        </div>
      </div>
    `;
  });

  enhanceStaffPage();
  if (!document.querySelector("#inventory .module-page .module-subnav")) {
    enhanceInventoryPage();
  }
}

function formatModuleCell(value, index) {
  const normalized = String(value);
  if (["Active", "Done", "Sent"].includes(normalized))
    return `<span class="module-pill good">${normalized}</span>`;
  if (["Pending", "Review", "Late"].includes(normalized))
    return `<span class="module-pill warn">${normalized}</span>`;
  if (["All", "Assigned", "Own", "Request"].includes(normalized))
    return `<span class="module-pill neutral">${normalized}</span>`;
  if (index === 0)
    return `<strong>${normalized}</strong>`;
  return normalized;
}

function enhanceStaffPage() {
  const section = document.querySelector("#staff");
  const page    = section?.querySelector(".module-page");
  const heading = page?.querySelector(".module-heading");
  if (!section || !page || !heading || page.querySelector(".module-subnav")) return;

  const overview = document.createElement("section");
  overview.id        = "staff-overview";
  overview.className = "module-subpage";

  [...page.children].forEach((child) => {
    if (child !== heading) overview.appendChild(child);
  });

  const subnav = document.createElement("div");
  subnav.className = "module-subnav";
  subnav.setAttribute("role", "tablist");
  subnav.setAttribute("aria-label", "Kepegawaian sub pages");
  subnav.innerHTML = `
    <button class="active" type="button" data-subpage="staff-overview">Overview</button>
    <button type="button" data-subpage="staff-attendance">Kehadiran</button>
  `;

  const attendance = document.createElement("section");
  attendance.id        = "staff-attendance";
  attendance.className = "module-subpage";
  attendance.hidden    = true;
  attendance.innerHTML = `
    <div class="att-page" id="attendance-app">
      <div class="att-upload-grid">
        <label class="att-upload-card" id="att-card-jpayroll">
          <input type="file" id="att-file-jpayroll" accept=".xlsx,.xls" />
          <span class="att-upload-icon">▤</span>
          <strong>JPAYROLL Attendance File</strong>
          <small>Attendance Status by Criteria Report [M1] - .xlsx</small>
          <em id="att-filename-jpayroll"></em>
        </label>
        <label class="att-upload-card" id="att-card-ket">
          <input type="file" id="att-file-ket" accept=".xlsx,.xls" />
          <span class="att-upload-icon">✎</span>
          <strong>Keterangan File <small>(optional)</small></strong>
          <small>Columns: No. Peg. | Add | Izin | Sakit | Cuti | Keterangan</small>
          <em id="att-filename-ket"></em>
        </label>
      </div>

      <div class="att-er-panel">
        <strong>Hari Efektif (ER)</strong>
        <label>Guru <input type="number" id="att-er-guru" min="1" max="31" value="18" /></label>
        <label>Karyawan <input type="number" id="att-er-karyawan" min="1" max="31" value="18" /></label>
        <label>Satpam <input type="number" id="att-er-satpam" min="1" max="31" value="24" /></label>
        <span>Periode: <b id="att-period-er">-</b></span>
      </div>

      <div class="att-preview" id="att-preview" hidden>
        <span>Parsed <strong id="att-preview-count">0</strong> employees for <strong id="att-preview-period">-</strong>.</span>
        <span id="att-preview-icc"></span>
      </div>

      <div class="att-stats" id="att-stats" hidden>
        <article><span>Total Karyawan</span><strong id="att-s-total">0</strong><small id="att-s-period">-</small></article>
        <article><span>Rata-rata Hadir</span><strong class="good" id="att-s-pct">0%</strong><small>TotR vs ER</small></article>
        <article><span>Total Tidak Hadir</span><strong class="bad" id="att-s-absen">0</strong><small>Izin / Sakit / Cuti</small></article>
        <article><span>Total Terlambat</span><strong class="warn" id="att-s-late">0</strong><small>kumulatif kejadian</small></article>
        <article><span>ICC Klarifikasi</span><strong class="orange" id="att-s-icc">0</strong><small>employees with ICC</small></article>
        <article><span>Perhatian Khusus</span><strong class="bad" id="att-s-alert">0</strong><small>absen or late</small></article>
      </div>

      <div class="att-controls" id="att-controls" hidden>
        <div class="att-tabs">
          <button class="active" type="button" data-att-tab="rekap">Per Karyawan</button>
          <button type="button" data-att-tab="unit">Per Unit</button>
          <button type="button" data-att-tab="alert">Perhatian Khusus</button>
          <button type="button" data-att-tab="icc">ICC Klarifikasi</button>
        </div>
        <div class="att-period-nav">
          <button type="button" id="att-prev-period">‹</button>
          <strong id="att-period-label">-</strong>
          <button type="button" id="att-next-period">›</button>
          <button type="button" id="att-latest-period">Latest</button>
        </div>
        <div class="att-filter-row">
          <div class="att-search"><span>⌕</span><input id="att-search" type="search" placeholder="Search employee..." /></div>
          <select id="att-unit"><option value="">All Units</option></select>
          <select id="att-stat"><option value="">All Stat.</option><option>GT</option><option>GK</option><option>KT</option><option>PT</option></select>
          <select id="att-status"><option value="">All Status</option><option value="icc">Has ICC</option><option value="alert">Perhatian Khusus</option><option value="clean">Normal</option></select>
          <button class="primary-button secondary" type="button" id="att-export">Export</button>
        </div>
      </div>

      <section class="att-table-shell">
        <div class="att-empty" id="att-empty">
          <strong>No attendance data yet</strong>
          <span>Upload the JPAYROLL file to get started. Keterangan is optional.</span>
        </div>
        <div class="att-table-scroll" id="att-table-scroll" hidden>
          <table class="att-table">
            <thead id="att-table-head"></thead>
            <tbody id="att-table-body"></tbody>
          </table>
        </div>
      </section>
      <div class="att-toast" id="att-toast"></div>
    </div>
  `;

  page.append(subnav, overview, attendance);

  const openSubpage = (id) => {
    page.querySelectorAll("[data-subpage]").forEach((button) => {
      button.classList.toggle("active", button.dataset.subpage === id);
    });
    page.querySelectorAll(".module-subpage").forEach((subpage) => {
      subpage.hidden = subpage.id !== id;
    });
  };

  page.querySelectorAll("[data-subpage]").forEach((button) => {
    button.addEventListener("click", () => openSubpage(button.dataset.subpage));
  });

  page.querySelectorAll(".module-feature-list button").forEach((button) => {
    if (button.textContent.trim().toLowerCase() === "kehadiran") {
      button.addEventListener("click", () => {
        openSubpage("staff-attendance");
        window.setTimeout(() => window.attendanceModule?.init?.(), 0);
      });
    }
  });
}

function enhanceInventoryPage() {
  loadInvTokenState();
  const section = document.querySelector("#inventory");
  const page    = section?.querySelector(".module-page");
  const heading = page?.querySelector(".module-heading");
  if (!section || !page || !heading || page.querySelector(".module-subnav")) return;
  ensureInventoryState();

  /* ── Wrap existing content into "overview" sub-page ── */
  const overview = document.createElement("section");
  overview.id        = "inv-overview";
  overview.className = "module-subpage";
  [...page.children].forEach((child) => {
    if (child !== heading) overview.appendChild(child);
  });
  overview.innerHTML = buildInventoryOverview();

  /* ── Subnav — same markup pattern as Staff ── */
  const subnav = document.createElement("div");
  subnav.className = "module-subnav";
  subnav.setAttribute("role", "tablist");
  subnav.setAttribute("aria-label", "Sarpras sub pages");
  subnav.innerHTML = `
    <button class="active" type="button" data-invpage="inv-overview">${t("invTabOverview")}</button>
    <button type="button" data-invpage="inv-qrocr">${t("invTabQrcr")}</button>
    <button type="button" data-invpage="inv-master">${t("invTabMaster")}</button>
    <button type="button" data-invpage="inv-inventory">${t("invTabInventory")}</button>
    <button type="button" data-invpage="inv-opname">${t("invTabOpname")}</button>
    <button type="button" data-invpage="inv-asset">${t("invTabAsset")}</button>
    <button type="button" data-invpage="inv-borrow">${t("invTabBorrow")}</button>
    <button type="button" data-invpage="inv-maintenance">${t("invTabMaintenance")}</button>
    <button type="button" data-invpage="inv-activity">${t("invTabActivity")}</button>
    <button type="button" data-invpage="inv-reports">${t("invTabReports")}</button>
  `;

  /* ── QR/OCR sub-page container ── */
  const qrPage = document.createElement("section");
  qrPage.id        = "inv-qrocr";
  qrPage.className = "module-subpage";
  qrPage.hidden    = true;
  qrPage.innerHTML = `
    <div class="sarpras-qr-loading" id="sarpras-qr-loading">
      <div class="qr-spinner"></div>
      <strong>Menyiapkan alat...</strong>
      <small>Memuat library QR, OCR, dan PDF scanner</small>
    </div>
  `;

  const masterPage = document.createElement("section");
  masterPage.id = "inv-master";
  masterPage.className = "module-subpage";
  masterPage.hidden = true;
  masterPage.innerHTML = buildInventoryMasterPage();

  const inventoryPage = document.createElement("section");
  inventoryPage.id = "inv-inventory";
  inventoryPage.className = "module-subpage";
  inventoryPage.hidden = true;
  inventoryPage.innerHTML = buildInventoryOperationsPage();

  const opnamePage = document.createElement("section");
  opnamePage.id = "inv-opname";
  opnamePage.className = "module-subpage";
  opnamePage.hidden = true;
  opnamePage.innerHTML = buildInventoryOpnamePage();

  const assetPage = document.createElement("section");
  assetPage.id = "inv-asset";
  assetPage.className = "module-subpage";
  assetPage.hidden = true;
  assetPage.innerHTML = buildInventoryPlaceholderPage(
    "Asset Management",
    "Pisahkan aset tetap dari stok habis pakai, lengkap dengan lokasi, PIC, status, dan dasar depresiasi garis lurus.",
    ["Kode asset", "Serial number", "Tanggal beli", "Lokasi dan PIC", "Status aktif / dipinjam / rusak"]
  );

  const borrowPage = document.createElement("section");
  borrowPage.id = "inv-borrow";
  borrowPage.className = "module-subpage";
  borrowPage.hidden = true;
  borrowPage.innerHTML = buildInventoryPlaceholderPage(
    "Peminjaman",
    "Untuk barang atau asset yang kembali lagi ke lokasi asal, termasuk kasus reparasi ke vendor.",
    ["Nomor peminjaman", "Peminjam", "Tujuan dipinjam / reparasi", "Status kembali", "Bukti PDF"]
  );

  const maintenancePage = document.createElement("section");
  maintenancePage.id = "inv-maintenance";
  maintenancePage.className = "module-subpage";
  maintenancePage.hidden = true;
  maintenancePage.innerHTML = buildInventoryPlaceholderPage(
    "Jadwal Maintenance",
    "Menjaga asset rutin diperiksa dengan interval bulanan sampai tahunan dan otomatis masuk ke riwayat aktivitas.",
    ["Nomor jadwal", "Asset", "Vendor", "Interval", "Tanggal berikutnya"]
  );

  const activityPage = document.createElement("section");
  activityPage.id = "inv-activity";
  activityPage.className = "module-subpage";
  activityPage.hidden = true;
  activityPage.innerHTML = buildInventoryPlaceholderPage(
    t("invActPlaceholderTitle"),
    t("invActPlaceholderDesc"),
    t("invActPlaceholderScope").split(", ")
  );

  const reportPage = document.createElement("section");
  reportPage.id = "inv-reports";
  reportPage.className = "module-subpage";
  reportPage.hidden = true;
  reportPage.innerHTML = buildInventoryReportsPage();

  page.append(subnav, overview, qrPage, masterPage, inventoryPage, opnamePage, assetPage, borrowPage, maintenancePage, activityPage, reportPage);

  /* ── Toast & loading overlay ── */
  const toastEl = document.createElement("div");
  toastEl.className = "sarpras-toast";
  toastEl.id = "sarpras-toast";
  page.append(toastEl);

  const loadingEl = document.createElement("div");
  loadingEl.className = "sarpras-loading";
  loadingEl.id = "sarpras-loading";
  loadingEl.style.display = "none";
  loadingEl.innerHTML = '<div><div class="sarpras-spinner"></div><span>Menyimpan data ke database...</span></div>';
  page.append(loadingEl);

  /* ── Tab switching ── */
  let qrMounted = false;

  const openInvPage = (id) => {
    page.querySelectorAll("[data-invpage]").forEach((b) => {
      b.classList.toggle("active", b.dataset.invpage === id);
    });
    page.querySelectorAll(".module-subpage").forEach((s) => {
      s.hidden = s.id !== id;
    });

    if (id === "inv-qrocr" && !qrMounted) {
      window.inventoryQROCR.loadDeps()
        .then(() => {
          qrMounted = true;
          window.inventoryQROCR.mount(qrPage);
        })
        .catch((err) => {
          qrPage.innerHTML = `
            <div class="sarpras-qr-loading">
              <strong style="color:var(--due-text)">Gagal memuat library.</strong>
              <small>${err.message}</small>
            </div>`;
        });
    }
    if (id === "inv-activity") {
      const ap = page.querySelector("#inv-activity");
      if (ap) ap.innerHTML = buildInventoryActivityPage();
    }
  };

  page.querySelectorAll("[data-invpage]").forEach((b) => {
    b.addEventListener("click", () => openInvPage(b.dataset.invpage));
  });

  /* ── Wire "QR / OCR" quick-action button in Overview sidebar ── */
  page.querySelectorAll("[data-inv-target]").forEach((button) => {
    const target = button.dataset.invTarget;
    if (target) button.addEventListener("click", () => openInvPage(target));
  });

  /* Build all subpages on load */
  refreshInventorySubpages(page);

  bindInventoryWorkspace(page);
}

function bindInventoryWorkspace(page) {
  if (page.dataset.sarprasBound === "true") return;
  page.dataset.sarprasBound = "true";

  page.addEventListener("click", async (event) => {
    if (event.target.id === "sarpras-master-modal") {
      event.target.style.display = "none";
      return;
    }
    if (event.target.id === "sarpras-master-pageprev" && masterCurrentPage > 1) {
      masterCurrentPage--;
      refreshInventorySubpages(page);
      return;
    }
    if (event.target.id === "sarpras-master-pagenext") {
      const total = ensureInventoryState().items.length;
      const pages = Math.ceil(total / masterPageSize) || 1;
      if (masterCurrentPage < pages) {
        masterCurrentPage++;
        refreshInventorySubpages(page);
      }
      return;
    }
    if (event.target.id === "sarpras-activity-pageprev" && invActivityCurrentPage > 1) {
      invActivityCurrentPage--;
      refreshInventorySubpages(page);
      return;
    }
    if (event.target.id === "sarpras-activity-pagenext") {
      const total = ensureInventoryState().transactions.length;
      const pages = Math.ceil(total / invActivityPageSize) || 1;
      if (invActivityCurrentPage < pages) {
        invActivityCurrentPage++;
        refreshInventorySubpages(page);
      }
      return;
    }
    if (event.target.id === "sarpras-confirm-modal") {
      event.target.style.display = "none";
      return;
    }
    if (event.target.id === "sarpras-confirm-modal-close") {
      document.getElementById("sarpras-confirm-modal").style.display = "none";
      setTimeout(() => {
        const scanner = document.getElementById("sarpras-scanner");
        if (scanner) scanner.focus();
      }, 0);
      return;
    }
    const actionButton = event.target.closest("[data-sarpras-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.sarprasAction;
    const index = Number(actionButton.dataset.index || -1);

    if (action === "master-load") await loadMasterFromSupabase(page);
    if (action === "master-save") {
      if (!confirm("Peringatan: Semua data di database (master item, kategori, transaksi) akan diganti dengan data saat ini. Lanjutkan?")) return;
      await saveMasterToSupabase(page);
    }
    if (action === "inventory-load") await loadInventoryFromSupabase(page);
    if (action === "inventory-save") await saveInventoryToSupabase(page);
    if (action === "opname-load") await loadOpnameFromSupabase(page);
    if (action === "opname-save") await saveOpnameToSupabase(page);

    /* ── Activity page ── */
    if (action === "activity-filter") {
      invActivityFilter = actionButton.dataset.value || "semua";
      invActivityCurrentPage = 1;
      refreshInventorySubpages(page);
    }
    if (action === "activity-clear") {
      if (!confirm(t("invActClearConfirm"))) return;
      const st = ensureInventoryState();
      st.transactions = [];
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "activity-export") {
      exportActivityExcel();
    }
    /* ── Reports page ── */
    if (action === "report-set-type") {
      invReportType = actionButton.dataset.value || "bulanan";
      refreshInventorySubpages(page);
    }
    if (action === "report-generate") {
      const monthSel = page.querySelector("[data-sarpras-input='report-month']");
      const yearSel = page.querySelector("[data-sarpras-input='report-year']");
      if (monthSel) invReportMonth = Number(monthSel.value);
      if (yearSel) invReportYear = Number(yearSel.value);
      refreshInventorySubpages(page);
    }
    if (action === "report-export") {
      if (!confirm(t("invRepConfirmLoad"))) return;
      exportReportExcel();
    }
    if (action === "report-set-subtab") {
      invReportSubTab = actionButton.dataset.value || "ledger";
      refreshInventorySubpages(page);
    }
    if (action === "report-export-card") {
      if (!confirm(t("invRepConfirmLoad"))) return;
      exportStockCardExcel(invStockCardCode);
    }
    if (action === "report-export-all-cards") {
      if (!confirm(t("invRepConfirmLoad"))) return;
      exportAllStockCardsExcel();
    }
    if (action === "toggle-tx-detail") {
      const idx = Number(actionButton.dataset.index);
      const detailRow = page.querySelector(`tr.tx-detail-row[data-parent="${idx}"]`);
      const toggleBtn = actionButton;
      if (detailRow) {
        const isHidden = detailRow.style.display === "none";
        detailRow.style.display = isHidden ? "table-row" : "none";
        toggleBtn.textContent = isHidden ? "▼" : "▶";
      }
    }

    /* ── Inventory operations ── */
    if (action === "set-transaction-type") {
      invTransactionType = actionButton.dataset.value || "masuk";
      refreshInventorySubpages(page);
      setTimeout(() => {
        const scanner = document.getElementById("sarpras-scanner");
        if (scanner) scanner.focus();
      }, 0);
      return;
    }

    if (action === "inventory-token-toggle") {
      invTokenVisible = !invTokenVisible;
      const input = document.querySelector("[data-sarpras-input='inventory-token']");
      if (input) input.type = invTokenVisible ? "text" : "password";
      actionButton.textContent = invTokenVisible ? "🙈" : "👁";
      setTimeout(() => {
        const scanner = document.getElementById("sarpras-scanner");
        if (scanner) scanner.focus();
      }, 0);
      return;
    }

    if (action === "inventory-remove-order" && index >= 0 && index < invCurrentOrder.length) {
      invCurrentOrder.splice(index, 1);
      refreshInventorySubpages(page);
      setTimeout(() => {
        const scanner = document.getElementById("sarpras-scanner");
        if (scanner) scanner.focus();
      }, 0);
      return;
    }

    if (action === "inventory-clear-order") {
      invCurrentOrder = [];
      refreshInventorySubpages(page);
      setTimeout(() => {
        const scanner = document.getElementById("sarpras-scanner");
        if (scanner) scanner.focus();
      }, 0);
      return;
    }

    if (action === "inventory-confirm") {
      const tokenRaw = invToken;
      if (!tokenRaw || tokenRaw.length !== 6 || !/^\d{6}$/.test(tokenRaw)) {
        inventoryToast("Token harus 6 digit angka.");
        return;
      }
      if (invCurrentOrder.length === 0) {
        inventoryToast("Belum ada barang dalam daftar.");
        return;
      }
      if (invTransactionType === "keluar") {
        const state = ensureInventoryState();
        const insufficient = [];
        const checked = new Set();
        invCurrentOrder.forEach((orderItem) => {
          if (checked.has(orderItem.code)) return;
          checked.add(orderItem.code);
          const totalOrdered = invCurrentOrder.filter((o) => o.code === orderItem.code).reduce((s, o) => s + o.qty, 0);
          const masterItem = state.items.find((row) => row[0] === orderItem.code);
          if (masterItem && Number(masterItem[4]) < totalOrdered) {
            insufficient.push(`${orderItem.code} (tersedia ${masterItem[4]}, diminta ${totalOrdered})`);
          }
        });
        if (insufficient.length > 0) {
          inventoryToast("✗ Stok tidak mencukupi: " + insufficient.join("; "));
          return;
        }
      }
      document.getElementById("sarpras-confirm-modal").style.display = "grid";
      const input = document.getElementById("sarpras-confirm-token-input");
      if (input) { input.value = ""; input.focus(); }
      return;
    }

    if (action === "remove-item" && index >= 0) {
      inventoryState.items.splice(index, 1);
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "remove-supplier" && index >= 0) {
      inventoryState.suppliers.splice(index, 1);
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "remove-transaction" && index >= 0) {
      inventoryState.transactions.splice(index, 1);
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "remove-opname" && index >= 0) {
      inventoryState.opnames.splice(index, 1);
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "remove-discrepancy" && index >= 0) {
      inventoryState.discrepancies.splice(index, 1);
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "remove-chip" && index >= 0) {
      const collection = actionButton.dataset.collection;
      if (Array.isArray(inventoryState[collection])) {
        inventoryState[collection].splice(index, 1);
        persistInventoryStore();
        refreshInventorySubpages(page);
      }
    }

    if (action === "add-item-show") {
      document.getElementById("sarpras-edit-index").value = "-1";
      document.getElementById("sarpras-master-modal-title").textContent = t("invMasterModalAdd");
      document.getElementById("sarpras-master-form").reset();
      document.getElementById("sarpras-master-modal").style.display = "grid";
    }

    if (action === "edit-item" && index >= 0) {
      const item = inventoryState.items[index];
      const form = document.getElementById("sarpras-master-form");
      form.elements["edit_index"].value = index;
      form.elements["item_code"].value = item[0];
      form.elements["item_name"].value = item[1];
      const catEntry = inventoryState.kategoriList.find(([, n]) => n === item[2]);
      form.elements["category"].value = catEntry ? catEntry[0] : "";
      form.elements["location"].value = item[3];
      form.elements["stock"].value = item[4];
      document.getElementById("sarpras-master-modal-title").textContent = t("invMasterModalEdit");
      document.getElementById("sarpras-master-modal").style.display = "grid";
    }

    if (action === "export-items") {
      exportMasterExcel();
    }

    if (action === "import-show") {
      const popup = document.getElementById("sarpras-import-popup");
      if (popup) popup.style.display = popup.style.display === "none" ? "" : "none";
    }
    if (action === "import-template") {
      downloadMasterTemplate();
      const popup = document.getElementById("sarpras-import-popup");
      if (popup) popup.style.display = "none";
    }
    if (action === "import-upload") {
      document.getElementById("sarpras-master-import")?.click();
      const popup = document.getElementById("sarpras-import-popup");
      if (popup) popup.style.display = "none";
    }

    if (action === "master-modal-close" || actionButton.id === "sarpras-master-modal-close" || actionButton.id === "sarpras-master-modal-cancel") {
      document.getElementById("sarpras-master-modal").style.display = "none";
    }
    if (action === "kategori-add-show") {
      document.getElementById("sarpras-kategori-form").reset();
      document.getElementById("sarpras-kategori-modal").style.display = "grid";
    }
    if (action === "kategori-modal-close" || actionButton.id === "sarpras-kategori-modal-close" || actionButton.id === "sarpras-kategori-modal-cancel") {
      document.getElementById("sarpras-kategori-modal").style.display = "none";
    }
    if (event.target.id === "sarpras-kategori-modal") {
      event.target.style.display = "none";
    }
  });

  /* ── Auto-generate item code on kategori select ── */
  page.addEventListener("change", (event) => {
    if (event.target.id === "sarpras-master-pagesize") {
      masterPageSize = Number(event.target.value) || 10;
      masterCurrentPage = 1;
      refreshInventorySubpages(page);
    }
  });
  page.addEventListener("change", (event) => {
    if (event.target.name === "category" && event.target.closest("#sarpras-master-form")) {
      const code = event.target.value;
      if (!code) return;
      const prefix = code + "-";
      let maxNum = 0;
      ensureInventoryState().items.forEach((row) => {
        if (row[0].startsWith(prefix)) {
          const num = parseInt(row[0].slice(prefix.length), 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      const kodeInput = document.getElementById("sarpras-master-form").elements["item_code"];
      kodeInput.value = prefix + String(maxNum + 1).padStart(3, "0");
    }
  });

  /* ── Inventory: qty change ── */
  page.addEventListener("change", (event) => {
    if (event.target.matches("[data-sarpras-action='inventory-update-qty']")) {
      const idx = Number(event.target.dataset.index);
      const val = parseInt(event.target.value, 10);
      if (!isNaN(idx) && idx >= 0 && idx < invCurrentOrder.length) {
        invCurrentOrder[idx].qty = Math.max(1, val || 1);
        event.target.value = invCurrentOrder[idx].qty;
        refreshInventorySubpages(page);
        setTimeout(() => {
          const scanner = document.getElementById("sarpras-scanner");
          if (scanner) scanner.focus();
        }, 0);
      }
    }
  });

  /* ── Close import popup on outside click ── */
  page.addEventListener("click", (event) => {
    const popup = document.getElementById("sarpras-import-popup");
    if (!popup || popup.style.display === "none") return;
    if (event.target.closest("[data-sarpras-action='import-show'], #sarpras-import-popup")) return;
    popup.style.display = "none";
  });

  page.addEventListener("input", (event) => {
    if (event.target.id === "sarpras-master-search") {
      filterMasterTable(event.target.value);
    }
    if (event.target.id === "sarpras-activity-search") {
      invActivitySearch = event.target.value;
      invActivityCurrentPage = 1;
      refreshInventorySubpages(page);
    }
  });

  page.addEventListener("change", (event) => {
    if (event.target.id === "sarpras-master-import" && event.target.files.length > 0) {
      importMasterExcel(event.target.files[0]);
      event.target.value = "";
    }
    if (event.target.id === "sarpras-activity-pagesize") {
      invActivityPageSize = Number(event.target.value) || 20;
      invActivityCurrentPage = 1;
      refreshInventorySubpages(page);
    }
    if (event.target.matches("[data-sarpras-input='stock-card-item']")) {
      invStockCardCode = event.target.value;
      refreshInventorySubpages(page);
    }
  });

  /* ── Inventory: add item on Enter ── */
  page.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const input = event.target.closest("[data-sarpras-input='inventory-item-input'], #sarpras-scanner");
      if (input) {
        event.preventDefault();
        const q = input.value.trim();
        input.value = "";
        if (!q) return;
        const state = ensureInventoryState();
        const match = state.items.find((row) => row[0].toLowerCase() === q.toLowerCase() || row[1].toLowerCase().includes(q.toLowerCase()));
        if (match) {
          invCurrentOrder.push({ code: match[0], name: match[1], qty: 1 });
          refreshInventorySubpages(page);
          setTimeout(() => {
            const scanner = document.getElementById("sarpras-scanner");
            if (scanner) scanner.focus();
          }, 0);
        } else {
          inventoryToast("✗ Item tidak ditemukan. Silakan tambah dari tab Master Barang.");
          setTimeout(() => {
            const scanner = document.getElementById("sarpras-scanner");
            if (scanner) scanner.focus();
          }, 0);
        }
      }
    }
  });

  /* ── Inventory: token input change ── */
  page.addEventListener("input", (event) => {
    if (event.target.matches("[data-sarpras-input='inventory-token']")) {
      const raw = event.target.value.replace(/\D/g, "").slice(0, 6);
      event.target.value = raw;
      invToken = raw || "000001";
      saveInvTokenState();
    }
  });

  page.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();

    if (form.id === "sarpras-confirm-form") {
      const inputVal = form.querySelector("#sarpras-confirm-token-input")?.value.trim();
      if (inputVal === invToken) {
        executeInventoryTransaction(page);
        form.reset();
        document.getElementById("sarpras-confirm-modal").style.display = "none";
      } else {
        inventoryToast("✗ Token salah. Silakan coba lagi.");
      }
      return;
    }

    if (form.dataset.sarprasForm === "master-item") {
      const formData = new FormData(form);
      const editIndex = parseInt(formData.get("edit_index") || "-1");
      const catCode = String(formData.get("category") || "").trim();
      const catName = (inventoryState.kategoriList.find(([c]) => c === catCode) || [])[1] || catCode;
      const newItem = [
        String(formData.get("item_code") || "").trim(),
        String(formData.get("item_name") || "").trim(),
        catName,
        String(formData.get("location") || "").trim(),
        String(formData.get("stock") || "0").trim(),
        nowStampWIB(),
        "0"
      ];
      if (editIndex >= 0 && editIndex < inventoryState.items.length) {
        const oldFreq = inventoryState.items[editIndex][6] || "0";
        newItem[6] = oldFreq;
        inventoryState.items[editIndex] = newItem;
      } else {
        inventoryState.items.unshift(newItem);
      }
      inventorySyncState.master = "Perubahan master tersimpan di browser";
      persistInventoryStore();
      form.reset();
      document.getElementById("sarpras-master-modal").style.display = "none";
      refreshInventorySubpages(page);
      filterMasterTable("");
    }

    if (form.dataset.sarprasForm === "master-supplier") {
      const formData = new FormData(form);
      inventoryState.suppliers.unshift([
        String(formData.get("supplier_name") || "").trim(),
        String(formData.get("supplier_pic") || "").trim(),
        String(formData.get("supplier_status") || "Aktif").trim()
      ]);
      inventorySyncState.master = "Perubahan supplier tersimpan di browser";
      persistInventoryStore();
      form.reset();
      refreshInventorySubpages(page);
    }

    if (form.dataset.sarprasForm === "master-chip") {
      const formData = new FormData(form);
      const collection = String(form.dataset.collection || "");
      const value = String(formData.get("value") || "").trim();
      if (value && Array.isArray(inventoryState[collection])) {
        inventoryState[collection].push(value);
        inventorySyncState.master = "Daftar master diperbarui di browser";
        persistInventoryStore();
        form.reset();
        refreshInventorySubpages(page);
      }
    }

    if (form.dataset.sarprasForm === "master-kategori") {
      const formData = new FormData(form);
      const code = String(formData.get("kategori_code") || "").trim().toUpperCase();
      const name = String(formData.get("kategori_name") || "").trim();
      if (code && name && !inventoryState.kategoriList.some(([c]) => c === code)) {
        inventoryState.kategoriList.push([code, name]);
        inventorySyncState.master = "Kategori baru tersimpan";
        persistInventoryStore();
        form.reset();
        document.getElementById("sarpras-kategori-modal").style.display = "none";
        refreshInventorySubpages(page);
        const catSelect = document.querySelector("#sarpras-master-form select[name='category']");
        if (catSelect) {
          const opt = document.createElement("option");
          opt.value = code;
          opt.textContent = code + " — " + name;
          catSelect.appendChild(opt);
          catSelect.value = code;
          catSelect.dispatchEvent(new Event("change"));
        }
      } else if (code && name) {
        inventoryToast("Kode kategori sudah ada");
      }
    }

    if (form.dataset.sarprasForm === "inventory-transaction") {
      const formData = new FormData(form);
      inventoryState.transactions.unshift([
        String(formData.get("transaction_no") || "").trim(),
        String(formData.get("transaction_type") || "").trim(),
        String(formData.get("transaction_date") || "").trim(),
        String(formData.get("location_route") || "").trim(),
        String(formData.get("qty_label") || "").trim(),
        String(formData.get("transaction_status") || "Draft").trim()
      ]);
      inventorySyncState.inventory = "Transaksi inventory tersimpan di browser";
      persistInventoryStore();
      form.reset();
      refreshInventorySubpages(page);
    }

    if (form.dataset.sarprasForm === "opname-session") {
      const formData = new FormData(form);
      inventoryState.opnames.unshift([
        String(formData.get("opname_no") || "").trim(),
        String(formData.get("opname_location") || "").trim(),
        String(formData.get("opname_date") || "").trim(),
        String(formData.get("opname_officer") || "").trim(),
        String(formData.get("opname_status") || "Draft").trim()
      ]);
      inventorySyncState.opname = "Sesi stock opname tersimpan di browser";
      persistInventoryStore();
      form.reset();
      refreshInventorySubpages(page);
    }

    if (form.dataset.sarprasForm === "opname-detail") {
      const formData = new FormData(form);
      inventoryState.discrepancies.unshift([
        String(formData.get("detail_item_name") || "").trim(),
        String(formData.get("detail_location_name") || "").trim(),
        String(formData.get("system_stock") || "").trim(),
        String(formData.get("physical_stock") || "").trim(),
        String(formData.get("variance_label") || "").trim(),
        String(formData.get("detail_notes") || "").trim()
      ]);
      inventorySyncState.opname = "Detail selisih tersimpan di browser";
      persistInventoryStore();
      form.reset();
      refreshInventorySubpages(page);
    }
  });
}

function refreshInventorySubpages(page) {
  const masterPage = page.querySelector("#inv-master");
  const inventoryPage = page.querySelector("#inv-inventory");
  const opnamePage = page.querySelector("#inv-opname");
  const overviewPage = page.querySelector("#inv-overview");
  const reportPage = page.querySelector("#inv-reports");
  const activityPage = page.querySelector("#inv-activity");
  if (overviewPage) overviewPage.innerHTML = buildInventoryOverview();
  if (masterPage) masterPage.innerHTML = buildInventoryMasterPage();
  if (inventoryPage) inventoryPage.innerHTML = buildInventoryOperationsPage();
  if (opnamePage) opnamePage.innerHTML = buildInventoryOpnamePage();
  if (activityPage) activityPage.innerHTML = buildInventoryActivityPage();
  if (reportPage) reportPage.innerHTML = buildInventoryReportsPage();
}

function inventoryToast(msg) {
  const el = document.getElementById("sarpras-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(inventoryToast._t);
  inventoryToast._t = setTimeout(() => el.classList.remove("show"), 3400);
}

function inventoryLoading(show, text) {
  const el = document.getElementById("sarpras-loading");
  if (!el) return;
  if (show) {
    el.querySelector("span").textContent = text || "Memproses...";
    el.style.display = "grid";
  } else {
    el.style.display = "none";
  }
}

function executeInventoryTransaction(page) {
  loadInvTokenState();
  const state = ensureInventoryState();
  const type = invTransactionType;
  const typeLabel = type === "masuk" ? "Masuk" : "Keluar";
  const direction = type === "masuk" ? 1 : -1;
  const stamp = nowStampWIB();

  /* Capture snapshot of order before mutation */
  const orderSnapshot = invCurrentOrder.map((o) => ({ ...o }));
  const currentToken = invToken;

  /* Update stock & freq for each item in order */
  orderSnapshot.forEach((orderItem) => {
    const masterItem = state.items.find((row) => row[0] === orderItem.code);
    if (masterItem) {
      const newStock = (Number(masterItem[4]) || 0) + direction * orderItem.qty;
      masterItem[4] = String(Math.max(0, newStock));
      masterItem[6] = String((Number(masterItem[6]) || 0) + 1);
      masterItem[5] = stamp;
    }
  });

  /* Create transaction record */
  const petugas = window.authModule?.getRole?.() || window.schoolAuth?.role || "—";
  const totalQty = orderSnapshot.reduce((s, o) => s + o.qty, 0);
  const itemCount = new Set(orderSnapshot.map((o) => o.code)).size;
  const orderLen = orderSnapshot.length;
  const ordersJson = JSON.stringify(orderSnapshot.map((o) => ({ code: o.code, name: o.name, qty: o.qty })));
  state.transactions.unshift([
    currentToken, typeLabel, stamp, ordersJson, String(totalQty), String(itemCount), petugas, "Selesai"
  ]);

  persistInventoryStore();

  inventoryToast(`✓ ${typeLabel} — ${orderLen} item, ${totalQty} total qty`);

  /* Reset order immediately */
  invCurrentOrder = [];
  /* Increment token */
  invToken = String(Math.min(999999, (Number(invToken) || 0) + 1)).padStart(6, "0");
  saveInvTokenState();

  /* Re-render to clear order table */
  refreshInventorySubpages(page);

  /* Auto-save to Supabase with loading overlay */
  saveSingleTransactionToSupabase(page, currentToken, typeLabel, stamp, ordersJson, totalQty, itemCount, petugas);
}

async function saveSingleTransactionToSupabase(page, token, typeLabel, stamp, ordersJson, totalQty, itemCount, petugas) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("⚠ Supabase tidak terhubung. Transaksi aman di browser. Klik Save to DB nanti.");
    inventorySyncState.inventory = "Supabase belum terhubung — transaksi tersimpan di browser saja";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, `Menyimpan transaksi ${typeLabel.toLowerCase()} ke database...`);
  try {
    const orders = JSON.parse(ordersJson);
    /* Atomic: call RPC — inserts transaction + updates stock in one DB transaction */
    const { data, error: rpcErr } = await sb.rpc("process_inventory_transaction", {
      p_token: token,
      p_type: typeLabel,
      p_date: stamp,
      p_items: orders,
      p_total_qty: totalQty,
      p_item_count: itemCount,
      p_petugas: petugas
    });
    if (rpcErr) throw rpcErr;

    inventoryLoading(false);
    inventorySyncState.inventory = `Transaksi ${typeLabel.toLowerCase()} tersimpan ke Supabase`;
    inventorySyncState.master = "Stok & frekuensi tersimpan ke Supabase";
    inventoryToast("✓ Transaksi + stok tersimpan ke database Supabase");
    console.log("saveSingleTransaction: RPC ok", data);
  } catch (err) {
    inventoryLoading(false);
    inventoryToast("⚠ Gagal menyimpan ke database: " + err.message + ". Transaksi tetap aman di browser.");
    inventorySyncState.inventory = `Gagal simpan transaksi: ${err.message}`;
    console.error("saveSingleTransaction: RPC failed", err);
  }
  refreshInventorySubpages(page);
}

async function saveMasterToSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("Supabase belum terhubung — data tetap aman di browser");
    inventorySyncState.master = "Supabase belum terhubung — data tetap aman di browser";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, "Menyimpan data ke database...");
  try {
    await Promise.all([
      sb.from("sarpras_master_items").upsert(
        inventoryState.items.map((row) => ({
          item_code: row[0], item_name: row[1], category: row[2], location: row[3], stock: Number(row[4]) || 0, timestamp: row[5] || null, freq: Number(row[6]) || 0
        })),
        { onConflict: "item_code" }
      ),
      sb.from("sarpras_kategori").upsert(
        inventoryState.kategoriList.map(([code, name]) => ({ code, name })),
        { onConflict: "code" }
      ),
      sb.from("sarpras_transactions").upsert(
        inventoryState.transactions.map((row) => ({
          token: row[0], type: row[1], date: row[2], items: typeof row[3] === "string" ? JSON.parse(row[3]) : row[3], total_qty: Number(row[4]) || 0, item_count: Number(row[5]) || 0, petugas: row[7] || "", status: row[6] || "Selesai"
        })),
        { onConflict: "token" }
      )
    ]);
    inventoryLoading(false);
    inventoryToast("✓ Semua data tersimpan ke database");
    inventorySyncState.master = "Master tersimpan ke Supabase (upsert)";
    inventorySyncState.inventory = "Transaksi tersimpan ke Supabase";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal menyimpan: " + error.message);
    inventorySyncState.master = `Gagal simpan: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function loadMasterFromSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("Supabase belum terhubung — tampilkan data browser");
    inventorySyncState.master = "Supabase belum terhubung — tampilkan data browser";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, "Memuat data dari database...");
  try {
    const [itemsRes, kategoriRes, txRes] = await Promise.all([
      sb.from("sarpras_master_items").select("*").order("item_code"),
      sb.from("sarpras_kategori").select("*").order("code"),
      sb.from("sarpras_transactions").select("*").order("date", { ascending: false })
    ]);
    if (itemsRes.error) throw itemsRes.error;
    if (kategoriRes.error) throw kategoriRes.error;
    if (txRes.error) throw txRes.error;
    inventoryState.items = (itemsRes.data || []).map((row) => [row.item_code, row.item_name, row.category, row.location || "", String(row.stock ?? 0), row.timestamp || "", String(row.freq ?? 0)]);
    inventoryState.kategoriList = (kategoriRes.data || []).map((row) => [row.code, row.name]);
    inventoryState.transactions = (txRes.data || []).map((row) => [row.token, row.type, row.date, JSON.stringify(row.items || []), String(row.total_qty ?? 0), String(row.item_count ?? 0), row.petugas || "—", row.status || "Selesai"]);
    persistInventoryStore();
    inventoryLoading(false);
    inventoryToast(`✓ ${(itemsRes.data || []).length} item + ${(txRes.data || []).length} transaksi dimuat dari database`);
    inventorySyncState.master = "Master & transaksi dimuat dari Supabase";
    inventorySyncState.inventory = "Transaksi dimuat dari Supabase";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal memuat: " + error.message);
    inventorySyncState.master = `Load Master gagal: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function saveInventoryToSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventorySyncState.inventory = "Supabase belum terhubung — transaksi tetap tersimpan di browser";
    return;
  }
  inventoryLoading(true, "Menyimpan transaksi inventory ke database...");
  try {
    await sb.from("sarpras_transactions").upsert(
      inventoryState.transactions.map((row) => ({
        token: row[0], type: row[1], date: row[2], items: typeof row[3] === "string" ? JSON.parse(row[3]) : row[3], total_qty: Number(row[4]) || 0, item_count: Number(row[5]) || 0, petugas: row[7] || "", status: row[6] || "Selesai"
      })),
      { onConflict: "token" }
    );
    inventoryLoading(false);
    inventoryToast("✓ Transaksi inventory tersimpan ke database");
    inventorySyncState.inventory = "Transaksi inventory tersimpan ke Supabase (upsert)";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal menyimpan transaksi: " + error.message);
    inventorySyncState.inventory = `Gagal simpan transaksi: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function loadInventoryFromSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("Supabase belum terhubung — tampilkan data browser");
    inventorySyncState.inventory = "Supabase belum terhubung — tampilkan data browser";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, "Memuat transaksi inventory dari database...");
  try {
    const { data, error } = await sb.from("sarpras_transactions").select("*").order("date", { ascending: false });
    if (error) throw error;
    inventoryState.transactions = (data || []).map((row) => [row.token, row.type, row.date, JSON.stringify(row.items || []), String(row.total_qty ?? 0), String(row.item_count ?? 0), row.petugas || "—", row.status || "Selesai"]);
    persistInventoryStore();
    inventoryLoading(false);
    inventoryToast(`✓ ${(data || []).length} transaksi dimuat dari database`);
    inventorySyncState.inventory = "Transaksi inventory dimuat dari Supabase";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal memuat transaksi: " + error.message);
    inventorySyncState.inventory = `Load transaksi gagal: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function saveOpnameToSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("Supabase belum terhubung — data opname tetap tersimpan di browser");
    inventorySyncState.opname = "Supabase belum terhubung — data opname tetap tersimpan di browser";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, "Menyimpan stock opname ke database...");
  try {
    await sb.from("sarpras_stock_opnames").upsert(
      inventoryState.opnames.map((row) => ({
        opname_no: row[0], location_name: row[1], opname_date: row[2], officer_name: row[3], status: row[4]
      })),
      { onConflict: "opname_no" }
    );
    await sb.from("sarpras_stock_opname_details").upsert(
      inventoryState.discrepancies.map((row, index) => ({
        detail_key: `${row[0]}-${row[1]}-${index}`,
        item_name: row[0], location_name: row[1], system_stock: row[2], physical_stock: row[3], variance_label: row[4], notes: row[5]
      })),
      { onConflict: "detail_key" }
    );
    inventoryLoading(false);
    inventoryToast("✓ Stock opname tersimpan ke database");
    inventorySyncState.opname = "Stock opname tersimpan ke Supabase (upsert)";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal menyimpan stock opname: " + error.message);
    inventorySyncState.opname = `Gagal simpan opname: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function loadOpnameFromSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("Supabase belum terhubung — tampilkan data browser");
    inventorySyncState.opname = "Supabase belum terhubung — tampilkan data browser";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, "Memuat stock opname dari database...");
  try {
    const [opnamesRes, detailsRes] = await Promise.all([
      sb.from("sarpras_stock_opnames").select("*").order("opname_date", { ascending: false }),
      sb.from("sarpras_stock_opname_details").select("*")
    ]);
    if (opnamesRes.error) throw opnamesRes.error;
    if (detailsRes.error) throw detailsRes.error;
    inventoryState.opnames = (opnamesRes.data || []).map((row) => [row.opname_no, row.location_name, row.opname_date, row.officer_name, row.status || "Draft"]);
    inventoryState.discrepancies = (detailsRes.data || []).map((row) => [row.item_name, row.location_name, row.system_stock, row.physical_stock, row.variance_label, row.notes || ""]);
    persistInventoryStore();
    inventoryLoading(false);
    inventoryToast(`✓ ${(opnamesRes.data || []).length} sesi opname dimuat dari database`);
    inventorySyncState.opname = "Stock opname dimuat dari Supabase";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal memuat opname: " + error.message);
    inventorySyncState.opname = `Load opname gagal: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

function buildInventoryOverview() {
  const metrics = getOverviewMetrics();
  const timeline = getTransactionTimeline();
  const topItems = getTopItemsByFreq(3);
  const freqRanking = getFreqRanking(10);
  const isEmpty = !timeline.length && !topItems.length;

  return `
    <section class="sarpras-overview">
      <article class="sarpras-hero panel-card">
        <div>
          <p class="eyebrow">Sarpras workspace</p>
          <h2>${t("invTabOverview")}</h2>
          <span>${t("invOverviewNoData")}</span>
        </div>
        <div class="sarpras-hero-actions">
          <button type="button" class="primary-button" data-inv-target="inv-master">${t("invTabMaster")}</button>
          <button type="button" class="primary-button secondary" data-inv-target="inv-inventory">${t("invTabInventory")}</button>
          <button type="button" class="primary-button secondary" data-inv-target="inv-activity">${t("invTabActivity")}</button>
        </div>
      </article>

      <div class="sarpras-metric-grid">
        ${metrics.map((item) => `
          <article class="sarpras-metric sarpras-metric-${item.tone}">
            <span>${t(item.label)}</span>
            <strong>${item.value}</strong>
          </article>
        `).join("")}
      </div>

      <div class="sarpras-charts-grid">
        <section class="panel-card sarpras-chart-card">
          <div class="panel-heading">
            <h2>${t("invOverviewTransactionChart")}</h2>
            <span>${timeline.length ? timeline[0].label + " — " + timeline[timeline.length - 1].label : ""}</span>
          </div>
          <div class="sarpras-chart-wrap">
            ${isEmpty ? `<div class="sarpras-chart-empty">${t("invOverviewNoData")}</div>` : buildLineChartSVG(timeline, { lineColor: "var(--accent)", fillColor: "var(--accent)", width: 600, height: 220 })}
          </div>
        </section>

        <section class="panel-card sarpras-chart-card">
          <div class="panel-heading">
            <h2>${t("invOverviewTopItems")}</h2>
          </div>
          <div class="sarpras-chart-wrap">
            ${isEmpty ? `<div class="sarpras-chart-empty">${t("invOverviewNoData")}</div>` : buildBarChartSVG(topItems, { barColor: "var(--accent)", width: 260, height: 180 })}
          </div>
        </section>
      </div>

      <div class="sarpras-layout">
        <section class="table-panel sarpras-table-panel">
          <div class="panel-heading">
            <div>
              <h2>${t("invOverviewFreqRanking")}</h2>
            </div>
          </div>
          <div class="module-table-scroll">
            <table class="module-table sarpras-table">
              <thead>
                <tr>
                  <th>${t("invOverviewRank")}</th>
                  <th>${t("invOverviewCode")}</th>
                  <th>${t("invOverviewName")}</th>
                  <th>${t("invOverviewCategory")}</th>
                  <th>${t("invOverviewFreq")}</th>
                </tr>
              </thead>
              <tbody>
                ${freqRanking.length ? freqRanking.map((row) => `
                  <tr>
                    <td><strong>#${row.rank}</strong></td>
                    <td>${row.code}</td>
                    <td>${row.name}</td>
                    <td>${row.kategori}</td>
                    <td><b>${row.freq}</b></td>
                  </tr>
                `).join("") : `
                  <tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem">${t("invOverviewNoData")}</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </section>

        <aside class="sarpras-side-stack">
          <section class="panel-card sarpras-shortcuts-card">
            <div class="panel-heading">
              <h2>${t("invOverviewQuickActions")}</h2>
            </div>
            <div class="module-feature-list">
              <button type="button" data-inv-target="inv-master">${t("invTabMaster")}</button>
              <button type="button" data-inv-target="inv-inventory">${t("invTabInventory")}</button>
              <button type="button" data-inv-target="inv-activity">${t("invTabActivity")}</button>
              <button type="button" data-inv-target="inv-reports">${t("invTabReports")}</button>
              <button type="button" data-inv-target="inv-qrocr">${t("invTabQrcr")}</button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  `;
}

/* ══════════════════════════════════════════════════════════════
   SVG Chart Builders
   Zero-dependency inline SVG for the overview dashboard.
   ══════════════════════════════════════════════════════════════ */
function buildLineChartSVG(data, opts) {
  const w = opts.width || 600, h = opts.height || 220;
  const pad = { t: 20, r: 20, b: 30, l: 50 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const values = data.map((d) => d.value);
  const maxV = Math.max(...values, 1);
  const niceMax = Math.ceil(maxV / 5) * 5 || 5;
  const ySteps = 5;
  const xMin = 0, xMax = data.length - 1;

  const toX = (i) => pad.l + (i / xMax) * cw;
  const toY = (v) => pad.t + ch - (v / niceMax) * ch;

  const gridLines = [];
  for (let i = 0; i <= ySteps; i++) {
    const y = pad.t + (ch / ySteps) * i;
    const val = niceMax - (niceMax / ySteps) * i;
    gridLines.push(`<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="var(--line)" stroke-width="1" opacity="0.3"/>`);
    gridLines.push(`<text x="${pad.l - 6}" y="${y + 4}" text-anchor="end" fill="var(--muted)" font-size="10">${val}</text>`);
  }

  const pts = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");
  const polyline = `<polyline fill="none" stroke="${opts.lineColor || "var(--accent)"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/>`;

  const area = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.value)}`).join(" ") + ` L${toX(data.length - 1)},${pad.t + ch} L${pad.l},${pad.t + ch} Z`;
  const areaFill = `<path d="${area}" fill="${opts.fillColor || "var(--accent)"}" opacity="0.15"/>`;

  const xLabels = [];
  const labelStep = Math.max(1, Math.floor(data.length / 8));
  data.forEach((d, i) => {
    if (i % labelStep === 0 || i === data.length - 1) {
      const label = d.label.length > 7 ? d.label.slice(5) : d.label;
      xLabels.push(`<text x="${toX(i)}" y="${h - pad.b + 16}" text-anchor="${i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}" fill="var(--muted)" font-size="9">${label}</text>`);
    }
  });

  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block" role="img" aria-label="Transaction volume chart">
    ${gridLines.join("")}
    ${areaFill}
    ${polyline}
    ${xLabels.join("")}
  </svg>`;
}

function buildBarChartSVG(items, opts) {
  const w = opts.width || 260, h = opts.height || 180;
  const pad = { t: 10, r: 10, b: 10, l: 10 };
  const barH = 34;
  const gap = 10;
  const totalH = items.length * (barH + gap) - gap;
  const svgH = Math.max(h, totalH + pad.t + pad.b);
  const cw = w - pad.l - pad.r;
  const maxFreq = Math.max(...items.map((i) => i.freq), 1);

  const bars = items.map((item, i) => {
    const y = pad.t + i * (barH + gap);
    const bw = (item.freq / maxFreq) * cw;
    return `
      <rect x="${pad.l}" y="${y}" width="${Math.max(bw, 4)}" height="${barH}" rx="4" fill="${opts.barColor || "var(--accent)"}" opacity="0.8"/>
      <text x="${pad.l + 6}" y="${y + barH / 2 + 4}" fill="#fff" font-size="11" font-weight="600">${item.name.length > 18 ? item.name.slice(0, 16) + "…" : item.name}</text>
      <text x="${pad.l + bw - 4}" y="${y + barH / 2 + 4}" text-anchor="end" fill="#fff" font-size="11" font-weight="700">${item.freq}</text>
    `;
  });

  return `<svg viewBox="0 0 ${w} ${svgH}" style="width:100%;height:auto;display:block" role="img" aria-label="Top items chart">
    ${bars.join("")}
  </svg>`;
}

function filterMasterTable(q) {
  const tbody = document.getElementById("sarpras-master-tbody");
  if (!tbody) return;
  const state = ensureInventoryState();
  const query = q.toLowerCase();
  const indexed = state.items.map((row, i) => ({ row, i }));
  const filtered = query ? indexed.filter(({ row }) => row.some((c) => String(c).toLowerCase().includes(query))) : indexed;
  const total = filtered.length;
  const pages = Math.ceil(total / masterPageSize) || 1;
  if (masterCurrentPage > pages) masterCurrentPage = pages;
  const start = (masterCurrentPage - 1) * masterPageSize;
  const page = filtered.slice(start, start + masterPageSize);
  tbody.innerHTML = page.length === 0
    ? `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:2rem">${t("invMasterEmpty")}</td></tr>`
    : page.map(({ row, i }) => `
      <tr>
        <td><strong>${row[0]}</strong></td>
        <td>${row[1]}</td>
        <td>${row[2]}</td>
        <td>${row[3]}</td>
        <td>${row[4]}</td>
        <td style="text-align:center;font-weight:600">${row[6] || "0"}</td>
        <td style="white-space:nowrap;font-size:0.78rem;color:var(--muted)">${row[5] || "—"}</td>
        <td>
          <button type="button" class="action-button" data-sarpras-action="edit-item" data-index="${i}" title="${t("invMasterEdit")}">✎</button>
          <button type="button" class="action-button" data-sarpras-action="remove-item" data-index="${i}" title="${t("invMasterDelete")}" style="color:var(--due-text)">✕</button>
        </td>
      </tr>
    `).join("");
}

function exportMasterExcel() {
  const state = ensureInventoryState();
  const data = state.items.map((r) => ({ Kode: r[0], "Nama Barang": r[1], Kategori: r[2], Location: r[3], Stock: r[4], "Time Stamp": r[5] || "", Frekuensi: r[6] || "0" }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Master Barang");
  XLSX.writeFile(wb, "master-barang.xlsx");
}

function downloadMasterTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([["Kode", "Nama Barang", "Kategori", "Location", "Stock"]]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Master Barang");
  XLSX.writeFile(wb, "template-master-barang.xlsx");
}

function importMasterExcel(file) {
  inventoryLoading(true, "Membaca file Excel...");
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const state = ensureInventoryState();
      state.items = [];
      let count = 0;
      rows.forEach((r) => {
        const kode = String(r.Kode || "").trim();
        if (kode) { state.items.push([kode, String(r["Nama Barang"] || r.Nama_Barang || "").trim(), String(r.Kategori || "").trim(), String(r.Location || "").trim(), String(r.Stock ?? "0").trim(), String(r["Time Stamp"] || r.Time_Stamp || r.timestamp || nowStampWIB()).trim(), "0"]); count++; }
      });
      persistInventoryStore();
      inventoryLoading(false);
      inventoryToast(`✓ ${count} ${t("invMasterImportSuccess")}`);
      refreshInventorySubpages(document.querySelector("#inventory"));
    } catch (err) {
      inventoryLoading(false);
      inventoryToast(`✗ ${t("invMasterImportFail")}: ${err.message}`);
    }
  };
  reader.onerror = function () {
    inventoryLoading(false);
    inventoryToast(`✗ ${t("invMasterReadFail")}`);
  };
  reader.readAsArrayBuffer(file);
}

function exportActivityExcel() {
  const state = ensureInventoryState();
  if (state.transactions.length === 0) { inventoryToast(`✗ ${t("invMasterImportFail")}`); return; }
  const data = state.transactions.map((row) => {
    const items = (() => { try { return JSON.parse(row[3]); } catch { return []; } })();
    return {
      Token: row[0],
      Tipe: row[1],
      Tanggal: row[2],
      "Total Qty": Number(row[4]),
      "Jumlah Item": Number(row[5]),
      Petugas: row[7] || "—",
      Status: row[6],
      "Detail Barang": items.map((i) => `${i.code} ${i.name} (${i.qty})`).join("; ")
    };
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Riwayat");
  XLSX.writeFile(wb, "riwayat-transaksi-sarpras.xlsx");
  inventoryToast(`✓ ${data.length} ${t("invActExportDone")}`);
}

function exportReportExcel() {
  const data = buildReportData(invReportType, invReportYear, invReportMonth);
  const { rows, periods, type } = data;
  const aoa = [];
  const h1 = [t("invRepNo"), t("invRepCategory"), t("invRepCode"), t("invRepName"), t("invRepStockAwal")];
  periods.forEach(() => { h1.push(t("invRepMasuk"), t("invRepKeluar")); });
  h1.push(t("invRepTotalMasuk"), t("invRepTotalKeluar"), t("invRepSisaStock"));
  aoa.push(h1);
  aoa.push(Array.from({ length: h1.length }, () => ""));
  rows.forEach((r) => {
    const row = [r.idx + 1, r.kategori, r.code, r.name, r.stockAwal];
    r.periodData.forEach((p) => row.push(p.masuk || 0, p.keluar || 0));
    row.push(r.totalMasuk, r.totalKeluar, r.sisaStock);
    aoa.push(row);
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const merges = [];
  let ci = 5;
  periods.forEach(() => { merges.push({ s: { r: 0, c: ci }, e: { r: 0, c: ci + 1 } }); ci += 2; });
  if (merges.length) ws["!merges"] = merges;
  ws["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 14 }, { wch: 24 }, { wch: 11 }];
  ws["!cols"].push(...periods.flatMap(() => [{ wch: 7 }, { wch: 7 }]));
  ws["!cols"].push({ wch: 11 }, { wch: 11 }, { wch: 11 });
  const wb = XLSX.utils.book_new();
  const sheetName = type === "bulanan" ? t("invRepMonthly") : type === "tahunan-3" ? t("invRepQuarterly") : t("invRepTahapan");
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `laporan-${type}-${invReportYear}-${String(invReportMonth).padStart(2, "0")}.xlsx`);
  inventoryToast(`✓ ${t("invActExportDone")}`);
}

function exportStockCardExcel(code) {
  const movements = getItemStockCard(code);
  const state = ensureInventoryState();
  const item = state.items.find((r) => r[0] === code);
  const aoa = [[t("invRepNo"), t("invRepDate"), t("invRepType"), t("invRepIn"), t("invRepOut"), t("invRepBalance"), t("invRepToken"), t("invRepCardOf")]];
  movements.forEach((m, i) => {
    aoa.push([i + 1, m.date.slice(0, 10), m.type, m.type === "Masuk" ? m.qty : 0, m.type === "Masuk" ? 0 : m.qty, m.balance, m.token, m.officer]);
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, code);
  XLSX.writeFile(wb, `kartu-stok-${code}.xlsx`);
  inventoryToast(`✓ ${t("invActExportDone")}`);
}

function exportAllStockCardsExcel() {
  const state = ensureInventoryState();
  const items = state.items;
  const wb = XLSX.utils.book_new();
  items.forEach((row) => {
    const code = row[0];
    const movements = getItemStockCard(code);
    const aoa = [[t("invRepNo"), t("invRepDate"), t("invRepType"), t("invRepIn"), t("invRepOut"), t("invRepBalance"), t("invRepToken"), t("invRepCardOf")]];
    if (!movements.length) {
      aoa.push([t("invRepCardNoTx")]);
    } else {
      movements.forEach((m, i) => {
        aoa.push([i + 1, m.date.slice(0, 10), m.type, m.type === "Masuk" ? m.qty : 0, m.type === "Masuk" ? 0 : m.qty, m.balance, m.token, m.officer]);
      });
    }
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, code.slice(0, 31));
  });
  XLSX.writeFile(wb, `kartu-stok-semua-barang.xlsx`);
  inventoryToast(`✓ ${t("invActExportDone")}`);
}

function buildInventoryMasterPage() {
  const state = ensureInventoryState();
  const query = document.getElementById("sarpras-master-search")?.value || "";
  const q = query.toLowerCase();
  const indexed = state.items.map((row, i) => ({ row, i }));
  const filtered = q ? indexed.filter(({ row }) => row.some((c) => String(c).toLowerCase().includes(q))) : indexed;
  const total = filtered.length;
  const pages = Math.ceil(total / masterPageSize) || 1;
  if (masterCurrentPage > pages) masterCurrentPage = pages;
  const start = (masterCurrentPage - 1) * masterPageSize;
  const page = filtered.slice(start, start + masterPageSize);

  const rows = page.length === 0
    ? `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:2rem">${t("invMasterEmpty")}</td></tr>`
    : page.map(({ row, i }) => `
      <tr>
        <td><strong>${row[0]}</strong></td>
        <td>${row[1]}</td>
        <td>${row[2]}</td>
        <td>${row[3]}</td>
        <td>${row[4]}</td>
        <td style="text-align:center;font-weight:600">${row[6] || "0"}</td>
        <td style="white-space:nowrap;font-size:0.78rem;color:var(--muted)">${row[5] || "—"}</td>
        <td>
          <button type="button" class="action-button" data-sarpras-action="edit-item" data-index="${i}" title="${t("invMasterEdit")}">✎</button>
          <button type="button" class="action-button" data-sarpras-action="remove-item" data-index="${i}" title="${t("invMasterDelete")}" style="color:var(--due-text)">✕</button>
        </td>
      </tr>
    `).join("");

  const paginationHtml = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:0.75rem 1rem;border-top:1px solid var(--line);font-size:0.82rem">
      <span style="color:var(--muted)">${total} ${t("invMasterData")}</span>
      <div style="display:flex;align-items:center;gap:0.75rem">
        <label style="display:flex;align-items:center;gap:0.4rem;color:var(--muted)">
          ${t("invMasterShow")}
          <select id="sarpras-master-pagesize" style="min-height:2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft)">
            ${[10, 20, 50, 100, 1000].map(s => `<option value="${s}"${s === masterPageSize ? " selected" : ""}>${s}</option>`).join("")}
          </select>
        </label>
        <div style="display:flex;align-items:center;gap:0.25rem">
          <button type="button" class="action-button" id="sarpras-master-pageprev" ${masterCurrentPage <= 1 ? "disabled" : ""} style="padding:0.25rem 0.6rem">‹</button>
          <span style="white-space:nowrap;color:var(--muted)">${masterCurrentPage}/${pages}</span>
          <button type="button" class="action-button" id="sarpras-master-pagenext" ${masterCurrentPage >= pages ? "disabled" : ""} style="padding:0.25rem 0.6rem">›</button>
        </div>
      </div>
    </div>
  `;

  return `
    <section class="sarpras-overview">
      <div class="module-toolbar" style="margin-bottom:0.85rem;position:relative">
        <div class="module-search"><span>⌕</span><input id="sarpras-master-search" type="search" placeholder="${t("invMasterSearch")}" /></div>
        <button type="button" class="primary-button" data-sarpras-action="add-item-show">${t("invMasterAdd")}</button>
        <button type="button" class="primary-button secondary" data-sarpras-action="export-items">${t("invMasterExport")}</button>
        <button type="button" class="primary-button secondary" data-sarpras-action="import-show">${t("invMasterImport")}</button>
        <div style="width:1px;height:1.8rem;background:var(--line);margin:0 0.25rem"></div>
        <button type="button" class="primary-button secondary" data-sarpras-action="master-save" style="font-size:0.78rem">${t("invMasterSave")}</button>
        <button type="button" class="primary-button secondary" data-sarpras-action="master-load" style="font-size:0.78rem">${t("invMasterLoad")}</button>
        <div id="sarpras-import-popup" style="display:none;position:absolute;top:100%;right:0;z-index:60;min-width:13rem;margin-top:0.25rem;padding:0.5rem;border:1px solid var(--line);border-radius:0.75rem;background:var(--surface);box-shadow:var(--shadow)">
          <button type="button" class="primary-button" data-sarpras-action="import-template" style="width:100%;justify-content:flex-start;padding:0.6rem 0.85rem;border:none;border-radius:0.5rem;color:var(--text);background:transparent;cursor:pointer;font-size:0.82rem;text-align:left">↓ ${t("invMasterTemplate")}</button>
          <button type="button" class="primary-button" data-sarpras-action="import-upload" style="width:100%;justify-content:flex-start;padding:0.6rem 0.85rem;border:none;border-radius:0.5rem;color:var(--text);background:transparent;cursor:pointer;font-size:0.82rem;text-align:left">📂 ${t("invMasterUpload")}</button>
        </div>
        <input type="file" id="sarpras-master-import" accept=".xlsx,.xls" style="display:none" />
      </div>

      <div class="table-panel" style="padding:0;position:relative">
        <div class="responsive-table">
          <table class="module-table">
            <thead>
              <tr>
                <th>${t("invMasterCode")}</th>
                <th>${t("invMasterName")}</th>
                <th>${t("invMasterCategory")}</th>
                <th>${t("invMasterLocation")}</th>
                <th>${t("invMasterStock")}</th>
                <th>${t("invMasterFreq")}</th>
                <th>${t("invMasterTimestamp")}</th>
                <th style="width:5rem">${t("invMasterActions")}</th>
              </tr>
            </thead>
            <tbody id="sarpras-master-tbody">
              ${rows}
            </tbody>
          </table>
        </div>
        ${paginationHtml}
        <div style="padding:0.5rem 1rem;border-top:1px solid var(--line);font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:0.5rem">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${inventorySyncState.master.includes("Supabase") ? "var(--success,#22c55e)" : "var(--muted,#888)"}"></span>
          <span id="sarpras-master-sync-status">${inventorySyncState.master}</span>
        </div>
      </div>

      <div class="sarpras-master-modal" id="sarpras-master-modal" style="position:fixed;inset:0;z-index:70;display:none;place-items:center;padding:1rem;background:rgba(10,12,12,0.54)">
        <div style="position:relative;width:min(24rem,100%);padding:1.2rem;border:1px solid var(--line);border-radius:1.4rem;background:var(--surface);box-shadow:var(--shadow)">
          <button type="button" id="sarpras-master-modal-close" data-sarpras-action="master-modal-close" style="position:absolute;top:0.75rem;right:0.75rem;width:2rem;height:2rem;border:1px solid var(--line);border-radius:0.75rem;color:var(--text);background:var(--surface-soft);cursor:pointer">×</button>
          <h2 id="sarpras-master-modal-title" style="margin:0 0 0.5rem;font-size:1rem">${t("invMasterModalAdd")}</h2>
          <form id="sarpras-master-form" data-sarpras-form="master-item" style="display:grid;gap:0.6rem">
            <input type="hidden" name="edit_index" id="sarpras-edit-index" value="-1" />
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Kategori
              <div style="display:flex;gap:0.35rem">
                <select name="category" required style="flex:1;min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)">
                  <option value="">— Pilih —</option>
                  ${state.kategoriList.map(([code, name]) => `<option value="${code}">${code} — ${name}</option>`).join("")}
                </select>
                <button type="button" class="primary-button" data-sarpras-action="kategori-add-show" style="min-height:2.4rem;width:2.4rem;padding:0;border:1px solid var(--line);border-radius:0.5rem;color:var(--text);background:var(--surface-soft);cursor:pointer;font-size:1.1rem">+</button>
              </div>
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Kode
              <input type="text" name="item_code" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Nama Barang
              <input type="text" name="item_name" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Location
              <input type="text" name="location" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Stock
              <input type="number" name="stock" min="0" value="0" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <div style="display:flex;gap:0.5rem;margin-top:0.25rem">
              <button type="submit" class="primary-button" style="flex:1">Simpan</button>
              <button type="button" class="primary-button secondary" id="sarpras-master-modal-cancel">Batal</button>
            </div>
          </form>
        </div>
      </div>

      <div class="sarpras-master-modal" id="sarpras-kategori-modal" style="position:fixed;inset:0;z-index:71;display:none;place-items:center;padding:1rem;background:rgba(10,12,12,0.54)">
        <div style="position:relative;width:min(20rem,100%);padding:1.2rem;border:1px solid var(--line);border-radius:1.4rem;background:var(--surface);box-shadow:var(--shadow)">
          <button type="button" id="sarpras-kategori-modal-close" data-sarpras-action="kategori-modal-close" style="position:absolute;top:0.75rem;right:0.75rem;width:2rem;height:2rem;border:1px solid var(--line);border-radius:0.75rem;color:var(--text);background:var(--surface-soft);cursor:pointer">×</button>
          <h2 style="margin:0 0 0.5rem;font-size:1rem">Tambah Kategori</h2>
          <form id="sarpras-kategori-form" data-sarpras-form="master-kategori" style="display:grid;gap:0.6rem">
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Kode
              <input type="text" name="kategori_code" placeholder="e.g. MHP-BRG" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Nama Kategori
              <input type="text" name="kategori_name" placeholder="e.g. Bahan Bangunan" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <div style="display:flex;gap:0.5rem;margin-top:0.25rem">
              <button type="submit" class="primary-button" style="flex:1">Simpan</button>
              <button type="button" class="primary-button secondary" id="sarpras-kategori-modal-cancel">Batal</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;
}

function buildInventoryOperationsPage() {
  const type = invTransactionType;
  const state = ensureInventoryState();
  const orderRows = invCurrentOrder.length === 0
    ? `<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:2rem">${t("invOpEmpty")}</td></tr>`
    : invCurrentOrder.map((item, i) => `
      <tr>
        <td><strong>${item.code}</strong><br><span style="font-size:0.82rem;color:var(--muted)">${item.name}</span></td>
        <td><input type="number" min="1" value="${item.qty}" style="width:4.5rem;min-height:2rem;padding:0 0.4rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft)" data-sarpras-action="inventory-update-qty" data-index="${i}" /></td>
        <td><button type="button" class="action-button" data-sarpras-action="inventory-remove-order" data-index="${i}" title="${t("invOpRemove")}" style="color:var(--due-text)">✕</button></td>
      </tr>
    `).join("");
  const uniqueItems = new Set(invCurrentOrder.map(item => item.code)).size;
  const totalQty = invCurrentOrder.reduce((sum, item) => sum + item.qty, 0);
  const confirmLabel = type === "masuk" ? t("invOpTypeIn") : t("invOpTypeOut");
  /* Category breakdown */
  const catCount = {};
  invCurrentOrder.forEach((item) => {
    const master = state.items.find((row) => row[0] === item.code);
    const cat = master ? master[2] : "—";
    catCount[cat] = (catCount[cat] || 0) + item.qty;
  });
  const catRows = Object.entries(catCount)
    .map(([cat, qty]) => `<div style="display:flex;justify-content:space-between;font-size:0.82rem"><span>${cat}</span><strong>${qty}</strong></div>`)
    .join("");

  return `
    <section class="sarpras-overview">

      <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.85rem">
        <div style="display:flex;border:1px solid var(--line);border-radius:0.5rem;overflow:hidden">
          <button type="button" class="primary-button${type === "masuk" ? "" : " secondary"}" data-sarpras-action="set-transaction-type" data-value="masuk" style="border-radius:0;padding:0.45rem 1rem">📥 ${t("invOpTypeIn")}</button>
          <button type="button" class="primary-button${type === "keluar" ? "" : " secondary"}" data-sarpras-action="set-transaction-type" data-value="keluar" style="border-radius:0;padding:0.45rem 1rem">📤 ${t("invOpTypeOut")}</button>
        </div>
        <div style="display:flex;align-items:center;gap:0.4rem;margin-left:0.25rem">
          <span style="font-size:0.82rem;color:var(--muted);font-weight:600">${t("invOpToken")}</span>
          <input type="${invTokenVisible ? "text" : "password"}" maxlength="6" value="${invToken}" data-sarpras-input="inventory-token" style="width:6rem;min-height:2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft);font-family:monospace;font-size:1rem;letter-spacing:0.2em;text-align:center" />
          <button type="button" class="action-button" data-sarpras-action="inventory-token-toggle" title="${invTokenVisible ? "Sembunyikan" : "Tampilkan"}">${invTokenVisible ? "🙈" : "👁"}</button>
        </div>
        <div style="margin-left:auto;display:flex;gap:0.35rem">
          <button type="button" class="primary-button secondary" data-sarpras-action="inventory-save" style="font-size:0.72rem;padding:0.35rem 0.6rem">${t("invMasterSave")}</button>
          <button type="button" class="primary-button secondary" data-sarpras-action="inventory-load" style="font-size:0.72rem;padding:0.35rem 0.6rem">${t("invMasterLoad")}</button>
        </div>
      </div>

      <div class="sarpras-layout">
        <section class="table-panel" style="padding:0;position:relative">
          <div class="panel-heading" style="padding:0.65rem 1rem">
            <h2>${t("invOpOrderList")}</h2>
            <span id="sarpras-order-count">${invCurrentOrder.length} ${t("invActItem")}</span>
          </div>
          <div style="padding:0.6rem 1rem;border-bottom:1px solid var(--line)">
            <input type="text" data-sarpras-input="inventory-item-input" placeholder="${t("invOpSearch")}" style="width:100%;min-height:2.2rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft);font-size:0.9rem" />
          </div>
          <div class="module-table-scroll">
            <table class="module-table">
              <thead>
                <tr>
                  <th>${t("invActItems")}</th>
                  <th style="width:5.5rem">${t("invOpQty")}</th>
                  <th style="width:3rem"></th>
                </tr>
              </thead>
              <tbody id="sarpras-order-tbody">
                ${orderRows}
              </tbody>
            </table>
          </div>
        </section>

        <aside class="sarpras-side-stack" style="min-width:14rem">
          <section class="panel-card" style="display:grid;gap:0.65rem;position:sticky;top:1rem">
            <div style="display:grid;gap:0.25rem">
              <span style="font-size:0.78rem;color:var(--muted)">${t("invOpUnique")}</span>
              <strong id="sarpras-order-unique" style="font-size:1.2rem">${uniqueItems}</strong>
            </div>
            <div style="display:grid;gap:0.25rem">
              <span style="font-size:0.78rem;color:var(--muted)">${t("invOpTotal")}</span>
              <strong id="sarpras-order-total" style="font-size:1.2rem">${totalQty}</strong>
            </div>
            ${catRows ? `<div style="display:grid;gap:0.2rem;padding:0.5rem 0;border-top:1px solid var(--line)">${catRows}</div>` : ""}
            <div style="display:flex;gap:0.5rem">
              <button type="button" class="primary-button" data-sarpras-action="inventory-confirm" id="sarpras-confirm-btn" ${invCurrentOrder.length === 0 ? "disabled" : ""} style="flex:1">${confirmLabel}</button>
              <button type="button" class="primary-button secondary" data-sarpras-action="inventory-clear-order" ${invCurrentOrder.length === 0 ? "disabled" : ""}>${t("invOpClear")}</button>
            </div>
          </section>
        </aside>
      </div>
      <div style="padding:0.5rem 1rem;border-top:1px solid var(--line);font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:0.5rem;margin-top:0.85rem">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${inventorySyncState.inventory.includes("Supabase") ? "var(--success,#22c55e)" : "var(--muted,#888)"}"></span>
        <span>${inventorySyncState.inventory}</span>
      </div>
    </section>

    <div id="sarpras-confirm-modal" style="position:fixed;inset:0;z-index:80;display:none;place-items:center;padding:1rem;background:rgba(10,12,12,0.54)">
      <div style="position:relative;width:min(20rem,100%);padding:1.2rem;border:1px solid var(--line);border-radius:1.4rem;background:var(--surface);box-shadow:var(--shadow)">
        <button type="button" id="sarpras-confirm-modal-close" style="position:absolute;top:0.75rem;right:0.75rem;width:2rem;height:2rem;border:1px solid var(--line);border-radius:0.75rem;color:var(--text);background:var(--surface-soft);cursor:pointer">×</button>
        <h2 style="margin:0 0 0.5rem;font-size:1rem">${t("invOpConfirmTitle").replace("{type}", type === "masuk" ? t("invOpTypeIn") : t("invOpTypeOut"))}</h2>
        <p style="margin:0 0 1rem;font-size:0.82rem;color:var(--muted)">${t("invOpTokenReEnter")} <strong style="font-family:monospace;letter-spacing:0.15em">${invToken}</strong></p>
        <form id="sarpras-confirm-form" style="display:grid;gap:0.6rem">
          <input type="text" maxlength="6" placeholder="000000" required style="width:100%;min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft);font-family:monospace;font-size:1.2rem;letter-spacing:0.2em;text-align:center" id="sarpras-confirm-token-input" />
          <button type="submit" class="primary-button">${t("invOpConfirm").replace("{type}", type === "masuk" ? t("invOpTypeIn") : t("invOpTypeOut"))}</button>
        </form>
      </div>
    </div>

    <input id="sarpras-scanner" type="text" style="position:fixed;left:-9999px;width:1px;height:1px;opacity:0" autocomplete="off" value="" />
  `;
}

function buildInventoryOpnamePage() {
  return `
    <section class="sarpras-overview">
      <article class="sarpras-hero panel-card">
        <div>
          <p class="eyebrow">Stock Opname</p>
          <h2>Audit stok per lokasi dan selisih fisik</h2>
          <span>Tab ini fokus ke sesi opname, detail stok sistem vs stok fisik, lalu otomatis menyiapkan penyesuaian stok saat sesi selesai.</span>
        </div>
        <div class="sarpras-hero-actions">
          <button type="button" class="primary-button">Buat opname</button>
          <button type="button" class="primary-button secondary">Cetak worksheet</button>
        </div>
      </article>

      <div class="sarpras-metric-grid">
        ${inventoryOpnameData.metrics.map((item) => `
          <article class="sarpras-metric sarpras-metric-${item.tone}">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
          </article>
        `).join("")}
      </div>

      <div class="sarpras-layout">
        <section class="table-panel sarpras-table-panel sarpras-section-stack">
          <div class="panel-heading">
            <div>
              <h2>Sesi opname</h2>
              <span>Draft ke selesai, per lokasi</span>
            </div>
            <b class="sarpras-badge">Audit flow</b>
          </div>
          <div class="module-table-scroll">
            <table class="module-table sarpras-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Lokasi</th>
                  <th>Tanggal</th>
                  <th>Petugas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${inventoryOpnameData.sessions.map((row) => `
                  <tr>
                    <td><strong>${row[0]}</strong></td>
                    <td>${row[1]}</td>
                    <td>${row[2]}</td>
                    <td>${row[3]}</td>
                    <td>${formatInventoryRecordState(row[4])}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div class="panel-heading">
            <div>
              <h2>Selisih terdeteksi</h2>
              <span>Dasar otomatis untuk penyesuaian stok</span>
            </div>
          </div>
          <div class="module-table-scroll">
            <table class="module-table sarpras-table">
              <thead>
                <tr>
                  <th>Barang</th>
                  <th>Lokasi</th>
                  <th>Sistem</th>
                  <th>Fisik</th>
                  <th>Selisih</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                ${inventoryOpnameData.discrepancies.map((row) => `
                  <tr>
                    <td><strong>${row[0]}</strong></td>
                    <td>${row[1]}</td>
                    <td>${row[2]}</td>
                    <td>${row[3]}</td>
                    <td>${formatInventoryVariance(row[4])}</td>
                    <td>${row[5]}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </section>

        <aside class="sarpras-side-stack">
          <section class="panel-card sarpras-activity-card">
            <div class="panel-heading">
              <h2>Checklist opname</h2>
              <span>Flow yang akan kita hidupkan</span>
            </div>
            <div class="sarpras-activity-list">
              <article class="sarpras-activity-item">
                <strong>Buat sesi per lokasi</strong>
                <span>Tanggal, lokasi, dan petugas jadi header opname.</span>
                <small>Status mulai dari Draft</small>
              </article>
              <article class="sarpras-activity-item">
                <strong>Bandingkan stok</strong>
                <span>Setiap barang punya stok sistem, stok fisik, selisih, dan catatan.</span>
                <small>Fokus ke akurasi gudang</small>
              </article>
              <article class="sarpras-activity-item">
                <strong>Generate penyesuaian</strong>
                <span>Saat selesai, selisih otomatis masuk sebagai transaksi penyesuaian stok.</span>
                <small>Tanpa approval tambahan</small>
              </article>
            </div>
          </section>
        </aside>
      </div>
    </section>
  `;
}

function buildInventoryActivityPage() {
  const state = ensureInventoryState();
  const filter = invActivityFilter;
  const query = invActivitySearch.toLowerCase().trim();

  /* Filter transactions */
  let filtered = state.transactions;
  if (filter === "masuk") filtered = filtered.filter((r) => r[1] === "Masuk");
  else if (filter === "keluar") filtered = filtered.filter((r) => r[1] === "Keluar");
  if (query) {
    filtered = filtered.filter((r) => r[0].toLowerCase().includes(query) || r[3].toLowerCase().includes(query));
  }

  const total = filtered.length;
  const pages = Math.ceil(total / invActivityPageSize) || 1;
  if (invActivityCurrentPage > pages) invActivityCurrentPage = pages;
  const start = (invActivityCurrentPage - 1) * invActivityPageSize;
  const pageData = filtered.slice(start, start + invActivityPageSize);

  const filterBtn = (val, label) =>
    `<button type="button" class="primary-button${filter === val ? "" : " secondary"}" data-sarpras-action="activity-filter" data-value="${val}" style="border-radius:0;padding:0.35rem 0.75rem;font-size:0.78rem">${label}</button>`;

  const inLabel = t("invActIn");
  const outLabel = t("invActOut");

  const rows = pageData.length === 0
    ? `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:2rem">${t("invActEmpty")}</td></tr>`
    : pageData.map((row, si) => {
        const globalIdx = state.transactions.indexOf(row);
        const items = (() => { try { return JSON.parse(row[3]); } catch { return []; } })();
        const itemsPreview = items.length > 0
          ? items.map((i) => ` ${i.code} (${i.qty})`).join(",")
          : row[3].slice(0, 60);
        const typeBadge = row[1] === "Masuk"
          ? `<span class="module-pill good">${inLabel}</span>`
          : `<span class="module-pill warn">${outLabel}</span>`;
        return `
      <tr data-tx-index="${globalIdx}" style="cursor:pointer">
        <td><strong>${row[0]}</strong></td>
        <td>${typeBadge}</td>
        <td style="white-space:nowrap">${row[2]}</td>
        <td style="max-width:18rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><span class="tx-items-preview">${itemsPreview}</span> <span style="color:var(--muted);font-size:0.72rem">(${items.length} ${t("invActItem")})</span></td>
        <td>${row[4]}</td>
        <td>${row[7] || "—"}</td>
        <td>${formatInventoryRecordState(row[6] || "Selesai")}</td>
        <td style="display:flex;gap:0.2rem">
          <button type="button" class="action-button" data-sarpras-action="toggle-tx-detail" data-index="${globalIdx}" title="${t("invActDetail")}" style="font-size:0.7rem;padding:0.15rem 0.35rem">▶</button>
          <button type="button" class="action-button" data-sarpras-action="remove-transaction" data-index="${globalIdx}" title="${t("invActConfirmDelete")}" style="color:var(--due-text);font-size:0.78rem;padding:0.15rem 0.35rem">✕</button>
        </td>
      </tr>
      <tr class="tx-detail-row" data-parent="${globalIdx}" style="display:none">
        <td colspan="8" style="padding:0">
          <div style="padding:0.5rem 1rem 0.75rem 2rem;background:var(--surface-soft);border-bottom:1px solid var(--line)">
            ${items.length === 0 ? `<span style="color:var(--muted)">${t("invActNoDetail")}</span>` : `
            <table style="width:100%;font-size:0.78rem;border-collapse:collapse">
              <thead>
                <tr style="color:var(--muted)">
                  <th style="text-align:left;padding:0.25rem 0.5rem;border-bottom:1px solid var(--line)">${t("invActCode")}</th>
                  <th style="text-align:left;padding:0.25rem 0.5rem;border-bottom:1px solid var(--line)">${t("invActItemName")}</th>
                  <th style="text-align:center;padding:0.25rem 0.5rem;border-bottom:1px solid var(--line)">${t("invActQty")}</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((i) => `
                <tr>
                  <td style="padding:0.2rem 0.5rem"><strong>${i.code}</strong></td>
                  <td style="padding:0.2rem 0.5rem">${i.name}</td>
                  <td style="padding:0.2rem 0.5rem;text-align:center">${i.qty}</td>
                </tr>`).join("")}
              </tbody>
            </table>`}
          </div>
        </td>
      </tr>`;
      }).join("");

  const txLabel = total > 1 ? `${t("invActTransaction")}s` : t("invActTransaction");
  const paginationHtml = total > invActivityPageSize ? `
    <div style="padding:0.5rem 1rem;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;font-size:0.78rem">
      <div style="display:flex;align-items:center;gap:0.5rem">
        <span style="color:var(--muted)">${total} ${txLabel}</span>
        <select id="sarpras-activity-pagesize" style="padding:0.2rem 0.4rem;border:1px solid var(--line);border-radius:0.3rem;color:var(--text);background:var(--surface);font-size:0.78rem">
          ${[10, 20, 50, 100].map(s => `<option value="${s}"${s === invActivityPageSize ? " selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
      <div style="display:flex;align-items:center;gap:0.25rem">
        <button type="button" class="action-button" id="sarpras-activity-pageprev" ${invActivityCurrentPage <= 1 ? "disabled" : ""} style="padding:0.25rem 0.6rem">‹</button>
        <span style="white-space:nowrap;color:var(--muted)">${invActivityCurrentPage}/${pages}</span>
        <button type="button" class="action-button" id="sarpras-activity-pagenext" ${invActivityCurrentPage >= pages ? "disabled" : ""} style="padding:0.25rem 0.6rem">›</button>
      </div>
    </div>` : `<div style="padding:0.5rem 1rem;border-top:1px solid var(--line);font-size:0.78rem;color:var(--muted)">${total} ${txLabel}</div>`;

  const syncIcon = inventorySyncState.inventory && inventorySyncState.inventory !== "Transaksi tersimpan di browser"
    ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#4ade80;margin-right:0.35rem"></span>`
    : `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--muted);margin-right:0.35rem"></span>`;

  const searchPlaceholder = t("invActSearch");
  const lblAll = t("invActAll");
  const lblExport = t("invActExport");
  const lblClear = t("invActClear");
  const syncBrowser = "Transaksi tersimpan di browser";

  return `
    <section class="sarpras-overview">
      <div class="module-toolbar" style="margin-bottom:0.85rem;flex-wrap:wrap;gap:0.5rem">
        <div class="module-search" style="flex:1;min-width:10rem"><span>⌕</span><input id="sarpras-activity-search" type="search" placeholder="${searchPlaceholder}" value="${invActivitySearch.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" /></div>
        <div style="display:flex;gap:0.15rem">${filterBtn("semua", lblAll)}${filterBtn("masuk", t("invActIn"))}${filterBtn("keluar", t("invActOut"))}</div>
        <div style="display:flex;gap:0.35rem">
          <button type="button" class="primary-button secondary" data-sarpras-action="activity-export" style="font-size:0.78rem;padding:0.35rem 0.75rem">${lblExport}</button>
          <button type="button" class="primary-button secondary" data-sarpras-action="activity-clear" style="font-size:0.78rem;padding:0.35rem 0.75rem;color:var(--due-text)">${lblClear}</button>
        </div>
      </div>
      <div class="table-panel" style="padding:0;position:relative">
        <div class="responsive-table">
          <table class="module-table">
            <thead>
              <tr>
                <th>${t("invActToken")}</th>
                <th>${t("invActType")}</th>
                <th>${t("invActDate")}</th>
                <th>${t("invActItems")}</th>
                <th>${t("invActTotalQty")}</th>
                <th>${t("invActOfficer")}</th>
                <th>${t("invActStatus")}</th>
                <th style="width:3.5rem">${t("invActDetail")}</th>
              </tr>
            </thead>
            <tbody id="sarpras-activity-tbody">
              ${rows}
            </tbody>
          </table>
        </div>
        ${paginationHtml}
        <div style="padding:0.5rem 1rem;border-top:1px solid var(--line);font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:0.5rem">
          ${syncIcon}
          <span>${inventorySyncState.inventory || syncBrowser}</span>
        </div>
      </div>
    </section>
  `;
}

function buildInventoryPlaceholderPage(title, description, bullets) {
  return `
    <section class="sarpras-overview">
      <article class="sarpras-hero panel-card">
        <div>
          <p class="eyebrow">${title}</p>
          <h2>${title}</h2>
          <span>${description}</span>
        </div>
      </article>
      <section class="panel-card sarpras-activity-card">
        <div class="panel-heading">
          <h2>Scope inti</h2>
          <span>Sudah disiapkan di struktur tab</span>
        </div>
        <div class="sarpras-master-list">
          ${bullets.map((item) => `
            <article class="sarpras-master-item">
              <div>
                <strong>${item}</strong>
                <small>Siap kita bangun di slice berikutnya</small>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    </section>
  `;
}

/* ══════════════════════════════════════════════════════════════
   Report Data Helpers
   ══════════════════════════════════════════════════════════════ */
let invReportType = "bulanan";
let invReportYear = new Date().getFullYear();
let invReportMonth = new Date().getMonth() + 1;
let invReportSubTab = "ledger";
let invStockCardCode = "";

function getItemStockCard(code) {
  const state = ensureInventoryState();
  const allTxs = state.transactions;
  const movements = [];
  allTxs.forEach((tx) => {
    const type = tx[1];
    const date = tx[2];
    const token = tx[0];
    const officer = tx[6] || "—";
    let orders;
    try { orders = JSON.parse(tx[3]); } catch { orders = []; }
    let qty = 0;
    orders.forEach((o) => { if (o.code === code) qty += Number(o.qty) || 0; });
    if (qty > 0) movements.push({ date, type, qty, token, officer });
  });
  movements.sort((a, b) => a.date.localeCompare(b.date));
  let balance = 0;
  movements.forEach((m) => {
    if (m.type === "Masuk") balance += m.qty;
    else balance -= m.qty;
    m.balance = balance;
  });
  return movements;
}

function getDaysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

function buildReportData(type, year, month) {
  const state = ensureInventoryState();
  const items = state.items;
  const allTxs = state.transactions;
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const curDay = now.getDate();

  /* Parse all transactions into item-level movements */
  function expandTransactions(txList) {
    const movements = [];
    txList.forEach((tx) => {
      const t = tx[1];
      const dt = tx[2].slice(0, 10);
      let orders;
      try { orders = JSON.parse(tx[3]); } catch { orders = []; }
      orders.forEach((o) => {
        movements.push({ code: o.code, name: o.name, qty: Number(o.qty) || 0, type: t, date: dt });
      });
    });
    return movements;
  }

  const allMovements = expandTransactions(allTxs);

  function sumMovementsInRange(code, startDate, endDate) {
    let masuk = 0, keluar = 0;
    allMovements.forEach((m) => {
      if (m.code !== code) return;
      if (m.date >= startDate && m.date <= endDate) {
        if (m.type === "Masuk") masuk += m.qty;
        else keluar += m.qty;
      }
    });
    return { masuk, keluar };
  }

  function getStockBefore(code, beforeDate) {
    let net = 0;
    allMovements.forEach((m) => {
      if (m.code !== code) return;
      if (m.date < beforeDate) {
        if (m.type === "Masuk") net += m.qty;
        else net -= m.qty;
      }
    });
    return net;
  }

  const isMidMonth = curDay <= 15 && curMonth === month && curYear === year;

  /* Build period structure */
  let periods = [];
  if (type === "bulanan") {
    const days = getDaysInMonth(year, month);
    for (let d = 1; d <= days; d++) {
      periods.push({ key: `day-${d}`, label: String(d), start: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`, end: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
    }
  } else if (type === "tahunan-3") {
    for (let i = 0; i < 3; i++) {
      const m = month + i;
      const y = year + Math.floor((m - 1) / 12);
      const mm = ((m - 1) % 12) + 1;
      const monthName = new Date(y, mm - 1, 1).toLocaleString("default", { month: "short" });
      const days = getDaysInMonth(y, mm);
      periods.push({ key: `month-${i}`, label: `${monthName}`, start: `${y}-${String(mm).padStart(2, "0")}-01`, end: `${y}-${String(mm).padStart(2, "0")}-${String(days).padStart(2, "0")}` });
    }
  } else if (type === "tahapan") {
    periods.push({ key: "tahap1", label: t("invRepTahapan1"), start: `${year}-01-01`, end: `${year}-06-30` });
    periods.push({ key: "tahap2", label: t("invRepTahapan2"), start: `${year}-07-01`, end: `${year}-12-31` });
  }

  const periodStart = periods[0].start;
  const periodEnd = periods[periods.length - 1].end;
  const afterStart = periods.length ? periods[0].start : "";
  const afterEnd = "9999-12-31";

  /* Compute report rows */
  const rows = items.map((row, idx) => {
    const code = row[0];
    const name = row[1];
    const kategori = row[2] || "—";
    const currentStock = Number(row[4]) || 0;

    /* Stock Awal = current stock - net change during & after period */
    const netDuring = sumMovementsInRange(code, periodStart, "9999-12-31");
    const stockAwal = currentStock - netDuring.masuk + netDuring.keluar;

    const periodData = periods.map((p) => sumMovementsInRange(code, p.start, p.end));
    const totalMasuk = periodData.reduce((s, p) => s + p.masuk, 0);
    const totalKeluar = periodData.reduce((s, p) => s + p.keluar, 0);
    const sisaStock = stockAwal + totalMasuk - totalKeluar;

    return { idx, code, name, kategori, stockAwal, periodData, totalMasuk, totalKeluar, sisaStock };
  });

  return { rows, periods, type, year, month };
}

function renderReportTable(data) {
  const { rows, periods, type } = data;

  let html = `<div class="sarpras-report-scroll"><table class="module-table sarpras-report-table" style="min-width:${periods.length > 6 ? "180rem" : "max-content"}">`;
  html += `<thead><tr>
    <th rowspan="2" class="rep-sticky">${t("invRepNo")}</th>
    <th rowspan="2" class="rep-sticky">${t("invRepCategory")}</th>
    <th rowspan="2" class="rep-sticky">${t("invRepCode")}</th>
    <th rowspan="2" class="rep-sticky">${t("invRepName")}</th>
    <th rowspan="2" class="rep-sticky">${t("invRepStockAwal")}</th>`;

  periods.forEach((p) => {
    html += `<th colspan="2" class="rep-period-header">${p.label}</th>`;
  });

  html += `<th rowspan="2">${t("invRepTotalMasuk")}</th>
    <th rowspan="2">${t("invRepTotalKeluar")}</th>
    <th rowspan="2">${t("invRepSisaStock")}</th>
  </tr><tr>`;
  periods.forEach(() => {
    html += `<th class="rep-sub">${t("invRepMasuk")}</th><th class="rep-sub">${t("invRepKeluar")}</th>`;
  });
  html += `</tr></thead><tbody>`;

  rows.forEach((r) => {
    html += `<tr>
      <td class="rep-sticky">${r.idx + 1}</td>
      <td class="rep-sticky">${r.kategori}</td>
      <td class="rep-sticky"><strong>${r.code}</strong></td>
      <td class="rep-sticky">${r.name}</td>
      <td class="rep-sticky"><strong>${r.stockAwal}</strong></td>`;
    r.periodData.forEach((p) => {
      html += `<td class="rep-masuk">${p.masuk || ""}</td><td class="rep-keluar">${p.keluar || ""}</td>`;
    });
    html += `<td><strong>${r.totalMasuk}</strong></td>
      <td><strong>${r.totalKeluar}</strong></td>
      <td><strong>${r.sisaStock}</strong></td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  return html;
}

function renderStockCardTable(movements, code) {
  const state = ensureInventoryState();
  const item = state.items.find((r) => r[0] === code);
  const currentStock = item ? Number(item[4]) || 0 : 0;
  const itemName = item ? item[1] : code;

  let html = `<div class="sarpras-card-header"><strong>${code} — ${itemName}</strong> &bull; ${t("invRepCurrentStock")}: <b>${currentStock}</b></div>`;
  html += `<div class="sarpras-report-scroll" style="max-height:60vh"><table class="module-table sarpras-report-table" style="min-width:max-content">`;
  html += `<thead><tr>
    <th>${t("invRepNo")}</th>
    <th>${t("invRepDate")}</th>
    <th>${t("invRepType")}</th>
    <th>${t("invRepIn")}</th>
    <th>${t("invRepOut")}</th>
    <th>${t("invRepBalance")}</th>
    <th>${t("invRepToken")}</th>
    <th>${t("invRepCardOf")}</th>
  </tr></thead><tbody>`;

  if (!movements.length) {
    html += `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--muted)">${t("invRepCardNoTx")}</td></tr>`;
  } else {
    movements.forEach((m, i) => {
      const isIn = m.type === "Masuk";
      html += `<tr>
        <td>${i + 1}</td>
        <td>${m.date.slice(0, 10)}</td>
        <td>${m.type}</td>
        <td class="rep-masuk">${isIn ? m.qty : ""}</td>
        <td class="rep-keluar">${isIn ? "" : m.qty}</td>
        <td><strong>${m.balance}</strong></td>
        <td style="font-family:monospace">${m.token}</td>
        <td>${m.officer}</td>
      </tr>`;
    });
  }

  html += `</tbody></table></div>`;
  return html;
}

function buildInventoryReportsPage() {
  const isCards = invReportSubTab === "cards";
  const state = ensureInventoryState();
  const allItems = state.items;

  if (isCards) {
    const movements = invStockCardCode ? getItemStockCard(invStockCardCode) : [];
    return `
      <section class="sarpras-overview">
        <article class="panel-card" style="padding:1rem 1.5rem">
          <div class="sarpras-report-controls" style="margin-top:0">
            <button type="button" class="primary-button${!isCards ? "" : " secondary"}" data-sarpras-action="report-set-subtab" data-value="ledger">${t("invRepLedger")}</button>
            <button type="button" class="primary-button${isCards ? "" : " secondary"}" data-sarpras-action="report-set-subtab" data-value="cards">${t("invRepCards")}</button>
            <span style="flex:1"></span>
            <select data-sarpras-input="stock-card-item" style="min-height:2.2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft);min-width:16rem">
              <option value="">${t("invRepSelectItem")}</option>
              ${allItems.map((r) => `<option value="${r[0]}" ${r[0] === invStockCardCode ? "selected" : ""}>${r[0]} — ${r[1]}</option>`).join("")}
            </select>
            ${invStockCardCode ? `<button type="button" class="primary-button secondary" data-sarpras-action="report-export-card">${t("invRepExportCard")}</button>` : ""}
            <button type="button" class="primary-button secondary" data-sarpras-action="report-export-all-cards">${t("invRepExportAll")}</button>
          </div>
        </article>
        <section class="panel-card">
          ${invStockCardCode ? renderStockCardTable(movements, invStockCardCode) : `<div style="padding:2rem;text-align:center;color:var(--muted)">${t("invRepSelectItem")}</div>`}
        </section>
      </section>
    `;
  }

  const data = buildReportData(invReportType, invReportYear, invReportMonth);
  const { rows, periods, type } = data;
  const hasData = rows.some((r) => r.totalMasuk > 0 || r.totalKeluar > 0);

  return `
    <section class="sarpras-overview">
      <article class="panel-card" style="padding:1rem 1.5rem">
        <div class="sarpras-report-controls" style="margin-top:0">
          <button type="button" class="primary-button${!isCards ? "" : " secondary"}" data-sarpras-action="report-set-subtab" data-value="ledger">${t("invRepLedger")}</button>
          <button type="button" class="primary-button${isCards ? "" : " secondary"}" data-sarpras-action="report-set-subtab" data-value="cards">${t("invRepCards")}</button>
          <span style="flex:1"></span>
          <button type="button" class="primary-button${type === "bulanan" ? "" : " secondary"}" data-sarpras-action="report-set-type" data-value="bulanan">${t("invRepMonthly")}</button>
          <button type="button" class="primary-button${type === "tahunan-3" ? "" : " secondary"}" data-sarpras-action="report-set-type" data-value="tahunan-3">${t("invRepQuarterly")}</button>
          <button type="button" class="primary-button${type === "tahapan" ? "" : " secondary"}" data-sarpras-action="report-set-type" data-value="tahapan">${t("invRepTahapan")}</button>
          <span class="rep-period-picker">
            <select data-sarpras-input="report-month" style="min-height:2.2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft)">
              ${type !== "tahapan" ? Array.from({length: 12}, (_, i) => `<option value="${i + 1}" ${i + 1 === invReportMonth ? "selected" : ""}>${new Date(2000, i, 1).toLocaleString("default", { month: "long" })}</option>`).join("") : `<option value="1">${t("invRepTahapan1")}</option>`}
            </select>
            <select data-sarpras-input="report-year" style="min-height:2.2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft)">
              ${Array.from({length: 10}, (_, i) => { const y = new Date().getFullYear() - 5 + i; return `<option value="${y}" ${y === invReportYear ? "selected" : ""}>${y}</option>`; }).join("")}
            </select>
          </span>
          <button type="button" class="primary-button" data-sarpras-action="report-generate">${t("invRepGenerate")}</button>
          ${hasData ? `<button type="button" class="primary-button secondary" data-sarpras-action="report-export">${t("invRepExport")}</button>` : ""}
        </div>
      </article>

      <section class="panel-card">
        ${hasData ? renderReportTable(data) : `<div style="padding:2rem;text-align:center;color:var(--muted)">${t("invRepNoData")}</div>`}
      </section>
    </section>
  `;
}

function formatInventoryStatus(status) {
  if (status === "Aman") return `<span class="module-pill good">${status}</span>`;
  if (status === "Kosong") return `<span class="module-pill neutral">${status}</span>`;
  return `<span class="module-pill warn">${status}</span>`;
}

function formatInventoryRecordState(status) {
  const value = String(status);
  if (["Aktif", "Selesai"].includes(value)) return `<span class="module-pill good">${value}</span>`;
  if (["Draft", "Proses", "Review", "Pending update"].includes(value)) return `<span class="module-pill warn">${value}</span>`;
  return `<span class="module-pill neutral">${value}</span>`;
}

function formatInventoryVariance(value) {
  const normalized = String(value);
  if (normalized.startsWith("+")) return `<span class="module-pill good">${normalized}</span>`;
  if (normalized.startsWith("-")) return `<span class="module-pill warn">${normalized}</span>`;
  return `<span class="module-pill neutral">${normalized}</span>`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function setTheme(value) {
  document.documentElement.style.setProperty("--bg", value);
  document.documentElement.style.setProperty("--page", value);
  themeColor.value = value;
  localStorage.setItem("schoolos_bg", value);
}

function setThemeMode(value) {
  document.documentElement.dataset.theme = value;
  themeMode.value = value;
  localStorage.setItem("schoolos_theme", value);
  if (!localStorage.getItem("schoolos_bg")) {
    themeColor.value = value === "light" ? "#f8faf9" : "#071315";
  }
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.page}`).classList.add("active");
    sidebar.classList.remove("open");
  });
});

languageSelect.addEventListener("change", (event) => {
  language = event.target.value;
  localStorage.setItem("schoolos_language", language);
  applyLanguage();
});

themeMode.addEventListener("change", (event) => {
  localStorage.removeItem("schoolos_bg");
  document.documentElement.style.removeProperty("--bg");
  document.documentElement.style.removeProperty("--page");
  setThemeMode(event.target.value);
});
themeColor.addEventListener("input", (event) => setTheme(event.target.value));
menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

setThemeMode(localStorage.getItem("schoolos_theme") || "dark");
const savedBg = localStorage.getItem("schoolos_bg");
if (savedBg) setTheme(savedBg);
applyLanguage();

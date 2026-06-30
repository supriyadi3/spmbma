// ==========================================
// KONFIGURASI SISTEM SPMB MA AL ISTIQOMAH
// ==========================================
const SPREADSHEET_ID = '1v2c-Un0RSUxSrR7cnIqzEnRU1HwzKr73tXxOwV7--NY';
const FOLDER_KK_ID = '1RoIsMqYobFgQYEKu7Ay4cDK7v7MqoOWX';
const FOLDER_IJAZAH_ID = '1i2W66OG5WPZTrJe2KttGN2iSV2ZmIUW1';
const CONFIG_SHEET_NAME = 'Config';

/**
 * Fungsi utama untuk me-render halaman index web app
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  template.isOpen = isRegistrationOpen();
  return template.evaluate()
    .setTitle('SISTEM PENERIMAAN MURID BARU (SPMB) MA AL ISTIQOMAH')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Fungsi Pengecekan Status Pendaftaran (Mengambil data dari Sheet 'Config')
 */
function isRegistrationOpen() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG_SHEET_NAME);
      sheet.getRange("A1").setValue("STATUS");
      sheet.getRange("B1").setValue("ON");
      return true;
    }
    const status = sheet.getRange("B1").getValue().toString().trim().toUpperCase();
    return status === 'ON';
  } catch(e) {
    return true;
  }
}

/**
 * Fungsi untuk memperbarui status pendaftaran dari dashboard admin
 */
function updateRegistrationStatus(status) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG_SHEET_NAME);
    }
    sheet.getRange("A1").setValue("STATUS");
    sheet.getRange("B1").setValue(status.trim().toUpperCase());
    return { status: 'success', message: 'Status pendaftaran berhasil diubah menjadi ' + status };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Fungsi untuk memproses data dari formulir pendaftaran pendaftar baru
 */
function submitForm(formData, fileKkData, fileIjazahData) {
  if (!isRegistrationOpen()) {
    return { status: 'error', message: 'Maaf, pendaftaran saat ini sedang ditutup.' };
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Pendaftar');
     
    if (!sheet) {
      sheet = ss.insertSheet('Pendaftar');
      const headers = ['Timestamp', 'Nama Lengkap', 'Tempat Lahir', 'Tanggal Lahir', 'NIK', 'NISN', 'Pernah TK', 'Pernah PAUD', 'Hobi', 'Cita-cita', 'Jenjang Asal', 'Status Asal', 'Nama Sekolah Asal', 'NPSN Asal', 'Alamat Sekolah', 'No KK', 'Nama Kepala Keluarga', 'NIK Kepala Keluarga', 'Tempat Lahir Ayah', 'Tanggal Lahir Ayah', 'Status Ayah', 'Pendidikan Ayah', 'Pekerjaan Ayah', 'Penghasilan Ayah', 'Nama Ibu', 'NIK Ibu', 'Tempat Lahir Ibu', 'Tanggal Lahir Ibu', 'Status Ibu', 'Pendidikan Ibu', 'Pekerjaan Ibu', 'Penghasilan Ibu', 'Link File KK', 'Link File Ijazah'];
      sheet.appendRow(headers);
    }

    // Validasi NISN Duplikat saat Daftar Baru
    const existingData = sheet.getDataRange().getValues();
    const nisnInput = formData.nisn ? formData.nisn.toString().trim() : '';
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][5] && existingData[i][5].toString().trim() === nisnInput) {
        return { status: 'error', message: 'NISN ' + nisnInput + ' sudah terdaftar dalam sistem!' };
      }
    }

    let kkUrl = '';
    let ijazahUrl = '';

    if (fileKkData && fileKkData.base64) {
      const folderKk = DriveApp.getFolderById(FOLDER_KK_ID);
      const blobKk = Utilities.newBlob(Utilities.base64Decode(fileKkData.base64), fileKkData.type, 'KK_' + formData.nama + '_' + Date.now());
      const fileKk = folderKk.createFile(blobKk);
      fileKk.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      kkUrl = fileKk.getUrl();
    }

    if (fileIjazahData && fileIjazahData.base64) {
      const folderIjazah = DriveApp.getFolderById(FOLDER_IJAZAH_ID);
      const blobIjazah = Utilities.newBlob(Utilities.base64Decode(fileIjazahData.base64), fileIjazahData.type, 'IJAZAH_' + formData.nama + '_' + Date.now());
      const fileIjazah = folderIjazah.createFile(blobIjazah);
      fileIjazah.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      ijazahUrl = fileIjazah.getUrl();
    }

    const rowData = [
      new Date(), formData.nama, formData.tempatLahir, formData.tanggalLahir, formData.nik, formData.nisn,
      formData.tk, formData.paud, formData.hobi, formData.citacita, formData.jenjangAsal, formData.statusAsal,
      formData.namaAsal, formData.npsnAsal, formData.alamatAsal, formData.noKk, formData.namaKk,
      formData.nikKk, formData.tempatLahirAyah, formData.tanggalLahirAyah, formData.statusAyah,
      formData.pendidikanAyah, formData.pekerjaanAyah, formData.penghasilanAyah, formData.namaIbu, formData.nikIbu,
      formData.tempatLahirIbu, formData.tanggalLahirIbu, formData.statusIbu, formData.pendidikanIbu,
      formData.pekerjaanIbu, formData.penghasilanIbu, kkUrl, ijazahUrl
    ];

    sheet.appendRow(rowData);
    return { status: 'success', message: 'Data pendaftaran berhasil disimpan.' };

  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Fungsi verifikasi login Multi-User (Admin & Siswa)
 */
function checkLogin(username, password) {
  username = username.toString().trim();
  password = password.toString().trim();

  // 1. Cek Login Admin
  if (username === 'admin' && password === 'admin123') {
    return { status: 'success', role: 'admin' };
  }
  
  // 2. Cek Login Siswa (Username = NISN, Password = NISN)
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Pendaftar');
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const dbNisn = data[i][5] ? data[i][5].toString().trim() : '';
        if (dbNisn === username && dbNisn === password) {
          return { 
            status: 'success', 
            role: 'siswa', 
            rowIndex: i + 1,
            nisn: dbNisn 
          };
        }
      }
    }
  } catch (e) {
    return { status: 'error', message: 'Gagal memproses login siswa: ' + e.toString() };
  }

  return { status: 'error', message: 'Username atau Password salah!' };
}

/**
 * Fungsi mengambil data spesifik profil satu siswa berdasarkan baris/row sheet
 */
function getStudentData(rowIndex) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Pendaftar');
    const row = parseInt(rowIndex);
    const numColumns = sheet.getLastColumn();
    const rowData = sheet.getRange(row, 1, 1, numColumns).getValues()[0];
    
    // Format Tanggal
    const keys = ['timestamp', 'nama', 'tempatLahir', 'tanggalLahir', 'nik', 'nisn', 'tk', 'paud', 'hobi', 'citacita', 'jenjangAsal', 'statusAsal', 'namaAsal', 'npsnAsal', 'alamatAsal', 'noKk', 'namaKk', 'nikKk', 'tempatLahirAyah', 'tanggalLahirAyah', 'statusAyah', 'pendidikanAyah', 'pekerjaanAyah', 'penghasilanAyah', 'namaIbu', 'nikIbu', 'tempatLahirIbu', 'tanggalLahirIbu', 'statusIbu', 'pendidikanIbu', 'pekerjaanIbu', 'penghasilanIbu', 'linkKk', 'linkIjazah'];
    
    let result = { rowIndex: row };
    keys.forEach((key, index) => {
      let val = rowData[index];
      if (val instanceof Date) {
        if (key === 'timestamp') {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
        } else {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
        }
      }
      result[key] = val || '';
    });
    return { status: 'success', data: result };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

/**
 * Fungsi untuk memperbarui biodata siswa dari Dashboard Siswa
 */
function updateStudentForm(formData, fileKkData, fileIjazahData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Pendaftar');
    const row = parseInt(formData.rowIndex);
    
    // Dapatkan data lama untuk mempertahankan file url lama jika tidak diupload baru
    const oldRowData = sheet.getRange(row, 1, 1, 34).getValues()[0];
    let kkUrl = oldRowData[32];
    let ijazahUrl = oldRowData[33];

    if (fileKkData && fileKkData.base64) {
      const folderKk = DriveApp.getFolderById(FOLDER_KK_ID);
      const blobKk = Utilities.newBlob(Utilities.base64Decode(fileKkData.base64), fileKkData.type, 'KK_' + formData.nama + '_UPD_' + Date.now());
      const fileKk = folderKk.createFile(blobKk);
      fileKk.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      kkUrl = fileKk.getUrl();
    }

    if (fileIjazahData && fileIjazahData.base64) {
      const folderIjazah = DriveApp.getFolderById(FOLDER_IJAZAH_ID);
      const blobIjazah = Utilities.newBlob(Utilities.base64Decode(fileIjazahData.base64), fileIjazahData.type, 'IJAZAH_' + formData.nama + '_UPD_' + Date.now());
      const fileIjazah = folderIjazah.createFile(blobIjazah);
      fileIjazah.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      ijazahUrl = fileIjazah.getUrl();
    }

    // Set nilai baru pada kolom-kolom terkait (kecuali Timestamp indeks 0 / kolom 1)
    const values = [[
      formData.nama, formData.tempatLahir, formData.tanggalLahir, formData.nik, formData.nisn,
      formData.tk, formData.paud, formData.hobi, formData.citacita, formData.jenjangAsal, formData.statusAsal,
      formData.namaAsal, formData.npsnAsal, formData.alamatAsal, formData.noKk, formData.namaKk,
      formData.nikKk, formData.tempatLahirAyah, formData.tanggalLahirAyah, formData.statusAyah,
      formData.pendidikanAyah, formData.pekerjaanAyah, formData.penghasilanAyah, formData.namaIbu, formData.nikIbu,
      formData.tempatLahirIbu, formData.tanggalLahirIbu, formData.statusIbu, formData.pendidikanIbu,
      formData.pekerjaanIbu, formData.penghasilanIbu, kkUrl, ijazahUrl
    ]];

    sheet.getRange(row, 2, 1, 33).setValues(values);
    return { status: 'success', message: 'Biodata Anda berhasil diperbarui.' };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Fungsi untuk menarik data statistik & tabel data ke dashboard admin
 */
function getDashboardData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Pendaftar');
    let stats = { total: 0, smp: 0, mts: 0, negeri: 0, swasta: 0, rows: [], registrationOpen: isRegistrationOpen() };
    if (!sheet) return stats;
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return stats;
    stats.total = data.length - 1;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (String(row[10]).toUpperCase() === 'SMP') stats.smp++;
      if (String(row[10]).toUpperCase() === 'MTS') stats.mts++;
      if (String(row[11]).toUpperCase() === 'NEGERI') stats.negeri++;
      if (String(row[11]).toUpperCase() === 'SWASTA') stats.swasta++;
      const formattedRow = row.map((cell, idx) => {
        if (cell instanceof Date) return Utilities.formatDate(cell, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
        return cell;
      });
      formattedRow.push(i + 1); 
      stats.rows.push(formattedRow);
    }
    return stats;
  } catch (e) {
    return { error: e.toString() };
  }
}

/**
 * UNDUH FILE .XLSX DARI SHEET "PENDAFTAR" BERGAYA RAPI SIAP CETAK KERTAS F5
 */
function generateExcelPendaftar() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sourceSheet = ss.getSheetByName("Pendaftar");
    
    if (!sourceSheet) {
      return { status: "error", message: "Sheet dengan nama 'Pendaftar' tidak ditemukan!" };
    }
    
    const sourceData = sourceSheet.getDataRange().getValues();
    if (sourceData.length <= 1) {
      return { status: "error", message: "Tidak ada baris data pendaftar untuk diunduh." };
    }
    
    const tempSs = SpreadsheetApp.create("Temp_Export_F5");
    const targetSheet = tempSs.getSheets()[0];
    targetSheet.setName("DATA PENDAFTAR");
    targetSheet.setHideGridlines(false);
    
    targetSheet.getRange("A1:I1").merge().setValue("YAYASAN HUDAATUL UMAM").setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");
    targetSheet.getRange("A2:I2").merge().setValue("MADRASAH ALIYAH AL ISTIQOMAH").setFontWeight("bold").setFontSize(15).setHorizontalAlignment("center");
    targetSheet.getRange("A3:I3").merge().setValue("TAHUN PELAJARAN 2026/2027").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center");
    targetSheet.getRange("A4:I4").merge().setValue("DATA PENDAFTAR SISWA BARU").setFontUnderline(true).setFontWeight("bold").setFontSize(12).setHorizontalAlignment("center");
    
    targetSheet.setRowHeight(5, 12);
    
    const headers = ["NO", "TIMESTAMP", "NAMA LENGKAP", "NISN", "NIK", "JENJANG ASAL", "STATUS ASAL", "NAMA SEKOLAH ASAL", "NAMA IBU KANDUNG"];
    const headerRange = targetSheet.getRange(6, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground("#0A5C36")
               .setFontColor("#FFFFFF")
               .setFontWeight("bold")
               .setHorizontalAlignment("center")
               .setVerticalAlignment("middle");
    targetSheet.setRowHeight(6, 25);
    
    let rowsData = [];
    for (let i = 1; i < sourceData.length; i++) {
      const row = sourceData[i];
      const timestamp = row[0] instanceof Date ? Utilities.formatDate(row[0], Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm") : row[0];
      
      rowsData.push([
        i,                                              // NO
        timestamp,                                      // TIMESTAMP
        row[1] ? row[1].toString().toUpperCase() : "",   // NAMA LENGKAP
        row[5] ? "'" + row[5].toString() : "",           // NISN
        row[4] ? "'" + row[4].toString() : "",           // NIK
        row[10] || "",                                  // JENJANG ASAL
        row[11] || "",                                  // STATUS ASAL
        row[12] || "",                                  // NAMA SEKOLAH ASAL
        row[24] || ""                                   // NAMA IBU KANDUNG
      ]);
    }
    
    const dataRange = targetSheet.getRange(7, 1, rowsData.length, headers.length);
    dataRange.setValues(rowsData);
    dataRange.setFontSize(9.5).setVerticalAlignment("middle");
    
    dataRange.setBorder(true, true, true, true, true, true, "#bbbbbb", SpreadsheetApp.BorderStyle.SOLID);
    headerRange.setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
    
    targetSheet.getRange(7, 1, rowsData.length, 1).setHorizontalAlignment("center");
    targetSheet.getRange(7, 2, rowsData.length, 1).setHorizontalAlignment("center");
    targetSheet.getRange(7, 4, rowsData.length, 4).setHorizontalAlignment("center");
    
    for (let col = 1; col <= headers.length; col++) {
      targetSheet.autoResizeColumn(col);
      let width = targetSheet.getColumnWidth(col);
      targetSheet.setColumnWidth(col, width + 12);
    }
    
    SpreadsheetApp.flush();
    
    const fileId = tempSs.getId();
    const url = "https://docs.google.com/spreadsheets/d/" + fileId + "/export?format=xlsx";
    const token = ScriptApp.getOAuthToken();
    const response = UrlFetchApp.fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token },
      muteHttpExceptions: true
    });
    
    const blob = response.getBlob();
    const base64Data = Utilities.base64Encode(blob.getBytes());
    
    DriveApp.getFileById(fileId).setTrashed(true);
    
    const tglUnduh = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy");
    return {
      status: "success",
      filename: "Data_Pendaftar_F5_MA_Al_Istiqomah_" + tglUnduh + ".xlsx",
      base64: base64Data
    };
  } catch (err) {
    return { status: "error", message: err.toString() };
  }
}

/**
 * MENCETAK FORMULIR PENDAFTARAN DINAMIS BERGAYA KEMENAG (UKURAN F5)
 */
function generatePdfF5(rowIndex) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Pendaftar');
    if (!sheet) return { status: 'error', message: 'Sheet Pendaftar tidak ditemukan.' };
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Tidak ada data pendaftar.' };
    
    let targetIndex = rowIndex ? parseInt(rowIndex) - 1 : data.length - 1;
    if (targetIndex < 1 || targetIndex >= data.length) targetIndex = data.length - 1;
    
    const row = data[targetIndex];
    
    const timestamp = row[0] instanceof Date ? row[0] : new Date();
    const tglCetak = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "dd MMMM yyyy");
    
    const regNo = "MA-2627-" + String(targetIndex).padStart(6, '0');
    
    const namaSiswa = row[1] || '-';
    const tempatLahirSiswa = row[2] || '-';
    const tglLahirSiswa = row[3] instanceof Date ? Utilities.formatDate(row[3], Session.getScriptTimeZone(), "dd-MM-yyyy") : (row[3] || '-');
    const nikSiswa = row[4] || '-';
    const nisnSiswa = row[5] || '-';
    
    const jenjangAsal = row[10] || '-';
    const statusAsal = row[11] || '-';
    const namaSekolahAsal = row[12] || '-';
    const npsnAsal = row[13] || '-';
    const alamatSekolahAsal = row[14] || '-';
    
    const noKk = row[15] || '-';
    const namaKk = row[16] || '-';
    const nikKk = row[17] || '-';
    const tempatLahirAyah = row[18] || '-';
    const tglLahirAyah = row[19] instanceof Date ? Utilities.formatDate(row[19], Session.getScriptTimeZone(), "dd-MM-yyyy") : (row[19] || '-');
    const statusAyah = row[20] || '-';
    const pendidikanAyah = row[21] || '-';
    const pekerjaanAyah = row[22] || '-';
    const penghasilanAyah = row[23] || '-';
    
    const namaIbu = row[24] || '-';
    const nikIbu = row[25] || '-';
    const tempatLahirIbu = row[26] || '-';
    const tglLahirIbu = row[27] instanceof Date ? Utilities.formatDate(row[27], Session.getScriptTimeZone(), "dd-MM-yyyy") : (row[27] || '-');
    const statusIbu = row[28] || '-';
    const pendidikanIbu = row[29] || '-';
    const pekerjaanIbu = row[30] || '-';
    const penghasilanIbu = row[31] || '-';

    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: 148mm 210mm; margin: 12mm 10mm; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; line-height: 1.3; color: #000; margin: 0; padding: 0; }
        .text-center { text-align: center; }
        .fw-bold { font-weight: bold; }
        .kop-container { border-bottom: 3px double #000; padding-bottom: 4px; margin-bottom: 10px; position: relative; }
        .logo-madrasah { position: absolute; left: 0; top: 0; width: 50px; height: auto; }
        .kop-text-1 { font-size: 11pt; font-weight: bold; margin: 0; letter-spacing: 0.5px; }
        .kop-text-2 { font-size: 13pt; font-weight: bold; margin: 2px 0 0 0; letter-spacing: 0.5px; color: #0A5C36; }
        .kop-text-sub { font-size: 7.5pt; font-style: italic; margin: 2px 0 0 0; font-family: 'Arial', sans-serif; }
        .judul-formulir { font-size: 11pt; font-weight: bold; text-decoration: underline; margin-top: 10px; margin-bottom: 3px; text-transform: uppercase; }
        .no-reg { font-size: 10pt; font-weight: bold; margin-bottom: 15px; font-family: monospace; }
        .section-header { background-color: #f0f0f0; font-weight: bold; padding: 3px 6px; font-size: 9.5pt; border: 0.5px solid #000; margin-top: 10px; margin-bottom: 5px; text-transform: uppercase; }
        table.form-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
        table.form-table td { padding: 2.5px 4px; vertical-align: top; font-size: 9.5pt; }
        table.form-table td.label { width: 33%; }
        table.form-table td.colon { width: 2%; text-align: center; }
        table.form-table td.value { width: 65%; }
        .ttd-container { width: 100%; margin-top: 20px; font-size: 9.5pt; }
        .ttd-box { float: right; width: 45%; text-align: center; }
        .ttd-space { height: 45px; }
      </style>
    </head>
    <body>
      <div class="kop-container text-center">
        <img class="logo-madrasah" src="https://masalistiqomah.sch.id/wp-content/uploads/2026/05/logo-e1492233052256.png" alt="Logo MA Al Istiqomah">
        <div class="kop-text-1">YAYASAN HUDAATUL UMAM</div>
        <div class="kop-text-2">MADRASAH ALIYAH AL ISTIQOMAH</div>
        <div class="kop-text-sub">Jl. Kawasan No. 63 Pasir Awi Suka Asih Kec. Pasar Kemis Kab. Tangerang - Banten</div>
        <div class="kop-text-sub" style="margin-top: 0px; font-style: normal; font-weight: 500;">Website: https://masalistiqomah.sch.id &nbsp;&nbsp; Email: infomasalistiqomah@gmail.com</div>
      </div>
      
      <div class="text-center">
        <div class="judul-formulir">Formulir Pendaftaran Siswa Baru<br>Tahun Pelajaran 2026/2027</div>
        <div class="no-reg">No. Registrasi: ${regNo}</div>
      </div>
      
      <div class="section-header">A. DATA SISWA</div>
      <table class="form-table">
        <tr><td class="label">Nama Lengkap</td><td class="colon">:</td><td class="value fw-bold">${namaSiswa}</td></tr>
        <tr><td class="label">NIK Siswa</td><td class="colon">:</td><td class="value">${nikSiswa}</td></tr>
        <tr><td class="label">Tempat, Tanggal Lahir</td><td class="colon">:</td><td class="value">${tempatLahirSiswa}, ${tglLahirSiswa}</td></tr>
        <tr><td class="label">NISN</td><td class="colon">:</td><td class="value">${nisnSiswa}</td></tr>
        <tr><td class="label">Sekolah Asal</td><td class="colon">:</td><td class="value">${namaSekolahAsal} (${jenjangAsal} / ${statusAsal})</td></tr>
        <tr><td class="label">NPSN Sekolah Asal</td><td class="colon">:</td><td class="value">${npsnAsal}</td></tr>
        <tr><td class="label">Alamat Lengkap Siswa</td><td class="colon">:</td><td class="value">${alamatSekolahAsal}</td></tr>
      </table>
      
      <div class="section-header">B. DATA ORANG TUA / WALI SISWA (AYAH)</div>
      <table class="form-table">
        <tr><td class="label">No. Kartu Keluarga (KK)</td><td class="colon">:</td><td class="value">${noKk}</td></tr>
        <tr><td class="label">Nama Kepala Keluarga</td><td class="colon">:</td><td class="value">${namaKk}</td></tr>
        <tr><td class="label">NIK Kepala Keluarga</td><td class="colon">:</td><td class="value">${nikKk}</td></tr>
        <tr><td class="label">Tempat, Tanggal Lahir</td><td class="colon">:</td><td class="value">${tempatLahirAyah}, ${tglLahirAyah}</td></tr>
        <tr><td class="label">Status Hubungan / Ayah</td><td class="colon">:</td><td class="value">${statusAyah}</td></tr>
        <tr><td class="label">Pendidikan Terakhir</td><td class="colon">:</td><td class="value">${pendidikanAyah}</td></tr>
        <tr><td class="label">Pekerjaan</td><td class="colon">:</td><td class="value">${pekerjaanAyah}</td></tr>
        <tr><td class="label">Penghasilan Bulanan</td><td class="colon">:</td><td class="value">${penghasilanAyah}</td></tr>
      </table>
      
      <div class="section-header">C. DATA IBU KANDUNG</div>
      <table class="form-table">
        <tr><td class="label">Nama Ibu Kandung</td><td class="colon">:</td><td class="value">${namaIbu}</td></tr>
        <tr><td class="label">NIK Ibu</td><td class="colon">:</td><td class="value">${nikIbu}</td></tr>
        <tr><td class="label">Tempat, Tanggal Lahir</td><td class="colon">:</td><td class="value">${tempatLahirIbu}, ${tglLahirIbu}</td></tr>
        <tr><td class="label">Status Ibu</td><td class="colon">:</td><td class="value">${statusIbu}</td></tr>
        <tr><td class="label">Pendidikan Ibu</td><td class="colon">:</td><td class="value">${pendidikanIbu}</td></tr>
        <tr><td class="label">Pekerjaan Ibu</td><td class="colon">:</td><td class="value">${pekerjaanIbu}</td></tr>
        <tr><td class="label">Penghasilan Ibu</td><td class="colon">:</td><td class="value">${penghasilanIbu}</td></tr>
      </table>
      
      <div class="ttd-container">
        <div class="ttd-box">
          <div>Pasarkemis, ${tglCetak}</div>
          <div>Orang Tua / Wali Siswa,</div>
          <div class="ttd-space"></div>
          <div class="fw-bold" style="text-decoration: underline;">${namaKk}</div>
        </div>
        <div class="ttd-box" style="float: left;">
          <div>&nbsp;</div>
          <div>Calon Siswa Baru,</div>
          <div class="ttd-space"></div>
          <div class="fw-bold" style="text-decoration: underline;">${namaSiswa}</div>
        </div>
        <div style="clear: both;"></div>
      </div>
    </body>
    </html>
    `;
    
    const htmlBlob = Utilities.newBlob(htmlContent, 'text/html', 'temp.html');
    const pdfBlob = htmlBlob.getAs('application/pdf').setName('Formulir_' + namaSiswa.replace(/\s+/g, '_') + '_F5.pdf');
    
    return {
      status: 'success',
      base64: Utilities.base64Encode(pdfBlob.getBytes()),
      filename: 'Formulir_' + namaSiswa.replace(/\s+/g, '_') + '_F5.pdf'
    };
    
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

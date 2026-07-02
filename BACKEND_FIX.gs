/**
 * SALIN KODE INI KE Google Apps Script (Code.gs)
 * Versi ini memperbaiki:
 * 1. Pembuatan sheet "Absensi Siswa" jika belum ada.
 * 2. Pemuatan jadwal yang lebih robust (case-insensitive & trim).
 * 3. Log untuk membantu tracing jika ada error.
 */

function simpanAbsensiSiswa(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "Absensi Siswa";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    try {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["TANGGAL", "HARI", "GURU", "KELAS", "MAPEL", "DATA ABSENSI (JSON)"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#d9ead3");
    } catch (e) {
      return "Gagal membuat sheet: " + e.toString();
    }
  }
  
  try {
    sheet.appendRow([
      data.tgl, 
      (data.hari || "").toString().toUpperCase().trim(), 
      (data.guru || "").toString().toUpperCase().trim(), 
      (data.kelas || "").toString().toUpperCase().trim(), 
      (data.mapel || "").toString().toUpperCase().trim(), 
      JSON.stringify(data.absensi)
    ]);
    return "Laporan Absensi Siswa Berhasil Disimpan!";
  } catch (e) {
    return "Gagal menyimpan data: " + e.toString();
  }
}

function getLaporanAbsensiSiswa(tgl, kelas) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Absensi Siswa");
  if (!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  var header = data[0].map(function(h) { return h.toString().toLowerCase().trim(); });
  var rows = data.slice(1);
  
  var results = [];
  rows.forEach(function(row) {
    var obj = {};
    header.forEach(function(h, index) {
      obj[h] = row[index];
    });
    
    // Filter by date and class (case insensitive)
    if (obj.tanggal == tgl && (obj.kelas || "").toString().toUpperCase().trim() === (kelas || "").toUpperCase().trim()) {
      try {
        obj.absensi = JSON.parse(obj["data absensi (json)"]);
      } catch(e) {
        obj.absensi = [];
      }
      results.push(obj);
    }
  });
  
  return results;
}

function getDaftarJadwal(namaGuru, role) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Coba beberapa kemungkinan nama sheet
  var sheet = ss.getSheetByName("Jadwal Guru") || ss.getSheetByName("Jadwal") || ss.getSheetByName("Data_Jadwal");
  if (!sheet) {
    Logger.log("Sheet Jadwal tidak ditemukan");
    return [];
  }
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  var header = data[0].map(function(h) { return h.toString().toLowerCase().trim(); });
  var rows = data.slice(1);
  
  var results = [];
  var roleUpper = (role || "").toString().toUpperCase();
  var namaGuruUpper = (namaGuru || "").toString().toUpperCase().trim();

  rows.forEach(function(row) {
    var obj = {};
    var isEmpty = true;
    header.forEach(function(h, index) {
      var val = row[index];
      obj[h] = val;
      if (val) isEmpty = false;
    });
    
    if (isEmpty) return; // Lewati baris kosong
    
    // Logic filter: Admin/Operator/Kepsek melihat semua
    // Guru hanya melihat miliknya (menggunakan partial match untuk nama guru)
    if (roleUpper === "ADMIN" || roleUpper === "OPERATOR" || roleUpper === "KEPALA SEKOLAH") {
      results.push(obj);
    } else {
      var entryGuru = (obj.guru || "").toString().toUpperCase().trim();
      // Gunakan includes agar jika di sheet "DEDE" tapi di sistem "DEDE IKAH" tetap masuk
      if (entryGuru && (namaGuruUpper.indexOf(entryGuru) !== -1 || entryGuru.indexOf(namaGuruUpper) !== -1)) {
        results.push(obj);
      }
    }
  });
  
  return results;
}

function simpanJadwalGuru(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "Jadwal Guru";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["HARI", "JAM", "KELAS", "MAPEL", "GURU", "RUANG"]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#cfe2f3");
  }
  
  try {
    sheet.appendRow([
      (data.hari || "").toString().toUpperCase().trim(),
      data.jam,
      (data.kelas || "").toString().toUpperCase().trim(),
      (data.mapel || "").toString().toUpperCase().trim(),
      (data.guru || "").toString().toUpperCase().trim(),
      (data.ruang || "").toString().toUpperCase().trim()
    ]);
    return "Jadwal Berhasil Disimpan!";
  } catch (e) {
    return "Gagal menyimpan jadwal: " + e.toString();
  }
}

function getMasterSekolah() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Master_Sekolah");
  if (!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  var header = data[0].map(function(h) { return h.toString().toLowerCase().replace(/ /g, '').trim(); });
  var rows = data.slice(1);
  
  return rows.map(function(row) {
    var obj = {};
    header.forEach(function(h, index) {
      obj[h] = row[index];
    });
    return obj;
  });
}

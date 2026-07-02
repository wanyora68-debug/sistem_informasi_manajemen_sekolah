/* ============================================================
   SIMS KCD XI - BACKEND (Code.gs)
   ============================================================ */

var SS_ID = "1HhnC4unsjpSV_9oadCSGB_xSadJYfs9Bx2obp2fpp9o"; 
var FOLDER_FOTO_ID = "1Hz5DoxAD3Tg4lwordmYfXpPUCkwDl7kK";

function getSpreadsheet() {
  var ss = null;
  try {
    if (SS_ID && SS_ID !== "YOUR_SPREADSHEET_ID_HERE" && SS_ID !== "") {
      ss = SpreadsheetApp.openById(SS_ID);
    }
  } catch (e) {
    Logger.log("Inaccessible SS_ID: " + e.toString());
  }
  
  if (!ss) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e2) {
      Logger.log("getActiveSpreadsheet error: " + e2.toString());
    }
  }

  if (!ss) {
    throw new Error("DATABASE SPREADSHEET TIDAK DAPAT DIAKSES!\n\n" +
                    "Solusi Terbuka:\n" +
                    "1. Jika Anda membuat script mandiri (Standalone Script) di Google Apps Script, Anda WAJIB mengganti nilai variabel \"SS_ID\" di baris ke-5 file Code.gs dengan ID Spreadsheet milik Anda sendiri.\n" +
                    "2. Jika Anda membuat Script Terikat (Bound Script), pastikan Anda membukanya melalui menu Extensions -> Apps Script di dalam Spreadsheet Anda agar terhubung secara otomatis.");
  }

  // Auto-initialize sheets inside the spreadsheet
  bootstrapDatabase(ss);

  return ss;
}

function bootstrapDatabase(ss) {
  try {
    // 1. Data_User Sheet
    var sheetUser = ss.getSheetByName("Data_User");
    if (!sheetUser) {
      sheetUser = ss.insertSheet("Data_User");
      var headersUser = ["Timestamp", "Nama", "Email", "Password", "Role", "Sekolah", "Foto URL", "Status Akun", "Mapel", "NIP/NUPTK", "Pangkat", "Golongan"];
      sheetUser.appendRow(headersUser);
      sheetUser.getRange(1, 1, 1, headersUser.length).setFontWeight("bold").setBackground("#cfe2f3");
      
      // Default users seeding
      var defaultUsers = [
        [new Date(), "System Admin", "wanyora68@gmail.com", "admin", "Admin", "PUSAT KCD XI", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "", "", "", ""],
        [new Date(), "System Admin Demo", "admin@demo.com", "admin", "Admin", "PUSAT KCD XI", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "", "", "", ""],
        [new Date(), "Guru Demo", "guru@demo.com", "guru", "Guru", "SMKN 4 GARUT", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "TEKNOLOGI INFORMASI", "198504122010121003", "Penata", "III/c"],
        [new Date(), "Kepala Sekolah Demo", "kepsek@demo.com", "kepsek", "Kepala Sekolah", "SMKN 4 GARUT", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "", "", "", ""],
        [new Date(), "Operator Demo", "operator@demo.com", "operator", "Operator", "SMKN 4 GARUT", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "", "", "", ""],
        [new Date(), "Pengawas Demo", "pengawas@demo.com", "pengawas", "Pengawas", "PUSAT KCD XI", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "", "", "", ""]
      ];
      for (var f = 0; f < defaultUsers.length; f++) {
        sheetUser.appendRow(defaultUsers[f]);
      }
    } else {
      if (sheetUser.getLastRow() === 0) {
        var headersUser = ["Timestamp", "Nama", "Email", "Password", "Role", "Sekolah", "Foto URL", "Status Akun", "Mapel", "NIP/NUPTK", "Pangkat", "Golongan"];
        sheetUser.appendRow(headersUser);
        sheetUser.getRange(1, 1, 1, headersUser.length).setFontWeight("bold").setBackground("#cfe2f3");
      }
      if (sheetUser.getLastRow() === 1) {
        var defaultUsers = [
          [new Date(), "System Admin", "wanyora68@gmail.com", "admin", "Admin", "PUSAT KCD XI", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "", "", "", ""],
          [new Date(), "System Admin Demo", "admin@demo.com", "admin", "Admin", "PUSAT KCD XI", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "", "", "", ""],
          [new Date(), "Guru Demo", "guru@demo.com", "guru", "Guru", "SMKN 4 GARUT", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "TEKNOLOGI INFORMASI", "198504122010121003", "Penata", "III/c"],
          [new Date(), "Kepala Sekolah Demo", "kepsek@demo.com", "kepsek", "Kepala Sekolah", "SMKN 4 GARUT", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "", "", "", ""],
          [new Date(), "Operator Demo", "operator@demo.com", "operator", "Operator", "SMKN 4 GARUT", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "", "", "", ""],
          [new Date(), "Pengawas Demo", "pengawas@demo.com", "pengawas", "Pengawas", "PUSAT KCD XI", "https://www.w3schools.com/howto/img_avatar.png", "Aktif", "", "", "", ""]
        ];
        for (var f = 0; f < defaultUsers.length; f++) {
          sheetUser.appendRow(defaultUsers[f]);
        }
      }
    }

    // 2. Master_Sekolah Sheet
    var sheetSekolah = ss.getSheetByName("Master_Sekolah");
    if (!sheetSekolah) {
      sheetSekolah = ss.insertSheet("Master_Sekolah");
      var headersSekolah = ["Nama Sekolah", "Latitude", "Longitude", "Jam Masuk", "Jam Pulang"];
      sheetSekolah.appendRow(headersSekolah);
      sheetSekolah.getRange(1, 1, 1, headersSekolah.length).setFontWeight("bold").setBackground("#cfe2f3");
      
      var defaultSchools = [
        ["SMKN 4 GARUT", "-7.227228", "107.894391", "07:00", "15:00"],
        ["SMKN 1 GARUT", "-7.204556", "107.892019", "07:00", "15:00"],
        ["SMKN 2 GARUT", "-7.209121", "107.899321", "07:00", "15:00"],
        ["SMKN 10 GARUT", "-7.251912", "107.910321", "07:00", "15:00"],
        ["SMA NEGERI 1 GARUT", "-7.213214", "107.891231", "07:00", "15:00"],
        ["PUSAT KCD XI", "-7.227800", "107.908700", "07:00", "15:00"]
      ];
      for (var s = 0; s < defaultSchools.length; s++) {
        sheetSekolah.appendRow(defaultSchools[s]);
      }
    }

    // 3. Sekolah_Binaan Sheet
    var sheetBinaan = ss.getSheetByName("Sekolah_Binaan");
    if (!sheetBinaan) {
      sheetBinaan = ss.insertSheet("Sekolah_Binaan");
      var headersBinaan = ["Timestamp", "Pengawas", "Nama Sekolah", "NPSN", "Alamat"];
      sheetBinaan.appendRow(headersBinaan);
      sheetBinaan.getRange(1, 1, 1, headersBinaan.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

    // 4. Data_Aktivitas Sheet
    var sheetAktivitas = ss.getSheetByName("Data_Aktivitas");
    if (!sheetAktivitas) {
      sheetAktivitas = ss.insertSheet("Data_Aktivitas");
      var headersAktivitas = ["Timestamp", "Guru", "Hari", "Tanggal", "Kegiatan", "Tempat", "Penyelenggara", "Deskripsi", "Surat Tugas", "Foto 1", "Foto 2", "Feedback Kepsek"];
      sheetAktivitas.appendRow(headersAktivitas);
      sheetAktivitas.getRange(1, 1, 1, headersAktivitas.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

    // 5. Data_Siswa Sheet
    var sheetSiswa = ss.getSheetByName("Data_Siswa");
    if (!sheetSiswa) {
      sheetSiswa = ss.insertSheet("Data_Siswa");
      var headersSiswa = ["Timestamp", "Nama Siswa", "NISN", "Kelas", "Sekolah"];
      sheetSiswa.appendRow(headersSiswa);
      sheetSiswa.getRange(1, 1, 1, headersSiswa.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

    // 6. Absensi_Guru Sheet
    var sheetAbsenGuru = ss.getSheetByName("Absensi_Guru");
    if (!sheetAbsenGuru) {
      sheetAbsenGuru = ss.insertSheet("Absensi_Guru");
      var headersAbsenGuru = ["Timestamp", "Nama Guru", "Tanggal", "Waktu", "Status", "Metode", "Suhu", "Foto Selfie", "Lokasi Map", "Sekolah", "Keterangan", "Verifikasi Biometrik"];
      sheetAbsenGuru.appendRow(headersAbsenGuru);
      sheetAbsenGuru.getRange(1, 1, 1, headersAbsenGuru.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

    // 7. Absensi_Siswa Sheet
    var sheetAbsenSiswa = ss.getSheetByName("Absensi_Siswa");
    if (!sheetAbsenSiswa) {
      sheetAbsenSiswa = ss.insertSheet("Absensi_Siswa");
      var headersAbsenSiswa = ["TANGGAL", "HARI", "GURU", "KELAS", "MAPEL", "DATA ABSENSI (JSON)"];
      sheetAbsenSiswa.appendRow(headersAbsenSiswa);
      sheetAbsenSiswa.getRange(1, 1, 1, headersAbsenSiswa.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

    // 8. Jurnal_Mengajar Sheet
    var sheetJurnal = ss.getSheetByName("Jurnal_Mengajar");
    if (!sheetJurnal) {
      sheetJurnal = ss.insertSheet("Jurnal_Mengajar");
      var headersJurnal = ["TIMESTAMP", "GURU", "HARI", "TANGGAL", "KELAS", "KEAHLIAN", "JAM", "MAPEL", "MATERI", "FOTO 1", "FOTO 2"];
      sheetJurnal.appendRow(headersJurnal);
      sheetJurnal.getRange(1, 1, 1, headersJurnal.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

    // 9. Nilai_Siswa_Complex
    var sheetNilai = ss.getSheetByName("Nilai_Siswa_Complex");
    if (!sheetNilai) {
      sheetNilai = ss.insertSheet("Nilai_Siswa_Complex");
      var headersNilai = ["Timestamp", "Sekolah", "Kelas", "Mapel", "Tipe", "Nama Evaluasi", "Data_Nilai_JSON"];
      sheetNilai.appendRow(headersNilai);
      sheetNilai.getRange(1, 1, 1, headersNilai.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

    // 10. Jadwal Mengajar
    var sheetJadwal = ss.getSheetByName("Jadwal Mengajar");
    if (!sheetJadwal) {
      sheetJadwal = ss.insertSheet("Jadwal Mengajar");
      var headersJadwal = ["ID", "GURU", "HARI", "JAM_MULAI", "JAM_SELESAI", "MAPEL", "KELAS", "SEKOLAH"];
      sheetJadwal.appendRow(headersJadwal);
      sheetJadwal.getRange(1, 1, 1, headersJadwal.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

    // 11. Aktivitas_Kepsek
    var sheetAktKepsek = ss.getSheetByName("Aktivitas_Kepsek");
    if (!sheetAktKepsek) {
      sheetAktKepsek = ss.insertSheet("Aktivitas_Kepsek");
      var headersAktKepsek = ["Timestamp", "Kepala Sekolah", "Hari", "Tanggal", "Nama Kegiatan", "Tempat Kegiatan", "Deskripsi", "Surat Tugas", "Foto Dokumentasi 1", "Foto Dokumentasi 2", "Sekolah"];
      sheetAktKepsek.appendRow(headersAktKepsek);
      sheetAktKepsek.getRange(1, 1, 1, headersAktKepsek.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

    // 12. Laporan_Kepsek
    var sheetLapKepsek = ss.getSheetByName("Laporan_Kepsek");
    if (!sheetLapKepsek) {
      sheetLapKepsek = ss.insertSheet("Laporan_Kepsek");
      var headersLapKepsek = ["Timestamp", "Kepala Sekolah", "Tanggal Pelaporan", "Nama Kegiatan", "Deskripsi Laporan", "Dokumen", "Sekolah"];
      sheetLapKepsek.appendRow(headersLapKepsek);
      sheetLapKepsek.getRange(1, 1, 1, headersLapKepsek.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

    // 13. Lokasi_Sekolah Sheet (Tambahan terpisah untuk konfigurasi lokasi koordinat & jam kerja oleh operator)
    var sheetLokasi = ss.getSheetByName("Lokasi_Sekolah");
    if (!sheetLokasi) {
      sheetLokasi = ss.insertSheet("Lokasi_Sekolah");
      var headersLokasi = ["Nama Sekolah", "Latitude", "Longitude", "Jam Masuk", "Jam Pulang"];
      sheetLokasi.appendRow(headersLokasi);
      sheetLokasi.getRange(1, 1, 1, headersLokasi.length).setFontWeight("bold").setBackground("#cfe2f3");
    }

  } catch (err) {
    Logger.log("bootstrapDatabase error: " + err.toString());
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.ping) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Koneksi ke Google Apps Script Berhasil!",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setTitle("SIMS KCD XI");
}

function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var functionName = requestData.functionName;
    var args = requestData.arguments || [];
    
    // Check if function exists in the global scope
    if (typeof this[functionName] === "function") {
      var result = this[functionName].apply(null, args);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        result: result
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Fungsi '" + functionName + "' tidak ditemukan di Google Apps Script."
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/* --- SISTEM LOGIN --- */
function prosesLogin(email, password, roleInput) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_User");
    if (!sheet) {
      return { status: "error", message: "Database Data_User tidak ditemukan." };
    }
    var inputEmail = email ? email.toString().toLowerCase().trim() : "";
    var inputPass = password ? password.toString().trim() : "";

    if (!inputEmail || !inputPass) {
      return { status: "error", message: "Email dan password tidak boleh kosong." };
    }

    var data = sheet.getDataRange().getValues();
    var foundUser = null;

    for (var i = 1; i < data.length; i++) {
      if (data[i] && data[i].length > 3) {
        var cellEmail = data[i][2] ? data[i][2].toString().toLowerCase().trim() : "";
        var cellPass = data[i][3] ? data[i][3].toString().trim() : "";
        
        if (cellEmail === inputEmail && cellPass === inputPass) {
          var statusAkun = data[i][7] ? data[i][7].toString().toLowerCase().trim() : "aktif";
          if (statusAkun === "pending") {
            return { status: "error", message: "Akun Anda sedang diverifikasi admin." };
          }

          foundUser = {
            status: "success",
            user: {
              nama: data[i][1] ? data[i][1].toString() : "",
              email: cellEmail,
              role: data[i][4] ? data[i][4].toString() : "Guru",
              sekolah: (data[i][5] && data[i][5].toString() !== "") ? data[i][5].toString() : "SMKN 4 GARUT",
              fotoUrl: (data[i][6] && data[i][6].toString() !== "") ? data[i][6].toString() : "https://www.w3schools.com/howto/img_avatar.png",
              mapel: data[i][8] ? data[i][8].toString() : "",
              nip: data[i][9] ? data[i][9].toString() : "",
              pangkat: data[i][10] ? data[i][10].toString() : "",
              golongan: data[i][11] ? data[i][11].toString() : "",
              row: i + 1
            }
          };
          break;
        }
      }
    }

    if (foundUser) return foundUser;

    // HARDCODED ADMIN CHECK (Fallback)
    if (inputEmail === "wanyora68@gmail.com" && inputPass === "admin") {
       return {
          status: "success",
          user: {
            nama: "System Admin",
            email: "wanyora68@gmail.com",
            role: "Admin",
            sekolah: "PUSAT KCD XI",
            fotoUrl: "https://www.w3schools.com/howto/img_avatar.png",
            row: 0
          }
       };
    }

    if (inputEmail === "admin@demo.com" && inputPass === "admin") {
       return {
          status: "success",
          user: {
            nama: "System Admin Demo",
            email: "admin@demo.com",
            role: "Admin",
            sekolah: "PUSAT KCD XI",
            fotoUrl: "https://www.w3schools.com/howto/img_avatar.png",
            row: 0
          }
       };
    }

    if (inputEmail === "guru@demo.com" && inputPass === "guru") {
       return {
          status: "success",
          user: {
            nama: "Guru Demo",
            email: "guru@demo.com",
            role: "Guru",
            sekolah: "SMKN 4 GARUT",
            fotoUrl: "https://www.w3schools.com/howto/img_avatar.png",
            mapel: "TEKNOLOGI INFORMASI",
            nip: "198504122010121003",
            pangkat: "Penata",
            golongan: "III/c",
            row: 0
          }
       };
    }

    if (inputEmail === "kepsek@demo.com" && inputPass === "kepsek") {
       return {
          status: "success",
          user: {
            nama: "Kepala Sekolah Demo",
            email: "kepsek@demo.com",
            role: "Kepala Sekolah",
            sekolah: "SMKN 4 GARUT",
            fotoUrl: "https://www.w3schools.com/howto/img_avatar.png",
            row: 0
          }
       };
    }

    if (inputEmail === "operator@demo.com" && inputPass === "operator") {
       return {
          status: "success",
          user: {
            nama: "Operator Demo",
            email: "operator@demo.com",
            role: "Operator",
            sekolah: "SMKN 4 GARUT",
            fotoUrl: "https://www.w3schools.com/howto/img_avatar.png",
            row: 0
          }
       };
    }

    if (inputEmail === "pengawas@demo.com" && inputPass === "pengawas") {
       return {
          status: "success",
          user: {
            nama: "Pengawas Sekolah Demo",
            email: "pengawas@demo.com",
            role: "Pengawas",
            sekolah: "PUSAT KCD XI",
            fotoUrl: "https://www.w3schools.com/howto/img_avatar.png",
            row: 0
          }
       };
    }

    return { status: "error", message: "Email atau Password salah." };
  } catch (e) { 
    return { status: "error", message: "Gagal memproses login: " + e.toString() }; 
  }
}

/* --- UPDATE PROFIL --- */
function updateProfilGuru(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_User");
    var email = obj.emailUser.toString().toLowerCase().trim();
    
    Logger.log("updateProfilGuru: email=" + email + " namaBaru=" + obj.namaBaru);

    var data = sheet.getDataRange().getValues();
    var actualRow = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][2] && data[i][2].toString().toLowerCase().trim() === email) {
        actualRow = i + 1;
        break;
      }
    }

    if (actualRow === -1 && (email === "wanyora68@gmail.com" || email === "admin@gmail.com")) {
      Logger.log("updateProfilGuru: User hardcoded detected, creating entry.");
      sheet.appendRow([new Date(), obj.namaBaru || "System Admin", email, "admin", "Admin", "PUSAT KCD XI", "", "Aktif", obj.mapelBaru || ""]);
      actualRow = sheet.getLastRow();
    }

    if (actualRow === -1) {
      Logger.log("updateProfilGuru: User not found in Data_User sheet.");
      return { status: "error", message: "User " + email + " tidak ditemukan di database." };
    }

    var returnUrl = "";
    if (obj.namaBaru) sheet.getRange(actualRow, 2).setValue(obj.namaBaru);
    if (obj.mapelBaru !== undefined) sheet.getRange(actualRow, 9).setValue(obj.mapelBaru);
    if (obj.nip !== undefined) sheet.getRange(actualRow, 10).setValue(obj.nip);
    if (obj.pangkat !== undefined) sheet.getRange(actualRow, 11).setValue(obj.pangkat);
    if (obj.golongan !== undefined) sheet.getRange(actualRow, 12).setValue(obj.golongan);
    
    if (obj.fotoBase64) {
      Logger.log("updateProfilGuru: Uploading photo...");
      var folder;
      try { folder = DriveApp.getFolderById(FOLDER_FOTO_ID); } catch(e) { folder = DriveApp.getRootFolder(); }
      var content = obj.fotoBase64.split(",");
      var bytes = Utilities.base64Decode(content[1]);
      var blob = Utilities.newBlob(bytes, "image/jpeg", "PROFIL_" + email + "_" + new Date().getTime() + ".jpg");
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      returnUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
      sheet.getRange(actualRow, 7).setValue(returnUrl);
    }
    
    SpreadsheetApp.flush();
    return { status: "success", newUrl: returnUrl, message: "Profil berhasil diperbarui!", row: actualRow };
  } catch (e) { 
    Logger.log("updateProfilGuru Error: " + e.toString());
    return { status: "error", message: "Gagal Update: " + e.toString() }; 
  }
}

/* --- MANAJEMEN USER (ADMIN) --- */
function getDaftarUserManagement() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_User");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < data.length; i++) {
      list.push({
        row: i + 1,
        nama: data[i][1],
        email: data[i][2],
        password: data[i][3],
        role: data[i][4],
        sekolah: data[i][5],
        status: data[i][7],
        mapel: data[i][8] || "",
        nip: data[i][9] || "",
        pangkat: data[i][10] || "",
        golongan: data[i][11] || ""
      });
    }
    return list;
  } catch (e) { return []; }
}

function simpanUserManagemen(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_User");
    var rowNum = obj.row ? Number(obj.row) : 0;
    if (rowNum && rowNum > 1) {
      sheet.getRange(rowNum, 2, 1, 4).setValues([[obj.nama, obj.email, obj.password, obj.role]]);
      sheet.getRange(rowNum, 6).setValue(obj.sekolah);
      sheet.getRange(rowNum, 9).setValue(obj.mapel || "");
      sheet.getRange(rowNum, 10).setValue(obj.nip || "");
      sheet.getRange(rowNum, 11).setValue(obj.pangkat || "");
      sheet.getRange(rowNum, 12).setValue(obj.golongan || "");
      return "User berhasil diperbarui!";
    } else {
      sheet.appendRow([
        new Date(), 
        obj.nama, 
        obj.email, 
        obj.password, 
        obj.role, 
        obj.sekolah, 
        "", 
        "Aktif", 
        obj.mapel || "", 
        obj.nip || "", 
        obj.pangkat || "", 
        obj.golongan || ""
      ]);
      return "User baru berhasil ditambahkan!";
    }
  } catch (e) { return "Gagal: " + e.toString(); }
}

function hapusUserManagemen(row) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_User");
    sheet.deleteRow(Number(row));
    return "User telah dihapus.";
  } catch (e) { return "Gagal: " + e.toString(); }
}

/* --- FUNGSI AKTIVITAS --- */
function simpanAktivitas(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Aktivitas");
    if (!sheet) {
      sheet = ss.insertSheet("Data_Aktivitas");
      sheet.appendRow(["Timestamp", "Guru", "Hari", "Tanggal", "Kegiatan", "Tempat", "Penyelenggara", "Deskripsi", "Surat Tugas", "Foto 1", "Foto 2", "Feedback Kepsek"]);
    }

    var folder;
    try { folder = DriveApp.getFolderById(FOLDER_FOTO_ID); } catch(e) { folder = DriveApp.getRootFolder(); }
    
    var urls = { st: "", f1: "", f2: "" };
    if (obj.st) urls.st = uploadFileBase64(obj.st, "ST_" + obj.guru, folder);
    if (obj.f1) urls.f1 = uploadFileBase64(obj.f1, "AKT1_" + obj.guru, folder);
    if (obj.f2) urls.f2 = uploadFileBase64(obj.f2, "AKT2_" + obj.guru, folder);

    sheet.appendRow([
      new Date(), obj.guru, obj.hari, obj.tgl, obj.namaKegiatan, 
      obj.tempat, obj.penyelenggara, obj.deskripsi, 
      urls.st, urls.f1, urls.f2, ""
    ]);
    return "Aktivitas berhasil disimpan!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function getDaftarAktivitas(userNama, role, sekolah) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Aktivitas");
    if (!sheet) return [];
    var data = sheet.getDataRange().getDisplayValues(); 
    
    var userSheet = ss.getSheetByName("Data_User");
    var userData = userSheet ? userSheet.getDataRange().getValues() : [];
    
    var normalizeName = function(name) {
      if (!name) return "";
      return name.toString().toUpperCase()
                 .replace(/\b(SPD|MPD|ST|SE|H|HJ|DRS|DRA|SPD\.I|MPD\.I|LC|LLM|MH|MM|SKOM|SAG|MSI|PHD|PROF|KAPTEN|MAYOR|KOLONEL|BRIGADIR|AKBP|KOMPOL)\b/g, "")
                 .replace(/[^A-Z0-9\s]/g, "")
                 .replace(/\s+/g, " ")
                 .trim();
    };

    var guruSekolah = {};
    for (var k = 1; k < userData.length; k++) {
      guruSekolah[normalizeName(userData[k][1])] = (userData[k][5] || "").toString().toUpperCase().trim();
    }

    var list = [];
    var roleLow = (role || "").toString().toLowerCase().trim();
    var targetNameNorm = normalizeName(userNama);
    var targetSchoolNorm = (sekolah || "").toString().toUpperCase().trim();

    for (var i = 1; i < data.length; i++) {
        var rowData = data[i];
        if (!rowData || rowData.length < 2) continue;

        var dbGuruRaw = (rowData[1] || "").toString();
        var dbGuruNorm = normalizeName(dbGuruRaw);
        
        if (roleLow === "guru") {
           if (dbGuruNorm !== targetNameNorm) continue;
        } else if (roleLow === "kepala sekolah" || roleLow === "operator" || roleLow === "admin") {
           if (roleLow !== "admin" && targetSchoolNorm !== "PUSAT KCD XI" && targetSchoolNorm !== "") {
              if (guruSekolah[dbGuruNorm] !== targetSchoolNorm && dbGuruNorm !== targetNameNorm) continue;
           }
        }

        list.push({
          sekolah: guruSekolah[dbGuruNorm] || "",
          row: i + 1,
          timestamp: rowData[0],
          guru: rowData[1], hari: rowData[2], tgl: rowData[3], 
          kegiatan: rowData[4], tempat: rowData[5], penyelenggara: rowData[6], deskripsi: rowData[7],
          st: rowData[8], f1: rowData[9], f2: rowData[10], 
          feedback: rowData[11] || ""
        });
    }
    list.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    return list;
  } catch (e) { 
    Logger.log("Error getDaftarAktivitas: " + e.toString());
    return []; 
  }
}

function getRekapPenugasanGuru(sekolah) {
  try {
    var ss = getSpreadsheet();
    var userSheet = ss.getSheetByName("Data_User");
    var jadwalSheet = ss.getSheetByName("Jadwal Mengajar") || ss.getSheetByName("Data_Jadwal");
    
    if (!userSheet || !jadwalSheet) return [];
    
    var userData = userSheet.getDataRange().getValues();
    var jadwalData = jadwalSheet.getDataRange().getValues();
    
    var teachers = [];
    var schoolTask = (sekolah || "").toString().toUpperCase().trim();

    for (var i = 1; i < userData.length; i++) {
        var role = (userData[i][4] || "").toString().trim();
        var sch = (userData[i][5] || "").toString().trim();
        var schNorm = sch.toUpperCase().trim();

        if (role === "Guru" && (schNorm === schoolTask || schoolTask === "" || schoolTask === "PUSAT KCD XI")) {
            teachers.push({
                nama: userData[i][1],
                email: userData[i][2],
                sekolah: sch,
                mapel: userData[i][8] || "-"
            });
        }
    }
    
    teachers.forEach(function(t) {
        var classes = [];
        var normT = t.nama.toUpperCase().trim();
        for (var j = 1; j < jadwalData.length; j++) {
            var jGuru = (jadwalData[j][5] || "").toString().toUpperCase().trim(); // Nama Guru di kolom 6 (index 5)
            var jKls = (jadwalData[j][3] || "").toString().trim(); // Kelas di kolom 4 (index 3)
            if (jGuru === normT && classes.indexOf(jKls) === -1) {
                classes.push(jKls);
            }
        }
        t.kelas = classes.join(", ") || "Belum ada jadwal";
    });
    
    return teachers;
  } catch (e) { return []; }
}

function simpanFeedbackAktivitas(row, text) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Aktivitas");
    sheet.getRange(Number(row), 12).setValue(text);
    return "Feedback Aktivitas berhasil dikirim!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

/* --- REGISTRASI & MASTER --- */
function getMasterSekolah() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Master_Sekolah");
    if (!sheet) {
      Logger.log("Sheet Master_Sekolah tidak temukan.");
      return [];
    }
    var data = sheet.getDataRange().getValues();
    var list = [];
    
    // Helper to extract time string HH:mm from various types
    var parseTime = function(val) {
       if (!val) return null;
       if (val instanceof Date) {
          try {
             var tz = ss ? ss.getSpreadsheetTimeZone() : "GMT+7";
             return Utilities.formatDate(val, tz, "HH:mm");
          } catch(e) {
             var hrs = val.getHours().toString().padStart(2, '0');
             var mins = val.getMinutes().toString().padStart(2, '0');
             return hrs + ":" + mins;
          }
       }
       var s = val.toString().trim();
       
       // Handle 7:00 -> 07:00
       if (s.match(/^\d:\d{2}$/)) s = "0" + s;

       // Replace dots or other separators
       s = s.replace('.', ':').replace(',', ':');
       
       // Jika formatnya desimal (jam dari excel/sheets kadang terbaca desimal)
       if (!isNaN(val) && val !== "" && parseFloat(val) < 1) {
          var hours = Math.floor(val * 24);
          var minutes = Math.floor(Math.round((val * 24 - hours) * 60));
          return hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0');
       }
       var match = s.match(/^(\d{1,2}):(\d{2})(:(\d{2}))?$/);
       if (match) {
          var h = match[1].padStart(2, '0');
          var m = match[2];
          return h + ":" + m;
       }
       return null;
    };

    var colNpsn = 0;
    var colNama = 1;
    var colLat = 2;
    var colLng = 3;
    var colJamM = 4;
    var colJamP = 5;
    var colAlamat = -1;
    var colKepsek = -1;

    if (data.length > 0) {
      var firstRow = data[0];
      for (var col = 0; col < firstRow.length; col++) {
        var cellVal = firstRow[col];
        if (!cellVal) continue;
        var h = cellVal.toString().toLowerCase().trim();
        if (h === "npsn") colNpsn = col;
        else if (h.indexOf("alamat") !== -1) colAlamat = col;
        else if (h.indexOf("kepala") !== -1 || h.indexOf("kepsek") !== -1) colKepsek = col;
        else if (h.indexOf("nama sekolah") !== -1 || h === "sekolah" || h === "nama") colNama = col;
        else if (h.indexOf("latitude") !== -1 || h === "lat" || h.indexOf("lintang") !== -1) colLat = col;
        else if (h.indexOf("longitude") !== -1 || h === "lng" || h === "lon" || h.indexOf("bujur") !== -1) colLng = col;
        else if (h.indexOf("jam masuk") !== -1 || h.indexOf("masuk") !== -1) colJamM = col;
        else if (h.indexOf("jam pulang") !== -1 || h.indexOf("pulang") !== -1) colJamP = col;
      }
    }

    // Load override coordinates and school hours from "Lokasi_Sekolah" sheet if it exists
    var overrides = {};
    var sheetLokasi = ss.getSheetByName("Lokasi_Sekolah");
    if (sheetLokasi) {
       var oData = sheetLokasi.getDataRange().getValues();
       for (var k = 1; k < oData.length; k++) {
          var rowK = oData[k];
          if (rowK && rowK.length > 0) {
             var schName = rowK[0];
             if (schName) {
                overrides[schName.toUpperCase().trim()] = {
                   lat: rowK.length > 1 ? rowK[1] : -7.2278,
                   lng: rowK.length > 2 ? rowK[2] : 107.9087,
                   jamMasuk: rowK.length > 3 ? (parseTime(rowK[3]) || "07:00") : "07:00",
                   jamPulang: rowK.length > 4 ? (parseTime(rowK[4]) || "15:00") : "15:00",
                   radius: rowK.length > 5 ? parseFloat(rowK[5]) : 100
                };
             }
          }
       }
    }

    for (var i = 1; i < data.length; i++) {
        var rowNama = (colNama >= 0 && colNama < data[i].length) ? data[i][colNama] : null;
        if (rowNama) {
            var schoolKey = rowNama.toString().toUpperCase().trim();
            var rawJamM = (colJamM >= 0 && colJamM < data[i].length) ? data[i][colJamM] : null;
            var rawJamP = (colJamP >= 0 && colJamP < data[i].length) ? data[i][colJamP] : null;
            
            var jamM = parseTime(rawJamM) || "07:00";
            var tempSchoolNpsn = (colNpsn >= 0 && colNpsn < data[i].length && data[i][colNpsn]) ? data[i][colNpsn].toString() : "";
            if (tempSchoolNpsn.toUpperCase().trim() === rowNama.toString().toUpperCase().trim()) {
               tempSchoolNpsn = "";
            }
            
            var tempSchoolAlamat = "";
            if (colAlamat >= 0 && colAlamat < data[i].length && data[i][colAlamat]) {
               tempSchoolAlamat = data[i][colAlamat].toString();
            } else {
               // Fallback logic excluding column with Kepala Sekolah or times
               var possibleAlamatCols = [7, 6, 5];
               for (var cIdx = 0; cIdx < possibleAlamatCols.length; cIdx++) {
                  var c = possibleAlamatCols[cIdx];
                  if (c === colKepsek) continue;
                  if (c === colJamP) continue;
                  if (c === colJamM) continue;
                  if (c >= 0 && c < data[i].length && data[i][c] && !parseTime(data[i][c])) {
                     tempSchoolAlamat = data[i][c].toString();
                     break;
                  }
               }
            }

            var jamP = parseTime(rawJamP);
            // Jika kolom setelah jam masuk bukan waktu, coba kolom alternatif
            if (!jamP && colJamP + 1 < data[i].length) {
               var altJamP = data[i][colJamP + 1];
               if (altJamP && parseTime(altJamP)) {
                  jamP = parseTime(altJamP);
               }
            }
            if (!jamP) jamP = "15:00"; // Fallback final

            var finalLat = (colLat >= 0 && colLat < data[i].length && data[i][colLat] !== "") ? parseFloat(data[i][colLat]) : -7.2278;
            if (isNaN(finalLat)) finalLat = -7.2278;
            var finalLng = (colLng >= 0 && colLng < data[i].length && data[i][colLng] !== "") ? parseFloat(data[i][colLng]) : 107.9087;
            if (isNaN(finalLng)) finalLng = 107.9087;

            // Apply overrides if found
            if (overrides[schoolKey]) {
                finalLat = overrides[schoolKey].lat;
                finalLng = overrides[schoolKey].lng;
                jamM = overrides[schoolKey].jamMasuk;
                jamP = overrides[schoolKey].jamPulang;
            }

            list.push({ 
             npsn: tempSchoolNpsn,
             alamat: tempSchoolAlamat,
             nama: rowNama.toString().trim(),
             lat: finalLat,
             lng: finalLng,
             jamMasuk: jamM,
             jamPulang: jamP,
             radius: overrides[schoolKey] ? (overrides[schoolKey].radius || 100) : 100
            });
        }
    }
    return list;
  } catch (e) {
    Logger.log("Error in getMasterSekolah: " + e.toString());
    return [];
  }
}

function daftarUserBaru(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_User");
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][2].toString().toLowerCase() === obj.email.toLowerCase()) {
        return "Email ini sudah terdaftar!";
      }
    }
    sheet.appendRow([new Date(), obj.nama, obj.email, obj.password, obj.role, obj.sekolah, "", "Aktif", ""]);
    return "Sukses";
  } catch (e) { return "Gagal Daftar: " + e.toString(); }
}

function simpanLokasiSekolah(sekolahName, lat, lng, jamMasuk, jamPulang, radius) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Lokasi_Sekolah");
    var defaultRadius = radius || 100;
    if (!sheet) {
      sheet = ss.insertSheet("Lokasi_Sekolah");
      sheet.appendRow(["Nama Sekolah", "Latitude", "Longitude", "Jam Masuk", "Jam Pulang", "Radius"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#cfe2f3");
    }
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    if (headers.length < 6) {
      sheet.getRange(1, 6).setValue("Radius");
      sheet.getRange(1, 6).setFontWeight("bold").setBackground("#cfe2f3");
      data = sheet.getDataRange().getValues();
    }
    var foundIdx = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === sekolahName) {
        foundIdx = i;
        break;
      }
    }
    if (foundIdx !== -1) {
      sheet.getRange(foundIdx + 1, 2).setValue(lat);
      sheet.getRange(foundIdx + 1, 3).setValue(lng);
      sheet.getRange(foundIdx + 1, 4).setValue(jamMasuk || "07:00");
      sheet.getRange(foundIdx + 1, 5).setValue(jamPulang || "15:00");
      sheet.getRange(foundIdx + 1, 6).setValue(defaultRadius);
    } else {
      sheet.appendRow([sekolahName, lat, lng, jamMasuk || "07:00", jamPulang || "15:00", defaultRadius]);
    }
    return "Pengaturan lokasi sekolah " + sekolahName + " berhasil disimpan ke sheet terpisah (Lokasi_Sekolah)!";
  } catch (e) { return "Gagal simpan lokasi sekolah: " + e.toString(); }
}

/* --- MANAJEMEN KELAS --- */
function getDaftarKelasFull() {
  try {
    var ss = getSpreadsheet();
    var list = [];
    var seen = {};
    
    // 1. Ambil dari Data_Kelas
    var sheet = ss.getSheetByName("Data_Kelas");
    if (sheet) {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var kNama = (data[i][1] || "").toString().toUpperCase().trim();
        var kKeahlian = data[i][2] || "-";
        var kJumlah = data[i][3] || 0;
        var kWali = data[i][4] || "Belum Diatur";
        var kSekolah = (data[i][5] || "").toString().toUpperCase().trim();
        
        var key = kNama + "|" + kSekolah;
        if (kNama) {
          seen[key] = true;
          list.push({
            id: data[i][0] || ("KL-" + (i + 1)),
            nama: kNama,
            keahlian: kKeahlian,
            jumlah: kJumlah,
            wali: kWali,
            sekolah: kSekolah,
            row: i + 1
          });
        }
      }
    }
    
    // 2. Tambahkan secara dinamis dari Data_Siswa (bila ada kelas baru hasil impor siswa)
    var sheetSiswa = ss.getSheetByName("Data_Siswa");
    if (sheetSiswa) {
      var dataSiswa = sheetSiswa.getDataRange().getValues();
      for (var j = 1; j < dataSiswa.length; j++) {
        var sNama = dataSiswa[j][1];
        var sKelas = (dataSiswa[j][7] || "").toString().toUpperCase().trim();
        var sSekolah = (dataSiswa[j][8] || "").toString().toUpperCase().trim();
        if (sNama && sKelas) {
          var key2 = sKelas + "|" + sSekolah;
          if (!seen[key2]) {
            seen[key2] = true;
            list.push({
              id: "DYNC-" + j,
              nama: sKelas,
              keahlian: "-",
              jumlah: "-",
              wali: "Belum Diatur (Klik Edit Kelas untuk Menyimpan ke Master)",
              sekolah: sSekolah,
              row: -j - 100 // Gunakan row negatif sebagai penanda belum disimpan di master
            });
          }
        }
      }
    }
    return list;
  } catch (e) { return []; }
}

function simpanKelas(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Kelas");
    if (!sheet) {
      sheet = ss.insertSheet("Data_Kelas");
      sheet.appendRow(["ID", "Nama Kelas", "Kompetensi Keahlian", "Jumlah Siswa", "Wali Kelas", "Sekolah"]);
    }
    if (obj.row && Number(obj.row) > 0) {
      sheet.getRange(Number(obj.row), 2, 1, 5).setValues([[obj.nama, obj.keahlian, obj.jumlah, obj.wali, obj.sekolah || ""]]);
      return "Berhasil memperbarui data kelas!";
    } else {
      sheet.appendRow(["KLS-" + new Date().getTime(), obj.nama, obj.keahlian, obj.jumlah, obj.wali, obj.sekolah || ""]);
      return "Berhasil menambah kelas baru ke master data!";
    }
  } catch (e) { return "Gagal: " + e.toString(); }
}

function hapusKelas(row) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Kelas");
    sheet.deleteRow(Number(row));
    return "Data kelas telah dihapus.";
  } catch (e) { return "Gagal: " + e.toString(); }
}

/* --- MANAJEMEN SISWA --- */
function getDaftarSiswa() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Siswa");
    if (!sheet) {
      sheet = ss.insertSheet("Data_Siswa");
      sheet.appendRow(["ID", "Nama Lengkap", "NIS/NISN", "Gender", "Tgl Lahir", "Alamat", "Kontak", "Kelas", "Sekolah"]);
      return [];
    }
    var data = sheet.getDataRange().getDisplayValues();
    var list = [];
    for (var i = 1; i < data.length; i++) {
      list.push({
        id: data[i][0],
        nama: data[i][1],
        nis: data[i][2],
        gender: data[i][3],
        tglLahir: data[i][4],
        alamat: data[i][5],
        kontak: data[i][6],
        kelas: data[i][7] || "",
        sekolah: data[i][8] || "",
        row: i + 1
      });
    }
    return list;
  } catch (e) { return []; }
}

function simpanSiswa(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Siswa");
    if (!sheet) {
      sheet = ss.insertSheet("Data_Siswa");
      sheet.appendRow(["ID", "Nama Lengkap", "NIS/NISN", "Gender", "Tgl Lahir", "Alamat", "Kontak", "Kelas", "Sekolah"]);
    }
    var cleanNis = obj.nis ? obj.nis.toString().trim() : "";
    var formattedNis = (cleanNis && /^[0-9]+$/.test(cleanNis)) ? "'" + cleanNis : cleanNis;
    if (obj.row && obj.row > 0) {
      sheet.getRange(Number(obj.row), 2, 1, 8).setValues([[obj.nama, formattedNis, obj.gender, obj.tglLahir, obj.alamat, obj.kontak, obj.kelas, obj.sekolah || ""]]);
      return "Berhasil memperbarui data siswa!";
    } else {
      sheet.appendRow(["SW-" + new Date().getTime(), obj.nama, formattedNis, obj.gender, obj.tglLahir, obj.alamat, obj.kontak, obj.kelas, obj.sekolah || ""]);
      return "Berhasil menambah siswa baru!";
    }
  } catch (e) { return "Gagal: " + e.toString(); }
}

function hapusSiswa(row) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Siswa");
    sheet.deleteRow(Number(row));
    return "Data siswa telah dihapus.";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function imporSiswaMassal(dataArray) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Siswa");
    if (!sheet) {
      sheet = ss.insertSheet("Data_Siswa");
      sheet.appendRow(["ID", "Nama Lengkap", "NIS/NISN", "Gender", "Tgl Lahir", "Alamat", "Kontak", "Kelas", "Sekolah"]);
    }
    var timestamp = new Date().getTime();
    var rowsToAppend = dataArray.map(function(item, index) {
      var cleanNis = item.nis ? item.nis.toString().trim() : "";
      var formattedNis = (cleanNis && /^[0-9]+$/.test(cleanNis)) ? "'" + cleanNis : cleanNis;
      return ["SW-" + (timestamp+index), item.nama, formattedNis, item.gender, item.tglLahir, item.alamat, item.kontak, item.kelas, item.sekolah || ""];
    });
    if (rowsToAppend.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, 9).setValues(rowsToAppend);
      return "Berhasil mengimpor " + rowsToAppend.length + " data siswa!";
    }
    return "Tidak ada data.";
  } catch (e) { return "Gagal Impor: " + e.toString(); }
}

function getKepsekName(sekolah) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_User");
    var data = sheet.getDataRange().getValues();
    var schoolTarget = (sekolah || "").toString().toUpperCase().trim();
    
    for (var i = 1; i < data.length; i++) {
      var role = (data[i][4] || "").toString().toLowerCase().trim();
      var sch = (data[i][5] || "").toString().toUpperCase().trim();
      if ((role === "kepala sekolah" || role === "kepsek" || role.indexOf("kepala sekolah") !== -1 || role.indexOf("kepsek") !== -1) && sch === schoolTarget) {
        return data[i][1]; // Nama
      }
    }
    return "-";
  } catch (e) { return "-"; }
}

/* --- ABSENSI & JURNAL --- */
function simpanAbsenGuru(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Absensi_Guru");
    if (!sheet) {
      sheet = ss.insertSheet("Absensi_Guru");
      sheet.appendRow(["Timestamp", "Nama", "Email", "Tipe", "Lokasi", "Jarak", "Status_Waktu", "Foto"]);
    }
    
    // Check late/early
    var statusWaktu = "Tepat Waktu";
    var now = new Date();
    var timeStr = Utilities.formatDate(now, "GMT+7", "HH:mm");
    
    // Get School Settings
    var schoolSheet = ss.getSheetByName("Master_Sekolah");
    var sData = schoolSheet.getDataRange().getValues();
    
    // Helper to extract time string HH:mm from various types (duplicate from getMasterSekolah for safety or move to global)
    var parseTime = function(val) {
       if (!val) return null;
       if (val instanceof Date) {
          try {
             var ss = getSpreadsheet();
             return Utilities.formatDate(val, ss.getSpreadsheetTimeZone(), "HH:mm");
          } catch(e) {
             var h = val.getHours().toString().padStart(2, '0');
             var m = val.getMinutes().toString().padStart(2, '0');
             return h + ":" + m;
          }
       }
       var s = val.toString().trim();
       if (s.match(/^\d:\d{2}$/)) s = "0" + s;
       s = s.replace('.', ':').replace(',', ':');

       // Jika formatnya desimal (jam dari excel/sheets kadang terbaca desimal)
       if (!isNaN(val) && val !== "" && parseFloat(val) < 1) {
          var hours = Math.floor(val * 24);
          var minutes = Math.floor(Math.round((val * 24 - hours) * 60));
          return hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0');
       }
       var match = s.match(/^(\d{1,2}):(\d{2})(:(\d{2}))?$/);
       if (match) {
          var h = match[1].padStart(2, '0');
          var m = match[2];
          return h + ":" + m;
       }
       return null;
    };

    var jamMasuk = "07:00";
    var jamPulang = "15:00";
    for(var i=1; i<sData.length; i++) {
      if(sData[i][1].toString().toLowerCase().trim() === obj.sekolah.toString().toLowerCase().trim()) {
        jamMasuk = parseTime(sData[i][4]) || "07:00";
        jamPulang = parseTime(sData[i][5]);
        // If jamPulang is not in col 5, try col 6
        if(!jamPulang && sData[i][6]) {
            jamPulang = parseTime(sData[i][6]);
        }
        if(!jamPulang) jamPulang = "15:00";
        break;
      }
    }

    if(obj.tipe === "DATANG") {
      if(timeStr > jamMasuk) statusWaktu = "Terlambat";
    } else {
      if(timeStr < jamPulang) statusWaktu = "Pulang Awal";
    }

    var url = "";
    if (obj.fotoBase64) {
      var folder;
      try { folder = DriveApp.getFolderById(FOLDER_FOTO_ID); } catch(e) { folder = DriveApp.getRootFolder(); }
      url = uploadFileBase64(obj.fotoBase64, "ABSEN_" + obj.tipe + "_" + obj.email, folder);
    }
    
    sheet.appendRow([now, obj.nama, obj.email, obj.tipe, obj.lokasi, obj.jarak, statusWaktu, url]);
    return { status: "success", message: "Absensi " + obj.tipe + " Berhasil Disimpan! (" + statusWaktu + ")" };
  } catch (e) { return { status: "error", message: e.toString() }; }
}

function simpanAbsensiSiswa(data) {
  try {
    var ss = getSpreadsheet();
    var sheetName = "Absensi_Siswa";
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["TANGGAL", "HARI", "GURU", "KELAS", "MAPEL", "DATA ABSENSI (JSON)"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#d9ead3");
    }
    
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
    Logger.log("Error simpanAbsensiSiswa: " + e.toString());
    return "Gagal menyimpan data: " + e.toString();
  }
}

function getLaporanAbsensiSiswa(tgl, kelas) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Absensi_Siswa");
    if (!sheet) return [];
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    var results = [];
    var searchTgl = normalizeDateToISO(tgl);
    var cleanStr = function(str) {
      return (str || "").toString().toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '').trim();
    };
    var cSrc = cleanStr(kelas);
    
    for (var i = 1; i < data.length; i++) {
      var tglRaw = data[i][0];
      var hari = data[i][1];
      var guru = data[i][2];
      var klsRaw = data[i][3];
      var mapel = data[i][4];
      var absensiJson = data[i][5];
      
      var dbTgl = normalizeDateToISO(tglRaw);
      var cDb = cleanStr(klsRaw);
      var matchKls = (cDb === cSrc || cDb.indexOf(cSrc) !== -1 || cSrc.indexOf(cDb) !== -1);
      
      if (dbTgl === searchTgl && matchKls) {
        var parsedAbs = {};
        try {
          parsedAbs = JSON.parse(absensiJson);
        } catch(e) {
          parsedAbs = {};
        }
        results.push({
          tanggal: dbTgl,
          hari: hari,
          guru: guru,
          kelas: klsRaw,
          mapel: mapel,
          absensi: parsedAbs
        });
      }
    }
    return results;
  } catch (e) {
    Logger.log("Error getLaporanAbsensiSiswa: " + e.toString());
    return [];
  }
}

function simpanJurnalMengajar(obj) {
  try {
    var ss = getSpreadsheet();
    var sheetName = "Jurnal_Mengajar";
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["TIMESTAMP", "GURU", "HARI", "TANGGAL", "KELAS", "KEAHLIAN", "JAM", "MAPEL", "MATERI", "FOTO 1", "FOTO 2"]);
      sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#d9ead3");
    }

    var folder;
    try { folder = DriveApp.getFolderById(FOLDER_FOTO_ID); } catch(e) { folder = DriveApp.getRootFolder(); }
    
    var url1 = obj.foto1 ? uploadFileBase64(obj.foto1, "JRN1_" + obj.guru, folder) : "";
    var url2 = obj.foto2 ? uploadFileBase64(obj.foto2, "JRN2_" + obj.guru, folder) : "";
    
    sheet.appendRow([
      new Date(), 
      obj.guru, 
      obj.hari, 
      obj.tgl, 
      obj.kelas, 
      obj.keahlian, 
      obj.jam, 
      obj.mapel, 
      obj.materi, 
      url1, 
      url2
    ]);
    return "Jurnal Mengajar berhasil disimpan!";
  } catch (e) { 
    Logger.log("Error simpanJurnalMengajar: " + e.toString());
    return "Gagal: " + e.toString(); 
  }
}

function getDaftarJurnal(userNama, role, sekolah) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Jurnal_Mengajar");
    if (!sheet) return [];
    var data = sheet.getDataRange().getDisplayValues();
    
    var userSheet = ss.getSheetByName("Data_User");
    var userData = userSheet ? userSheet.getDataRange().getValues() : [];
    
    var normalizeName = function(name) {
      if (!name) return "";
      return name.toString().toUpperCase()
                 .replace(/\b(SPD|MPD|ST|SE|H|HJ|DRS|DRA|SPD\.I|MPD\.I|LC|LLM|MH|MM|SKOM|SAG|MSI|PHD|PROF|KAPTEN|MAYOR|KOLONEL|BRIGADIR|AKBP|KOMPOL)\b/g, "")
                 .replace(/[^A-Z0-9\s]/g, "")
                 .replace(/\s+/g, " ")
                 .trim();
    };

    var guruSekolah = {};
    for (var k = 1; k < userData.length; k++) {
      guruSekolah[normalizeName(userData[k][1])] = (userData[k][5] || "").toString().toUpperCase().trim();
    }

    var list = [];
    var roleLow = (role || "").toString().toLowerCase().trim();
    var targetNameNorm = normalizeName(userNama);
    var targetSchoolNorm = (sekolah || "").toString().toUpperCase().trim();

    for (var i = 1; i < data.length; i++) {
        var rowData = data[i];
        if (!rowData || rowData.length < 2) continue;

        var dbGuruRaw = (rowData[1] || "").toString();
        var dbGuruNorm = normalizeName(dbGuruRaw);
        
        if (roleLow === "guru") {
           if (dbGuruNorm !== targetNameNorm) continue;
        } else if (roleLow === "kepala sekolah" || roleLow === "operator" || roleLow === "admin") {
           if (roleLow !== "admin" && targetSchoolNorm !== "PUSAT KCD XI" && targetSchoolNorm !== "") {
              if (guruSekolah[dbGuruNorm] !== targetSchoolNorm && dbGuruNorm !== targetNameNorm) continue;
           }
        }

        list.push({
            row: i + 1,
            timestamp: rowData[0],
            guru: rowData[1],
            hari: rowData[2],
            tgl: rowData[3],
            kelas: rowData[4],
            keahlian: rowData[5],
            jam: rowData[6],
            mapel: rowData[7],
            materi: rowData[8],
            f1: rowData[9],
            f2: rowData[10],
            feedback: rowData[11] || "",
            sekolah: guruSekolah[dbGuruNorm] || ""
        });
    }
    list.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    return list;
  } catch (e) { 
    Logger.log("Error getDaftarJurnal: " + e.toString());
    return []; 
  }
}

/* --- NILAI & TUGAS --- */
function simpanNilaiSiswaComplex(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Nilai_Siswa_Complex");
    if (!sheet) {
      sheet = ss.insertSheet("Nilai_Siswa_Complex");
      sheet.appendRow(["Timestamp", "Guru", "Kelas", "Tahun Pelajaran", "Semester", "Mata Pelajaran", "Data Nilai (JSON)"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#cfe2f3");
    }
    
    // Normalize data before saving for consistent retrieval
    var kls = (obj.kelas || "").toString().trim().toUpperCase();
    var ta = (obj.ta || "").toString().trim().toUpperCase();
    var sem = (obj.semester || "").toString().trim().toUpperCase();
    var mapel = (obj.mapel || "").toString().trim().toUpperCase();
    
    sheet.appendRow([new Date(), obj.guru, kls, ta, sem, mapel, JSON.stringify(obj.dataNilai)]);
    return "Data Nilai Berhasil Disimpan!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function getNilaiSiswaComplex(kls, ta, semester, mapel) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Nilai_Siswa_Complex");
    if (!sheet) return null;
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return null;

    // Normalize search terms
    kls = (kls || "").toString().trim().toUpperCase();
    ta = (ta || "").toString().trim().toUpperCase();
    semester = (semester || "").toString().trim().toUpperCase();
    mapel = (mapel || "").toString().trim().toUpperCase();

    // Cari data yang paling baru (terbawah) yang sesuai kriteria
    for (var i = data.length - 1; i >= 1; i--) {
      var dbKls = (data[i][2] || "").toString().trim().toUpperCase();
      var dbTa = (data[i][3] || "").toString().trim().toUpperCase();
      var dbSem = (data[i][4] || "").toString().trim().toUpperCase();
      var dbMapel = (data[i][5] || "").toString().trim().toUpperCase();

      if (dbKls === kls && dbTa === ta && dbSem === semester && dbMapel === mapel) {
        return JSON.parse(data[i][6]);
      }
    }
    return null;
  } catch (e) { return null; }
}

function simpanNilaiSiswa(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Nilai_Siswa");
    sheet.appendRow([new Date(), obj.guru, obj.kelas, obj.mapel, obj.tipe, JSON.stringify(obj.dataNilai)]);
    return "Data Nilai berhasil disimpan!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function simpanTugasTambahan(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Tugas_Tambahan");
    sheet.appendRow([new Date(), obj.guru, obj.tugas, obj.keterangan]);
    return "Data Tugas Tambahan berhasil disimpan!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function getRekapTugasTambahan(guruNama) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Tugas_Tambahan");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    var result = [];
    var filterGuru = (guruNama || "").toString().toUpperCase().trim();
    for (var i = 1; i < data.length; i++) {
      var gVal = (data[i][1] || "").toString().toUpperCase().trim();
      if (filterGuru === "" || gVal === filterGuru) {
        result.push({
          timestamp: data[i][0],
          guru: data[i][1],
          tugas: data[i][2],
          keterangan: data[i][3] || ""
        });
      }
    }
    return result;
  } catch (e) {
    return [];
  }
}

/* --- JADWAL MENGAJAR (CLASS SCHEDULE) --- */
function getDaftarJadwal(userNama, role) {
  try {
    var ss = getSpreadsheet();
    // Prioritize "Jadwal Mengajar" as the user confirmed this is where data resides
    var sheet = ss.getSheetByName("Jadwal Mengajar") || ss.getSheetByName("Jadwal Guru") || ss.getSheetByName("Data_Jadwal") || ss.getSheetByName("Jadwal");
    
    if (!sheet) {
      Logger.log("Sheet Jadwal tidak ditemukan");
      return [];
    }
    
    // Use getDisplayValues to get literal strings (e.g., "1-2" instead of date objects)
    var data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];
    
    var headers = data[0].map(function(h) { return h.toString().toUpperCase().trim(); });
    
    // Mapping index berdasarkan header
    var idxHari = headers.indexOf("HARI");
    var idxJam = headers.indexOf("JAM");
    var idxKelas = headers.indexOf("KELAS");
    var idxMapel = headers.indexOf("MAPEL");
    var idxGuru = headers.indexOf("GURU");
    var idxRuang = headers.indexOf("RUANG");

    // Fallback jika header tidak standar (Sesuai format: Date, Hari, Jam, Kelas, Mapel, Guru, Ruang)
    if (idxHari === -1) idxHari = 1;
    if (idxJam === -1) idxJam = 2;
    if (idxKelas === -1) idxKelas = 3;
    if (idxMapel === -1) idxMapel = 4;
    if (idxGuru === -1) idxGuru = 5;
    if (idxRuang === -1) idxRuang = 6;

    var roleLow = (role || "").toString().toLowerCase().trim();
    
    // Normalize name helper: remove titles, dots, and non-alphanumeric
    var normalizeName = function(name) {
      if (!name) return "";
      var n = name.toString().toUpperCase()
                 .replace(/\b(SPD|MPD|ST|SE|H|HJ|DRS|DRA|SPD\.I|MPD\.I|LC|LLM|MH|MM|SKOM|SAG|MSI|PHD|PROF|KAPTEN|MAYOR|KOLONEL|BRIGADIR|AKBP|KOMPOL)\b/g, "")
                 .replace(/[^A-Z0-9\s]/g, "") // Remove dots/special chars after title removal
                 .replace(/\s+/g, " ") // Collapse spaces
                 .trim();
      return n;
    };

    var targetNameNorm = normalizeName(userNama);
    var list = [];

    for (var i = 1; i < data.length; i++) {
        var rowData = data[i];
        if (!rowData || rowData.length === 0 || rowData.join("").trim() === "") continue;
        
        var dbGuruRaw = (rowData[idxGuru] || "").toString();
        var dbGuruNorm = normalizeName(dbGuruRaw);
        
        // Filter untuk Guru: Tampilkan hanya jadwal miliknya (Flexible Match)
        if (roleLow === "guru") {
           if (!targetNameNorm) continue;
           // Cek apakah nama ternomalisasi cocok atau mengandung satu sama lain
           var isMatch = (dbGuruNorm === targetNameNorm) || 
                         (dbGuruNorm.indexOf(targetNameNorm) !== -1) || 
                         (targetNameNorm.indexOf(dbGuruNorm) !== -1);
           if (!isMatch) continue;
        }
        
        var jamVal = rowData[idxJam] || "";

        // Untuk Admin, Operator, Kepala Sekolah: Tampilkan Semua
        list.push({
            row: i + 1,
            hari: rowData[idxHari] || "",
            jam: jamVal,
            kelas: rowData[idxKelas] || "",
            mapel: rowData[idxMapel] || "",
            guru: rowData[idxGuru] || "",
            ruang: rowData[idxRuang] || "-"
        });
    }
    return list;
  } catch (e) { 
    Logger.log("Error getDaftarJadwal: " + e.toString());
    return []; 
  }
}

function getJadwalKelas(namaKelas) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Jadwal Mengajar") || ss.getSheetByName("Jadwal Guru") || ss.getSheetByName("Data_Jadwal");
    if (!sheet) return [];
    
    // Use getDisplayValues to get literal strings
    var data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];
    
    var headers = data[0].map(function(h) { return h.toString().toUpperCase().trim(); });
    
    var findIdx = function(keys, defaultIdx) {
      for(var k=0; k<keys.length; k++){
        var found = headers.indexOf(keys[k].toUpperCase().trim());
        if(found !== -1) return found;
      }
      return defaultIdx;
    };

    var idxHari = findIdx(["HARI", "HARI/TANGGAL"], 0);
    var idxJam = findIdx(["JAM", "JAM KE", "WAKTU"], 1);
    var idxKelas = findIdx(["KELAS", "TINGKAT"], 2);
    var idxMapel = findIdx(["MAPEL", "MATA PELAJARAN"], 3);
    var idxGuru = findIdx(["GURU", "NAMA GURU", "PENGAJAR"], 4);
    
    var list = [];
    var target = (namaKelas || "").toString().toUpperCase().trim();
    
    for (var i = 1; i < data.length; i++) {
        var dbKelas = (data[i][idxKelas] || "").toString().toUpperCase().trim();
        if (dbKelas === target) {
            list.push({
                row: i + 1,
                hari: data[i][idxHari],
                jamKe: data[i][idxJam],
                mapel: data[i][idxMapel],
                guru: data[i][idxGuru]
            });
        }
    }
    return list;
  } catch (e) { 
    Logger.log("Error getJadwalKelas: " + e.toString());
    return []; 
  }
}

function simpanJadwalKelas(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Jadwal Mengajar");
    if (!sheet) {
      sheet = ss.insertSheet("Jadwal Mengajar");
      sheet.appendRow(["TIMESTAMP", "HARI", "JAM", "KELAS", "MAPEL", "GURU", "RUANG"]);
    }
    
    // Jika ada row, update. Jika tidak, append.
    if (obj.row && obj.row > 0) {
       // Update based on: Timestamp, Hari, Jam, Kelas, Mapel, Guru, Ruang
       sheet.getRange(Number(obj.row), 2, 1, 5).setValues([[obj.hari, obj.jamKe, obj.kelas, obj.mapel, obj.guru]]);
       return "Jadwal diperbarui!";
    } else {
       sheet.appendRow([new Date(), obj.hari, obj.jamKe, obj.kelas, obj.mapel, obj.guru, "-"]);
       return "Jadwal baru ditambahkan!";
    }
  } catch (e) { return "Gagal: " + e.toString(); }
}

function hapusJadwal(row) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Jadwal Mengajar") || ss.getSheetByName("Jadwal Guru") || ss.getSheetByName("Data_Jadwal");
    sheet.deleteRow(Number(row));
    return "Jadwal dihapus.";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function simpanJadwalGuru(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Jadwal Mengajar");
    if (!sheet) {
      sheet = ss.insertSheet("Jadwal Mengajar");
      sheet.appendRow(["TIMESTAMP", "HARI", "JAM", "KELAS", "MAPEL", "GURU", "RUANG"]);
      sheet.getRange(1,1,1,7).setFontWeight("bold").setBackground("#cfe2f3");
    }
    sheet.appendRow([
      new Date(),
      (obj.hari || "").toString().toUpperCase().trim(),
      obj.jam,
      (obj.kelas || "").toString().toUpperCase().trim(),
      (obj.mapel || "").toString().toUpperCase().trim(),
      (obj.guru || "").toString().toUpperCase().trim(),
      (obj.ruang || "-").toString().toUpperCase().trim()
    ]);
    return "Jadwal berhasil disimpan!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function hapusJadwalGuru(row) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Jadwal Mengajar") || ss.getSheetByName("Jadwal Guru") || ss.getSheetByName("Data_Jadwal");
    sheet.deleteRow(Number(row));
    return "Jadwal dihapus.";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function tampilkanJadwalMengajar() {
  try {
    var ss = getSpreadsheet();
    var sumber = ss.getSheetByName('Jadwal Guru');
    var target = ss.getSheetByName('Jadwal Mengajar');
    
    if (!target) {
      target = ss.insertSheet('Jadwal Mengajar');
    } else {
      target.clear(); 
    }
    
    var data = sumber.getDataRange().getValues();
    if (data.length > 0) {
      target.getRange(1, 1, data.length, data[0].length).setValues(data);
      var headerRange = target.getRange(1, 1, 1, data[0].length);
      headerRange.setFontWeight("bold").setBackground("#d9ead3");
      target.autoResizeColumns(1, data[0].length);
    }
  } catch (e) {
    Logger.log("Error tampilkanJadwalMengajar: " + e.toString());
  }
}
 
/* --- HELPER --- */
function normalizeName(name) {
  if (!name) return "";
  return name.toString().toUpperCase()
             .replace(/\b(SPD|MPD|ST|SE|H|HJ|DRS|DRA|SPD\.I|MPD\.I|LC|LLM|MH|MM|SKOM|SAG|MSI|PHD|PROF|KAPTEN|MAYOR|KOLONEL|BRIGADIR|AKBP|KOMPOL)\b/g, "")
             .replace(/[^A-Z0-9\s]/g, "")
             .replace(/\s+/g, " ")
             .trim();
}

function getScriptUrl() { return ScriptApp.getService().getUrl(); }

function uploadFileBase64(base64, prefix, folder) {
  if (!base64 || typeof base64 !== 'string' || !base64.includes(',')) return "";
  try {
    var content = base64.split(",");
    var mimeMatch = content[0].match(/:(.*?);/);
    var mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    var ext = mime.split("/")[1] || "jpg";
    var bytes = Utilities.base64Decode(content[1]);
    var blob = Utilities.newBlob(bytes, mime, prefix + "_" + new Date().getTime() + "." + ext);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    if (mime.indexOf("image") !== -1) {
      return "https://lh3.googleusercontent.com/d/" + file.getId();
    } else {
      return "https://drive.google.com/file/d/" + file.getId() + "/view?usp=drivesdk";
    }
  } catch(e) { return ""; }
}
/**
 * SALIN KODE INI KE Google Apps Script (Code.gs)
 * Versi ini memperbaiki:
 * 1. Pembuatan sheet "Absensi Siswa" jika belum ada.
 * 2. Pemuatan jadwal yang lebih robust (case-insensitive & trim).
 * 3. Log untuk membantu tracing jika ada error.
 */

// Removed duplicate at end of file

// End of File
function getRekapAbsenGuru(bulan, sekolah) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Absensi_Guru");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    
    var userSheet = ss.getSheetByName("Data_User");
    var userData = userSheet ? userSheet.getDataRange().getValues() : [];
    var guruSekolah = {};
    for (var k = 1; k < userData.length; k++) {
      guruSekolah[normalizeName(userData[k][1])] = (userData[k][5] || "").toString().toUpperCase().trim();
    }

    var list = [];
    var targetSchoolNorm = (sekolah || "").toUpperCase().trim();

    for (var i = 1; i < data.length; i++) {
      var ts = data[i][0];
      if (!ts) continue;
      
      var entGuru = normalizeName(data[i][1]);
      if (targetSchoolNorm !== "PUSAT KCD XI" && targetSchoolNorm !== "") {
         if (guruSekolah[entGuru] !== targetSchoolNorm) continue;
      }

      var d = new Date(ts);
      // JS getMonth() is 0-indexed. In spreadsheet it's usually 1-indexed or string name.
      // But we pass it from HTML select value which is "0", "1"... 
      if (d.getMonth() == parseInt(bulan)) {
        list.push({
          timestamp: Utilities.formatDate(new Date(ts), "GMT+7", "yyyy-MM-dd HH:mm:ss"),
          guru: data[i][1],
          tipe: data[i][3],
          waktu: Utilities.formatDate(new Date(ts), "GMT+7", "HH:mm"),
          status: data[i][6] || "",
          sekolah: guruSekolah[entGuru] || ""
        });
      }
    }
    return list;
  } catch (e) { return []; }
}

function simpanFeedbackJurnal(row, feedback) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Jurnal_Mengajar");
    if (!sheet) return "Sheet Jurnal tidak ditemukan.";
    sheet.getRange(Number(row), 12).setValue(feedback);
    return "Feedback Jurnal berhasil dikirim!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function getAllRekapAbsensiSiswa(bulan, sekolah) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Absensi_Siswa");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    
    var userSheet = ss.getSheetByName("Data_User");
    var userData = userSheet ? userSheet.getDataRange().getValues() : [];
    var guruSekolah = {};
    for (var k = 1; k < userData.length; k++) {
      guruSekolah[normalizeName(userData[k][1])] = (userData[k][5] || "").toString().toUpperCase().trim();
    }

    var list = [];
    var targetSchoolNorm = (sekolah || "").toUpperCase().trim();

    for (var i = 1; i < data.length; i++) {
       var tglRaw = data[i][0];
       if (!tglRaw) continue;
       
       var entGuru = normalizeName(data[i][2]);
       if (targetSchoolNorm !== "PUSAT KCD XI" && targetSchoolNorm !== "") {
          if (guruSekolah[entGuru] !== targetSchoolNorm) continue;
       }

       var isoTgl = normalizeDateToISO(tglRaw);
       var d = new Date(isoTgl);
       var matchBln = false;
       if (bulan == -1) {
          matchBln = true;
       } else if (!isNaN(d.getTime())) {
          matchBln = (d.getMonth() == parseInt(bulan));
       }

       if (matchBln) {
          list.push({
             row: i + 1,
             tanggal: isoTgl,
             hari: data[i][1],
             guru: data[i][2],
             kelas: data[i][3],
             mapel: data[i][4]
          });
       }
    }
    return list;
  } catch (e) { return []; }
}

function getRekapSiswaBulanan(kelas, bulan, sekolah) {
  try {
    var ss = getSpreadsheet();
    
    // 1. Dapatkan daftar siswa di kelas & sekolah terpilih
    var siswaSheet = ss.getSheetByName("Data_Siswa");
    if (!siswaSheet) return [];
    var siswaData = siswaSheet.getDataRange().getDisplayValues();
    if (siswaData.length < 2) return [];
    
    var allSiswa = [];
    var targetKlsNorm = (kelas || "").toString().toUpperCase().trim();
    var targetSchoolNorm = (sekolah || "").toString().toUpperCase().trim();

    for (var i = 1; i < siswaData.length; i++) {
       var sNama = (siswaData[i][1] || "").toString().toUpperCase().trim();
       var sNis = (siswaData[i][2] || "").toString().trim();
       var sKelas = (siswaData[i][7] || "").toString().toUpperCase().trim();
       var sSch = (siswaData[i][8] || "").toString().toUpperCase().trim();
       
       var matchSchool = true;
       if (targetSchoolNorm !== "PUSAT KCD XI" && targetSchoolNorm !== "" && sSch !== "") {
          if (sSch !== targetSchoolNorm) matchSchool = false;
       }
       
       var matchKls = (targetKlsNorm === "ALL" || sKelas === targetKlsNorm);
       
       if (matchKls && matchSchool && sNama !== "") {
          allSiswa.push({
             nama: sNama,
             nisn: sNis,
             kelas: sKelas
          });
       }
    }

    function getClassWeight(className) {
      if (!className) return 999;
      var cl = className.toString().trim().toUpperCase();
      if (cl.indexOf("XII") === 0) return 12;
      if (cl.indexOf("XI") === 0) return 11;
      if (cl.indexOf("X") === 0) return 10;
      var numMatch = cl.match(/^(\d+)/);
      if (numMatch) {
         return parseInt(numMatch[1], 10);
      }
      return 999;
    }

    // Urutkan siswa berdasarkan tingkatan kelas, nama kelas, lalu nama secara alfabetis
    allSiswa.sort(function(a, b) {
       var wA = getClassWeight(a.kelas);
       var wB = getClassWeight(b.kelas);
       if (wA !== wB) return wA - wB;
       
       var kA = (a.kelas || "").toString().toUpperCase().trim();
       var kB = (b.kelas || "").toString().toUpperCase().trim();
       if (kA !== kB) return kA.localeCompare(kB);
       
       return (a.nama || "").toString().toUpperCase().trim().localeCompare((b.nama || "").toString().toUpperCase().trim());
    });

    if (allSiswa.length === 0) return [];

    // 2. Baca seluruh data absensi dari "Absensi_Siswa"
    var absSheet = ss.getSheetByName("Absensi_Siswa");
    var stats = {};
    allSiswa.forEach(function(s) {
       stats[s.nama] = { H: 0, S: 0, I: 0, A: 0, total: 0 };
    });

    if (absSheet) {
       var absData = absSheet.getDataRange().getValues();
       var targetMonthNum = parseInt(bulan);

       for (var j = 1; j < absData.length; j++) {
          var tglRaw = absData[j][0];
          if (!tglRaw) continue;
          
          var d = new Date(tglRaw);
          var dbMonth = d.getMonth();
          var dbKls = (absData[j][3] || "").toString().toUpperCase().trim();
          
          if ((targetKlsNorm === "ALL" || dbKls === targetKlsNorm) && dbMonth === targetMonthNum) {
             var absKey = absData[j][5];
             var absJson = {};
             try {
                absJson = JSON.parse(absKey);
             } catch(e) {
                absJson = {};
             }

             for (var keyNama in absJson) {
                var nameNorm = keyNama.toUpperCase().trim();
                var statusVal = (absJson[keyNama] || "").toUpperCase().trim();
                
                if (stats[nameNorm] !== undefined) {
                   if (statusVal === "H") { stats[nameNorm].H += 1; stats[nameNorm].total += 1; }
                   else if (statusVal === "S") { stats[nameNorm].S += 1; stats[nameNorm].total += 1; }
                   else if (statusVal === "I") { stats[nameNorm].I += 1; stats[nameNorm].total += 1; }
                   else if (statusVal === "A") { stats[nameNorm].A += 1; stats[nameNorm].total += 1; }
                }
             }
          }
       }
    }

    // 3. Susun data return
    var rekapList = allSiswa.map(function(s) {
       var sStat = stats[s.nama];
       var th = sStat.total;
       var pct = 0;
       if (th > 0) {
          pct = Math.round((sStat.H / th) * 100);
       }
       return {
          nama: s.nama,
          nisn: s.nisn,
          kelas: s.kelas,
          H: sStat.H,
          S: sStat.S,
          I: sStat.I,
          A: sStat.A,
          totalHari: th,
          persen: pct
       };
    });
    return rekapList;
  } catch(e) {
     return [];
  }
}

function simpanAktivitasKepsek(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Aktivitas_Kepsek");
    if (!sheet) {
      sheet = ss.insertSheet("Aktivitas_Kepsek");
      sheet.appendRow(["Timestamp", "Kepala Sekolah", "Hari", "Tanggal", "Kegiatan", "Tempat", "Deskripsi", "Foto 1", "Foto 2", "Sekolah"]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#cfe2f3");
    }
    var folder;
    try { folder = DriveApp.getFolderById(FOLDER_FOTO_ID); } catch(e) { folder = DriveApp.getRootFolder(); }
    var url1 = obj.foto1 ? uploadFileBase64(obj.foto1, "KPS1_" + obj.guru, folder) : "";
    var url2 = obj.foto2 ? uploadFileBase64(obj.foto2, "KPS2_" + obj.guru, folder) : "";
    
    sheet.appendRow([new Date(), obj.guru, obj.hari, obj.tgl, obj.kegiatan, obj.tempat, obj.deskripsi, url1, url2, obj.sekolah]);
    return "Aktivitas Kepala Sekolah berhasil disimpan!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function getDaftarAktivitasKepsek(sekolah, role) {
  try {
     var ss = getSpreadsheet();
     var sheet = ss.getSheetByName("Aktivitas_Kepsek");
     if (!sheet) return [];
     var data = sheet.getDataRange().getDisplayValues();
     var list = [];
     var normSekolah = (sekolah || "").toString().toUpperCase().trim();
     var roleLow = (role || "").toString().toLowerCase().trim();
     for (var i = 1; i < data.length; i++) {
         var rowData = data[i];
         if (roleLow !== "admin" && roleLow !== "pengawas" && normSekolah !== "PUSAT KCD XI" && normSekolah && (rowData[9] || "").toString().toUpperCase().trim() !== normSekolah) continue;
         list.push({
             row: i + 1,
             timestamp: rowData[0],
             kepsek: rowData[1],
             hari: rowData[2],
             tgl: rowData[3],
             kegiatan: rowData[4],
             tempat: rowData[5],
             deskripsi: rowData[6],
             f1: rowData[7],
             f2: rowData[8],
             sekolah: rowData[9],
             feedback: rowData[10] || ""
         });
     }
     list.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
     return list;
  } catch (e) { return []; }
}

function simpanLaporanKepsek(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Laporan_Kepsek");
    if (!sheet) {
      sheet = ss.insertSheet("Laporan_Kepsek");
      sheet.appendRow(["Timestamp", "Kepala Sekolah", "Tanggal Pelaporan", "Nama Kegiatan", "Deskripsi Laporan", "Dokumen", "Sekolah"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#d9ead3");
    }
    var folder;
    try { folder = DriveApp.getFolderById(FOLDER_FOTO_ID); } catch(e) { folder = DriveApp.getRootFolder(); }
    var urlDokumen = obj.dokumen ? uploadFileBase64(obj.dokumen, "LAP_" + (obj.guru || "KEPSEK"), folder) : "";
    
    sheet.appendRow([new Date(), obj.guru, obj.tglPelaporan, obj.namaKegiatan, obj.deskripsiLaporan, urlDokumen, obj.sekolah]);
    return "Laporan Kepala Sekolah ke Pengawas berhasil disimpan!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function getDaftarLaporanKepsek(sekolah, role) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Laporan_Kepsek");
    if (!sheet) return [];
    var data = sheet.getDataRange().getDisplayValues();
    var list = [];
    var normSekolah = (sekolah || "").toString().toUpperCase().trim();
    var roleLow = (role || "").toString().toLowerCase().trim();
    for (var i = 1; i < data.length; i++) {
        var rowData = data[i];
        if (roleLow !== "admin" && roleLow !== "pengawas" && normSekolah !== "PUSAT KCD XI" && normSekolah && (rowData[6] || "").toString().toUpperCase().trim() !== normSekolah) continue;
        list.push({
            row: i + 1,
            timestamp: rowData[0],
            kepsek: rowData[1],
            tglPelaporan: rowData[2],
            namaKegiatan: rowData[3],
            deskripsiLaporan: rowData[4],
            dokumen: rowData[5],
            sekolah: rowData[6],
            feedback: rowData[7] || ""
        });
    }
    list.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    return list;
  } catch (e) { return []; }
}

function simpanFeedbackAktivitasKepsek(row, text) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Aktivitas_Kepsek");
    if (!sheet) return "Sheet Aktivitas Kepala Sekolah tidak ditemukan.";
    sheet.getRange(Number(row), 11).setValue(text);
    return "Feedback Aktivitas Kepala Sekolah berhasil disimpan!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function simpanFeedbackLaporanKepsek(row, text) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Laporan_Kepsek");
    if (!sheet) return "Sheet Laporan Kepala Sekolah tidak ditemukan.";
    sheet.getRange(Number(row), 8).setValue(text);
    return "Feedback Laporan Kepala Sekolah berhasil disimpan!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function getSekolahBinaan(pengawasEmail) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Sekolah_Binaan");
    if (!sheet) {
      sheet = ss.insertSheet("Sekolah_Binaan");
      sheet.appendRow(["Timestamp", "Pengawas", "Nama Sekolah", "NPSN", "Alamat"]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#cfe2f3");
      return [];
    }
    var data = sheet.getDataRange().getDisplayValues();
    var list = [];
    var emailLower = (pengawasEmail || "").toString().toLowerCase().trim();
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row.length > 2 && row[1]) {
        var rowEmail = row[1].toString().toLowerCase().trim();
        if (rowEmail === emailLower || emailLower === "wanyora68@gmail.com") {
          list.push({
            row: i + 1,
            timestamp: row[0] ? row[0].toString() : "",
            pengawas: row[1] ? row[1].toString() : "",
            nama: row[2] ? row[2].toString() : "",
            npsn: (row.length > 3 && row[3]) ? row[3].toString() : "",
            alamat: (row.length > 4 && row[4]) ? row[4].toString() : ""
          });
        }
      }
    }
    return list;
  } catch (e) {
    Logger.log("Error in getSekolahBinaan: " + e.toString());
    return [];
  }
}

function simpanSekolahBinaan(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Sekolah_Binaan");
    if (!sheet) {
      sheet = ss.insertSheet("Sekolah_Binaan");
      sheet.appendRow(["Timestamp", "Pengawas", "Nama Sekolah", "NPSN", "Alamat"]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#cfe2f3");
    }
    var emailLower = (obj.pengawas || "").toString().toLowerCase().trim();
    var schoolName = (obj.nama || "").toString().toUpperCase().trim();
    
    // Add to Master_Sekolah if not existing yet to allow users from that school to register
    var masterSheet = ss.getSheetByName("Master_Sekolah");
    if (masterSheet) {
      var mData = masterSheet.getDataRange().getValues();
      var exists = false;
      for (var k = 1; k < mData.length; k++) {
        var rowK = mData[k];
        if (rowK.length > 1 && rowK[1]) {
          if (rowK[1].toString().toUpperCase().trim() === schoolName) {
            exists = true;
            break;
          }
        }
      }
      if (!exists) {
        // Alignment with Master_Sekolah columns: NPSN, Nama Sekolah, Lintang, Bujur, Jam Masuk, Jam Pulang, Alamat, Kepala Sekolah
        masterSheet.appendRow([obj.npsn || "", schoolName, "-7.227228", "107.894391", "07:00", "15:00", obj.alamat || "", ""]);
      }
    }

    if (obj.row && obj.row > 0) {
      sheet.getRange(Number(obj.row), 1, 1, 5).setValues([[new Date(), emailLower, schoolName, obj.npsn, obj.alamat]]);
      return "Berhasil memperbarui data sekolah binaan!";
    } else {
      sheet.appendRow([new Date(), emailLower, schoolName, obj.npsn, obj.alamat]);
      return "Berhasil menambah sekolah binaan baru!";
    }
  } catch (e) { return "Gagal: " + e.toString(); }
}

function hapusSekolahBinaan(row) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Sekolah_Binaan");
    if (sheet) {
      sheet.deleteRow(Number(row));
      return "Data sekolah binaan berhasil dihapus.";
    }
    return "Gagal: Sheet tidak ditemukan.";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function normalizeDateToISO(dVal) {
  if (!dVal) return "";
  
  if (typeof Utilities !== "undefined" && dVal instanceof Date) {
    try {
      return Utilities.formatDate(dVal, "GMT+7", "yyyy-MM-dd");
    } catch(e) {}
  }
  
  if (dVal instanceof Date) {
    var year = dVal.getFullYear();
    var month = ("0" + (dVal.getMonth() + 1)).slice(-2);
    var day = ("0" + dVal.getDate()).slice(-2);
    return year + "-" + month + "-" + day;
  }
  
  var str = dVal.toString().trim();
  if (!str) return "";
  
  // Try pattern YYYY-MM-DD or YYYY/MM/DD
  var m1 = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m1) {
    return m1[1] + "-" + ("0" + m1[2]).slice(-2) + "-" + ("0" + m1[3]).slice(-2);
  }
  
  // Try pattern DD-MM-YYYY or DD/MM/YYYY or M/D/YYYY
  var m2 = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (m2) {
    var p1 = parseInt(m2[1], 10);
    var p2 = parseInt(m2[2], 10);
    var yr = m2[3];
    
    var dy, mo;
    if (p1 > 12) {
      dy = p1;
      mo = p2;
    } else if (p2 > 12) {
      dy = p2;
      mo = p1;
    } else {
      dy = p1;
      mo = p2;
    }
    return yr + "-" + ("0" + mo).slice(-2) + "-" + ("0" + dy).slice(-2);
  }
  
  // Try native date parsing
  var parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    var y = parsed.getFullYear();
    var m = ("0" + (parsed.getMonth() + 1)).slice(-2);
    var d = ("0" + parsed.getDate()).slice(-2);
    return y + "-" + m + "-" + d;
  }
  
  return str;
}

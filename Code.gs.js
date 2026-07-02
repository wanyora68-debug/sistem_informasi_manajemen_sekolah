/* ============================================================
   SIMS KCD XI - BACKEND (Code.gs)
   ============================================================ */

var SS_ID = "1HhnC4unsjpSV_9oadCSGB_xSadJYfs9Bx2obp2fpp9o"; 
var FOLDER_FOTO_ID = "1Hz5DoxAD3Tg4lwordmYfXpPUCkwDl7kK";

function getSpreadsheet() {
  try {
    if (SS_ID && SS_ID !== "YOUR_SPREADSHEET_ID_HERE") {
      return SpreadsheetApp.openById(SS_ID);
    }
  } catch (e) {
    Logger.log("Inaccessible SS_ID: " + e.toString());
  }
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e2) {
    throw new Error("Gagal membuka Spreadsheet. Pastikan Spreadsheet ID " + SS_ID + " valid dan dapat diakses, atau file script terikat (bound) dengan Spreadsheet Anda.");
  }
}

function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setTitle("SIMS KCD XI");
}

/* --- SISTEM LOGIN --- */
function prosesLogin(email, password, roleInput) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_User");
    var inputEmail = email.toString().toLowerCase().trim();
    var inputPass = password.toString().trim();

    var data = sheet.getDataRange().getValues();
    var foundUser = null;

    for (var i = 1; i < data.length; i++) {
      if (data[i][2].toString().toLowerCase().trim() === inputEmail && 
          data[i][3].toString().trim() === inputPass) {
        
        var statusAkun = data[i][7] ? data[i][7].toString().toLowerCase() : "aktif";
        if(statusAkun === "pending") return { status: "error", message: "Akun Anda sedang diverifikasi admin." };

        foundUser = {
          status: "success",
          user: {
            nama: data[i][1],
            email: data[i][2],
            role: data[i][4],
            sekolah: data[i][5] || "SMKN 4 GARUT",
            fotoUrl: data[i][6] || "https://www.w3schools.com/howto/img_avatar.png",
            mapel: data[i][8] || "",
            nip: data[i][9] || "",
            pangkat: data[i][10] || "",
            golongan: data[i][11] || "",
            row: i + 1
          }
        };
        break;
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

    return { status: "error", message: "Email atau Password salah." };
  } catch (e) { return { status: "error", message: e.toString() }; }
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

function getDaftarAktivitas(userNama, role) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Aktivitas");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < data.length; i++) {
      if (role === "Guru" && data[i][1] !== userNama) continue;
      list.push({
        row: i + 1,
        timestamp: data[i][0],
        guru: data[i][1],
        hari: data[i][2],
        tgl: data[i][3],
        kegiatan: data[i][4],
        tempat: data[i][5],
        penyelenggara: data[i][6],
        deskripsi: data[i][7],
        st: data[i][8],
        f1: data[i][9],
        f2: data[i][10],
        feedback: data[i][11] || ""
      });
    }
    return list;
  } catch (e) { return []; }
}

function simpanFeedbackKepsek(row, text) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Aktivitas");
    sheet.getRange(Number(row), 12).setValue(text);
    return "Feedback berhasil dikirim!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

/* --- REGISTRASI & MASTER --- */
function getMasterSekolah() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Master_Sekolah");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var list = [];
    
    // Helper to extract time string HH:mm from various types
    var parseTime = function(val) {
       if (!val) return null;
       if (val instanceof Date) {
          // Force to localized time string to avoid UTC shifting
          return Utilities.formatDate(val, "GMT+7", "HH:mm");
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

    // Load override coordinates and school hours from "Lokasi_Sekolah" sheet if it exists
    var overrides = {};
    var sheetLokasi = ss.getSheetByName("Lokasi_Sekolah");
    if (sheetLokasi) {
       var oData = sheetLokasi.getDataRange().getValues();
       for (var k = 1; k < oData.length; k++) {
          var schName = oData[k][0];
          if (schName) {
             overrides[schName.toUpperCase().trim()] = {
                lat: oData[k][1],
                lng: oData[k][2],
                jamMasuk: parseTime(oData[k][3]) || "07:00",
                jamPulang: parseTime(oData[k][4]) || "15:00"
             };
          }
       }
    }

    for (var i = 1; i < data.length; i++) {
        if (data[i][1]) {
           var schNama = data[i][1];
           var schoolKey = schNama.toUpperCase().trim();
           var rawJamM = data[i][4];
           var rawJamP = data[i][5];
           
           var jamM = parseTime(rawJamM) || "07:00";
           var jamP = parseTime(rawJamP);
           
           // Jika kolom 6 (Index 5) bukan waktu, kemungkinan itu Alamat. Coba kolom 7 (Index 6).
           if (!jamP && data[i][6]) {
              jamP = parseTime(data[i][6]);
           }
           
           if (!jamP) jamP = "15:00"; // Fallback final

           var finalLat = data[i][2] || -7.2278;
           var finalLng = data[i][3] || 107.9087;

           if (overrides[schoolKey]) {
              finalLat = overrides[schoolKey].lat;
              finalLng = overrides[schoolKey].lng;
              jamM = overrides[schoolKey].jamMasuk;
              jamP = overrides[schoolKey].jamPulang;
           }

           list.push({ 
            nama: schNama,
            lat: finalLat,
            lng: finalLng,
            jamMasuk: jamM,
            jamPulang: jamP
          });
        }
    }
    return list;
  } catch (e) { return []; }
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
      sheet.appendRow(["ID", "Nama Lengkap", "NIS/NISN", "Gender", "Tgl Lahir", "Alamat", "Kontak", "Kelas"]);
      return [];
    }
    var data = sheet.getDataRange().getValues();
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
      sheet.appendRow(["ID", "Nama Lengkap", "NIS/NISN", "Gender", "Tgl Lahir", "Alamat", "Kontak", "Kelas"]);
    }
    if (obj.row && obj.row > 0) {
      sheet.getRange(Number(obj.row), 2, 1, 7).setValues([[obj.nama, obj.nis, obj.gender, obj.tglLahir, obj.alamat, obj.kontak, obj.kelas]]);
      return "Berhasil memperbarui data siswa!";
    } else {
      sheet.appendRow(["SW-" + new Date().getTime(), obj.nama, obj.nis, obj.gender, obj.tglLahir, obj.alamat, obj.kontak, obj.kelas]);
      return "Berhasil menambah siswa baru!";
    }
  } catch (e) { return "Gagal: " + e.toString(); }
}

function imporSiswaMassal(dataArray) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Siswa");
    if (!sheet) {
      sheet = ss.insertSheet("Data_Siswa");
      sheet.appendRow(["ID", "Nama Lengkap", "NIS/NISN", "Gender", "Tgl Lahir", "Alamat", "Kontak", "Kelas"]);
    }
    var timestamp = new Date().getTime();
    var rowsToAppend = dataArray.map(function(item, index) {
      return ["SW-" + (timestamp+index), item.nama, item.nis, item.gender, item.tglLahir, item.alamat, item.kontak, item.kelas];
    });
    if (rowsToAppend.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, 8).setValues(rowsToAppend);
      return "Berhasil mengimpor " + rowsToAppend.length + " data siswa!";
    }
    return "Tidak ada data.";
  } catch (e) { return "Gagal Impor: " + e.toString(); }
}

function hapusSiswa(row) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Siswa");
    sheet.deleteRow(Number(row));
    return "Data siswa telah dihapus.";
  } catch (e) { return "Gagal menghapus: " + e.toString(); }
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
          return Utilities.formatDate(val, "GMT+7", "HH:mm");
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
    
    var header = data[0].map(function(h) { return h.toString().toLowerCase().trim(); });
    var rows = data.slice(1);
    
    var results = [];
    rows.forEach(function(row) {
      var obj = {};
      header.forEach(function(h, index) {
        obj[h] = row[index];
      });
      
      // Filter by date and class (case insensitive)
      var dbTgl = obj.tanggal instanceof Date ? Utilities.formatDate(obj.tanggal, "GMT+7", "yyyy-MM-dd") : obj.tanggal;
      if (dbTgl == tgl && (obj.kelas || "").toString().toUpperCase().trim() === (kelas || "").toUpperCase().trim()) {
        try {
          obj.absensi = JSON.parse(obj["data absensi (json)"]);
        } catch(e) {
          obj.absensi = [];
        }
        results.push(obj);
      }
    });
    return results;
  } catch (e) {
    Logger.log("Error getLaporanAbsensiSiswa: " + e.toString());
    return [];
  }
}

function simpanJurnalMengajar(obj) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Jurnal_Mengajar");
    var folder;
    try { folder = DriveApp.getFolderById(FOLDER_FOTO_ID); } catch(e) { folder = DriveApp.getRootFolder(); }
    var url1 = obj.foto1 ? uploadFileBase64(obj.foto1, "JRN1_" + obj.guru, folder) : "";
    var url2 = obj.foto2 ? uploadFileBase64(obj.foto2, "JRN2_" + obj.guru, folder) : "";
    sheet.appendRow([new Date(), obj.guru, obj.hari, obj.tgl, obj.kelas, obj.keahlian, obj.jam, obj.mapel, obj.materi, url1, url2]);
    return "Jurnal Mengajar berhasil disimpan!";
  } catch (e) { return "Gagal: " + e.toString(); }
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
        } else if (roleLow === "kepala sekolah" || roleLow === "operator") {
           if (targetSchoolNorm !== "PUSAT KCD XI" && targetSchoolNorm !== "") {
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
            feedback: rowData[11] || ""
        });
    }
    list.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
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

function simpanFeedbackAktivitas(row, text) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Data_Aktivitas");
    sheet.getRange(Number(row), 12).setValue(text);
    return "Feedback Aktivitas berhasil dikirim!";
  } catch (e) { return "Gagal: " + e.toString(); }
}

/* --- NILAI & TUGAS --- */
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

/* --- JADWAL MENGAJAR (CLASS SCHEDULE) --- */
function getDaftarJadwal(userNama, role) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Jadwal Guru") || ss.getSheetByName("Data_Jadwal") || ss.getSheetByName("Jadwal") || ss.getSheetByName("Data Jadwal");
    
    if (!sheet) {
      Logger.log("Sheet Jadwal tidak ditemukan");
      return [];
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    var headers = data[0].map(function(h) { return h.toString().toUpperCase().trim(); });
    
    // Mapping index berdasarkan header
    var idxHari = headers.indexOf("HARI");
    var idxJam = headers.indexOf("JAM");
    var idxKelas = headers.indexOf("KELAS");
    var idxMapel = headers.indexOf("MAPEL");
    var idxGuru = headers.indexOf("GURU");
    var idxRuang = headers.indexOf("RUANG");

    // Fallback jika header tidak standar
    if (idxHari === -1) idxHari = 0;
    if (idxJam === -1) idxJam = 1;
    if (idxKelas === -1) idxKelas = 2;
    if (idxMapel === -1) idxMapel = 3;
    if (idxGuru === -1) idxGuru = 4;
    if (idxRuang === -1) idxRuang = 5;

    var roleLow = (role || "").toString().toLowerCase().trim();
    var targetName = (userNama || "").toString().toUpperCase().trim();
    var list = [];

    for (var i = 1; i < data.length; i++) {
        var rowData = data[i];
        if (!rowData || rowData.length === 0 || rowData.join("").trim() === "") continue;
        
        var dbGuru = (rowData[idxGuru] || "").toString().toUpperCase().trim();
        
        // Filter untuk Guru: Tampilkan hanya jadwal miliknya (Substring Match)
        // Logika diperbaiki agar lebih fleksibel terhadap gelar
        if (roleLow === "guru") {
           if (!targetName) continue;
           // Cek apakah nama login ada di dalam nama database, atau sebaliknya
           var isMatch = (dbGuru === targetName) || (dbGuru.indexOf(targetName) !== -1) || (targetName.indexOf(dbGuru) !== -1);
           if (!isMatch) continue;
        }
        
        // Untuk Admin, Operator, Kepala Sekolah: Tampilkan Semua
        list.push({
            row: i + 1,
            hari: rowData[idxHari] || "",
            jam: rowData[idxJam] || "",
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
    var sheet = ss.getSheetByName("Jadwal Guru") || ss.getSheetByName("Jadwal Guru") || ss.getSheetByName("Jadwal Guru") || ss.getSheetByName("Jadwal Guru");
    if (!sheet) return [];
    
    var data = sheet.getDataRange().getValues();
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
    var sheet = ss.getSheetByName("Jadwal Guru");
    if (!sheet) {
      sheet = ss.insertSheet("Jadwal Guru");
      sheet.appendRow(["Hari", "Jam", "Mapel", "Guru", "Ruang"]);
    }
    
    // Jika ada row, update. Jika tidak, append.
    if (obj.row && obj.row > 0) {
       sheet.getRange(Number(obj.row), 3, 1, 3).setValues([[obj.hari, obj.jamKe, obj.mapel]]);
       sheet.getRange(Number(obj.row), 6).setValue(obj.guru);
       tampilkanJadwalMengajar();
       return "Jadwal diperbarui!";
    } else {
       sheet.appendRow([new Date(), obj.kelas, obj.hari, obj.jamKe, obj.mapel, obj.guru]);
       tampilkanJadwalMengajar();
       return "Jadwal baru ditambahkan!";
    }
  } catch (e) { return "Gagal: " + e.toString(); }
}

function hapusJadwal(row) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Jadwal Guru");
    sheet.deleteRow(Number(row));
    return "Jadwal telah dihapus.";
  } catch (e) { return "Gagal: " + e.toString(); }
}

function tampilkanJadwalMengajar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName("Jadwal Guru");
  var targetSheet = ss.getSheetByName("Jadwal Mengajar");

  if (!targetSheet) {
    targetSheet = ss.insertSheet("Jadwal Mengajar");
  }

  var data = sourceSheet.getDataRange().getValues();
  targetSheet.clear();
  targetSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
}

/* --- HELPER UPLOAD --- */
function uploadFileBase64(base64, namePrefix, folder) {
  var content = base64.split(",");
  var bytes = Utilities.base64Decode(content[1]);
  var blob = Utilities.newBlob(bytes, "image/jpeg", namePrefix + "_" + new Date().getTime() + ".jpg");
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return "https://lh3.googleusercontent.com/d/" + file.getId();
}

function getSheetSafely(name) {
  var ss = getSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
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

function getDaftarAktivitasKepsek(sekolah) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Aktivitas_Kepsek");
    if (!sheet) return [];
    var data = sheet.getDataRange().getDisplayValues();
    var list = [];
    var normSekolah = (sekolah || "").toString().toUpperCase().trim();
    for (var i = 1; i < data.length; i++) {
        var rowData = data[i];
        if (normSekolah && (rowData[9] || "").toString().toUpperCase().trim() !== normSekolah) continue;
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
            sekolah: rowData[9]
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

function getDaftarLaporanKepsek(sekolah) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Laporan_Kepsek");
    if (!sheet) return [];
    var data = sheet.getDataRange().getDisplayValues();
    var list = [];
    var normSekolah = (sekolah || "").toString().toUpperCase().trim();
    for (var i = 1; i < data.length; i++) {
        var rowData = data[i];
        if (normSekolah && (rowData[6] || "").toString().toUpperCase().trim() !== normSekolah) continue;
        list.push({
            row: i + 1,
            timestamp: rowData[0],
            kepsek: rowData[1],
            tglPelaporan: rowData[2],
            namaKegiatan: rowData[3],
            deskripsiLaporan: rowData[4],
            dokumen: rowData[5],
            sekolah: rowData[6]
        });
    }
    list.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    return list;
  } catch (e) { return []; }
}

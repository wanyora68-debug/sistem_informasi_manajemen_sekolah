const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const anchorStart = 'function unduhRekapDetailExcel() {';
const anchorEnd = 'function unduhSelfRekapDetailPDF() {';

const idxStart = content.indexOf(anchorStart);
const idxEnd = content.indexOf(anchorEnd);

if (idxStart !== -1 && idxEnd !== -1 && idxStart < idxEnd) {
    const replacement = `function unduhRekapDetailExcel() {
         if (!currentRekapSiswaDetailData || currentRekapSiswaDetailData.length === 0) {
            alert("Tidak ada data untuk diexport. Silakan tampilkan rekap terlebih dahulu.");
            return;
         }
         const bln = document.getElementById('selBlnRekapSiswa').value;
         const kelas = document.getElementById('selKelasRekapSiswa').value;
         const blnNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
         
         let isAllClass = kelas === "ALL";
         let headers = ["NO", "NIS/NISN", "NAMA SISWA"];
         if (isAllClass) headers.push("KELAS");
         headers.push("HADIR (H)", "SAKIT (S)", "IZIN (I)", "ALPA (A)", "TOTAL PERTEMUAN", "PERSENTASE HADIR");

         let ws_data = [
            ["LAPORAN REKAP BULANAN KEHADIRAN SISWA"],
            [\`KELAS: \${isAllClass ? 'SEMUA KELAS' : kelas.toUpperCase()}\`],
            [\`BULAN: \${blnNames[bln].toUpperCase()}\`],
            [],
            headers
         ];
         
         currentRekapSiswaDetailData.forEach((s, idx) => {
            let row = [
               idx + 1,
               s.nisn || '-',
               s.nama
            ];
            if (isAllClass) row.push(s.kelas || '-');
            row.push(
               s.H,
               s.S,
               s.I,
               s.A,
               s.totalHari,
               \`\${s.persen}%\`
            );
            ws_data.push(row);
         });
         
         let wb = XLSX.utils.book_new();
         let ws = XLSX.utils.aoa_to_sheet(ws_data);
         XLSX.utils.book_append_sheet(wb, ws, "Rekap Kehadiran");
         XLSX.writeFile(wb, \`REKAP_SISWA_\${kelas}_BULAN_\${blnNames[bln].toUpperCase()}.xlsx\`);
      }

      function unduhSelfRekapDetailExcel() {
         if (!currentSelfRekapSiswaDetailData || currentSelfRekapSiswaDetailData.length === 0) {
            alert("Tidak ada data untuk diexport. Silakan tampilkan rekap terlebih dahulu.");
            return;
         }
         const bln = document.getElementById('selBlnSelfRekapSiswa').value;
         const kelas = document.getElementById('selKelasSelfRekapSiswa').value;
         const blnNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
         
         let ws_data = [
            ["LAPORAN REKAP BULANAN KEHADIRAN SISWA"],
            [\`KELAS: \${kelas.toUpperCase()}\`],
            [\`BULAN: \${blnNames[bln].toUpperCase()}\`],
            [],
            ["NO", "NIS/NISN", "NAMA SISWA", "HADIR (H)", "SAKIT (S)", "IZIN (I)", "ALPA (A)", "TOTAL PERTEMUAN", "PERSENTASE HADIR"]
         ];
         
         currentSelfRekapSiswaDetailData.forEach((s, idx) => {
            ws_data.push([
               idx + 1,
               s.nisn || '-',
               s.nama,
               s.H,
               s.S,
               s.I,
               s.A,
               s.totalHari,
               \`\${s.persen}%\`
            ]);
         });
         
         let wb = XLSX.utils.book_new();
         let ws = XLSX.utils.aoa_to_sheet(ws_data);
         XLSX.utils.book_append_sheet(wb, ws, "Rekap Kehadiran");
         XLSX.writeFile(wb, \`REKAP_SISWA_\${kelas}_BULAN_\${blnNames[bln].toUpperCase()}.xlsx\`);
      }

      function unduhRekapDetailPDF() {
         if (!currentRekapSiswaDetailData || currentRekapSiswaDetailData.length === 0) {
            alert("Tidak ada data untuk diexport. Silakan tampilkan rekap terlebih dahulu.");
            return;
         }
         const bln = document.getElementById('selBlnRekapSiswa').value;
         const kelas = document.getElementById('selKelasRekapSiswa').value;
         const blnNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
         
         const { jsPDF } = window.jspdf;
         const doc = new jsPDF();
         
         doc.setFont("helvetica", "bold");
         doc.setFontSize(14);
         doc.text("LAPORAN REKAP BULANAN KEHADIRAN SISWA", 14, 20);
         doc.setFontSize(10);
         doc.text(\`KELAS: \${kelas === 'ALL' ? 'SEMUA KELAS' : kelas.toUpperCase()}\`, 14, 26);
         doc.text(\`BULAN: \${blnNames[bln].toUpperCase()}\`, 14, 32);
         
         let isAllClass = kelas === "ALL";
         let headers = ["NO", "NIS/NISN", "NAMA SISWA"];
         if (isAllClass) headers.push("KELAS");
         headers.push("H", "S", "I", "A", "TOTAL", "% HADIR");

         let body = currentRekapSiswaDetailData.map((s, idx) => {
            let row = [
               idx + 1,
               s.nisn || '-',
               s.nama
            ];
            if (isAllClass) row.push(s.kelas || '-');
            row.push(
               s.H,
               s.S,
               s.I,
               s.A,
               s.totalHari,
               \`\${s.persen}%\`
            );
            return row;
         });
         
         doc.autoTable({
            startY: 38,
            head: [headers],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59] },
            styles: { fontSize: 8, font: "helvetica", halign: 'center' },
            columnStyles: isAllClass ? { 
               2: { halign: 'left', fontStyle: 'bold' },
               3: { halign: 'center' }
            } : {
               2: { halign: 'left', fontStyle: 'bold' }
            }
         });

         // Add Garut date, teacher and principal signatures
         let finalY = doc.lastAutoTable.finalY || 40;
         let sigY = finalY + 15;
         if (sigY + 45 > 285) {
            doc.addPage();
            sigY = 20;
         }
         
         const tanggalUnduh = new Date().toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'});
         
         // Left column: Kepala Sekolah
         doc.setFont("helvetica", "normal");
         doc.setFontSize(9);
         doc.text("MENGETAHUI,", 14, sigY);
         doc.text("KEPALA SEKOLAH,", 14, sigY + 5);
         
         // Right column: Guru Mata Pelajaran
         doc.text(\`Garut, \${tanggalUnduh}\`, 130, sigY - 6);
         doc.text("GURU MATA PELAJARAN,", 130, sigY);
         
         let nameY = sigY + 28;
         
         let teacherNama = '____________________';
         let teacherNip = '____________________';

         const chosenGuruName = document.getElementById('selGuruRekapSiswa') ? document.getElementById('selGuruRekapSiswa').value : 'ALL';
         if (chosenGuruName && chosenGuruName !== 'ALL') {
            const chosenGuruObj = allUsersList.find(u => u.nama === chosenGuruName);
            if (chosenGuruObj) {
               teacherNama = chosenGuruObj.nama.toUpperCase();
               teacherNip = chosenGuruObj.nip || '____________________';
            }
         } else {
            // Fallback 1: Try to find any teacher for this class in allScheduleList
            const sched = allScheduleList.find(s => s.kelas === kelas);
            if (sched && sched.guru) {
               const gObj = allUsersList.find(u => u.nama === sched.guru);
               if (gObj) {
                  teacherNama = gObj.nama.toUpperCase();
                  teacherNip = gObj.nip || '____________________';
               }
            } else {
               // Fallback 2: If the logged in user is indeed a Guru, use activeUser
               if (activeUser && activeUser.role === 'Guru') {
                  teacherNama = activeUser.nama.toUpperCase();
                  teacherNip = activeUser.nip || '____________________';
               }
            }
         }

         const targetSchoolName = (chosenGuruName && chosenGuruName !== 'ALL') 
            ? (allUsersList.find(u => u.nama === chosenGuruName)?.sekolah || activeUser.sekolah)
            : activeUser.sekolah;

         const kepsekObj = allUsersList.find(u => isKepsekRole(u.role) && matchSchool(u.sekolah, targetSchoolName));
         const kepsekNama = kepsekObj && kepsekObj.nama ? kepsekObj.nama.toUpperCase() : '____________________';
         const kepsekNip = kepsekObj && kepsekObj.nip ? kepsekObj.nip : '____________________';
         
         // Draw Left (Kepala Sekolah)
         doc.setFont("helvetica", "bold");
         doc.text(kepsekNama, 14, nameY);
         const kWidth = doc.getTextWidth(kepsekNama);
         doc.line(14, nameY + 1, 14 + kWidth, nameY + 1);
         doc.setFont("helvetica", "normal");
         doc.text(\`NIP. \${kepsekNip}\`, 14, nameY + 6);
         
         // Draw Right (Guru Mata Pelajaran)
         doc.setFont("helvetica", "bold");
         doc.text(teacherNama, 130, nameY);
         const tWidth = doc.getTextWidth(teacherNama);
         doc.line(130, nameY + 1, 130 + tWidth, nameY + 1);
         doc.setFont("helvetica", "normal");
         doc.text(\`NIP. \${teacherNip}\`, 130, nameY + 6);
         
         doc.save(\`REKAP_SISWA_\${kelas}_BULAN_\${blnNames[bln].toUpperCase()}.pdf\`);
      }

`;
    content = content.substring(0, idxStart) + replacement + content.substring(idxEnd);
    fs.writeFileSync('index.html', content, 'utf8');
    console.log('Successfully replaced unduhRekapDetailExcel & unduhRekapDetailPDF without nested evaluations!');
} else {
    console.log('Error: Anchors not found');
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

declare const google: any;

// This service handles communication with the Google Apps Script backend.
// In the AI Studio preview environment, it simulates the behavior.

const isGAS = typeof google !== 'undefined' && google.script && google.script.run;

export const callGAS = <T>(functionName: string, ...args: any[]): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (isGAS) {
      google.script.run
        .withSuccessHandler((res: T) => resolve(res))
        .withFailureHandler((err: any) => reject(err))
        [functionName](...args);
    } else {
      // Simulation mode for Vite environment
      console.log(`[GAS Simulation] Calling ${functionName} with:`, args);
      
      // Simulate network latency
      setTimeout(() => {
        switch (functionName) {
          case 'prosesLogin':
            resolve({
              status: 'success',
              user: {
                nama: "Guru Demo",
                email: args[0],
                role: args[2] || "Guru",
                sekolah: "SMKN 4 GARUT",
                fotoUrl: "https://www.w3schools.com/howto/img_avatar.png",
                row: 2
              }
            } as any);
            break;
          case 'getMasterSekolah':
            resolve([{
              nama: "SMKN 4 GARUT",
              lat: -7.2278,
              lng: 107.9087,
              jamMasuk: "07:00",
              jamPulang: "15:00"
            }] as any);
            break;
          case 'getDaftarKelasFull':
            resolve([
              { id: '1', nama: 'XII RPL 1', keahlian: 'RPL', jumlah: '36', wali: 'Budi Santoso', row: 2 },
              { id: '2', nama: 'XII RPL 2', keahlian: 'RPL', jumlah: '34', wali: 'Siti Aminah', row: 3 }
            ] as any);
            break;
          case 'getDaftarSiswa':
            resolve([
              { id: '1', nama: 'Ahmad Dani', nis: '12345', gender: 'L', kelas: 'XII RPL 1' },
              { id: '2', nama: 'Bunga Citra', nis: '12346', gender: 'P', kelas: 'XII RPL 1' },
              { id: '3', nama: 'Candra Wijaya', nis: '12347', gender: 'L', kelas: 'XII RPL 2' }
            ] as any);
            break;
          case 'getDaftarJurnal':
            resolve([
              { guru: "Guru Demo", hari: "Senin", tgl: "2024-04-22", jam: "08:15", kelas: "XII RPL 1", keahlian: "RPL", mapel: "Pemrograman Web", materi: "Dasar React Hooks", foto1: null, foto2: null },
              { guru: "Guru Demo", hari: "Selasa", tgl: "2024-04-23", jam: "10:30", kelas: "XII RPL 2", keahlian: "RPL", mapel: "Database", materi: "SQL Joins", foto1: null, foto2: null }
            ] as any);
            break;
          case 'getDaftarJadwal':
            resolve([
              { hari: "Senin", jam: "07:00 - 09:00", kelas: "XII RPL 1", mapel: "Web", ruang: "Lab 1" },
              { hari: "Selasa", jam: "09:00 - 11:00", kelas: "XII RPL 2", mapel: "DB", ruang: "Lab 2" }
            ] as any);
            break;
          case 'simpanAbsenGuru':
            resolve({ status: 'success', message: 'Absensi Berhasil Disimpan!' } as any);
            break;
          case 'simpanAbsensiSiswa':
          case 'simpanJurnalMengajar':
            resolve("Berhasil disimpan!" as any);
            break;
          default:
            resolve("Success (Simulated)" as any);
        }
      }, 1000);
    }
  });
};

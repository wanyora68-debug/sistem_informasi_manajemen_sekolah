/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, 
  UserPlus, 
  LogOut, 
  Home, 
  User, 
  Settings, 
  ChevronRight, 
  Camera, 
  School,
  AlertCircle,
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Users,
  MapPin,
  ClipboardList,
  Save,
  Activity,
  Printer,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { callGAS } from './services/gasService';
import * as XLSX from 'xlsx';

// Types and Interfaces
interface User {
  nama: string;
  email: string;
  role: string;
  sekolah: string;
  mapel?: string;
  fotoUrl?: string;
  row?: number;
}

interface ClassData {
  id: string;
  nama: string;
  keahlian: string;
  jumlah: string;
  wali: string;
  row?: number;
}

interface Student {
  id: string;
  nama: string;
  nis: string;
  gender: string;
  kelas: string;
  row?: number;
}

type TabType = 'home' | 'profil' | 'absensi-guru' | 'absensi-siswa' | 'jurnal' | 'input-kelas' | 'input-siswa' | 'input-jadwal' | 'sekolah';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('Guru');
  const [activeUser, setActiveUser] = useState<User | null>(null);
  
  // App Data State
  const [classList, setClassList] = useState<ClassData[]>([]);
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<any>({
    nama: "SMKN 4 GARUT",
    jamMasuk: "07:00",
    jamPulang: "15:00",
    lat: -7.2278,
    lng: 107.9087
  });
  
  // School Settings Form State
  const [setJamMasuk, setSetJamMasuk] = useState("07:00");
  const [setJamPulang, setSetJamPulang] = useState("15:00");
  const [setLat, setSetLat] = useState("-7.2278");
  const [setLng, setSetLng] = useState("107.9087");
  const [isSavingSchool, setIsSavingSchool] = useState(false);

  // Jadwal Form State
  const [jadwalHari, setJadwalHari] = useState('Senin');
  const [jadwalJam, setJadwalJam] = useState('');
  const [jadwalKelas, setJadwalKelas] = useState('');
  const [jadwalMapel, setJadwalMapel] = useState('');
  const [jadwalRuang, setJadwalRuang] = useState('');
  const [isSubmittingJadwal, setIsSubmittingJadwal] = useState(false);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Profile Edit State
  const [editNama, setEditNama] = useState('');
  const [editMapel, setEditMapel] = useState('');
  const [editFoto, setEditFoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Input Data Kelas State
  const [namaKelas, setNamaKelas] = useState('');
  const [waliKelas, setWaliKelas] = useState('');
  const [jumlahSiswa, setJumlahSiswa] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [isSubmittingKelas, setIsSubmittingKelas] = useState(false);

  // Form Input Data Siswa State
  const [studentNama, setStudentNama] = useState('');
  const [studentNis, setStudentNis] = useState('');
  const [studentGender, setStudentGender] = useState('L');
  const [studentKelas, setStudentKelas] = useState('');
  const [studentAlamat, setStudentAlamat] = useState('');
  const [studentKontak, setStudentKontak] = useState('');
  const [isSubmittingSiswa, setIsSubmittingSiswa] = useState(false);

  // Absensi Guru State
  const [absenType, setAbsenType] = useState<'DATANG' | 'PULANG'>('DATANG');
  const [absenFoto, setAbsenFoto] = useState<string | null>(null);
  const [isSubmittingAbsenGuru, setIsSubmittingAbsenGuru] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [distance, setDistance] = useState<number | null>(null);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);

  // Absensi Siswa State
  const [absensiSiswaDate, setAbsensiSiswaDate] = useState(() => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  });
  const [absensiSiswaHari, setAbsensiSiswaHari] = useState(() => {
    const d = new Date();
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[d.getDay()];
  });
  const [absensiTime, setAbsensiTime] = useState(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  const [selectedKelas, setSelectedKelas] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      setAbsensiTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const [mapelSiswa, setMapelSiswa] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'H' | 'S' | 'I' | 'A'>>({});
  const [isSubmittingAbsenSiswa, setIsSubmittingAbsenSiswa] = useState(false);

  // Laporan Absensi Siswa State
  const [laporanAbsensiData, setLaporanAbsensiData] = useState<any[]>([]);
  const [isFetchingLaporan, setIsFetchingLaporan] = useState(false);
  const [viewModeAbsensi, setViewModeAbsensi] = useState<'input' | 'laporan'>('input');

  const handleFetchLaporan = async () => {
    if (!selectedKelas) {
      alert("Pilih kelas terlebih dahulu untuk melihat laporan.");
      return;
    }
    setIsFetchingLaporan(true);
    try {
      const data = await callGAS<any[]>('getLaporanAbsensiSiswa', absensiSiswaDate, selectedKelas);
      setLaporanAbsensiData(data || []);
      if (data && data.length > 0) {
        setViewModeAbsensi('laporan');
      } else {
        alert("Tidak ada rekaman absensi untuk tanggal dan kelas ini.");
      }
    } catch (e) {
      console.error(e);
      alert("Error mengambil data: " + e);
    } finally {
      setIsFetchingLaporan(false);
    }
  };

  // Jurnal State
  const [jurnalList, setJurnalList] = useState<any[]>([]);
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [jurnalDate, setJurnalDate] = useState(new Date().toISOString().split('T')[0]);
  const [jurnalKelas, setJurnalKelas] = useState('');
  const [jurnalMapel, setJurnalMapel] = useState('');
  const [jurnalMateri, setJurnalMateri] = useState('');
  const [jurnalFoto1, setJurnalFoto1] = useState<string | null>(null);
  const [jurnalFoto2, setJurnalFoto2] = useState<string | null>(null);
  const [isSubmittingJurnal, setIsSubmittingJurnal] = useState(false);

  useEffect(() => {
    console.log("SIMS KCD XI - Application Started");
    console.log("Active User:", activeUser?.nama);
    console.log("Current Version: 2.0.7");
  }, [activeUser]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentPage === 'dashboard') {
      loadInitialData();
      refreshLocation();
    }
  }, [currentPage]);

  const loadInitialData = async () => {
    try {
      const schools = await callGAS<any[]>('getMasterSekolah');
      if (schools && schools.length > 0) {
        const userSekolah = (activeUser?.sekolah || "").toString().toUpperCase().trim();
        const mySchool = schools.find(s => (s.nama || "").toString().toUpperCase().trim() === userSekolah) || schools[0];
        setSchoolSettings(mySchool);
        // Sync form states
        setSetJamMasuk(mySchool.jamMasuk || mySchool.jammasuk || "07:00");
        setSetJamPulang(mySchool.jamPulang || mySchool.jampulang || "15:00");
        setSetLat(mySchool.lat?.toString() || "-7.2278");
        setSetLng(mySchool.lng?.toString() || "107.9087");
      }
      
      const classes = await callGAS<ClassData[]>('getDaftarKelasFull');
      setClassList(classes || []);
      
      const students = await callGAS<Student[]>('getDaftarSiswa');
      setStudentList(students || []);

      const journals = await callGAS<any[]>('getDaftarJurnal', activeUser?.nama, activeUser?.role);
      setJurnalList(journals || []);

      const schedules = await callGAS<any[]>('getDaftarJadwal', activeUser?.nama, activeUser?.role);
      setJadwalList(schedules || []);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  const handleSubmitJadwal = async () => {
    if (!jadwalHari || !jadwalJam || !jadwalKelas || !jadwalMapel) {
      alert("Lengkapi data jadwal!");
      return;
    }
    setIsSubmittingJadwal(true);
    try {
      const res = await callGAS('simpanJadwalGuru', {
        guru: activeUser?.nama?.toUpperCase(),
        hari: jadwalHari.toUpperCase(),
        jam: jadwalJam,
        kelas: jadwalKelas.toUpperCase(),
        mapel: jadwalMapel.toUpperCase(),
        ruang: jadwalRuang.toUpperCase()
      });
      alert(res || "Jadwal berhasil disimpan!");
      setJadwalJam('');
      setJadwalMapel('');
      setJadwalRuang('');
      loadInitialData();
    } catch (e: any) {
      alert("Gagal: " + e.toString());
    } finally {
      setIsSubmittingJadwal(false);
    }
  };

  const handleSubmitSchoolSettings = async () => {
    setIsSavingSchool(true);
    try {
      const res = await callGAS('simpanLokasiSekolah', 
        activeUser?.sekolah?.toUpperCase(), 
        parseFloat(setLat), 
        parseFloat(setLng), 
        setJamMasuk, 
        setJamPulang
      );
      alert(res || "Pengaturan sekolah berhasil diperbarui!");
      loadInitialData();
    } catch (e: any) {
      alert("Gagal: " + e.toString());
    } finally {
      setIsSavingSchool(false);
    }
  };

  const refreshLocation = () => {
    setLocationStatus('loading');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        
        if (schoolSettings) {
          const dist = calculateDistance(latitude, longitude, schoolSettings.lat, schoolSettings.lng);
          setDistance(dist);
        } else {
          setDistance(0); // Mock/Fallback
        }
        setLocationStatus('success');
      },
      (err) => {
        console.error(err);
        setLocationStatus('error');
      }
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c);
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPass) {
      alert("Email dan Password wajib diisi!");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await callGAS<any>('prosesLogin', loginEmail, loginPass, selectedRole);
      if (res.status === 'success') {
        setActiveUser(res.user);
        setEditNama(res.user.nama);
        setEditMapel(res.user.mapel || '');
        setCurrentPage('dashboard');
        setShowLoginModal(false);
      } else {
        alert(res.message || "Login gagal.");
      }
    } catch (err) {
      alert("Terjadi kesalahan system.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCapturePhoto = (setter: (val: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSubmitAbsenGuru = async () => {
    if (!absenFoto) {
      alert("Foto wajib diambil!");
      return;
    }
    if (locationStatus !== 'success') {
      alert("Lokasi GPS harus aktif!");
      return;
    }

    // Periksa Waktu Absensi
    if (schoolSettings) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const parseTime = (timeStr: string) => {
        if (!timeStr) return 0;
        const normalized = timeStr.replace('.', ':');
        const [h, m] = normalized.split(':');
        return (parseInt(h) || 0) * 60 + (parseInt(m) || 0);
      };

      if (absenType === 'DATANG') {
        const targetMinutes = parseTime(schoolSettings.jamMasuk);
        const startMinutes = targetMinutes - 180; // 3 jam sebelum
        
        if (currentMinutes < startMinutes) {
          alert(`Absen MASUK belum dibuka. Minimal 3 jam sebelum ${schoolSettings.jamMasuk}`);
          return;
        }
      } else {
        const targetMinutes = parseTime(schoolSettings.jamPulang);
        if (currentMinutes < targetMinutes) {
          alert(`Belum waktunya PULANG. Jadwal: ${schoolSettings.jamPulang}`);
          return;
        }
      }
    }

    setIsSubmittingAbsenGuru(true);
    try {
      const res = await callGAS<any>('simpanAbsenGuru', {
        nama: activeUser?.nama,
        email: activeUser?.email?.toLowerCase(),
        sekolah: activeUser?.sekolah,
        tipe: absenType,
        lokasi: `${coords?.lat}, ${coords?.lng}`,
        jarak: `${distance} Meter`,
        fotoBase64: absenFoto
      });
      
      if (res.status === 'success') {
        alert(res.message);
        setAbsenFoto(null);
        setActiveTab('home');
      } else {
        alert("Gagal: " + res.message);
      }
    } catch (e: any) {
      alert("Error: " + e.toString());
    } finally {
      setIsSubmittingAbsenGuru(false);
    }
  };

  const getIndoDay = (date: Date) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()];
  };

  const getFullIndoDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    if (selectedKelas) {
      const initial: Record<string, 'H' | 'S' | 'I' | 'A'> = {};
      studentList.forEach((s) => {
        if (s.kelas === selectedKelas) {
          const sid = s.row?.toString() || s.id || Math.random().toString();
          initial[sid] = 'H';
        }
      });
      setAttendanceRecords(initial);
    }
  }, [selectedKelas, studentList]);

  const handleSubmitAbsenSiswa = async () => {
    if (!selectedKelas || !mapelSiswa) {
      alert("Pilih Kelas dan isi Mapel!");
      return;
    }
    
    setIsSubmittingAbsenSiswa(true);
    try {
      const absensiPayload: any = {};
      filteredStudents.forEach(s => {
        const sid = s.row?.toString() || s.id;
        absensiPayload[s.nama] = attendanceRecords[sid] || 'H';
      });

      await callGAS('simpanAbsensiSiswa', {
        guru: activeUser?.nama,
        kelas: selectedKelas,
        mapel: mapelSiswa,
        hari: absensiSiswaHari,
        tgl: absensiSiswaDate,
        absensi: absensiPayload
      });
      alert("Absensi siswa berhasil disimpan!");
      setMapelSiswa('');
      setAttendanceRecords({});
      setActiveTab('home');
    } catch (e) {
      alert("Gagal menyimpan absensi siswa.");
    } finally {
      setIsSubmittingAbsenSiswa(false);
    }
  };

  const handleSubmitJurnal = async () => {
    if (!jurnalKelas || !jurnalMapel || !jurnalMateri) {
      alert("Lengkapi data jurnal (Kelas, Mapel, Materi)!");
      return;
    }

    setIsSubmittingJurnal(true);
    try {
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const dateObj = new Date(jurnalDate);
      const hari = dayNames[dateObj.getDay()];

      const selectedKlsData = classList.find(c => c.nama === jurnalKelas);

      const res = await callGAS('simpanJurnalMengajar', {
        guru: activeUser?.nama || "Guru",
        hari: hari,
        tgl: jurnalDate,
        kelas: jurnalKelas,
        keahlian: selectedKlsData?.keahlian || "-",
        jam: "-", 
        mapel: jurnalMapel,
        materi: jurnalMateri,
        foto1: jurnalFoto1,
        foto2: jurnalFoto2
      });
      console.log("Jurnal result:", res);
      alert("Jurnal mengajar berhasil dikirim!");
      
      // Cleanup
      setJurnalMapel('');
      setJurnalMateri('');
      setJurnalFoto1(null);
      setJurnalFoto2(null);
      
      // Refresh list
      loadInitialData();
      setActiveTab('home');
    } catch (e: any) {
      console.error("Jurnal Error:", e);
      alert("Gagal mengirim jurnal: " + e.toString());
    } finally {
      setIsSubmittingJurnal(false);
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    setCurrentPage('landing');
    setActiveTab('home');
  };

  const handleSaveProfile = async () => {
    if (!editNama) return;
    setIsSaving(true);
    try {
      const res = await callGAS<any>('updateProfilGuru', {
        emailUser: activeUser?.email,
        namaBaru: editNama,
        mapelBaru: editMapel,
        fotoBase64: editFoto
      });
      if (res.status === 'success') {
        if (activeUser) {
          setActiveUser({ 
            ...activeUser, 
            nama: editNama, 
            mapel: editMapel,
            fotoUrl: res.newUrl || activeUser.fotoUrl
          });
        }
        alert("Profil berhasil diperbarui!");
        setActiveTab('home');
        setEditFoto(null);
      } else {
        alert("Gagal: " + res.message);
      }
    } catch (err) {
      alert("Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitKelas = async () => {
    if (!namaKelas || !waliKelas || !jumlahSiswa || !jurusan) {
      alert("Semua field data kelas wajib diisi!");
      return;
    }

    setIsSubmittingKelas(true);
    try {
      const res = await callGAS<string>('simpanKelas', {
        nama: namaKelas,
        wali: waliKelas,
        jumlah: jumlahSiswa,
        keahlian: jurusan
      });
      alert(res);
      setNamaKelas('');
      setWaliKelas('');
      setJumlahSiswa('');
      setJurusan('');
      loadInitialData(); // Refresh list
    } catch (err) {
      alert("Gagal menyimpan data kelas.");
    } finally {
      setIsSubmittingKelas(false);
    }
  };

  const handleSubmitSiswa = async () => {
    if (!studentNama || !studentNis || !studentKelas) {
      alert("Lengkapi data siswa (Nama, NIS, Kelas)!");
      return;
    }

    setIsSubmittingSiswa(true);
    try {
      const res = await callGAS<string>('simpanSiswa', {
        nama: studentNama,
        nis: studentNis,
        gender: studentGender,
        kelas: studentKelas,
        alamat: studentAlamat,
        kontak: studentKontak,
        tglLahir: '' // Optional for now
      });
      alert(res);
      setStudentNama('');
      setStudentNis('');
      setStudentGender('L');
      setStudentKelas('');
      setStudentAlamat('');
      setStudentKontak('');
      loadInitialData(); // Refresh list
    } catch (err) {
      alert("Gagal menyimpan data siswa.");
    } finally {
      setIsSubmittingSiswa(false);
    }
  };

  const getAttendanceBtnClass = (studentId: string, status: 'H' | 'S' | 'I' | 'A') => {
    const current = attendanceRecords[studentId] || 'H';
    
    if (current === status) {
      switch(status) {
        case 'H': return "bg-green-600 text-white shadow-xl ring-4 ring-green-100 border-2 border-green-700 scale-105 z-10 font-black";
        case 'S': return "bg-blue-600 text-white shadow-xl ring-4 ring-blue-100 border-2 border-blue-700 scale-105 z-10 font-black";
        case 'I': return "bg-yellow-500 text-white shadow-xl ring-4 ring-yellow-100 border-2 border-yellow-600 scale-105 z-10 font-black";
        case 'A': return "bg-red-600 text-white shadow-xl ring-4 ring-red-100 border-2 border-red-700 scale-105 z-10 font-black";
      }
    }
    
    return "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-slate-600 shadow-sm";
  };

  const filteredStudents = studentList.filter(s => s.kelas === selectedKelas);

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Memuat Aplikasi...</div>}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <AnimatePresence mode="wait">
          {currentPage === 'landing' ? (
            <LandingPage onLogin={(role) => { console.log("Login as", role); setSelectedRole(role); setShowLoginModal(true); }} onRegister={() => setShowRegModal(true)} />
          ) : (
            <motion.div 
              key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="bg-blue-900 text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-50">
              <div className="flex items-center">
                <div className="hidden lg:flex flex-col items-end mr-4 pr-4 border-r border-white/20">
                  <h1 className="text-xl font-black tracking-tighter italic">SIMS KCD XI</h1>
                  <p className="text-[8px] font-bold text-blue-300 uppercase leading-none">Manajemen Sekolah Digital v2.0.7</p>
                </div>
                <img 
                  src={activeUser?.fotoUrl || "https://www.w3schools.com/howto/img_avatar.png"} 
                  className="w-11 h-11 rounded-full border-2 border-white/50 mr-3 object-cover shadow-sm"
                  alt="Avatar"
                />
                <div>
                  <h2 className="font-black text-xs md:text-sm uppercase leading-tight truncate max-w-[120px] md:max-w-none">
                    {activeUser?.nama}
                  </h2>
                  <p className="text-[9px] text-blue-300 font-bold uppercase flex items-center gap-2">
                    <span>{activeUser?.role} | {activeUser?.sekolah}</span>
                    <span className="bg-blue-600/30 px-1 rounded text-[7px] text-white/50">v2.0.7</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 md:px-5 py-2 rounded-full text-[10px] font-black shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden md:inline">LOGOUT</span>
              </button>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-blue-800 shadow-xl overflow-x-auto scroll-hide sticky top-[76px] z-40">
              <div className="flex min-w-max md:min-w-0">
                <NavTab icon={<Home />} label="Beranda" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                {activeUser?.role === 'Guru' && (
                  <>
                    <NavTab icon={<MapPin />} label="Absen Guru" active={activeTab === 'absensi-guru'} onClick={() => setActiveTab('absensi-guru')} />
                    <NavTab icon={<Users />} label="Absen Siswa" active={activeTab === 'absensi-siswa'} onClick={() => setActiveTab('absensi-siswa')} />
                    <NavTab icon={<BookOpen />} label="Jurnal" active={activeTab === 'jurnal'} onClick={() => setActiveTab('jurnal')} />
                  </>
                )}
                <NavTab icon={<User />} label="Profil" active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} />
                {activeUser?.role === 'Operator' && (
                  <>
                    <NavTab icon={<ClipboardList />} label="Kelas" active={activeTab === 'input-kelas'} onClick={() => setActiveTab('input-kelas')} />
                    <NavTab icon={<UserPlus />} label="Siswa" active={activeTab === 'input-siswa'} onClick={() => setActiveTab('input-siswa')} />
                    <NavTab icon={<Calendar />} label="Jadwal" active={activeTab === 'input-jadwal'} onClick={() => setActiveTab('input-jadwal')} />
                    <NavTab icon={<Settings />} label="Sekolah" active={activeTab === 'sekolah'} onClick={() => setActiveTab('sekolah')} />
                  </>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <main className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full flex-grow">
              <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                  <HomeTab user={activeUser} stats={{ classCount: classList.length }} classList={classList} jurnalList={jurnalList} jadwalList={jadwalList} />
                )}
                
                {activeTab === 'absensi-guru' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                    className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-blue-50"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                       <div className="space-y-1">
                        <h2 className="text-2xl font-black text-blue-900 flex items-center gap-3">
                          <MapPin className="w-8 h-8 text-blue-600" />
                          ABSENSI GURU
                        </h2>
                        <div className="flex items-center gap-2 ml-11">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-md uppercase">Jadwal Masuk: {schoolSettings?.jamMasuk}</span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded-md uppercase">Jadwal Pulang: {schoolSettings?.jamPulang}</span>
                        </div>
                       </div>
                       <div className="text-right">
                         <p className="text-3xl font-black text-blue-900 tracking-tight">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center ${locationStatus === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                          <MapPin className="w-8 h-8" />
                        </div>
                        <h3 className="font-black text-slate-900 mb-1">Status Lokasi</h3>
                        <p className="text-xs font-bold text-slate-500 mb-4 uppercase">
                          {locationStatus === 'loading' ? 'Mencari Sinyal GPS...' : locationStatus === 'success' ? 'GPS Terkunci' : 'GPS Dinonaktifkan'}
                        </p>
                        {locationStatus === 'success' && (
                          <div className="bg-white px-4 py-2 rounded-full shadow-sm text-[10px] font-black text-blue-600 border border-blue-100">
                            Jarak ke Sekolah: {distance} METER
                          </div>
                        )}
                        <button onClick={refreshLocation} className="mt-4 text-blue-600 font-bold text-[10px] uppercase hover:underline">Refresh Lokasi</button>
                      </div>

                      <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 flex flex-col items-center justify-center text-center">
                         <h3 className="font-black text-blue-900 mb-4 uppercase text-xs tracking-widest">Pilih Tipe Absensi</h3>
                         <div className="flex w-full gap-2 p-1 bg-white rounded-2xl shadow-inner mb-4">
                           <button 
                             onClick={() => setAbsenType('DATANG')}
                             className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${absenType === 'DATANG' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
                           >MASUK</button>
                           <button 
                             onClick={() => setAbsenType('PULANG')}
                             className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${absenType === 'PULANG' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400'}`}
                           >PULANG</button>
                         </div>
                         <div className="text-[9px] text-blue-700 font-bold italic">
                           Waktu {absenType === 'DATANG' ? 'Masuk' : 'Pulang'} saat ini
                         </div>
                      </div>
                    </div>

                    <div className="mb-8 p-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center">
                       {absenFoto ? (
                         <div className="relative group">
                           <img src={absenFoto} className="w-48 h-64 object-cover rounded-2xl shadow-xl border-4 border-white" alt="Selfie" />
                           <button onClick={() => setAbsenFoto(null)} className="absolute -top-3 -right-3 bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"><LogOut className="w-4 h-4 rotate-45" /></button>
                         </div>
                       ) : (
                         <button 
                          onClick={() => handleCapturePhoto(setAbsenFoto)}
                          className="flex flex-col items-center gap-3 p-10 group"
                         >
                           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                             <Camera className="w-10 h-10" />
                           </div>
                           <span className="font-black text-slate-400 text-xs uppercase tracking-widest">Klik untuk Ambil Foto Selfie</span>
                         </button>
                       )}
                    </div>

                    <button 
                      onClick={handleSubmitAbsenGuru}
                      disabled={isSubmittingAbsenGuru || !absenFoto || locationStatus !== 'success'}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-6 rounded-[1.5rem] font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {isSubmittingAbsenGuru ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                      SIMPAN DATA ABSENSI
                    </button>
                    {(!absenFoto || locationStatus !== 'success') && !isSubmittingAbsenGuru && (
                      <p className="text-center mt-4 text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        Lengkapi foto dan GPS sebelum menyimpan
                      </p>
                    )}
                  </motion.div>
                )}

                {activeTab === 'absensi-siswa' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-blue-50"
                  >
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-6">
                       <div className="flex items-center gap-4">
                         <div className="p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-200">
                           <Users className="w-8 h-8 text-white" />
                         </div>
                         <div>
                           <h2 className="text-2xl font-black text-blue-900 leading-none">ABSENSI SISWA</h2>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Manajemen Kehadiran Peserta Didik</p>
                         </div>
                       </div>
                       
                       <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
                         <button 
                            onClick={() => setViewModeAbsensi('input')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewModeAbsensi === 'input' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                         >
                           <ClipboardList className="w-4 h-4" />
                           Input Absensi
                         </button>
                         <button 
                            onClick={() => setViewModeAbsensi('laporan')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewModeAbsensi === 'laporan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                         >
                           <Printer className="w-4 h-4" />
                           Cetak Laporan
                         </button>
                       </div>
                     </div>

                     {viewModeAbsensi === 'input' ? (
                       <div className="animate-fadeIn">
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                           <div className="lg:col-span-1 space-y-6">
                              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 block ml-2">Waktu & Tanggal</label>
                                <div className="space-y-3">
                                  <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                    <input 
                                      type="date" 
                                      value={absensiSiswaDate}
                                      onChange={(e) => setAbsensiSiswaDate(e.target.value)}
                                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl font-black text-blue-900 outline-none focus:border-blue-300"
                                    />
                                  </div>
                                  <div className="bg-white p-4 rounded-2xl flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hari Aktif</span>
                                    <span className="text-xs font-black text-blue-600 uppercase italic">{absensiSiswaHari}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                                <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Pilih Kelas</label>
                                  <select 
                                    value={selectedKelas}
                                    onChange={(e) => {
                                      setSelectedKelas(e.target.value);
                                      setAttendanceRecords({});
                                    }}
                                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-blue-900 outline-none appearance-none"
                                  >
                                    <option value="">-- PILIH KELAS --</option>
                                    {classList.map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-2">Mata Pelajaran</label>
                                  <input 
                                    type="text" 
                                    value={mapelSiswa}
                                    onChange={(e) => setMapelSiswa(e.target.value)}
                                    placeholder="Nama Mata Pelajaran"
                                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-300"
                                  />
                                </div>
                              </div>
                           </div>

                           <div className="lg:col-span-2">
                             {selectedKelas ? (
                               <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-6 shadow-inner">
                                  <div className="flex items-center justify-between mb-6 px-2">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Siswa {selectedKelas}</h4>
                                    <button 
                                      onClick={() => {
                                        const updated = { ...attendanceRecords };
                                        filteredStudents.forEach(s => {
                                          const sid = s.row?.toString() || s.id;
                                          updated[sid] = 'H';
                                        });
                                        setAttendanceRecords(updated);
                                      }}
                                      className="text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-xl hover:bg-green-100 transition-all uppercase tracking-tighter"
                                    >
                                      Semua Hadir
                                    </button>
                                  </div>
                                  
                                  <div className="grid gap-3 max-h-[460px] overflow-y-auto pr-2 scroll-hide">
                                    {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                                      const studentId = student.row?.toString() || student.id;
                                      return (
                                        <div key={studentId} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-blue-100 hover:bg-blue-50/20 transition-all">
                                           <div className="flex flex-col">
                                             <span className="font-black text-xs text-blue-900 uppercase">{student.nama}</span>
                                             <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em]">NIS: {student.nis}</span>
                                           </div>
                                           <div className="flex gap-1">
                                             {(['H', 'S', 'I', 'A'] as const).map(status => (
                                               <button 
                                                 key={status}
                                                 onClick={() => setAttendanceRecords(prev => ({ ...prev, [studentId]: status }))}
                                                 className={`w-9 h-9 rounded-xl font-black text-[10px] transition-all duration-200 active:scale-90 flex items-center justify-center ${getAttendanceBtnClass(studentId, status)}`}
                                               >
                                                 {status}
                                               </button>
                                             ))}
                                           </div>
                                        </div>
                                      );
                                    }) : (
                                      <div className="text-center py-20">
                                         <p className="text-xs font-bold text-slate-400 uppercase italic">Tidak ada siswa terdaftar di kelas ini</p>
                                      </div>
                                    )}
                                  </div>
                               </div>
                             ) : (
                               <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                                  <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center max-w-[200px]">Pilih kelas untuk memuat daftar absensi siswa</p>
                               </div>
                             )}
                           </div>
                         </div>

                         <button 
                           onClick={handleSubmitAbsenSiswa}
                           disabled={isSubmittingAbsenSiswa || !selectedKelas || filteredStudents.length === 0}
                           className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em]"
                         >
                           {isSubmittingAbsenSiswa ? <Loader2 className="w-7 h-7 animate-spin" /> : <Save className="w-7 h-7" />}
                           SINKRONISASI DATA ABSENSI
                         </button>
                       </div>
                     ) : (
                       <div className="animate-fadeIn">
                          <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 mb-10 flex flex-wrap items-end gap-6">
                             <div className="flex-1 min-w-[240px]">
                               <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block ml-3">Filter Tanggal Laporan</label>
                               <div className="relative">
                                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                 <input 
                                    type="date" 
                                    value={absensiSiswaDate}
                                    onChange={(e) => setAbsensiSiswaDate(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl font-black text-indigo-900 outline-none focus:border-indigo-300"
                                 />
                               </div>
                             </div>
                             <div className="flex-1 min-w-[240px]">
                               <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block ml-3">Filter Kelas</label>
                               <select 
                                 value={selectedKelas}
                                 onChange={(e) => setSelectedKelas(e.target.value)}
                                 className="w-full p-4 bg-white border-2 border-transparent rounded-2xl font-black text-indigo-900 outline-none appearance-none focus:border-indigo-300"
                               >
                                 <option value="">-- PILIH KELAS --</option>
                                 {classList.map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                               </select>
                             </div>
                             <button 
                                onClick={handleFetchLaporan}
                                disabled={isFetchingLaporan}
                                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
                             >
                               {isFetchingLaporan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                               MUAT LAPORAN
                             </button>
                          </div>

                          {laporanAbsensiData.length > 0 ? (
                            <div className="space-y-10">
                               {laporanAbsensiData.map((laporan, lIdx) => (
                                 <div key={lIdx} className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 shadow-sm print:border-none print:shadow-none print:p-0">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-8 border-b-2 border-dotted border-slate-100">
                                       <div className="flex items-center gap-4">
                                          <div className="w-16 h-16 bg-slate-900 flex items-center justify-center rounded-2xl text-white">
                                            <Printer className="w-8 h-8" />
                                          </div>
                                          <div>
                                            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">LAPORAN ABSENSI</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Status: Terverifikasi Sistem</p>
                                          </div>
                                       </div>
                                       <button 
                                          onClick={() => window.print()}
                                          className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition shadow-xl print:hidden active:scale-95"
                                       >
                                          <Download className="w-4 h-4" />
                                          CETAK DOKUMEN (PDF)
                                       </button>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                       <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">TANGGAL ABSEN</p>
                                          <p className="text-sm font-black text-slate-900">{new Date(laporan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                       </div>
                                       <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">KELAS / ROMBEL</p>
                                          <p className="text-sm font-black text-slate-900">{laporan.kelas}</p>
                                       </div>
                                       <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">HARI PELAJARAN</p>
                                          <p className="text-sm font-black text-slate-900">{laporan.hari}</p>
                                       </div>
                                       <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">MATA PELAJARAN</p>
                                          <p className="text-sm font-black text-slate-900 uppercase truncate">{laporan.mapel}</p>
                                       </div>
                                    </div>

                                    <div className="overflow-hidden rounded-3xl border-2 border-slate-50 mb-10">
                                       <table className="w-full text-left text-[11px] border-collapse">
                                          <thead>
                                             <tr className="bg-slate-900 text-white">
                                                <th className="p-5 font-black uppercase tracking-widest text-[9px] border-r border-slate-700 w-16 text-center">NO</th>
                                                <th className="p-5 font-black uppercase tracking-widest text-[9px] border-r border-slate-700">BIODATA SISWA</th>
                                                <th className="p-5 font-black uppercase tracking-widest text-[9px] text-center w-32">KETERANGAN</th>
                                             </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                             {Object.entries(laporan.absensi).map(([sid, status], sidx) => {
                                                const studentObj = studentList.find(s => (s.row?.toString() || s.id) === sid);
                                                return (
                                                  <tr key={sidx} className={sidx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                                                     <td className="p-5 font-black text-slate-300 border-r border-slate-50 text-center">{sidx + 1}</td>
                                                     <td className="p-5 font-black text-slate-800 uppercase border-r border-slate-50">
                                                       <div className="flex flex-col">
                                                         <span>{studentObj?.nama || 'SISWA TIDAK TERDETEKSI'}</span>
                                                         <span className="text-[8px] text-slate-400 mt-0.5 tracking-widest">NIS: {studentObj?.nis || '-'}</span>
                                                       </div>
                                                     </td>
                                                     <td className="p-5 text-center">
                                                        <span className={`inline-block px-3 py-1.5 rounded-lg font-black text-[9px] tracking-widest min-w-[70px] ${
                                                          status === 'H' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                          status === 'S' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                          status === 'I' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                          'bg-red-100 text-red-700 border border-red-200'
                                                        }`}>
                                                          {status === 'H' ? 'HADIR' : status === 'S' ? 'SAKIT' : status === 'I' ? 'IZIN' : 'ALPA'}
                                                        </span>
                                                     </td>
                                                  </tr>
                                                );
                                             })}
                                          </tbody>
                                       </table>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10 mt-16 px-10">
                                       <div className="text-center">
                                         {/* Signature field if needed */}
                                       </div>
                                       <div className="text-center space-y-20">
                                          <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Verifikator Laporan,</p>
                                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wide">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                          </div>
                                          <div className="inline-block border-b-2 border-slate-900 px-8 pb-1">
                                            <p className="text-xs font-black text-slate-900 uppercase">{laporan.guru}</p>
                                          </div>
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Guru Pengampu Mata Pelajaran</p>
                                       </div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          ) : (
                            <div className="text-center py-40 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200">
                               <Printer className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                               <h5 className="text-lg font-black text-slate-300 uppercase tracking-[0.3em]">Arsip Laporan Digital</h5>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 max-w-xs mx-auto">Silakan gunakan filter di atas untuk menampilkan rekaman absensi yang sudah tersimpan di sistem.</p>
                            </div>
                          )}
                       </div>
                     )}
                  </motion.div>
                )}

                {activeTab === 'jurnal' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-blue-50"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                       <h2 className="text-2xl font-black text-blue-900 flex items-center gap-3">
                         <BookOpen className="w-8 h-8 text-blue-600" />
                         JURNAL MENGAJAR
                       </h2>
                       <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-blue-600" />
                         <input 
                           type="date" 
                           value={jurnalDate}
                           onChange={(e) => setJurnalDate(e.target.value)}
                           className="bg-transparent border-none text-xs font-black text-blue-900 outline-none"
                         />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">Pilih Kelas</label>
                        <select 
                          value={jurnalKelas}
                          onChange={(e) => setJurnalKelas(e.target.value)}
                          className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-blue-900 outline-none appearance-none"
                        >
                          <option value="">-- PILIH KELAS --</option>
                          {classList.map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">Mata Pelajaran</label>
                        <input 
                          type="text" 
                          value={jurnalMapel}
                          onChange={(e) => setJurnalMapel(e.target.value)}
                          placeholder="Mata Pelajaran"
                          className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-300"
                        />
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">Materi / Bahasan</label>
                      <textarea 
                        rows={4}
                        value={jurnalMateri}
                        onChange={(e) => setJurnalMateri(e.target.value)}
                        placeholder="Deskripsikan materi yang diajarkan hari ini..."
                        className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-slate-700 outline-none focus:border-blue-300 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                       <PhotoZone label="Foto KBM 1" photo={jurnalFoto1} onCapture={() => handleCapturePhoto(setJurnalFoto1)} onRemove={() => setJurnalFoto1(null)} />
                       <PhotoZone label="Foto KBM 2" photo={jurnalFoto2} onCapture={() => handleCapturePhoto(setJurnalFoto2)} onRemove={() => setJurnalFoto2(null)} />
                    </div>

                    <button 
                      onClick={handleSubmitJurnal}
                      disabled={isSubmittingJurnal || !jurnalKelas || !jurnalMapel || !jurnalMateri}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-6 rounded-[1.5rem] font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {isSubmittingJurnal ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                      KIRIM JURNAL MENGAJAR
                    </button>
                  </motion.div>
                )}

                {activeTab === 'input-kelas' && (
                  <InputKelasTab 
                    values={{ namaKelas, waliKelas, jumlahSiswa, jurusan }}
                    setters={{ setNamaKelas, setWaliKelas, setJumlahSiswa, setJurusan }}
                    onSubmit={handleSubmitKelas}
                    isSubmitting={isSubmittingKelas}
                    classList={classList}
                  />
                )}

                {activeTab === 'input-siswa' && (
                  <InputSiswaTab 
                    values={{ studentNama, studentNis, studentGender, studentKelas, studentAlamat, studentKontak }}
                    setters={{ setStudentNama, setStudentNis, setStudentGender, setStudentKelas, setStudentAlamat, setStudentKontak }}
                    onSubmit={handleSubmitSiswa}
                    isSubmitting={isSubmittingSiswa}
                    classList={classList}
                    studentList={studentList}
                    activeUser={activeUser}
                    onImportSuccess={loadInitialData}
                  />
                )}

                {activeTab === 'input-jadwal' && (
                  <InputJadwalTab 
                    values={{ jadwalHari, jadwalJam, jadwalKelas, jadwalMapel, jadwalRuang }}
                    setters={{ setJadwalHari, setJadwalJam, setJadwalKelas, setJadwalMapel, setJadwalRuang }}
                    onSubmit={handleSubmitJadwal}
                    isSubmitting={isSubmittingJadwal}
                    classList={classList}
                    jadwalList={jadwalList}
                  />
                )}

                {activeTab === 'sekolah' && (
                  <SekolahTab 
                    values={{ setJamMasuk, setJamPulang, setLat, setLng }}
                    setters={{ setSetJamMasuk, setSetJamPulang, setSetLat, setSetLng }}
                    onSubmit={handleSubmitSchoolSettings}
                    isSubmitting={isSavingSchool}
                    schoolSettings={schoolSettings}
                  />
                )}
                
                {activeTab === 'profil' && (
                  <ProfilTab 
                    user={activeUser} 
                    editNama={editNama} 
                    setEditNama={setEditNama} 
                    editMapel={editMapel}
                    setEditMapel={setEditMapel}
                    editFoto={editFoto}
                    setEditFoto={setEditFoto}
                    onSave={handleSaveProfile} 
                    isSaving={isSaving} 
                  />
                )}
              </AnimatePresence>
            </main>
            
            <footer className="p-8 text-center bg-slate-100 border-t border-slate-200">
               <div className="max-w-xs mx-auto mb-4 h-1 bg-slate-200 rounded-full overflow-hidden">
                 <div className="w-1/3 h-full bg-blue-600"></div>
               </div>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                 &copy; 2024 SIMS KCD XI - Dinas Pendidikan Prov. Jawa Barat
               </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <LoginModal 
          show={showLoginModal} 
          role={selectedRole} 
          email={loginEmail} 
          setEmail={setLoginEmail} 
          pass={loginPass} 
          setPass={setLoginPass} 
          onLogin={handleLogin} 
          onClose={() => setShowLoginModal(false)}
          isVerifying={isVerifying}
        />

        <RegistrationModal 
          show={showRegModal} 
          onClose={() => setShowRegModal(false)} 
          onSuccess={() => {
            alert("Registrasi berhasil! Silakan hubungi admin sekolah untuk verifikasi.");
            setShowRegModal(false);
          }}
        />
      </Suspense>
    </div>
    </Suspense>
  );
}

// --- SUB-COMPONENTS ---

function LandingPage({ onLogin, onRegister }: { onLogin: (role: string) => void, onRegister: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-6 flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900"
    >
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-md text-center">
        <div className="flex justify-center mb-8 relative">
          <div className="w-28 h-28 bg-blue-50 rounded-[2.5rem] flex items-center justify-center rotate-3 scale-110 shadow-inner">
             <School className="w-14 h-14 text-blue-600 -rotate-3" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
             <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-blue-950 mb-2 leading-none tracking-tighter italic">SIMS<span className="text-blue-500">KCD</span>XI</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase mb-12 tracking-[0.3em] ml-[0.3em]">Manajemen Sekolah Digital</p>
        
        <div className="grid gap-3 mb-12">
          <RoleButton 
            label="MASUK GURU" icon={<Users />}
            color="bg-blue-600 hover:bg-blue-700" 
            onClick={() => onLogin('Guru')} 
          />
          <RoleButton 
            label="KEPALA SEKOLAH" icon={<CheckCircle2 />}
            color="bg-slate-900 hover:bg-black" 
            onClick={() => onLogin('Kepala Sekolah')} 
          />
          <RoleButton 
            label="OPERATOR" icon={<Settings />}
            color="bg-indigo-600 hover:bg-indigo-700" 
            onClick={() => onLogin('Operator')} 
          />
        </div>

        <button 
          onClick={onRegister}
          className="text-blue-700 font-black italic text-xs hover:underline tracking-tight transition-all duration-300"
        >
          Belum punya akun? Registrasi di sini
        </button>
      </div>
      <p className="mt-10 text-[9px] font-black text-blue-200 uppercase tracking-[0.5em] bg-blue-900/20 px-4 py-2 rounded-full inline-block mb-10">SIMS KCD XI v2.0.7 | STABLE</p>
    </motion.div>
  );
}

function RoleButton({ label, icon, color, onClick }: { label: string, icon: React.ReactNode, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`${color} text-white p-5 rounded-2xl font-black flex justify-between items-center shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95 group`}
    >
      <div className="flex items-center gap-3">
        <span className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors">{icon}</span>
        <span className="tracking-tighter text-sm">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  );
}

function NavTab({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 min-w-[90px] p-4 text-[9px] font-black tracking-[0.1em] uppercase transition-all duration-300 border-b-4 relative overflow-hidden ${active ? 'border-yellow-400 text-yellow-400 bg-white/5' : 'border-transparent text-white/50 hover:text-white hover:bg-white/10'}`}
    >
      <div className="flex flex-col items-center justify-center gap-1.5 relative z-10">
        <span className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>{React.cloneElement(icon as React.ReactElement, { size: 16 })}</span>
        {label}
      </div>
      {active && <motion.div layoutId="activeTab" className="absolute inset-0 bg-white/5" />}
    </button>
  );
}

function HomeTab({ user, stats, classList, jurnalList, jadwalList }: { user: User | null, stats: { classCount: number }, classList: ClassData[], jurnalList: any[], jadwalList: any[] }) {
  const [viewMode, setViewMode] = useState<'stats' | 'jurnal' | 'jadwal'>('stats');
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-50"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-200">
             <School className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-blue-950 uppercase italic tracking-tighter leading-tight">
              Selamat Datang!
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{user?.sekolah}</p>
          </div>
        </div>
        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 self-start">
          {[
            { id: 'stats', label: 'Statistik', icon: <Activity className="w-3 h-3" /> },
            { id: 'jadwal', label: 'Jadwal', icon: <Calendar className="w-3 h-3" /> },
            { id: 'jurnal', label: 'Jurnal', icon: <BookOpen className="w-3 h-3" /> }
          ].map(opt => (
            <button 
              key={opt.id}
              onClick={() => setViewMode(opt.id as any)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 font-black text-[9px] uppercase tracking-widest transition-all ${viewMode === opt.id ? 'bg-blue-900 text-white shadow-lg' : 'text-slate-400 hover:text-blue-900 hover:bg-white'}`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      
      {viewMode === 'stats' && (
        <div className="animate-fadeIn">
          <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-2xl font-medium">
            Monitoring Dashboard Digital. Anda masuk sebagai <span className="font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md">{user?.role}</span>. 
            Pastikan untuk melakukan sinkronisasi data secara berkala untuk akurasi laporan.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <StatCard label="DATA KELAS TERDATA" value={stats.classCount.toString()} color="blue" />
            <StatCard label="WAKTU SERVER" value={new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} color="slate" icon={<Clock className="w-4 h-4" />} />
          </div>

          <div className="mb-10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Jadwal Tugas Hari Ini
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jadwalList && jadwalList.filter(j => {
                const days = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
                const today = days[new Date().getDay()];
                const entryHari = (j.hari || "").toString().toUpperCase().trim();
                return entryHari === today;
              }).length > 0 ? (
                jadwalList.filter(j => {
                  const days = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
                  const today = days[new Date().getDay()];
                  const entryHari = (j.hari || "").toString().toUpperCase().trim();
                  return entryHari === today;
                }).map((j: any, i: number) => (
                  <div key={i} className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col gap-2 relative overflow-hidden group hover:bg-blue-100 transition-colors">
                    <div className="absolute top-0 right-0 p-3 bg-blue-600 text-white rounded-bl-2xl">
                      <Clock className="w-3 h-3" />
                    </div>
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{j.jam}</span>
                    <h4 className="font-black text-blue-900 uppercase tracking-tight leading-tight">{j.mapel}</h4>
                    <p className="text-[10px] font-bold text-slate-500">Kelas: {j.kelas} {j.ruang ? `| ${j.ruang}` : ''}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <AlertCircle className="w-5 h-5 mb-2 opacity-30" />
                  <p className="text-[10px] font-black uppercase tracking-widest italic">Tidak ada jadwal mengajar hari ini ({new Date().toLocaleDateString('id-ID', { weekday: 'long' })})</p>
                  <p className="text-[9px] mt-2 opacity-50">Filter Guru: {user?.nama}</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setViewMode('jadwal')}
              className="mt-4 flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-transform ml-2"
            >
              Lihat Seluruh Jadwal Mingguan <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {classList.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Daftar Kelas Aktif</h3>
              <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 uppercase text-[9px] font-black tracking-widest text-slate-500">
                    <tr>
                      <th className="p-5">Nama Kelas</th>
                      <th className="p-5">Wali Kelas</th>
                      <th className="p-5 text-center">Siswa</th>
                      <th className="p-5">Jurusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classList.map((item, idx) => (
                      <tr key={idx} className="text-xs font-bold text-slate-700 hover:bg-slate-50 transition group">
                        <td className="p-5">{item.nama}</td>
                        <td className="p-5">{item.wali}</td>
                        <td className="p-5 text-center">{item.jumlah}</td>
                        <td className="p-5">
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700 rounded-md text-[8px] uppercase transition-colors">
                            {item.keahlian}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'jurnal' && (
        <div className="animate-fadeIn">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">History Jurnal Mengajar Anda</h3>
          {jurnalList.length > 0 ? (
            <div className="grid gap-4">
              {jurnalList.map((j, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors group">
                   <div className="flex justify-between items-start mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-widest">{j.hari}, {new Date(j.tgl).toLocaleDateString('id-ID')}</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase italic">{j.jam}</span>
                   </div>
                   <h4 className="text-lg font-black text-blue-950 uppercase tracking-tight">{j.mapel}</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Kelas: {j.kelas} | {j.keahlian}</p>
                   <div className="bg-white p-4 rounded-2xl text-xs text-slate-600 font-medium leading-relaxed shadow-sm border border-slate-100">
                      {j.materi}
                   </div>
                   <div className="flex gap-2 mt-4">
                      {j.foto1 && <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden"><img src={j.foto1} className="w-full h-full object-cover" /></div>}
                      {j.foto2 && <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden"><img src={j.foto2} className="w-full h-full object-cover" /></div>}
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
               <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Belum ada data jurnal yang tercatat</p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'jadwal' && (
        <div className="animate-fadeIn">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Jadwal Mengajar Kejuruan</h3>
          {jadwalList && jadwalList.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 uppercase text-[9px] font-black tracking-widest text-slate-500">
                    <tr>
                      <th className="p-5">Hari</th>
                      <th className="p-5">Waktu</th>
                      <th className="p-5">Kelas</th>
                      <th className="p-5">Mata Pelajaran</th>
                      <th className="p-5">Ruang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jadwalList.map((item: any, idx: number) => (
                      <tr key={idx} className="text-xs font-bold text-slate-700 hover:bg-slate-50 transition group">
                        <td className="p-5">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-black italic">{item.hari}</span>
                        </td>
                        <td className="p-5">{item.jam}</td>
                        <td className="p-5 font-black">{item.kelas}</td>
                        <td className="p-5">{item.mapel}</td>
                        <td className="p-5">
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 group-hover:bg-green-100 group-hover:text-green-700 rounded-md text-[8px] uppercase transition-colors">
                            {item.ruang || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
               <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-4" />
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Belum ada data jadwal yang tersedia</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, color, icon }: { label: string, value: string, color: 'blue' | 'slate', icon?: React.ReactNode }) {
  const bgColor = color === 'blue' ? 'bg-blue-600' : 'bg-slate-900';
  const shadowColor = color === 'blue' ? 'shadow-blue-200' : 'shadow-slate-200';
  return (
    <div className={`p-8 ${bgColor} rounded-[2rem] shadow-2xl ${shadowColor} flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
       {icon && <div className="absolute top-6 right-6 opacity-20 text-white scale-150 rotate-12">{icon}</div>}
       <h3 className="font-black text-white/50 mb-1 uppercase text-[9px] tracking-[0.2em]">{label}</h3>
       <p className="text-4xl font-black text-white tracking-widest">{value}</p>
       <div className="w-12 h-1 bg-white/20 mt-4 rounded-full group-hover:w-20 transition-all duration-500"></div>
    </div>
  );
}

function PhotoZone({ label, photo, onCapture, onRemove }: { label: string, photo: string | null, onCapture: () => void, onRemove: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
      <div className="p-4 border-2 border-dashed border-slate-200 rounded-3xl min-h-[160px] flex items-center justify-center bg-slate-50 relative group">
        {photo ? (
          <>
            <img src={photo} className="w-full h-full object-cover rounded-2xl absolute inset-0 p-1" alt="Preview" />
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
               <button onClick={onRemove} className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition active:scale-90"><LogOut className="w-4 h-4 rotate-45" /></button>
            </div>
          </>
        ) : (
          <button onClick={onCapture} className="flex flex-col items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors">
            <ImageIcon className="w-8 h-8" />
            <span className="text-[10px] font-black uppercase tracking-widest">Unggah Foto</span>
          </button>
        )}
      </div>
    </div>
  );
}

function InputKelasTab({ values, setters, onSubmit, isSubmitting }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100"
    >
      <h3 className="font-black text-blue-950 mb-8 uppercase flex items-center italic text-xl tracking-tight">
          <ClipboardList className="mr-3 w-8 h-8 text-blue-600" />
          Data Manajemen Kelas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Nama Kelas</label>
          <input 
            type="text" value={values.namaKelas} onChange={(e) => setters.setNamaKelas(e.target.value)}
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-blue-500 outline-none transition"
            placeholder="Contoh: XII - RPL 1"
          />
        </div>
        
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Wali Kelas</label>
          <input 
            type="text" value={values.waliKelas} onChange={(e) => setters.setWaliKelas(e.target.value)}
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-blue-500 outline-none transition"
            placeholder="Nama Lengkap & Gelar"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Jumlah Siswa</label>
          <input 
            type="number" value={values.jumlahSiswa} onChange={(e) => setters.setJumlahSiswa(e.target.value)}
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-blue-500 outline-none transition"
            placeholder="0"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Jurusan</label>
          <select 
            value={values.jurusan} onChange={(e) => setters.setJurusan(e.target.value)}
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-blue-900 outline-none appearance-none"
          >
            <option value="">-- PILIH JURUSAN --</option>
            <option>RPL (Rekayasa Perangkat Lunak)</option>
            <option>TKJ (Teknik Komputer Jaringan)</option>
            <option>Multimedia</option>
            <option>IPA</option>
            <option>IPS</option>
           </select>
        </div>
      </div>

      <div className="mt-10">
        <button 
          onClick={onSubmit} disabled={isSubmitting}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 text-white font-black py-6 rounded-[1.5rem] shadow-xl uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          PUBLIKASIKAN DATA KELAS
        </button>
      </div>
    </motion.div>
  );
}

function InputSiswaTab({ values, setters, onSubmit, isSubmitting, classList, studentList, activeUser, onImportSuccess }: any) {
  const [subTab, setSubTab] = useState<'manual' | 'import'>('manual');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const downloadTemplateSiswa = () => {
    const headers = [
      "Nama Lengkap",
      "NIS/NISN",
      "Gender (L/P)",
      "Tanggal Lahir (YYYY-MM-DD)",
      "Alamat",
      "Kontak HP/Orangtua",
      "Kelas"
    ];
    
    const sampleRows = [
      [
        "Ahmad Fauzi",
        "1234567890",
        "L",
        "2008-05-12",
        "Jl. Merdeka No. 10, Garut",
        "08123456789",
        classList[0]?.nama || "XII RPL 1"
      ],
      [
        "Siti Aminah",
        "1234567891",
        "P",
        "2008-09-24",
        "Jl. Pahlawan No. 25, Garut",
        "08987654321",
        classList[0]?.nama || "XII RPL 1"
      ]
    ];

    const data = [headers, ...sampleRows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
    XLSX.writeFile(workbook, 'Template_Import_Siswa.xlsx');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (rawData.length <= 1) {
          alert("File Excel kosong atau tidak memiliki data!");
          return;
        }

        const headers = rawData[0].map(h => (h || "").toString().trim().toLowerCase());
        
        const idxNama = headers.findIndex(h => h.includes("nama"));
        const idxNis = headers.findIndex(h => h.includes("nis"));
        const idxGender = headers.findIndex(h => h.includes("gender") || h.includes("jenis kelamin") || h.includes("l/p"));
        const idxTgl = headers.findIndex(h => h.includes("lahir") || h.includes("tanggal"));
        const idxAlamat = headers.findIndex(h => h.includes("alamat"));
        const idxKontak = headers.findIndex(h => h.includes("kontak") || h.includes("hp") || h.includes("telepon"));
        const idxKelas = headers.findIndex(h => h.includes("kelas"));

        const parsed: any[] = [];
        
        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue;
          
          const hasData = row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== "");
          if (!hasData) continue;

          const nama = idxNama !== -1 ? (row[idxNama] || "").toString().trim() : "";
          const nis = idxNis !== -1 ? (row[idxNis] || "").toString().trim() : "";
          let gender = idxGender !== -1 ? (row[idxGender] || "").toString().trim().toUpperCase() : "L";
          
          if (gender.startsWith("P") || gender === "PEREMPUAN" || gender === "PUTRI") {
            gender = "P";
          } else {
            gender = "L";
          }

          const tglLahir = idxTgl !== -1 ? (row[idxTgl] || "").toString().trim() : "";
          const alamat = idxAlamat !== -1 ? (row[idxAlamat] || "").toString().trim() : "";
          const kontak = idxKontak !== -1 ? (row[idxKontak] || "").toString().trim() : "";
          const kelas = idxKelas !== -1 ? (row[idxKelas] || "").toString().trim() : "";

          if (nama && nis && kelas) {
            parsed.push({
              nama,
              nis,
              gender,
              tglLahir,
              alamat,
              kontak,
              kelas,
              sekolah: activeUser?.sekolah || "SMKN 4 GARUT"
            });
          }
        }

        if (parsed.length === 0) {
          alert("Tidak ditemukan baris data siswa yang valid. Pastikan kolom Nama Lengkap, NIS/NISN, dan Kelas terisi.");
          setImportPreview([]);
        } else {
          setImportPreview(parsed);
        }
      } catch (err) {
        console.error(err);
        alert("Gagal memproses file Excel: " + err);
      }
    };
    
    reader.onerror = (err) => {
      alert("Gagal membaca file: " + err);
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmitImport = async () => {
    if (importPreview.length === 0) return;
    
    setIsImporting(true);
    try {
      const res = await callGAS<string>('imporSiswaMassal', importPreview);
      alert(res);
      setImportPreview([]);
      setSelectedFileName("");
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengimpor data ke database: " + err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100"
    >
      <h3 className="font-black text-blue-950 mb-6 uppercase flex items-center italic text-xl tracking-tight">
          <UserPlus className="mr-3 w-8 h-8 text-green-600" />
          Registrasi Data Siswa
      </h3>

      {/* Sub Tab Buttons */}
      <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 rounded-2xl w-full max-w-md">
        <button
          onClick={() => setSubTab('manual')}
          className={`flex-1 py-3 text-xs font-black rounded-xl uppercase tracking-wider transition-all ${subTab === 'manual' ? 'bg-white text-blue-950 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Registrasi Manual
        </button>
        <button
          onClick={() => setSubTab('import')}
          className={`flex-1 py-3 text-xs font-black rounded-xl uppercase tracking-wider transition-all ${subTab === 'import' ? 'bg-white text-blue-950 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Import Massal (Excel)
        </button>
      </div>

      {subTab === 'manual' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Nama Lengkap Siswa</label>
              <input 
                type="text" value={values.studentNama} onChange={(e) => setters.setStudentNama(e.target.value)}
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-blue-500 outline-none transition"
                placeholder="Nama Sesuai Ijazah"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">NIS / NISN</label>
              <input 
                type="text" value={values.studentNis} onChange={(e) => setters.setStudentNis(e.target.value)}
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-blue-500 outline-none transition"
                placeholder="Nomor Induk Siswa"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Jenis Kelamin</label>
              <select 
                value={values.studentGender} onChange={(e) => setters.setStudentGender(e.target.value)}
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-blue-900 outline-none appearance-none"
              >
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
               </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Pilih Kelas</label>
              <select 
                value={values.studentKelas} onChange={(e) => setters.setStudentKelas(e.target.value)}
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-black text-blue-900 outline-none appearance-none"
              >
                <option value="">-- PILIH KELAS --</option>
                {classList.map((kls: any, i: number) => (
                  <option key={i} value={kls.nama}>{kls.nama}</option>
                ))}
               </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Alamat Domisili</label>
              <input 
                type="text" value={values.studentAlamat} onChange={(e) => setters.setStudentAlamat(e.target.value)}
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-blue-500 outline-none transition"
                placeholder="Alamat Lengkap"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Kontak HP/Orangtua</label>
              <input 
                type="text" value={values.studentKontak} onChange={(e) => setters.setStudentKontak(e.target.value)}
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-blue-500 outline-none transition"
                placeholder="0812..."
              />
            </div>
          </div>

          <div className="mt-10">
            <button 
              onClick={onSubmit} disabled={isSubmitting}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-slate-200 text-white font-black py-6 rounded-[1.5rem] shadow-xl uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              SIMPAN DATA SISWA
            </button>
          </div>

          <div className="mt-12">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 ml-2">5 Siswa Terbaru Terdaftar</h3>
            <div className="grid gap-3">
              {studentList.slice(-5).reverse().map((s: any, i: number) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white ${s.gender === 'L' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                      {s.nama.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{s.nama}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.nis} | {s.kelas}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-white rounded-lg border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     {s.gender === 'L' ? 'Putra' : 'Putri'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Instructions Box */}
          <div className="p-6 bg-blue-50/50 rounded-[1.5rem] border border-blue-100">
            <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-blue-600" />
              Petunjuk Import Massal Data Siswa
            </h4>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed font-medium">
              <li>Unduh template Excel dengan mengklik tombol <span className="font-bold text-blue-800">Download Template Excel</span> di bawah.</li>
              <li>Isi data siswa pada template tersebut. Kolom <span className="font-bold text-slate-800">Nama Lengkap</span>, <span className="font-bold text-slate-800">NIS/NISN</span>, dan <span className="font-bold text-slate-800">Kelas</span> wajib diisi.</li>
              <li>Kolom <span className="font-bold text-slate-800">Kelas</span> harus persis sama dengan nama kelas yang terdaftar di sistem.</li>
              <li>Kolom <span className="font-bold text-slate-800">Gender (L/P)</span> diisi dengan <span className="font-bold text-slate-800">L</span> (Laki-Laki) atau <span className="font-bold text-slate-800">P</span> (Perempuan).</li>
              <li>Simpan file Excel Anda, kemudian unggah di bagian kanan untuk memvalidasi dan mengimpor.</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Download Template */}
            <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col justify-between">
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Langkah 1</h5>
                <h4 className="font-black text-slate-800 text-sm mb-2">Unduh Template Format</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">Dapatkan format file Excel standar untuk pengisian data massal agar bebas dari kesalahan input.</p>
              </div>
              <button
                onClick={downloadTemplateSiswa}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-xl shadow-lg hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Template Excel
              </button>
            </div>

            {/* Step 2: Upload File */}
            <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col justify-between">
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Langkah 2</h5>
                <h4 className="font-black text-slate-800 text-sm mb-2">Unggah File Excel</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">Pilih file Excel yang sudah diisi data siswa untuk divalidasi oleh sistem.</p>
              </div>
              
              <label className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-xl shadow-lg hover:shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer text-center">
                <ClipboardList className="w-4 h-4" />
                {selectedFileName ? selectedFileName : 'Pilih File Excel'}
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Valid Classes Helper Box */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Daftar Nama Kelas Terdaftar di Sistem:</h5>
            <div className="flex flex-wrap gap-2">
              {classList.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Tidak ada kelas terdaftar. Daftarkan kelas terlebih dahulu pada tab Kelas.</span>
              ) : (
                classList.map((kls: any, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm">{kls.nama}</span>
                ))
              )}
            </div>
          </div>

          {/* Preview Table */}
          {importPreview.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-blue-950 text-base uppercase italic">Preview Hasil Import</h4>
                  <p className="text-xs text-slate-500 font-medium">Periksa kembali kesesuaian data siswa dan kelas sebelum menyimpannya.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                  {importPreview.length} Baris Terdeteksi
                </span>
              </div>

              <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm max-h-[350px] overflow-y-auto">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
                      <th className="p-4 w-12 text-center">No</th>
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">NIS/NISN</th>
                      <th className="p-4">L/P</th>
                      <th className="p-4">Kelas</th>
                      <th className="p-4">Kontak / HP</th>
                      <th className="p-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                    {importPreview.map((s, idx) => {
                      const isClassValid = classList.some((c: any) => c.nama.toUpperCase().trim() === s.kelas.toUpperCase().trim());
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-4 text-center font-black text-slate-400">{idx + 1}</td>
                          <td className="p-4 font-black text-slate-900">{s.nama}</td>
                          <td className="p-4 font-mono text-slate-500">{s.nis}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${s.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                              {s.gender}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[11px] ${isClassValid ? 'bg-slate-100 text-slate-800 font-black' : 'bg-red-100 text-red-800 font-black'}`}>
                              {s.kelas}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-500">{s.kontak || "-"}</td>
                          <td className="p-4">
                            {isClassValid ? (
                              <span className="text-emerald-600 flex items-center gap-1 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 inline" /> Valid
                              </span>
                            ) : (
                              <span className="text-red-500 flex items-center gap-1 font-bold text-[11px]" title="Kelas ini tidak terdaftar di sistem">
                                <AlertCircle className="w-3.5 h-3.5 inline" /> Kelas Tidak Terdaftar
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons for Preview */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => {
                    setImportPreview([]);
                    setSelectedFileName("");
                  }}
                  disabled={isImporting}
                  className="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-500 font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition active:scale-95"
                >
                  Batalkan
                </button>
                <button
                  onClick={handleSubmitImport}
                  disabled={isImporting}
                  className="px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-emerald-200 transition active:scale-95 flex items-center gap-2"
                >
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan & Proses Impor ({importPreview.length} Siswa)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ProfilTab({ user, editNama, setEditNama, editMapel, setEditMapel, editFoto, setEditFoto, onSave, isSaving }: any) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100"
    >
      <h3 className="font-black text-blue-950 mb-8 uppercase flex items-center italic text-xl tracking-tight">
          <Settings className="mr-3 w-8 h-8 text-blue-600" />
          Pengaturan Akun
      </h3>
      
      <div className="flex flex-col items-center mb-10">
        <div className="relative group">
          <img 
            src={editFoto || user?.fotoUrl || "https://www.w3schools.com/howto/img_avatar.png"} 
            className="w-36 h-36 rounded-full border-8 border-slate-100 object-cover shadow-xl group-hover:scale-105 transition-transform"
            alt="Avatar"
          />
          <input 
            type="file" ref={fileInputRef} className="hidden" accept="image/*"
            onChange={handleFileChange}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-blue-600 p-3 rounded-2xl text-white shadow-xl hover:bg-blue-700 transition-all active:scale-90 border-2 border-white"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-4 font-black text-blue-900 uppercase text-xs tracking-widest">{user?.role}</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">{user?.email}</p>
      </div>

      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest">Nama Lengkap Anda</label>
          <input 
            type="text" value={editNama} onChange={(e) => setEditNama(e.target.value)}
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-blue-500 outline-none transition uppercase"
          />
        </div>

        <div>
           <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-1 block tracking-widest">Mata Pelajaran Diampu</label>
           <input 
             type="text" value={editMapel} onChange={(e) => setEditMapel(e.target.value)}
             className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold focus:border-blue-500 outline-none transition uppercase"
             placeholder="Contoh: Matematika, Fisika"
           />
        </div>
        
        <button 
          onClick={onSave} disabled={isSaving}
          className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-black py-6 rounded-[1.5rem] shadow-xl uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Simpan Perubahan User'}
        </button>
      </div>
    </motion.div>
  );
}

function LoginModal({ show, role, email, setEmail, pass, setPass, onLogin, onClose, isVerifying }: any) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-blue-950/80 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, rotate: -2 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-[0_48px_80px_-24px_rgba(0,0,0,0.5)] border-t-[12px] border-blue-600 overflow-hidden relative"
          >
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-50 rounded-full opacity-50"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
            
            <h2 className="font-black text-center mb-8 text-blue-950 text-2xl italic uppercase tracking-tighter relative z-10">
              Login {role}
            </h2>
            
            <div className="space-y-3 mb-8 relative z-10">
              <input 
                type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 focus:border-blue-500 outline-none transition shadow-inner"
              />
              <input 
                type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 focus:border-blue-500 outline-none transition shadow-inner"
              />
            </div>
            
            <button 
              onClick={onLogin} disabled={isVerifying}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl mb-6 hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-3 relative z-10"
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              MASUK KE DASHBOARD
            </button>
            
            <button onClick={onClose} className="w-full text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition relative z-10">
              Batalkan Login
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function RegistrationModal({ show, onClose, onSuccess }: any) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-blue-950/80 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="bg-white p-10 rounded-[3rem] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-t-[12px] border-green-500 scroll-hide"
          >
            <h2 className="font-black text-3xl text-blue-950 mb-8 uppercase italic tracking-tighter">New Registration</h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Full Name</label>
                <input type="text" placeholder="Gelar & Nama Lengkap" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none focus:border-green-400" />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Email Address</label>
                <input type="email" placeholder="example@domain.com" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none focus:border-green-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Security Pass</label>
                  <input type="password" placeholder="Password" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none focus:border-green-400" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Confirm Pass</label>
                  <input type="password" placeholder="Re-type" className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none focus:border-green-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Assigned Role</label>
                    <select className="w-full p-5 bg-slate-50 rounded-2xl font-black text-blue-900 border-2 border-slate-100 outline-none appearance-none">
                      <option>Guru</option>
                      <option>Kepala Sekolah</option>
                      <option>Operator</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Unit Sekolah</label>
                    <select className="w-full p-5 bg-slate-50 rounded-2xl font-black text-blue-900 border-2 border-slate-100 outline-none appearance-none">
                      <option>SMKN 4 GARUT</option>
                      <option>PUSAT KCD XI</option>
                    </select>
                  </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 flex items-start gap-3 mt-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-1 shrink-0" />
                <p className="text-[10px] text-yellow-900 font-bold leading-relaxed uppercase tracking-tighter">
                  Proses verifikasi oleh admin membutuhkan waktu maksimal 1x24 jam sebelum akun aktif.
                </p>
              </div>

              <button onClick={onSuccess} className="w-full bg-green-600 text-white font-black py-6 rounded-[1.5rem] shadow-xl mt-6 uppercase tracking-widest hover:bg-green-700 transition active:scale-95 flex items-center justify-center gap-3">
                <UserPlus className="w-6 h-6" />
                Daftarkan Akun
              </button>
              
              <button 
                onClick={onClose}
                className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-4 hover:text-slate-600 transition"
              >
                Kembali ke Beranda
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InputJadwalTab({ values, setters, onSubmit, isSubmitting, classList, jadwalList }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-50"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-2xl">
          <Calendar className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-blue-900 leading-none">INPUT JADWAL</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Management Jadwal Mengajar Guru</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Hari</label>
          <select 
            value={values.jadwalHari}
            onChange={(e) => setters.setJadwalHari(e.target.value)}
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-blue-900 outline-none appearance-none"
          >
            {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Jam (Contoh: 07.00 - 09.00)</label>
          <input 
            type="text" 
            value={values.jadwalJam}
            onChange={(e) => setters.setJadwalJam(e.target.value)}
            placeholder="07.00 - 09.00"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-300"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Pilih Kelas</label>
          <select 
            value={values.jadwalKelas}
            onChange={(e) => setters.setJadwalKelas(e.target.value)}
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-blue-900 outline-none appearance-none"
          >
            <option value="">-- PILIH KELAS --</option>
            {classList.map((c: any) => <option key={c.id} value={c.nama}>{c.nama}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Mata Pelajaran</label>
          <input 
            type="text" 
            value={values.jadwalMapel}
            onChange={(e) => setters.setJadwalMapel(e.target.value)}
            placeholder="Mata Pelajaran"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-300"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Ruang / Lab (Opsional)</label>
          <input 
            type="text" 
            value={values.jadwalRuang}
            onChange={(e) => setters.setJadwalRuang(e.target.value)}
            placeholder="Contoh: Lab Komputer 1"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-300"
          />
        </div>
      </div>

      <button 
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white font-black py-6 rounded-[1.5rem] shadow-xl uppercase tracking-widest hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-3"
      >
        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
        SIMPAN JADWAL
      </button>

      {jadwalList && jadwalList.length > 0 && (
        <div className="mt-12">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-3 flex items-center gap-2">
             <ClipboardList className="w-4 h-4 text-blue-500" />
             Daftar Jadwal Terinput
           </h3>
           <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-inner">
             <table className="w-full text-left text-[11px]">
               <thead className="bg-slate-50 font-black text-slate-500 uppercase tracking-wider">
                 <tr>
                   <th className="p-4">Hari/Jam</th>
                   <th className="p-4">Mapel</th>
                   <th className="p-4">Kelas</th>
                   <th className="p-4">Ruang</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {jadwalList.map((j: any, i: number) => (
                   <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                     <td className="p-4">
                        <div className="font-black text-blue-900">{j.hari}</div>
                        <div className="text-[9px] font-bold text-slate-400 leading-none mt-0.5">{j.jam}</div>
                     </td>
                     <td className="p-4 font-bold uppercase text-slate-800">{j.mapel}</td>
                     <td className="p-4 font-black text-slate-500">{j.kelas}</td>
                     <td className="p-4 text-slate-400 italic font-medium">{j.ruang || '-'}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </motion.div>
  );
}

function SekolahTab({ values, setters, onSubmit, isSubmitting, schoolSettings }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-50"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-900 rounded-2xl">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-blue-950 leading-none">PENGATURAN SEKOLAH</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Konfigurasi Operasional & Geofencing</p>
        </div>
      </div>

      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 mb-8 flex items-center justify-between">
        <div>
          <h4 className="font-black text-blue-950 text-sm uppercase tracking-tight">{schoolSettings?.nama}</h4>
          <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-0.5">Identitas Satuan Pendidikan</p>
        </div>
        <div className="bg-white px-3 py-1 rounded-full text-[8px] font-black text-blue-600 border border-blue-200">AKTIF</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Jam Masuk (Format 00:00 - 24:00)</label>
          <input 
            type="text"
            inputMode="numeric"
            value={values.setJamMasuk}
            onChange={(e) => setters.setSetJamMasuk(e.target.value)}
            placeholder="07:00"
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-blue-950 outline-none focus:border-blue-300"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Jam Pulang (Format 00:00 - 24:00)</label>
          <input 
            type="text"
            inputMode="numeric"
            value={values.setJamPulang}
            onChange={(e) => setters.setSetJamPulang(e.target.value)}
            placeholder="15:00"
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-blue-950 outline-none focus:border-blue-300"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Latitude Lokasi</label>
          <input 
            type="text" 
            value={values.setLat}
            onChange={(e) => setters.setSetLat(e.target.value)}
            placeholder="-7.1234"
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-300"
          />
        </div>
        <div>
          <label className="text-[10px) font-black text-slate-400 uppercase ml-3 mb-1 block tracking-widest">Longitude Lokasi</label>
          <input 
            type="text" 
            value={values.setLng}
            onChange={(e) => setters.setSetLng(e.target.value)}
            placeholder="107.1234"
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-300"
          />
        </div>
      </div>

      <button 
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-950 text-white font-black py-6 rounded-[1.5rem] shadow-xl uppercase tracking-widest hover:bg-black transition active:scale-95 flex items-center justify-center gap-3"
      >
        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
        UPDATE PENGATURAN
      </button>

      <div className="mt-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tips Pengaturan:</p>
         <ul className="text-[9px] text-slate-500 font-bold space-y-1 uppercase leading-tight italic">
           <li>• Gunakan titik (.) untuk desimal koordinat</li>
           <li>• Jam kerja akan mempengaruhi status keterlambatan guru</li>
           <li>• Lokasi (Lat/Lng) adalah pusat radius absensi 50-100 meter</li>
         </ul>
      </div>
    </motion.div>
  );
}

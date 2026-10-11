export type Competition = {
  id: number;
  code: string;
  name: string;
  category: string;
  audience: string;
  description: string;
  deadline: string;
  prize: string;
  fee: number;
  quota: number;
  registered: number;
  theme: "cobalt" | "lime" | "coral" | "ink";
  status: "Aktif" | "Segera" | "Ditutup";
  posterPath?: string | null;
  posterUrl?: string | null;
  participationType?: "individu" | "kelompok";
  minMembers?: number;
  maxMembers?: number;
  whatsappGroupUrl?: string | null;
};

export type RegistrationMember = {
  nama_lengkap: string;
  email: string;
  no_whatsapp: string;
  instansi: string;
};

export type Registration = {
  id: string;
  team: string;
  competition: string;
  institution: string;
  leader: string;
  whatsapp: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected";
  payment: string;
  groupLink?: string | null;
  note?: string;
  members?: RegistrationMember[];
};

export const competitions: Competition[] = [
  {
    id: 1,
    code: "UI/UX",
    name: "Nusantara Design Sprint",
    category: "Desain Produk",
    audience: "Mahasiswa",
    description:
      "Rancang pengalaman layanan publik digital yang lebih inklusif dalam sprint intensif berbasis studi kasus nyata.",
    deadline: "18 Nov 2026",
    prize: "Rp15 Juta",
    fee: 75000,
    quota: 120,
    registered: 86,
    theme: "cobalt",
    status: "Aktif",
  },
  {
    id: 2,
    code: "DATA",
    name: "Data Impact Challenge",
    category: "Data Science",
    audience: "Umum",
    description:
      "Ubah data perkotaan menjadi insight yang dapat ditindaklanjuti untuk kota yang tangguh dan manusiawi.",
    deadline: "25 Nov 2026",
    prize: "Rp20 Juta",
    fee: 100000,
    quota: 90,
    registered: 51,
    theme: "lime",
    status: "Aktif",
  },
  {
    id: 3,
    code: "BIZ",
    name: "Young Founder Arena",
    category: "Business Case",
    audience: "SMA / Mahasiswa",
    description:
      "Bangun strategi pertumbuhan untuk bisnis lokal dan presentasikan solusi di hadapan praktisi industri.",
    deadline: "02 Des 2026",
    prize: "Rp12 Juta",
    fee: 50000,
    quota: 150,
    registered: 109,
    theme: "coral",
    status: "Aktif",
  },
  {
    id: 4,
    code: "FILM",
    name: "Ruang Cerita Pendek",
    category: "Film Pendek",
    audience: "Umum",
    description:
      "Ceritakan wajah Indonesia hari ini lewat film berdurasi maksimal tujuh menit dengan perspektif yang segar.",
    deadline: "12 Des 2026",
    prize: "Rp18 Juta",
    fee: 0,
    quota: 80,
    registered: 34,
    theme: "ink",
    status: "Segera",
  },
];

export const registrations: Registration[] = [
  {
    id: "REG-1048",
    team: "Sora Collective",
    competition: "Nusantara Design Sprint",
    institution: "Universitas Indonesia",
    leader: "Aditya Rahman",
    whatsapp: "0812 3456 7890",
    submittedAt: "10 Okt 2026, 09.42",
    status: "Pending",
    payment: "bukti-sora.pdf",
  },
  {
    id: "REG-1047",
    team: "Data Kita",
    competition: "Data Impact Challenge",
    institution: "Institut Teknologi Bandung",
    leader: "Nadia Kusuma",
    whatsapp: "0813 7788 1122",
    submittedAt: "10 Okt 2026, 08.15",
    status: "Pending",
    payment: "transfer-datakita.jpg",
  },
  {
    id: "REG-1046",
    team: "Kawan Lokal",
    competition: "Young Founder Arena",
    institution: "Universitas Gadjah Mada",
    leader: "Raka Pratama",
    whatsapp: "0857 1122 3344",
    submittedAt: "09 Okt 2026, 20.31",
    status: "Approved",
    payment: "kwitansi-kawan.png",
  },
  {
    id: "REG-1045",
    team: "Arunika Studio",
    competition: "Nusantara Design Sprint",
    institution: "Telkom University",
    leader: "Aulia Putri",
    whatsapp: "0821 9077 6611",
    submittedAt: "09 Okt 2026, 18.02",
    status: "Rejected",
    payment: "bukti-arunika.pdf",
  },
];

export const formatCurrency = (amount: number) =>
  amount === 0
    ? "Gratis"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(amount);

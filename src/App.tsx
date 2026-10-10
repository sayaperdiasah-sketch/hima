import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UploadCloud,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  HashRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Competition, competitions, formatCurrency, registrations as initialRegistrations } from "./data";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

type ActiveCompetitionRow = {
  id_kompetisi: number;
  nama_kompetisi: string;
  kategori: string;
  deskripsi: string;
  target_peserta: string;
  total_hadiah: string | null;
  biaya_pendaftaran: number;
  kuota_maksimal: number | null;
  deadline_pendaftaran: string;
  pendaftar_count: number | string;
};

function useCompetitions() {
  const [items, setItems] = useState<Competition[]>(competitions);
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const load = async () => {
      const { data } = await client.rpc("get_active_competitions");
      const rows = (data ?? []) as ActiveCompetitionRow[];
      if (!rows.length) return;
      const themes: Competition["theme"][] = ["cobalt", "lime", "coral", "ink"];
      setItems(rows.map((row, index) => ({
        id: row.id_kompetisi,
        code: row.kategori.slice(0, 4).toUpperCase(),
        name: row.nama_kompetisi,
        category: row.kategori,
        audience: row.target_peserta,
        description: row.deskripsi,
        deadline: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(row.deadline_pendaftaran)),
        prize: row.total_hadiah ?? "Segera diumumkan",
        fee: row.biaya_pendaftaran,
        quota: row.kuota_maksimal ?? 100,
        registered: Number(row.pendaftar_count ?? 0),
        theme: themes[index % themes.length],
        status: "Aktif",
      })));
    };
    void load();
  }, []);
  return items;
}

function Brand({ admin = false }: { admin?: boolean }) {
  return (
    <Link className="brand" to={admin ? "/admin" : "/"} aria-label="KompetisiKita">
      <span className="brand-mark"><Trophy size={18} strokeWidth={2.5} /></span>
      <span>Kompetisi<span>Kita</span></span>
      {admin && <b className="admin-tag">ADMIN</b>}
    </Link>
  );
}

function ParticipantHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Brand />
        <nav className={open ? "main-nav open" : "main-nav"} aria-label="Navigasi utama">
          <Link to="/" onClick={() => setOpen(false)}>Beranda</Link>
          <Link to="/kompetisi" onClick={() => setOpen(false)}>Kompetisi</Link>
          <a href="#cara-kerja" onClick={() => setOpen(false)}>Cara Kerja</a>
          <a href="#tentang" onClick={() => setOpen(false)}>Tentang</a>
        </nav>
        <div className="nav-actions">
          <Link className="text-link" to="/masuk">Masuk</Link>
          <Link className="button button-small button-dark" to="/daftar">Buat Akun <ArrowRight size={15} /></Link>
        </div>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Buka menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

function Poster({ item, compact = false }: { item: Competition; compact?: boolean }) {
  return (
    <div className={`poster poster-${item.theme} ${compact ? "poster-compact" : ""}`} aria-hidden="true">
      <span className="poster-grid" />
      <span className="poster-edition">OPEN CALL • 2026</span>
      <strong>{item.code}</strong>
      <span className="poster-slash">/</span>
      <small>{item.category}<br />Competition</small>
      <span className="poster-dot" />
    </div>
  );
}

function CompetitionCard({ item }: { item: Competition }) {
  return (
    <article className="competition-card">
      <Poster item={item} compact />
      <div className="competition-body">
        <div className="card-meta"><span>{item.category}</span><span>{item.audience}</span></div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="deadline-row">
          <span><CalendarDays size={16} /> Tutup {item.deadline}</span>
          <strong>{formatCurrency(item.fee)}</strong>
        </div>
        <Link className="card-link" to={`/kompetisi/${item.id}`}>Lihat detail <ArrowRight size={16} /></Link>
      </div>
    </article>
  );
}

function HomePage() {
  const competitionItems = useCompetitions();
  return (
    <div>
      <ParticipantHeader />
      <main>
        <section className="hero">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-content">
            <div className="hero-copy reveal">
              <p className="kicker"><Sparkles size={15} /> Panggung talenta Indonesia</p>
              <h1>Ide hebat layak<br />mendapat <em>panggung.</em></h1>
              <p className="hero-lead">Temukan kompetisi terbaik, bentuk tim, dan bawa karyamu selangkah lebih dekat menuju dampak nyata.</p>
              <div className="hero-actions">
                <Link className="button button-lime" to="/kompetisi">Jelajahi kompetisi <ArrowRight size={18} /></Link>
                <a className="inline-link" href="#cara-kerja"><span className="play-dot">▶</span> Lihat cara kerja</a>
              </div>
              <div className="trust-row">
                <div className="avatar-stack"><span>AR</span><span>DK</span><span>SA</span><span>+</span></div>
                <div><b>4.800+ peserta</b><small>sudah memulai langkahnya</small></div>
              </div>
            </div>
            <div className="hero-stage reveal delay-1">
              <div className="ticket-card ticket-back"><span>YOUNG</span><b>FOUNDER</b><small>ARENA · 2026</small></div>
              <div className="ticket-card ticket-front">
                <div className="ticket-top"><span>OPEN REGISTRATION</span><Trophy size={20} /></div>
                <p>COMPETE<br />CREATE<br /><em>IMPACT.</em></p>
                <div className="ticket-bottom"><span>20.11—02.12</span><span>JAKARTA / ONLINE</span></div>
              </div>
              <div className="floating-note"><CheckCircle2 size={18} /><span><b>Pendaftaran mudah</b><small>Selesai dalam 4 langkah</small></span></div>
            </div>
          </div>
          <div className="hero-ticker"><span>DESAIN</span><i>✦</i><span>TEKNOLOGI</span><i>✦</i><span>BISNIS</span><i>✦</i><span>FILM</span><i>✦</i><span>DATA</span></div>
        </section>

        <section className="section competition-section">
          <div className="section-heading">
            <div><p className="kicker dark">Pilihan terkurasi</p><h2>Kompetisi yang sedang <em>dibuka.</em></h2></div>
            <Link className="outline-link" to="/kompetisi">Lihat semua <ArrowRight size={16} /></Link>
          </div>
          <div className="competition-grid">{competitionItems.slice(0, 3).map((item) => <CompetitionCard key={item.id} item={item} />)}</div>
        </section>

        <section className="steps-section" id="cara-kerja">
          <div className="section steps-inner">
            <div className="steps-title"><p className="kicker dark">Mulai dari sini</p><h2>Empat langkah.<br /><em>Satu peluang besar.</em></h2><p>Proses ringkas agar energimu tetap fokus pada karya terbaik.</p></div>
            <div className="steps-list">
              {[
                ["01", "Buat akun", "Daftar dengan email aktif dan lengkapi profil peserta."],
                ["02", "Pilih kompetisi", "Temukan kategori yang paling sesuai dengan potensimu."],
                ["03", "Kirim pendaftaran", "Isi data tim, unggah berkas, lalu lakukan pembayaran."],
                ["04", "Pantau status", "Dapatkan pembaruan verifikasi langsung dari dashboard."],
              ].map(([no, title, text]) => <div className="step" key={no}><span>{no}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}
            </div>
          </div>
        </section>

        <section className="cta-section" id="tentang">
          <div className="cta-card"><span className="cta-star">✦</span><p className="kicker">Kesempatan tidak datang dua kali</p><h2>Siap membawa idemu<br />ke <em>level berikutnya?</em></h2><Link className="button button-lime" to="/daftar">Mulai sekarang <ArrowRight size={18} /></Link></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);
  const unlockAdmin = () => {
    const nextCount = tapCount + 1;
    setTapCount(nextCount);
    if (nextCount >= 5) {
      setTapCount(0);
      navigate("/admin/login");
      return;
    }
    window.setTimeout(() => setTapCount(0), 2500);
  };
  return (
    <footer className="site-footer">
      <div><Brand /><p>Ruang bertumbuh bagi talenta dan ide terbaik Indonesia.</p></div>
      <div><b>Jelajahi</b><Link to="/kompetisi">Kompetisi</Link><a href="#cara-kerja">Cara kerja</a></div>
      <div><b>Bantuan</b><a href="mailto:halo@kompetisikita.id">Pusat bantuan</a><a href="mailto:halo@kompetisikita.id">Hubungi panitia</a></div>
      <div className="footer-bottom"><button className="secret-admin-trigger" onClick={unlockAdmin} aria-label="Hak cipta KompetisiKita">© 2026 KompetisiKita</button><span>Privasi · Ketentuan</span></div>
    </footer>
  );
}

function CatalogPage() {
  const competitionItems = useCompetitions();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const filtered = competitionItems.filter((item) => (category === "Semua" || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase()));
  const categories = ["Semua", ...new Set(competitionItems.map((item) => item.category))];
  return (
    <div className="light-page">
      <ParticipantHeader />
      <main className="catalog-main">
        <section className="catalog-hero"><p className="kicker dark">Temukan panggungmu</p><h1>Kompetisi untuk setiap<br /><em>jenis keberanian.</em></h1><p>Kumpulan tantangan terkurasi untuk mengasah kemampuan dan memperluas jejaring.</p></section>
        <div className="filter-bar">
          <label className="search-field"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kompetisi..." /></label>
          <div className="category-tabs">{categories.map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
        </div>
        <div className="result-line"><b>{filtered.length} kompetisi</b><span>tersedia untukmu</span></div>
        <div className="competition-grid catalog-grid">{filtered.map((item) => <CompetitionCard key={item.id} item={item} />)}</div>
      </main>
      <Footer />
    </div>
  );
}

function CompetitionDetailPage() {
  const { id } = useParams();
  const competitionItems = useCompetitions();
  const item = competitionItems.find((competition) => competition.id === Number(id));
  if (!item) return <Navigate to="/kompetisi" replace />;
  const percent = Math.round((item.registered / item.quota) * 100);
  return (
    <div className="light-page">
      <ParticipantHeader />
      <main className="detail-main">
        <Link className="back-link" to="/kompetisi">← Kembali ke kompetisi</Link>
        <div className="detail-grid">
          <Poster item={item} />
          <section className="detail-copy">
            <div className="card-meta"><span>{item.category}</span><span>{item.audience}</span></div>
            <h1>{item.name}</h1><p className="detail-lead">{item.description}</p>
            <div className="detail-stats"><div><small>Total hadiah</small><strong>{item.prize}</strong></div><div><small>Batas daftar</small><strong>{item.deadline}</strong></div><div><small>Biaya</small><strong>{formatCurrency(item.fee)}</strong></div></div>
            <div className="quota"><div><span>Kuota terisi</span><b>{item.registered}/{item.quota} tim</b></div><div className="progress"><span style={{ width: `${percent}%` }} /></div></div>
            <Link className="button button-dark button-wide" to={`/daftar-lomba/${item.id}`}>Daftar kompetisi ini <ArrowRight size={18} /></Link>
            <p className="secure-note"><ShieldCheck size={16} /> Data dan berkasmu dilindungi oleh akses berbasis akun.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ParticipantLogin({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget); const email = String(form.get("email")); const password = String(form.get("password"));
    if (!supabase) { setTimeout(() => { setLoading(false); navigate("/kompetisi"); }, 700); return; }
    const result = register ? await supabase.auth.signUp({ email, password, options: { data: { nama_lengkap: form.get("name") } } }) : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false); if (result.error) setMessage(result.error.message); else navigate("/kompetisi");
  };
  return (
    <div className="auth-page">
      <div className="auth-brand"><Brand /></div>
      <section className="auth-art"><div className="auth-art-copy"><span>✦</span><h2>Setiap pencapaian<br />dimulai dari satu<br /><em>keberanian.</em></h2><p>Temukan tantangan. Buktikan kemampuan.</p></div></section>
      <section className="auth-panel">
        <div className="auth-form-wrap"><p className="kicker dark">{register ? "Bergabung" : "Selamat datang kembali"}</p><h1>{register ? "Buat akun peserta." : "Masuk ke akunmu."}</h1><p>{register ? "Satu akun untuk seluruh kompetisi." : "Lanjutkan langkah yang sudah kamu mulai."}</p>
          <form onSubmit={handleSubmit} className="form-stack">
            {register && <label>Nama lengkap<input required name="name" placeholder="Nama sesuai identitas" /></label>}
            <label>Email<input required type="email" name="email" placeholder="nama@email.com" /></label>
            <label>Kata sandi<input required minLength={6} type="password" name="password" placeholder="Minimal 6 karakter" /></label>
            {message && <div className="form-alert error">{message}</div>}
            {!isSupabaseConfigured && <div className="demo-hint">Mode demo aktif — formulir dapat dicoba tanpa akun.</div>}
            <button className="button button-dark button-wide" disabled={loading}>{loading ? "Memproses..." : register ? "Buat akun" : "Masuk"}<ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">{register ? "Sudah punya akun?" : "Belum punya akun?"} <Link to={register ? "/masuk" : "/daftar"}>{register ? "Masuk" : "Daftar sekarang"}</Link></p>
        </div>
      </section>
    </div>
  );
}

function AdminKeyboardShortcut() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        navigate("/admin/login");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
  return null;
}

function RegistrationPage() {
  const { id } = useParams(); const navigate = useNavigate(); const competitionItems = useCompetitions(); const competition = competitionItems.find((item) => item.id === Number(id));
  const [done, setDone] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  if (!competition) return <Navigate to="/kompetisi" replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    if (!supabase) { setTimeout(() => { setLoading(false); setDone(true); }, 600); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/masuk"); return; }
    const form = new FormData(event.currentTarget);
    const file = form.get("payment") as File;
    let paymentPath: string | null = null;
    if (file?.size) {
      paymentPath = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error: uploadError } = await supabase.storage.from("bukti-bayar").upload(paymentPath, file);
      if (uploadError) { setError("Bukti pembayaran gagal diunggah. Periksa format dan ukuran file."); setLoading(false); return; }
    }
    const { error: insertError } = await supabase.from("pendaftaran").insert({
      id_user: user.id,
      id_kompetisi: competition.id,
      nama_tim: String(form.get("team")),
      nama_ketua: String(form.get("leader")),
      instansi: String(form.get("institution")),
      no_whatsapp: String(form.get("whatsapp")),
      bukti_bayar_path: paymentPath,
    });
    if (insertError) { setError(insertError.message); setLoading(false); return; }
    setLoading(false); setDone(true);
  };
  return (
    <div className="form-page"><header className="simple-header"><Brand /><span>Pendaftaran kompetisi</span></header><main className="registration-layout">
      <aside><Poster item={competition} compact /><span className="step-chip">LANGKAH 1 DARI 3</span><h2>{competition.name}</h2><p>{competition.category} · {competition.audience}</p><div className="aside-fact"><CalendarDays size={18} /><span><small>Batas pendaftaran</small><b>{competition.deadline}</b></span></div><div className="aside-fact"><CircleDollarSign size={18} /><span><small>Biaya tim</small><b>{formatCurrency(competition.fee)}</b></span></div></aside>
      <section className="registration-form">
        {!done ? <><p className="kicker dark">Data pendaftaran</p><h1>Ceritakan tentang timmu.</h1><p>Pastikan seluruh data sudah benar sebelum dikirim.</p><form className="form-grid" onSubmit={submit}><label className="full">Nama tim<input required name="team" placeholder="Contoh: Tim Garuda Muda" /></label><label>Nama ketua<input required name="leader" placeholder="Nama lengkap" /></label><label>No. WhatsApp<input required name="whatsapp" placeholder="08xxxxxxxxxx" /></label><label className="full">Asal instansi<input required name="institution" placeholder="Sekolah, kampus, atau umum" /></label><label className="full file-field"><span>Bukti pembayaran</span><div><UploadCloud size={24} /><b>Tarik file atau pilih dari perangkat</b><small>PDF, JPG, atau PNG · Maks. 5 MB</small><input name="payment" accept=".pdf,.jpg,.jpeg,.png" type="file" required={competition.fee > 0} /></div></label>{error && <div className="form-alert error full">{error}</div>}<label className="checkbox full"><input type="checkbox" required /><span>Saya menyatakan data yang diberikan benar dan menyetujui ketentuan kompetisi.</span></label><button disabled={loading} className="button button-dark button-wide full">{loading ? "Mengirim..." : "Kirim pendaftaran"} <ArrowRight size={18} /></button></form></> : <div className="success-state"><span><Check size={32} /></span><p className="kicker dark">Pendaftaran terkirim</p><h1>Kerja bagus!</h1><p>Tim panitia akan memeriksa data dan bukti pembayaranmu. Status verifikasi akan diperbarui maksimal 2×24 jam.</p><button className="button button-dark" onClick={() => navigate("/kompetisi")}>Kembali ke katalog</button></div>}
      </section>
    </main></div>
  );
}

function AdminLogin() {
  const navigate = useNavigate(); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    if (!supabase) { sessionStorage.setItem("demo-admin", "true"); setTimeout(() => navigate("/admin"), 650); return; }
    const form = new FormData(event.currentTarget); const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (loginError || !data.user) { setError("Email atau kata sandi tidak valid."); setLoading(false); return; }
    const { data: admin } = await supabase.from("admin_users").select("user_id, is_active").eq("user_id", data.user.id).eq("is_active", true).maybeSingle();
    if (!admin) { await supabase.auth.signOut(); setError("Akun ini tidak memiliki izin admin."); setLoading(false); return; }
    navigate("/admin");
  };
  return (
    <div className="admin-login-page"><div className="admin-login-card"><Brand admin /><div className="security-seal"><ShieldCheck size={28} /></div><p className="kicker">Portal aman</p><h1>Masuk sebagai<br />administrator.</h1><p>Area ini khusus panitia berwenang. Seluruh aktivitas masuk dicatat.</p><form className="form-stack" onSubmit={submit}><label>Email admin<input required type="email" name="email" placeholder="admin@organisasi.id" /></label><label>Kata sandi<input required type="password" name="password" placeholder="••••••••••••" /></label>{error && <div className="form-alert error">{error}</div>}{!isSupabaseConfigured && <div className="demo-hint dark-hint"><b>Preview mode</b> — klik masuk untuk membuka dashboard demo.</div>}<button className="button button-lime button-wide" disabled={loading}>{loading ? "Memverifikasi..." : "Masuk dengan aman"}<LockKeyhole size={16} /></button></form><div className="admin-security"><span><Check size={14} /> Role diverifikasi di database</span><span><Check size={14} /> Dilindungi Row Level Security</span></div><Link to="/" className="back-site">← Kembali ke situs peserta</Link></div></div>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");
  useEffect(() => {
    const verify = async () => {
      if (!supabase) { setState(sessionStorage.getItem("demo-admin") === "true" ? "allowed" : "denied"); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("denied"); return; }
      const { data } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).eq("is_active", true).maybeSingle();
      setState(data ? "allowed" : "denied");
    }; verify();
  }, []);
  if (state === "loading") return <div className="guard-loading"><ShieldCheck /><span>Memverifikasi akses...</span></div>;
  if (state === "denied") return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

type AdminView = "overview" | "registrations" | "competitions";

function AdminDashboard() {
  const navigate = useNavigate(); const [view, setView] = useState<AdminView>("overview"); const [mobileNav, setMobileNav] = useState(false);
  const [rows, setRows] = useState(initialRegistrations); const [selected, setSelected] = useState<typeof rows[number] | null>(null); const [toast, setToast] = useState("");
  const [adminName, setAdminName] = useState("Moh. Ferdiansah");
  const [participantCount, setParticipantCount] = useState(1284);
  const [activeCompetitionCount, setActiveCompetitionCount] = useState(competitions.length);
  const competitionItems = useCompetitions();
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const load = async () => {
      const [{ data }, participantResult, competitionResult, userResult] = await Promise.all([
        client.from("pendaftaran").select("id_pendaftaran,nama_tim,nama_ketua,no_whatsapp,instansi,created_at,status_verifikasi,bukti_bayar_path,kompetisi(nama_kompetisi)").order("created_at", { ascending: false }),
        client.from("profiles").select("id", { count: "exact", head: true }),
        client.from("kompetisi").select("id_kompetisi", { count: "exact", head: true }).eq("status", "aktif"),
        client.auth.getUser(),
      ]);
      setParticipantCount(participantResult.count ?? 0);
      setActiveCompetitionCount(competitionResult.count ?? 0);
      if (userResult.data.user) {
        const { data: admin } = await client.from("admin_users").select("nama_lengkap").eq("user_id", userResult.data.user.id).maybeSingle();
        if (admin?.nama_lengkap) setAdminName(admin.nama_lengkap);
      }
      if (!data) return;
      setRows(data.map((row) => {
        const relation = row.kompetisi as unknown as { nama_kompetisi: string } | null;
        return {
          id: `REG-${row.id_pendaftaran}`,
          team: row.nama_tim,
          competition: relation?.nama_kompetisi ?? "Kompetisi",
          institution: row.instansi,
          leader: row.nama_ketua,
          whatsapp: row.no_whatsapp,
          submittedAt: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.created_at)),
          status: row.status_verifikasi as "Pending" | "Approved" | "Rejected",
          payment: row.bukti_bayar_path ?? "Tidak ada file",
        };
      }));
    };
    void load();
  }, []);
  const updateStatus = async (id: string, status: "Approved" | "Rejected") => {
    if (supabase) {
      const numericId = Number(id.replace("REG-", ""));
      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateError } = await supabase.from("pendaftaran").update({ status_verifikasi: status, verified_by: user?.id, verified_at: new Date().toISOString() }).eq("id_pendaftaran", numericId);
      if (updateError) { setToast("Status gagal diperbarui. Silakan coba lagi."); setTimeout(() => setToast(""), 2800); return; }
    }
    setRows((current) => current.map((row) => row.id === id ? { ...row, status } : row)); setSelected(null); setToast(status === "Approved" ? "Pendaftaran berhasil disetujui." : "Pendaftaran ditolak dan peserta akan diberi tahu."); setTimeout(() => setToast(""), 2800);
  };
  const logout = async () => { sessionStorage.removeItem("demo-admin"); if (supabase) await supabase.auth.signOut(); navigate("/admin/login"); };
  const label = view === "overview" ? "Ringkasan" : view === "registrations" ? "Verifikasi Pendaftar" : "Kelola Kompetisi";
  return (
    <div className="admin-app">
      <aside className={mobileNav ? "admin-sidebar open" : "admin-sidebar"}><div className="sidebar-top"><Brand admin /><button onClick={() => setMobileNav(false)}><X /></button></div><nav>
        <button className={view === "overview" ? "active" : ""} onClick={() => { setView("overview"); setMobileNav(false); }}><LayoutDashboard size={19} /> Ringkasan</button>
        <button className={view === "registrations" ? "active" : ""} onClick={() => { setView("registrations"); setMobileNav(false); }}><FileCheck2 size={19} /> Verifikasi <span className="nav-count">{rows.filter((row) => row.status === "Pending").length}</span></button>
        <button className={view === "competitions" ? "active" : ""} onClick={() => { setView("competitions"); setMobileNav(false); }}><Trophy size={19} /> Kompetisi</button>
        <button><Users size={19} /> Peserta</button><button><BarChart3 size={19} /> Laporan</button>
      </nav><div className="sidebar-security"><ShieldCheck size={20} /><div><b>Akses terlindungi</b><small>Role: Super Admin</small></div></div><button className="logout-button" onClick={logout}><LogOut size={18} /> Keluar</button></aside>
      <main className="admin-main"><header className="admin-topbar"><button className="admin-menu" onClick={() => setMobileNav(true)}><Menu /></button><div><p>Dashboard / {label}</p><h1>{label}</h1></div><div className="admin-user"><button className="notification"><Bell size={19} /><span /></button><div className="user-avatar">{adminName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><div><b>{adminName}</b><small>Super Admin</small></div><ChevronDown size={16} /></div></header>
        {view === "overview" && <Overview rows={rows} competitions={competitionItems} adminName={adminName} participantCount={participantCount} activeCompetitionCount={activeCompetitionCount} openRegistrations={() => setView("registrations")} />}
        {view === "registrations" && <RegistrationsTable rows={rows} setSelected={setSelected} updateStatus={updateStatus} />}
        {view === "competitions" && <AdminCompetitions items={competitionItems} />}
      </main>
      {selected && <VerificationDrawer item={selected} close={() => setSelected(null)} updateStatus={updateStatus} />}
      {toast && <div className="toast"><CheckCircle2 size={19} />{toast}</div>}
    </div>
  );
}

function Overview({ rows, competitions: competitionList, adminName, participantCount, activeCompetitionCount, openRegistrations }: { rows: typeof initialRegistrations; competitions: Competition[]; adminName: string; participantCount: number; activeCompetitionCount: number; openRegistrations: () => void }) {
  const pending = rows.filter((row) => row.status === "Pending").length;
  const today = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date());
  return <div className="admin-content"><div className="welcome-strip"><div><p className="kicker dark">{today}</p><h2>Selamat datang, {adminName.split(" ")[0]}.</h2><p>Ada <b>{pending} pendaftaran baru</b> yang menunggu verifikasi hari ini.</p></div><button className="button button-dark" onClick={openRegistrations}>Periksa sekarang <ArrowRight size={17} /></button></div><div className="metric-grid">
    <Metric icon={<Users />} value={participantCount.toLocaleString("id-ID")} label="Total peserta" change="Data Supabase" tone="blue" />
    <Metric icon={<FileText />} value={rows.length.toLocaleString("id-ID")} label="Total pendaftaran" change="Data Supabase" tone="lime" />
    <Metric icon={<Clock3 />} value={String(pending)} label="Perlu diverifikasi" change="Butuh tindakan" tone="coral" />
    <Metric icon={<Trophy />} value={String(activeCompetitionCount)} label="Kompetisi aktif" change="Data Supabase" tone="ink" />
  </div><div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-head"><div><h3>Tren pendaftaran</h3><p>7 hari terakhir</p></div><button>7 hari <ChevronDown size={14} /></button></div><div className="chart-area"><div className="y-labels"><span>60</span><span>45</span><span>30</span><span>15</span><span>0</span></div><svg viewBox="0 0 620 220" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1647d8" stopOpacity=".28"/><stop offset="1" stopColor="#1647d8" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 184 C65 176 83 145 145 153 S231 88 292 112 S379 54 433 74 S523 28 620 36 L620 220 L0 220 Z"/><path className="line" d="M0 184 C65 176 83 145 145 153 S231 88 292 112 S379 54 433 74 S523 28 620 36"/></svg><div className="x-labels"><span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span></div></div></section><section className="panel quick-panel"><div className="panel-head"><div><h3>Kompetisi populer</h3><p>Berdasarkan pendaftar</p></div><MoreHorizontal /></div>{competitionList.slice(0, 3).map((item, index) => <div className="popular-row" key={item.id}><span className={`rank rank-${index + 1}`}>0{index + 1}</span><div><b>{item.name}</b><small>{item.registered} tim terdaftar</small></div><strong>{Math.round((item.registered / item.quota) * 100)}%</strong></div>)}</section></div><section className="panel recent-panel"><div className="panel-head"><div><h3>Pendaftaran terbaru</h3><p>Aktivitas yang baru masuk</p></div><button className="plain-button" onClick={openRegistrations}>Lihat semua <ArrowRight size={15} /></button></div><RegistrationsTable rows={rows.slice(0, 3)} compact /></section></div>;
}

function Metric({ icon, value, label, change, tone }: { icon: React.ReactNode; value: string; label: string; change: string; tone: string }) { return <article className="metric-card"><span className={`metric-icon ${tone}`}>{icon}</span><div><strong>{value}</strong><b>{label}</b><small>{change}</small></div></article>; }

function StatusBadge({ status }: { status: string }) { return <span className={`status-badge status-${status.toLowerCase()}`}>{status === "Approved" ? <CheckCircle2 size={13} /> : status === "Rejected" ? <XCircle size={13} /> : <Clock3 size={13} />}{status}</span>; }

function RegistrationsTable({ rows, setSelected, updateStatus, compact = false }: { rows: typeof initialRegistrations; setSelected?: (item: typeof initialRegistrations[number]) => void; updateStatus?: (id: string, status: "Approved" | "Rejected") => void; compact?: boolean }) {
  const [filter, setFilter] = useState("Semua"); const shown = filter === "Semua" ? rows : rows.filter((row) => row.status === filter);
  return <div className={compact ? "table-wrap compact" : "admin-content table-page"}>{!compact && <><div className="page-actions"><div className="admin-search"><Search size={17} /><input placeholder="Cari nama tim atau ID..." /></div><button className="secondary-button"><Filter size={16} /> Filter</button><button className="secondary-button"><Download size={16} /> Ekspor</button></div><div className="status-tabs">{["Semua", "Pending", "Approved", "Rejected"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></>}
  <div className="responsive-table"><table><thead><tr><th>ID / TIM</th><th>KOMPETISI</th><th>INSTANSI</th><th>WAKTU DAFTAR</th><th>STATUS</th><th>AKSI</th></tr></thead><tbody>{shown.map((row) => <tr key={row.id}><td><b>{row.team}</b><small>{row.id}</small></td><td>{row.competition}</td><td>{row.institution}</td><td>{row.submittedAt}</td><td><StatusBadge status={row.status} /></td><td>{row.status === "Pending" && updateStatus ? <div className="row-actions"><button className="approve-icon" onClick={() => updateStatus(row.id, "Approved")} title="Setujui"><Check size={16} /></button><button className="reject-icon" onClick={() => updateStatus(row.id, "Rejected")} title="Tolak"><X size={16} /></button><button onClick={() => setSelected?.(row)} title="Lihat detail"><Eye size={16} /></button></div> : <button className="detail-button" onClick={() => setSelected?.(row)}>Detail <ChevronRight size={15} /></button>}</td></tr>)}</tbody></table></div></div>;
}

function AdminCompetitions({ items }: { items: Competition[] }) {
  const [localItems, setLocalItems] = useState(items);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setLocalItems(items), [items]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const deadlineIso = new Date(String(form.get("deadline"))).toISOString();
    let posterPath: string | null = null;
    let createdId = Date.now();
    if (supabase) {
      const poster = form.get("poster") as File;
      if (poster?.size) {
        posterPath = `competition/${crypto.randomUUID()}-${poster.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: uploadError } = await supabase.storage.from("posters").upload(posterPath, poster);
        if (uploadError) { setError("Poster gagal diunggah."); setLoading(false); return; }
      }
      const { data, error: insertError } = await supabase.from("kompetisi").insert({
        nama_kompetisi: String(form.get("name")), kategori: String(form.get("category")), deskripsi: String(form.get("description")),
        target_peserta: String(form.get("audience")), total_hadiah: String(form.get("prize")), biaya_pendaftaran: Number(form.get("fee")),
        kuota_maksimal: Number(form.get("quota")), deadline_pendaftaran: deadlineIso, poster_path: posterPath, status: "aktif",
      }).select("id_kompetisi").single();
      if (insertError) { setError(insertError.message); setLoading(false); return; }
      createdId = data.id_kompetisi;
    }
    const next: Competition = {
      id: createdId, code: String(form.get("category")).slice(0, 4).toUpperCase(), name: String(form.get("name")), category: String(form.get("category")),
      audience: String(form.get("audience")), description: String(form.get("description")), deadline: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(deadlineIso)),
      prize: String(form.get("prize")), fee: Number(form.get("fee")), quota: Number(form.get("quota")), registered: 0, theme: "cobalt", status: "Aktif",
    };
    setLocalItems((current) => [next, ...current]); setLoading(false); setOpen(false);
  };
  return <div className="admin-content"><div className="page-actions competition-actions"><div><h2>Daftar kompetisi</h2><p>Kelola informasi, kuota, dan status pendaftaran.</p></div><button className="button button-dark" onClick={() => setOpen(true)}>+ Tambah kompetisi</button></div><div className="admin-competition-grid">{localItems.map((item) => <article key={item.id}><Poster item={item} compact /><div><div className="card-meta"><span>{item.status}</span><span>{item.category}</span></div><h3>{item.name}</h3><p><CalendarDays size={15} /> Tutup {item.deadline}</p><div className="admin-card-progress"><span><i style={{ width: `${(item.registered / item.quota) * 100}%` }} /></span><small>{item.registered}/{item.quota} tim</small></div><button className="secondary-button button-wide">Kelola kompetisi <ArrowRight size={15} /></button></div></article>)}</div>{open && <div className="drawer-backdrop" onMouseDown={() => setOpen(false)}><section className="competition-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><p>KOMPETISI BARU</p><h2>Publikasikan tantangan.</h2></div><button onClick={() => setOpen(false)}><X /></button></header><form className="form-grid" onSubmit={submit}><label className="full">Nama kompetisi<input name="name" required /></label><label>Kategori<input name="category" required /></label><label>Target peserta<input name="audience" defaultValue="Umum" required /></label><label>Total hadiah<input name="prize" placeholder="Contoh: Rp15 Juta" required /></label><label>Biaya pendaftaran<input name="fee" type="number" min="0" defaultValue="0" required /></label><label>Kuota tim<input name="quota" type="number" min="1" required /></label><label>Batas pendaftaran<input name="deadline" type="datetime-local" required /></label><label className="full">Deskripsi<textarea name="description" required /></label><label className="full">Poster opsional<input name="poster" type="file" accept=".jpg,.jpeg,.png,.webp" /></label>{error && <div className="form-alert error full">{error}</div>}<button className="button button-dark button-wide full" disabled={loading}>{loading ? "Menyimpan..." : "Publikasikan kompetisi"}</button></form></section></div>}</div>;
}

function VerificationDrawer({ item, close, updateStatus }: { item: typeof initialRegistrations[number]; close: () => void; updateStatus: (id: string, status: "Approved" | "Rejected") => void }) {
  const openPayment = async () => {
    if (!supabase || item.payment === "Tidak ada file") { window.alert("File demo tidak tersedia."); return; }
    const { data, error } = await supabase.storage.from("bukti-bayar").createSignedUrl(item.payment, 60);
    if (error || !data?.signedUrl) { window.alert("Berkas tidak dapat dibuka."); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };
  return <div className="drawer-backdrop" onMouseDown={close}><aside className="verification-drawer" onMouseDown={(e) => e.stopPropagation()}><header><div><p>DETAIL PENDAFTARAN</p><h2>{item.id}</h2></div><button onClick={close}><X /></button></header><div className="drawer-body"><div className="team-heading"><div className="team-avatar">{item.team.slice(0, 2).toUpperCase()}</div><div><h3>{item.team}</h3><p>{item.institution}</p></div><StatusBadge status={item.status} /></div><section><h4>Informasi pendaftaran</h4><dl><div><dt>Kompetisi</dt><dd>{item.competition}</dd></div><div><dt>Ketua tim</dt><dd>{item.leader}</dd></div><div><dt>No. WhatsApp</dt><dd>{item.whatsapp}</dd></div><div><dt>Waktu daftar</dt><dd>{item.submittedAt}</dd></div></dl></section><section><h4>Bukti pembayaran</h4><div className="document-preview"><FileText size={26} /><div><b>{item.payment}</b><small>Berkas privat</small></div><button onClick={openPayment}><Eye size={17} /> Lihat file</button></div><p className="file-warning"><ShieldCheck size={15} /> File hanya dapat dibuka oleh admin terverifikasi melalui signed URL 60 detik.</p></section><section className="review-note"><h4>Catatan verifikasi</h4><textarea placeholder="Tambahkan catatan untuk peserta (opsional)" /></section></div>{item.status === "Pending" && <footer><button className="reject-button" onClick={() => updateStatus(item.id, "Rejected")}><XCircle size={17} /> Tolak</button><button className="approve-button" onClick={() => updateStatus(item.id, "Approved")}><BadgeCheck size={17} /> Setujui pendaftaran</button></footer>}</aside></div>;
}

export function App() {
  return <HashRouter><AdminKeyboardShortcut /><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/kompetisi" element={<CatalogPage />} />
    <Route path="/kompetisi/:id" element={<CompetitionDetailPage />} />
    <Route path="/masuk" element={<ParticipantLogin />} />
    <Route path="/daftar" element={<ParticipantLogin register />} />
    <Route path="/daftar-lomba/:id" element={<RegistrationPage />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></HashRouter>;
}

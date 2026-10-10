import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Activity,
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
  Handshake,
  Image,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Trash2,
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
import {
  publicError,
  safeFilename,
  validateCompetition,
  validateEmail,
  validateFile,
  validatePassword,
  validateRegistration,
} from "./lib/validation";

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

type HeroSlide = {
  id: number;
  slot: number;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  imagePath: string | null;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
};

const defaultHeroes: HeroSlide[] = [
  { id: 1, slot: 1, title: "Teknologi bertemu kreativitas", subtitle: "Panggung utama INEFEST 4.0 untuk karya, kompetisi, dan kolaborasi.", imageUrl: null, imagePath: null, ctaLabel: "Jelajahi kompetisi", ctaUrl: "#/kompetisi", active: true },
  { id: 2, slot: 2, title: "Berani membangun masa depan", subtitle: "Temukan tantangan informatika yang sesuai dengan talenta terbaikmu.", imageUrl: null, imagePath: null, ctaLabel: "Lihat jadwal", ctaUrl: "#/kompetisi", active: true },
  { id: 3, slot: 3, title: "Tumbuh lewat kolaborasi", subtitle: "INEFEST mempertemukan peserta, komunitas, sponsor, dan media partner.", imageUrl: null, imagePath: null, ctaLabel: "Mulai daftar", ctaUrl: "#/daftar", active: true },
];

type PartnerTier = "utama" | "pendukung" | "komunitas" | "media";
type EventPartner = {
  id: number;
  name: string;
  tier: PartnerTier;
  logoUrl: string | null;
  logoPath: string | null;
  websiteUrl: string | null;
  order: number;
  active: boolean;
};

const partnerTierLabels: Record<PartnerTier, string> = {
  utama: "Sponsor Utama",
  pendukung: "Sponsor Pendukung",
  komunitas: "Community Partner",
  media: "Media Partner",
};

const defaultPartners: EventPartner[] = [
  { id: -1, name: "Slot Sponsor Utama", tier: "utama", logoUrl: null, logoPath: null, websiteUrl: null, order: 1, active: true },
  { id: -2, name: "Slot Sponsor Pendukung", tier: "pendukung", logoUrl: null, logoPath: null, websiteUrl: null, order: 1, active: true },
  { id: -3, name: "Slot Community Partner", tier: "komunitas", logoUrl: null, logoPath: null, websiteUrl: null, order: 1, active: true },
  { id: -4, name: "Slot Media Partner", tier: "media", logoUrl: null, logoPath: null, websiteUrl: null, order: 1, active: true },
];

function usePartners(includeInactive = false) {
  const [partners, setPartners] = useState<EventPartner[]>(defaultPartners);
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const load = async () => {
      let query = client.from("event_partners").select("id_partner,name,tier,logo_path,website_url,sort_order,is_active").order("sort_order").order("name");
      if (!includeInactive) query = query.eq("is_active", true);
      const { data } = await query;
      if (!data?.length) return;
      setPartners(data.map((row) => ({
        id: row.id_partner,
        name: row.name,
        tier: row.tier as PartnerTier,
        logoPath: row.logo_path,
        logoUrl: row.logo_path ? client.storage.from("partner-media").getPublicUrl(row.logo_path).data.publicUrl : null,
        websiteUrl: row.website_url,
        order: row.sort_order,
        active: row.is_active,
      })));
    };
    void load();
  }, [includeInactive]);
  return [partners, setPartners] as const;
}

function useHeroSlides(includeInactive = false) {
  const [slides, setSlides] = useState(defaultHeroes);
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const load = async () => {
      let query = client.from("hero_slides").select("id_hero,slot_number,title,subtitle,image_path,cta_label,cta_url,is_active").order("slot_number");
      if (!includeInactive) query = query.eq("is_active", true);
      const { data } = await query;
      if (!data?.length) return;
      setSlides(data.map((row) => ({
        id: row.id_hero,
        slot: row.slot_number,
        title: row.title,
        subtitle: row.subtitle,
        imagePath: row.image_path,
        imageUrl: row.image_path ? client.storage.from("hero-media").getPublicUrl(row.image_path).data.publicUrl : null,
        ctaLabel: row.cta_label,
        ctaUrl: row.cta_url,
        active: row.is_active,
      })));
    };
    void load();
  }, [includeInactive]);
  return [slides, setSlides] as const;
}

function HeroShowcase() {
  const [slides] = useHeroSlides();
  const [active, setActive] = useState(0);
  const slide = slides[active] ?? slides[0];
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % Math.max(slides.length, 1)), 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);
  return <div className="hero-showcase">
    <div className={`hero-media-slot hero-media-${slide.slot}`} style={slide.imageUrl ? { backgroundImage: `url(${slide.imageUrl})` } : undefined}>
      {!slide.imageUrl && <div className="hero-placeholder" aria-hidden="true"><span className="inefest-glyph">IF / 04</span></div>}
      <div className="hero-media-copy"><small>HERO 0{slide.slot}</small><h2>{slide.title}</h2><p>{slide.subtitle}</p><a href={slide.ctaUrl}>{slide.ctaLabel} <ArrowRight size={15} /></a></div>
    </div>
    <div className="hero-dots" aria-label="Pilih hero">{slides.map((item, index) => <button key={item.slot} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Hero ${item.slot}`} />)}</div>
  </div>;
}

function Brand({ admin = false }: { admin?: boolean }) {
  return (
    <Link className="brand" to={admin ? "/admin" : "/"} aria-label="INEFEST 4.0">
      <img className="brand-logo" src="/logo-prodi-ti.jpg" alt="Logo Program Studi Teknik Informatika UNIROW" />
      <span className="brand-wordmark"><b>INEFEST</b><small>INFORMATICS ENGINEERING FESTIVAL · 4.0</small></span>
      {admin && <b className="admin-tag">ADMIN</b>}
    </Link>
  );
}

function InstitutionIdentity() {
  return <div className="institution-identity" aria-label="Instansi dan pelaksana INEFEST 4.0">
    <div><span className="identity-label">Instansi</span><img src="/logo-unirow.jpg" alt="Universitas PGRI Ronggolawe Tuban" /><img src="/logo-prodi-ti.jpg" alt="Program Studi Teknik Informatika UNIROW" /></div>
    <i />
    <div><span className="identity-label">Pelaksana</span><img className="himatif-logo" src="/logo-himatif.jpg" alt="HIMATIF UNIROW" /></div>
  </div>;
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
          <a href="#mitra" onClick={() => setOpen(false)}>Mitra</a>
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

function PartnerLogo({ partner }: { partner: EventPartner }) {
  const content = partner.logoUrl
    ? <img src={partner.logoUrl} alt={`Logo ${partner.name}`} loading="lazy" />
    : <span className="partner-placeholder"><Handshake size={22} /><b>{partner.name}</b><small>Logo mitra</small></span>;
  return partner.websiteUrl
    ? <a className={`partner-logo partner-tier-${partner.tier}`} href={partner.websiteUrl} target="_blank" rel="noreferrer">{content}</a>
    : <div className={`partner-logo partner-tier-${partner.tier}`}>{content}</div>;
}

function PartnerShowcase() {
  const [partners] = usePartners();
  const tiers: PartnerTier[] = ["utama", "pendukung", "komunitas", "media"];
  return <section className="partner-section" id="mitra">
    <div className="section">
      <div className="section-heading partner-heading"><div><p className="kicker dark">Bertumbuh bersama</p><h2>Mitra di balik <em>INEFEST 4.0.</em></h2></div><p>Dukungan yang mempertemukan talenta informatika dengan ekosistem industri, komunitas, dan media.</p></div>
      <div className="partner-tiers">{tiers.map((tier) => {
        const items = partners.filter((partner) => partner.active && partner.tier === tier).sort((a, b) => a.order - b.order);
        if (!items.length) return null;
        return <section className={`partner-tier-block partner-block-${tier}`} key={tier}><div className="partner-tier-title"><span>{partnerTierLabels[tier]}</span><i /></div><div className="partner-logo-grid">{items.map((partner) => <PartnerLogo partner={partner} key={partner.id} />)}</div></section>;
      })}</div>
      <div className="partner-invite"><span>Ingin menjadi bagian dari ekosistem INEFEST?</span><a href="mailto:himatif@unirow.ac.id">Bicarakan kolaborasi <ArrowRight size={15} /></a></div>
    </div>
  </section>;
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
              <p className="kicker"><Sparkles size={15} /> HIMATIF mempersembahkan</p>
              <h1>INEFEST <em>4.0</em></h1>
              <p className="hero-subtitle">INFORMATICS ENGINEERING FESTIVAL</p>
              <p className="hero-lead">Festival teknologi, kreativitas, dan kompetisi dari Program Studi Teknik Informatika UNIROW untuk generasi yang siap membangun masa depan.</p>
              <div className="hero-actions">
                <Link className="button button-lime" to="/kompetisi">Jelajahi kompetisi <ArrowRight size={18} /></Link>
                <a className="inline-link" href="#cara-kerja"><span className="play-dot">▶</span> Lihat cara kerja</a>
              </div>
              <InstitutionIdentity />
            </div>
            <div className="hero-stage reveal delay-1"><HeroShowcase /></div>
          </div>
          <div className="hero-ticker"><span>INFORMATIKA</span><i>✦</i><span>INOVASI</span><i>✦</i><span>KOMPETISI</span><i>✦</i><span>KOLABORASI</span><i>✦</i><span>KREATIVITAS</span></div>
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

        <PartnerShowcase />

        <section className="cta-section" id="tentang">
          <div className="cta-card"><span className="cta-star">✦</span><p className="kicker">Informatics Engineering Festival</p><h2>Siap menjadi bagian<br />dari <em>INEFEST 4.0?</em></h2><Link className="button button-lime" to="/daftar">Mulai sekarang <ArrowRight size={18} /></Link></div>
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
      <div><Brand /><p>Informatics Engineering Festival oleh Prodi TI UNIROW, dilaksanakan HIMATIF.</p></div>
      <div><b>Jelajahi</b><Link to="/kompetisi">Kompetisi</Link><a href="#cara-kerja">Cara kerja</a></div>
      <div><b>Bantuan</b><a href="mailto:himatif@unirow.ac.id">Pusat bantuan</a><a href="mailto:himatif@unirow.ac.id">Hubungi panitia</a></div>
      <div className="footer-bottom"><button className="secret-admin-trigger" onClick={unlockAdmin} aria-label="Hak cipta INEFEST 4.0">© 2026 INEFEST 4.0 · HIMATIF UNIROW</button><span>Privasi · Ketentuan</span></div>
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
    try {
      const form = new FormData(event.currentTarget);
      const email = validateEmail(form.get("email"));
      const password = validatePassword(form.get("password"), register);
      const fullName = String(form.get("name") ?? "").replace(/[<>]/g, "").trim();
      if (register && (fullName.length < 2 || fullName.length > 100)) throw new Error("Nama lengkap harus 2–100 karakter.");
      if (!supabase) throw new Error("Layanan autentikasi belum dikonfigurasi.");
      const result = register ? await supabase.auth.signUp({ email, password, options: { data: { nama_lengkap: fullName } } }) : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      navigate("/kompetisi");
    } catch (submitError) {
      setMessage(publicError(submitError, "Akun tidak dapat diproses. Periksa kembali data Anda."));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-brand"><Brand /></div>
      <section className="auth-art"><div className="auth-art-copy"><span>✦</span><h2>Setiap pencapaian<br />dimulai dari satu<br /><em>keberanian.</em></h2><p>Temukan tantangan. Buktikan kemampuan.</p></div></section>
      <section className="auth-panel">
        <div className="auth-form-wrap"><p className="kicker dark">{register ? "Bergabung" : "Selamat datang kembali"}</p><h1>{register ? "Buat akun peserta." : "Masuk ke akunmu."}</h1><p>{register ? "Satu akun untuk seluruh kompetisi." : "Lanjutkan langkah yang sudah kamu mulai."}</p>
          <form onSubmit={handleSubmit} className="form-stack">
            {register && <label>Nama lengkap<input required name="name" autoComplete="name" placeholder="Nama sesuai identitas" /></label>}
            <label>Email<input required type="email" name="email" autoComplete="email" placeholder="nama@email.com" /></label>
            <label>Kata sandi<input required minLength={register ? 10 : 6} maxLength={128} type="password" name="password" autoComplete={register ? "new-password" : "current-password"} placeholder={register ? "Minimal 10 karakter, huruf + angka" : "Kata sandi akun"} /></label>
            {message && <div className="form-alert error">{message}</div>}
            {!isSupabaseConfigured && <div className="demo-hint">Layanan akun belum dikonfigurasi. Hubungi pengelola situs.</div>}
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
    try {
      const form = new FormData(event.currentTarget);
      const values = validateRegistration(form);
      const file = await validateFile(form.get("payment") as File, { maxBytes: 5 * 1_048_576, mime: ["application/pdf", "image/jpeg", "image/png"], extensions: [".pdf", ".jpg", ".jpeg", ".png"] }, competition.fee > 0);
      if (!supabase) throw new Error("Layanan pendaftaran belum dikonfigurasi.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/masuk"); return; }
      let paymentPath: string | null = null;
      if (file) {
        paymentPath = `${user.id}/${crypto.randomUUID()}-${safeFilename(file.name)}`;
        const { error: uploadError } = await supabase.storage.from("bukti-bayar").upload(paymentPath, file, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
      }
      const { error: insertError } = await supabase.from("pendaftaran").insert({ id_user: user.id, id_kompetisi: competition.id, nama_tim: values.team, nama_ketua: values.leader, instansi: values.institution, no_whatsapp: values.whatsapp, bukti_bayar_path: paymentPath });
      if (insertError) throw insertError;
      setDone(true);
    } catch (submitError) {
      setError(publicError(submitError, "Pendaftaran gagal dikirim. Pastikan kuota tersedia dan data belum pernah didaftarkan."));
    } finally {
      setLoading(false);
    }
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
    if (!supabase) { setError("Portal admin dinonaktifkan karena koneksi Supabase belum dikonfigurasi."); setLoading(false); return; }
    try {
      const form = new FormData(event.currentTarget);
      const email = validateEmail(form.get("email"));
      const password = validatePassword(form.get("password"));
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError || !data.user) throw loginError;
      const { data: admin } = await supabase.from("admin_users").select("user_id, is_active").eq("user_id", data.user.id).eq("is_active", true).maybeSingle();
      if (!admin) { await supabase.auth.signOut(); throw new Error("Akun ini tidak memiliki izin admin."); }
      await supabase.rpc("record_admin_login");
      navigate("/admin");
    } catch {
      setError("Email, kata sandi, atau izin admin tidak valid.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="admin-login-page"><div className="admin-login-card"><Brand admin /><div className="security-seal"><ShieldCheck size={28} /></div><p className="kicker">Portal aman</p><h1>Masuk sebagai<br />administrator.</h1><p>Area ini khusus panitia berwenang. Seluruh aktivitas masuk dicatat.</p><form className="form-stack" onSubmit={submit}><label>Email admin<input required type="email" name="email" autoComplete="username" placeholder="admin@organisasi.id" /></label><label>Kata sandi<input required type="password" name="password" autoComplete="current-password" placeholder="••••••••••••" /></label>{error && <div className="form-alert error">{error}</div>}{!isSupabaseConfigured && <div className="demo-hint dark-hint"><b>Fail closed</b> — akses admin terkunci sampai Supabase dikonfigurasi.</div>}<button className="button button-lime button-wide" disabled={loading || !isSupabaseConfigured}>{loading ? "Memverifikasi..." : "Masuk dengan aman"}<LockKeyhole size={16} /></button></form><div className="admin-security"><span><Check size={14} /> Role diverifikasi di database</span><span><Check size={14} /> Dilindungi Row Level Security</span></div><Link to="/" className="back-site">← Kembali ke situs peserta</Link></div></div>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");
  useEffect(() => {
    const verify = async () => {
      if (!supabase) { setState("denied"); return; }
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

type AdminView = "overview" | "registrations" | "competitions" | "hero" | "partners" | "activity";

function AdminDashboard() {
  const navigate = useNavigate(); const [view, setView] = useState<AdminView>("overview"); const [mobileNav, setMobileNav] = useState(false);
  const [rows, setRows] = useState(initialRegistrations); const [selected, setSelected] = useState<typeof rows[number] | null>(null); const [toast, setToast] = useState("");
  const [adminName, setAdminName] = useState("Admin INEFEST");
  const [participantCount, setParticipantCount] = useState(1284);
  const [activeCompetitionCount, setActiveCompetitionCount] = useState(competitions.length);
  const competitionItems = useCompetitions();
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const load = async () => {
      const [{ data }, participantResult, competitionResult, userResult] = await Promise.all([
        client.from("pendaftaran").select("id_pendaftaran,nama_tim,nama_ketua,no_whatsapp,instansi,created_at,status_verifikasi,bukti_bayar_path,catatan_admin,kompetisi(nama_kompetisi)").order("created_at", { ascending: false }),
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
          note: row.catatan_admin ?? "",
        };
      }));
    };
    void load();
  }, []);
  const updateStatus = async (id: string, status: "Approved" | "Rejected", note = "") => {
    if (supabase) {
      const numericId = Number(id.replace("REG-", ""));
      const { data: { user } } = await supabase.auth.getUser();
      const safeNote = note.replace(/[<>]/g, "").trim().slice(0, 1000);
      const { error: updateError } = await supabase.from("pendaftaran").update({ status_verifikasi: status, catatan_admin: safeNote || null, verified_by: user?.id, verified_at: new Date().toISOString() }).eq("id_pendaftaran", numericId);
      if (updateError) { setToast("Status gagal diperbarui. Silakan coba lagi."); setTimeout(() => setToast(""), 2800); return; }
    }
    setRows((current) => current.map((row) => row.id === id ? { ...row, status, note } : row)); setSelected(null); setToast(status === "Approved" ? "Pendaftaran berhasil disetujui." : "Pendaftaran ditolak dan catatan tersimpan."); setTimeout(() => setToast(""), 2800);
  };
  const deleteRegistration = async (id: string) => {
    if (!window.confirm(`Hapus permanen ${id}? Tindakan ini masuk ke audit log.`)) return;
    if (supabase) { const { error } = await supabase.from("pendaftaran").delete().eq("id_pendaftaran", Number(id.replace("REG-", ""))); if (error) { setToast("Pendaftaran gagal dihapus."); return; } }
    setRows((current) => current.filter((row) => row.id !== id)); setSelected(null); setToast("Pendaftaran berhasil dihapus."); setTimeout(() => setToast(""), 2800);
  };
  const logout = async () => { if (supabase) await supabase.auth.signOut(); navigate("/admin/login"); };
  const label = view === "overview" ? "Ringkasan" : view === "registrations" ? "Verifikasi Pendaftar" : view === "competitions" ? "Kelola Kompetisi" : view === "hero" ? "Tiga Hero" : view === "partners" ? "Sponsor & Media Partner" : "Log Aktivitas";
  return (
    <div className="admin-app">
      <aside className={mobileNav ? "admin-sidebar open" : "admin-sidebar"}><div className="sidebar-top"><Brand admin /><button onClick={() => setMobileNav(false)}><X /></button></div><nav>
        <button className={view === "overview" ? "active" : ""} onClick={() => { setView("overview"); setMobileNav(false); }}><LayoutDashboard size={19} /> Ringkasan</button>
        <button className={view === "registrations" ? "active" : ""} onClick={() => { setView("registrations"); setMobileNav(false); }}><FileCheck2 size={19} /> Verifikasi <span className="nav-count">{rows.filter((row) => row.status === "Pending").length}</span></button>
        <button className={view === "competitions" ? "active" : ""} onClick={() => { setView("competitions"); setMobileNav(false); }}><Trophy size={19} /> Kompetisi</button>
        <button className={view === "hero" ? "active" : ""} onClick={() => { setView("hero"); setMobileNav(false); }}><Image size={19} /> Tiga Hero</button>
        <button className={view === "partners" ? "active" : ""} onClick={() => { setView("partners"); setMobileNav(false); }}><Handshake size={19} /> Mitra Acara</button>
        <button className={view === "activity" ? "active" : ""} onClick={() => { setView("activity"); setMobileNav(false); }}><Activity size={19} /> Log Aktivitas</button>
      </nav><div className="sidebar-security"><ShieldCheck size={20} /><div><b>Akses terlindungi</b><small>Role: Super Admin</small></div></div><button className="logout-button" onClick={logout}><LogOut size={18} /> Keluar</button></aside>
      <main className="admin-main"><header className="admin-topbar"><button className="admin-menu" onClick={() => setMobileNav(true)}><Menu /></button><div><p>Dashboard / {label}</p><h1>{label}</h1></div><div className="admin-user"><button className="notification"><Bell size={19} /><span /></button><div className="user-avatar">{adminName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><div><b>{adminName}</b><small>Super Admin</small></div><ChevronDown size={16} /></div></header>
        {view === "overview" && <Overview rows={rows} competitions={competitionItems} adminName={adminName} participantCount={participantCount} activeCompetitionCount={activeCompetitionCount} openRegistrations={() => setView("registrations")} />}
        {view === "registrations" && <RegistrationsTable rows={rows} setSelected={setSelected} updateStatus={updateStatus} />}
        {view === "competitions" && <AdminCompetitions items={competitionItems} />}
        {view === "hero" && <HeroManager />}
        {view === "partners" && <PartnerManager />}
        {view === "activity" && <ActivityLog />}
      </main>
      {selected && <VerificationDrawer item={selected} close={() => setSelected(null)} updateStatus={updateStatus} deleteRegistration={deleteRegistration} />}
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
  const [filter, setFilter] = useState("Semua");
  const [query, setQuery] = useState("");
  const [competition, setCompetition] = useState("Semua");
  const competitionOptions = ["Semua", ...new Set(rows.map((row) => row.competition))];
  const shown = rows.filter((row) => {
    const matchesStatus = filter === "Semua" || row.status === filter;
    const matchesCompetition = competition === "Semua" || row.competition === competition;
    const haystack = `${row.id} ${row.team} ${row.leader} ${row.institution} ${row.whatsapp}`.toLowerCase();
    return matchesStatus && matchesCompetition && haystack.includes(query.toLowerCase().trim());
  });
  const exportCsv = () => {
    const safe = (value: string) => `"${(/^[=+\-@]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
    const csv = [["ID", "Tim", "Kompetisi", "Ketua", "Instansi", "WhatsApp", "Waktu", "Status"], ...shown.map((row) => [row.id, row.team, row.competition, row.leader, row.institution, row.whatsapp, row.submittedAt, row.status])].map((line) => line.map((cell) => safe(String(cell))).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `pendaftaran-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div className={compact ? "table-wrap compact" : "admin-content table-page"}>{!compact && <><div className="page-actions"><div className="admin-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} maxLength={100} placeholder="Cari tim, ID, ketua, WA..." /></div><label className="select-filter"><Filter size={16} /><select value={competition} onChange={(event) => setCompetition(event.target.value)}>{competitionOptions.map((item) => <option key={item}>{item}</option>)}</select></label><button className="secondary-button" onClick={exportCsv}><Download size={16} /> Ekspor {shown.length}</button></div><div className="status-tabs">{["Semua", "Pending", "Approved", "Rejected"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item} {item === "Semua" ? rows.length : rows.filter((row) => row.status === item).length}</button>)}</div></>}
  <div className="responsive-table"><table><thead><tr><th>ID / TIM</th><th>KOMPETISI</th><th>INSTANSI</th><th>WAKTU DAFTAR</th><th>STATUS</th><th>AKSI</th></tr></thead><tbody>{shown.map((row) => <tr key={row.id}><td><b>{row.team}</b><small>{row.id}</small></td><td>{row.competition}</td><td>{row.institution}</td><td>{row.submittedAt}</td><td><StatusBadge status={row.status} /></td><td>{row.status === "Pending" && updateStatus ? <div className="row-actions"><button className="approve-icon" onClick={() => updateStatus(row.id, "Approved")} title="Setujui"><Check size={16} /></button><button className="reject-icon" onClick={() => updateStatus(row.id, "Rejected")} title="Tolak"><X size={16} /></button><button onClick={() => setSelected?.(row)} title="Lihat detail"><Eye size={16} /></button></div> : <button className="detail-button" onClick={() => setSelected?.(row)}>Detail <ChevronRight size={15} /></button>}</td></tr>)}</tbody></table>{!shown.length && <div className="empty-table">Tidak ada pendaftaran yang cocok dengan filter.</div>}</div></div>;
}

type AdminCompetition = Competition & { deadlineIso?: string; backendStatus?: "draft" | "aktif" | "ditutup"; posterPath?: string | null };

function AdminCompetitions({ items }: { items: Competition[] }) {
  const [localItems, setLocalItems] = useState<AdminCompetition[]>(items);
  const [editing, setEditing] = useState<AdminCompetition | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!supabase) { setLocalItems(items); return; }
    const load = async () => {
      const { data } = await supabase!.from("kompetisi").select("id_kompetisi,nama_kompetisi,kategori,deskripsi,target_peserta,total_hadiah,biaya_pendaftaran,kuota_maksimal,deadline_pendaftaran,poster_path,status,pendaftaran(count)").order("created_at", { ascending: false });
      if (!data) return;
      const themes: Competition["theme"][] = ["cobalt", "lime", "coral", "ink"];
      setLocalItems(data.map((row, index) => ({
        id: row.id_kompetisi, code: row.kategori.slice(0, 4).toUpperCase(), name: row.nama_kompetisi, category: row.kategori, audience: row.target_peserta,
        description: row.deskripsi, deadline: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(row.deadline_pendaftaran)), deadlineIso: row.deadline_pendaftaran,
        prize: row.total_hadiah ?? "Belum diumumkan", fee: row.biaya_pendaftaran, quota: row.kuota_maksimal ?? 1, registered: Number((row.pendaftaran as unknown as { count: number }[])?.[0]?.count ?? 0),
        theme: themes[index % themes.length], status: row.status === "aktif" ? "Aktif" : row.status === "ditutup" ? "Ditutup" : "Segera", backendStatus: row.status, posterPath: row.poster_path,
      })));
    };
    void load();
  }, [items]);
  const close = () => { setOpen(false); setEditing(null); setError(""); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const form = new FormData(event.currentTarget);
      const values = validateCompetition(form);
      const poster = await validateFile(form.get("poster") as File, { maxBytes: 5 * 1_048_576, mime: ["image/jpeg", "image/png", "image/webp"], extensions: [".jpg", ".jpeg", ".png", ".webp"] });
      let posterPath = editing?.posterPath ?? null;
      let createdId = editing?.id ?? Date.now();
      if (supabase) {
        if (poster) {
          posterPath = `competition/${crypto.randomUUID()}-${safeFilename(poster.name)}`;
          const { error: uploadError } = await supabase.storage.from("posters").upload(posterPath, poster, { upsert: false });
          if (uploadError) throw uploadError;
        }
        const payload = { nama_kompetisi: values.name, kategori: values.category, deskripsi: values.description, target_peserta: values.audience, total_hadiah: values.prize, biaya_pendaftaran: values.fee, kuota_maksimal: values.quota, deadline_pendaftaran: values.deadlineIso, poster_path: posterPath, status: values.status };
        if (editing) {
          const { error: updateError } = await supabase.from("kompetisi").update(payload).eq("id_kompetisi", editing.id); if (updateError) throw updateError;
        } else {
          const { data, error: insertError } = await supabase.from("kompetisi").insert(payload).select("id_kompetisi").single(); if (insertError) throw insertError; createdId = data.id_kompetisi;
        }
      }
      const next: AdminCompetition = { id: createdId, code: values.category.slice(0, 4).toUpperCase(), name: values.name, category: values.category, audience: values.audience, description: values.description, deadline: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(values.deadlineIso)), deadlineIso: values.deadlineIso, prize: values.prize, fee: values.fee, quota: values.quota, registered: editing?.registered ?? 0, theme: editing?.theme ?? "cobalt", status: values.status === "aktif" ? "Aktif" : values.status === "ditutup" ? "Ditutup" : "Segera", backendStatus: values.status, posterPath };
      setLocalItems((current) => editing ? current.map((item) => item.id === editing.id ? next : item) : [next, ...current]);
      close();
    } catch (submitError) {
      setError(publicError(submitError, "Kompetisi gagal disimpan. Periksa kembali data dan izin admin."));
    } finally { setLoading(false); }
  };
  const remove = async (item: AdminCompetition) => {
    const confirmation = window.prompt(`Tindakan ini juga dapat menghapus pendaftaran terkait. Ketik nama lomba untuk menghapus:\n${item.name}`);
    if (confirmation !== item.name) return;
    if (supabase) { const { error: deleteError } = await supabase.from("kompetisi").delete().eq("id_kompetisi", item.id); if (deleteError) { setError("Kompetisi gagal dihapus."); return; } }
    setLocalItems((current) => current.filter((current) => current.id !== item.id));
  };
  return <div className="admin-content"><div className="page-actions competition-actions"><div><h2>Daftar kompetisi</h2><p>Tambah, edit, tutup, dan hapus lomba dari satu tempat.</p></div><button className="button button-dark" onClick={() => { setEditing(null); setOpen(true); }}>+ Tambah kompetisi</button></div>{error && !open && <div className="form-alert error">{error}</div>}<div className="admin-competition-grid">{localItems.map((item) => <article key={item.id}><Poster item={item} compact /><div><div className="card-meta"><span>{item.status}</span><span>{item.category}</span></div><h3>{item.name}</h3><p><CalendarDays size={15} /> Tutup {item.deadline}</p><div className="admin-card-progress"><span><i style={{ width: `${Math.min(100, (item.registered / item.quota) * 100)}%` }} /></span><small>{item.registered}/{item.quota} tim</small></div><div className="card-admin-actions"><button className="secondary-button" onClick={() => { setEditing(item); setOpen(true); }}><Pencil size={15} /> Edit</button><button className="danger-icon" onClick={() => void remove(item)}><Trash2 size={16} /> Hapus</button></div></div></article>)}</div>{open && <div className="drawer-backdrop" onMouseDown={close}><section className="competition-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><p>{editing ? "EDIT KOMPETISI" : "KOMPETISI BARU"}</p><h2>{editing ? "Perbarui informasi lomba." : "Publikasikan tantangan."}</h2></div><button onClick={close}><X /></button></header><form key={editing?.id ?? "new"} className="form-grid" onSubmit={submit}><label className="full">Nama kompetisi<input name="name" defaultValue={editing?.name} maxLength={140} required /></label><label>Kategori<input name="category" defaultValue={editing?.category} maxLength={80} required /></label><label>Target peserta<input name="audience" defaultValue={editing?.audience ?? "Umum"} maxLength={80} required /></label><label>Total hadiah<input name="prize" defaultValue={editing?.prize} maxLength={80} required /></label><label>Biaya pendaftaran<input name="fee" type="number" min="0" max="100000000" defaultValue={editing?.fee ?? 0} required /></label><label>Kuota tim<input name="quota" type="number" min="1" max="100000" defaultValue={editing?.quota} required /></label><label>Batas pendaftaran<input name="deadline" type="datetime-local" defaultValue={editing?.deadlineIso ? new Date(editing.deadlineIso).toISOString().slice(0, 16) : ""} required /></label><label>Status<select name="status" defaultValue={editing?.backendStatus ?? "aktif"}><option value="draft">Draft</option><option value="aktif">Aktif</option><option value="ditutup">Ditutup</option></select></label><label className="full">Deskripsi<textarea name="description" defaultValue={editing?.description} minLength={20} maxLength={2000} required /></label><label className="full">Poster opsional<input name="poster" type="file" accept=".jpg,.jpeg,.png,.webp" /></label>{error && <div className="form-alert error full">{error}</div>}<button className="button button-dark button-wide full" disabled={loading}>{loading ? "Menyimpan..." : editing ? "Simpan perubahan" : "Publikasikan kompetisi"}</button></form></section></div>}</div>;
}

function HeroManager() {
  const [slides, setSlides] = useHeroSlides(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const save = async (event: FormEvent<HTMLFormElement>, slot: number) => {
    event.preventDefault(); setSaving(slot); setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const title = String(form.get("title") ?? "").replace(/[<>]/g, "").trim();
      const subtitle = String(form.get("subtitle") ?? "").replace(/[<>]/g, "").trim();
      const ctaLabel = String(form.get("ctaLabel") ?? "").replace(/[<>]/g, "").trim();
      const ctaUrl = String(form.get("ctaUrl") ?? "").trim();
      if (title.length < 3 || title.length > 120 || subtitle.length < 5 || subtitle.length > 300 || ctaLabel.length < 2 || ctaLabel.length > 40) throw new Error("Isi hero belum memenuhi panjang yang diizinkan.");
      if (!/^#\/[a-z0-9\-/?=&]*$/i.test(ctaUrl)) throw new Error("Tautan hero harus berupa rute internal, contoh #/kompetisi.");
      const image = await validateFile(form.get("image") as File, { maxBytes: 5 * 1_048_576, mime: ["image/jpeg", "image/png", "image/webp"], extensions: [".jpg", ".jpeg", ".png", ".webp"] });
      const current = slides.find((item) => item.slot === slot) ?? defaultHeroes[slot - 1];
      let imagePath = current.imagePath;
      if (supabase && image) {
        imagePath = `slot-${slot}/${crypto.randomUUID()}-${safeFilename(image.name)}`;
        const { error: uploadError } = await supabase.storage.from("hero-media").upload(imagePath, image, { upsert: false });
        if (uploadError) throw uploadError;
      }
      const active = form.get("active") === "on";
      if (supabase) {
        const { data, error: saveError } = await supabase.from("hero_slides").upsert({ slot_number: slot, title, subtitle, image_path: imagePath, cta_label: ctaLabel, cta_url: ctaUrl, is_active: active }, { onConflict: "slot_number" }).select("id_hero").single();
        if (saveError) throw saveError;
        current.id = data.id_hero;
      }
      const imageUrl = imagePath && supabase ? supabase.storage.from("hero-media").getPublicUrl(imagePath).data.publicUrl : current.imageUrl;
      setSlides((all) => [...all.filter((item) => item.slot !== slot), { ...current, title, subtitle, ctaLabel, ctaUrl, active, imagePath, imageUrl }].sort((a, b) => a.slot - b.slot));
      setMessage(`Hero ${slot} berhasil disimpan.`);
    } catch (saveError) {
      setMessage(publicError(saveError, "Hero gagal disimpan. Periksa format gambar dan izin admin."));
    } finally { setSaving(null); }
  };
  return <div className="admin-content"><div className="page-actions competition-actions"><div><h2>Tiga slot hero</h2><p>Unggah logo atau foto, ubah pesan, lalu aktifkan sesuai kebutuhan.</p></div></div>{message && <div className="form-alert">{message}</div>}<div className="hero-admin-grid">{[1, 2, 3].map((slot) => { const item = slides.find((slide) => slide.slot === slot) ?? defaultHeroes[slot - 1]; return <form className="hero-admin-card" key={`${slot}-${item.id}`} onSubmit={(event) => void save(event, slot)}><div className="hero-admin-preview" style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}>{!item.imageUrl && <><Image /><span>Hero {slot}</span></>}<b>0{slot}</b></div><label>Judul<input name="title" defaultValue={item.title} maxLength={120} required /></label><label>Deskripsi<textarea name="subtitle" defaultValue={item.subtitle} maxLength={300} required /></label><div className="two-fields"><label>Teks tombol<input name="ctaLabel" defaultValue={item.ctaLabel} maxLength={40} required /></label><label>Rute<input name="ctaUrl" defaultValue={item.ctaUrl} required /></label></div><label>Logo / foto<input name="image" type="file" accept=".jpg,.jpeg,.png,.webp" /></label><label className="checkbox"><input name="active" type="checkbox" defaultChecked={item.active} /><span>Tampilkan hero ini</span></label><button className="button button-dark button-wide" disabled={saving === slot}>{saving === slot ? "Menyimpan..." : `Simpan hero ${slot}`}</button></form>; })}</div></div>;
}

function PartnerManager() {
  const [partners, setPartners] = usePartners(true);
  const [editing, setEditing] = useState<EventPartner | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const tiers: PartnerTier[] = ["utama", "pendukung", "komunitas", "media"];
  const close = () => { setOpen(false); setEditing(null); setMessage(""); };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
      const form = new FormData(event.currentTarget);
      const name = String(form.get("name") ?? "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
      const tier = String(form.get("tier") ?? "") as PartnerTier;
      const websiteRaw = String(form.get("websiteUrl") ?? "").trim();
      const order = Number(form.get("order"));
      if (name.length < 2 || name.length > 100) throw new Error("Nama mitra harus 2–100 karakter.");
      if (!tiers.includes(tier)) throw new Error("Kelas mitra tidak valid.");
      if (!Number.isInteger(order) || order < 0 || order > 999) throw new Error("Urutan harus berupa angka 0–999.");
      let websiteUrl: string | null = null;
      if (websiteRaw) {
        const parsed = new URL(websiteRaw);
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("Alamat situs harus memakai http atau https.");
        websiteUrl = parsed.toString();
      }
      const image = await validateFile(form.get("logo") as File, { maxBytes: 3 * 1_048_576, mime: ["image/jpeg", "image/png", "image/webp"], extensions: [".jpg", ".jpeg", ".png", ".webp"] }, !editing);
      let logoPath = editing?.logoPath ?? null;
      if (image) {
        const nextPath = `${tier}/${crypto.randomUUID()}-${safeFilename(image.name)}`;
        const { error: uploadError } = await supabase.storage.from("partner-media").upload(nextPath, image, { upsert: false });
        if (uploadError) throw uploadError;
        logoPath = nextPath;
      }
      const payload = { name, tier, logo_path: logoPath, website_url: websiteUrl, sort_order: order, is_active: form.get("active") === "on" };
      const query = editing
        ? supabase.from("event_partners").update(payload).eq("id_partner", editing.id)
        : supabase.from("event_partners").insert(payload);
      const { data, error } = await query.select("id_partner").single();
      if (error) throw error;
      if (image && editing?.logoPath && editing.logoPath !== logoPath) await supabase.storage.from("partner-media").remove([editing.logoPath]);
      const saved: EventPartner = { id: data.id_partner, name, tier, logoPath, logoUrl: logoPath ? supabase.storage.from("partner-media").getPublicUrl(logoPath).data.publicUrl : null, websiteUrl, order, active: payload.is_active };
      setPartners((current) => [...current.filter((item) => item.id !== saved.id && item.id > 0), saved].sort((a, b) => a.order - b.order));
      close();
    } catch (error) {
      setMessage(publicError(error, error instanceof Error ? error.message : "Mitra gagal disimpan."));
    } finally { setSaving(false); }
  };
  const remove = async (partner: EventPartner) => {
    if (!supabase || partner.id < 1 || !window.confirm(`Hapus ${partner.name} dari daftar mitra?`)) return;
    const { error } = await supabase.from("event_partners").delete().eq("id_partner", partner.id);
    if (error) { setMessage("Mitra gagal dihapus."); return; }
    if (partner.logoPath) await supabase.storage.from("partner-media").remove([partner.logoPath]);
    setPartners((current) => current.filter((item) => item.id !== partner.id));
  };
  return <div className="admin-content partner-admin"><div className="page-actions competition-actions"><div><h2>Sponsor & media partner</h2><p>Kelola logo, kelas, urutan tampil, tautan, dan status setiap mitra INEFEST.</p></div><button className="button button-dark" onClick={() => { setEditing(null); setOpen(true); }}>+ Tambah mitra</button></div>{message && !open && <div className="form-alert error">{message}</div>}<div className="partner-admin-summary">{tiers.map((tier) => <div key={tier}><b>{partners.filter((partner) => partner.id > 0 && partner.tier === tier).length}</b><span>{partnerTierLabels[tier]}</span></div>)}</div><div className="partner-admin-groups">{tiers.map((tier) => <section key={tier}><header><h3>{partnerTierLabels[tier]}</h3><span>{partners.filter((partner) => partner.id > 0 && partner.tier === tier && partner.active).length} aktif</span></header><div className="partner-admin-grid">{partners.filter((partner) => partner.id > 0 && partner.tier === tier).sort((a, b) => a.order - b.order).map((partner) => <article key={partner.id} className={partner.active ? "" : "inactive"}><div className="partner-admin-logo">{partner.logoUrl ? <img src={partner.logoUrl} alt={`Logo ${partner.name}`} /> : <Handshake />}</div><div><b>{partner.name}</b><small>Urutan {partner.order} · {partner.active ? "Ditampilkan" : "Disembunyikan"}</small></div><button className="secondary-button" onClick={() => { setEditing(partner); setOpen(true); }}><Pencil size={14} /> Edit</button><button className="danger-icon" onClick={() => void remove(partner)}><Trash2 size={15} /></button></article>)}{!partners.some((partner) => partner.id > 0 && partner.tier === tier) && <div className="empty-partner-group">Belum ada mitra di kelas ini.</div>}</div></section>)}</div>{open && <div className="drawer-backdrop" onMouseDown={close}><section className="competition-modal partner-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><p>{editing ? "EDIT MITRA" : "MITRA BARU"}</p><h2>{editing ? "Perbarui tampilan mitra." : "Tambahkan kolaborator INEFEST."}</h2></div><button onClick={close}><X /></button></header><form key={editing?.id ?? "new"} className="form-grid" onSubmit={(event) => void save(event)}><label className="full">Nama mitra<input name="name" defaultValue={editing?.name} minLength={2} maxLength={100} required /></label><label>Kelas<select name="tier" defaultValue={editing?.tier ?? "pendukung"}>{tiers.map((tier) => <option key={tier} value={tier}>{partnerTierLabels[tier]}</option>)}</select></label><label>Urutan tampil<input name="order" type="number" min="0" max="999" defaultValue={editing?.order ?? 10} required /></label><label className="full">Situs mitra (opsional)<input name="websiteUrl" type="url" defaultValue={editing?.websiteUrl ?? ""} placeholder="https://..." maxLength={300} /></label><label className="full">Logo {editing ? "pengganti (opsional)" : "mitra"}<input name="logo" type="file" accept=".jpg,.jpeg,.png,.webp" required={!editing} /><small>JPG, PNG, atau WebP · maksimal 3 MB</small></label><label className="checkbox full"><input name="active" type="checkbox" defaultChecked={editing?.active ?? true} /><span>Tampilkan pada halaman publik</span></label>{message && <div className="form-alert error full">{message}</div>}<button className="button button-dark button-wide full" disabled={saving}>{saving ? "Menyimpan..." : "Simpan mitra"}</button></form></section></div>}</div>;
}

type AuditEntry = { id_log: number; action: string; entity_type: string; entity_id: string | null; metadata: Record<string, string>; created_at: string };

function ActivityLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const load = async (nextPage: number, reset = false) => {
    if (!supabase) return;
    setLoading(true);
    const start = nextPage * 100;
    const { data } = await supabase.from("audit_logs").select("id_log,action,entity_type,entity_id,metadata,created_at").order("created_at", { ascending: false }).range(start, start + 99);
    const rows = (data ?? []) as AuditEntry[];
    setEntries((current) => reset ? rows : [...current, ...rows]); setHasMore(rows.length === 100); setPage(nextPage); setLoading(false);
  };
  useEffect(() => { if (supabase) void load(0, true); }, []);
  const shown = entries.filter((entry) => `${entry.action} ${entry.entity_type} ${entry.entity_id ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const labels: Record<string, string> = { CREATE: "Dibuat", UPDATE: "Diperbarui", DELETE: "Dihapus", REGISTER: "Pendaftaran masuk", VERIFY: "Status diverifikasi", LOGIN: "Admin masuk" };
  return <div className="admin-content"><div className="page-actions competition-actions"><div><h2>Monitoring aktivitas</h2><p>Jejak tambah, ubah, hapus, login admin, dan verifikasi pendaftaran.</p></div><div className="admin-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari aksi atau ID..." /></div></div><div className="activity-list">{shown.map((entry) => <article key={entry.id_log}><span className={`activity-icon action-${entry.action.toLowerCase()}`}><Activity size={17} /></span><div><b>{labels[entry.action] ?? entry.action}</b><p>{entry.entity_type} {entry.entity_id ? `#${entry.entity_id}` : ""}</p></div><time>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.created_at))}</time></article>)}{!shown.length && <div className="empty-table">Belum ada aktivitas yang tercatat.</div>}</div>{hasMore && <button className="secondary-button activity-more" disabled={loading} onClick={() => void load(page + 1)}>{loading ? "Memuat..." : "Muat aktivitas berikutnya"}</button>}</div>;
}

function VerificationDrawer({ item, close, updateStatus, deleteRegistration }: { item: typeof initialRegistrations[number]; close: () => void; updateStatus: (id: string, status: "Approved" | "Rejected", note?: string) => void; deleteRegistration: (id: string) => void }) {
  const [note, setNote] = useState(item.note ?? "");
  const openPayment = async () => {
    if (!supabase || item.payment === "Tidak ada file") { window.alert("File demo tidak tersedia."); return; }
    const { data, error } = await supabase.storage.from("bukti-bayar").createSignedUrl(item.payment, 60);
    if (error || !data?.signedUrl) { window.alert("Berkas tidak dapat dibuka."); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };
  return <div className="drawer-backdrop" onMouseDown={close}><aside className="verification-drawer" onMouseDown={(e) => e.stopPropagation()}><header><div><p>DETAIL PENDAFTARAN</p><h2>{item.id}</h2></div><button onClick={close}><X /></button></header><div className="drawer-body"><div className="team-heading"><div className="team-avatar">{item.team.slice(0, 2).toUpperCase()}</div><div><h3>{item.team}</h3><p>{item.institution}</p></div><StatusBadge status={item.status} /></div><section><h4>Informasi pendaftaran</h4><dl><div><dt>Kompetisi</dt><dd>{item.competition}</dd></div><div><dt>Ketua tim</dt><dd>{item.leader}</dd></div><div><dt>No. WhatsApp</dt><dd>{item.whatsapp}</dd></div><div><dt>Waktu daftar</dt><dd>{item.submittedAt}</dd></div></dl></section><section><h4>Bukti pembayaran</h4><div className="document-preview"><FileText size={26} /><div><b>{item.payment}</b><small>Berkas privat</small></div><button onClick={openPayment}><Eye size={17} /> Lihat file</button></div><p className="file-warning"><ShieldCheck size={15} /> File hanya dapat dibuka oleh admin terverifikasi melalui signed URL 60 detik.</p></section><section className="review-note"><h4>Catatan verifikasi</h4><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} placeholder="Tambahkan alasan atau catatan untuk peserta" /><small>{note.length}/1000 karakter</small></section><button className="drawer-delete" onClick={() => deleteRegistration(item.id)}><Trash2 size={15} /> Hapus pendaftaran</button></div><footer><button className="reject-button" onClick={() => updateStatus(item.id, "Rejected", note)}><XCircle size={17} /> Tolak</button><button className="approve-button" onClick={() => updateStatus(item.id, "Approved", note)}><BadgeCheck size={17} /> {item.status === "Pending" ? "Setujui pendaftaran" : "Simpan & setujui"}</button></footer></aside></div>;
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

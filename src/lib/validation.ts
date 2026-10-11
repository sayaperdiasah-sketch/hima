export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const clean = (value: FormDataEntryValue | null) =>
  String(value ?? "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();

const requireLength = (label: string, value: string, min: number, max: number) => {
  if (value.length < min || value.length > max) {
    throw new ValidationError(`${label} harus ${min}–${max} karakter.`);
  }
  return value;
};

export function validateEmail(value: FormDataEntryValue | null) {
  const email = clean(value).toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new ValidationError("Masukkan alamat email yang valid.");
  }
  return email;
}

export function validatePassword(value: FormDataEntryValue | null, strict = false) {
  const password = String(value ?? "");
  if (password.length < (strict ? 10 : 6) || password.length > 128) {
    throw new ValidationError(strict ? "Kata sandi minimal 10 karakter." : "Kata sandi tidak valid.");
  }
  if (strict && !/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    throw new ValidationError("Kata sandi harus memuat huruf dan angka.");
  }
  return password;
}

export function validateWhatsapp(value: FormDataEntryValue | null) {
  let phone = clean(value).replace(/[\s().-]/g, "");
  if (phone.startsWith("+62")) phone = `0${phone.slice(3)}`;
  if (phone.startsWith("62")) phone = `0${phone.slice(2)}`;
  if (!/^08\d{8,12}$/.test(phone)) {
    throw new ValidationError("Nomor WhatsApp harus berupa nomor Indonesia yang valid.");
  }
  return phone;
}

export function validateWhatsappGroupUrl(value: FormDataEntryValue | null) {
  const rawUrl = clean(value);
  if (!rawUrl) return null;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ValidationError("Tautan grup WhatsApp tidak valid.");
  }
  if (url.protocol !== "https:" || url.hostname !== "chat.whatsapp.com" || url.username || url.password || url.port || !/^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) {
    throw new ValidationError("Gunakan tautan undangan https://chat.whatsapp.com yang valid.");
  }
  return url.toString();
}

export function validateRegistration(form: FormData, memberCount = 1, individual = false) {
  const leader = {
    nama_lengkap: requireLength("Nama ketua", clean(form.get("leader")), 2, 100),
    email: validateEmail(form.get("leaderEmail")),
    no_whatsapp: validateWhatsapp(form.get("whatsapp")),
    instansi: requireLength("Instansi", clean(form.get("institution")), 2, 140),
  };
  if (!Number.isInteger(memberCount) || memberCount < 1 || memberCount > 20) {
    throw new ValidationError("Jumlah anggota tidak valid.");
  }

  const members = [leader];
  for (let index = 1; index < memberCount; index += 1) {
    members.push({
      nama_lengkap: requireLength(`Nama anggota ${index + 1}`, clean(form.get(`member-${index}-name`)), 2, 100),
      email: validateEmail(form.get(`member-${index}-email`)),
      no_whatsapp: validateWhatsapp(form.get(`member-${index}-whatsapp`)),
      instansi: requireLength(`Instansi anggota ${index + 1}`, clean(form.get(`member-${index}-institution`)), 2, 140),
    });
  }

  return {
    team: individual
      ? `Individu - ${leader.nama_lengkap}`.slice(0, 80)
      : requireLength("Nama tim", clean(form.get("team")), 2, 80),
    leader: leader.nama_lengkap,
    leaderEmail: leader.email,
    institution: leader.instansi,
    whatsapp: leader.no_whatsapp,
    members,
  };
}

export function validateCompetition(form: FormData) {
  const fee = Number(form.get("fee"));
  const quota = Number(form.get("quota"));
  const deadline = new Date(String(form.get("deadline") ?? ""));
  const status = clean(form.get("status")) || "aktif";
  const jenisPeserta = clean(form.get("jenisPeserta")) || "individu";
  const minAnggota = Number(form.get("minAnggota") ?? 1);
  const maxAnggota = Number(form.get("maxAnggota") ?? 1);
  const whatsappRaw = clean(form.get("whatsappGroupUrl"));

  if (!Number.isInteger(fee) || fee < 0 || fee > 100_000_000) throw new ValidationError("Biaya pendaftaran tidak valid.");
  if (!Number.isInteger(quota) || quota < 1 || quota > 100_000) throw new ValidationError("Kuota harus 1–100.000 tim.");
  if (Number.isNaN(deadline.getTime()) || deadline.getTime() <= Date.now()) throw new ValidationError("Batas pendaftaran harus di masa depan.");
  if (!["draft", "aktif", "ditutup"].includes(status)) throw new ValidationError("Status kompetisi tidak valid.");
  if (!["individu", "kelompok"].includes(jenisPeserta)) throw new ValidationError("Jenis peserta tidak valid.");

  if (jenisPeserta === "kelompok") {
    if (!Number.isInteger(minAnggota) || minAnggota < 2 || minAnggota > 20) {
      throw new ValidationError("Jumlah anggota minimum harus 2–20 orang.");
    }
    if (!Number.isInteger(maxAnggota) || maxAnggota < 2 || maxAnggota > 20) {
      throw new ValidationError("Jumlah anggota maksimum harus 2–20 orang.");
    }
    if (minAnggota > maxAnggota) {
      throw new ValidationError("Jumlah anggota minimum tidak boleh melebihi maksimum.");
    }
  }

  // Validasi URL grup WhatsApp (opsional, tapi kalau diisi harus valid)
  let whatsappGroupUrl: string | null = null;
  if (whatsappRaw) {
    if (!/^https?:\/\//.test(whatsappRaw)) {
      throw new ValidationError("URL grup WhatsApp harus dimulai dengan http:// atau https://");
    }
    if (whatsappRaw.length > 500) {
      throw new ValidationError("URL grup WhatsApp terlalu panjang (maks 500 karakter).");
    }
    whatsappGroupUrl = whatsappRaw;
  }

  return {
    name: requireLength("Nama kompetisi", clean(form.get("name")), 3, 140),
    category: requireLength("Kategori", clean(form.get("category")), 2, 80),
    audience: requireLength("Target peserta", clean(form.get("audience")), 2, 80),
    prize: requireLength("Total hadiah", clean(form.get("prize")), 2, 80),
    description: requireLength("Deskripsi", clean(form.get("description")), 20, 2_000),
    fee,
    quota,
    deadlineIso: deadline.toISOString(),
    status: status as "draft" | "aktif" | "ditutup",
    jenisPeserta: jenisPeserta as "individu" | "kelompok",
    minAnggota: jenisPeserta === "kelompok" ? minAnggota : 1,
    maxAnggota: jenisPeserta === "kelompok" ? maxAnggota : 1,
    whatsappGroupUrl,
  };
}

export function safeFilename(name: string) {
  const cleaned = name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return cleaned.slice(-100) || "file";
}

type FileRule = { maxBytes: number; mime: string[]; extensions: string[] };

const signatures: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

export async function validateFile(file: File | null, rule: FileRule, required = false) {
  if (!file || !file.size) {
    if (required) throw new ValidationError("Berkas wajib diunggah.");
    return null;
  }
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (file.size > rule.maxBytes) throw new ValidationError(`Ukuran berkas maksimal ${Math.round(rule.maxBytes / 1_048_576)} MB.`);
  if (!rule.mime.includes(file.type) || !rule.extensions.includes(extension)) throw new ValidationError("Jenis berkas tidak diizinkan.");
  const expected = signatures[file.type];
  if (expected) {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const valid = expected.some((signature) => signature.every((byte, index) => bytes[index] === byte));
    if (!valid) throw new ValidationError("Isi berkas tidak sesuai dengan formatnya.");
  }
  return file;
}

export function publicError(error: unknown, fallback: string) {
  if (error instanceof ValidationError) return error.message;
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const authMessages: Record<string, string> = {
    email_not_confirmed: "Email belum dikonfirmasi. Buka tautan konfirmasi di email sebelum masuk.",
    invalid_credentials: "Email atau kata sandi salah. Periksa kembali, atau gunakan reset kata sandi.",
    weak_password: "Kata sandi terlalu mudah. Gunakan minimal 10 karakter yang mengandung huruf dan angka.",
    over_email_send_rate_limit: "Terlalu banyak email dikirim. Tunggu beberapa saat sebelum mencoba lagi.",
    over_request_rate_limit: "Terlalu banyak percobaan. Tunggu beberapa saat sebelum mencoba lagi.",
    signup_disabled: "Pendaftaran akun sedang dinonaktifkan. Hubungi panitia.",
    redirect_to_not_allowed: "Alamat kembali dari email belum diizinkan. Panitia perlu menambahkan domain situs ke URL Configuration Supabase.",
  };
  if (authMessages[code]) return authMessages[code];
  if (code === "23505") return "Data yang sama sudah terdaftar.";
  if (code === "42501") return "Anda tidak memiliki izin untuk tindakan ini.";
  return fallback;
}

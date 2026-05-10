export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    role: 'admin' | 'staff' | 'kepala_desa' | 'warga';
    status: 'aktif' | 'nonaktif' | 'menunggu_verifikasi';
    nik?: string | null;
    phone?: string | null;
    wilayah_id?: number | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

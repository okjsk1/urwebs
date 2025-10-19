import { z } from "zod";

export const systemSettingsSchema = z.object({
  siteName: z.string().min(2, "사이트 이름은 최소 2자 이상이어야 합니다").max(50, "사이트 이름은 50자를 초과할 수 없습니다"),
  siteDescription: z.string().max(200, "사이트 설명은 200자를 초과할 수 없습니다"),
  siteUrl: z.string().url("올바른 URL 형식이 아닙니다"),
  adminEmail: z.string().email("올바른 이메일 형식이 아닙니다"),
  supportEmail: z.string().email("올바른 이메일 형식이 아닙니다"),
  maxUsers: z.coerce.number().int("정수만 입력 가능합니다").min(1, "최소 1명 이상이어야 합니다").max(1_000_000, "최대 1,000,000명까지 가능합니다"),
  maxPagesPerUser: z.coerce.number().int("정수만 입력 가능합니다").min(1, "최소 1페이지 이상이어야 합니다").max(1000, "최대 1000페이지까지 가능합니다"),
  maxWidgetsPerPage: z.coerce.number().int("정수만 입력 가능합니다").min(1, "최소 1개 이상이어야 합니다").max(200, "최대 200개까지 가능합니다"),
  allowRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  enableNotifications: z.boolean(),
  defaultTheme: z.enum(["light", "dark", "auto"]),
  maintenanceMode: z.boolean(),
  analyticsEnabled: z.boolean(),
  backupEnabled: z.boolean(),
  backupFrequency: z.enum(["daily", "weekly", "monthly"]),
});

export type SystemSettings = z.infer<typeof systemSettingsSchema>;

export const DEFAULT_SETTINGS: SystemSettings = {
  siteName: "Urwebs",
  siteDescription: "개인화된 대시보드 플랫폼",
  siteUrl: "https://urwebs.com",
  adminEmail: "admin@urwebs.com",
  supportEmail: "support@urwebs.com",
  maxUsers: 1000,
  maxPagesPerUser: 10,
  maxWidgetsPerPage: 50,
  allowRegistration: true,
  requireEmailVerification: false,
  enableNotifications: true,
  defaultTheme: "auto",
  maintenanceMode: false,
  analyticsEnabled: false,
  backupEnabled: true,
  backupFrequency: "daily",
};
<<<<<<< HEAD
=======


>>>>>>> f18eacae9db3a659b475638dca7b7d0b0ae30bd6

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { 
  RefreshCw, 
  Save, 
  CheckCircle, 
  Database, 
  Globe, 
  Mail, 
  Users, 
  Shield, 
  Bell, 
  Palette, 
  Key, 
  AlertTriangle 
} from "lucide-react";
import { useSystemSettings } from "../../hooks/useSystemSettings";
import { systemSettingsSchema, SystemSettings } from "../../types/system-settings";

export function SystemSettingsTab() {
  const { data, loading, error, save, isAdmin } = useSystemSettings();

  const { 
    register, 
    handleSubmit, 
    reset, 
    watch, 
    formState: { errors, isDirty, isSubmitting, isSubmitSuccessful } 
  } = useForm<SystemSettings>({ 
    resolver: zodResolver(systemSettingsSchema) as any, 
    defaultValues: data 
  });

  // 외부 데이터 들어오면 폼 리셋
  useEffect(() => { 
    reset(data); 
  }, [data, reset]);

  // 이탈 방지
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { 
        e.preventDefault(); 
        e.returnValue = ""; 
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const onSubmit = async (values: any) => {
    try {
      await save(values as SystemSettings);
      toast.success("설정이 저장되었습니다.");
    } catch (e: any) {
      toast.error(e?.message === "NOT_AUTHORIZED" ? "권한이 없습니다." : "저장 중 오류가 발생했습니다.");
    }
  };

  const backupEnabled = watch("backupEnabled");
  const maintenanceMode = watch("maintenanceMode");

  // 관리자 권한 확인
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h2>
          <p>시스템 설정을 변경하려면 관리자 권한이 필요합니다.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* 헤더 */}
        <Card className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">시스템 설정</h2>
            <p className="text-gray-600 dark:text-gray-400">사이트 설정 및 시스템 구성</p>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => reset()} 
              disabled={!isDirty || isSubmitting}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> 변경 취소
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </Card>

        {/* 에러 표시 */}
        {error && (
          <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </Card>
        )}

        {/* 로딩 스켈레톤 */}
        {loading ? (
          <Card className="p-6 animate-pulse text-sm text-gray-500 dark:text-gray-400">
            설정 불러오는 중…
          </Card>
        ) : (
          <>
            {/* 상태 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">시스템 상태</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">정상</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </Card>
              <Card className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">유지보수 모드</p>
                  <p className="text-lg font-semibold">{maintenanceMode ? "활성" : "비활성"}</p>
                </div>
                {maintenanceMode ? <AlertTriangle className="w-8 h-8 text-orange-500" /> : <CheckCircle className="w-8 h-8 text-green-500" />}
              </Card>
              <Card className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">백업 상태</p>
                  <p className="text-lg font-semibold">{backupEnabled ? "활성" : "비활성"}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </Card>
            </div>

            {/* 기본 설정 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" /> 기본 설정
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">사이트 이름</label>
                  <input 
                    {...register("siteName")} 
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600" 
                  />
                  {errors.siteName && <p className="text-xs text-red-500 mt-1">{errors.siteName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">사이트 URL</label>
                  <input 
                    type="url" 
                    {...register("siteUrl")} 
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600" 
                  />
                  {errors.siteUrl && <p className="text-xs text-red-500 mt-1">{errors.siteUrl.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">사이트 설명</label>
                  <textarea 
                    rows={2} 
                    {...register("siteDescription")} 
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600" 
                  />
                  {errors.siteDescription && <p className="text-xs text-red-500 mt-1">{errors.siteDescription.message}</p>}
                </div>
              </div>
            </Card>

            {/* 이메일 설정 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" /> 이메일 설정
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">관리자 이메일</label>
                  <input 
                    type="email" 
                    {...register("adminEmail")} 
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600" 
                  />
                  {errors.adminEmail && <p className="text-xs text-red-500 mt-1">{errors.adminEmail.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">지원 이메일</label>
                  <input 
                    type="email" 
                    {...register("supportEmail")} 
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600" 
                  />
                  {errors.supportEmail && <p className="text-xs text-red-500 mt-1">{errors.supportEmail.message}</p>}
                </div>
              </div>
            </Card>

            {/* 사용자 제한 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> 사용자 제한
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">최대 사용자 수</label>
                  <input 
                    type="number" 
                    min={1} 
                    {...register("maxUsers", { valueAsNumber: true })} 
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600" 
                  />
                  {errors.maxUsers && <p className="text-xs text-red-500 mt-1">{errors.maxUsers.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">사용자당 최대 페이지</label>
                  <input 
                    type="number" 
                    min={1} 
                    {...register("maxPagesPerUser", { valueAsNumber: true })} 
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600" 
                  />
                  {errors.maxPagesPerUser && <p className="text-xs text-red-500 mt-1">{errors.maxPagesPerUser.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">페이지당 최대 위젯</label>
                  <input 
                    type="number" 
                    min={1} 
                    {...register("maxWidgetsPerPage", { valueAsNumber: true })} 
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600" 
                  />
                  {errors.maxWidgetsPerPage && <p className="text-xs text-red-500 mt-1">{errors.maxWidgetsPerPage.message}</p>}
                </div>
              </div>
            </Card>

            {/* 보안 설정 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> 보안 설정
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">회원가입 허용</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">새 사용자의 회원가입을 허용합니다</p>
                  </div>
                  <input 
                    type="checkbox" 
                    {...register("allowRegistration")} 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">이메일 인증 필수</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">회원가입 시 이메일 인증을 필수로 합니다</p>
                  </div>
                  <input 
                    type="checkbox" 
                    {...register("requireEmailVerification")} 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">유지보수 모드</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">사이트를 유지보수 모드로 전환합니다</p>
                  </div>
                  <input 
                    type="checkbox" 
                    {...register("maintenanceMode")} 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                  />
                </div>
              </div>
            </Card>

            {/* 알림 설정 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" /> 알림 설정
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">알림 활성화</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">시스템 알림을 활성화합니다</p>
                  </div>
                  <input 
                    type="checkbox" 
                    {...register("enableNotifications")} 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                  />
                </div>
              </div>
            </Card>

            {/* 테마 설정 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" /> 테마 설정
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1">기본 테마</label>
                <select 
                  {...register("defaultTheme")} 
                  className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="light">라이트 모드</option>
                  <option value="dark">다크 모드</option>
                  <option value="auto">자동</option>
                </select>
              </div>
            </Card>

            {/* 분석 설정 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" /> 분석 설정
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">분석 활성화</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">사용자 행동 분석을 활성화합니다</p>
                  </div>
                  <input 
                    type="checkbox" 
                    {...register("analyticsEnabled")} 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                  />
                </div>
              </div>
            </Card>

            {/* 백업 설정 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" /> 백업 설정
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">자동 백업</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">정기적인 데이터 백업을 활성화합니다</p>
                  </div>
                  <input 
                    type="checkbox" 
                    {...register("backupEnabled")} 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                  />
                </div>
                {backupEnabled && (
                  <div>
                    <label className="block text-sm font-medium mb-1">백업 주기</label>
                    <select 
                      {...register("backupFrequency")} 
                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600"
                    >
                      <option value="daily">매일</option>
                      <option value="weekly">매주</option>
                      <option value="monthly">매월</option>
                    </select>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </form>
    </div>
  );
}
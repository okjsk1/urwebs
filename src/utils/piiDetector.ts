// PII (개인식별정보) 감지 및 안전장치 유틸리티

export interface PIIWarning {
  type: 'email' | 'phone' | 'token' | 'key' | 'personal';
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

export interface SafetyCheckResult {
  hasWarnings: boolean;
  warnings: PIIWarning[];
  safeToPublish: boolean;
  recommendations: string[];
}

class PIIDetector {
  private patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /(\+?82|0)?-?[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}/g,
    token: /\b[A-Za-z0-9]{20,}\b/g, // 20자 이상의 토큰
    apiKey: /\b(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*['"]?[A-Za-z0-9+/=]{20,}['"]?/gi,
    personal: /\b(주민등록번호|신분증|여권번호|계좌번호|카드번호)\b/g
  };

  private sensitiveKeywords = [
    'password', '비밀번호', 'secret', 'secretKey', 'apiKey', 'accessToken',
    'refreshToken', 'jwt', 'bearer', 'authorization', 'auth', 'login',
    'credential', 'credential', 'key', 'token', 'private', 'confidential'
  ];

  detectPII(text: string): PIIWarning[] {
    const warnings: PIIWarning[] = [];

    // 이메일 감지
    const emails = text.match(this.patterns.email);
    if (emails) {
      warnings.push({
        type: 'email',
        message: `이메일 주소가 포함되어 있습니다: ${emails.slice(0, 3).join(', ')}`,
        severity: 'high',
        suggestion: '이메일 주소를 제거하거나 마스킹 처리하세요'
      });
    }

    // 전화번호 감지
    const phones = text.match(this.patterns.phone);
    if (phones) {
      warnings.push({
        type: 'phone',
        message: `전화번호가 포함되어 있습니다: ${phones.slice(0, 3).join(', ')}`,
        severity: 'high',
        suggestion: '전화번호를 제거하거나 마스킹 처리하세요'
      });
    }

    // API 키/토큰 감지
    const tokens = text.match(this.patterns.token);
    const apiKeys = text.match(this.patterns.apiKey);
    
    if (tokens && tokens.length > 5) { // 일반적인 토큰 패턴
      warnings.push({
        type: 'token',
        message: 'API 키나 토큰으로 보이는 문자열이 포함되어 있습니다',
        severity: 'high',
        suggestion: 'API 키나 토큰을 제거하거나 환경변수로 대체하세요'
      });
    }

    if (apiKeys) {
      warnings.push({
        type: 'key',
        message: 'API 키 설정이 포함되어 있습니다',
        severity: 'high',
        suggestion: 'API 키 설정을 제거하거나 환경변수로 대체하세요'
      });
    }

    // 개인정보 키워드 감지
    const personalInfo = text.match(this.patterns.personal);
    if (personalInfo) {
      warnings.push({
        type: 'personal',
        message: '개인정보 관련 키워드가 포함되어 있습니다',
        severity: 'medium',
        suggestion: '개인정보 관련 내용을 제거하세요'
      });
    }

    // 민감한 키워드 감지
    const hasSensitiveKeywords = this.sensitiveKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasSensitiveKeywords) {
      warnings.push({
        type: 'key',
        message: '민감한 키워드가 포함되어 있습니다',
        severity: 'medium',
        suggestion: '민감한 키워드나 설정을 제거하세요'
      });
    }

    return warnings;
  }

  maskPII(text: string, options: {
    maskEmail?: boolean;
    maskPhone?: boolean;
    maskTokens?: boolean;
  } = {}): string {
    let maskedText = text;

    if (options.maskEmail) {
      maskedText = maskedText.replace(this.patterns.email, (match) => {
        const [localPart, domain] = match.split('@');
        return `${localPart.charAt(0)}***@${domain}`;
      });
    }

    if (options.maskPhone) {
      maskedText = maskedText.replace(this.patterns.phone, (match) => {
        return match.replace(/\d/g, '*').replace(/\*{4,}/, '****');
      });
    }

    if (options.maskTokens) {
      maskedText = maskedText.replace(this.patterns.token, '***MASKED***');
      maskedText = maskedText.replace(this.patterns.apiKey, '***MASKED***');
    }

    return maskedText;
  }

  checkWidgetSafety(widget: any): SafetyCheckResult {
    const warnings: PIIWarning[] = [];
    const recommendations: string[] = [];

    // 위젯 타입별 안전성 검사
    switch (widget.type) {
      case 'bookmark':
        if (widget.content?.urls) {
          widget.content.urls.forEach((url: string) => {
            warnings.push(...this.detectPII(url));
          });
        }
        break;

      case 'memo':
        if (widget.content?.text) {
          warnings.push(...this.detectPII(widget.content.text));
        }
        break;

      case 'todo':
        if (widget.content?.items) {
          widget.content.items.forEach((item: any) => {
            if (item.text) {
              warnings.push(...this.detectPII(item.text));
            }
          });
        }
        break;

      case 'news':
        // 뉴스 위젯은 일반적으로 안전
        break;

      case 'weather':
        // 날씨 위젯은 일반적으로 안전
        break;

      default:
        // 기타 위젯의 경우 내용 검사
        if (widget.content) {
          const contentStr = JSON.stringify(widget.content);
          warnings.push(...this.detectPII(contentStr));
        }
    }

    // 권장사항 생성
    if (warnings.length > 0) {
      recommendations.push('개인정보 제거 옵션을 활성화하세요');
      recommendations.push('민감한 정보가 포함된 위젯을 제거하거나 수정하세요');
    }

    const hasHighSeverityWarnings = warnings.some(w => w.severity === 'high');

    return {
      hasWarnings: warnings.length > 0,
      warnings,
      safeToPublish: !hasHighSeverityWarnings,
      recommendations
    };
  }

  checkPageSafety(page: any): SafetyCheckResult {
    const allWarnings: PIIWarning[] = [];
    const recommendations: string[] = [];

    // 페이지 제목과 설명 검사
    if (page.title) {
      allWarnings.push(...this.detectPII(page.title));
    }

    if (page.description) {
      allWarnings.push(...this.detectPII(page.description));
    }

    // 모든 위젯 검사
    if (page.widgets) {
      page.widgets.forEach((widget: any) => {
        const widgetResult = this.checkWidgetSafety(widget);
        allWarnings.push(...widgetResult.warnings);
      });
    }

    // 권장사항 생성
    if (allWarnings.length > 0) {
      recommendations.push('개인정보 자동 제거 옵션을 활성화하세요');
      recommendations.push('민감한 정보가 포함된 위젯을 검토하세요');
      recommendations.push('공개 전에 모든 내용을 다시 한번 확인하세요');
    }

    const hasHighSeverityWarnings = allWarnings.some(w => w.severity === 'high');

    return {
      hasWarnings: allWarnings.length > 0,
      warnings: allWarnings,
      safeToPublish: !hasHighSeverityWarnings,
      recommendations
    };
  }
}

// 전역 인스턴스
export const piiDetector = new PIIDetector();

// 편의 함수들
export const detectPII = (text: string) => piiDetector.detectPII(text);
export const maskPII = (text: string, options?: any) => piiDetector.maskPII(text, options);
export const checkWidgetSafety = (widget: any) => piiDetector.checkWidgetSafety(widget);
export const checkPageSafety = (page: any) => piiDetector.checkPageSafety(page);

import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // ───────── SRE/플랫폼 ─────────
  { category: '문서/모범사례', title: 'Google SRE Book', url: 'https://sre.google/sre-book/table-of-contents/', description: '공식 무료 서적', id: 'CLD-DOC-001' },
  { category: '문서/모범사례', title: 'AWS Well-Architected(ko)', url: 'https://docs.aws.amazon.com/ko_kr/wellarchitected/latest/framework/', description: '아키텍처 체크', id: 'CLD-DOC-002' },
  { category: '문서/모범사례', title: 'The Twelve-Factor App', url: 'https://12factor.net', description: '앱 운영 원칙', id: 'CLD-DOC-003' },

  { category: '관측/모니터링', title: 'Prometheus', url: 'https://prometheus.io', description: '메트릭 수집', id: 'CLD-OBS-001' },
  { category: '관측/모니터링', title: 'Grafana', url: 'https://grafana.com', description: '대시보드/알람', id: 'CLD-OBS-002' },
  { category: '관측/모니터링', title: 'OpenTelemetry', url: 'https://opentelemetry.io', description: '표준 트레이싱', id: 'CLD-OBS-003' },
];

export const categoryConfig: CategoryConfigMap = {
  '문서/모범사례': { title: '문서/모범사례', icon: '📘', iconClass: 'icon-blue' },
  '관측/모니터링': { title: '관측/모니터링', icon: '📈', iconClass: 'icon-green' },
};

export const categoryOrder = [
  '문서/모범사례',
  '관측/모니터링',
];


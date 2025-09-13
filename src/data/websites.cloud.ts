import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // ───────── SRE/플랫폼 ─────────
  { category: '문서/모범사례', title: 'Google SRE Book', url: 'https://sre.google/sre-book/table-of-contents/', description: '공식 무료 서적', id: 'CLD-DOC-001' },
  { category: '문서/모범사례', title: 'AWS Well-Architected(ko)', url: 'https://docs.aws.amazon.com/ko_kr/wellarchitected/latest/framework/', description: '아키텍처 체크', id: 'CLD-DOC-002' },
  { category: '문서/모범사례', title: 'The Twelve-Factor App', url: 'https://12factor.net', description: '앱 운영 원칙', id: 'CLD-DOC-003' },

  { category: '관측/모니터링', title: 'Prometheus', url: 'https://prometheus.io', description: '메트릭 수집', id: 'CLD-OBS-001' },
  { category: '관측/모니터링', title: 'Grafana', url: 'https://grafana.com', description: '대시보드/알람', id: 'CLD-OBS-002' },
  { category: '관측/모니터링', title: 'OpenTelemetry', url: 'https://opentelemetry.io', description: '표준 트레이싱', id: 'CLD-OBS-003' },

  // ───────── 배포/자동화 ─────────
  { category: '배포/자동화', title: 'Terraform', url: 'https://www.terraform.io', description: '인프라 코드 관리', id: 'CLD-DEP-001' },
  { category: '배포/자동화', title: 'Ansible', url: 'https://www.ansible.com', description: '구성 관리 자동화', id: 'CLD-DEP-002' },
  { category: '배포/자동화', title: 'Argo CD', url: 'https://argo-cd.readthedocs.io', description: '쿠버네티스 GitOps 배포', id: 'CLD-DEP-003' },

  // ───────── 컨테이너/오케스트레이션 ─────────
  { category: '컨테이너/오케스트레이션', title: 'Docker', url: 'https://www.docker.com', description: '컨테이너 플랫폼', id: 'CLD-CTL-001' },
  { category: '컨테이너/오케스트레이션', title: 'Kubernetes', url: 'https://kubernetes.io', description: '컨테이너 오케스트레이션', id: 'CLD-CTL-002' },
  { category: '컨테이너/오케스트레이션', title: 'Helm', url: 'https://helm.sh', description: '쿠버네티스 패키지 매니저', id: 'CLD-CTL-003' },
];

export const categoryConfig: CategoryConfigMap = {
  '문서/모범사례': { title: '문서/모범사례', icon: '📘', iconClass: 'icon-blue' },
  '관측/모니터링': { title: '관측/모니터링', icon: '📈', iconClass: 'icon-green' },
  '배포/자동화': { title: '배포/자동화', icon: '🚀', iconClass: 'icon-purple' },
  '컨테이너/오케스트레이션': { title: '컨테이너/오케스트레이션', icon: '📦', iconClass: 'icon-orange' },
};

export const categoryOrder = [
  '문서/모범사례',
  '관측/모니터링',
  '배포/자동화',
  '컨테이너/오케스트레이션',
];


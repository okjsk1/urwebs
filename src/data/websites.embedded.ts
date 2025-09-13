import type { Website, CategoryConfigMap } from './websites';

export const websites: Website[] = [
  // TODO: 임베디드/IoT & 게임 관련 웹사이트를 추가할 예정입니다.
];

export const categoryConfig: CategoryConfigMap = {
  '펌웨어/임베디드': { title: '펌웨어/임베디드', icon: '⚙️', iconClass: 'icon-blue' },
  '하드웨어/전자': { title: '하드웨어/전자', icon: '🔩', iconClass: 'icon-green' },
  'RTOS/통신': { title: 'RTOS/통신', icon: '📡', iconClass: 'icon-orange' },
  'IoT 클라우드': { title: 'IoT 클라우드', icon: '☁️', iconClass: 'icon-purple' },
  '게임 클라이언트': { title: '게임 클라이언트', icon: '🎮', iconClass: 'icon-red' },
  '게임 서버/라이브Ops': { title: '게임 서버/라이브Ops', icon: '🕹️', iconClass: 'icon-yellow' },
};

export const categoryOrder = [
  '펌웨어/임베디드',
  '하드웨어/전자',
  'RTOS/통신',
  'IoT 클라우드',
  '게임 클라이언트',
  '게임 서버/라이브Ops',
];

import { Page, Widget } from '../types/mypage.types';

const TRIAL_KEY = 'urwebs-guest-trial-initialized';
const TRIAL_SESSION_KEY = 'urwebs-guest-trial-session';

const createBookmarkWidget = (): Widget => ({
  id: `guest-bookmark-${Date.now()}`,
  type: 'bookmark',
  x: 0,
  y: 0,
  width: 1,
  height: 2,
  title: '매일 방문하는 사이트',
  content: {
    bookmarks: [
      {
        id: 'b1',
        name: 'URWEBS 가이드',
        url: 'https://urwebs.guide',
        icon: 'https://urwebs.guide/icon.png',
        color: 'bg-indigo-100'
      },
      {
        id: 'b2',
        name: 'Notion',
        url: 'https://www.notion.so',
        icon: 'https://www.notion.so/front-static/meta/notion-icon-192.png',
        color: 'bg-emerald-100'
      },
      {
        id: 'b3',
        name: 'YouTube',
        url: 'https://www.youtube.com',
        icon: 'https://www.youtube.com/s/desktop/5c38d6de/img/favicon_144x144.png',
        color: 'bg-rose-100'
      }
    ]
  },
  zIndex: 1,
  size: '1x2',
  gridSize: { w: 1, h: 2 }
});

const createTodoWidget = (): Widget => ({
  id: `guest-todo-${Date.now() + 1}`,
  type: 'todo',
  x: 1,
  y: 0,
  width: 2,
  height: 2,
  title: '오늘의 할 일',
  content: undefined,
  zIndex: 1,
  size: '2x2',
  gridSize: { w: 2, h: 2 }
});

const createWeatherWidget = (): Widget => ({
  id: `guest-weather-${Date.now() + 2}`,
  type: 'weather',
  x: 3,
  y: 0,
  width: 1,
  height: 3,
  title: '서울 날씨',
  content: undefined,
  zIndex: 1,
  size: '1x3',
  gridSize: { w: 1, h: 3 }
});

const createTrialPage = (): Page => {
  const widgets = [createBookmarkWidget(), createTodoWidget(), createWeatherWidget()];
  return {
    id: 'guest-trial-page',
    title: '나만의 시작페이지',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    widgets,
    isActive: true,
    backgroundSettings: {
      type: 'gradient',
      color: '#ffffff',
      gradient: {
        from: '#eef2ff',
        to: '#faf5ff',
        direction: 'to-br'
      },
      opacity: 1
    }
  };
};

export const ensureGuestTrialPage = () => {
  if (typeof window === 'undefined') return;

  const sessionFlag = sessionStorage.getItem(TRIAL_SESSION_KEY);
  if (sessionFlag === 'true') return;

  const existing = localStorage.getItem('myPages');

  if (!existing) {
    const page = createTrialPage();
    try {
      localStorage.setItem('myPages', JSON.stringify([page]));
      localStorage.setItem(
        'shareSettings_guest',
        JSON.stringify({
          isPublic: false,
          allowComments: true,
          showStats: true,
        })
      );
      localStorage.setItem('backgroundSettings_guest', JSON.stringify(page.backgroundSettings));
    } catch (error) {
      console.warn('[guestExperience] 임시 페이지 저장 실패', error);
    }
  }

  sessionStorage.setItem(TRIAL_SESSION_KEY, 'true');
  localStorage.setItem(TRIAL_KEY, 'true');
};

export const resetGuestTrialPage = () => {
  try {
    localStorage.removeItem('myPages');
    localStorage.removeItem('shareSettings_guest');
    localStorage.removeItem('backgroundSettings_guest');
    localStorage.removeItem(TRIAL_KEY);
    sessionStorage.removeItem(TRIAL_SESSION_KEY);
  } catch (error) {
    console.warn('[guestExperience] reset 실패', error);
  }
};



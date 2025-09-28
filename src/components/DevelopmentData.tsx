// 개발/기획 분야 데이터를 별도 파일로 분리
export const developmentData = {
  'development': {
    '': {
      title: '개발/기획',
      categories: [
        {
          name: '개발 플랫폼',
          sites: [
            { id: 'dev1', name: 'GitHub', description: '코드 저장소 및 협업', url: 'https://github.com', tags: ['코드저장소', '협업'] },
            { id: 'dev2', name: 'GitLab', description: 'DevOps 플랫폼', url: 'https://gitlab.com', tags: ['DevOps', '플랫폼'] },
            { id: 'dev3', name: 'Bitbucket', description: 'Atlassian Git 저장소', url: 'https://bitbucket.org', tags: ['Git', '저장소'] },
            { id: 'dev4', name: 'CodePen', description: '프론트엔드 코드 공유', url: 'https://codepen.io', tags: ['프론트엔드', '공유'] },
            { id: 'dev5', name: 'JSFiddle', description: 'JavaScript 테스트', url: 'https://jsfiddle.net', tags: ['JavaScript', '테스트'] },
            { id: 'dev6', name: 'Replit', description: '온라인 IDE', url: 'https://replit.com', tags: ['온라인', 'IDE'] },
            { id: 'dev7', name: 'CodeSandbox', description: '웹 개발 환경', url: 'https://codesandbox.io', tags: ['웹개발', '환경'] },
            { id: 'dev8', name: 'Glitch', description: '웹앱 개발 플랫폼', url: 'https://glitch.com', tags: ['웹앱', '플랫폼'] }
          ]
        },
        {
          name: '학습 리소스',
          sites: [
            { id: 'learn1', name: 'MDN Web Docs', description: '웹 개발 문서', url: 'https://developer.mozilla.org', tags: ['웹개발', '문서'] },
            { id: 'learn2', name: 'W3Schools', description: '웹 기술 튜토리얼', url: 'https://www.w3schools.com', tags: ['웹기술', '튜토리얼'] },
            { id: 'learn3', name: 'freeCodeCamp', description: '무료 코딩 교육', url: 'https://www.freecodecamp.org', tags: ['무료', '코딩교육'] },
            { id: 'learn4', name: 'Codecademy', description: '인터랙티브 코딩', url: 'https://www.codecademy.com', tags: ['인터랙티브', '코딩'] },
            { id: 'learn5', name: 'Khan Academy', description: '컴퓨터 프로그래밍', url: 'https://www.khanacademy.org/computing', tags: ['컴퓨터', '프로그래밍'] },
            { id: 'learn6', name: 'Coursera', description: '컴퓨터과학 강좌', url: 'https://www.coursera.org/browse/computer-science', tags: ['컴퓨터과학', '강좌'] },
            { id: 'learn7', name: 'edX', description: 'IT 전문 강좌', url: 'https://www.edx.org/learn/computer-science', tags: ['IT', '전문강좌'] },
            { id: 'learn8', name: 'Udemy', description: '개발 강의', url: 'https://www.udemy.com/courses/development', tags: ['개발', '강의'] }
          ]
        },
        {
          name: '알고리즘/문제풀이',
          sites: [
            { id: 'algo1', name: 'LeetCode', description: '알고리즘 문제', url: 'https://leetcode.com', tags: ['알고리즘', '문제'] },
            { id: 'algo2', name: 'HackerRank', description: '프로그래밍 챌린지', url: 'https://www.hackerrank.com', tags: ['프로그래밍', '챌린지'] },
            { id: 'algo3', name: 'Codewars', description: '코딩 도전', url: 'https://www.codewars.com', tags: ['코딩', '도전'] },
            { id: 'algo4', name: 'AtCoder', description: '일본 알고리즘 대회', url: 'https://atcoder.jp', tags: ['일본', '알고리즘대회'] },
            { id: 'algo5', name: 'Codeforces', description: '러시아 알고리즘 사이트', url: 'https://codeforces.com', tags: ['러시아', '알고리즘'] },
            { id: 'algo6', name: '백준 온라인 저지', description: '한국 알고리즘 사이트', url: 'https://www.acmicpc.net', tags: ['한국', '알고리즘'] },
            { id: 'algo7', name: '프로그래머스', description: '코딩테스트 연습', url: 'https://programmers.co.kr', tags: ['코딩테스트', '연습'] },
            { id: 'algo8', name: 'SWEA', description: 'SW Expert Academy', url: 'https://swexpertacademy.com', tags: ['SW', 'Expert'] }
          ]
        },
        {
          name: '개발 도구',
          sites: [
            { id: 'tool1', name: 'Visual Studio Code', description: 'MS 코드 에디터', url: 'https://code.visualstudio.com', tags: ['MS', '에디터'] },
            { id: 'tool2', name: 'IntelliJ IDEA', description: 'JetBrains IDE', url: 'https://www.jetbrains.com/idea', tags: ['JetBrains', 'IDE'] },
            { id: 'tool3', name: 'Eclipse', description: '이클립스 IDE', url: 'https://www.eclipse.org', tags: ['이클립스', 'IDE'] },
            { id: 'tool4', name: 'Sublime Text', description: '텍스트 에디터', url: 'https://www.sublimetext.com', tags: ['텍스트', '에디터'] },
            { id: 'tool5', name: 'Android Studio', description: '안드로이드 개발', url: 'https://developer.android.com/studio', tags: ['안드로이드', '개발'] },
            { id: 'tool6', name: 'Xcode', description: 'iOS 개발', url: 'https://developer.apple.com/xcode', tags: ['iOS', '개발'] },
            { id: 'tool7', name: 'Docker', description: '컨테이너 플랫폼', url: 'https://www.docker.com', tags: ['컨테이너', '플랫폼'] },
            { id: 'tool8', name: 'Postman', description: 'API 테스팅', url: 'https://www.postman.com', tags: ['API', '테스팅'] }
          ]
        },
        {
          name: '프레임워크/라이브러리',
          sites: [
            { id: 'fw1', name: 'React', description: 'Facebook 프론트엔드', url: 'https://reactjs.org', tags: ['Facebook', '프론트엔드'] },
            { id: 'fw2', name: 'Vue.js', description: '프로그레시브 프레임워크', url: 'https://vuejs.org', tags: ['프로그레시브', '프레임워크'] },
            { id: 'fw3', name: 'Angular', description: 'Google 프론트엔드', url: 'https://angular.io', tags: ['Google', '프론트엔드'] },
            { id: 'fw4', name: 'Node.js', description: 'JavaScript 런타임', url: 'https://nodejs.org', tags: ['JavaScript', '런타임'] },
            { id: 'fw5', name: 'Express.js', description: 'Node.js 웹 프레임워크', url: 'https://expressjs.com', tags: ['Node.js', '웹프레임워크'] },
            { id: 'fw6', name: 'Django', description: 'Python 웹 프레임워크', url: 'https://www.djangoproject.com', tags: ['Python', '웹프레임워크'] },
            { id: 'fw7', name: 'Spring', description: 'Java 프레임워크', url: 'https://spring.io', tags: ['Java', '프레임워크'] },
            { id: 'fw8', name: 'Laravel', description: 'PHP 프레임워크', url: 'https://laravel.com', tags: ['PHP', '프레임워크'] }
          ]
        },
        {
          name: '개발 커뮤니티',
          sites: [
            { id: 'comm1', name: 'Stack Overflow', description: '개발자 Q&A', url: 'https://stackoverflow.com', tags: ['Q&A', '개발자'] },
            { id: 'comm2', name: 'Reddit Programming', description: '프로그래밍 레딧', url: 'https://www.reddit.com/r/programming', tags: ['프로그래밍', '레딧'] },
            { id: 'comm3', name: 'Dev.to', description: '개발자 커뮤니티', url: 'https://dev.to', tags: ['개발자', '커뮤니티'] },
            { id: 'comm4', name: 'Hacker News', description: '해커 뉴스', url: 'https://news.ycombinator.com', tags: ['해커', '뉴스'] },
            { id: 'comm5', name: 'OKKY', description: '한국 개발자 커뮤니티', url: 'https://okky.kr', tags: ['한국', '개발자'] },
            { id: 'comm6', name: '개발자스럽다', description: '한국 개발 블로그', url: 'https://blog.gaerae.com', tags: ['한국', '개발블로그'] },
            { id: 'comm7', name: 'KLDP', description: '리눅스 개발자 포털', url: 'https://kldp.org', tags: ['리눅스', '개발자'] },
            { id: 'comm8', name: 'GeeksforGeeks', description: '컴퓨터과학 포털', url: 'https://www.geeksforgeeks.org', tags: ['컴퓨터과학', '포털'] }
          ]
        }
      ]
    }
  }
};
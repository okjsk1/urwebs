export interface Site {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface Folder {
  id: string;
  name: string;
  sites: string[]; // site IDs
  isUserModified?: boolean; // 사용자가 수정했는지 여부
}

export interface Category {
  name: string;
  sites: Site[];
}

export interface CategoryData {
  title: string;
  categories: Category[];
}

export const getCategoryData = (categoryId: string, subCategory: string): CategoryData => {
  // 건축 카테고리 - 설계 서브카테고리 (인기순 정렬 추정치)
  // 기준: 국내 실무 체감 + 글로벌 트래픽/인지도(대략) + 접근성
  if (categoryId === 'architecture' && subCategory === 'design') {
    return {
      title: '건축/BIM/CAD/GIS - 설계',
      categories: [
        // 1) 법규/코드
        {
          name: '법규/코드',
          sites: [
            { id: 'law1', name: '국가법령정보센터', description: '건축법/시행령·시행규칙·행정해석', url: 'https://www.law.go.kr' },
            { id: 'law2', name: '국가건설기준(KDS/KCS/KDG)', description: 'KDS 구조·KCS 표준시방·지침', url: 'https://www.kcsc.re.kr' },
            { id: 'law3', name: '건축행정시스템(ELIS)', description: '자치법규·조례·예규 검색', url: 'https://www.elis.go.kr' },
            { id: 'law4', name: '소방청 법령/기준', description: '소방법령·기술기준·해석', url: 'https://www.nfds.go.kr' },
            { id: 'law5', name: '국토교통부 고시·훈령', description: '건축·도시·주택 관련 고시', url: 'https://www.molit.go.kr' },
            { id: 'law6', name: '행정규제기본법·규제정보포털', description: '규제 유권해석/규제개선 사례', url: 'https://www.better.go.kr' },
            { id: 'law7', name: '조달청 나라장터 규격', description: '공공 규격/물품·공사기준 참고', url: 'https://www.g2b.go.kr' }
          ]
        },

        // 2) 인허가/행정/인증
        {
          name: '인허가/행정규제',
          sites: [
            { id: 'permit1', name: '세움터', description: '건축 인허가 통합(민원/도면제출)', url: 'https://www.eais.go.kr' },
            { id: 'permit2', name: '건축물생애이력(BLCM)', description: '준공·유지관리 이력조회', url: 'https://blcm.go.kr' },
            { id: 'permit3', name: '녹색건축인증(G-SEED)', description: '친환경 건축 인증', url: 'https://www.gseed.or.kr' },
            { id: 'permit4', name: 'BF 인증', description: '장애물 없는 생활환경', url: 'https://www.koddi.or.kr' },
            { id: 'permit5', name: '건축물 에너지효율등급', description: '건축물 에너지 성능평가', url: 'https://www.bea.go.kr' },
            { id: 'permit6', name: '국토계획지원(LURIS 고시문 등)', description: '지구단위/용도/계획 고시 열람', url: 'https://luris.go.kr' }
          ]
        },

        // 3) 조사/지식자료/GIS/지도
        {
          name: '지식자료/GIS',
          sites: [
            { id: 'gis11', name: '브이월드(VWORLD)', description: '항공/3D/지적/지오코딩', url: 'https://www.vworld.kr' },
            { id: 'gis12', name: '국토정보플랫폼(NSDI)', description: '국가공간정보 오픈데이터', url: 'https://www.nsdi.go.kr' },
            { id: 'gis13', name: '토지이용계획확인(LURIS)', description: '용도지역/지구단위계획', url: 'https://luris.go.kr' },
            { id: 'gis14', name: '도로명주소(JUSO)', description: '새주소/좌표 변환', url: 'https://www.juso.go.kr' },
            { id: 'gis15', name: '지적재조사(RLRIS)', description: '지적경계/지번/사업', url: 'https://www.rlris.go.kr' },
            { id: 'gis16', name: '기상자료개방포털', description: '기후/일사량/풍향 데이터', url: 'https://data.kma.go.kr' },
            { id: 'gis17', name: '국가교통DB(KTDB)', description: '교통수요/노선/OD', url: 'https://www.ktdb.go.kr' },
            { id: 'gis18', name: 'AURIC', description: '건축·도시 연구/논문/사례', url: 'https://www.auric.or.kr' },
            { id: 'gis19', name: '통계청 KOSIS', description: '인구·산업·주거 통계', url: 'https://kosis.kr' }
          ]
        },

        // 4) 설계 레퍼런스/해외 (인기 큼)
        {
          name: '설계레퍼런스/해외',
          sites: [
            { id: 'ref101', name: 'Pinterest Architecture', description: '무드보드/디테일/트렌드', url: 'https://www.pinterest.com' },
            { id: 'ref102', name: 'ArchDaily', description: '세계 최대 프로젝트 아카이브', url: 'https://www.archdaily.com' },
            { id: 'ref103', name: 'Dezeen', description: '건축/디자인 글로벌 매체', url: 'https://www.dezeen.com' },
            { id: 'ref104', name: 'Behance Architecture', description: '포트폴리오/시각화', url: 'https://www.behance.net' },
            { id: 'ref105', name: 'Instagram #architecture', description: '태그 기반 트렌드/디테일', url: 'https://www.instagram.com/explore/tags/architecture/' },
            { id: 'ref106', name: 'Designboom', description: '디자인·건축 뉴스', url: 'https://www.designboom.com' },
            { id: 'ref107', name: 'Architizer', description: '사무소/프로젝트 DB', url: 'https://architizer.com' },
            { id: 'ref108', name: 'Domus', description: '이탈리아 건축 매거진', url: 'https://www.domusweb.it' },
            { id: 'ref109', name: 'Landezine', description: '조경 레퍼런스', url: 'https://landezine.com' },
            { id: 'ref110', name: 'World Architecture', description: '글로벌 건축 뉴스', url: 'https://www.worldarchitecture.org' },
            { id: 'ref111', name: 'DETAIL Magazine', description: '디테일 도면/재료 해설(전문)', url: 'https://www.detail.de' },
            { id: 'ref112', name: 'Divisare', description: '큐레이션 프로젝트', url: 'https://divisare.com' }
          ]
        },

        // 5) 선례/학회/기관
        {
          name: '지식사이트/선례',
          sites: [
            { id: 'know11', name: '대한건축사협회(KIRA)', description: '건축사 제도·교육/자료', url: 'https://www.kira.or.kr' },
            { id: 'know12', name: '건축공간연구원(AURI)', description: '정책/연구/리포트', url: 'https://www.auri.re.kr' },
            { id: 'know13', name: '한국건축가협회(KIA)', description: '건축가 네트워크', url: 'https://www.kia.or.kr' },
            { id: 'know14', name: '한국건설기술연구원(KICT)', description: '건설 신기술/보고서', url: 'https://www.kict.re.kr' },
            { id: 'know15', name: '한국패시브건축협회', description: '패시브·제로에너지', url: 'https://www.phiko.kr' },
            { id: 'know16', name: '건축도시연구정보센터(AURIC)', description: '학술/기술자료', url: 'https://www.auric.or.kr' }
          ]
        },

        // 6) 자재/디테일/규격/BIM오브젝트(보기용)
        {
          name: '자재/디테일/규격',
          sites: [
            { id: 'mat1', name: 'KCS 표준시방서', description: '공종별 표준시방', url: 'https://www.kcsc.re.kr' },
            { id: 'mat2', name: 'KS 표준', description: '한국산업표준 검색', url: 'https://standard.go.kr' },
            { id: 'mat3', name: 'BIMobject', description: '제품 BIM 라이브러리', url: 'https://www.bimobject.com' },
            { id: 'mat4', name: 'Polantis', description: 'BIM·CAD 라이브러리', url: 'https://www.polantis.com' },
            { id: 'mat5', name: 'KCL', description: '자재 성능시험/인증', url: 'https://www.kcl.re.kr' },
            { id: 'mat6', name: 'LX 하우시스', description: '내장재/창호 카탈로그', url: 'https://www.lxhausys.com' },
            { id: 'mat7', name: 'KCC', description: '도료/마감재', url: 'https://www.kccworld.co.kr' }
          ]
        },

        // 7) 수량/원가/노임/품셈
        {
          name: '수량·원가/물가·노임',
          sites: [
            { id: 'cost1', name: '대한건설협회 노임', description: '공종별 노임단가', url: 'https://www.cak.or.kr' },
            { id: 'cost2', name: '한국물가정보', description: '자재·공사비 지수', url: 'https://www.kpi.or.kr' },
            { id: 'cost3', name: '조달청 단가(나라장터)', description: '규격/단가 검색', url: 'https://www.g2b.go.kr' },
            { id: 'cost4', name: '표준품셈', description: '공종별 산출 기준', url: 'https://www.kcsc.re.kr' }
          ]
        },

        // 8) 현상공모/설계공모
        {
          name: '현상공모/설계공모',
          sites: [
            { id: 'comp11', name: '나라장터', description: '공공 발주·설계공모', url: 'https://www.g2b.go.kr' },
            { id: 'comp12', name: '서울시 설계공모', description: '도시/건축 공모', url: 'https://www.seoul.go.kr' },
            { id: 'comp13', name: 'LH/SH 공모', description: '주거·도시 개발 공모', url: 'https://www.lh.or.kr' },
            { id: 'comp14', name: 'ArchDaily – Competitions', description: '해외 공모/호출', url: 'https://www.archdaily.com' },
            { id: 'comp15', name: 'Bustler', description: '국제 설계공모 포털', url: 'https://bustler.net' }
          ]
        },

        // 9) 커뮤니티/연봉·리뷰/포럼
        {
          name: '커뮤니티/연봉·리뷰',
          sites: [
            { id: 'comm21', name: '블라인드', description: '업계 연봉/후기/토론', url: 'https://www.teamblind.com' },
            { id: 'comm22', name: '잡플래닛', description: '기업 리뷰·연봉 리포트', url: 'https://www.jobplanet.co.kr' },
            { id: 'comm23', name: '디시 건축갤', description: '국내 건축 커뮤니티', url: 'https://www.dcinside.com' },
            { id: 'comm24', name: 'Archinect', description: '뉴스·포럼·커리어', url: 'https://archinect.com' },
            { id: 'comm25', name: 'Reddit r/architecture', description: '해외 실무 토론', url: 'https://www.reddit.com/r/architecture/' },
            { id: 'comm26', name: 'Reddit r/Architects', description: '면허/커리어 Q&A', url: 'https://www.reddit.com/r/Architects/' }
          ]
        },

        // 10) 구인·구직/프리랜서
        {
          name: '구인·구직/프리랜서',
          sites: [
            { id: 'job11', name: '사람인', description: '국내 대형 채용 플랫폼', url: 'https://www.saramin.co.kr' },
            { id: 'job12', name: '잡코리아', description: '국내 대형 채용 플랫폼', url: 'https://www.jobkorea.co.kr' },
            { id: 'job13', name: '원티드', description: '디자인/테크/스타트업', url: 'https://www.wanted.co.kr' },
            { id: 'job14', name: '건설워커', description: '건설·시공·CM 특화', url: 'https://www.worker.co.kr' },
            { id: 'job15', name: 'KIRA 채용', description: '건축사사무소·기관 공고', url: 'https://www.kira.or.kr' },
            { id: 'job16', name: '알리오', description: '공공기관 채용·공고', url: 'https://www.alio.go.kr' }
          ]
        },

        // 11) 경력·자격/실무수련
        {
          name: '경력·자격/실무수련',
          sites: [
            { id: 'career11', name: 'Q-Net 건축사', description: '건축사 시험/공고', url: 'https://www.q-net.or.kr' },
            { id: 'career12', name: '대한건축사협회', description: '등록/경력/교육', url: 'https://www.kira.or.kr' },
            { id: 'career13', name: '건축사법(법령)', description: '실무수련/자격규정', url: 'https://www.law.go.kr' },
            { id: 'career14', name: '워크넷 인턴', description: '청년 인턴/현장실습', url: 'https://www.work.go.kr' }
          ]
        },

        // 12) 교육/강의(BIM/설계)
        {
          name: '교육/강의(BIM/설계)',
          sites: [
            { id: 'edu11', name: 'Autodesk University', description: 'AU 세션/온디맨드', url: 'https://www.autodesk.com/autodesk-university/' },
            { id: 'edu12', name: 'Udemy – Revit/Rhino/SketchUp', description: '도구별 실무 강좌', url: 'https://www.udemy.com/courses/search/?q=revit%20architecture' },
            { id: 'edu13', name: 'Coursera – BIM', description: 'BIM 기초/실무', url: 'https://www.coursera.org/courses?query=bim' },
            { id: 'edu14', name: 'Graphisoft Learn', description: 'ArchiCAD 공식 교육', url: 'https://learn.graphisoft.com' },
            { id: 'edu15', name: 'buildingSMART Korea', description: '오픈BIM/IFC 교육', url: 'https://www.buildingsmart.or.kr/Home/Education' },
            { id: 'edu16', name: 'YouTube – 30X40 / Show It Better / The B1M', description: '실무팁·보드/시각화·시공', url: 'https://www.youtube.com' }
          ]
        },

        // 13) 유용한 프로그램 (메모/탐색/생산성/그래픽/GIS 등)
        {
          name: '유용한 프로그램',
          sites: [
            // 메모·지식관리
            { id: 'tool101', name: 'Notion', description: '프로젝트 위키/DB', url: 'https://www.notion.so' },
            { id: 'tool102', name: 'Obsidian', description: '로컬 지식관리(마크다운)', url: 'https://obsidian.md' },
            { id: 'tool103', name: 'Typora', description: '마크다운 에디터', url: 'https://typora.io' },
            { id: 'tool104', name: 'Stickies', description: '바탕화면 메모', url: 'https://www.zhornsoftware.co.uk/stickies/' },

            // 파일탐색기(멀티탭/듀얼)
            { id: 'tool111', name: 'Files', description: '모던 멀티탭 탐색기', url: 'https://files.community' },
            { id: 'tool112', name: 'OneCommander', description: '듀얼 패널/멀티탭', url: 'https://onecommander.com' },
            { id: 'tool113', name: 'Total Commander', description: '전문 파일 매니저', url: 'https://www.ghisler.com' },
            { id: 'tool114', name: 'FreeCommander', description: '무료 듀얼 패널', url: 'https://freecommander.com' },

            // 검색/클립보드/자동화
            { id: 'tool121', name: 'Everything', description: '초고속 파일 검색', url: 'https://www.voidtools.com' },
            { id: 'tool122', name: 'Ditto', description: '클립보드 히스토리', url: 'https://ditto-cp.sourceforge.io/' },
            { id: 'tool123', name: 'AutoHotkey', description: '키 매핑/매크로', url: 'https://www.autohotkey.com' },
            { id: 'tool124', name: 'PowerToys', description: '파워리네임/피크/레이아웃', url: 'https://learn.microsoft.com/windows/powertoys/' },

            // 캡처/뷰어/PDF
            { id: 'tool131', name: 'ShareX', description: '스크린샷/녹화/주석', url: 'https://getsharex.com' },
            { id: 'tool132', name: 'Greenshot', description: '가벼운 캡처', url: 'https://getgreenshot.org' },
            { id: 'tool133', name: 'ImageGlass', description: '가벼운 이미지 뷰어', url: 'https://imageglass.org' },
            { id: 'tool134', name: 'IrfanView', description: '대용량 이미지 뷰어', url: 'https://www.irfanview.com' },
            { id: 'tool135', name: 'SumatraPDF', description: '초경량 PDF/전자책', url: 'https://www.sumatrapdfreader.org/free-pdf-reader' },
            { id: 'tool136', name: 'PDF-XChange Editor', description: 'PDF 주석/편집', url: 'https://www.tracker-software.com/product/pdf-xchange-editor' },

            // 그래픽/도면 보조
            { id: 'tool141', name: 'Inkscape', description: '벡터 그래픽', url: 'https://inkscape.org' },
            { id: 'tool142', name: 'GIMP', description: '이미지 편집', url: 'https://www.gimp.org' },
            { id: 'tool143', name: 'Affinity Photo/Designer', description: '유료 라이트급 그래픽', url: 'https://affinity.serif.com' },

            // CAD/GIS/모델링(보조)
            { id: 'tool151', name: 'XiCAD', description: 'AutoCAD 보조/실무 매크로', url: 'https://izzarder.com' },
            { id: 'tool152', name: 'QGIS', description: '오픈소스 GIS', url: 'https://qgis.org' },
            { id: 'tool153', name: 'Blender', description: '오픈소스 3D', url: 'https://www.blender.org' },
            { id: 'tool154', name: 'FreeCAD', description: '오픈소스 파라메트릭 CAD', url: 'https://www.freecad.org' },
            { id: 'tool155', name: 'LibreCAD', description: '오픈소스 2D CAD', url: 'https://librecad.org' },

            // 압축/비교/버전
            { id: 'tool161', name: '7-Zip', description: '압축/해제', url: 'https://www.7-zip.org' },
            { id: 'tool162', name: 'WinMerge', description: '폴더/파일 비교', url: 'https://winmerge.org' },

            // 달력/일정/타임블로킹
            { id: 'tool171', name: 'Rainlendar', description: '바탕화면 캘린더/할일', url: 'https://www.rainlendar.net' },
            { id: 'tool172', name: 'DesktopCal', description: '바탕화면 달력', url: 'https://www.desktopcal.com' }
          ]
        },

        // 14) 표현/시각화 리소스(텍스처/모델/HDRI)
        {
          name: '시각화 리소스',
          sites: [
            { id: 'viz1', name: 'Poly Haven', description: 'CC0 HDRI/텍스처/3D', url: 'https://polyhaven.com' },
            { id: 'viz2', name: 'Sketchfab', description: '3D 모델 마켓/무료 에셋', url: 'https://sketchfab.com' },
            { id: 'viz3', name: '3D Warehouse', description: 'SketchUp 모델 라이브러리', url: 'https://3dwarehouse.sketchup.com' },
            { id: 'viz4', name: 'ambientCG', description: 'CC0 텍스처', url: 'https://ambientcg.com' },
            { id: 'viz5', name: 'Textures.com', description: '상세 텍스처 라이브러리', url: 'https://www.textures.com' }
          ]
        },

        // 15) 폰트/아이콘/라이선스
        {
          name: '폰트/아이콘',
          sites: [
            { id: 'font1', name: 'Google Fonts', description: '웹/출판 무료 폰트(라이선스 명확)', url: 'https://fonts.google.com' },
            { id: 'font2', name: 'Naver 나눔/마루/본고딕', description: '국문 무료 폰트 모음', url: 'https://hangeul.naver.com' },
            { id: 'font3', name: 'Material Icons', description: 'OSS 아이콘 세트', url: 'https://fonts.google.com/icons' },
            { id: 'font4', name: 'Flaticon', description: '아이콘/벡터(라이선스 확인)', url: 'https://www.flaticon.com' }
          ]
        }
        // ⚠ 요청에 따라 독립된 "BIM" 카테고리는 포함하지 않음
      ]
    };
  }

  // 건축 카테고리 - 학생 전용 서브카테고리
  if (categoryId === 'architecture' && subCategory === 'student') {
    return {
      title: '건축학과 학생 추천 – 스튜디오/포트폴리오/학습',
      categories: [
        // 1) 스튜디오 레퍼런스/사례
        {
          name: '스튜디오 레퍼런스',
          sites: [
            { id: 'stu_ref1', name: 'ArchDaily', description: '세계 최대 프로젝트 아카이브(도면/사진/설명)', url: 'https://www.archdaily.com' },
            { id: 'stu_ref2', name: 'Pinterest Architecture', description: '무드보드/프레젠테이션 레이아웃 아이디어', url: 'https://www.pinterest.com' },
            { id: 'stu_ref3', name: 'Dezeen', description: '건축/디자인 트렌드·스튜디오 참고', url: 'https://www.dezeen.com' },
            { id: 'stu_ref4', name: 'Behance Architecture', description: '학생/스튜디오 작업물·시각화 포트폴리오', url: 'https://www.behance.net' },
            { id: 'stu_ref5', name: 'Divisare', description: '큐레이션된 프로젝트 레퍼런스', url: 'https://divisare.com' },
            { id: 'stu_ref6', name: 'DETAIL Magazine', description: '디테일 도면·재료/접합 해설(심화)', url: 'https://www.detail.de' },
            { id: 'stu_ref7', name: 'Landezine', description: '조경 레퍼런스 모음', url: 'https://landezine.com' }
          ]
        },

        // 2) 드로잉/그래픽 학습(표현/보드/다이어그램)
        {
          name: '드로잉/그래픽 학습',
          sites: [
            { id: 'draw1', name: 'Show It Better (YouTube)', description: '보드 구성/다이어그램/렌더 후처리', url: 'https://www.youtube.com/@Showitbetter' },
            { id: 'draw2', name: '30X40 Design Workshop (YouTube)', description: '스튜디오 전략·포트폴리오·표현 팁', url: 'https://www.youtube.com/@30X40DesignWorkshop' },
            { id: 'draw3', name: 'The B1M (YouTube)', description: '대형 프로젝트 스토리텔링(컨텍스트/리서치에 도움)', url: 'https://www.youtube.com/@TheB1M' },
            { id: 'draw4', name: 'Architizer Journal', description: '시각화/포트폴리오 글·튜토리얼', url: 'https://architizer.com/blog/' },
            { id: 'draw5', name: 'Adobe Creative Cloud Tutorials', description: '포토샵/일러/인디자인 기본기', url: 'https://helpx.adobe.com/creative-cloud/tutorials-explore.html' }
          ]
        },

        // 3) 무료 소프트웨어 / 학생 라이선스
        {
          name: '학생 라이선스/무료툴',
          sites: [
            { id: 'edu_sw1', name: 'Autodesk Education', description: '학생 무료 라이선스(Revit/AutoCAD 등)', url: 'https://www.autodesk.com/education/edu-software/overview' },
            { id: 'edu_sw2', name: 'Graphisoft Educational', description: 'ArchiCAD 학생 라이선스', url: 'https://graphisoft.com/education' },
            { id: 'edu_sw3', name: 'Rhino EDU', description: '학생 할인(라이노/그라스호퍼)', url: 'https://www.rhino3d.com/sales/europe/South-Korea/' },
            { id: 'edu_sw4', name: 'SketchUp for Higher Education', description: 'SketchUp Studio EDU(학교/학생용)', url: 'https://www.sketchup.com/education' },
            { id: 'edu_sw5', name: 'QGIS', description: '오픈소스 GIS(완전 무료)', url: 'https://qgis.org' },
            { id: 'edu_sw6', name: 'Blender', description: '오픈소스 3D/애니/렌더', url: 'https://www.blender.org' },
            { id: 'edu_sw7', name: 'FreeCAD / LibreCAD', description: '오픈소스 CAD', url: 'https://www.freecad.org' }
          ]
        },

        // 4) 제작/모형/파브랩(레이저·3D프린트)
        {
          name: '모형제작/파브랩',
          sites: [
            { id: 'fab1', name: 'Instructables', description: '레이저커팅/3D프린팅 팁·튜토리얼', url: 'https://www.instructables.com' },
            { id: 'fab2', name: 'Fab Foundation', description: '전세계 Fab Lab 네트워크·장비', url: 'https://fabfoundation.org' },
            { id: 'fab3', name: 'Prusa Academy', description: '3D 프린트 초급~중급 튜토리얼', url: 'https://www.prusa3d.com/academy/' },
            { id: 'fab4', name: 'Maker\'s Muse (YouTube)', description: '3D프린팅 트러블슈팅', url: 'https://www.youtube.com/@MakersMuse' },
            { id: 'fab5', name: 'Ponoko/Glowforge(참고)', description: '온라인 레이저커팅 서비스/장비', url: 'https://www.ponoko.com' }
          ]
        },

        // 5) 수업/강의(온라인)
        {
          name: '온라인 강의(설계/BIM/표현)',
          sites: [
            { id: 'course1', name: 'Autodesk University', description: 'AU 온디맨드 세션(Revit/워크플로우)', url: 'https://www.autodesk.com/autodesk-university/' },
            { id: 'course2', name: 'Coursera – Architecture & BIM', description: 'BIM/설계/도시/구조 기초부터', url: 'https://www.coursera.org/search?query=architecture%20bim' },
            { id: 'course3', name: 'edX – Architecture', description: '설계/도시/건축사 이론 과정', url: 'https://www.edx.org/learn/architecture' },
            { id: 'course4', name: 'Udemy – Revit/Rhino/SketchUp', description: '도구별 실습 위주 강좌', url: 'https://www.udemy.com/courses/search/?q=revit%20architecture' },
            { id: 'course5', name: 'buildingSMART Korea 교육', description: '오픈BIM/IFC 기초·실무', url: 'https://www.buildingsmart.or.kr/Home/Education' }
          ]
        },

        // 6) 포트폴리오/취업 준비
        {
          name: '포트폴리오/취업',
          sites: [
            { id: 'port1', name: 'Issuu', description: '포트폴리오 e-Book 배포/열람', url: 'https://issuu.com' },
            { id: 'port2', name: 'Canva', description: '보드/표지/타이포 템플릿(간단 제작)', url: 'https://www.canva.com' },
            { id: 'port3', name: 'Behance', description: '온라인 포트폴리오/피드백', url: 'https://www.behance.net' },
            { id: 'port4', name: 'Archinect Jobs', description: '해외 인턴/주니어 포지션', url: 'https://archinect.com/jobs' },
            { id: 'port5', name: '사람인·잡코리아(인턴)', description: '국내 인턴/신입 공고', url: 'https://www.saramin.co.kr' }
          ]
        },

        // 7) 공모전/스튜디오 외 활동(학생전용·초급환영)
        {
          name: '학생 공모전',
          sites: [
            { id: 'comp_s1', name: 'ArchDaily – Competitions', description: '해외 공모/호출(학생 카테고리 포함)', url: 'https://www.archdaily.com' },
            { id: 'comp_s2', name: 'Bustler', description: '국제 공모 포털(학생/초보 친화)', url: 'https://bustler.net' },
            { id: 'comp_s3', name: '서울시/지자체 공모', description: '학생·청년 대상 아이디어 공모 다수', url: 'https://www.seoul.go.kr' },
            { id: 'comp_s4', name: '학교 공지/학회', description: '전공 학회·과 공모/전시(각 학교 게시판)', url: 'https://www.google.com/search?q=%EA%B1%B4%EC%B6%95+%ED%95%99%EA%B3%BC+%EA%B3%B5%EB%AA%A8' }
          ]
        },

        // 8) 이론/역사/저널(리서치 과제용)
        {
          name: '이론/역사/저널',
          sites: [
            { id: 'theory1', name: 'AURIC', description: '국내 학술/기술자료·논문', url: 'https://www.auric.or.kr' },
            { id: 'theory2', name: 'Google Scholar', description: '학술 논문 통합 검색', url: 'https://scholar.google.com' },
            { id: 'theory3', name: 'MIT OpenCourseWare – Architecture', description: '무료 강의노트/자료', url: 'https://ocw.mit.edu/search/?d=Architecture' },
            { id: 'theory4', name: 'Domus / AA Files(소개)', description: '이론·비평 저널(영문)', url: 'https://www.domusweb.it' }
          ]
        },

        // 9) 커뮤니티/멘토링/학교생활
        {
          name: '커뮤니티/멘토링',
          sites: [
            { id: 'comm_s1', name: 'Reddit r/architecturestudents', description: '과제/포폴/진로 Q&A', url: 'https://www.reddit.com/r/architectureStudents/' },
            { id: 'comm_s2', name: 'Reddit r/architecture', description: '일반 건축 토론/자료', url: 'https://www.reddit.com/r/architecture/' },
            { id: 'comm_s3', name: '디시 건축갤', description: '국내 학생/실무 혼합 커뮤니티', url: 'https://www.dcinside.com' },
            { id: 'comm_s4', name: '네이버 카페(건축/스케치/렌더)', description: '국내 Q&A/자료(카페별 확인)', url: 'https://section.cafe.naver.com' }
          ]
        },

        // 10) 시각화 에셋(텍스처/폰트/아이콘)
        {
          name: '시각화 에셋',
          sites: [
            { id: 'asset1', name: 'Poly Haven', description: 'CC0 HDRI/텍스처/3D(과제 시각화)', url: 'https://polyhaven.com' },
            { id: 'asset2', name: 'ambientCG', description: 'CC0 텍스처', url: 'https://ambientcg.com' },
            { id: 'asset3', name: '3D Warehouse', description: 'SketchUp 모델 라이브러리', url: 'https://3dwarehouse.sketchup.com' },
            { id: 'asset4', name: 'Google Fonts', description: '무료 폰트(라틴/국문 혼용)', url: 'https://fonts.google.com' },
            { id: 'asset5', name: 'Flaticon', description: '아이콘/벡터(라이선스 확인)', url: 'https://www.flaticon.com' }
          ]
        },

        // 11) 실무 친화 도구(학생 추천: 생산성/정리)
        {
          name: '유용한 프로그램(학생용)',
          sites: [
            { id: 'tool_s1', name: 'Notion', description: '스튜디오/수업별 위키·레퍼런스 정리', url: 'https://www.notion.so' },
            { id: 'tool_s2', name: 'Obsidian', description: '로컬 노트/리서치 링크·PDF 정리', url: 'https://obsidian.md' },
            { id: 'tool_s3', name: 'Canva', description: '간단 보드/포스터/발표물 제작', url: 'https://www.canva.com' },
            { id: 'tool_s4', name: 'Everything', description: '과제 파일 초고속 검색', url: 'https://www.voidtools.com' },
            { id: 'tool_s5', name: 'Ditto', description: '클립보드 히스토리(도면/이미지 붙여넣기 편의)', url: 'https://ditto-cp.sourceforge.io/' },
            { id: 'tool_s6', name: 'PDF-XChange Editor', description: 'PDF 주석·리뷰(가벼움)', url: 'https://www.tracker-software.com/product/pdf-xchange-editor' },
            { id: 'tool_s7', name: 'ImageGlass', description: '경량 이미지 뷰어(시안 비교)', url: 'https://imageglass.org' },
            { id: 'tool_s8', name: 'Rainlendar / DesktopCal', description: '바탕화면 일정/마감 관리', url: 'https://www.rainlendar.net' }
          ]
        },

        // 12) 필수 툴 포럼/팁(학생도 바로 도움됨)
        {
          name: '툴 포럼/팁',
          sites: [
            { id: 'tips1', name: 'XiCAD', description: 'AutoCAD 보조툴/실무 단축키·팁', url: 'https://izzarder.com' },
            { id: 'tips2', name: 'Autodesk Forums', description: 'Revit/AutoCAD 공식 Q&A', url: 'https://forums.autodesk.com' },
            { id: 'tips3', name: 'SketchUp Community', description: '스케치업 포럼', url: 'https://forums.sketchup.com' },
            { id: 'tips4', name: 'Rhino Forum', description: '라이노/그라스호퍼 Q&A', url: 'https://discourse.mcneel.com' }
          ]
        }
      ]
    };
  }

  // 기본 데이터 (다른 카테고리들은 간소화)
  return {
    title: '카테고리 정보',
    categories: [
      {
        name: '기본 사이트',
        sites: [
          { id: 'default1', name: 'Google', description: '검색 엔진', url: 'https://www.google.com' },
          { id: 'default2', name: 'YouTube', description: '동영상 플랫폼', url: 'https://www.youtube.com' },
          { id: 'default3', name: 'GitHub', description: '코드 저장소', url: 'https://www.github.com' }
        ]
      }
    ]
  };
};

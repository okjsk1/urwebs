import { SiteCard } from './SiteCard';
import { useState, useEffect } from 'react';

interface Site {
  name: string;
  description: string;
  url: string;
  tags?: string[];
  id: string;
}

interface SiteCategory {
  name: string;
  sites: Site[];
}

interface CategoryData {
  [key: string]: {
    [subCategory: string]: {
      title: string;
      categories: SiteCategory[];
    };
  };
}

const categoryData: CategoryData = {
  'architecture': {
    'student': {
      title: '건축 - 학생',
      categories: [
        {
          name: '디자인',
          sites: [
            { id: 'arch1', name: '핀터레스트', description: '디자인 아이디어 모음', url: 'https://www.pinterest.co.kr', tags: ['아이디어', '디자인'] },
            { id: 'arch2', name: '인스타그램', description: '건축 해시태그', url: 'https://www.instagram.com', tags: ['SNS', '트렌드'] },
            { id: 'arch3', name: '유튜브', description: '건축 동영상 강의', url: 'https://www.youtube.com', tags: ['동영상', '강의'] },
            { id: 'arch4', name: '네이버블로그', description: '건축 블로그', url: 'https://blog.naver.com', tags: ['블로그', '정보'] },
            { id: 'arch5', name: 'CA Korea', description: '건축잡지', url: 'http://www.cakorea.com', tags: ['잡지', '매거진'] },
            { id: 'arch6', name: 'Dami Lee', description: '건축 유튜버', url: 'https://www.youtube.com/@DamiLeeArch', tags: ['유튜버', '교육'] },
            { id: 'arch7', name: '30x40 Design', description: '건축 워크샵', url: 'https://www.30by40.com', tags: ['워크샵', '교육'] },
            { id: 'arch8', name: 'The B1M', description: '건축 채널', url: 'https://www.theb1m.com', tags: ['채널', '정보'] }
          ]
        },
        {
          name: '공모전',
          sites: [
            { id: 'comp1', name: '조물조물', description: '국내 공모전 정보', url: 'https://www.jomul.co.kr', tags: ['공모전', '국내'] },
            { id: 'comp2', name: '씽굿', description: '공모전 플랫폼', url: 'https://thinkcontest.com', tags: ['공모전', '플랫폼'] },
            { id: 'comp3', name: '온콘', description: '온라인 공모전', url: 'https://www.oncon.co.kr', tags: ['온라인', '공모전'] },
            { id: 'comp4', name: 'UIA', description: '국제건축연맹', url: 'https://www.uia-architectes.org', tags: ['국제', 'UIA'] },
            { id: 'comp5', name: 'Architizer A+', description: '글로벌 건축상', url: 'https://architizer.com/awards', tags: ['글로벌', '건축상'] },
            { id: 'comp6', name: 'eVolo', description: '고층 건물 공모전', url: 'http://www.evolo.us', tags: ['고층건물', '공모전'] },
            { id: 'comp7', name: 'Bee Breeders', description: '건축 공모전', url: 'https://www.beebreeders.com', tags: ['건축', '공모전'] },
            { id: 'comp8', name: 'Never Too Small', description: '소형 건축', url: 'https://www.nevertoosmall.com', tags: ['소형건축', '디자인'] }
          ]
        },
        {
          name: '자료실',
          sites: [
            { id: 'ref1', name: 'Stewart Hicks', description: '건축 유튜버', url: 'https://www.youtube.com/@stewarthicks', tags: ['유튜버', '교육'] },
            { id: 'ref2', name: '건축기행', description: '건축 여행기', url: 'https://blog.naver.com/arch_travel', tags: ['여행기', '건축'] },
            { id: 'ref3', name: 'C3 Korea', description: '건축 매거진', url: 'http://www.c3korea.com', tags: ['매거진', '건축'] },
            { id: 'ref4', name: 'MARU(마루)', description: '건축 웹진', url: 'http://www.maru180.com', tags: ['웹진', '건축'] },
            { id: 'ref5', name: 'A&C(건축과문화)', description: '건축잡지', url: 'http://www.ancnc.org', tags: ['잡지', '문화'] },
            { id: 'ref6', name: '건축세계', description: '건축 전문지', url: 'http://www.abworld.co.kr', tags: ['전문지', '건축'] },
            { id: 'ref7', name: 'Architect', description: '건축 정보 사이트', url: 'http://www.architect.co.kr', tags: ['정보', '사이트'] },
            { id: 'ref8', name: 'SPACE(공간)', description: '건축 전문 매거진', url: 'http://www.vmspace.com', tags: ['매거진', '공간'] }
          ]
        },
        {
          name: '커뮤니티',
          sites: [
            { id: 'com1', name: '인벤토리', description: '건축 커뮤니티', url: 'https://www.inventory.co.kr', tags: ['커뮤니티', '건축'] },
            { id: 'com2', name: '건축인포럼', description: '건축인 모임', url: 'http://cafe.naver.com/archipeople', tags: ['포럼', '모임'] },
            { id: 'com3', name: '건축학과', description: '학과 커뮤니티', url: 'http://cafe.daum.net/architecture', tags: ['학과', '커뮤니티'] },
            { id: 'com4', name: '아키토피아', description: '건축 토론', url: 'http://www.architopia.co.kr', tags: ['토론', '건축'] },
            { id: 'com5', name: '오픈하우스서울', description: '건축투어', url: 'https://ohseoul.org', tags: ['투어', '서울'] },
            { id: 'com6', name: '건축학교', description: '건축 교육', url: 'http://www.archikorea.net', tags: ['교육', '학교'] },
            { id: 'com7', name: '건축인증원', description: '인증 정보', url: 'https://www.kaab.or.kr', tags: ['인증', '정보'] },
            { id: 'com8', name: '한국건축가협회', description: '건축가 협회', url: 'https://www.kia.or.kr', tags: ['협회', '건축가'] }
          ]
        },
        {
          name: '지도',
          sites: [
            { id: 'map1', name: 'World Wind', description: 'NASA 3D 지구본', url: 'https://worldwind.arc.nasa.gov', tags: ['NASA', '3D'] },
            { id: 'map2', name: 'Google Earth', description: '구글 어스', url: 'https://earth.google.com', tags: ['구글', '어스'] },
            { id: 'map3', name: 'OpenStreetMap', description: '오픈 지도', url: 'https://www.openstreetmap.org', tags: ['오픈소스', '지도'] },
            { id: 'map4', name: 'ArcGIS Online', description: 'ESRI 웹맵', url: 'https://www.arcgis.com', tags: ['ESRI', 'GIS'] },
            { id: 'map5', name: 'QGIS', description: 'QGIS 공식 사이트', url: 'https://qgis.org', tags: ['QGIS', '공식'] },
            { id: 'map6', name: 'V World', description: '3차원 국토정보', url: 'https://www.vworld.kr', tags: ['3차원', '국토'] },
            { id: 'map7', name: '국가공간정보포털', description: '공간정보 서비스', url: 'https://www.nsdi.go.kr', tags: ['공간정보', '포털'] },
            { id: 'map8', name: '건설기준정보', description: '건설기준 통합정보', url: 'http://www.kcsc.re.kr', tags: ['건설', '기준'] }
          ]
        },
        {
          name: '사이트',
          sites: [
            { id: 'site1', name: '캐치온', description: '건축 아카이브', url: 'http://www.catchon.co.kr', tags: ['아카이브', '건축'] },
            { id: 'site2', name: 'Never Too Small', description: '작은 공간 디자인', url: 'https://www.nevertoosmall.com', tags: ['작은공간', '디자인'] },
            { id: 'site3', name: 'Stewart Hicks', description: '건축 교육 채널', url: 'https://www.youtube.com/@stewarthicks', tags: ['교육', '채널'] },
            { id: 'site4', name: 'ArchDaily', description: '세계 건축 정보', url: 'https://www.archdaily.com', tags: ['세계', '정보'] },
            { id: 'site5', name: 'Dezeen', description: '디자인 매거진', url: 'https://www.dezeen.com', tags: ['디자인', '매거진'] },
            { id: 'site6', name: 'Inhabitat', description: '지속가능 디자인', url: 'https://inhabitat.com', tags: ['지속가능', '디자인'] },
            { id: 'site7', name: 'Dwell', description: '모던 건축', url: 'https://www.dwell.com', tags: ['모던', '건축'] },
            { id: 'site8', name: 'Architectural Digest', description: '건축 다이제스트', url: 'https://www.architecturaldigest.com', tags: ['다이제스트', '건축'] }
          ]
        }
      ]
    },
    'professional': {
      title: '건축 - 직장인',
      categories: [
        {
          name: '법규/코드',
          sites: [
            { id: 'law1', name: '국가법령정보센터', description: '법령 검색', url: 'https://www.law.go.kr', tags: ['법령', '검색'] },
            { id: 'law2', name: '국토교통부', description: '건축 정책', url: 'https://www.molit.go.kr', tags: ['정책', '국토부'] },
            { id: 'law3', name: '국가건설기준센터', description: '건설 기준', url: 'https://www.kcsc.re.kr', tags: ['기준', '건설'] },
            { id: 'law4', name: '건축허가시스템', description: '온라인 허가', url: 'https://www.eais.go.kr', tags: ['허가', '온라인'] },
            { id: 'law5', name: 'KATS 국가기술표준원', description: '기술 표준', url: 'https://www.kats.go.kr', tags: ['기술', '표준'] },
            { id: 'law6', name: 'KCL', description: '건설기술연구원', url: 'https://www.kcl.re.kr', tags: ['연구원', '건설기술'] },
            { id: 'law7', name: 'KEIIT 환경기술', description: '환경 기술', url: 'https://www.keiit.re.kr', tags: ['환경', '기술'] },
            { id: 'law8', name: '한국건설기술연구원', description: '건설 연구', url: 'https://www.kict.re.kr', tags: ['연구', '건설'] }
          ]
        },
        {
          name: '인허가/대지규제',
          sites: [
            { id: 'permit1', name: '서울인허가포털', description: '서울시 인허가', url: 'https://eum.seoul.go.kr', tags: ['서울시', '인허가'] },
            { id: 'permit2', name: '토지이용규제정보', description: '토지 규제', url: 'https://luris.go.kr', tags: ['토지', '규제'] },
            { id: 'permit3', name: '부동산종합공부시스템', description: '부동산 정보', url: 'https://www.reb.or.kr', tags: ['부동산', '정보'] },
            { id: 'permit4', name: '국토정보맵', description: '국토 정보', url: 'https://map.ngii.go.kr', tags: ['국토', '지도'] },
            { id: 'permit5', name: 'VWorld', description: '3차원 지도', url: 'https://www.vworld.kr', tags: ['3차원', '지도'] },
            { id: 'permit6', name: '우리동네지도', description: '동네 지도', url: 'https://map.kakao.com', tags: ['동네', '지도'] },
            { id: 'permit7', name: '국가공간정보포털', description: '공간 정보', url: 'https://www.nsdi.go.kr', tags: ['공간', '정보'] },
            { id: 'permit8', name: '지적재조사', description: '지적 정보', url: 'https://www.rlr.go.kr', tags: ['지적', '재조사'] }
          ]
        },
        {
          name: '지적지도/GIS',
          sites: [
            { id: 'gis1', name: '국가공간정보포털', description: '공간정보 다운로드', url: 'https://www.nsdi.go.kr', tags: ['공간정보', '다운로드'] },
            { id: 'gis2', name: 'V World', description: '3차원 국토정보', url: 'https://www.vworld.kr', tags: ['3차원', '국토정보'] },
            { id: 'gis3', name: '국토지리정보원', description: '지리 정보', url: 'https://www.ngii.go.kr', tags: ['지리', '정보'] },
            { id: 'gis4', name: '건축물대장', description: '건축물 정보', url: 'https://www.gov.kr', tags: ['건축물', '대장'] },
            { id: 'gis5', name: '지적소관청', description: '지적 업무', url: 'https://www.molit.go.kr', tags: ['지적', '업무'] },
            { id: 'gis6', name: '측량업체협회', description: '측량 업체', url: 'https://www.kals.or.kr', tags: ['측량', '업체'] },
            { id: 'gis7', name: '한국국토정보공사', description: 'LX 공사', url: 'https://www.lx.or.kr', tags: ['LX', '공사'] },
            { id: 'gis8', name: 'Specle', description: '3D 데이터 플랫폼', url: 'https://speckle.systems', tags: ['3D', '플랫폼'] }
          ]
        },
        {
          name: '설계 레퍼런스/매거진',
          sites: [
            { id: 'mag1', name: 'C3 Korea', description: '건축 매거진', url: 'http://www.c3korea.com', tags: ['매거진', '건축'] },
            { id: 'mag2', name: 'ArchDaily', description: '세계 건축', url: 'https://www.archdaily.com', tags: ['세계', '건축'] },
            { id: 'mag3', name: 'Dezeen', description: '디자인 뉴스', url: 'https://www.dezeen.com', tags: ['디자인', '뉴스'] },
            { id: 'mag4', name: 'DETAIL', description: '건축 디테일', url: 'https://www.detail.de', tags: ['디테일', '건축'] },
            { id: 'mag5', name: 'Domus', description: '이탈리아 건축지', url: 'https://www.domusweb.it', tags: ['이탈리아', '건축지'] },
            { id: 'mag6', name: 'Wallpaper', description: '디자인 매거진', url: 'https://www.wallpaper.com', tags: ['디자인', '매거진'] },
            { id: 'mag7', name: 'Architectural Review', description: '건축 리뷰', url: 'https://www.architectural-review.com', tags: ['건축', '리뷰'] },
            { id: 'mag8', name: 'Metropolis', description: '도시 건축', url: 'https://www.metropolismag.com', tags: ['도시', '건축'] }
          ]
        },
        {
          name: '자재시공/업체',
          sites: [
            { id: 'mat1', name: 'KATS 국가기술표준원', description: '기술 표준', url: 'https://www.kats.go.kr', tags: ['기술', '표준'] },
            { id: 'mat2', name: 'KCL', description: '건설기술연구원', url: 'https://www.kcl.re.kr', tags: ['건설기술', '연구'] },
            { id: 'mat3', name: 'KISTI 원문정보', description: '과학기술정보', url: 'https://www.kisti.re.kr', tags: ['과학기술', '정보'] },
            { id: 'mat4', name: 'BiMObject', description: 'BIM 객체', url: 'https://www.bimobject.com', tags: ['BIM', '객체'] },
            { id: 'mat5', name: 'NBS Source', description: '건설 사양서', url: 'https://www.thenbs.com', tags: ['건설', '사양서'] },
            { id: 'mat6', name: 'Arcat', description: '건축 자재', url: 'https://www.arcat.com', tags: ['건축', '자재'] },
            { id: 'mat7', name: 'Sweets', description: '건설 제품', url: 'https://sweets.construction.com', tags: ['건설', '제품'] },
            { id: 'mat8', name: 'Masterspec', description: '건축 사양', url: 'https://www.masterspec.co.nz', tags: ['건축', '사양'] }
          ]
        },
        {
          name: 'BIM/협업',
          sites: [
            { id: 'bim1', name: 'Revit Help', description: 'Revit 도움말', url: 'https://help.autodesk.com/view/RVT', tags: ['Revit', '도움말'] },
            { id: 'bim2', name: 'ArchiCAD Resources', description: 'ArchiCAD 자료', url: 'https://www.graphisoft.com', tags: ['ArchiCAD', '자료'] },
            { id: 'bim3', name: 'Navisworks Docs', description: 'Navisworks 문서', url: 'https://help.autodesk.com/view/NAV', tags: ['Navisworks', '문서'] },
            { id: 'bim4', name: 'buildingSMART', description: 'BIM 표준', url: 'https://www.buildingsmart.org', tags: ['BIM', '표준'] },
            { id: 'bim5', name: 'BIM Forum', description: 'BIM 포럼', url: 'https://www.bimforum.org', tags: ['BIM', '포럼'] },
            { id: 'bim6', name: 'AGC BIM', description: '건설업체 BIM', url: 'https://www.agc.org/bim', tags: ['건설업체', 'BIM'] },
            { id: 'bim7', name: 'BIM 360', description: 'Autodesk BIM 360', url: 'https://www.autodesk.com/bim-360', tags: ['Autodesk', 'BIM360'] },
            { id: 'bim8', name: 'Tekla Warehouse', description: 'Tekla 라이브러리', url: 'https://warehouse.tekla.com', tags: ['Tekla', '라이브러리'] }
          ]
        }
      ]
    }
  },
  'real-estate': {
    'landlord': {
      title: '부동산 - 임대인',
      categories: [
        {
          name: '임대 관리',
          sites: [
            { id: 're1', name: '직방 임대관리', description: '임대료 및 계약 관리', url: 'https://www.zigbang.com/owner', tags: ['관리', '계약'] },
            { id: 're2', name: '다방 오너스', description: '임대수익 관리 서비스', url: 'https://owner.dabangapp.com', tags: ['수익', '관리'] },
            { id: 're3', name: '국세청 홈택스', description: '임대소득 신고', url: 'https://www.hometax.go.kr', tags: ['세금', '신고'] },
            { id: 're4', name: '부동산관리시스템', description: '임대차 통합관리', url: 'https://www.reb.or.kr', tags: ['통합관리', '시스템'] },
            { id: 're5', name: '펀퍼니', description: '임대수익 극대화', url: 'https://www.funfunny.com', tags: ['수익', '관리'] },
            { id: 're6', name: '호갱노노', description: '부동산 정보 검증', url: 'https://hogangnono.com', tags: ['정보', '검증'] }
          ]
        },
        {
          name: '법률/세무',
          sites: [
            { id: 're7', name: '법무부 인터넷등기소', description: '등기부등본 발급', url: 'https://www.iros.go.kr', tags: ['등기', '서류'] },
            { id: 're8', name: '한국부동산원', description: '부동산 정보 통합', url: 'https://www.reb.or.kr', tags: ['정보', '통합'] },
            { id: 're9', name: '임대차보호법', description: '임대차 관련 법령', url: 'https://www.law.go.kr', tags: ['법령', '보호'] },
            { id: 're10', name: '부동산세무', description: '부동산 세무 정보', url: 'https://taxinfo.nts.go.kr', tags: ['세무', '정보'] },
            { id: 're11', name: '법률홈닥터', description: '부동산 법률 상담', url: 'https://www.lawhd.com', tags: ['법률', '상담'] },
            { id: 're12', name: '부동산 세무 계산기', description: '양도소득세 계산', url: 'https://tax.go.kr', tags: ['세무', '계산'] }
          ]
        }
      ]
    },
    'tenant': {
      title: '부동산 - 임차인',
      categories: [
        {
          name: '매물 검색',
          sites: [
            { id: 're13', name: '직방', description: '원룸, 투룸 전문', url: 'https://www.zigbang.com', tags: ['원룸', '투룸'] },
            { id: 're14', name: '다방', description: '부동산 앱', url: 'https://www.dabangapp.com', tags: ['앱', '검색'] },
            { id: 're15', name: '네이버 부동산', description: '네이버 부동산 서비스', url: 'https://land.naver.com', tags: ['네이버', '통합'] },
            { id: 're16', name: '부동산114', description: '부동산 종합 정보', url: 'https://www.r114.com', tags: ['종합', '정보'] },
            { id: 're17', name: '피터팬의 좋은방 구하기', description: '부동산 앱', url: 'https://www.peterpanz.com', tags: ['앱', '매물'] },
            { id: 're18', name: '방123', description: '원룸 투룸 전문', url: 'https://www.room123.co.kr', tags: ['원룸', '전문'] }
          ]
        },
        {
          name: '계약/보험',
          sites: [
            { id: 're19', name: '전월세보증보험', description: 'HUG 전월세보증보험', url: 'https://www.khug.or.kr', tags: ['보증보험', 'HUG'] },
            { id: 're20', name: '임대차신고센터', description: '임대차 신고 시스템', url: 'https://www.rtms.kr', tags: ['신고', '시스템'] },
            { id: 're21', name: '부동산거래관리시스템', description: '부동산 거래 신고', url: 'https://rtms.molit.go.kr', tags: ['거래', '신고'] },
            { id: 're22', name: '임차권등기명령', description: '임차권 보호', url: 'https://www.scourt.go.kr', tags: ['등기', '보호'] },
            { id: 're23', name: '전월세 안심보험', description: '전월세 보험 상품', url: 'https://www.sgic.co.kr', tags: ['보험', '안심'] },
            { id: 're24', name: '청년전월세대출', description: '청년 주거 지원', url: 'https://www.hf.go.kr', tags: ['청년', '대출'] }
          ]
        }
      ]
    },
    'agent': {
      title: '부동산 - 공인중개사',
      categories: [
        {
          name: '업무 도구',
          sites: [
            { id: 're25', name: '부동산거래관리시스템', description: '거래 신고 및 관리', url: 'https://rtms.molit.go.kr', tags: ['거래', '관리'] },
            { id: 're26', name: '한국공인중개사협회', description: '중개사 업무 지원', url: 'https://www.kar.or.kr', tags: ['협회', '지원'] },
            { id: 're27', name: '부동산 실거래가', description: '실거래가 조회', url: 'https://rt.molit.go.kr', tags: ['실거래가', '조회'] },
            { id: 're28', name: '온비드', description: '공매 정보 시스템', url: 'https://www.onbid.co.kr', tags: ['공매', '경매'] },
            { id: 're29', name: '부동산전문가', description: '중개업무 포털', url: 'https://www.reps.or.kr', tags: ['포털', '업무'] },
            { id: 're30', name: 'KB부동산', description: 'KB 부동산 시세', url: 'https://onland.kbstar.com', tags: ['시세', 'KB'] }
          ]
        },
        {
          name: '교육/자격',
          sites: [
            { id: 're31', name: '부동산교육원', description: '공인중개사 교육', url: 'https://www.kab.co.kr', tags: ['교육', '자격'] },
            { id: 're32', name: '한국산업인력공단', description: '공인중개사 시험', url: 'https://www.q-net.or.kr', tags: ['시험', '자격'] },
            { id: 're33', name: '부동산연수원', description: '부동산 전문교육', url: 'https://www.rei.go.kr', tags: ['연수', '전문'] },
            { id: 're34', name: '법무연수원', description: '법무 교육', url: 'https://www.lrti.go.kr', tags: ['법무', '교육'] },
            { id: 're35', name: '부동산학회', description: '부동산 학술 정보', url: 'https://www.kreaa.org', tags: ['학술', '연구'] },
            { id: 're36', name: '감정평가사협회', description: '감정평가 정보', url: 'https://www.kab.co.kr', tags: ['감정평가', '협회'] }
          ]
        }
      ]
    }
  },
  'content-creator': {
    'youtuber': {
      title: '콘텐츠 크리에이터 - 유튜버',
      categories: [
        {
          name: '영상 제작',
          sites: [
            { id: 'yt1', name: 'YouTube 크리에이터 아카데미', description: '유튜브 공식 교육', url: 'https://creatoracademy.youtube.com', tags: ['교육', '공식'] },
            { id: 'yt2', name: 'DaVinci Resolve', description: '무료 영상 편집 프로그램', url: 'https://www.blackmagicdesign.com/kr/products/davinciresolve', tags: ['무료', '편집'] },
            { id: 'yt3', name: 'Adobe Premiere Pro', description: '전문 영상 편집', url: 'https://www.adobe.com/kr/products/premiere.html', tags: ['전문', '편집'] },
            { id: 'yt4', name: '픽사베이', description: '무료 영상 및 이미지', url: 'https://pixabay.com/ko/', tags: ['무료', '소스'] },
            { id: 'yt5', name: 'Unsplash', description: '무료 고품질 이미지', url: 'https://unsplash.com', tags: ['무료', '이미지'] },
            { id: 'yt6', name: 'Pexels', description: '무료 영상 및 사진', url: 'https://www.pexels.com', tags: ['무료', '스톡'] }
          ]
        },
        {
          name: '채널 관리',
          sites: [
            { id: 'yt7', name: 'YouTube Studio', description: '채널 분석 및 관리', url: 'https://studio.youtube.com', tags: ['분석', '관리'] },
            { id: 'yt8', name: 'VidIQ', description: 'YouTube SEO 도구', url: 'https://vidiq.com', tags: ['SEO', '최적화'] },
            { id: 'yt9', name: 'TubeBuddy', description: 'YouTube 채널 최적화', url: 'https://www.tubebuddy.com', tags: ['최적화', '도구'] },
            { id: 'yt10', name: 'Social Blade', description: '채널 통계 분석', url: 'https://socialblade.com', tags: ['통계', '분석'] },
            { id: 'yt11', name: '크리에이터 이코노미 리포트', description: '유튜브 수익 분석', url: 'https://creatoreconomy.kr', tags: ['수익', '분석'] },
            { id: 'yt12', name: 'YouTube Trends', description: '유튜브 트렌드 정보', url: 'https://www.youtube.com/trends', tags: ['트렌드', '정보'] }
          ]
        }
      ]
    },
    'streamer': {
      title: '콘텐츠 크리에이터 - 스트리머',
      categories: [
        {
          name: '스트리밍 도구',
          sites: [
            { id: 'st1', name: 'OBS Studio', description: '무료 방송 소프트웨어', url: 'https://obsproject.com', tags: ['무료', '방송'] },
            { id: 'st2', name: 'Streamlabs', description: '스트리밍 도구 통합', url: 'https://streamlabs.com', tags: ['통합', '도구'] },
            { id: 'st3', name: '아프리카TV', description: '국내 대표 스트리밍', url: 'https://www.afreecatv.com', tags: ['국내', '스트리밍'] },
            { id: 'st4', name: 'Twitch', description: '글로벌 스트리밍 플랫폼', url: 'https://www.twitch.tv', tags: ['글로벌', '스트리밍'] },
            { id: 'st5', name: 'YouTube Live', description: '유튜브 라이브 스트리밍', url: 'https://www.youtube.com/live', tags: ['유튜브', '라이브'] },
            { id: 'st6', name: 'XSplit', description: '스트리밍 방송 소프트웨어', url: 'https://www.xsplit.com', tags: ['방송', '소프트웨어'] }
          ]
        },
        {
          name: '커뮤니티',
          sites: [
            { id: 'st7', name: '인벤', description: '게임 커뮤니티', url: 'https://www.inven.co.kr', tags: ['게임', '커뮤니티'] },
            { id: 'st8', name: '스트리머 갤러리', description: 'DC인사이드 스트리머 갤러리', url: 'https://gall.dcinside.com/streamer', tags: ['커뮤니티', '정보'] },
            { id: 'st9', name: 'Reddit Streaming', description: '해외 스트리밍 커뮤니티', url: 'https://www.reddit.com/r/streaming', tags: ['해외', '커뮤니티'] },
            { id: 'st10', name: 'YouTube Gaming', description: '유튜브 게임 스트리밍', url: 'https://gaming.youtube.com', tags: ['유튜브', '게임'] },
            { id: 'st11', name: '스트리머 노하우', description: '스트리밍 팁 커뮤니티', url: 'https://streamer.co.kr', tags: ['팁', '노하우'] },
            { id: 'st12', name: '게임메카', description: '게임 관련 뉴스', url: 'https://www.gamemeca.com', tags: ['게임', '뉴스'] }
          ]
        }
      ]
    }
  },
  'finance': {
    'stock': {
      title: '금융/투자 - 주식',
      categories: [
        {
          name: '거래 플랫폼',
          sites: [
            { id: 'st1', name: '키움증권 영웅문', description: '온라인 주식거래', url: 'https://www1.kiwoomhero.com', tags: ['거래', '온라인'] },
            { id: 'st2', name: '삼성증권', description: 'mPOP 주식거래', url: 'https://www.samsungpop.com', tags: ['거래', 'MTS'] },
            { id: 'st3', name: '미래에셋대우', description: 'mPAM 주식거래', url: 'https://securities.miraeasset.com', tags: ['거래', '증권'] },
            { id: 'st4', name: '토스증권', description: '간편 주식투자', url: 'https://tossinvest.com', tags: ['간편', '투자'] },
            { id: 'st5', name: 'NH투자증권', description: 'WTS 주식거래', url: 'https://www.nhqv.com', tags: ['거래', 'WTS'] },
            { id: 'st6', name: '카카오페이증권', description: '간편 투자 서비스', url: 'https://securities.kakaopay.com', tags: ['간편', '카카오'] },
            { id: 'st7', name: 'KB증권', description: 'KB 스타뱅킹', url: 'https://www.kbsec.com', tags: ['KB', '증권'] },
            { id: 'st8', name: '신한투자증권', description: '신한 S-money', url: 'https://www.shinhaninvest.com', tags: ['신한', 'S-money'] }
          ]
        },
        {
          name: '정보/분석',
          sites: [
            { id: 'st9', name: '네이버 금융', description: '주식 정보 및 차트', url: 'https://finance.naver.com', tags: ['정보', '차트'] },
            { id: 'st10', name: '다음 금융', description: '증시 정보', url: 'https://finance.daum.net', tags: ['증시', '정보'] },
            { id: 'st11', name: '한국거래소', description: '공식 시장 정보', url: 'https://www.krx.co.kr', tags: ['공식', '시장'] },
            { id: 'st12', name: '38커뮤니케이션', description: '투자 정보 커뮤니티', url: 'https://www.38.co.kr', tags: ['커뮤니티', '정보'] },
            { id: 'st13', name: '팍스넷', description: '주식 정보 플랫폼', url: 'https://www.paxnet.co.kr', tags: ['정보', '플랫폼'] },
            { id: 'st14', name: '이데일리', description: '경제 뉴스', url: 'https://www.edaily.co.kr', tags: ['뉴스', '경제'] },
            { id: 'st15', name: '한국경제', description: '경제 신문', url: 'https://www.hankyung.com', tags: ['신문', '경제'] },
            { id: 'st16', name: '매일경제', description: '경제 뉴스', url: 'https://www.mk.co.kr', tags: ['뉴스', '경제'] }
          ]
        },
        {
          name: '커뮤니티',
          sites: [
            { id: 'st17', name: '클리앙 주식', description: '주식 토론', url: 'https://www.clien.net/service/board/invest', tags: ['커뮤니티', '토론'] },
            { id: 'st18', name: '디시인사이드 주식갤', description: '주식 갤러리', url: 'https://gall.dcinside.com/board/lists/?id=stock', tags: ['갤러리', '커뮤니티'] },
            { id: 'st19', name: '네이버 증권카페', description: '증권 카페', url: 'https://cafe.naver.com/stockhouse', tags: ['카페', '증권'] },
            { id: 'st20', name: '와이즈리포트', description: '투자 리포트', url: 'https://www.wisereport.co.kr', tags: ['리포트', '분석'] },
            { id: 'st21', name: 'SameDifference', description: '해외 투자 정보', url: 'https://www.samediff.co.kr', tags: ['해외', '투자'] },
            { id: 'st22', name: '인베스팅닷컴', description: '글로벌 투자 정보', url: 'https://kr.investing.com', tags: ['글로벌', '투자'] }
          ]
        },
        {
          name: '학습/교육',
          sites: [
            { id: 'st23', name: '한국투자교육원', description: '투자 교육', url: 'https://www.kifin.or.kr', tags: ['교육', '투자'] },
            { id: 'st24', name: '증권금융아카데미', description: '금융 교육', url: 'https://www.ksfi.or.kr', tags: ['금융', '교육'] },
            { id: 'st25', name: '네이버 증권 스쿨', description: '투자 기초 교육', url: 'https://finance.naver.com/school', tags: ['기초', '교육'] },
            { id: 'st26', name: '인베스톡', description: '투자 커뮤니티', url: 'https://www.investalk.kr', tags: ['커뮤니티', '교육'] },
            { id: 'st27', name: '핀다', description: '금융 상품 비교', url: 'https://www.finda.co.kr', tags: ['비교', '금융상품'] },
            { id: 'st28', name: '뱅크샐러드', description: '자산 관리', url: 'https://www.banksalad.com', tags: ['자산관리', '앱'] }
          ]
        },
        {
          name: '세무/세금',
          sites: [
            { id: 'st29', name: '국세청 홈택스', description: '세금 신고', url: 'https://www.hometax.go.kr', tags: ['세금', '신고'] },
            { id: 'st30', name: '세무서비스 24', description: '세무 상담', url: 'https://www.taxinfo.go.kr', tags: ['상담', '세무'] },
            { id: 'st31', name: '주식 양도소득세 계산기', description: '세금 계산', url: 'https://stocktax.kr', tags: ['계산기', '양도세'] },
            { id: 'st32', name: '세무법인 나무', description: '세무 상담', url: 'https://www.taxnamu.com', tags: ['상담', '세무법인'] },
            { id: 'st33', name: '택스넷', description: '세무 정보', url: 'https://www.taxnet.or.kr', tags: ['정보', '세무'] },
            { id: 'st34', name: '증권거래세 계산기', description: '거래세 계산', url: 'https://calc.taxcalc.kr', tags: ['계산기', '거래세'] }
          ]
        },
        {
          name: 'ETF/펀드',
          sites: [
            { id: 'st35', name: 'ETF Research', description: 'ETF 정보', url: 'https://www.etfresearch.co.kr', tags: ['ETF', '정보'] },
            { id: 'st36', name: '코리아펀드하우스', description: '펀드 정보', url: 'https://www.koreafund.com', tags: ['펀드', '정보'] },
            { id: 'st37', name: '모닝스타', description: '펀드 평가', url: 'https://www.morningstar.co.kr', tags: ['평가', '펀드'] },
            { id: 'st38', name: 'FnGuide', description: '투자 정보', url: 'https://www.fnguide.com', tags: ['투자', '정보'] },
            { id: 'st39', name: '한국펀드평가', description: '펀드 평가', url: 'https://www.kfia.or.kr', tags: ['평가', '펀드'] },
            { id: 'st40', name: 'ZEROin', description: '펀드 정보', url: 'https://www.zeroin.co.kr', tags: ['펀드', '정보'] }
          ]
        }
      ]
    },
    'crypto': {
      title: '금융/투자 - 코인',
      categories: [
        {
          name: '거래소',
          sites: [
            { id: 'cr1', name: '업비트', description: '국내 1위 코인거래소', url: 'https://upbit.com', tags: ['국내', '거래소'] },
            { id: 'cr2', name: '빗썸', description: '국내 대형 거래소', url: 'https://www.bithumb.com', tags: ['국내', '거래소'] },
            { id: 'cr3', name: '코인원', description: '국내 코인거래소', url: 'https://coinone.co.kr', tags: ['국내', '거래소'] },
            { id: 'cr4', name: '바이낸스', description: '글로벌 거래소', url: 'https://www.binance.com', tags: ['글로벌', '거래소'] },
            { id: 'cr5', name: '코빗', description: '국내 비트코인 거래소', url: 'https://www.korbit.co.kr', tags: ['국내', '비트코인'] },
            { id: 'cr6', name: '고팩스', description: '국내 암호화폐 거래소', url: 'https://www.gopax.co.kr', tags: ['국내', '암호화폐'] },
            { id: 'cr7', name: '캐셔레스트', description: '가상화폐 거래소', url: 'https://www.cashierest.com', tags: ['국내', '가상화폐'] },
            { id: 'cr8', name: '코인베이스', description: '미국 대형 거래소', url: 'https://www.coinbase.com', tags: ['미국', '거래소'] }
          ]
        },
        {
          name: '정보/분석',
          sites: [
            { id: 'cr9', name: '코인마켓캡', description: '코인 시가총액 정보', url: 'https://coinmarketcap.com', tags: ['시가총액', '정보'] },
            { id: 'cr10', name: '코인게코', description: '코인 가격 추적', url: 'https://www.coingecko.com', tags: ['가격', '추적'] },
            { id: 'cr11', name: '트레이딩뷰', description: '차트 분석 도구', url: 'https://www.tradingview.com', tags: ['차트', '분석'] },
            { id: 'cr12', name: '코인데스크', description: '블록체인 뉴스', url: 'https://www.coindesk.com', tags: ['뉴스', '블록체인'] },
            { id: 'cr13', name: '코인텔레그래프', description: '암호화폐 뉴스', url: 'https://cointelegraph.com', tags: ['뉴스', '암호화폐'] },
            { id: 'cr14', name: '디센트', description: '블록체인 한국 뉴스', url: 'https://decent.fund', tags: ['한국', '블록체인'] },
            { id: 'cr15', name: '크립토컴페어', description: '암호화폐 비교', url: 'https://www.cryptocompare.com', tags: ['비교', '암호화폐'] },
            { id: 'cr16', name: '블록체인인포', description: '블록체인 정보', url: 'https://www.blockchain.info', tags: ['블록체인', '정보'] }
          ]
        },
        {
          name: '커뮤니티',
          sites: [
            { id: 'cr17', name: '코인판', description: '코인 커뮤니티', url: 'https://www.coinpan.com', tags: ['커뮤니티', '코인'] },
            { id: 'cr18', name: '디시 비트코인갤', description: '비트코인 갤러리', url: 'https://gall.dcinside.com/bitcoin', tags: ['갤러리', '비트코인'] },
            { id: 'cr19', name: '땡글닷컴', description: '암호화폐 커뮤니티', url: 'https://ddengle.com', tags: ['커뮤니티', '암호화폐'] },
            { id: 'cr20', name: '코인러', description: '코인 커뮤니티', url: 'https://www.coinle.com', tags: ['커뮤니티', '코인'] },
            { id: 'cr21', name: '업비트 투자자보호센터', description: '투자자 보호', url: 'https://www.upbit.com/support/center', tags: ['보호', '투자자'] },
            { id: 'cr22', name: '코인니스', description: '암호화폐 뉴스', url: 'https://www.coinnews.kr', tags: ['뉴스', '암호화폐'] }
          ]
        },
        {
          name: 'NFT/메타버스',
          sites: [
            { id: 'cr23', name: '오픈씨', description: 'NFT 마켓플레이스', url: 'https://opensea.io', tags: ['NFT', '마켓'] },
            { id: 'cr24', name: '라리블', description: 'NFT 플랫폼', url: 'https://rarible.com', tags: ['NFT', '플랫폼'] },
            { id: 'cr25', name: '클립드롭', description: 'NFT 마켓', url: 'https://www.klipdrops.com', tags: ['NFT', '클레이튼'] },
            { id: 'cr26', name: '디센털랜드', description: '메타버스 플랫폼', url: 'https://decentraland.org', tags: ['메타버스', '플랫폼'] },
            { id: 'cr27', name: '샌드박스', description: '메타버스 게임', url: 'https://www.sandbox.game', tags: ['메타버스', '게임'] },
            { id: 'cr28', name: '이더스캔', description: '이더리움 블록체인 탐색기', url: 'https://etherscan.io', tags: ['이더리움', '탐색기'] }
          ]
        },
        {
          name: 'DeFi/지갑',
          sites: [
            { id: 'cr29', name: '메타마스크', description: '이더리움 지갑', url: 'https://metamask.io', tags: ['지갑', '이더리움'] },
            { id: 'cr30', name: '트러스트 월렛', description: '멀티체인 지갑', url: 'https://trustwallet.com', tags: ['지갑', '멀티체인'] },
            { id: 'cr31', name: '유니스왑', description: 'DEX 거래소', url: 'https://uniswap.org', tags: ['DEX', 'DeFi'] },
            { id: 'cr32', name: '팬케이크스왑', description: 'BSC DEX', url: 'https://pancakeswap.finance', tags: ['BSC', 'DEX'] },
            { id: 'cr33', name: 'DeFi Pulse', description: 'DeFi 정보', url: 'https://defipulse.com', tags: ['DeFi', '정보'] },
            { id: 'cr34', name: '클레이스왑', description: '클레이튼 DEX', url: 'https://klayswap.com', tags: ['클레이튼', 'DEX'] }
          ]
        },
        {
          name: '세무/규제',
          sites: [
            { id: 'cr35', name: '가상자산 세무 가이드', description: '가상자산 세금 정보', url: 'https://www.nts.go.kr', tags: ['세금', '가상자산'] },
            { id: 'cr36', name: '코인세금', description: '암호화폐 세금 계산', url: 'https://cointax.kr', tags: ['세금', '계산'] },
            { id: 'cr37', name: '금융위원회', description: '가상자산 규제', url: 'https://www.fsc.go.kr', tags: ['규제', '금융위'] },
            { id: 'cr38', name: '한국블록체인협회', description: '블록체인 협회', url: 'https://kblockchain.org', tags: ['협회', '블록체인'] },
            { id: 'cr39', name: '디지털자산거래소협의회', description: '거래소 협의회', url: 'https://www.daxa.or.kr', tags: ['협의회', '거래소'] },
            { id: 'cr40', name: 'FATF 가이드라인', description: '국제 자금세탁방지', url: 'https://www.fatf-gafi.org', tags: ['국제', '규제'] }
          ]
        }
      ]
    }
  },
  'wedding': {
    '': {
      title: '결혼/웨딩',
      categories: [
        {
          name: '웨딩 플래닝',
          sites: [
            { id: 'w1', name: '웨딩북', description: '웨딩 종합 정보', url: 'https://www.weddingbook.co.kr', tags: ['플래닝', '종합'] },
            { id: 'w2', name: '마리끌레르 웨딩', description: '웨딩 매거진', url: 'https://www.marieclairewedding.co.kr', tags: ['매거진', '웨딩'] },
            { id: 'w3', name: '웨딩21', description: '웨딩 정보', url: 'https://www.wedding21.co.kr', tags: ['정보', '웨딩'] },
            { id: 'w4', name: '프리미어페이퍼', description: '고급 웨딩 정보', url: 'https://www.premierpaper.co.kr', tags: ['고급', '웨딩'] },
            { id: 'w5', name: '웨딩의 신', description: '웨딩 커뮤니티', url: 'https://www.weddingsin.co.kr', tags: ['커뮤니티', '웨딩'] },
            { id: 'w6', name: '웨딩N', description: '웨딩 정보 플랫폼', url: 'https://www.weddingn.co.kr', tags: ['플랫폼', '정보'] },
            { id: 'w7', name: '이벤트위드유', description: '웨딩 플래닝', url: 'https://www.eventwithyou.com', tags: ['플래닝', '이벤트'] },
            { id: 'w8', name: '블리스웨딩', description: '웨딩 플래너', url: 'https://www.blisswedding.co.kr', tags: ['플래너', '웨딩'] }
          ]
        },
        {
          name: '웨딩홀/예식장',
          sites: [
            { id: 'w9', name: '웨딩홀닷컴', description: '웨딩홀 예약', url: 'https://www.weddinghall.com', tags: ['예약', '웨딩홀'] },
            { id: 'w10', name: '예식의전당', description: '예식장 정보', url: 'https://www.yd114.co.kr', tags: ['예식장', '정보'] },
            { id: 'w11', name: '웨딩컨벤션', description: '대형 웨딩홀', url: 'https://www.weddingcon.co.kr', tags: ['대형', '웨딩홀'] },
            { id: 'w12', name: '스몰웨딩', description: '소규모 웨딩', url: 'https://www.smallwedding.co.kr', tags: ['소규모', '웨딩'] },
            { id: 'w13', name: '가든웨딩', description: '야외 웨딩', url: 'https://www.gardenwedding.co.kr', tags: ['야외', '가든'] },
            { id: 'w14', name: '호텔웨딩', description: '호텔 웨딩홀', url: 'https://www.hotelwedding.co.kr', tags: ['호텔', '웨딩홀'] },
            { id: 'w15', name: '교회웨딩', description: '교회 예식', url: 'https://www.churchwedding.co.kr', tags: ['교회', '예식'] },
            { id: 'w16', name: '하우스웨딩', description: '하우스 웨딩', url: 'https://www.housewedding.co.kr', tags: ['하우스', '웨딩'] }
          ]
        },
        {
          name: '웨딩 촬영',
          sites: [
            { id: 'w17', name: '스튜디오 박', description: '웨딩 스튜디오', url: 'https://www.studiopark.co.kr', tags: ['스튜디오', '촬영'] },
            { id: 'w18', name: '하늘소', description: '웨딩 사진', url: 'https://www.hanulso.com', tags: ['사진', '웨딩'] },
            { id: 'w19', name: '몽드', description: '웨딩 포토', url: 'https://www.monde.co.kr', tags: ['포토', '웨딩'] },
            { id: 'w20', name: '스냅스냅', description: '웨딩 스냅', url: 'https://www.snapsnap.co.kr', tags: ['스냅', '촬영'] },
            { id: 'w21', name: '라이프포토', description: '웨딩 영상', url: 'https://www.lifephoto.co.kr', tags: ['영상', '웨딩'] },
            { id: 'w22', name: '웨딩포토앤영상', description: '포토&영상', url: 'https://www.weddingphoto.co.kr', tags: ['포토', '영상'] },
            { id: 'w23', name: '프리웨딩', description: '프리웨딩 촬영', url: 'https://www.prewedding.co.kr', tags: ['프리웨딩', '촬영'] },
            { id: 'w24', name: '드론웨딩', description: '드론 촬영', url: 'https://www.dronewedding.co.kr', tags: ['드론', '촬영'] }
          ]
        },
        {
          name: '드레스/정장',
          sites: [
            { id: 'w25', name: '로사모니', description: '웨딩드레스', url: 'https://www.rosamone.co.kr', tags: ['드레스', '웨딩'] },
            { id: 'w26', name: '베라웨딩', description: '웨딩드레스', url: 'https://www.verawedding.co.kr', tags: ['드레스', '베라'] },
            { id: 'w27', name: '엘리자베타', description: '고급 드레스', url: 'https://www.elizabeta.co.kr', tags: ['고급', '드레스'] },
            { id: 'w28', name: '신랑정장', description: '신랑 정장', url: 'https://www.groomsuit.co.kr', tags: ['정장', '신랑'] },
            { id: 'w29', name: '웨딩픽', description: '드레스 렌탈', url: 'https://www.weddingpick.co.kr', tags: ['렌탈', '드레스'] },
            { id: 'w30', name: '주단', description: '한복 대여', url: 'https://www.judan.co.kr', tags: ['한복', '대여'] },
            { id: 'w31', name: '웨딩슈즈', description: '웨딩 신발', url: 'https://www.weddingshoes.co.kr', tags: ['신발', '웨딩'] },
            { id: 'w32', name: '액세서리샵', description: '웨딩 액세서리', url: 'https://www.accessoryshop.co.kr', tags: ['액세서리', '웨딩'] }
          ]
        },
        {
          name: '헤어/메이크업',
          sites: [
            { id: 'w33', name: '뷰티포유', description: '웨딩 메이크업', url: 'https://www.beautyforyou.co.kr', tags: ['메이크업', '웨딩'] },
            { id: 'w34', name: '헤어살롱', description: '웨딩 헤어', url: 'https://www.hairsalon.co.kr', tags: ['헤어', '웨딩'] },
            { id: 'w35', name: '네일아트', description: '웨딩 네일', url: 'https://www.nailart.co.kr', tags: ['네일', '웨딩'] },
            { id: 'w36', name: '속눈썹연장', description: '아이래시', url: 'https://www.eyelash.co.kr', tags: ['속눈썹', '연장'] },
            { id: 'w37', name: '스킨케어', description: '웨딩 스킨케어', url: 'https://www.skincare.co.kr', tags: ['스킨케어', '웨딩'] },
            { id: 'w38', name: '뷰티샵', description: '종합 뷰티', url: 'https://www.beautyshop.co.kr', tags: ['종합', '뷰티'] },
            { id: 'w39', name: '남성그루밍', description: '신랑 그루밍', url: 'https://www.mengrooming.co.kr', tags: ['남성', '그루밍'] },
            { id: 'w40', name: '다이어트센터', description: '웨딩 다이어트', url: 'https://www.dietcenter.co.kr', tags: ['다이어트', '웨딩'] }
          ]
        },
        {
          name: '신혼여행',
          sites: [
            { id: 'w41', name: '하나투어', description: '신혼여행 패키지', url: 'https://www.hanatour.com', tags: ['패키지', '여행'] },
            { id: 'w42', name: '모두투어', description: '신혼여행 전문', url: 'https://www.modetour.com', tags: ['전문', '여행'] },
            { id: 'w43', name: '온라인투어', description: '해외여행', url: 'https://www.onlinetour.co.kr', tags: ['해외', '여행'] },
            { id: 'w44', name: '인터파크투어', description: '여행 예약', url: 'https://tour.interpark.com', tags: ['예약', '여행'] },
            { id: 'w45', name: '익스피디아', description: '해외 호텔 예약', url: 'https://www.expedia.co.kr', tags: ['호텔', '해외'] },
            { id: 'w46', name: '부킹닷컴', description: '숙박 예약', url: 'https://www.booking.com', tags: ['숙박', '예약'] },
            { id: 'w47', name: '트리바고', description: '호텔 비교', url: 'https://www.trivago.co.kr', tags: ['비교', '호텔'] },
            { id: 'w48', name: '스카이스캐너', description: '항공료 비교', url: 'https://www.skyscanner.co.kr', tags: ['항공료', '비교'] }
          ]
        }
      ]
    }
  },
  'ui-ux': {
    '': {
      title: 'UI/UX 디자인',
      categories: [
        {
          name: '디자인 도구',
          sites: [
            { id: 'ui1', name: 'Figma', description: '협업 디자인 플랫폼', url: 'https://www.figma.com', tags: ['디자인', '협업'] },
            { id: 'ui2', name: 'Adobe XD', description: 'UX/UI 디자인 툴', url: 'https://www.adobe.com/xd', tags: ['Adobe', 'UX/UI'] },
            { id: 'ui3', name: 'Sketch', description: 'Mac용 디자인 툴', url: 'https://www.sketch.com', tags: ['Mac', '디자인'] },
            { id: 'ui4', name: 'Framer', description: '인터랙티브 디자인', url: 'https://www.framer.com', tags: ['인터랙티브', '프로토타입'] },
            { id: 'ui5', name: 'Principle', description: '애니메이션 프로토타이핑', url: 'http://principleformac.com', tags: ['애니메이션', '프로토타입'] },
            { id: 'ui6', name: 'InVision', description: '디자인 협업 플랫폼', url: 'https://www.invisionapp.com', tags: ['협업', '프로토타입'] }
          ]
        },
        {
          name: '디자인 리소스',
          sites: [
            { id: 'ui7', name: 'Dribbble', description: '디자인 영감과 작품 공유', url: 'https://dribbble.com', tags: ['영감', '포트폴리오'] },
            { id: 'ui8', name: 'Behance', description: 'Adobe 크리에이티브 플랫폼', url: 'https://www.behance.net', tags: ['Adobe', '포트폴리오'] },
            { id: 'ui9', name: 'Unsplash', description: '무료 고품질 이미지', url: 'https://unsplash.com', tags: ['무료', '이미지'] },
            { id: 'ui10', name: 'UI Movement', description: 'UI 디자인 영감', url: 'https://uimovement.com', tags: ['UI', '영감'] },
            { id: 'ui11', name: 'Mobbin', description: '모바일 디자인 패턴', url: 'https://mobbin.design', tags: ['모바일', '패턴'] },
            { id: 'ui12', name: 'Page Flows', description: 'UX 플로우 예시', url: 'https://pageflows.com', tags: ['UX', '플로우'] }
          ]
        }
      ]
    }
  },
  'data-ai': {
    '': {
      title: '데이터/AI',
      categories: [
        {
          name: 'AI 대화/생성',
          sites: [
            { id: 'ai1', name: 'ChatGPT', description: 'OpenAI의 대화형 AI', url: 'https://chat.openai.com', tags: ['대화', 'AI'] },
            { id: 'ai2', name: 'Claude', description: 'Anthropic의 AI 어시스턴트', url: 'https://claude.ai', tags: ['AI', '어시스턴트'] },
            { id: 'ai3', name: 'Bard', description: 'Google의 AI 챗봇', url: 'https://bard.google.com', tags: ['구글', 'AI'] },
            { id: 'ai4', name: 'Bing Chat', description: 'Microsoft AI 채팅', url: 'https://www.bing.com/chat', tags: ['마이크로소프트', 'AI'] },
            { id: 'ai5', name: 'Perplexity', description: 'AI 검색 엔진', url: 'https://www.perplexity.ai', tags: ['검색', 'AI'] },
            { id: 'ai6', name: 'Character.AI', description: 'AI 캐릭터 대화', url: 'https://character.ai', tags: ['캐릭터', '대화'] },
            { id: 'ai7', name: 'Poe', description: 'Quora AI 플랫폼', url: 'https://poe.com', tags: ['퀴오라', 'AI'] },
            { id: 'ai8', name: 'Replika', description: 'AI 컴패니언', url: 'https://replika.ai', tags: ['컴패니언', 'AI'] }
          ]
        },
        {
          name: 'AI 이미지/영상',
          sites: [
            { id: 'ai9', name: 'Midjourney', description: 'AI 이미지 생성', url: 'https://www.midjourney.com', tags: ['이미지', '생성'] },
            { id: 'ai10', name: 'DALL-E', description: 'OpenAI 이미지 생성', url: 'https://openai.com/dall-e-2', tags: ['OpenAI', '이미지'] },
            { id: 'ai11', name: 'Stable Diffusion', description: '오픈소스 이미지 AI', url: 'https://stability.ai', tags: ['오픈소스', '이미지'] },
            { id: 'ai12', name: 'Leonardo.AI', description: 'AI 아트 생성', url: 'https://leonardo.ai', tags: ['아트', '생성'] },
            { id: 'ai13', name: 'Runway', description: 'AI 영상 편집', url: 'https://runwayml.com', tags: ['영상', '편집'] },
            { id: 'ai14', name: 'Synthesia', description: 'AI 비디오 생성', url: 'https://www.synthesia.io', tags: ['비디오', '생성'] },
            { id: 'ai15', name: 'Canva AI', description: 'AI 디자인 도구', url: 'https://www.canva.com/ai', tags: ['디자인', 'AI'] },
            { id: 'ai16', name: 'Playground AI', description: 'AI 이미지 편집', url: 'https://playground.ai', tags: ['편집', '이미지'] }
          ]
        },
        {
          name: 'AI 코딩/개발',
          sites: [
            { id: 'ai17', name: 'GitHub Copilot', description: 'AI 코딩 도우미', url: 'https://github.com/features/copilot', tags: ['코딩', '도우미'] },
            { id: 'ai18', name: 'Cursor', description: 'AI 코드 에디터', url: 'https://cursor.sh', tags: ['에디터', '코드'] },
            { id: 'ai19', name: 'Tabnine', description: 'AI 코드 완성', url: 'https://www.tabnine.com', tags: ['완성', '코드'] },
            { id: 'ai20', name: 'CodeT5', description: 'AI 코드 생성', url: 'https://github.com/salesforce/CodeT5', tags: ['생성', '코드'] },
            { id: 'ai21', name: 'Replit Ghostwriter', description: 'AI 코딩 도구', url: 'https://replit.com/ghostwriter', tags: ['도구', '코딩'] },
            { id: 'ai22', name: 'Codeium', description: '무료 AI 코딩', url: 'https://codeium.com', tags: ['무료', '코딩'] },
            { id: 'ai23', name: 'Amazon CodeWhisperer', description: 'AWS AI 코딩', url: 'https://aws.amazon.com/codewhisperer', tags: ['AWS', '코딩'] },
            { id: 'ai24', name: 'Sourcery', description: 'AI 코드 리뷰', url: 'https://sourcery.ai', tags: ['리뷰', '코드'] }
          ]
        },
        {
          name: '데이터 분석',
          sites: [
            { id: 'da1', name: 'Google Analytics', description: '웹사이트 분석', url: 'https://analytics.google.com', tags: ['웹분석', '구글'] },
            { id: 'da2', name: 'Tableau', description: '데이터 시각화', url: 'https://www.tableau.com', tags: ['시각화', '대시보드'] },
            { id: 'da3', name: 'Power BI', description: 'Microsoft 비즈니스 인텔리전스', url: 'https://powerbi.microsoft.com', tags: ['Microsoft', 'BI'] },
            { id: 'da4', name: 'Jupyter Notebook', description: '데이터 과학 환경', url: 'https://jupyter.org', tags: ['데이터과학', '노트북'] },
            { id: 'da5', name: 'Kaggle', description: '데이터 과학 커뮤니티', url: 'https://www.kaggle.com', tags: ['커뮤니티', '대회'] },
            { id: 'da6', name: 'Google Colab', description: '클라우드 Jupyter 환경', url: 'https://colab.research.google.com', tags: ['클라우드', '무료'] },
            { id: 'da7', name: 'Apache Spark', description: '빅데이터 처리', url: 'https://spark.apache.org', tags: ['빅데이터', '처리'] },
            { id: 'da8', name: 'Plotly', description: '대화형 시각화', url: 'https://plotly.com', tags: ['시각화', '대화형'] }
          ]
        },
        {
          name: 'ML/딥러닝',
          sites: [
            { id: 'ml1', name: 'TensorFlow', description: '구글 머신러닝 프레임워크', url: 'https://www.tensorflow.org', tags: ['구글', '머신러닝'] },
            { id: 'ml2', name: 'PyTorch', description: '페이스북 딥러닝 프레임워크', url: 'https://pytorch.org', tags: ['페이스북', '딥러닝'] },
            { id: 'ml3', name: 'Hugging Face', description: 'AI 모델 허브', url: 'https://huggingface.co', tags: ['모델', '허브'] },
            { id: 'ml4', name: 'Papers with Code', description: 'AI 논문과 코드', url: 'https://paperswithcode.com', tags: ['논문', '코드'] },
            { id: 'ml5', name: 'Weights & Biases', description: 'ML 실험 추적', url: 'https://wandb.ai', tags: ['실험', '추적'] },
            { id: 'ml6', name: 'MLflow', description: 'ML 라이프사이클 관리', url: 'https://mlflow.org', tags: ['라이프사이클', '관리'] },
            { id: 'ml7', name: 'Neptune', description: 'ML 실험 관리', url: 'https://neptune.ai', tags: ['실험', '관리'] },
            { id: 'ml8', name: 'Google AI', description: '구글 AI 연구', url: 'https://ai.google', tags: ['연구', '구글'] }
          ]
        },
        {
          name: '생산성 AI',
          sites: [
            { id: 'pa1', name: 'Notion AI', description: '노션 통합 AI', url: 'https://www.notion.so/product/ai', tags: ['노션', '생산성'] },
            { id: 'pa2', name: 'Jasper AI', description: 'AI 글쓰기 도구', url: 'https://www.jasper.ai', tags: ['글쓰기', '마케팅'] },
            { id: 'pa3', name: 'Copy.ai', description: 'AI 카피라이팅', url: 'https://www.copy.ai', tags: ['카피라이팅', 'AI'] },
            { id: 'pa4', name: 'Grammarly', description: 'AI 문법 검사', url: 'https://www.grammarly.com', tags: ['문법', '검사'] },
            { id: 'pa5', name: 'Otter.ai', description: 'AI 회의 기록', url: 'https://otter.ai', tags: ['회의', '기록'] },
            { id: 'pa6', name: 'Wordtune', description: 'AI 글쓰기 개선', url: 'https://www.wordtune.com', tags: ['글쓰기', '개선'] },
            { id: 'pa7', name: 'QuillBot', description: 'AI 패러프레이징', url: 'https://quillbot.com', tags: ['패러프레이징', 'AI'] },
            { id: 'pa8', name: 'Tome', description: 'AI 프레젠테이션', url: 'https://tome.app', tags: ['프레젠테이션', 'AI'] }
          ]
        }
      ]
    }
  },
  'accounting': {
    '': {
      title: '회계/세무',
      categories: [
        {
          name: '회계 프로그램',
          sites: [
            { id: 'ac1', name: '더존비즈온', description: '중소기업 ERP', url: 'https://www.douzone.com', tags: ['ERP', '중소기업'] },
            { id: 'ac2', name: 'KcLep', description: '회계 프로그램', url: 'https://www.kclep.com', tags: ['회계', '프로그램'] },
            { id: 'ac3', name: '케이아이넷', description: '세무회계 솔루션', url: 'https://www.kinetsoft.co.kr', tags: ['세무', '회계'] },
            { id: 'ac4', name: '삼일인포마인', description: '세무 프로그램', url: 'https://www.samilinfomine.co.kr', tags: ['세무', '프로그램'] },
            { id: 'ac5', name: '한글과컴퓨터 회계', description: '한컴 회계', url: 'https://www.hancom.com', tags: ['한컴', '회계'] },
            { id: 'ac6', name: '영진닷컴', description: '영진회계', url: 'https://www.yjc.co.kr', tags: ['영진', '회계'] },
            { id: 'ac7', name: 'SAP', description: '대기업 ERP', url: 'https://www.sap.com/korea', tags: ['대기업', 'ERP'] },
            { id: 'ac8', name: 'Oracle ERP', description: '오라클 ERP', url: 'https://www.oracle.com/kr/erp', tags: ['오라클', 'ERP'] }
          ]
        },
        {
          name: '세무신고',
          sites: [
            { id: 'tax1', name: '국세청 홈택스', description: '세금 신고', url: 'https://www.hometax.go.kr', tags: ['국세청', '신고'] },
            { id: 'tax2', name: '위택스', description: '지방세 신고', url: 'https://www.wetax.go.kr', tags: ['지방세', '신고'] },
            { id: 'tax3', name: '손택스', description: '손쉬운 세무신고', url: 'https://www.sontax.kr', tags: ['간편', '세무신고'] },
            { id: 'tax4', name: '삼쩜삼', description: '연말정산 서비스', url: 'https://www.3o3.co.kr', tags: ['연말정산', '서비스'] },
            { id: 'tax5', name: '택스론', description: '세무 상담', url: 'https://www.taxlaw.co.kr', tags: ['상담', '세무'] },
            { id: 'tax6', name: '세무24', description: '24시간 세무 서비스', url: 'https://www.tax24.co.kr', tags: ['24시간', '세무'] },
            { id: 'tax7', name: '한국세무사회', description: '세무사 정보', url: 'https://www.kacpta.or.kr', tags: ['세무사', '정보'] },
            { id: 'tax8', name: '세무대리인', description: '세무 대리', url: 'https://www.taxagent.co.kr', tags: ['대리', '세무'] }
          ]
        },
        {
          name: '급여/인사',
          sites: [
            { id: 'hr1', name: '사람인 HR', description: '인사관리 시스템', url: 'https://www.saraminhr.co.kr', tags: ['인사', '관리'] },
            { id: 'hr2', name: '잡코리아 HR', description: 'HR 솔루션', url: 'https://www.jobkorea.co.kr/service/hr', tags: ['HR', '솔루션'] },
            { id: 'hr3', name: '온나라', description: '공공기관 인사시스템', url: 'https://www.onnara.go.kr', tags: ['공공', '인사'] },
            { id: 'hr4', name: '국민연금', description: '국민연금 업무', url: 'https://www.nps.or.kr', tags: ['연금', '업무'] },
            { id: 'hr5', name: '건강보험공단', description: '건강보험 업무', url: 'https://www.nhis.or.kr', tags: ['건강보험', '업무'] },
            { id: 'hr6', name: '고용보험', description: '고용보험 업무', url: 'https://www.ei.go.kr', tags: ['고용보험', '업무'] },
            { id: 'hr7', name: '근로복지공단', description: '산재보험', url: 'https://www.comwel.or.kr', tags: ['산재', '보험'] },
            { id: 'hr8', name: '고용노동부', description: '노동부 업무', url: 'https://www.moel.go.kr', tags: ['노동부', '업무'] }
          ]
        },
        {
          name: '재무관리',
          sites: [
            { id: 'fm1', name: '뱅크샐러드', description: '자산 관리', url: 'https://www.banksalad.com', tags: ['자산', '관리'] },
            { id: 'fm2', name: '토스', description: '간편 금융', url: 'https://toss.im', tags: ['간편', '금융'] },
            { id: 'fm3', name: '머니레터', description: '금융 뉴스레터', url: 'https://www.moneyletterclub.co.kr', tags: ['뉴스레터', '금융'] },
            { id: 'fm4', name: '핀다', description: '금융상품 비교', url: 'https://www.finda.co.kr', tags: ['비교', '금융상품'] },
            { id: 'fm5', name: '카운트', description: '가계부 앱', url: 'https://www.count.co.kr', tags: ['가계부', '앱'] },
            { id: 'fm6', name: '가계부 어플', description: '가계부 관리', url: 'https://play.google.com/store/apps/details?id=com.kakao.moneybookfree', tags: ['가계부', '관리'] },
            { id: 'fm7', name: '예적금 금리비교', description: '금리 비교', url: 'https://www.bankda.co.kr', tags: ['금리', '비교'] },
            { id: 'fm8', name: '마이뱅킹', description: '통합 계좌 관리', url: 'https://www.mybanking.or.kr', tags: ['통합', '계좌'] }
          ]
        },
        {
          name: '교육/자격증',
          sites: [
            { id: 'edu1', name: '한국공인회계사회', description: 'CPA 정보', url: 'https://www.kicpa.or.kr', tags: ['CPA', '정보'] },
            { id: 'edu2', name: '한국세무사회', description: '세무사 정보', url: 'https://www.kacpta.or.kr', tags: ['세무사', '정보'] },
            { id: 'edu3', name: '전산회계', description: '전산회계 자격증', url: 'https://www.kacpta.or.kr/kor/CMS/Contents/Contents.do?mCode=MN095', tags: ['전산회계', '자격증'] },
            { id: 'edu4', name: '재경관리사', description: '재경관리사 시험', url: 'https://www.samil.co.kr', tags: ['재경관리사', '시험'] },
            { id: 'edu5', name: '회계관리', description: '회계관리 자격증', url: 'https://www.q-net.or.kr', tags: ['회계관리', '자격증'] },
            { id: 'edu6', name: '경리사무', description: '경리사무 교육', url: 'https://www.kcci.or.kr', tags: ['경리', '교육'] },
            { id: 'edu7', name: 'ERP', description: 'ERP 자격증', url: 'https://www.ihd.or.kr', tags: ['ERP', '자격증'] },
            { id: 'edu8', name: '회계학원', description: '회계 교육 기관', url: 'https://www.acpacpa.co.kr', tags: ['학원', '교육'] }
          ]
        },
        {
          name: '법령/규정',
          sites: [
            { id: 'law1', name: '법제처', description: '회계 관련 법령', url: 'https://www.moleg.go.kr', tags: ['법령', '회계'] },
            { id: 'law2', name: '기업회계기준', description: '회계기준 정보', url: 'https://www.kasb.or.kr', tags: ['회계기준', '정보'] },
            { id: 'law3', name: '국제회계기준', description: 'IFRS 정보', url: 'https://www.ifrs.org', tags: ['IFRS', '국제'] },
            { id: 'law4', name: '감사기준', description: '감사 기준', url: 'https://www.kaicpa.or.kr', tags: ['감사', '기준'] },
            { id: 'law5', name: '세법', description: '세법 정보', url: 'https://txsi.hometax.go.kr', tags: ['세법', '정보'] },
            { id: 'law6', name: '회계감사', description: '감사 정보', url: 'https://www.asc.go.kr', tags: ['감사', '정보'] },
            { id: 'law7', name: '공시시스템', description: '기업 공시', url: 'https://dart.fss.or.kr', tags: ['공시', '기업'] },
            { id: 'law8', name: '금융감독원', description: '금융감독', url: 'https://www.fss.or.kr', tags: ['금융', '감독'] }
          ]
        }
      ]
    }
  },
  'ui-ux': {
    '': {
      title: 'UI/UX 디자인',
      categories: [
        {
          name: '디자인 도구',
          sites: [
            { id: 'ui1', name: 'Figma', description: '협업 디자인 플랫폼', url: 'https://www.figma.com', tags: ['디자인', '협업'] },
            { id: 'ui2', name: 'Adobe XD', description: 'UX/UI 디자인 툴', url: 'https://www.adobe.com/xd', tags: ['Adobe', 'UX/UI'] },
            { id: 'ui3', name: 'Sketch', description: 'Mac용 디자인 툴', url: 'https://www.sketch.com', tags: ['Mac', '디자인'] },
            { id: 'ui4', name: 'Framer', description: '인터랙티브 디자인', url: 'https://www.framer.com', tags: ['인터랙티브', '프로토타입'] },
            { id: 'ui5', name: 'Principle', description: '애니메이션 프로토타이핑', url: 'http://principleformac.com', tags: ['애니메이션', '프로토타입'] },
            { id: 'ui6', name: 'InVision', description: '디자인 협업 플랫폼', url: 'https://www.invisionapp.com', tags: ['협업', '프로토타입'] },
            { id: 'ui7', name: 'Zeplin', description: '디자인 핸드오프', url: 'https://zeplin.io', tags: ['핸드오프', '협업'] },
            { id: 'ui8', name: 'Marvel', description: '프로토타이핑 도구', url: 'https://marvelapp.com', tags: ['프로토타입', '도구'] }
          ]
        },
        {
          name: '디자인 리소스',
          sites: [
            { id: 'ui9', name: 'Dribbble', description: '디자인 영감과 작품 공유', url: 'https://dribbble.com', tags: ['영감', '포트폴리오'] },
            { id: 'ui10', name: 'Behance', description: 'Adobe 크리에이티브 플랫폼', url: 'https://www.behance.net', tags: ['Adobe', '포트폴리오'] },
            { id: 'ui11', name: 'Unsplash', description: '무료 고품질 이미지', url: 'https://unsplash.com', tags: ['무료', '이미지'] },
            { id: 'ui12', name: 'UI Movement', description: 'UI 디자인 영감', url: 'https://uimovement.com', tags: ['UI', '영감'] },
            { id: 'ui13', name: 'Mobbin', description: '모바일 디자인 패턴', url: 'https://mobbin.design', tags: ['모바일', '패턴'] },
            { id: 'ui14', name: 'Page Flows', description: 'UX 플로우 예시', url: 'https://pageflows.com', tags: ['UX', '플로우'] },
            { id: 'ui15', name: 'UI Sources', description: 'UI 디자인 모음', url: 'https://www.uisources.com', tags: ['UI', '모음'] },
            { id: 'ui16', name: 'Collect UI', description: 'UI 디자인 갤러리', url: 'https://collectui.com', tags: ['갤러리', 'UI'] }
          ]
        },
        {
          name: '아이콘/일러스트',
          sites: [
            { id: 'icon1', name: 'Feather Icons', description: '미니멀 아이콘', url: 'https://feathericons.com', tags: ['미니멀', '아이콘'] },
            { id: 'icon2', name: 'Heroicons', description: '테일윈드 아이콘', url: 'https://heroicons.com', tags: ['테일윈드', '아이콘'] },
            { id: 'icon3', name: 'Lucide', description: '오픈소스 아이콘', url: 'https://lucide.dev', tags: ['오픈소스', '아이콘'] },
            { id: 'icon4', name: 'Phosphor Icons', description: '유연한 아이콘 라이브러리', url: 'https://phosphoricons.com', tags: ['유연한', '아이콘'] },
            { id: 'icon5', name: 'Tabler Icons', description: '무료 SVG 아이콘', url: 'https://tabler-icons.io', tags: ['무료', 'SVG'] },
            { id: 'icon6', name: 'Remix Icon', description: '오픈소스 아이콘', url: 'https://remixicon.com', tags: ['오픈소스', '아이콘'] },
            { id: 'icon7', name: 'Iconify', description: '아이콘 통합 라이브러리', url: 'https://iconify.design', tags: ['통합', '라이브러리'] },
            { id: 'icon8', name: 'Illustrations', description: '무료 일러스트', url: 'https://www.manypixels.co/gallery', tags: ['무료', '일러스트'] }
          ]
        },
        {
          name: '컬러/타이포',
          sites: [
            { id: 'color1', name: 'Coolors', description: '컬러 팔레트 생성', url: 'https://coolors.co', tags: ['컬러', '팔레트'] },
            { id: 'color2', name: 'Adobe Color', description: 'Adobe 컬러 도구', url: 'https://color.adobe.com', tags: ['Adobe', '컬러'] },
            { id: 'color3', name: 'Color Hunt', description: '컬러 팔레트 모음', url: 'https://colorhunt.co', tags: ['팔레트', '모음'] },
            { id: 'color4', name: 'Google Fonts', description: '웹 폰트', url: 'https://fonts.google.com', tags: ['웹폰트', '구글'] },
            { id: 'color5', name: 'Font Pair', description: '폰트 조합', url: 'https://fontpair.co', tags: ['폰트', '조합'] },
            { id: 'color6', name: 'Type Scale', description: '타이포그래피 스케일', url: 'https://type-scale.com', tags: ['타이포', '스케일'] },
            { id: 'color7', name: 'Contrast Checker', description: '색상 대비 검사', url: 'https://webaim.org/resources/contrastchecker', tags: ['대비', '접근성'] },
            { id: 'color8', name: 'Paletton', description: '컬러 조합 도구', url: 'https://paletton.com', tags: ['조합', '컬러'] }
          ]
        },
        {
          name: '프로토타이핑',
          sites: [
            { id: 'proto1', name: 'Balsamiq', description: '와이어프레임 도구', url: 'https://balsamiq.com', tags: ['와이어프레임', '도구'] },
            { id: 'proto2', name: 'Whimsical', description: '플로우차트 & 와이어프레임', url: 'https://whimsical.com', tags: ['플로우차트', '와이어프레임'] },
            { id: 'proto3', name: 'Miro', description: '온라인 화이트보드', url: 'https://miro.com', tags: ['화이트보드', '협업'] },
            { id: 'proto4', name: 'Mural', description: '디지털 워크스페이스', url: 'https://www.mural.co', tags: ['워크스페이스', '협업'] },
            { id: 'proto5', name: 'Draw.io', description: '무료 다이어그램 도구', url: 'https://app.diagrams.net', tags: ['무료', '다이어그램'] },
            { id: 'proto6', name: 'Excalidraw', description: '손글씨 스타일 다이어그램', url: 'https://excalidraw.com', tags: ['손글씨', '다이어그램'] },
            { id: 'proto7', name: 'FigJam', description: 'Figma 화이트보드', url: 'https://www.figma.com/figjam', tags: ['Figma', '화이트보드'] },
            { id: 'proto8', name: 'LucidChart', description: '다이어그램 & 플로우차트', url: 'https://www.lucidchart.com', tags: ['다이어그램', '플로우'] }
          ]
        },
        {
          name: 'UX 리서치',
          sites: [
            { id: 'ux1', name: 'Maze', description: 'UX 테스팅 플랫폼', url: 'https://maze.co', tags: ['테스팅', 'UX'] },
            { id: 'ux2', name: 'UsabilityHub', description: '사용성 테스트', url: 'https://usabilityhub.com', tags: ['사용성', '테스트'] },
            { id: 'ux3', name: 'Optimal Workshop', description: 'UX 리서치 도구', url: 'https://www.optimalworkshop.com', tags: ['리서치', 'UX'] },
            { id: 'ux4', name: 'Hotjar', description: '사용자 행동 분석', url: 'https://www.hotjar.com', tags: ['행동분석', '사용자'] },
            { id: 'ux5', name: 'FullStory', description: '사용자 세션 기록', url: 'https://www.fullstory.com', tags: ['세션', '기록'] },
            { id: 'ux6', name: 'UserTesting', description: '사용자 테스팅', url: 'https://www.usertesting.com', tags: ['사용자', '테스팅'] },
            { id: 'ux7', name: 'Lookback', description: '사용자 인터뷰', url: 'https://lookback.io', tags: ['인터뷰', '사용자'] },
            { id: 'ux8', name: 'Typeform', description: '사용자 설문조사', url: 'https://www.typeform.com', tags: ['설문', '조사'] }
          ]
        }
      ]
    }
  },
  'marketing': {
    '': {
      title: '마케팅',
      categories: [
        {
          name: '디지털 마케팅',
          sites: [
            { id: 'dm1', name: 'Google Ads', description: '구글 광고', url: 'https://ads.google.com', tags: ['구글', '광고'] },
            { id: 'dm2', name: 'Facebook Ads', description: '페이스북 광고', url: 'https://www.facebook.com/business/ads', tags: ['페이스북', '광고'] },
            { id: 'dm3', name: '네이버 광고', description: '네이버 검색광고', url: 'https://searchad.naver.com', tags: ['네이버', '검색광고'] },
            { id: 'dm4', name: '카카오 광고', description: '카카오모먼트', url: 'https://moment.kakao.com', tags: ['카카오', '광고'] },
            { id: 'dm5', name: 'Instagram Ads', description: '인스타그램 광고', url: 'https://business.instagram.com/advertising', tags: ['인스타그램', '광고'] },
            { id: 'dm6', name: 'YouTube Ads', description: '유튜브 광고', url: 'https://www.youtube.com/ads', tags: ['유튜브', '광고'] },
            { id: 'dm7', name: 'LinkedIn Ads', description: '링크드인 광고', url: 'https://business.linkedin.com/marketing-solutions/ads', tags: ['링크드인', '광고'] },
            { id: 'dm8', name: 'TikTok Ads', description: '틱톡 광고', url: 'https://ads.tiktok.com', tags: ['틱톡', '광고'] }
          ]
        },
        {
          name: 'SEO/분석',
          sites: [
            { id: 'seo1', name: 'Google Analytics', description: '웹사이트 분석', url: 'https://analytics.google.com', tags: ['분석', '구글'] },
            { id: 'seo2', name: 'Google Search Console', description: '검색 최적화', url: 'https://search.google.com/search-console', tags: ['SEO', '구글'] },
            { id: 'seo3', name: 'SEMrush', description: 'SEO 분석 도구', url: 'https://www.semrush.com', tags: ['SEO', '분석'] },
            { id: 'seo4', name: 'Ahrefs', description: 'SEO 도구', url: 'https://ahrefs.com', tags: ['SEO', '도구'] },
            { id: 'seo5', name: 'Moz', description: 'SEO 소프트웨어', url: 'https://moz.com', tags: ['SEO', '소프트웨어'] },
            { id: 'seo6', name: '네이버 서치어드바이저', description: '네이버 SEO', url: 'https://searchadvisor.naver.com', tags: ['네이버', 'SEO'] },
            { id: 'seo7', name: 'Ubersuggest', description: '키워드 도구', url: 'https://neilpatel.com/ubersuggest', tags: ['키워드', '도구'] },
            { id: 'seo8', name: 'Answer The Public', description: '키워드 아이디어', url: 'https://answerthepublic.com', tags: ['키워드', '아이디어'] }
          ]
        },
        {
          name: '소셜미디어',
          sites: [
            { id: 'sm1', name: 'Hootsuite', description: '소셜미디어 관리', url: 'https://hootsuite.com', tags: ['관리', '소셜미디어'] },
            { id: 'sm2', name: 'Buffer', description: '소셜미디어 스케줄링', url: 'https://buffer.com', tags: ['스케줄링', '소셜미디어'] },
            { id: 'sm3', name: 'Later', description: '인스타그램 스케줄러', url: 'https://later.com', tags: ['인스타그램', '스케줄러'] },
            { id: 'sm4', name: 'Sprout Social', description: '소셜미디어 통합관리', url: 'https://sproutsocial.com', tags: ['통합관리', '소셜미디어'] },
            { id: 'sm5', name: 'Canva', description: '소셜미디어 디자인', url: 'https://www.canva.com', tags: ['디자인', '소셜미디어'] },
            { id: 'sm6', name: 'BuzzSumo', description: '콘텐츠 분석', url: 'https://buzzsumo.com', tags: ['콘텐츠', '분석'] },
            { id: 'sm7', name: 'Socialbakers', description: '소셜미디어 분석', url: 'https://www.socialbakers.com', tags: ['분석', '소셜미디어'] },
            { id: 'sm8', name: 'Mention', description: '소셜 모니터링', url: 'https://mention.com', tags: ['모니터링', '소셜'] }
          ]
        },
        {
          name: '이메일 마케팅',
          sites: [
            { id: 'em1', name: 'Mailchimp', description: '이메일 마케팅', url: 'https://mailchimp.com', tags: ['이메일', '마케팅'] },
            { id: 'em2', name: 'ConvertKit', description: '크리에이터 이메일 도구', url: 'https://convertkit.com', tags: ['크리에이터', '이메일'] },
            { id: 'em3', name: 'Sendinblue', description: '이메일 & SMS 마케팅', url: 'https://www.sendinblue.com', tags: ['이메일', 'SMS'] },
            { id: 'em4', name: 'Campaign Monitor', description: '이메일 디자인', url: 'https://www.campaignmonitor.com', tags: ['이메일', '디자인'] },
            { id: 'em5', name: 'GetResponse', description: '이메일 자동화', url: 'https://www.getresponse.com', tags: ['이메일', '자동화'] },
            { id: 'em6', name: 'ActiveCampaign', description: '마케팅 자동화', url: 'https://www.activecampaign.com', tags: ['마케팅', '자동화'] },
            { id: 'em7', name: 'AWeber', description: '이메일 마케팅', url: 'https://www.aweber.com', tags: ['이메일', '마케팅'] },
            { id: 'em8', name: 'Drip', description: 'E-commerce 이메일', url: 'https://www.drip.com', tags: ['E-commerce', '이메일'] }
          ]
        },
        {
          name: '콘텐츠 마케팅',
          sites: [
            { id: 'cm1', name: 'CoSchedule', description: '콘텐츠 계획', url: 'https://coschedule.com', tags: ['콘텐츠', '계획'] },
            { id: 'cm2', name: 'HubSpot', description: '인바운드 마케팅', url: 'https://www.hubspot.com', tags: ['인바운드', '마케팅'] },
            { id: 'cm3', name: 'WordPress', description: '블로그 플랫폼', url: 'https://wordpress.com', tags: ['블로그', '플랫폼'] },
            { id: 'cm4', name: 'Medium', description: '콘텐츠 발행', url: 'https://medium.com', tags: ['콘텐츠', '발행'] },
            { id: 'cm5', name: 'Ghost', description: '퍼블리싱 플랫폼', url: 'https://ghost.org', tags: ['퍼블리싱', '플랫폼'] },
            { id: 'cm6', name: 'Notion', description: '콘텐츠 관리', url: 'https://www.notion.so', tags: ['콘텐츠', '관리'] },
            { id: 'cm7', name: 'Airtable', description: '콘텐츠 데이터베이스', url: 'https://airtable.com', tags: ['콘텐츠', '데이터베이스'] },
            { id: 'cm8', name: 'Grammarly', description: '글쓰기 도구', url: 'https://www.grammarly.com', tags: ['글쓰기', '도구'] }
          ]
        },
        {
          name: '국내 마케팅',
          sites: [
            { id: 'km1', name: '마케팅 인사이트', description: '마케팅 뉴스', url: 'https://www.marketing.co.kr', tags: ['뉴스', '마케팅'] },
            { id: 'km2', name: 'Ad.Insight', description: '광고 인사이트', url: 'https://www.adinsight.co.kr', tags: ['광고', '인사이트'] },
            { id: 'km3', name: '브랜딩 매거진', description: '브랜딩 정보', url: 'https://brandingmag.co.kr', tags: ['브랜딩', '매거진'] },
            { id: 'km4', name: '마케터스', description: '마케터 커뮤니티', url: 'https://marketers.co.kr', tags: ['마케터', '커뮤니티'] },
            { id: 'km5', name: '디마포', description: '디지털마케팅포럼', url: 'https://www.demafo.co.kr', tags: ['디지털', '포럼'] },
            { id: 'km6', name: 'Ad Planet', description: '광고 포털', url: 'https://www.adplanet.co.kr', tags: ['광고', '포털'] },
            { id: 'km7', name: '캠페인', description: '광고 전문지', url: 'https://www.campaign.co.kr', tags: ['광고', '전문지'] },
            { id: 'km8', name: '소비트렌드', description: '소비 트렌드', url: 'https://www.trend.co.kr', tags: ['소비', '트렌드'] }
          ]
        }
      ]
    }
  },
  'education': {
    'k12': {
      title: '교육 - 초중고',
      categories: [
        {
          name: '학습 사이트',
          sites: [
            { id: 'k1', name: 'EBS', description: '교육방송', url: 'https://www.ebs.co.kr', tags: ['방송', '교육'] },
            { id: 'k2', name: '메가스터디', description: '온라인 강의', url: 'https://www.megastudy.net', tags: ['강의', '온라인'] },
            { id: 'k3', name: '이투스', description: '대입 전문', url: 'https://www.etoos.com', tags: ['대입', '전문'] },
            { id: 'k4', name: '비상교육', description: '교육 콘텐츠', url: 'https://www.visang.com', tags: ['교육', '콘텐츠'] },
            { id: 'k5', name: '천재교육', description: '교육 자료', url: 'https://www.chunjae.co.kr', tags: ['교육', '자료'] },
            { id: 'k6', name: '웅진씽크빅', description: '초등 교육', url: 'https://www.wjthinkbig.com', tags: ['초등', '교육'] },
            { id: 'k7', name: '대교', description: '눈높이 교육', url: 'https://www.daekyo.co.kr', tags: ['눈높이', '교육'] },
            { id: 'k8', name: '재능교육', description: '스스로학습', url: 'https://www.jei.co.kr', tags: ['스스로', '학습'] }
          ]
        },
        {
          name: '진로/입시',
          sites: [
            { id: 'k9', name: '대학어디가', description: '대학 정보', url: 'https://www.adiga.kr', tags: ['대학', '정보'] },
            { id: 'k10', name: '진학사', description: '입시 정보', url: 'https://www.jinhak.com', tags: ['입시', '정보'] },
            { id: 'k11', name: '유웨이', description: '입시 전문', url: 'https://www.uway.com', tags: ['입시', '전문'] },
            { id: 'k12', name: '종로학원', description: '입시 학원', url: 'https://www.jongro.co.kr', tags: ['입시', '학원'] },
            { id: 'k13', name: '워크넷', description: '진로 정보', url: 'https://www.work.go.kr', tags: ['진로', '정보'] },
            { id: 'k14', name: '커리어넷', description: '진로 탐색', url: 'https://www.career.go.kr', tags: ['진로', '탐색'] },
            { id: 'k15', name: '한국직업정보시스템', description: '직업 정보', url: 'https://know.work.go.kr', tags: ['직업', '정보'] },
            { id: 'k16', name: '교육통계', description: '교육 통계', url: 'https://kess.kedi.re.kr', tags: ['교육', '통계'] }
          ]
        },
        {
          name: '온라인 교육',
          sites: [
            { id: 'k17', name: '칸아카데미', description: '무료 온라인 교육', url: 'https://ko.khanacademy.org', tags: ['무료', '온라인'] },
            { id: 'k18', name: '구글 클래스룸', description: '온라인 수업', url: 'https://classroom.google.com', tags: ['온라인', '수업'] },
            { id: 'k19', name: '줌', description: '화상수업', url: 'https://zoom.us', tags: ['화상', '수업'] },
            { id: 'k20', name: '패들렛', description: '협업 도구', url: 'https://padlet.com', tags: ['협업', '도구'] },
            { id: 'k21', name: '플리커스', description: '수업 상호작용', url: 'https://flipgrid.com', tags: ['상호작용', '수업'] },
            { id: 'k22', name: '멘티미터', description: '실시간 설문', url: 'https://www.mentimeter.com', tags: ['실시간', '설문'] },
            { id: 'k23', name: '카훗', description: '게임형 퀴즈', url: 'https://kahoot.com', tags: ['게임', '퀴즈'] },
            { id: 'k24', name: '패들릿', description: '디지털 게시판', url: 'https://padlet.com', tags: ['디지털', '게시판'] }
          ]
        }
      ]
    },
    'university': {
      title: '교육 - 대학교',
      categories: [
        {
          name: '대학 정보',
          sites: [
            { id: 'u1', name: 'K-MOOC', description: '한국형 온라인 공개강좌', url: 'https://www.kmooc.kr', tags: ['MOOC', '강좌'] },
            { id: 'u2', name: 'KOCW', description: '대학 강의 공개', url: 'http://www.kocw.net', tags: ['강의', '공개'] },
            { id: 'u3', name: '대학알리미', description: '대학 정보 공시', url: 'https://www.academyinfo.go.kr', tags: ['정보', '공시'] },
            { id: 'u4', name: 'QS 랭킹', description: '세계 대학 순위', url: 'https://www.topuniversities.com', tags: ['순위', '세계'] },
            { id: 'u5', name: '중앙일보 대학평가', description: '국내 대학 평가', url: 'https://univ.joongang.co.kr', tags: ['평가', '국내'] },
            { id: 'u6', name: '한국대학신문', description: '대학 뉴스', url: 'https://news.unn.net', tags: ['뉴스', '대학'] },
            { id: 'u7', name: '대학저널', description: '대학 전문지', url: 'http://www.dhnews.co.kr', tags: ['전문지', '대학'] },
            { id: 'u8', name: '베리타스알파', description: '입시 전문지', url: 'http://www.veritas-a.com', tags: ['입시', '전문지'] }
          ]
        },
        {
          name: '학술 연구',
          sites: [
            { id: 'u9', name: 'RISS', description: '학술연구정보서비스', url: 'http://www.riss.kr', tags: ['학술', '연구'] },
            { id: 'u10', name: 'KISS', description: '한국학술정보', url: 'http://kiss.kstudy.com', tags: ['학술', '정보'] },
            { id: 'u11', name: 'DBpia', description: '논문 데이터베이스', url: 'http://www.dbpia.co.kr', tags: ['논문', '데이터베이스'] },
            { id: 'u12', name: 'Google Scholar', description: '구글 학술검색', url: 'https://scholar.google.com', tags: ['구글', '학술검색'] },
            { id: 'u13', name: 'ResearchGate', description: '연구자 네트워크', url: 'https://www.researchgate.net', tags: ['연구자', '네트워크'] },
            { id: 'u14', name: 'Academia.edu', description: '학술 논문 공유', url: 'https://www.academia.edu', tags: ['논문', '공유'] },
            { id: 'u15', name: 'JSTOR', description: '학술 저널', url: 'https://www.jstor.org', tags: ['저널', '학술'] },
            { id: 'u16', name: 'PubMed', description: '의학 논문', url: 'https://pubmed.ncbi.nlm.nih.gov', tags: ['의학', '논문'] }
          ]
        },
        {
          name: '공모전',
          sites: [
            { id: 'contest1', name: '조물조물', description: '대학생 공모전', url: 'https://www.jomul.co.kr', tags: ['대학생', '공모전'] },
            { id: 'contest2', name: '씽굿', description: '공모전 정보', url: 'https://thinkcontest.com', tags: ['공모전', '정보'] },
            { id: 'contest3', name: '온콘', description: '온라인 공모전', url: 'https://www.oncon.co.kr', tags: ['온라인', '공모전'] },
            { id: 'contest4', name: '위비티', description: '공모전 플랫폼', url: 'https://www.wevity.com', tags: ['플랫폼', '공모전'] },
            { id: 'contest5', name: '��모스타', description: '공모전 정보', url: 'https://www.gongmostar.com', tags: ['공모전', '정보'] },
            { id: 'contest6', name: '링크공모전', description: '공모전 링크', url: 'https://www.linkgongmo.com', tags: ['링크', '공모전'] },
            { id: 'contest7', name: '미스터공모전', description: '공모전 사이트', url: 'https://www.misulgongmo.com', tags: ['미술', '공모전'] },
            { id: 'contest8', name: '공모닷컴', description: '종합 공모전', url: 'https://www.gongmo.com', tags: ['종합', '공모전'] }
          ]
        },
        {
          name: '학사 관리',
          sites: [
            { id: 'u17', name: '학점은행제', description: '평생교육', url: 'https://www.cb.or.kr', tags: ['평생교육', '학점'] },
            { id: 'u18', name: '독학학위제', description: '독학 학위', url: 'https://www.cb.or.kr/creditbank/stuSelf/intro.do', tags: ['독학', '학위'] },
            { id: 'u19', name: '원격대학종합정보시스템', description: '사이버대학 정보', url: 'https://www.cuinfo.net', tags: ['사이버대학', '정보'] },
            { id: 'u20', name: '외국대학 정보', description: '해외 대학 정보', url: 'https://www.studyinkorea.go.kr', tags: ['해외대학', '정보'] },
            { id: 'u21', name: '한국장학재단', description: '장학금 정보', url: 'https://www.kosaf.go.kr', tags: ['장학금', '정보'] },
            { id: 'u22', name: '교육부', description: '교육 정책', url: 'https://www.moe.go.kr', tags: ['교육', '정책'] },
            { id: 'u23', name: '한국교육개발원', description: '교육 연구', url: 'https://www.kedi.re.kr', tags: ['교육', '연구'] },
            { id: 'u24', name: '한국연구재단', description: '연구 지원', url: 'https://www.nrf.re.kr', tags: ['연구', '지원'] }
          ]
        }
      ]
    },
    'online': {
      title: '교육 - 온라인 강의',
      categories: [
        {
          name: '국내 플랫폼',
          sites: [
            { id: 'o1', name: '인프런', description: 'IT 교육 플랫폼', url: 'https://www.inflearn.com', tags: ['IT', '교육'] },
            { id: 'o2', name: '패스트캠퍼스', description: '실무 교육', url: 'https://fastcampus.co.kr', tags: ['실무', '교육'] },
            { id: 'o3', name: '코드잇', description: '프로그래밍 교육', url: 'https://www.codeit.kr', tags: ['프로그래밍', '교육'] },
            { id: 'o4', name: '프로그래머스', description: '코딩 테스트', url: 'https://programmers.co.kr', tags: ['코딩', '테스트'] },
            { id: 'o5', name: '엘리스', description: 'AI 교육', url: 'https://elice.io', tags: ['AI', '교육'] },
            { id: 'o6', name: '스파르타', description: '개발 부트캠프', url: 'https://spartacodingclub.kr', tags: ['개발', '부트캠프'] },
            { id: 'o7', name: '노마드 코더', description: '실전 코딩', url: 'https://nomadcoders.co', tags: ['실전', '코딩'] },
            { id: 'o8', name: '생활코딩', description: '무료 프로그래밍', url: 'https://opentutorials.org', tags: ['무료', '프로그래밍'] }
          ]
        },
        {
          name: '글로벌 플랫폼',
          sites: [
            { id: 'o9', name: 'Coursera', description: '대학 강좌', url: 'https://www.coursera.org', tags: ['대학', '강좌'] },
            { id: 'o10', name: 'edX', description: 'MIT 하버드 강좌', url: 'https://www.edx.org', tags: ['MIT', '하버드'] },
            { id: 'o11', name: 'Udemy', description: '실용 강좌', url: 'https://www.udemy.com', tags: ['실용', '강좌'] },
            { id: 'o12', name: 'Khan Academy', description: '무료 교육', url: 'https://www.khanacademy.org', tags: ['무료', '교육'] },
            { id: 'o13', name: 'Codecademy', description: '코딩 교육', url: 'https://www.codecademy.com', tags: ['코딩', '교육'] },
            { id: 'o14', name: 'FreeCodeCamp', description: '무료 코딩', url: 'https://www.freecodecamp.org', tags: ['무료', '코딩'] },
            { id: 'o15', name: 'Pluralsight', description: '기술 교육', url: 'https://www.pluralsight.com', tags: ['기술', '교육'] },
            { id: 'o16', name: 'LinkedIn Learning', description: '비즈니스 스킬', url: 'https://www.linkedin.com/learning', tags: ['비즈니스', '스킬'] }
          ]
        },
        {
          name: '언어 학습',
          sites: [
            { id: 'l1', name: '듀오링고', description: '언어 학습 앱', url: 'https://www.duolingo.com', tags: ['언어', '앱'] },
            { id: 'l2', name: 'Busuu', description: '온라인 언어학습', url: 'https://www.busuu.com', tags: ['온라인', '언어'] },
            { id: 'l3', name: 'Babbel', description: '실용 언어', url: 'https://www.babbel.com', tags: ['실용', '언어'] },
            { id: 'l4', name: 'iTalki', description: '언어 교환', url: 'https://www.italki.com', tags: ['언어', '교환'] },
            { id: 'l5', name: 'HelloTalk', description: '언어 교환 앱', url: 'https://www.hellotalk.com', tags: ['언어교환', '앱'] },
            { id: 'l6', name: 'Memrise', description: '단어 암기', url: 'https://www.memrise.com', tags: ['단어', '암기'] },
            { id: 'l7', name: 'Anki', description: '플래시카드', url: 'https://apps.ankiweb.net', tags: ['플래시카드', '암기'] },
            { id: 'l8', name: 'Quizlet', description: '학습 카드', url: 'https://quizlet.com', tags: ['학습', '카드'] }
          ]
        }
      ]
    }
  },
  'travel': {
    '': {
      title: '여행',
      categories: [
        {
          name: '항공/숙박',
          sites: [
            { id: 't1', name: '스카이스캐너', description: '항공료 비교', url: 'https://www.skyscanner.co.kr', tags: ['항공료', '비교'] },
            { id: 't2', name: '카약', description: '여행 검색 엔진', url: 'https://www.kayak.co.kr', tags: ['검색', '여행'] },
            { id: 't3', name: '익스피디아', description: '여행 예약', url: 'https://www.expedia.co.kr', tags: ['예약', '여행'] },
            { id: 't4', name: '부킹닷컴', description: '숙박 예약', url: 'https://www.booking.com', tags: ['숙박', '예약'] },
            { id: 't5', name: '아고다', description: '아시아 호텔', url: 'https://www.agoda.com', tags: ['아시아', '호텔'] },
            { id: 't6', name: '에어비앤비', description: '숙박 공유', url: 'https://www.airbnb.co.kr', tags: ['숙박', '공유'] },
            { id: 't7', name: '호스텔월드', description: '백패커 숙소', url: 'https://www.hostelworld.com', tags: ['백패커', '숙소'] },
            { id: 't8', name: '야놀자', description: '국내 숙박', url: 'https://www.yanolja.com', tags: ['국내', '숙박'] }
          ]
        },
        {
          name: '여행사/패키지',
          sites: [
            { id: 't9', name: '하나투어', description: '대형 여행사', url: 'https://www.hanatour.com', tags: ['대형', '여행사'] },
            { id: 't10', name: '모두투어', description: '온라인 여행사', url: 'https://www.modetour.com', tags: ['온라인', '여행사'] },
            { id: 't11', name: '롯데관광', description: '롯데 여행사', url: 'https://www.lottetour.com', tags: ['롯데', '여행사'] },
            { id: 't12', name: '옐로우발룬투어', description: '자유여행 전문', url: 'https://www.ybtour.co.kr', tags: ['자유여행', '전문'] },
            { id: 't13', name: '온라인투어', description: '해외여행', url: 'https://www.onlinetour.co.kr', tags: ['해외', '여행'] },
            { id: 't14', name: '인터파크투어', description: '여행 상품', url: 'https://tour.interpark.com', tags: ['상품', '여행'] },
            { id: 't15', name: '11번가투어', description: '쇼핑몰 여행', url: 'https://travel.11st.co.kr', tags: ['쇼핑몰', '여행'] },
            { id: 't16', name: 'G마켓 투어', description: 'G마켓 여행', url: 'https://travel.gmarket.co.kr', tags: ['G마켓', '여행'] }
          ]
        },
        {
          name: '여행 정보',
          sites: [
            { id: 't17', name: '트리패드바이저', description: '여행 리뷰', url: 'https://www.tripadvisor.co.kr', tags: ['리뷰', '여행'] },
            { id: 't18', name: '론리플래닛', description: '여행 가이드북', url: 'https://www.lonelyplanet.com', tags: ['가이드북', '여행'] },
            { id: 't19', name: '푸어베이', description: '구글 여행 정보', url: 'https://www.google.com/travel', tags: ['구글', '여행정보'] },
            { id: 't20', name: '컨시어지', description: '여행 큐레이션', url: 'https://www.myrealtrip.com', tags: ['큐레이션', '여행'] },
            { id: 't21', name: 'Visit Korea', description: '한국관광공사', url: 'https://english.visitkorea.or.kr', tags: ['한국관광', '공사'] },
            { id: 't22', name: '클룩', description: '액티비티 예약', url: 'https://www.klook.com', tags: ['액티비티', '예약'] },
            { id: 't23', name: '겟유어가이드', description: '투어 예약', url: 'https://www.getyourguide.com', tags: ['투어', '예약'] },
            { id: 't24', name: '비아터', description: '현지 투어', url: 'https://www.viator.com', tags: ['현지', '투어'] }
          ]
        },
        {
          name: '국내 여행',
          sites: [
            { id: 't25', name: '대한민국 구석구석', description: '국내 여행 정보', url: 'https://korean.visitkorea.or.kr', tags: ['국내', '여행정보'] },
            { id: 't26', name: '관광공사', description: '한국관광공사', url: 'https://www.visitkorea.or.kr', tags: ['관광공사', '한국'] },
            { id: 't27', name: '제주관광공사', description: '제주도 여행', url: 'https://www.visitjeju.net', tags: ['제주도', '여행'] },
            { id: 't28', name: '경기관광공사', description: '경기도 여행', url: 'https://www.ggtour.or.kr', tags: ['경기도', '여행'] },
            { id: 't29', name: '부산관광공사', description: '부산 여행', url: 'https://www.visitbusan.net', tags: ['부산', '여행'] },
            { id: 't30', name: '전라남도 관광', description: '전남 여행', url: 'https://www.namdokorea.com', tags: ['전남', '여행'] },
            { id: 't31', name: '강원도 관광', description: '강원도 여행', url: 'https://www.gangwon.to', tags: ['강원도', '여행'] },
            { id: 't32', name: '충청북도 관광', description: '충북 여행', url: 'https://tour.chungbuk.go.kr', tags: ['충북', '여행'] }
          ]
        },
        {
          name: '교통/지도',
          sites: [
            { id: 't33', name: '구글 맵스', description: '구글 지도', url: 'https://maps.google.com', tags: ['구글', '지도'] },
            { id: 't34', name: '네이버 지도', description: '네이버 지도', url: 'https://map.naver.com', tags: ['네이버', '지도'] },
            { id: 't35', name: '카카오맵', description: '카카오 지도', url: 'https://map.kakao.com', tags: ['카카오', '지도'] },
            { id: 't36', name: '지하철종합정보', description: '지하철 정보', url: 'https://www.seoulmetro.co.kr', tags: ['지하철', '정보'] },
            { id: 't37', name: '고속버스통합예매', description: '고속버스 예약', url: 'https://www.kobus.co.kr', tags: ['고속버스', '예약'] },
            { id: 't38', name: '시외버스통합예매', description: '시외버스 예약', url: 'https://txbus.t-money.co.kr', tags: ['시외버스', '예약'] },
            { id: 't39', name: '코레일톡', description: '기차표 예약', url: 'https://www.letskorail.com', tags: ['기차표', '예약'] },
            { id: 't40', name: 'SRT', description: 'SRT 예약', url: 'https://etk.srail.kr', tags: ['SRT', '예약'] }
          ]
        },
        {
          name: '여행 커뮤니티',
          sites: [
            { id: 't41', name: '마이리얼트립', description: '여행 플랫폼', url: 'https://www.myrealtrip.com', tags: ['플랫폼', '여행'] },
            { id: 't42', name: '트래비', description: '여행 매거진', url: 'https://www.travie.com', tags: ['매거진', '여행'] },
            { id: 't43', name: '네이버 여행', description: '여행 카페', url: 'https://cafe.naver.com/travel', tags: ['카페', '여행'] },
            { id: 't44', name: '클리앙 여행', description: '여행 커뮤니티', url: 'https://www.clien.net/service/board/travel', tags: ['커뮤니티', '여행'] },
            { id: 't45', name: '디시 여행갤', description: '여행 갤러리', url: 'https://gall.dcinside.com/travel', tags: ['갤러리', '여행'] },
            { id: 't46', name: '백패커 코리아', description: '배낭여행', url: 'https://www.backpackerkorea.com', tags: ['배낭여행', '커뮤니티'] },
            { id: 't47', name: '트래블바이크', description: '자전거 여행', url: 'https://www.travelbike.co.kr', tags: ['자전거', '여행'] },
            { id: 't48', name: '캠핑클럽', description: '캠핑 정보', url: 'https://www.campingclub.co.kr', tags: ['캠핑', '정보'] }
          ]
        }
      ]
    }
  },
  'real-estate': {
    'landlord': {
      title: '부동산 - 임대인',
      categories: [
        {
          name: '임대관리',
          sites: [
            { id: 're1', name: '직방', description: '임대 관리 서비스', url: 'https://www.zigbang.com', tags: ['임대', '관리'] },
            { id: 're2', name: '다방', description: '부동산 플랫폼', url: 'https://www.dabangapp.com', tags: ['부동산', '플랫폼'] },
            { id: 're3', name: '피터팬의 좋은방 구하기', description: '임대 정보', url: 'https://www.peterpanz.com', tags: ['임대', '정보'] },
            { id: 're4', name: '네이버 부동산', description: '부동산 검색', url: 'https://land.naver.com', tags: ['검색', '부동산'] },
            { id: 're5', name: '부동산써브', description: '부동산 정보', url: 'https://www.r114.com', tags: ['부동산', '정보'] },
            { id: 're6', name: '다음 부동산', description: '부동산 플랫폼', url: 'https://realty.daum.net', tags: ['플랫폼', '부동산'] },
            { id: 're7', name: '국토교통부 실거래가', description: '실거래가 조회', url: 'https://rt.molit.go.kr', tags: ['실거래가', '조회'] },
            { id: 're8', name: '한국부동산원', description: '부동산 통계', url: 'https://www.reb.or.kr', tags: ['통계', '부동산'] }
          ]
        },
        {
          name: '법률/세무',
          sites: [
            { id: 're9', name: '국세청', description: '부동산 세무', url: 'https://www.nts.go.kr', tags: ['세무', '국세청'] },
            { id: 're10', name: '법무부 등기소', description: '부동산 등기', url: 'https://www.iros.go.kr', tags: ['등기', '법무부'] },
            { id: 're11', name: '대한법률구조공단', description: '법률 지원', url: 'https://www.klac.or.kr', tags: ['법률', '지원'] },
            { id: 're12', name: '한국공인중개사협회', description: '중개사 정보', url: 'https://www.kar.or.kr', tags: ['중개사', '정보'] },
            { id: 're13', name: '부동산 세무상담', description: '세무 상담', url: 'https://www.hometax.go.kr', tags: ['세무', '상담'] },
            { id: 're14', name: '임대차 분쟁조정', description: '분쟁 조정', url: 'https://www.molit.go.kr', tags: ['분쟁', '조정'] },
            { id: 're15', name: '소방청', description: '소방 검사', url: 'https://www.nfa.go.kr', tags: ['소방', '검사'] },
            { id: 're16', name: '건축허가', description: '건축 허가', url: 'https://www.eais.go.kr', tags: ['건축', '허가'] }
          ]
        }
      ]
    },
    'tenant': {
      title: '부동산 - 임차인',
      categories: [
        {
          name: '매물검색',
          sites: [
            { id: 'ret1', name: '직방', description: '원룸 투룸 검색', url: 'https://www.zigbang.com', tags: ['원룸', '투룸'] },
            { id: 'ret2', name: '다방', description: '전월세 검색', url: 'https://www.dabangapp.com', tags: ['전월세', '검색'] },
            { id: 'ret3', name: '방콕', description: '대학가 원룸', url: 'https://www.bangkok.co.kr', tags: ['대학가', '원룸'] },
            { id: 'ret4', name: '호갱노노', description: '실거래가 기반', url: 'https://hogangnono.com', tags: ['실거래가', '기반'] },
            { id: 'ret5', name: '부동산114', description: '부동산 종합정보', url: 'https://www.r114.com', tags: ['종합정보', '부동산'] },
            { id: 'ret6', name: '네이버부동산', description: '네이버 부동산', url: 'https://land.naver.com', tags: ['네이버', '부동산'] },
            { id: 'ret7', name: '리브온', description: '신축 분양', url: 'https://www.xn--939au0g4vj8sq.com', tags: ['신축', '분양'] },
            { id: 'ret8', name: '청약홈', description: '청약 정보', url: 'https://www.applyhome.co.kr', tags: ['청약', '정보'] }
          ]
        },
        {
          name: '생활정보',
          sites: [
            { id: 'ret9', name: '전월세 신고센터', description: '전월세 신고', url: 'https://rtms.molit.go.kr', tags: ['전월세', '신고'] },
            { id: 'ret10', name: '임대차 포털', description: '임대차 정보', url: 'https://www.saferent.go.kr', tags: ['임대차', '정보'] },
            { id: 'ret11', name: '전세금 반환보증', description: '전세금 보증', url: 'https://www.khug.or.kr', tags: ['전세금', '보증'] },
            { id: 'ret12', name: '주택도시보증공사', description: 'HUG 보증', url: 'https://www.khug.or.kr', tags: ['HUG', '보증'] },
            { id: 'ret13', name: '임차권등기명령', description: '임차권 등기', url: 'https://www.scourt.go.kr', tags: ['임차권', '등기'] },
            { id: 'ret14', name: '소비자분쟁조정', description: '분쟁 조정', url: 'https://www.ccn.go.kr', tags: ['분쟁', '조정'] },
            { id: 'ret15', name: '한국소비자원', description: '소비자 권익', url: 'https://www.kca.go.kr', tags: ['소비자', '권익'] },
            { id: 'ret16', name: '법률홈', description: '법률 상담', url: 'https://www.lawnb.com', tags: ['법률', '상담'] }
          ]
        }
      ]
    },
    'agent': {
      title: '부동산 - 공인중개사',
      categories: [
        {
          name: '업무도구',
          sites: [
            { id: 'rea1', name: '한국부동산원', description: '부동산 통계', url: 'https://www.reb.or.kr', tags: ['통계', '부동산'] },
            { id: 'rea2', name: '부동산 거래관리시스템', description: '거래 신고', url: 'https://rtms.molit.go.kr', tags: ['거래', '신고'] },
            { id: 'rea3', name: '부동산테크', description: '중개사 솔루션', url: 'https://www.stayfolio.com', tags: ['솔루션', '중개사'] },
            { id: 'rea4', name: '직방 프로', description: '중개사 전용', url: 'https://pro.zigbang.com', tags: ['중개사', '전용'] },
            { id: 'rea5', name: '다방 오너', description: '중개사 관리', url: 'https://owner.dabangapp.com', tags: ['중개사', '관리'] },
            { id: 'rea6', name: '부동산써브', description: '중개업무 지원', url: 'https://www.r114.com', tags: ['중개업무', '지원'] },
            { id: 'rea7', name: '부동산경매정보', description: '경매 정보', url: 'https://www.onbid.co.kr', tags: ['경매', '정보'] },
            { id: 'rea8', name: '공시지가', description: '공시지가 조회', url: 'https://www.realtyprice.kr', tags: ['공시지가', '조회'] }
          ]
        },
        {
          name: '교육/자격',
          sites: [
            { id: 'rea9', name: '한국공인중개사협회', description: '중개사 협회', url: 'https://www.kar.or.kr', tags: ['협회', '중개사'] },
            { id: 'rea10', name: '공인중개사 시험', description: '시험 정보', url: 'https://www.q-net.or.kr', tags: ['시험', '정보'] },
            { id: 'rea11', name: '부동산교육원', description: '부동산 교육', url: 'https://www.kreb.or.kr', tags: ['교육', '부동산'] },
            { id: 'rea12', name: '중개업 등록', description: '중개업 등록', url: 'https://www.reb.or.kr', tags: ['중개업', '등록'] },
            { id: 'rea13', name: '부동산 법령', description: '부동산 법령', url: 'https://www.law.go.kr', tags: ['법령', '부동산'] },
            { id: 'rea14', name: '부동산 실무', description: '실무 교육', url: 'https://www.kreb.or.kr', tags: ['실무', '교육'] },
            { id: 'rea15', name: '중개보수', description: '중개보수 기준', url: 'https://www.molit.go.kr', tags: ['중개보수', '기준'] },
            { id: 'rea16', name: '부동산 윤리', description: '직업윤리', url: 'https://www.kar.or.kr', tags: ['직업윤리', '부동산'] }
          ]
        }
      ]
    }
  },
  'insurance': {
    '': {
      title: '보험',
      categories: [
        {
          name: '생명보험',
          sites: [
            { id: 'ins1', name: '삼성생명', description: '생명보험 1위', url: 'https://www.samsunglife.com', tags: ['생명보험', '1위'] },
            { id: 'ins2', name: '한화생명', description: '한화 생명보험', url: 'https://www.hanwhalife.com', tags: ['한화', '생명보험'] },
            { id: 'ins3', name: '교보생명', description: '교보 생명보험', url: 'https://www.kyobo.co.kr', tags: ['교보', '생명보험'] },
            { id: 'ins4', name: '신한생명', description: '신한 생명보험', url: 'https://www.shinhanlife.co.kr', tags: ['신한', '생명보험'] },
            { id: 'ins5', name: 'KB생명', description: 'KB 생명보험', url: 'https://www.kbli.co.kr', tags: ['KB', '생명보험'] },
            { id: 'ins6', name: '미래에셋생명', description: '미래에셋 생명', url: 'https://www.miraeassetlife.com', tags: ['미래에셋', '생명'] },
            { id: 'ins7', name: '흥국생명', description: '흥국 생명보험', url: 'https://www.hungkuklife.com', tags: ['흥국', '생명보험'] },
            { id: 'ins8', name: '동양생명', description: '동양 생명보험', url: 'https://www.myangel.co.kr', tags: ['동양', '생명보험'] }
          ]
        },
        {
          name: '손해보험',
          sites: [
            { id: 'ins9', name: '삼성화재', description: '손해보험 1위', url: 'https://www.samsungfire.com', tags: ['손해보험', '1위'] },
            { id: 'ins10', name: 'DB손해보험', description: 'DB 손해보험', url: 'https://www.idbins.com', tags: ['DB', '손해보험'] },
            { id: 'ins11', name: '현대해상', description: '현대해상화재보험', url: 'https://www.hi.co.kr', tags: ['현대해상', '화재보험'] },
            { id: 'ins12', name: 'KB손해보험', description: 'KB 손해보험', url: 'https://www.kbinsure.co.kr', tags: ['KB', '손해보험'] },
            { id: 'ins13', name: '메리츠화재', description: '메리츠 화재보험', url: 'https://www.meritzfire.com', tags: ['메리츠', '화재보험'] },
            { id: 'ins14', name: 'AIG손해보험', description: 'AIG 손해보험', url: 'https://www.aig.co.kr', tags: ['AIG', '손해보험'] },
            { id: 'ins15', name: 'MG손해보험', description: 'MG 손해보험', url: 'https://www.mginsure.com', tags: ['MG', '손해보험'] },
            { id: 'ins16', name: '한화손해보험', description: '한화 손해보험', url: 'https://www.hanwhainsure.co.kr', tags: ['한화', '손해보험'] }
          ]
        },
        {
          name: '보험비교',
          sites: [
            { id: 'ins17', name: '보험다모아', description: '보험 비교 플랫폼', url: 'https://www.boheomdamoa.com', tags: ['비교', '플랫폼'] },
            { id: 'ins18', name: '보험몰', description: '온라인 보험몰', url: 'https://www.insumall.com', tags: ['온라인', '보험몰'] },
            { id: 'ins19', name: '굿리치', description: '보험료 비교', url: 'https://www.goodrich.co.kr', tags: ['보험료', '비교'] },
            { id: 'ins20', name: '보험마켓', description: '보험 마켓플레이스', url: 'https://www.insmarket.co.kr', tags: ['마켓플레이스', '보험'] },
            { id: 'ins21', name: '인슈어리', description: '보험 추천', url: 'https://www.insury.co.kr', tags: ['추천', '보험'] },
            { id: 'ins22', name: '보험닷컴', description: '보험 종합정보', url: 'https://www.insu.com', tags: ['종합정보', '보험'] },
            { id: 'ins23', name: '핀다 보험', description: '핀다 보험비교', url: 'https://www.finda.co.kr/insurance', tags: ['핀다', '보험비교'] },
            { id: 'ins24', name: '뱅크샐러드 보험', description: '뱅크샐러드 보험', url: 'https://www.banksalad.com/insurance', tags: ['뱅크샐러드', '보험'] }
          ]
        },
        {
          name: '자동차보험',
          sites: [
            { id: 'ins25', name: '삼성화재 다이렉트', description: '자동차보험 다이렉트', url: 'https://direct.samsungfire.com', tags: ['다이렉트', '자동차보험'] },
            { id: 'ins26', name: 'DB다이렉트', description: 'DB 다이렉트', url: 'https://direct.idbins.com', tags: ['DB', '다이렉트'] },
            { id: 'ins27', name: '현대해상다이렉트', description: '현대해상 다이렉트', url: 'https://direct.hi.co.kr', tags: ['현대해상', '다이렉트'] },
            { id: 'ins28', name: 'KB다이렉트', description: 'KB 다이렉트', url: 'https://direct.kbinsure.co.kr', tags: ['KB', '다이렉트'] },
            { id: 'ins29', name: '롯데손해보험', description: '롯데 자동차보험', url: 'https://www.lotteins.co.kr', tags: ['롯데', '자동차보험'] },
            { id: 'ins30', name: 'AXA다이렉트', description: 'AXA 다이렉트', url: 'https://www.axadirect.co.kr', tags: ['AXA', '다이렉트'] },
            { id: 'ins31', name: '캐롯손해보험', description: '캐롯 자동차보험', url: 'https://www.carrotins.com', tags: ['캐롯', '자동차보험'] },
            { id: 'ins32', name: '하나손해보험', description: '하나 자동차보험', url: 'https://www.hanainsure.co.kr', tags: ['하나', '자동차보험'] }
          ]
        },
        {
          name: '정부보험',
          sites: [
            { id: 'ins33', name: '국민연금', description: '국민연금공단', url: 'https://www.nps.or.kr', tags: ['국민연금', '공단'] },
            { id: 'ins34', name: '건강보험', description: '국민건강보험', url: 'https://www.nhis.or.kr', tags: ['국민건강보험', '건강'] },
            { id: 'ins35', name: '고용보험', description: '고용보험 서비스', url: 'https://www.ei.go.kr', tags: ['고용보험', '서비스'] },
            { id: 'ins36', name: '산재보험', description: '근로복지공단', url: 'https://www.comwel.or.kr', tags: ['근로복지공단', '산재'] },
            { id: 'ins37', name: '장기요양보험', description: '장기요양 서비스', url: 'https://www.longtermcare.or.kr', tags: ['장기요양', '서비스'] },
            { id: 'ins38', name: '농어업인연금', description: '농어업인 연금', url: 'https://www.nffc.or.kr', tags: ['농어업인', '연금'] },
            { id: 'ins39', name: '사학연금', description: '사립학교교직원연금', url: 'https://www.tp.or.kr', tags: ['사립학교', '교직원연금'] },
            { id: 'ins40', name: '공무원연금', description: '공무원연금공단', url: 'https://www.geps.or.kr', tags: ['공무원', '연금공단'] }
          ]
        },
        {
          name: '보험정보',
          sites: [
            { id: 'ins41', name: '보험개발원', description: '보험 연구 개발', url: 'https://www.kidi.or.kr', tags: ['연구', '개발'] },
            { id: 'ins42', name: '보험협회', description: '생명보험협회', url: 'https://www.klia.or.kr', tags: ['생명보험', '협회'] },
            { id: 'ins43', name: '손해보험협회', description: '손해보험협회', url: 'https://www.knia.or.kr', tags: ['손해보험', '협회'] },
            { id: 'ins44', name: '보험분쟁조정위원회', description: '보험 분쟁 조정', url: 'https://www.adrc.or.kr', tags: ['분쟁', '조정'] },
            { id: 'ins45', name: '보험연수원', description: '보험 교육', url: 'https://www.kiri.or.kr', tags: ['교육', '보험'] },
            { id: 'ins46', name: '금융감독원', description: '금융 감독', url: 'https://www.fss.or.kr', tags: ['금융', '감독'] },
            { id: 'ins47', name: '예금보험공사', description: '예금자 보호', url: 'https://www.kdic.or.kr', tags: ['예금자', '보호'] },
            { id: 'ins48', name: '신용보증기금', description: '신용 보증', url: 'https://www.kodit.co.kr', tags: ['신용', '보증'] }
          ]
        }
      ]
    }
  },
  'gaming': {
    '': {
      title: '게임',
      categories: [
        {
          name: 'PC게임',
          sites: [
            { id: 'game1', name: 'Steam', description: 'PC 게임 플랫폼', url: 'https://store.steampowered.com', tags: ['PC', '플랫폼'] },
            { id: 'game2', name: 'Epic Games', description: 'Epic 게임 스토어', url: 'https://www.epicgames.com', tags: ['Epic', '스토어'] },
            { id: 'game3', name: 'GOG', description: 'DRM 프리 게임', url: 'https://www.gog.com', tags: ['DRM프리', '게임'] },
            { id: 'game4', name: 'Origin', description: 'EA 게임 플랫폼', url: 'https://www.origin.com', tags: ['EA', '플랫폼'] },
            { id: 'game5', name: 'Uplay', description: '유비소프트 플랫폼', url: 'https://uplay.ubisoft.com', tags: ['유비소프트', '플랫폼'] },
            { id: 'game6', name: 'Battle.net', description: '블리자드 플랫폼', url: 'https://www.battle.net', tags: ['블리자드', '플랫폼'] },
            { id: 'game7', name: '넥슨', description: '넥슨 게임 포털', url: 'https://www.nexon.com', tags: ['넥슨', '포털'] },
            { id: 'game8', name: 'NC소프트', description: 'NC소프트 게임', url: 'https://www.ncsoft.com', tags: ['NC소프트', '게임'] }
          ]
        },
        {
          name: '모바일게임',
          sites: [
            { id: 'game9', name: '구글 플레이', description: '안드로이드 게임', url: 'https://play.google.com/store/games', tags: ['안드로이드', '게임'] },
            { id: 'game10', name: 'App Store', description: 'iOS 게임', url: 'https://apps.apple.com/kr/charts/iphone/games', tags: ['iOS', '게임'] },
            { id: 'game11', name: '원스토어', description: '국내 앱스토어', url: 'https://www.onestore.co.kr', tags: ['국내', '앱스토어'] },
            { id: 'game12', name: '넷마블', description: '넷마블 게임', url: 'https://www.netmarble.com', tags: ['넷마블', '게임'] },
            { id: 'game13', name: '컴투스', description: '컴투스 게임', url: 'https://www.com2us.com', tags: ['컴투스', '게임'] },
            { id: 'game14', name: 'NHN', description: 'NHN 게임', url: 'https://www.nhn.com', tags: ['NHN', '게임'] },
            { id: 'game15', name: '카카오게임즈', description: '카카오 게임', url: 'https://www.kakaogames.com', tags: ['카카오', '게임'] },
            { id: 'game16', name: 'PUBG 모바일', description: 'PUBG 모바일', url: 'https://pubgmobile.com', tags: ['PUBG', '모바일'] }
          ]
        },
        {
          name: '콘솔게임',
          sites: [
            { id: 'game17', name: 'PlayStation', description: '플레이스테이션', url: 'https://www.playstation.com', tags: ['플레이스테이션', '콘솔'] },
            { id: 'game18', name: 'Xbox', description: '엑스박스', url: 'https://www.xbox.com', tags: ['엑스박스', '콘솔'] },
            { id: 'game19', name: 'Nintendo', description: '닌텐도', url: 'https://www.nintendo.co.kr', tags: ['닌텐도', '콘솔'] },
            { id: 'game20', name: 'PS Store', description: 'PlayStation 스토어', url: 'https://store.playstation.com', tags: ['PlayStation', '스토어'] },
            { id: 'game21', name: 'Xbox Store', description: 'Xbox 스토어', url: 'https://www.microsoft.com/store/games/xbox', tags: ['Xbox', '스토어'] },
            { id: 'game22', name: 'Nintendo eShop', description: '닌텐도 이샵', url: 'https://www.nintendo.co.kr/software', tags: ['닌텐도', '이샵'] },
            { id: 'game23', name: '게임패스', description: 'Xbox Game Pass', url: 'https://www.xbox.com/xbox-game-pass', tags: ['Xbox', 'Game Pass'] },
            { id: 'game24', name: 'PS Plus', description: 'PlayStation Plus', url: 'https://www.playstation.com/ps-plus', tags: ['PlayStation', 'Plus'] }
          ]
        },
        {
          name: '게임정보',
          sites: [
            { id: 'game25', name: '인벤', description: '게임 포털 1위', url: 'https://www.inven.co.kr', tags: ['포털', '1위'] },
            { id: 'game26', name: '디스이즈게임', description: '게임 뉴스', url: 'https://www.thisisgame.com', tags: ['뉴스', '게임'] },
            { id: 'game27', name: '루리웹', description: '게임 커뮤니티', url: 'https://bbs.ruliweb.com', tags: ['커뮤니티', '게임'] },
            { id: 'game28', name: 'IGN', description: '글로벌 게임 뉴스', url: 'https://www.ign.com', tags: ['글로벌', '뉴스'] },
            { id: 'game29', name: 'Metacritic', description: '게임 평점', url: 'https://www.metacritic.com/game', tags: ['평점', '게임'] },
            { id: 'game30', name: 'GameSpot', description: '게임 리뷰', url: 'https://www.gamespot.com', tags: ['리뷰', '게임'] },
            { id: 'game31', name: '게임메카', description: '게임 정보', url: 'https://www.gamemeca.com', tags: ['정보', '게임'] },
            { id: 'game32', name: '경향게임스', description: '게임 뉴스', url: 'https://www.khgames.co.kr', tags: ['뉴스', '게임'] }
          ]
        },
        {
          name: 'e스포츠',
          sites: [
            { id: 'game33', name: 'Twitch', description: '게임 스트리밍', url: 'https://www.twitch.tv', tags: ['스트리밍', '게임'] },
            { id: 'game34', name: 'YouTube Gaming', description: '유튜브 게이밍', url: 'https://www.youtube.com/gaming', tags: ['유튜브', '게이밍'] },
            { id: 'game35', name: 'AfreecaTV', description: '아프리카TV', url: 'https://www.afreecatv.com', tags: ['아프리카TV', '스트리밍'] },
            { id: 'game36', name: '치지직', description: '네이버 게임 스트리밍', url: 'https://chzzk.naver.com', tags: ['네이버', '스트리밍'] },
            { id: 'game37', name: 'OGN', description: 'OGN e스포츠', url: 'https://www.ogn.gg', tags: ['OGN', 'e스포츠'] },
            { id: 'game38', name: 'LCK', description: '리그 오브 레전드', url: 'https://lck.lolesports.com', tags: ['LOL', 'LCK'] },
            { id: 'game39', name: 'PUBG 리그', description: 'PUBG e스포츠', url: 'https://www.pubgesports.com', tags: ['PUBG', 'e스포츠'] },
            { id: 'game40', name: '발로란트 리그', description: '발로란트 e스포츠', url: 'https://valorantesports.com', tags: ['발로란트', 'e스포츠'] }
          ]
        },
        {
          name: '게임개발',
          sites: [
            { id: 'game41', name: 'Unity', description: '유니티 엔진', url: 'https://unity.com', tags: ['유니티', '엔진'] },
            { id: 'game42', name: 'Unreal Engine', description: '언리얼 엔진', url: 'https://www.unrealengine.com', tags: ['언리얼', '엔진'] },
            { id: 'game43', name: 'Godot', description: '고도 엔진', url: 'https://godotengine.org', tags: ['고도', '엔진'] },
            { id: 'game44', name: 'GameMaker', description: '게임메이커 스튜디오', url: 'https://www.yoyogames.com', tags: ['게임메이커', '스튜디오'] },
            { id: 'game45', name: 'Construct', description: '컨스트럭트 3', url: 'https://www.construct.net', tags: ['컨스트럭트', '개발툴'] },
            { id: 'game46', name: 'Roblox Studio', description: '로블록스 스튜디오', url: 'https://www.roblox.com/create', tags: ['로블록스', '스튜디오'] },
            { id: 'game47', name: 'Itch.io', description: '인디게임 플랫폼', url: 'https://itch.io', tags: ['인디게임', '플랫폼'] },
            { id: 'game48', name: 'Game Jolt', description: '인디게임 커뮤니티', url: 'https://gamejolt.com', tags: ['인디게임', '커뮤니티'] }
          ]
        }
      ]
    }
  },
  'cooking': {
    '': {
      title: '요리/레시피',
      categories: [
        {
          name: '레시피 사이트',
          sites: [
            { id: 'cook1', name: '만개의 레시피', description: '한국 최대 레시피', url: 'https://www.10000recipe.com', tags: ['레시피', '한국'] },
            { id: 'cook2', name: '쿡패드', description: '세계 레시피 공유', url: 'https://cookpad.com/kr', tags: ['레시피', '공유'] },
            { id: 'cook3', name: '네이버 요리', description: '네이버 요리 레시피', url: 'https://terms.naver.com/list.naver?cid=48180', tags: ['네이버', '요리'] },
            { id: 'cook4', name: '올리브영 레시피', description: '건강 레시피', url: 'https://www.oliveyoung.co.kr', tags: ['건강', '레시피'] },
            { id: 'cook5', name: '백종원의 요리비책', description: '백종원 레시피', url: 'https://www.youtube.com/@백종원의요리비책', tags: ['백종원', '레시피'] },
            { id: 'cook6', name: '집밥백선생', description: 'tvN 요리 프로그램', url: 'https://program.tving.com/tvn/homecook', tags: ['집밥', '백선생'] },
            { id: 'cook7', name: '알토란', description: 'MBC 요리 프로그램', url: 'https://www.imbc.com/broad/tv/ent/altoran', tags: ['알토란', 'MBC'] },
            { id: 'cook8', name: '오늘뭐먹지', description: '메뉴 추천', url: 'https://www.menupan.com', tags: ['메뉴', '추천'] }
          ]
        },
        {
          name: '식재료 쇼핑',
          sites: [
            { id: 'cook9', name: '마켓컬리', description: '신선식품 새벽배송', url: 'https://www.kurly.com', tags: ['신선식품', '새벽배송'] },
            { id: 'cook10', name: '쿠팡', description: '로켓배송 식재료', url: 'https://www.coupang.com', tags: ['로켓배송', '식재료'] },
            { id: 'cook11', name: '롯데온', description: '롯데 온라인쇼핑', url: 'https://www.lotteon.com', tags: ['롯데', '온라인쇼핑'] },
            { id: 'cook12', name: 'SSG.COM', description: '신세계 온라인', url: 'https://www.ssg.com', tags: ['신세계', '온라인'] },
            { id: 'cook13', name: '이마트몰', description: '이마트 온라인', url: 'https://emart.ssg.com', tags: ['이마트', '온라인'] },
            { id: 'cook14', name: '홈플러스', description: '홈플러스 온라인', url: 'https://www.homeplus.co.kr', tags: ['홈플러스', '온라인'] },
            { id: 'cook15', name: '농협몰', description: '농협 직판장', url: 'https://www.nhhanaro.co.kr', tags: ['농협', '직판장'] },
            { id: 'cook16', name: '온마켓', description: '농산물 직거래', url: 'https://www.onmarket.co.kr', tags: ['농산물', '직거래'] }
          ]
        },
        {
          name: '유튜브 요리채널',
          sites: [
            { id: 'cook17', name: '백종원의 요리비책', description: '백종원 유튜브', url: 'https://www.youtube.com/@백종원의요리비책', tags: ['백종원', '유튜브'] },
            { id: 'cook18', name: '승우아빠', description: '승우아빠 요리', url: 'https://www.youtube.com/@seungwoo_dad', tags: ['승우아빠', '요리'] },
            { id: 'cook19', name: '정관장 요리선생', description: '정관장TV', url: 'https://www.youtube.com/@jungkwanjang', tags: ['정관장', '요리선생'] },
            { id: 'cook20', name: '료리킹', description: '료리킹 채널', url: 'https://www.youtube.com/@ryoriking', tags: ['료리킹', '채널'] },
            { id: 'cook21', name: '쿠킹트리', description: '베이킹 전문', url: 'https://www.youtube.com/@Cooking_tree', tags: ['베이킹', '전문'] },
            { id: 'cook22', name: '밥심', description: '밥심 요리', url: 'https://www.youtube.com/@babshim', tags: ['밥심', '요리'] },
            { id: 'cook23', name: '혼밥레시피', description: '혼자 먹는 요리', url: 'https://www.youtube.com/@honbab_recipe', tags: ['혼밥', '레시피'] },
            { id: 'cook24', name: '감자요리사', description: '감자요리사 채널', url: 'https://www.youtube.com/@potato_chef', tags: ['감자요리사', '채널'] }
          ]
        },
        {
          name: '건강식/다이어트',
          sites: [
            { id: 'cook25', name: '다이어트 신', description: '다이어트 레시피', url: 'https://www.dietsin.com', tags: ['다이어트', '레시피'] },
            { id: 'cook26', name: '닥터키친', description: '건강식 레시피', url: 'https://www.doctorkitchen.co.kr', tags: ['건강식', '레시피'] },
            { id: 'cook27', name: '헬스조선 레시피', description: '건강 요리법', url: 'https://health.chosun.com/cooking', tags: ['건강', '요리법'] },
            { id: 'cook28', name: '하이닥 레시피', description: '의학정보 레시피', url: 'https://www.hidoc.co.kr', tags: ['의학정보', '레시피'] },
            { id: 'cook29', name: '식품의약품안전처', description: '안전한 식품정보', url: 'https://www.mfds.go.kr', tags: ['안전', '식품정보'] },
            { id: 'cook30', name: '한국영양학회', description: '영양정보', url: 'https://www.kns.or.kr', tags: ['영양', '정보'] },
            { id: 'cook31', name: '농촌진흥청', description: '농산물 정보', url: 'https://www.rda.go.kr', tags: ['농산물', '정보'] },
            { id: 'cook32', name: '식품안전나라', description: '식품안전정보', url: 'https://www.foodsafetykorea.go.kr', tags: ['식품안전', '정보'] }
          ]
        },
        {
          name: '베이킹/디저트',
          sites: [
            { id: 'cook33', name: '마카롱꽁뜨', description: '프랑스 베이킹', url: 'https://www.macaron-comte.com', tags: ['프랑스', '베이킹'] },
            { id: 'cook34', name: '베이킹 클래스', description: '베이킹 레슨', url: 'https://www.baking-class.com', tags: ['베이킹', '레슨'] },
            { id: 'cook35', name: '파리바게트', description: '베이커리 레시피', url: 'https://www.paris.co.kr', tags: ['베이커리', '레시피'] },
            { id: 'cook36', name: '투썸플레이스', description: '카페 디저트', url: 'https://www.twosome.co.kr', tags: ['카페', '디저트'] },
            { id: 'cook37', name: '베스킨라빈스', description: '아이스크림 레시피', url: 'https://www.baskinrobbins.co.kr', tags: ['아이스크림', '레시피'] },
            { id: 'cook38', name: '던킨도너츠', description: '도넛 만들기', url: 'https://www.dunkindonuts.co.kr', tags: ['도넛', '만들기'] },
            { id: 'cook39', name: '홈베이킹', description: '집에서 베이킹', url: 'https://www.homebaking.co.kr', tags: ['집에서', '베이킹'] },
            { id: 'cook40', name: '제과제빵', description: '제과제빵 기술', url: 'https://www.breadmall.co.kr', tags: ['제과제빵', '기술'] }
          ]
        },
        {
          name: '요리 도구/쇼핑',
          sites: [
            { id: 'cook41', name: '쿠첸', description: '주방가전 전문', url: 'https://www.cuchen.com', tags: ['주방가전', '전문'] },
            { id: 'cook42', name: '한샘몰', description: '주방용품', url: 'https://www.hanssemmall.com', tags: ['주방용품', '한샘'] },
            { id: 'cook43', name: '락앤락', description: '밀폐용기 전문', url: 'https://www.locknlock.com', tags: ['밀폐용기', '전문'] },
            { id: 'cook44', name: '옥스포드', description: '주방용품 브랜드', url: 'https://www.oxford.co.kr', tags: ['주방용품', '브랜드'] },
            { id: 'cook45', name: '코베아', description: '아웃도어 쿠킹', url: 'https://www.kovea.com', tags: ['아웃도어', '쿠킹'] },
            { id: 'cook46', name: '11번가 주방', description: '주방용품 쇼핑', url: 'https://www.11st.co.kr/category/1467', tags: ['주방용품', '쇼핑'] },
            { id: 'cook47', name: 'G마켓 주방', description: 'G마켓 주방용품', url: 'https://category.gmarket.co.kr/listview/L100000147', tags: ['G마켓', '주방용품'] },
            { id: 'cook48', name: 'WMF', description: '독일 주방용품', url: 'https://www.wmf.com', tags: ['독일', '주방용품'] }
          ]
        }
      ]
    }
  },
  'fashion': {
    '': {
      title: '패션/뷰티',
      categories: [
        {
          name: '패션 쇼핑몰',
          sites: [
            { id: 'fas1', name: '무신사', description: '대한민국 최대 패션 플랫폼', url: 'https://www.musinsa.com', tags: ['패션', '쇼핑'] },
            { id: 'fas2', name: '브랜디', description: '여성 패션 전문몰', url: 'https://www.brandi.co.kr', tags: ['여성', '의류'] },
            { id: 'fas3', name: '스타일난다', description: '트렌디한 여성 패션', url: 'https://www.stylenanda.com', tags: ['트렌디', '여성'] },
            { id: 'fas4', name: '지그재그', description: '패션 통합 검색', url: 'https://www.zigzag.kr', tags: ['통합검색', '패션'] },
            { id: 'fas5', name: '하프클럽', description: 'CJ ENM 패션몰', url: 'https://www.halfclub.com', tags: ['CJ', '패션몰'] },
            { id: 'fas6', name: '29CM', description: '프리미엄 패션 플랫폼', url: 'https://www.29cm.co.kr', tags: ['프리미엄', '패션'] }
          ]
        },
        {
          name: '뷰티/화장품',
          sites: [
            { id: 'bea1', name: '올리브영', description: '국내 1위 뷰티 플랫폼', url: 'https://www.oliveyoung.co.kr', tags: ['뷰티', '1위'] },
            { id: 'bea2', name: '세포라', description: '글로벌 뷰티 브랜드', url: 'https://www.sephora.kr', tags: ['글로벌', '뷰티'] },
            { id: 'bea3', name: '화해', description: '화장품 성분 분석', url: 'https://www.hwahae.co.kr', tags: ['성분분석', '리뷰'] },
            { id: 'bea4', name: '로드샵', description: '로드샵 화장품 정보', url: 'https://www.roadshop.co.kr', tags: ['로드샵', '정보'] },
            { id: 'bea5', name: '글로우픽', description: '뷰티 리뷰 커뮤니티', url: 'https://www.glowpick.com', tags: ['리뷰', '커뮤니티'] },
            { id: 'bea6', name: '이니스프리', description: '자연주의 화장품', url: 'https://www.innisfree.co.kr', tags: ['자연주의', '화장품'] }
          ]
        }
      ]
    }
  },
  'drone': {
    '': {
      title: '드론/항공',
      categories: [
        {
          name: '드론 쇼핑',
          sites: [
            { id: 'dro1', name: 'DJI', description: '세계 1위 드론 브랜드', url: 'https://www.dji.com', tags: ['DJI', '드론'] },
            { id: 'dro2', name: '파롯', description: '프랑스 드론 브랜드', url: 'https://www.parrot.com', tags: ['파롯', '프랑스'] },
            { id: 'dro3', name: '드론샵', description: '국내 드론 전문몰', url: 'https://www.droneshop.co.kr', tags: ['전문몰', '국내'] },
            { id: 'dro4', name: '호비존', description: '드론 및 RC 전문', url: 'https://www.hobbyzone.co.kr', tags: ['RC', '취미'] },
            { id: 'dro5', name: '스카이드론', description: '드론 교육 및 판매', url: 'https://www.skydrone.co.kr', tags: ['교육', '판매'] },
            { id: 'dro6', name: '드론플러스', description: '드론 부품 및 액세서리', url: 'https://www.droneplus.co.kr', tags: ['부품', '액세서리'] }
          ]
        },
        {
          name: '드론 교육/자격증',
          sites: [
            { id: 'dro7', name: '교통안전공단', description: '드론 자격증 시험', url: 'https://www.kotsa.or.kr', tags: ['자격증', '시험'] },
            { id: 'dro8', name: '한국드론교육협회', description: '드론 교육 기관', url: 'https://www.kdea.or.kr', tags: ['교육', '협회'] },
            { id: 'dro9', name: '드론스쿨', description: '드론 조종사 교육', url: 'https://www.droneschool.co.kr', tags: ['조종사', '교육'] },
            { id: 'dro10', name: 'K-드론시스템', description: '드론 운항 관리', url: 'https://www.k-drone.go.kr', tags: ['운항관리', 'K-드론'] },
            { id: 'dro11', name: '항공안전기술원', description: '항공 안전 기술', url: 'https://www.kiast.or.kr', tags: ['안전기술', '항공'] },
            { id: 'dro12', name: '무인항공기협회', description: '무인항공기 협회', url: 'https://www.kopa.or.kr', tags: ['협회', '무인항공기'] }
          ]
        }
      ]
    }
  },
  'sports': {
    '': {
      title: '스포츠',
      categories: [
        {
          name: '축구',
          sites: [
            { id: 'soc1', name: 'FIFA', description: '국제축구연맹 공식 사이트', url: 'https://www.fifa.com', tags: ['FIFA', '공식'] },
            { id: 'soc2', name: 'K리그', description: '한국프로축구연맹', url: 'https://www.kleague.com', tags: ['K리그', 'KFA'] },
            { id: 'soc3', name: 'EPL', description: '프리미어리그 공식', url: 'https://www.premierleague.com', tags: ['EPL', '프리미어리그'] },
            { id: 'soc4', name: '라리가', description: '스페인 라리가', url: 'https://www.laliga.com', tags: ['라리가', '스페인'] },
            { id: 'soc5', name: '분데스리가', description: '독일 분데스리가', url: 'https://www.bundesliga.com', tags: ['분데스리가', '독일'] },
            { id: 'soc6', name: 'Goal.com', description: '축구 뉴스 및 정보', url: 'https://www.goal.com', tags: ['뉴스', '정보'] }
          ]
        },
        {
          name: '농구',
          sites: [
            { id: 'bas1', name: 'NBA', description: '미국프로농구리그', url: 'https://www.nba.com', tags: ['NBA', '미국'] },
            { id: 'bas2', name: 'KBL', description: '한국프로농구연맹', url: 'https://www.kbl.or.kr', tags: ['KBL', '한국'] },
            { id: 'bas3', name: 'FIBA', description: '국제농구연맹', url: 'https://www.fiba.basketball', tags: ['FIBA', '국제'] },
            { id: 'bas4', name: 'ESPN NBA', description: 'NBA 뉴스 및 통계', url: 'https://www.espn.com/nba', tags: ['ESPN', '통계'] },
            { id: 'bas5', name: '농구존', description: '국내 농구 커뮤니티', url: 'https://www.basketzone.co.kr', tags: ['커뮤니티', '국내'] },
            { id: 'bas6', name: 'Basketball Reference', description: '농구 통계 사이트', url: 'https://www.basketball-reference.com', tags: ['통계', '기록'] }
          ]
        },
        {
          name: '야구',
          sites: [
            { id: 'base1', name: 'KBO', description: '한국야구위원회', url: 'https://www.koreabaseball.com', tags: ['KBO', '한국야구'] },
            { id: 'base2', name: 'MLB', description: '메이저리그베이스볼', url: 'https://www.mlb.com', tags: ['MLB', '메이저리그'] },
            { id: 'base3', name: '스포츠서울 야구', description: '야구 뉴스 전문', url: 'https://www.sportsseoul.com', tags: ['뉴스', '야구'] },
            { id: 'base4', name: 'STATIZ', description: '야구 통계 사이트', url: 'https://www.statiz.co.kr', tags: ['통계', '기록'] },
            { id: 'base5', name: '야구공작소', description: '야구 분석 커뮤니티', url: 'https://www.baseballpark.co.kr', tags: ['분석', '커뮤니티'] },
            { id: 'base6', name: 'ESPN MLB', description: 'MLB 뉴스 및 정보', url: 'https://www.espn.com/mlb', tags: ['ESPN', 'MLB'] }
          ]
        }
      ]
    }
  },
  'auto': {
    '': {
      title: '자동차',
      categories: [
        {
          name: '신차 정보',
          sites: [
            { id: 'car1', name: '보배드림', description: '국내 최대 자동차 커뮤니티', url: 'https://www.bobaedream.co.kr', tags: ['커뮤니티', '자동차'] },
            { id: 'car2', name: '엠파크', description: '자동차 정보 포털', url: 'https://www.mpark.co.kr', tags: ['포털', '정보'] },
            { id: 'car3', name: '오토뷰', description: '자동차 리뷰 전문', url: 'https://www.autoview.co.kr', tags: ['리뷰', '전문'] },
            { id: 'car4', name: '카니발라이브', description: '자동차 라이브 방송', url: 'https://www.carnivalive.tv', tags: ['라이브', '방송'] },
            { id: 'car5', name: '모터그래프', description: '자동차 전문 미디어', url: 'https://www.motorgraph.com', tags: ['미디어', '전문'] },
            { id: 'car6', name: '오토엔뉴스', description: '자동차 뉴스', url: 'https://www.autonews.co.kr', tags: ['뉴스', '자동차'] }
          ]
        },
        {
          name: '중고차',
          sites: [
            { id: 'used1', name: 'SK엔카', description: '중고차 플랫폼 1위', url: 'https://www.encar.com', tags: ['중고차', '1위'] },
            { id: 'used2', name: '카즈', description: '중고차 매매 사이트', url: 'https://www.kars.co.kr', tags: ['매매', '사이트'] },
            { id: 'used3', name: '헤이딜러', description: '중고차 딜러 플랫폼', url: 'https://www.heydealer.com', tags: ['딜러', '플랫폼'] },
            { id: 'used4', name: '카카오 모터스', description: '카카오 중고차', url: 'https://motors.kakao.com', tags: ['카카오', '중고차'] },
            { id: 'used5', name: '첫차', description: '첫차 중고차 서비스', url: 'https://www.firstcar.co.kr', tags: ['첫차', '서비스'] },
            { id: 'used6', name: '차차차', description: '중고차 구독 서비스', url: 'https://www.chacha.car', tags: ['구독', '서비스'] }
          ]
        }
      ]
    }
  },
  'pets': {
    '': {
      title: '펫/반려동물',
      categories: [
        {
          name: '펫샵/용품',
          sites: [
            { id: 'pet1', name: '펫프렌즈', description: '펫샵 전문몰', url: 'https://www.petfriends.co.kr', tags: ['펫샵', '전문몰'] },
            { id: 'pet2', name: '지그재그펫', description: '반려동물 용품 통합몰', url: 'https://pet.zigzag.kr', tags: ['용품', '통합몰'] },
            { id: 'pet3', name: '펫츠비', description: '프리미엄 펫샵', url: 'https://www.petsby.co.kr', tags: ['프리미엄', '펫샵'] },
            { id: 'pet4', name: '마이펫닥터', description: '펫 건강관리', url: 'https://www.mypetdoctor.co.kr', tags: ['건강관리', '펫'] },
            { id: 'pet5', name: '펫플러스', description: '반려동물 종합 서비스', url: 'https://www.petplus.co.kr', tags: ['종합서비스', '반려동물'] },
            { id: 'pet6', name: '아지몰', description: '강아지 전문몰', url: 'https://www.azimall.co.kr', tags: ['강아지', '전문몰'] }
          ]
        },
        {
          name: '동물병원/의료',
          sites: [
            { id: 'vet1', name: '굿닥터', description: '동물병원 예약 플랫폼', url: 'https://www.goodoc.co.kr', tags: ['병원예약', '플랫폼'] },
            { id: 'vet2', name: '24시동물병원', description: '응급 동물병원', url: 'https://www.24animal.co.kr', tags: ['응급', '24시간'] },
            { id: 'vet3', name: '펫케어', description: '반려동물 건강정보', url: 'https://www.petcare.co.kr', tags: ['건강정보', '케어'] },
            { id: 'vet4', name: '벳플러스', description: '수의사 온라인 상담', url: 'https://www.vetplus.co.kr', tags: ['수의사', '상담'] },
            { id: 'vet5', name: '펫닥터24', description: '24시간 펫 상담', url: 'https://www.petdoctor24.com', tags: ['24시간', '상담'] },
            { id: 'vet6', name: '한국수의사회', description: '수의사 협회', url: 'https://www.kvma.or.kr', tags: ['수의사', '협회'] }
          ]
        }
      ]
    }
  },
  'hobby': {
    '': {
      title: '취미/여가',
      categories: [
        {
          name: '독서/도서',
          sites: [
            { id: 'book1', name: '교보문고', description: '국내 최대 서점', url: 'https://www.kyobobook.co.kr', tags: ['서점', '도서'] },
            { id: 'book2', name: '예스24', description: '온라인 서점', url: 'https://www.yes24.com', tags: ['온라인', '서점'] },
            { id: 'book3', name: '알라딘', description: '중고도서 전문', url: 'https://www.aladin.co.kr', tags: ['중고도서', '전문'] },
            { id: 'book4', name: '밀리의 서재', description: '전자책 구독 서비스', url: 'https://www.millie.co.kr', tags: ['전자책', '구독'] },
            { id: 'book5', name: '리디북스', description: '전자책 플랫폼', url: 'https://ridibooks.com', tags: ['전자책', '플랫폼'] },
            { id: 'book6', name: '굿리즈', description: '도서 리뷰 커뮤니티', url: 'https://www.goodreads.com', tags: ['리뷰', '커뮤니티'] }
          ]
        },
        {
          name: '수집/취미',
          sites: [
            { id: 'col1', name: '옥션', description: '경매 및 중고거래', url: 'https://www.auction.co.kr', tags: ['경매', '중고거래'] },
            { id: 'col2', name: '카드트레이더', description: '트레이딩카드 거래', url: 'https://www.cardtrader.com', tags: ['트레이딩카드', '거래'] },
            { id: 'col3', name: '피규어로이드', description: '피규어 전문몰', url: 'https://www.figureroid.co.kr', tags: ['피규어', '전문몰'] },
            { id: 'col4', name: '코인플러스', description: '동전 수집 정보', url: 'https://www.coinplus.co.kr', tags: ['동전수집', '정보'] },
            { id: 'col5', name: '우표박물관', description: '우표 수집 정보', url: 'https://www.stamp.go.kr', tags: ['우표수집', '박물관'] },
            { id: 'col6', name: '빈티지샵', description: '빈티지 아이템', url: 'https://www.vintageshop.co.kr', tags: ['빈티지', '아이템'] }
          ]
        }
      ]
    }
  }
};

interface CategoryDetailPageProps {
  categoryId: string;
  subCategory?: string;
}

export function CategoryDetailPage({ categoryId, subCategory }: CategoryDetailPageProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedFavorites = localStorage.getItem(`favorites_${categoryId}_${subCategory}`);
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, [categoryId, subCategory]);

  const toggleFavorite = (siteId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(siteId)) {
      newFavorites.delete(siteId);
    } else {
      newFavorites.add(siteId);
    }
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${categoryId}_${subCategory}`, JSON.stringify([...newFavorites]));
  };

  const categoryConfig = categoryData[categoryId];
  if (!categoryConfig) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">해당 카테고리의 정보를 준비 중입니다.</p>
      </div>
    );
  }

  const data = subCategory ? categoryConfig[subCategory] : Object.values(categoryConfig)[0];
  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">해당 카테고리의 정보를 준비 중입니다.</p>
      </div>
    );
  }

  const sortedCategories = data.categories.map(category => ({
    ...category,
    sites: [...category.sites].sort((a, b) => {
      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    })
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      <div className="space-y-12">
        {sortedCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {category.name}
                </h3>
                <div className="ml-auto bg-white/20 px-4 py-2 rounded-full">
                  <span className="text-white font-medium">
                    {category.sites.length}개 사이트
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                {category.sites.map((site) => (
                  <SiteCard
                    key={site.id}
                    name={site.name}
                    description={site.description}
                    url={site.url}
                    tags={site.tags}
                    category={category.name}
                    isFavorite={favorites.has(site.id)}
                    onToggleFavorite={() => toggleFavorite(site.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 맨 아래 통계 */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-3">총 정리</h3>
          <p className="text-lg text-gray-600">
            <span className="font-bold text-blue-600 text-xl">{sortedCategories.length}</span>개 카테고리에 
            <span className="font-bold text-purple-600 text-xl ml-1">
              {sortedCategories.reduce((total, cat) => total + cat.sites.length, 0)}
            </span>개의 유용한 사이트가 준비되어 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
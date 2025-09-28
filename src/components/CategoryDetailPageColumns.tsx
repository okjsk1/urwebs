import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Heart, FolderPlus, Folder, X, Plus } from 'lucide-react';
interface Site {
  id: string;
  name: string;
  description: string;
  url: string;
}

interface Folder {
  id: string;
  name: string;
  sites: string[]; // site IDs
}

interface Category {
  name: string;
  sites: Site[];
}

interface CategoryData {
  title: string;
  categories: Category[];
}

const getCategoryData = (categoryId: string, subCategory: string): CategoryData => {
  // 건축 카테고리 - 설계 서브카테고리
  if (categoryId === 'architecture' && subCategory === 'design') {
    return {
      title: '건축/BIM/CAD/GIS - 설계',
      categories: [
        {
          name: '법규/코드',
          sites: [
            { id: 'law1', name: '국가법령정보센터', description: '건축법, 건축사법 등 법령 검색', url: 'https://www.law.go.kr' },
            { id: 'law2', name: '건축물대장정보', description: '건축물 대장 열람 서비스', url: 'https://www.eais.go.kr' },
            { id: 'law3', name: '건축행정시스템', description: '건축 인허가 업무 시스템', url: 'https://www.elis.go.kr' },
            { id: 'law4', name: '표준시방서', description: '건축공사 표준시방서', url: 'https://www.kcsc.re.kr' },
            { id: 'law5', name: '건축구조기준', description: 'KDS 건축구조설계기준', url: 'https://www.kcsc.re.kr' },
            { id: 'law6', name: '소방법령', description: '소방관련 법령 및 기준', url: 'https://www.nfds.go.kr' }
          ]
        },
        {
          name: '인허가/행정규제',
          sites: [
            { id: 'permit1', name: '세움터', description: '건축행정 통합 서비스', url: 'https://www.eais.go.kr' },
            { id: 'permit2', name: '건축물생애이력', description: '건축물 생애주기 관리', url: 'https://blcm.go.kr' },
            { id: 'permit3', name: '녹색건축인증', description: 'G-SEED 인증 시스템', url: 'https://www.gseed.or.kr' },
            { id: 'permit4', name: '장애물없는생활환경', description: 'BF 인증 시스템', url: 'https://www.koddi.or.kr' },
            { id: 'permit5', name: '에너지효율등급', description: '건축물 에너지 효율등급', url: 'https://www.bea.go.kr' },
            { id: 'permit6', name: '건축허가정보', description: '전국 건축허가 현황', url: 'https://www.eais.go.kr' }
          ]
        },
        {
          name: '지식자료/GIS',
          sites: [
            { id: 'gis1', name: '국토정보플랫폼', description: '국토교통부 공간정보', url: 'https://www.nsdi.go.kr' },
            { id: 'gis2', name: '브이월드', description: '3D 공간정보 서비스', url: 'https://www.vworld.kr' },
            { id: 'gis3', name: '지적재조사', description: '지적재조사 포털', url: 'https://www.rlris.go.kr' },
            { id: 'gis4', name: '토지이용계획', description: '토지이용계획 확인서비스', url: 'https://luris.go.kr' },
            { id: 'gis5', name: '새주소안내', description: '도로명주소 안내시스템', url: 'https://www.juso.go.kr' },
            { id: 'gis6', name: '건축자산진흥원', description: '한옥 및 건축자산 정보', url: 'https://www.kaah.or.kr' }
          ]
        },
        {
          name: '설계레퍼런스/해외',
          sites: [
            { id: 'ref1', name: 'ArchDaily', description: '세계 건축 프로젝트 아카이브', url: 'https://www.archdaily.com' },
            { id: 'ref2', name: 'Dezeen', description: '건축 및 디자인 매거진', url: 'https://www.dezeen.com' },
            { id: 'ref3', name: 'Architizer', description: '건축 프로젝트 플랫폼', url: 'https://architizer.com' },
            { id: 'ref4', name: 'World Architecture', description: '세계 건축 뉴스', url: 'https://www.worldarchitecture.org' },
            { id: 'ref5', name: 'Pinterest Architecture', description: '건축 레퍼런스 이미지', url: 'https://www.pinterest.com' },
            { id: 'ref6', name: 'Behance Architecture', description: '건축 포트폴리오', url: 'https://www.behance.net' }
          ]
        },
        {
          name: '지식사이트/선례',
          sites: [
            { id: 'know1', name: '건축도시연구정보센터', description: 'AURIC 연구정보', url: 'https://www.auric.or.kr' },
            { id: 'know2', name: '대한건축사협회', description: '건축사 협회 정보', url: 'https://www.kira.or.kr' },
            { id: 'know3', name: '한국건축가협회', description: '건축가 협회', url: 'https://www.kia.or.kr' },
            { id: 'know4', name: '건축공간연구원', description: 'AURI 연구원', url: 'https://www.auri.re.kr' },
            { id: 'know5', name: '한국건설기술연구원', description: 'KICT 기술연구', url: 'https://www.kict.re.kr' },
            { id: 'know6', name: '건축시공학회', description: '건축 시공 기술', url: 'https://www.jcae.or.kr' }
          ]
        },
        {
          name: 'BIM/3D모델링',
          sites: [
            { id: 'bim1', name: '스마트건설기술', description: 'BIM 기술 정보', url: 'https://www.smart-construction.kr' },
            { id: 'bim2', name: 'openBIM', description: 'openBIM 표준', url: 'https://www.openbim.org' },
            { id: 'bim3', name: 'Autodesk Revit', description: 'Revit BIM 소프트웨어', url: 'https://www.autodesk.com/products/revit' },
            { id: 'bim4', name: 'ArchiCAD', description: 'Graphisoft ArchiCAD', url: 'https://www.graphisoft.com' },
            { id: 'bim5', name: 'Tekla', description: 'Tekla 구조 BIM', url: 'https://www.tekla.com' },
            { id: 'bim6', name: 'SketchUp', description: '3D 모델링 도구', url: 'https://www.sketchup.com' }
          ]
        },
        {
          name: '시공/현장관리',
          sites: [
            { id: 'const1', name: '한국건설기술연구원', description: '건설기술 연구정보', url: 'https://www.kict.re.kr' },
            { id: 'const2', name: '건설기술정보시스템', description: '건설기술 종합정보', url: 'https://www.codil.or.kr' },
            { id: 'const3', name: '건설공제조합', description: '건설업 공제정보', url: 'https://www.fcic.or.kr' },
            { id: 'const4', name: '건설산업정보센터', description: '건설산업 통계정보', url: 'https://www.cic.go.kr' },
            { id: 'const5', name: '건설안전기술원', description: '건설안전 기술정보', url: 'https://www.ikst.re.kr' },
            { id: 'const6', name: '건설기계관리법', description: '건설기계 관련 법령', url: 'https://www.elaw.go.kr' }
          ]
        },
        {
          name: '구조/설비/전기',
          sites: [
            { id: 'struct1', name: '한국강구조학회', description: '강구조 기술정보', url: 'https://www.kssc.or.kr' },
            { id: 'struct2', name: '한국콘크리트학회', description: '콘크리트 기술정보', url: 'https://www.kci.or.kr' },
            { id: 'struct3', name: '대한설비공학회', description: '건축설비 기술정보', url: 'https://www.sarek.or.kr' },
            { id: 'struct4', name: '한국조명전기설비학회', description: '전기설비 기술정보', url: 'https://www.kiiee.or.kr' },
            { id: 'struct5', name: '한국지진공학회', description: '내진설계 기술정보', url: 'https://www.eesk.or.kr' },
            { id: 'struct6', name: '한국구조물진단학회', description: '구조물 진단기술', url: 'https://www.ksmi.or.kr' }
          ]
        },
        {
          name: '자재/업체정보',
          sites: [
            { id: 'material1', name: '한국건설자재시험연구원', description: '건설자재 시험인증', url: 'https://www.ktl.re.kr' },
            { id: 'material2', name: '대한건설협회', description: '건설업체 정보', url: 'https://www.cak.or.kr' },
            { id: 'material3', name: 'KS건설기준', description: '한국산업표준 건설기준', url: 'https://www.kats.go.kr' },
            { id: 'material4', name: '건설신기술협회', description: '건설신기술 정보', url: 'https://www.kcnet.or.kr' },
            { id: 'material5', name: '건축자재정보', description: '건축자재 종합정보', url: 'https://www.archmat.or.kr' },
            { id: 'material6', name: '친환경건축자재', description: '친환경 건축자재 정보', url: 'https://www.greenmat.kr' }
          ]
        }
      ]
    };
  }

  // 건축 카테고리 - 학생 서브카테고리
  if (categoryId === 'architecture' && subCategory === 'student') {
    return {
      title: '건축/BIM/CAD/GIS - 학생',
      categories: [
        {
          name: '건축 레퍼런스',
          sites: [
            { id: 'student1', name: 'ArchDaily', description: '세계 최대 건축 사례 DB, 도면·사진·설계설명 풍부', url: 'https://www.archdaily.com' },
            { id: 'student2', name: 'Dezeen', description: '최신 건축·인테리어 뉴스 및 트렌드', url: 'https://www.dezeen.com' },
            { id: 'student3', name: 'DesignBoom', description: '건축/제품/예술 융합 레퍼런스', url: 'https://www.designboom.com' },
            { id: 'student4', name: 'SPACE(공간사)', description: '국내 대표 건축·인테리어 전문 매체', url: 'https://vmspace.com' }
          ]
        },
        {
          name: '이미지 & 무드보드',
          sites: [
            { id: 'student5', name: 'Pinterest Architecture', description: '아이디어·무드보드 검색 필수', url: 'https://www.pinterest.com' },
            { id: 'student6', name: 'Behance Architecture', description: '포트폴리오/작품 레퍼런스', url: 'https://www.behance.net' }
          ]
        },
        {
          name: '툴 & 자료',
          sites: [
            { id: 'student7', name: 'SketchUp 3D Warehouse', description: '무료 3D 모델 공유 플랫폼', url: 'https://3dwarehouse.sketchup.com' },
            { id: 'student8', name: 'Autodesk Education', description: 'AutoCAD, Revit 학생 무료 라이선스', url: 'https://www.autodesk.com/education/edu-software/overview' },
            { id: 'student9', name: 'GrabCAD Library', description: '구조·기계·BIM 모델 데이터 공유', url: 'https://grabcad.com/library' }
          ]
        },
        {
          name: '뉴스/저널/학술',
          sites: [
            { id: 'student10', name: '대한건축학회', description: '논문, 학술지, 건축 학회 활동', url: 'https://www.aik.or.kr' },
            { id: 'student11', name: '건축세계 (C3Korea)', description: '건축 전문 매거진', url: 'http://www.c3korea.net' },
            { id: 'student12', name: 'Architizer', description: '건축사무소/프로젝트 DB, 영감 얻기 좋음', url: 'https://architizer.com' }
          ]
        },
        {
          name: '공모전 & 대외활동',
          sites: [
            { id: 'student13', name: 'ArchiArt', description: '건축 관련 공모전/대외활동 정보', url: 'https://www.archiart.co.kr' },
            { id: 'student14', name: 'Competitions Archi', description: '국제 건축 공모전 모음', url: 'https://competitions.archi' }
          ]
        },
        {
          name: '자료/커뮤니티',
          sites: [
            { id: 'student15', name: '세움터 (eais)', description: '건축 인허가, 법규 확인 (학생 과제 참고용)', url: 'https://www.eais.go.kr' },
            { id: 'student16', name: '디자인하우스', description: '인테리어 사례·자재 브랜드 정보', url: 'https://designhouse.co.kr' },
            { id: 'student17', name: '네이버 카페/블로그', description: '건축학과 커뮤니티 - 도면 공유, 과제 팁, 포트폴리오 피드백', url: 'https://cafe.naver.com' }
          ]
        },
        {
          name: '멀티미디어 학습',
          sites: [
            { id: 'student18', name: 'The B1M (YouTube)', description: '최신 건축 트렌드·테크놀로지', url: 'https://www.youtube.com/@TheB1M' },
            { id: 'student19', name: 'How to Architect (YouTube)', description: '건축 개념/과제 팁', url: 'https://www.youtube.com/@HowtoArchitect' }
          ]
        }
      ]
    };
  }

  // 건축 카테고리 - BIM 서브카테고리
  if (categoryId === 'architecture' && subCategory === 'bim') {
    return {
      title: '건축/BIM/CAD/GIS - BIM',
      categories: [
        {
          name: 'BIM 도구',
          sites: [
            // 나중에 추가할 예정
          ]
        }
      ]
    };
  }

  // 건축 카테고리 - 인테리어 서브카테고리
  if (categoryId === 'architecture' && subCategory === 'interior') {
    return {
      title: '건축/BIM/CAD/GIS - 인테리어',
      categories: [
        {
          name: '인테리어 디자인',
          sites: [
            // 나중에 추가할 예정
          ]
        }
      ]
    };
  }

  // 건축 카테고리 - 기본 (서브카테고리 없음)
  if (categoryId === 'architecture' && !subCategory) {
    return {
      title: '건축/BIM/CAD/GIS',
      categories: [
        {
          name: '전체',
          sites: [
            // 나중에 추가할 예정
          ]
        }
      ]
    };
  }

// 금융/투자 카테고리 - 기본 (서브카테고리 없음)
if (categoryId === 'finance' && !subCategory) {
  return {
    title: '금융/투자',
    categories: [
      {
        name: '주식 투자',
        sites: [
          { id: 'stock1', name: '키움증권 영웅문', description: '온라인 주식거래', url: 'https://www1.kiwoomhero.com' },
          { id: 'stock2', name: '토스증권', description: '간편 주식투자', url: 'https://tossinvest.com' },
          { id: 'stock3', name: '네이버 금융', description: '종목 토론방, 증권사 리포트', url: 'https://finance.naver.com' },
          { id: 'stock4', name: 'DART', description: '금융감독원 전자공시', url: 'https://dart.fss.or.kr' },
          { id: 'stock5', name: 'Yahoo Finance', description: '글로벌 주식 정보', url: 'https://finance.yahoo.com' },
          { id: 'stock6', name: 'Bloomberg', description: '금융 뉴스 및 시장 데이터', url: 'https://www.bloomberg.com' }
        ]
      },
      {
        name: '코인 투자',
        sites: [
          { id: 'crypto1', name: '업비트', description: '국내 1위 가상자산 거래소', url: 'https://upbit.com' },
          { id: 'crypto2', name: '빗썸', description: '암호화폐 거래소', url: 'https://www.bithumb.com' },
          { id: 'crypto3', name: '바이낸스', description: '글로벌 암호화폐 거래소', url: 'https://www.binance.com' },
          { id: 'crypto4', name: '코인마켓캡', description: '암호화폐 시세 정보', url: 'https://coinmarketcap.com' },
          { id: 'crypto5', name: '코인게코', description: '암호화폐 추적 서비스', url: 'https://www.coingecko.com' },
          { id: 'crypto6', name: '트레이딩뷰', description: '차트 분석 도구', url: 'https://www.tradingview.com' }
        ]
      }
    ]
  };
}

// 금융/투자 카테고리 - 주식
if (categoryId === 'finance' && subCategory === 'stock') {
  return {
    title: '금융/투자 - 주식',
    categories: [
      {
        name: '거래 플랫폼',
        sites: [
          { id: 'st1', name: '키움증권 영웅문', description: '온라인 주식거래', url: 'https://www1.kiwoomhero.com' },
          { id: 'st2', name: '삼성증권', description: 'mPOP 주식거래', url: 'https://www.samsungpop.com' },
          { id: 'st3', name: '미래에셋대우', description: 'mPAM 주식거래', url: 'https://securities.miraeasset.com' },
          { id: 'st4', name: '토스증권', description: '간편 주식투자', url: 'https://tossinvest.com' },
          { id: 'st5', name: 'NH투자증권', description: 'WTS 주식거래', url: 'https://www.nhqv.com' },
          { id: 'st6', name: '카카오페이증권', description: '간편 투자 서비스', url: 'https://securities.kakaopay.com' }
        ]
      },
      {
        name: '정보/분석',
        sites: [
          { id: 'st7', name: '네이버 금융', description: '종목 토론방, 증권사 리포트 요약', url: 'https://finance.naver.com' },
          { id: 'st8', name: '다음 금융', description: '실시간 시세, 뉴스 큐레이션', url: 'https://finance.daum.net' },
          { id: 'st9', name: 'DART', description: '금융감독원 전자공시', url: 'https://dart.fss.or.kr' },
          { id: 'st10', name: 'KIND', description: '한국거래소 전자공시', url: 'https://kind.krx.co.kr' },
          { id: 'st11', name: '씽크풀', description: '개미 투자자 커뮤니티', url: 'https://www.thinkpool.com' },
          { id: 'st12', name: 'KRX 한국거래소', description: '실시간 시세, 시장정보', url: 'https://www.krx.co.kr' }
        ]
      },
      {
        name: '증권사 리서치',
        sites: [
          { id: 'st13', name: 'NH투자증권 리서치', description: 'NH투자증권 애널리스트 리포트', url: 'https://www.nhqv.com/research' },
          { id: 'st14', name: '신한투자증권 리서치', description: '신한투자증권 리서치센터', url: 'https://www.shinhaninvest.com/research' },
          { id: 'st15', name: '미래에셋증권 리서치', description: '미래에셋 리서치 리포트', url: 'https://www.miraeasset.com/research' },
          { id: 'st16', name: '삼성증권 리서치', description: '삼성증권 애널리스트 의견', url: 'https://www.samsungpop.com/research' },
          { id: 'st17', name: 'KB증권 리서치', description: 'KB증권 투자정보', url: 'https://www.kbsec.co.kr/research' },
          { id: 'st18', name: 'SK증권 리서치', description: 'SK증권 시장분석', url: 'https://www.sks.co.kr/research' }
        ]
      },
      {
        name: '해외주식',
        sites: [
          { id: 'st19', name: 'Yahoo Finance', description: '글로벌 주식 정보', url: 'https://finance.yahoo.com' },
          { id: 'st20', name: 'Bloomberg', description: '금융 뉴스 및 시장 데이터', url: 'https://www.bloomberg.com' },
          { id: 'st21', name: 'MarketWatch', description: '미국 주식 시장 정보', url: 'https://www.marketwatch.com' },
          { id: 'st22', name: 'Investing.com', description: '글로벌 투자 정보', url: 'https://www.investing.com' },
          { id: 'st23', name: 'TD Ameritrade', description: '미국 주식 거래', url: 'https://www.tdameritrade.com' },
          { id: 'st24', name: 'Interactive Brokers', description: '글로벌 증권 거래', url: 'https://www.interactivebrokers.com' }
        ]
      }
    ]
  };
}

// 금융/투자 카테고리 - 코인
if (categoryId === 'finance' && subCategory === 'crypto') {
  return {
    title: '금융/투자 - 코인',
    categories: [
      {
        name: '거래소',
        sites: [
          { id: 'cr1', name: '업비트', description: '국내 1위 코인거래소', url: 'https://upbit.com' },
          { id: 'cr2', name: '빗썸', description: '국내 대형 거래소', url: 'https://www.bithumb.com' },
          { id: 'cr3', name: '코인원', description: '국내 코인거래소', url: 'https://coinone.co.kr' },
          { id: 'cr4', name: '바이낸스', description: '글로벌 거래소', url: 'https://www.binance.com' },
          { id: 'cr5', name: '코빗', description: '국내 비트코인 거래소', url: 'https://www.korbit.co.kr' },
          { id: 'cr6', name: '고팩스', description: '국내 암호화폐 거래소', url: 'https://www.gopax.co.kr' }
        ]
      },
      {
        name: '정보/분석',
        sites: [
          { id: 'cr7', name: '코인마켓캡', description: '코인 시가총액 정보', url: 'https://coinmarketcap.com' },
          { id: 'cr8', name: '코인게코', description: '코인 가격 추적', url: 'https://www.coingecko.com' },
          { id: 'cr9', name: '트레이딩뷰', description: '차트 분석 도구', url: 'https://www.tradingview.com' },
          { id: 'cr10', name: '코인데스크', description: '블록체인 뉴스', url: 'https://www.coindesk.com' },
          { id: 'cr11', name: '코인텔레그래프', description: '암호화폐 뉴스', url: 'https://cointelegraph.com' },
          { id: 'cr12', name: '디센트', description: '블록체인 한국 뉴스', url: 'https://decent.fund' }
        ]
      },
      {
        name: '커뮤니티',
        sites: [
          { id: 'cr13', name: '레딧 암호화폐', description: 'Reddit 암호화폐 커뮤니티', url: 'https://www.reddit.com/r/cryptocurrency' },
          { id: 'cr14', name: '비트코인토크', description: '한국 암호화폐 커뮤니티', url: 'https://bitcointalk.org' },
          { id: 'cr15', name: '디스코드 암호화폐', description: '암호화폐 디스코드 서버', url: 'https://discord.gg/cryptocurrency' },
          { id: 'cr16', name: '텔레그램 암호화폐', description: '암호화폐 텔레그램 채널', url: 'https://t.me/cryptocurrency' }
        ]
      }
    ]
  };
}

  // 개발 카테고리
  if (categoryId === 'development') {
    return {
      title: '개발/기획',
      categories: [
        {
          name: '프론트엔드',
          sites: [
            { id: 'fe1', name: 'React', description: 'React 공식 문서', url: 'https://react.dev' },
            { id: 'fe2', name: 'Next.js', description: 'Next.js 프레임워크', url: 'https://nextjs.org' },
            { id: 'fe3', name: 'Vue.js', description: 'Vue.js 프레임워크', url: 'https://vuejs.org' },
            { id: 'fe4', name: 'Angular', description: 'Angular 프레임워크', url: 'https://angular.io' },
            { id: 'fe5', name: 'TypeScript', description: 'TypeScript 언어', url: 'https://www.typescriptlang.org' },
            { id: 'fe6', name: 'Tailwind CSS', description: 'CSS 프레임워크', url: 'https://tailwindcss.com' }
          ]
        },
        {
          name: '백엔드',
          sites: [
            { id: 'be1', name: 'Node.js', description: 'Node.js 런타임', url: 'https://nodejs.org' },
            { id: 'be2', name: 'Express.js', description: 'Node.js 웹 프레임워크', url: 'https://expressjs.com' },
            { id: 'be3', name: 'NestJS', description: 'Node.js 프레임워크', url: 'https://nestjs.com' },
            { id: 'be4', name: 'FastAPI', description: 'Python 웹 프레임워크', url: 'https://fastapi.tiangolo.com' },
            { id: 'be5', name: 'Django', description: 'Python 웹 프레임워크', url: 'https://www.djangoproject.com' },
            { id: 'be6', name: 'Spring Boot', description: 'Java 프레임워크', url: 'https://spring.io/projects/spring-boot' }
          ]
        },
        {
          name: '데이터베이스',
          sites: [
            { id: 'db1', name: 'PostgreSQL', description: '오픈소스 관계형 DB', url: 'https://www.postgresql.org' },
            { id: 'db2', name: 'MongoDB', description: 'NoSQL 데이터베이스', url: 'https://www.mongodb.com' },
            { id: 'db3', name: 'Redis', description: '인메모리 데이터베이스', url: 'https://redis.io' },
            { id: 'db4', name: 'MySQL', description: '관계형 데이터베이스', url: 'https://www.mysql.com' },
            { id: 'db5', name: 'Supabase', description: 'Firebase 대안 BaaS', url: 'https://supabase.com' },
            { id: 'db6', name: 'Prisma', description: 'ORM 도구', url: 'https://www.prisma.io' }
          ]
        },
        {
          name: 'DevOps/배포',
          sites: [
            { id: 'ops1', name: 'Docker', description: '컨테이너 플랫폼', url: 'https://www.docker.com' },
            { id: 'ops2', name: 'Kubernetes', description: '컨테이너 오케스트레이션', url: 'https://kubernetes.io' },
            { id: 'ops3', name: 'AWS', description: '아마존 클라우드 서비스', url: 'https://aws.amazon.com' },
            { id: 'ops4', name: 'Vercel', description: '프론트엔드 배포', url: 'https://vercel.com' },
            { id: 'ops5', name: 'Netlify', description: '정적 사이트 호스팅', url: 'https://www.netlify.com' },
            { id: 'ops6', name: 'GitHub Actions', description: 'CI/CD 자동화', url: 'https://github.com/features/actions' }
          ]
        },
        {
          name: '개발도구',
          sites: [
            { id: 'tool1', name: 'VS Code', description: '코드 에디터', url: 'https://code.visualstudio.com' },
            { id: 'tool2', name: 'Git', description: '버전 관리 시스템', url: 'https://git-scm.com' },
            { id: 'tool3', name: 'GitHub', description: '코드 저장소', url: 'https://github.com' },
            { id: 'tool4', name: 'Postman', description: 'API 개발 도구', url: 'https://www.postman.com' },
            { id: 'tool5', name: 'Figma', description: 'UI/UX 디자인 도구', url: 'https://www.figma.com' },
            { id: 'tool6', name: 'Notion', description: '프로젝트 관리', url: 'https://www.notion.so' }
          ]
        },
        {
          name: '학습자료',
          sites: [
            { id: 'learn1', name: 'MDN Web Docs', description: '웹 개발 문서', url: 'https://developer.mozilla.org' },
            { id: 'learn2', name: 'Stack Overflow', description: '개발자 Q&A', url: 'https://stackoverflow.com' },
            { id: 'learn3', name: 'freeCodeCamp', description: '무료 코딩 교육', url: 'https://www.freecodecamp.org' },
            { id: 'learn4', name: 'Codecademy', description: '인터랙티브 코딩 학습', url: 'https://www.codecademy.com' },
            { id: 'learn5', name: 'W3Schools', description: '웹 기술 튜토리얼', url: 'https://www.w3schools.com' },
            { id: 'learn6', name: 'Coursera', description: '온라인 강의', url: 'https://www.coursera.org' }
          ]
        }
      ]
    };
  }

  // UI/UX 디자인 카테고리
  if (categoryId === 'ui-ux') {
    return {
      title: 'UI/UX 디자인',
      categories: [
        {
          name: '디자인 도구',
          sites: [
            { id: 'tool1', name: 'Figma', description: 'UI/UX 디자인 협업 도구', url: 'https://www.figma.com' },
            { id: 'tool2', name: 'Sketch', description: 'macOS 디자인 도구', url: 'https://www.sketch.com' },
            { id: 'tool3', name: 'Adobe XD', description: 'Adobe UI/UX 도구', url: 'https://www.adobe.com/products/xd.html' },
            { id: 'tool4', name: 'Framer', description: '인터랙티브 프로토타입', url: 'https://www.framer.com' },
            { id: 'tool5', name: 'InVision', description: '프로토타이핑 플랫폼', url: 'https://www.invisionapp.com' },
            { id: 'tool6', name: 'Principle', description: '애니메이션 프로토타입', url: 'https://principleformac.com' }
          ]
        },
        {
          name: '디자인 리소스',
          sites: [
            { id: 'res1', name: 'Dribbble', description: '디자인 영감 플랫폼', url: 'https://dribbble.com' },
            { id: 'res2', name: 'Behance', description: 'Adobe 포트폴리오', url: 'https://www.behance.net' },
            { id: 'res3', name: 'Unsplash', description: '무료 고품질 이미지', url: 'https://unsplash.com' },
            { id: 'res4', name: 'Iconify', description: '무료 아이콘 라이브러리', url: 'https://iconify.design' },
            { id: 'res5', name: 'Feather Icons', description: '심플한 아이콘 세트', url: 'https://feathericons.com' },
            { id: 'res6', name: 'Coolors', description: '컬러 팔레트 생성기', url: 'https://coolors.co' }
          ]
        },
        {
          name: '타이포그래피',
          sites: [
            { id: 'typo1', name: 'Google Fonts', description: '무료 웹 폰트', url: 'https://fonts.google.com' },
            { id: 'typo2', name: 'Adobe Fonts', description: 'Adobe 폰트 라이브러리', url: 'https://fonts.adobe.com' },
            { id: 'typo3', name: 'Font Squirrel', description: '무료 상업용 폰트', url: 'https://www.fontsquirrel.com' },
            { id: 'typo4', name: 'DaFont', description: '다양한 폰트 모음', url: 'https://www.dafont.com' },
            { id: 'typo5', name: 'Typography.com', description: '프리미엄 타이포그래피', url: 'https://www.typography.com' },
            { id: 'typo6', name: 'Type Scale', description: '타이포그래피 스케일', url: 'https://type-scale.com' }
          ]
        },
        {
          name: 'UI 패턴',
          sites: [
            { id: 'ui1', name: 'UI Movement', description: 'UI 애니메이션 갤러리', url: 'https://uimovement.com' },
            { id: 'ui2', name: 'Mobbin', description: '모바일 UI 패턴', url: 'https://mobbin.design' },
            { id: 'ui3', name: 'Page Flows', description: '사용자 플로우 예시', url: 'https://pageflows.com' },
            { id: 'ui4', name: 'Really Good UX', description: 'UX 케이스 스터디', url: 'https://www.reallygoodux.io' },
            { id: 'ui5', name: 'UI Garage', description: 'UI 디자인 갤러리', url: 'https://uigarage.net' },
            { id: 'ui6', name: 'Collect UI', description: 'UI 디자인 컬렉션', url: 'https://collectui.com' }
          ]
        },
        {
          name: '프로토타이핑',
          sites: [
            { id: 'proto1', name: 'Marvel', description: '간단한 프로토타이핑', url: 'https://marvelapp.com' },
            { id: 'proto2', name: 'Proto.io', description: '고급 프로토타이핑', url: 'https://proto.io' },
            { id: 'proto3', name: 'Axure RP', description: '상세한 프로토타이핑', url: 'https://www.axure.com' },
            { id: 'proto4', name: 'Balsamiq', description: '와이어프레임 도구', url: 'https://balsamiq.com' },
            { id: 'proto5', name: 'MockFlow', description: '웹 기반 와이어프레임', url: 'https://www.mockflow.com' },
            { id: 'proto6', name: 'Whimsical', description: '플로우차트 및 와이어프레임', url: 'https://whimsical.com' }
          ]
        },
        {
          name: '사용성 테스트',
          sites: [
            { id: 'test1', name: 'Maze', description: '사용자 테스트 플랫폼', url: 'https://maze.co' },
            { id: 'test2', name: 'Hotjar', description: '사용자 행동 분석', url: 'https://www.hotjar.com' },
            { id: 'test3', name: 'UsabilityHub', description: '사용성 테스트 도구', url: 'https://usabilityhub.com' },
            { id: 'test4', name: 'UserTesting', description: '사용자 피드백', url: 'https://www.usertesting.com' },
            { id: 'test5', name: 'Optimal Workshop', description: 'UX 리서치 도구', url: 'https://www.optimalworkshop.com' },
            { id: 'test6', name: 'Lookback', description: '사용자 인터뷰', url: 'https://lookback.io' }
          ]
        }
      ]
    };
  }

  // 요리/레시피 카테고리
  if (categoryId === 'cooking') {
    return {
      title: '요리/레시피',
      categories: [
        {
          name: '레시피 사이트',
          sites: [
            { id: 'recipe1', name: '만개의레시피', description: '국내 최대 레시피 사이트', url: 'https://www.10000recipe.com' },
            { id: 'recipe2', name: '쿡패드', description: '일본 레시피 플랫폼', url: 'https://cookpad.com' },
            { id: 'recipe3', name: '올리브매거진', description: '요리 매거진', url: 'https://www.olivemagazine.co.kr' },
            { id: 'recipe4', name: '집밥백선생', description: '백종원 레시피', url: 'https://www.youtube.com/@paik_jongwon' },
            { id: 'recipe5', name: '해먹남녀', description: '요리 유튜브 채널', url: 'https://www.youtube.com/@haemukja' },
            { id: 'recipe6', name: 'BBC Good Food', description: '영국 요리 레시피', url: 'https://www.bbcgoodfood.com' }
          ]
        },
        {
          name: '식재료 쇼핑',
          sites: [
            { id: 'shop1', name: '마켓컬리', description: '신선식품 배송', url: 'https://www.kurly.com' },
            { id: 'shop2', name: '쿠팡 로켓프레시', description: '당일배송 식재료', url: 'https://www.coupang.com' },
            { id: 'shop3', name: 'SSG닷컴', description: '이마트 온라인몰', url: 'https://www.ssg.com' },
            { id: 'shop4', name: '롯데온', description: '롯데마트 온라인', url: 'https://www.lotte.com' },
            { id: 'shop5', name: '헬로네이처', description: '유기농 식재료', url: 'https://www.hellonature.net' },
            { id: 'shop6', name: '오아시스마켓', description: '수입 식재료', url: 'https://www.oasismarket.co.kr' }
          ]
        },
        {
          name: '주방용품',
          sites: [
            { id: 'kitchen1', name: '락앤락몰', description: '주방용품 전문몰', url: 'https://www.locknlockmall.com' },
            { id: 'kitchen2', name: '키친아트', description: '프리미엄 주방용품', url: 'https://www.kitchenart.co.kr' },
            { id: 'kitchen3', name: '한샘몰', description: '주방가구 및 용품', url: 'https://www.hanssem.com' },
            { id: 'kitchen4', name: '밀크T하우스', description: '주방 소품', url: 'https://www.milktmall.com' },
            { id: 'kitchen5', name: '옥션 주방용품', description: '다양한 주방용품', url: 'https://www.auction.co.kr' },
            { id: 'kitchen6', name: '지마켓 주방', description: '주방용품 카테고리', url: 'https://www.gmarket.co.kr' }
          ]
        },
        {
          name: '맛집 정보',
          sites: [
            { id: 'restaurant1', name: '망고플레이트', description: '맛집 추천 플랫폼', url: 'https://www.mangoplate.com' },
            { id: 'restaurant2', name: '포잉', description: '맛집 지도', url: 'https://www.fooding.io' },
            { id: 'restaurant3', name: '다이닝코드', description: '맛집 리뷰', url: 'https://www.diningcode.com' },
            { id: 'restaurant4', name: '배달의민족', description: '배달음식 주문', url: 'https://www.baemin.com' },
            { id: 'restaurant5', name: '요기요', description: '배달 주문 서비스', url: 'https://www.yogiyo.co.kr' },
            { id: 'restaurant6', name: '카카오맵', description: '주변 맛집 검색', url: 'https://map.kakao.com' }
          ]
        },
        {
          name: '요리 교육',
          sites: [
            { id: 'edu1', name: '르꼬르동블루', description: '프랑스 요리 학교', url: 'https://www.cordonbleu.edu' },
            { id: 'edu2', name: '한국요리학원', description: '전통 요리 교육', url: 'https://www.kccook.co.kr' },
            { id: 'edu3', name: '온라인 쿠킹클래스', description: '집에서 배우는 요리', url: 'https://www.cookingclass.co.kr' },
            { id: 'edu4', name: 'MasterClass', description: '유명 셰프 강의', url: 'https://www.masterclass.com' },
            { id: 'edu5', name: '요리학원 정보', description: '지역별 요리학원', url: 'https://www.cookschool.co.kr' },
            { id: 'edu6', name: '베이킹 클래스', description: '제빵 전문 교육', url: 'https://www.bakingclass.co.kr' }
          ]
        },
        {
          name: '와인/음료',
          sites: [
            { id: 'wine1', name: '와인21', description: '와인 전문 쇼핑몰', url: 'https://www.wine21.com' },
            { id: 'wine2', name: '비비노', description: '와인 평점 앱', url: 'https://www.vivino.com' },
            { id: 'wine3', name: '와인타임', description: '와인 정보 매거진', url: 'https://www.winetime.co.kr' },
            { id: 'wine4', name: '이마트 와인샵', description: '이마트 와인 코너', url: 'https://emart.ssg.com' },
            { id: 'wine5', name: '홈플러스 와인', description: '홈플러스 와인 카테고리', url: 'https://www.homeplus.co.kr' },
            { id: 'wine6', name: '위스키 매거진', description: '위스키 전문 정보', url: 'https://www.whiskymagazine.com' }
          ]
        }
      ]
    };
  }

  // 취미/여가 카테고리
  if (categoryId === 'hobby') {
    return {
      title: '취미/여가',
      categories: [
        {
          name: '독서/서점',
          sites: [
            { id: 'book1', name: '교보문고', description: '국내 최대 서점', url: 'https://www.kyobobook.co.kr' },
            { id: 'book2', name: '예스24', description: '온라인 서점', url: 'https://www.yes24.com' },
            { id: 'book3', name: '알라딘', description: '중고도서 전문', url: 'https://www.aladin.co.kr' },
            { id: 'book4', name: '밀리의 서재', description: '전자책 구독 서비스', url: 'https://www.millie.co.kr' },
            { id: 'book5', name: '리디북스', description: '전자책 플랫폼', url: 'https://ridibooks.com' },
            { id: 'book6', name: '굿리즈', description: '도서 리뷰 커뮤니티', url: 'https://www.goodreads.com' }
          ]
        },
        {
          name: '영화/드라마',
          sites: [
            { id: 'movie1', name: '넷플릭스', description: '글로벌 스트리밍 서비스', url: 'https://www.netflix.com' },
            { id: 'movie2', name: '왓챠', description: '한국 OTT 플랫폼', url: 'https://watcha.com' },
            { id: 'movie3', name: '웨이브', description: 'SKT OTT 서비스', url: 'https://www.wavve.com' },
            { id: 'movie4', name: 'CGV', description: '영화관 예매 서비스', url: 'https://www.cgv.co.kr' },
            { id: 'movie5', name: '롯데시네마', description: '롯데 영화관', url: 'https://www.lottecinema.co.kr' },
            { id: 'movie6', name: 'IMDb', description: '영화 정보 데이터베이스', url: 'https://www.imdb.com' }
          ]
        },
        {
          name: '음악/스트리밍',
          sites: [
            { id: 'music1', name: '멜론', description: '국내 최대 음악 스트리밍', url: 'https://www.melon.com' },
            { id: 'music2', name: '지니뮤직', description: 'KT 음악 서비스', url: 'https://www.genie.co.kr' },
            { id: 'music3', name: '스포티파이', description: '글로벌 음악 플랫폼', url: 'https://www.spotify.com' },
            { id: 'music4', name: '유튜브 뮤직', description: '구글 음악 서비스', url: 'https://music.youtube.com' },
            { id: 'music5', name: '애플 뮤직', description: '애플 음악 스트리밍', url: 'https://music.apple.com' },
            { id: 'music6', name: '벅스', description: 'NHN 음악 서비스', url: 'https://music.bugs.co.kr' }
          ]
        },
        {
          name: '수집/취미',
          sites: [
            { id: 'collect1', name: '옥션', description: '경매 및 중고거래', url: 'https://www.auction.co.kr' },
            { id: 'collect2', name: '피규어로이드', description: '피규어 전문몰', url: 'https://www.figureroid.co.kr' },
            { id: 'collect3', name: '포켓몬 카드', description: '포켓몬 트레이딩 카드', url: 'https://www.pokemon.co.kr' },
            { id: 'collect4', name: '유니클로 UT', description: '유니클로 콜라보 티셔츠', url: 'https://www.uniqlo.com' },
            { id: 'collect5', name: '레고', description: '레고 공식 스토어', url: 'https://www.lego.com' },
            { id: 'collect6', name: '건프라', description: '건담 프라모델', url: 'https://www.gundam.co.kr' }
          ]
        },
        {
          name: '공예/DIY',
          sites: [
            { id: 'craft1', name: '핸드메이드코리아', description: '수공예 전문 쇼핑몰', url: 'https://www.handmadekorea.com' },
            { id: 'craft2', name: 'Pinterest DIY', description: 'DIY 아이디어 플랫폼', url: 'https://www.pinterest.com' },
            { id: 'craft3', name: '아이디어스', description: '핸드메이드 마켓플레이스', url: 'https://www.idus.com' },
            { id: 'craft4', name: '만들다', description: 'DIY 키트 전문몰', url: 'https://www.mandulda.com' },
            { id: 'craft5', name: '크래프트링크', description: '공예 재료 쇼핑몰', url: 'https://www.craftlink.co.kr' },
            { id: 'craft6', name: '우드버닝', description: '목공예 전문', url: 'https://www.woodburning.co.kr' }
          ]
        },
        {
          name: '보드게임/퍼즐',
          sites: [
            { id: 'board1', name: '보드라이프', description: '보드게임 전문몰', url: 'https://www.boardlife.co.kr' },
            { id: 'board2', name: '코리아보드게임즈', description: '보드게임 유통', url: 'https://www.koreaboardgames.com' },
            { id: 'board3', name: '디아블로', description: '보드게임 카페 체인', url: 'https://www.diavolo.co.kr' },
            { id: 'board4', name: '1000피스', description: '직소퍼즐 전문', url: 'https://www.1000piece.co.kr' },
            { id: 'board5', name: '라벤스부르거', description: '독일 퍼즐 브랜드', url: 'https://www.ravensburger.com' },
            { id: 'board6', name: '하즈브로', description: '보드게임 제조사', url: 'https://www.hasbro.com' }
          ]
        }
      ]
    };
  }

  // 스포츠/운동 카테고리
  if (categoryId === 'sports') {
    return {
      title: '스포츠/운동',
      categories: [
        {
          name: '축구',
          sites: [
            { id: 'soccer1', name: 'FIFA', description: '국제축구연맹 공식 사이트', url: 'https://www.fifa.com' },
            { id: 'soccer2', name: 'KFA', description: '대한축구협회', url: 'https://www.kfa.or.kr' },
            { id: 'soccer3', name: 'K리그', description: '한국프로축구연맹', url: 'https://www.kleague.com' },
            { id: 'soccer4', name: 'UEFA', description: '유럽축구연맹', url: 'https://www.uefa.com' },
            { id: 'soccer5', name: 'ESPN Soccer', description: '축구 뉴스 및 분석', url: 'https://www.espn.com/soccer' },
            { id: 'soccer6', name: 'Goal.com', description: '축구 전문 뉴스', url: 'https://www.goal.com' }
          ]
        },
        {
          name: '농구',
          sites: [
            { id: 'basket1', name: 'NBA', description: '미국 프로농구리그', url: 'https://www.nba.com' },
            { id: 'basket2', name: 'KBL', description: '한국농구연맹', url: 'https://www.kbl.or.kr' },
            { id: 'basket3', name: 'FIBA', description: '국제농구연맹', url: 'https://www.fiba.basketball' },
            { id: 'basket4', name: 'ESPN NBA', description: 'NBA 뉴스 및 분석', url: 'https://www.espn.com/nba' },
            { id: 'basket5', name: 'Basketball Reference', description: '농구 통계 전문', url: 'https://www.basketball-reference.com' },
            { id: 'basket6', name: 'WNBA', description: '여자 프로농구리그', url: 'https://www.wnba.com' }
          ]
        },
        {
          name: '야구',
          sites: [
            { id: 'baseball1', name: 'KBO', description: '한국야구위원회', url: 'https://www.koreabaseball.com' },
            { id: 'baseball2', name: 'MLB', description: '메이저리그 베이스볼', url: 'https://www.mlb.com' },
            { id: 'baseball3', name: 'ESPN MLB', description: 'MLB 뉴스 및 분석', url: 'https://www.espn.com/mlb' },
            { id: 'baseball4', name: 'Baseball Reference', description: '야구 통계 전문', url: 'https://www.baseball-reference.com' },
            { id: 'baseball5', name: 'NPB', description: '일본 프로야구', url: 'https://www.npb.or.jp' },
            { id: 'baseball6', name: 'WBC', description: '월드 베이스볼 클래식', url: 'https://www.worldbaseballclassic.com' }
          ]
        },
        {
          name: '헬스/피트니스',
          sites: [
            { id: 'fitness1', name: 'Bodybuilding.com', description: '보디빌딩 전문 사이트', url: 'https://www.bodybuilding.com' },
            { id: 'fitness2', name: 'MyFitnessPal', description: '운동 및 식단 관리', url: 'https://www.myfitnesspal.com' },
            { id: 'fitness3', name: 'Nike Training', description: '나이키 운동 프로그램', url: 'https://www.nike.com/training' },
            { id: 'fitness4', name: 'Adidas Training', description: '아디다스 운동 앱', url: 'https://www.adidas.com/training' },
            { id: 'fitness5', name: 'Freeletics', description: '개인 맞춤 운동', url: 'https://www.freeletics.com' },
            { id: 'fitness6', name: 'Strava', description: '러닝 및 사이클링', url: 'https://www.strava.com' }
          ]
        },
        {
          name: '올림픽/종합',
          sites: [
            { id: 'olympic1', name: 'Olympic', description: '국제올림픽위원회', url: 'https://www.olympic.org' },
            { id: 'olympic2', name: 'KOC', description: '대한체육회', url: 'https://www.sports.or.kr' },
            { id: 'olympic3', name: 'ESPN Olympics', description: '올림픽 뉴스', url: 'https://www.espn.com/olympics' },
            { id: 'olympic4', name: 'Olympic Channel', description: '올림픽 방송', url: 'https://www.olympicchannel.com' },
            { id: 'olympic5', name: 'Paralympics', description: '패럴림픽', url: 'https://www.paralympic.org' },
            { id: 'olympic6', name: 'World Athletics', description: '세계육상연맹', url: 'https://www.worldathletics.org' }
          ]
        },
        {
          name: '라이프스타일',
          sites: [
            { id: 'lifestyle1', name: 'GolfDigest', description: '골프 전문 매거진', url: 'https://www.golfdigest.com' },
            { id: 'lifestyle2', name: 'Tennis.com', description: '테니스 전문 사이트', url: 'https://www.tennis.com' },
            { id: 'lifestyle3', name: 'Swimming World', description: '수영 전문 매거진', url: 'https://www.swimmingworldmagazine.com' },
            { id: 'lifestyle4', name: 'Yoga Journal', description: '요가 전문 매거진', url: 'https://www.yogajournal.com' },
            { id: 'lifestyle5', name: 'Men\'s Health', description: '남성 건강 매거진', url: 'https://www.menshealth.com' },
            { id: 'lifestyle6', name: 'Women\'s Health', description: '여성 건강 매거진', url: 'https://www.womenshealthmag.com' }
          ]
        }
      ]
    };
  }

  // 자동차 카테고리
  if (categoryId === 'car') {
    return {
      title: '자동차/모터스포츠',
      categories: [
        {
          name: '자동차 뉴스',
          sites: [
            { id: 'car1', name: '오토타임즈', description: '국내 자동차 전문 매체', url: 'https://www.autotimes.co.kr' },
            { id: 'car2', name: '모터그래프', description: '자동차 전문 매거진', url: 'https://www.motorgraph.com' },
            { id: 'car3', name: '카앤드라이버', description: '해외 자동차 매거진', url: 'https://www.caranddriver.com' },
            { id: 'car4', name: '모터트렌드', description: '자동차 트렌드 매거진', url: 'https://www.motortrend.com' },
            { id: 'car5', name: '탑기어', description: '영국 자동차 프로그램', url: 'https://www.topgear.com' },
            { id: 'car6', name: 'AutoBlog', description: '자동차 블로그', url: 'https://www.autoblog.com' }
          ]
        },
        {
          name: '중고차/딜러',
          sites: [
            { id: 'used1', name: '엔카', description: '중고차 직거래 플랫폼', url: 'https://www.encar.com' },
            { id: 'used2', name: '카즈', description: '중고차 매매 서비스', url: 'https://www.karz.co.kr' },
            { id: 'used3', name: 'SK엔카', description: 'SK 중고차 플랫폼', url: 'https://www.skencar.com' },
            { id: 'used4', name: '첫차', description: '첫 차 구매 전문', url: 'https://www.cheocha.com' },
            { id: 'used5', name: '헤이딜러', description: '중고차 딜러 플랫폼', url: 'https://www.heydealer.com' },
            { id: 'used6', name: '오토벨', description: '중고차 경매', url: 'https://www.autobell.co.kr' }
          ]
        },
        {
          name: '튜닝/부품',
          sites: [
            { id: 'tuning1', name: '스피드헌터스', description: '튜닝카 전문 매체', url: 'https://www.speedhunters.com' },
            { id: 'tuning2', name: '모터피아', description: '자동차 부품 쇼핑몰', url: 'https://www.motorpia.co.kr' },
            { id: 'tuning3', name: '카파츠', description: '자동차 부품 전문', url: 'https://www.caparts.co.kr' },
            { id: 'tuning4', name: 'HKS', description: '일본 튜닝 브랜드', url: 'https://www.hks-power.co.jp' },
            { id: 'tuning5', name: 'Mugen', description: '혼다 튜닝 전문', url: 'https://www.mugen-power.com' },
            { id: 'tuning6', name: 'Spoon Sports', description: '혼다 스포츠 튜닝', url: 'https://www.spoonsports.com' }
          ]
        },
        {
          name: 'F1/모터스포츠',
          sites: [
            { id: 'f1_1', name: 'Formula 1', description: 'F1 공식 사이트', url: 'https://www.formula1.com' },
            { id: 'f1_2', name: 'MotoGP', description: '오토바이 레이싱', url: 'https://www.motogp.com' },
            { id: 'f1_3', name: 'WRC', description: '세계 랠리 챔피언십', url: 'https://www.wrc.com' },
            { id: 'f1_4', name: 'Le Mans', description: '르망 24시 레이스', url: 'https://www.lemans.org' },
            { id: 'f1_5', name: 'IndyCar', description: '인디카 레이싱', url: 'https://www.indycar.com' },
            { id: 'f1_6', name: 'NASCAR', description: '나스카 레이싱', url: 'https://www.nascar.com' }
          ]
        },
        {
          name: '전기차/친환경',
          sites: [
            { id: 'ev1', name: 'Tesla', description: '테슬라 공식 사이트', url: 'https://www.tesla.com' },
            { id: 'ev2', name: 'Rivian', description: '전기 픽업 트럭', url: 'https://www.rivian.com' },
            { id: 'ev3', name: 'Lucid Motors', description: '루시드 전기차', url: 'https://www.lucidmotors.com' },
            { id: 'ev4', name: 'EV Database', description: '전기차 정보 데이터베이스', url: 'https://ev-database.org' },
            { id: 'ev5', name: 'InsideEVs', description: '전기차 전문 뉴스', url: 'https://insideevs.com' },
            { id: 'ev6', name: 'Electrek', description: '전기차 및 에너지 뉴스', url: 'https://electrek.co' }
          ]
        },
        {
          name: '브랜드 공식',
          sites: [
            { id: 'brand1', name: 'Hyundai', description: '현대자동차', url: 'https://www.hyundai.com' },
            { id: 'brand2', name: 'Kia', description: '기아자동차', url: 'https://www.kia.com' },
            { id: 'brand3', name: 'BMW', description: 'BMW 공식 사이트', url: 'https://www.bmw.com' },
            { id: 'brand4', name: 'Mercedes-Benz', description: '메르세데스-벤츠', url: 'https://www.mercedes-benz.com' },
            { id: 'brand5', name: 'Audi', description: '아우디 공식 사이트', url: 'https://www.audi.com' },
            { id: 'brand6', name: 'Porsche', description: '포르쉐 공식 사이트', url: 'https://www.porsche.com' }
          ]
        }
      ]
    };
  }

  // 반려동물 카테고리
  if (categoryId === 'pet') {
    return {
      title: '반려동물',
      categories: [
        {
          name: '펫샵/용품',
          sites: [
            { id: 'petshop1', name: '펫프렌즈', description: '반려동물 용품 전문몰', url: 'https://www.petfriends.co.kr' },
            { id: 'petshop2', name: '지구펫', description: '친환경 반려동물 용품', url: 'https://www.jigupet.com' },
            { id: 'petshop3', name: '펫박스', description: '반려동물 구독 서비스', url: 'https://www.petbox.co.kr' },
            { id: 'petshop4', name: '바잇미', description: '반려동물 간식 전문', url: 'https://www.biteme.co.kr' },
            { id: 'petshop5', name: '로얄캐닌', description: '프리미엄 펫푸드', url: 'https://www.royalcanin.com' },
            { id: 'petshop6', name: '힐스', description: '수의사 권장 펫푸드', url: 'https://www.hillspet.com' }
          ]
        },
        {
          name: '수의학/병원',
          sites: [
            { id: 'vet1', name: '24시 동물병원', description: '응급 동물병원 정보', url: 'https://www.24animal.com' },
            { id: 'vet2', name: '벳올포', description: '동물병원 검색 서비스', url: 'https://www.vetallfour.com' },
            { id: 'vet3', name: '애니멀닥터', description: '수의학 정보 포털', url: 'https://www.animaldoctor.co.kr' },
            { id: 'vet4', name: '펫케어', description: '반려동물 건강관리', url: 'https://www.petcare.co.kr' },
            { id: 'vet5', name: 'VCA Animal Hospitals', description: '해외 동물병원 체인', url: 'https://vcahospitals.com' },
            { id: 'vet6', name: 'AAHA', description: '미국 동물병원 협회', url: 'https://www.aaha.org' }
          ]
        },
        {
          name: '커뮤니티/정보',
          sites: [
            { id: 'community1', name: '개집사', description: '강아지 커뮤니티', url: 'https://www.dogholic.co.kr' },
            { id: 'community2', name: '고양이집사', description: '고양이 커뮤니티', url: 'https://www.catholic.co.kr' },
            { id: 'community3', name: '펫디아', description: '반려동물 백과사전', url: 'https://www.petpedia.co.kr' },
            { id: 'community4', name: '댕댕이', description: '반려견 커뮤니티', url: 'https://www.ddangddang.com' },
            { id: 'community5', name: '냥냥이', description: '반려묘 커뮤니티', url: 'https://www.nyangnyang.com' },
            { id: 'community6', name: '펫샘', description: '반려동물 정보 공유', url: 'https://www.petsaem.com' }
          ]
        },
        {
          name: '훈련/교육',
          sites: [
            { id: 'training1', name: '도그트레이닝', description: '강아지 훈련 전문', url: 'https://www.dogtraining.co.kr' },
            { id: 'training2', name: '펫시터', description: '반려동물 돌봄 서비스', url: 'https://www.petsitter.co.kr' },
            { id: 'training3', name: '펫케어아카데미', description: '반려동물 관리사 교육', url: 'https://www.petcare-academy.com' },
            { id: 'training4', name: '도그워커', description: '강아지 산책 서비스', url: 'https://www.dogwalker.co.kr' },
            { id: 'training5', name: 'AKC', description: '미국 켄넬 클럽', url: 'https://www.akc.org' },
            { id: 'training6', name: 'CCPDT', description: '개 훈련사 인증기관', url: 'https://www.ccpdt.org' }
          ]
        },
        {
          name: '미용/케어',
          sites: [
            { id: 'grooming1', name: '펫살롱', description: '반려동물 미용실', url: 'https://www.petsalon.co.kr' },
            { id: 'grooming2', name: '그루머', description: '펫 그루밍 전문가', url: 'https://www.groomer.co.kr' },
            { id: 'grooming3', name: '펫스파', description: '반려동물 스파 서비스', url: 'https://www.petspa.co.kr' },
            { id: 'grooming4', name: '펫네일아트', description: '반려동물 네일케어', url: 'https://www.petnail.co.kr' },
            { id: 'grooming5', name: 'Andis', description: '펫 그루밍 도구', url: 'https://www.andis.com' },
            { id: 'grooming6', name: 'Wahl', description: '반려동물 이발기', url: 'https://www.wahl.com' }
          ]
        },
        {
          name: '보험/서비스',
          sites: [
            { id: 'insurance1', name: '펫퍼민트', description: '반려동물 보험', url: 'https://www.petpermint.com' },
            { id: 'insurance2', name: 'DB손해보험 펫보험', description: 'DB 반려동물 보험', url: 'https://www.db-petinsurance.com' },
            { id: 'insurance3', name: '한화손해보험', description: '한화 펫보험', url: 'https://www.hanwha-petinsurance.com' },
            { id: 'insurance4', name: '펫택시', description: '반려동물 이송 서비스', url: 'https://www.pettaxi.co.kr' },
            { id: 'insurance5', name: '펫호텔', description: '반려동물 호텔', url: 'https://www.pethotel.co.kr' },
            { id: 'insurance6', name: '펫시팅', description: '반려동물 돌봄 매칭', url: 'https://www.petsitting.co.kr' }
          ]
        }
      ]
    };
  }

  // 기본값 반환
  return {
    title: '카테고리',
    categories: [
      {
        name: '카테고리 1',
        sites: [
          { id: 'default1', name: '예시 사이트 1', description: '예시 설명 1', url: 'https://example.com' }
        ]
      }
    ]
  };
};

interface CategoryDetailPageColumnsProps {
  categoryId: string;
  subCategory: string;
}

export function CategoryDetailPageColumns({ categoryId, subCategory }: CategoryDetailPageColumnsProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedSite, setDraggedSite] = useState<string | null>(null);
  const data = getCategoryData(categoryId, subCategory);

  useEffect(() => {
    const saved = localStorage.getItem(`favorites_${categoryId}`);
    if (saved) {
      try {
        setFavorites(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
    
    const savedFolders = localStorage.getItem(`folders_${categoryId}`);
    if (savedFolders) {
      try {
        setFolders(JSON.parse(savedFolders));
      } catch (e) {
        console.error('Failed to parse folders:', e);
      }
    } else {
      // 처음 들어왔을 때 필수 사이트들이 들어간 폴더 생성
      const essentialSites = data.categories
        .flatMap(cat => cat.sites.slice(0, 3)) // 각 카테고리에서 상위 3개 사이트
        .slice(0, 6); // 최대 6개까지만
      
      const initialFolders: Folder[] = [
        {
          id: 'essential',
          name: '필수 사이트',
          sites: essentialSites.map(site => site.id)
        }
      ];
      
      setFolders(initialFolders);
      localStorage.setItem(`folders_${categoryId}`, JSON.stringify(initialFolders));
    }
  }, [categoryId, data.categories]);

  const toggleFavorite = (siteId: string) => {
    const newFavorites = new Set(favorites);
    const wasFavorite = newFavorites.has(siteId);
    
    if (wasFavorite) {
      newFavorites.delete(siteId);
      // 폴더에서도 제거
      const updatedFolders = folders.map(folder => ({
        ...folder,
        sites: folder.sites.filter(id => id !== siteId)
      }));
      setFolders(updatedFolders);
      localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
    } else {
      newFavorites.add(siteId);
    }
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${categoryId}`, JSON.stringify([...newFavorites]));
  };

  const createFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        sites: []
      };
      const updatedFolders = [...folders, newFolder];
      setFolders(updatedFolders);
      localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
      setNewFolderName('');
      setShowCreateFolder(false);
    }
  };

  const deleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);
    localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
  };

  const addSiteToFolder = (siteId: string, folderId: string) => {
    const updatedFolders = folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          sites: [...folder.sites, siteId]
        };
      }
      return folder;
    });
    setFolders(updatedFolders);
    localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
  };

  const removeSiteFromFolder = (siteId: string, folderId: string) => {
    const updatedFolders = folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          sites: folder.sites.filter(id => id !== siteId)
        };
      }
      return folder;
    });
    setFolders(updatedFolders);
    localStorage.setItem(`folders_${categoryId}`, JSON.stringify(updatedFolders));
  };

  const handleDragStart = (siteId: string) => {
    setDraggedSite(siteId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (folderId: string) => {
    if (draggedSite) {
      addSiteToFolder(draggedSite, folderId);
      setDraggedSite(null);
    }
  };

  // 폴더에 속하지 않은 즐겨찾기 사이트들
  const getUnfolderedSites = () => {
    const folderedSites = new Set(folders.flatMap(f => f.sites));
    return Array.from(favorites).filter(siteId => !folderedSites.has(siteId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 1. 필수사이트 섹션 */}
      <div className="mb-12">
        {false && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="text-lg font-bold">🚀</span>
            <span className="text-sm opacity-90">정말 필요한 핵심 사이트들</span>
          </div>
        </div>
        )}

         {/* 카테고리별 폴더 */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
           {data.categories.map((category, index) => (
             <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2">
                   <Folder className="w-4 h-4 text-blue-500" />
                   <h3 className="text-sm font-bold text-gray-900 truncate">{category.name}</h3>
                   <span className="text-xs text-gray-500">({category.sites.filter(site => !favorites.has(site.id)).length})</span>
                 </div>
               </div>
               
               <div 
                 className="min-h-[120px] p-2 border-2 border-dashed border-blue-200 rounded-lg"
                 onDragOver={handleDragOver}
                 onDrop={() => handleDrop(`category_${index}`)}
               >
                 {category.sites
                   .filter(site => !favorites.has(site.id))
                   .slice(0, 6)
                   .map((site) => (
                     <div
                       key={site.id}
                       className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded p-1 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-400 group mb-1 flex items-center"
                       onClick={() => window.open(site.url, '_blank')}
                       draggable
                       onDragStart={() => handleDragStart(site.id)}
                     >
                       <div className="flex items-center gap-1 flex-1 min-w-0">
                         <img 
                           src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=12`}
                           alt=""
                           className="w-3 h-3 flex-shrink-0"
                           onError={(e) => {
                             e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Crect width="16" height="16" fill="%23e5e7eb"/%3E%3Ctext x="8" y="12" text-anchor="middle" font-size="10" fill="%236b7280"%3E🌐%3C/text%3E%3C/svg%3E';
                           }}
                         />
                         <h4 className="font-medium text-gray-900 text-xs truncate group-hover:text-blue-600 flex-1 min-w-0">
                           {site.name}
                         </h4>
                       </div>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           toggleFavorite(site.id);
                         }}
                         className="text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0"
                       >
                         <span className="text-xs">⭐</span>
                       </button>
                     </div>
                   ))}
                 {category.sites.filter(site => !favorites.has(site.id)).length > 3 && (
                   <div className="text-xs text-gray-500 text-center mt-1">
                     +{category.sites.filter(site => !favorites.has(site.id)).length - 3}개 더
                   </div>
                 )}
                 {category.sites.filter(site => !favorites.has(site.id)).length === 0 && (
                   <div className="flex items-center justify-center text-gray-400 text-xs h-16">
                     사이트를 여기로 드래그하세요
                   </div>
                 )}
               </div>
             </div>
           ))}
         </div>
      </div>

      {/* 2. 즐겨찾기목록 섹션 */}
      {Array.from(favorites).length > 0 && (
        <div className="mb-8">
          {false && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-lg font-bold">⭐</span>
              <span className="text-sm opacity-90">즐겨찾기 목록</span>
            </div>
          </div>
          )}
          
          {/* 폴더 생성 모달 */}
          {showCreateFolder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">새 폴더 만들기</h3>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="폴더명을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      createFolder();
                    }
                  }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={createFolder}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    만들기
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateFolder(false);
                      setNewFolderName('');
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 폴더들 - 가로 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {folders.map((folder) => {
              const folderSites = folder.sites.map(siteId => {
                return data.categories
                  .flatMap(cat => cat.sites)
                  .find(s => s.id === siteId);
              }).filter(Boolean);
              
              return (
                <div key={folder.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-blue-500" />
                      <h3 className="text-sm font-bold text-gray-900 truncate">{folder.name}</h3>
                      <span className="text-xs text-gray-500">({folderSites.length})</span>
                    </div>
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div 
                    className="min-h-[80px] p-2 border-2 border-dashed border-blue-200 rounded-lg"
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(folder.id)}
                  >
                    {folderSites.slice(0, 3).map((site) => (
                      <div
                        key={site.id}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded p-1 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-400 group mb-1 flex items-center"
                        onClick={() => window.open(site.url, '_blank')}
                        draggable
                        onDragStart={() => handleDragStart(site.id)}
                      >
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <img 
                            src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=12`}
                            alt=""
                            className="w-3 h-3 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Crect width="16" height="16" fill="%23e5e7eb"/%3E%3Ctext x="8" y="12" text-anchor="middle" font-size="10" fill="%236b7280"%3E🌐%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <h4 className="font-medium text-gray-900 text-xs truncate group-hover:text-blue-600 flex-1 min-w-0">
                            {site.name}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSiteFromFolder(site.id, folder.id);
                          }}
                          className="text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </div>
                    ))}
                    {folderSites.length > 3 && (
                      <div className="text-xs text-gray-500 text-center mt-1">
                        +{folderSites.length - 3}개 더
                      </div>
                    )}
                    {folderSites.length === 0 && (
                      <div className="flex items-center justify-center text-gray-400 text-xs h-16">
                        사이트를 여기로 드래그하세요
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* 폴더 추가 버튼 */}
            <div 
              className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center min-h-[120px] hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
              onClick={() => setShowCreateFolder(true)}
            >
              <div className="text-center">
                <FolderPlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-gray-500 mb-1">새 폴더 추가</h3>
                <p className="text-xs text-gray-400">클릭하여 폴더 생성</p>
              </div>
            </div>
          </div>
          
          
          {/* 폴더에 속하지 않은 즐겨찾기 사이트들 */}
          {getUnfolderedSites().length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">즐겨찾기</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {getUnfolderedSites().map((siteId) => {
                  const site = data.categories
                    .flatMap(cat => cat.sites)
                    .find(s => s.id === siteId);
                  
                  if (!site) return null;
                  
                  return (
                    <div
                      key={site.id}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-2 border-gray-800 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-900 group"
                      onClick={() => window.open(site.url, '_blank')}
                      draggable
                      onDragStart={() => handleDragStart(site.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <img 
                            src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=16`}
                            alt=""
                            className="w-4 h-4 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Crect width="16" height="16" fill="%23e5e7eb"/%3E%3Ctext x="8" y="12" text-anchor="middle" font-size="10" fill="%236b7280"%3E🌐%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-yellow-600 flex-1 min-w-0">
                            {site.name}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(site.id);
                          }}
                          className="text-yellow-500 hover:text-yellow-600 transition-colors"
                        >
                          <span className="text-sm">⭐</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. 추천사이트목록 섹션 */}
      <div className="mb-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="text-lg font-bold">💡 추가 추천</span>
            <span className="text-sm opacity-90">더 많은 유용한 사이트들</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {data.categories.map((category, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* 컬럼 헤더 */}
            <div className="bg-gradient-to-r from-blue-300 to-purple-400 p-4 text-center">
              <h3 className="text-white font-bold text-sm leading-tight">
                {category.name}
              </h3>
            </div>

            {/* 사이트 목록 */}
            <div className="p-3 space-y-3 max-h-[800px] overflow-y-auto">
            {category.sites
  .filter(site => !favorites.has(site.id)) // 즐겨찾기된 사이트는 제외
  .map((site) => (
                <div
                  key={site.id}
                  className="bg-gray-50 hover:bg-white border border-gray-200 rounded-lg p-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 group h-16 flex flex-col justify-between"
                  onClick={() => window.open(site.url, '_blank')}
                >
{/* 파비콘 + 사이트 이름 */}
<div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=16`}
                        alt=""
                        className="w-4 h-4 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <h4 className="font-bold text-gray-900 text-xs leading-tight truncate group-hover:text-blue-600 flex-1 min-w-0">
                        {site.name}
                      </h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(site.id);
                      }}
                      className="p-0.5 h-5 w-5 flex-shrink-0 ml-2"
                    >
<span 
  className={`text-xs border border-gray-200 rounded ${
    favorites.has(site.id) 
      ? 'text-yellow-500' 
      : 'text-gray-300 hover:text-yellow-400'
  }`}
  style={{ fontSize: '12px', lineHeight: '1', padding: '2px' }}
>
  {favorites.has(site.id) ? '★' : '☆'}
</span>
                    </Button>
                  </div>

                  {/* 설명 - 사이트 이름과 같은 열에서 시작 */}
                  <p className="text-xs text-gray-600 leading-relaxed overflow-hidden text-ellipsis line-clamp-1 ml-12" style={{ textIndent: '24px' }}>
                    {site.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 4. 위젯 섹션 */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="text-lg font-bold">🛠️</span>
            <span className="text-sm opacity-90">업무에 필요한 전문 위젯들</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* 날씨 위젯 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🌤️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">날씨 정보</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">현재 온도</span>
                  <span className="text-lg font-bold text-blue-600">22°C</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">습도</span>
                  <span className="text-lg font-bold text-green-600">65%</span>
                </div>
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                상세 날씨 보기
              </button>
            </div>
          </div>

          {/* 단위 변환기 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📐</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">단위 변환기</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">길이</span>
                  <span className="text-lg font-bold text-purple-600">1m = 3.28ft</span>
                </div>
              </div>
              <div className="bg-pink-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">면적</span>
                  <span className="text-lg font-bold text-pink-600">1㎡ = 10.76ft²</span>
                </div>
              </div>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                변환기 열기
              </button>
            </div>
          </div>

          {/* To-Do List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✅</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">할 일 목록</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">설계도 검토</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">현장 점검</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">보고서 작성</span>
              </div>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors mt-3">
                새 할 일 추가
              </button>
            </div>
          </div>

          {/* 계산기 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🧮</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">전문 계산기</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">면적 계산</span>
                  <span className="text-lg font-bold text-green-600">㎡</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">부피 계산</span>
                  <span className="text-lg font-bold text-blue-600">㎥</span>
                </div>
              </div>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                계산기 열기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 정보 */}
<div className="mt-12 text-center">
  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
    <h3 className="text-lg font-bold text-gray-900 mb-2">카테고리 정보</h3>
    <p className="text-gray-600">
      <span className="font-bold text-pink-600">{data.categories.length}</span>개 분야에서 
      <span className="font-bold text-rose-600 ml-1">
        {data.categories.reduce((total, cat) => total + cat.sites.length, 0)}
      </span>개의 사이트를 운영 중입니다.
    </p>
  </div>
</div>

</div>
    </div>
  );
}
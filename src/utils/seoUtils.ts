// SEO 및 구조화데이터 유틸리티

export interface TemplateData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  clones: number;
  ogImage?: string;
}

export interface PageData {
  id: string;
  title: string;
  description: string;
  widgets: any[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

class SEOUtils {
  // OG 이미지 생성 (서버 사이드에서 실제 구현 필요)
  generateOGImage(template: TemplateData): string {
    // 실제로는 서버에서 캔버스를 사용해 이미지 생성
    // 여기서는 더미 URL 반환
    const params = new URLSearchParams({
      title: template.title,
      author: template.author,
      tags: template.tags.join(','),
      views: template.views.toString(),
      clones: template.clones.toString()
    });
    
    return `/api/og/template/${template.id}?${params.toString()}`;
  }

  // 템플릿 리스트용 ItemList 구조화데이터
  generateTemplateListSchema(templates: TemplateData[]): object {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "URWEBS 템플릿 갤러리",
      "description": "다양한 시작페이지 템플릿을 찾아보세요",
      "numberOfItems": templates.length,
      "itemListElement": templates.map((template, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "@id": `https://urwebs.com/t/${template.id}`,
          "name": template.title,
          "description": template.description,
          "author": {
            "@type": "Person",
            "name": template.author
          },
          "dateCreated": template.createdAt,
          "dateModified": template.updatedAt,
          "keywords": template.tags.join(", "),
          "image": template.ogImage || this.generateOGImage(template)
        }
      }))
    };
  }

  // 개별 템플릿용 CreativeWork 구조화데이터
  generateTemplateSchema(template: TemplateData): object {
    return {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": `https://urwebs.com/t/${template.id}`,
      "name": template.title,
      "description": template.description,
      "author": {
        "@type": "Person",
        "name": template.author
      },
      "dateCreated": template.createdAt,
      "dateModified": template.updatedAt,
      "keywords": template.tags.join(", "),
      "image": template.ogImage || this.generateOGImage(template),
      "url": `https://urwebs.com/t/${template.id}`,
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ViewAction",
          "userInteractionCount": template.views
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/DownloadAction",
          "userInteractionCount": template.clones
        }
      ],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KRW",
        "availability": "https://schema.org/InStock"
      }
    };
  }

  // 페이지용 구조화데이터
  generatePageSchema(page: PageData): object {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `https://urwebs.com/p/${page.id}`,
      "name": page.title,
      "description": page.description,
      "dateCreated": page.createdAt,
      "dateModified": page.updatedAt,
      "url": `https://urwebs.com/p/${page.id}`,
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://urwebs.com",
        "name": "URWEBS",
        "url": "https://urwebs.com"
      }
    };
  }

  // 사이트맵 생성
  generateSitemap(templates: TemplateData[], pages: PageData[]): string {
    const baseUrl = 'https://urwebs.com';
    const now = new Date().toISOString();

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 홈페이지
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${baseUrl}</loc>\n`;
    sitemap += `    <lastmod>${now}</lastmod>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += `  </url>\n`;

    // 템플릿 페이지들
    templates.forEach(template => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/t/${template.id}</loc>\n`;
      sitemap += `    <lastmod>${template.updatedAt}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // 공개 페이지들
    pages.filter(page => page.isPublic).forEach(page => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${baseUrl}/p/${page.id}</loc>\n`;
      sitemap += `    <lastmod>${page.updatedAt}</lastmod>\n`;
      sitemap += `    <changefreq>monthly</changefreq>\n`;
      sitemap += `    <priority>0.6</priority>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += '</urlset>';

    return sitemap;
  }

  // 메타 태그 생성
  generateMetaTags(data: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
  }): Record<string, string> {
    const baseUrl = 'https://urwebs.com';
    
    return {
      'og:title': data.title,
      'og:description': data.description,
      'og:image': data.image || `${baseUrl}/og-default.png`,
      'og:url': data.url || baseUrl,
      'og:type': data.type || 'website',
      'og:site_name': 'URWEBS',
      'twitter:card': 'summary_large_image',
      'twitter:title': data.title,
      'twitter:description': data.description,
      'twitter:image': data.image || `${baseUrl}/og-default.png`,
      'meta:description': data.description,
      'meta:keywords': '시작페이지, 대시보드, 위젯, 템플릿, 개인화'
    };
  }

  // 카테고리별 메타 태그
  generateCategoryMetaTags(category: string): Record<string, string> {
    const categoryNames: Record<string, string> = {
      '개발자': '개발자용 시작페이지 템플릿',
      '디자인': '디자이너용 워크스페이스 템플릿',
      '학생': '학생용 학습 관리 템플릿',
      '마케터': '마케터용 인사이트 템플릿',
      '자영업': '자영업자용 관리 템플릿',
      '부동산': '부동산 투자 템플릿',
      '금융': '금융 투자 포트폴리오 템플릿',
      '캠핑': '캠핑 여행 계획 템플릿'
    };

    const title = `${categoryNames[category] || category} 템플릿 - URWEBS`;
    const description = `${category} 분야에 특화된 시작페이지 템플릿을 찾아보세요. 전문가들이 만든 고품질 템플릿으로 나만의 대시보드를 빠르게 구성할 수 있습니다.`;

    return this.generateMetaTags({
      title,
      description,
      type: 'website'
    });
  }
}

// 전역 인스턴스
export const seoUtils = new SEOUtils();

// 편의 함수들
export const generateTemplateListSchema = (templates: TemplateData[]) => 
  seoUtils.generateTemplateListSchema(templates);

export const generateTemplateSchema = (template: TemplateData) => 
  seoUtils.generateTemplateSchema(template);

export const generatePageSchema = (page: PageData) => 
  seoUtils.generatePageSchema(page);

export const generateSitemap = (templates: TemplateData[], pages: PageData[]) => 
  seoUtils.generateSitemap(templates, pages);

export const generateMetaTags = (data: any) => 
  seoUtils.generateMetaTags(data);

export const generateCategoryMetaTags = (category: string) => 
  seoUtils.generateCategoryMetaTags(category);

import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { Website } from '../types';
import { CATEGORY_BY_FIELD } from '../data/fieldCategories';
import { websites as realEstateSites } from '../data/websites.realestate';
import { websites as webdevSites } from '../data/websites.webdev';
import { websites as stocksSites } from '../data/websites.stocks';

const FIELD_DATA: Record<string, { title: string; websites: Website[] }> = {
  'real-estate': { title: '부동산', websites: realEstateSites },
  webdev: { title: '웹개발', websites: webdevSites },
  stocks: { title: '증권', websites: stocksSites },
};

export default function FieldPage() {
  const { field } = useParams<{ field: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const data = field ? FIELD_DATA[field] : undefined;
  const categories = field ? CATEGORY_BY_FIELD[field] || [] : [];

  const selectedParam = searchParams.get('category');
  const selectedListRaw = selectedParam
    ? selectedParam.split(',').map((s) => decodeURIComponent(s.trim())).filter(Boolean)
    : [];
  const selectedList = selectedListRaw.filter((c) => categories.includes(c));

  const results = useMemo(() => {
    if (!data) return [];
    return data.websites.filter(
      (item) => selectedList.length === 0 || selectedList.includes(item.category),
    );
  }, [data, selectedList]);

  const toggleCategory = (cat: string) => {
    const exists = selectedList.includes(cat);
    const next = exists ? selectedList.filter((c) => c !== cat) : [...selectedList, cat];
    if (next.length === 0) {
      searchParams.delete('category');
    } else {
      searchParams.set(
        'category',
        next.map((c) => encodeURIComponent(c)).join(','),
      );
    }
    setSearchParams(searchParams);
  };

  const resetCategories = () => {
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  if (!field || !data) {
    return (
      <div className="p-6">
        <p className="mb-4">알 수 없는 분야입니다.</p>
        <Link to="/" className="text-blue-600 underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">{data.title}</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`px-3 py-1 border rounded-full text-sm cursor-pointer transition-colors ${selectedList.includes(cat) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            type="button"
          >
            {cat}
          </button>
        ))}
        {selectedList.length > 0 && (
          <button
            onClick={resetCategories}
            className="px-3 py-1 border rounded-full text-sm cursor-pointer hover:bg-gray-200"
            type="button"
          >
            선택 초기화
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div>
          <p className="mb-2">표시할 사이트가 없습니다.</p>
          <button
            onClick={resetCategories}
            className="text-blue-600 underline"
            type="button"
          >
            전체 보기
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((site) => (
            <li key={site.id} className="border rounded p-3">
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {site.title}
              </a>
              {site.description && (
                <p className="text-sm text-gray-600 mt-1">{site.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

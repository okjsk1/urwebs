import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface SubCategory {
  id: string;
  title: string;
  description: string;
}

interface CategoryHoverCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  subCategories?: SubCategory[];
  onClick: (subCategoryId?: string) => void;
}

export function CategoryHoverCard({ icon: Icon, title, description, subCategories, onClick }: CategoryHoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (subCategoryId?: string) => {
    onClick(subCategoryId);
  };

  if (!subCategories || subCategories.length === 0) {
    return (
      <Card 
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200"
        onClick={() => handleClick()}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white border border-gray-200 hover:border-blue-300 group">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
            <Icon className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{title}</h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{description}</p>
            {subCategories && subCategories.length > 0 && (
              <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {subCategories.length}개 세부 분야
              </div>
            )}
          </div>
        </div>
      </Card>

      {isHovered && subCategories && subCategories.length > 0 && (
        <div className="absolute top-0 left-0 w-full z-20">
          <Card className="p-4 bg-white border-2 border-blue-200 shadow-2xl rounded-xl">
            <div className="mb-2">
              <h4 className="font-semibold text-gray-800 text-sm mb-1">{title}</h4>
              <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
            </div>
            <div className="space-y-1">
              {subCategories.map((subCategory) => (
                <div
                  key={subCategory.id}
                  className="p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200"
                  onClick={() => handleClick(subCategory.id)}
                >
                  <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {subCategory.title}
                  </h4>
                  <p className="text-xs text-gray-600 ml-4">{subCategory.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
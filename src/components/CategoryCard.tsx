import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export function CategoryCard({ icon: Icon, title, description, onClick }: CategoryCardProps) {
  return (
    <Card 
      className="p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200"
      onClick={onClick}
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
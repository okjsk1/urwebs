import React from 'react';
import { Home } from './Home';

interface HomePageProps {
  onCategorySelect?: (categoryId: string, subCategory?: string) => void;
}

export function HomePageNew({ onCategorySelect }: HomePageProps) {
  return <Home />;
}
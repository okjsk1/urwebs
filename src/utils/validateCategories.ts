import { Website, CategoryConfigMap } from '../types';

export function validateCategoryKeys(
  websites: Website[],
  categoryConfig: CategoryConfigMap,
  categoryOrder: string[]
) {
  try {
    const websiteCategories = Array.from(
      new Set(websites.map((w) => w.category))
    );
    const configKeys = Object.keys(categoryConfig || {});
    const orderSet = new Set(categoryOrder);

    websiteCategories.forEach((cat) => {
      if (!configKeys.includes(cat) || !orderSet.has(cat)) {
        console.warn(
          `[category] Missing config or order for "${cat}"`
        );
      }
    });

    categoryOrder.forEach((cat) => {
      if (!configKeys.includes(cat)) {
        console.warn(
          `[category] "${cat}" is in order but not in categoryConfig`
        );
      }
    });
  } catch (e) {
    console.warn('Category validation failed:', e);
  }
}

export default validateCategoryKeys;

import { Category } from '../types';

export const getCategoryNameFa = (cat: Category): string => {
  const names: Record<Category, string> = {
    knowledge: 'اطلاعات عمومی',
    movies: 'سینما',
    cities: 'شهرها',
    food: 'غذا',
    body: 'بدن',
    jobs: 'مشاغل',
    tech: 'تکنولوژی',
    nature: 'طبیعت',
    shahnameh: 'شاهنامه',
    history: 'تاریخ',
    sports: 'ورزش',
    art: 'هنر',
    all: 'همه موضوعات',
    general: 'عمومی',
  };
  return names[cat] || cat;
};

export const getCategoryNameEn = (cat: Category): string => {
  const names: Record<Category, string> = {
    knowledge: 'General',
    movies: 'Movies',
    cities: 'Cities',
    food: 'Food',
    body: 'Body',
    jobs: 'Jobs',
    tech: 'Tech',
    nature: 'Nature',
    shahnameh: 'Shahnameh',
    history: 'History',
    sports: 'Sports',
    art: 'Art',
    all: 'Mixed',
    general: 'General',
  };
  return names[cat] || cat;
};

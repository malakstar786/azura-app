import { Category } from './types/category';

export const CATEGORIES: Omit<Category, 'products'>[] = [
  {
    name: 'Nail Care',
    slug: 'nail-care',
    imageUrl:
      'https://images.pexels.com/photos/1926620/pexels-photo-1926620.jpeg',
    heroImage: require('./images/nail-care-hero.png'),
    description: 'Discover our premium collection of nail care products designed to keep your nails healthy and beautiful.',
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    imageUrl:
      'https://images.pexels.com/photos/1926620/pexels-photo-1926620.jpeg',
    heroImage: require('./images/makeup-1.png'),
    description: 'Explore our range of high-quality makeup products for a flawless look.',
  },
  {
    name: 'Fragrances',
    slug: 'fragrances',
    imageUrl:
      'https://images.pexels.com/photos/7664093/pexels-photo-7664093.jpeg',
    heroImage: require('./images/fragrance-hero.png'),
    description: 'Experience our luxurious collection of fragrances that leave a lasting impression.',
  },
];
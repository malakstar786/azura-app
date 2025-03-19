import { Category } from './types/category';
import { PRODUCTS } from './products';

export const CATEGORIES: Category[] = [
  {
    name: 'Nail Care',
    slug: 'nail-care',
    imageUrl:
      'https://images.pexels.com/photos/7664093/pexels-photo-7664093.jpeg',
    products: PRODUCTS.filter(product => product.category.slug === 'nail-care'),
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    imageUrl:
      'https://images.pexels.com/photos/1926620/pexels-photo-1926620.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    products: PRODUCTS.filter(product => product.category.slug === 'makeup'),
  },
  {
    name: 'Fragrances',
    slug: 'fragrances',
    imageUrl:
      'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    products: PRODUCTS.filter(product => product.category.slug === 'fragrances'),
  },

];
import { Product } from './types/product';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Nail Polish Set',
    slug: 'nail-polish-set',
    heroImage: require('./images/nail-care-hero.png'),
    imagesUrl: [
      require('./images/nail-care-1.png'),
      require('./images/nail-care-2.png'),
      require('./images/nail-care-3.png'),
    ],
    price: 29.99,
    category: {
      imageUrl: require('./images/nail-care-hero.png'),
      name: 'Nail Care',
      slug: 'nail-care',
    },
    maxQuantity: 5,
  },
  {
    id: 2,
    title: 'Nail Art Kit',
    slug: 'nail-art-kit',
    heroImage: require('./images/nail-care-1.png'),
    imagesUrl: [
      require('./images/nail-care-1.png'),
      require('./images/nail-care-2.png'),
    ],
    price: 39.99,
    category: {
      imageUrl: require('./images/nail-care-hero.png'),
      name: 'Nail Care',
      slug: 'nail-care',
    },
    maxQuantity: 10,
  },
  {
    id: 3,
    title: 'Foundation Makeup',
    slug: 'foundation-makeup',
    heroImage: require('./images/makeup-1.png'),
    imagesUrl: [
      require('./images/makeup-1.png'),
      require('./images/makeup-2.png'),
    ],
    price: 49.99,
    category: {
      imageUrl: require('./images/makeup-1.png'),
      name: 'Makeup',
      slug: 'makeup',
    },
    maxQuantity: 15,
  },
  {
    id: 4,
    title: 'Lipstick Set',
    slug: 'lipstick-set',
    heroImage: require('./images/makeup-2.png'),
    imagesUrl: [
      require('./images/makeup-2.png'),
    ],
    price: 34.99,
    category: {
      imageUrl: require('./images/makeup-1.png'),
      name: 'Makeup',
      slug: 'makeup',
    },
    maxQuantity: 8,
  },
  {
    id: 5,
    title: 'Floral Perfume',
    slug: 'floral-perfume',
    heroImage: require('./images/fragrance-1.png'),
    imagesUrl: [
      require('./images/fragrance-1.png'),
      require('./images/fragrance-2.png'),
    ],
    price: 89.99,
    category: {
      imageUrl: require('./images/fragrance-1.png'),
      name: 'Fragrances',
      slug: 'fragrances',
    },
    maxQuantity: 12,
  },
  {
    id: 6,
    title: 'Woody Cologne',
    slug: 'woody-cologne',
    heroImage: require('./images/fragrance-2.png'),
    imagesUrl: [
      require('./images/fragrance-2.png'),
    ],
    price: 79.99,
    category: {
      imageUrl: require('./images/fragrance-1.png'),
      name: 'Fragrances',
      slug: 'fragrances',
    },
    maxQuantity: 10,
  }
];
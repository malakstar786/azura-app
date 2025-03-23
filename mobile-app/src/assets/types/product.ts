import { ImageSourcePropType } from 'react-native';

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: Category;
  heroImage: any;
  image: string;
  isNewArrival?: boolean;
}; 
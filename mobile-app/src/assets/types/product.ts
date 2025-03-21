import { ImageSourcePropType } from 'react-native';

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  heroImage: ImageSourcePropType;
  category: Category;
  slug: string;
  isNewArrival?: boolean;
}; 
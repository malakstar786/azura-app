import { Product } from './product';
import { ImageSourcePropType } from 'react-native';

export type Category = { 
  name: string;
  imageUrl: string;
  heroImage: ImageSourcePropType;
  description: string;
  slug: string;
  products: Product[];
};
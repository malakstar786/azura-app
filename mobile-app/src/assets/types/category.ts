export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  heroImage: any; // Using any for now, but ideally this should be a more specific type
}; 
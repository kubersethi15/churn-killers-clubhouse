
export type Newsletter = {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
  published_date: string;
  read_time: string;
  category: string | null;
  slug: string;
};

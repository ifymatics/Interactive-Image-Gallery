export type Image = {
  id: string;
  alt_description: string | null;
  description: string | null;
  urls: {
    regular: string;
    thumb: string;
  };
  user: {
    name: string;
  };
  tags: Tag[];
};

export type UnsplashApiResponse = {
  total: number;
  total_pages: number;
  results: Image[];
};

export type Tag = {
  type: string;
  title: string;
};

export type Comment = {
  id: string;
  imageId: string;
  text: string;
  user: User;
  createdAt: string;
};

export type User = {
  id: string;
  username: string;
};

export type AuthCredentials = {
  username: string;
  password: string;
};

export type LikeCount = {
  count: number;
};

export type HasLiked = {
  hasLiked: boolean;
};

export type ProductReviewView = {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorDisplayName: string;
  isOwn: boolean;
};

export type ProductReviewStats = {
  averageRating: number;
  reviewCount: number;
};

export type ProductReviewsViewer = {
  isAuthenticated: boolean;
  canReview: boolean;
  ownReview: ProductReviewView | null;
};

export type ProductReviewsData = {
  stats: ProductReviewStats;
  reviews: ProductReviewView[];
  viewer: ProductReviewsViewer;
};

export type ReviewMutationCode =
  | "saved"
  | "deleted"
  | "unauthenticated"
  | "invalid_rating"
  | "empty_body"
  | "body_too_long"
  | "not_entitled"
  | "not_found"
  | "rpc_error";

export type ReviewMutationResult = {
  ok: boolean;
  code: ReviewMutationCode;
  message?: string;
};

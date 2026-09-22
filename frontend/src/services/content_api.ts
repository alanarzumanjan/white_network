const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper для получения токена из localStorage
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Helper для авторизованных запросов
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  if (token && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
};

// ==========================================
// ПОСТЫ
// ==========================================
export interface Post {
  id: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  authorKarma: number;
  clubId?: string;
  clubName?: string;
  commentsCount: number;
}

export interface CreatePostDto {
  content: string;
  clubId?: string;
}

export interface UpdatePostDto {
  content: string;
}

export const postsApi = {
  // Создать пост
  create: (dto: CreatePostDto) =>
    authFetch("/api/posts", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  // Получить пост по ID
  getById: (id: string) =>
    fetch(`${API_BASE_URL}/api/posts/${id}`).then((res) => res.json()),

  // Обновить пост
  update: (id: string, dto: UpdatePostDto) =>
    authFetch(`/api/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  // Удалить пост
  delete: (id: string) =>
    authFetch(`/api/posts/${id}`, {
      method: "DELETE",
    }),
};

// ==========================================
// ЛЕНТА (FEED)
// ==========================================
export interface FeedQuery {
  page?: number;
  pageSize?: number;
  clubId?: string;
}

export interface FeedResponse {
  posts: Post[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export const feedApi = {
  // Получить ленту
  get: (query: FeedQuery = {}) => {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.pageSize) params.append("pageSize", query.pageSize.toString());
    if (query.clubId) params.append("clubId", query.clubId);

    return fetch(`${API_BASE_URL}/api/feed?${params}`).then((res) =>
      res.json(),
    );
  },
};

// ==========================================
// КОММЕНТАРИИ
// ==========================================
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  authorKarma: number;
  postId: string;
  parentCommentId?: string;
  replies: Comment[];
}

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
}

export const commentsApi = {
  // Создать комментарий
  create: (postId: string, dto: CreateCommentDto) =>
    authFetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  // Получить комментарии поста
  getByPostId: (postId: string) =>
    fetch(`${API_BASE_URL}/api/posts/${postId}/comments`).then((res) =>
      res.json(),
    ),

  // Удалить комментарий
  delete: (postId: string, commentId: string) =>
    authFetch(`/api/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }),
};

// ==========================================
// КЛУБЫ
// ==========================================
export interface Club {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  createdAt: string;
  createdById: string;
  createdByUsername: string;
  membersCount: number;
  postsCount: number;
}

export interface CreateClubDto {
  name: string;
  description: string;
}

export const clubsApi = {
  // Создать клуб
  create: (dto: CreateClubDto) =>
    authFetch("/api/clubs", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  // Получить клуб по ID
  getById: (id: string) =>
    fetch(`${API_BASE_URL}/api/clubs/${id}`).then((res) => res.json()),

  // Получить мои клубы
  getMyClubs: () => authFetch("/api/clubs/my"),

  // Вступить в клуб
  join: (id: string) =>
    authFetch(`/api/clubs/${id}/join`, {
      method: "POST",
    }),

  // Покинуть клуб
  leave: (id: string) =>
    authFetch(`/api/clubs/${id}/leave`, {
      method: "POST",
    }),
};

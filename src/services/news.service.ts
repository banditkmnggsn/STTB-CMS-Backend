import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';
import { buildPaginationMeta, paginationSkipTake, parsePagination } from '../utils/pagination';
import { ensureUniqueSlug, generateSlug } from '../utils/slug';

const articleInclude = {
  category: { select: { id: true, name: true, slug: true, color: true } },
  author: { select: { id: true, name: true, avatar: true, email: true } },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
} as const;

const mapArticle = (article: {
  id: string;
  slug: string;
  title: string;
  tags: Array<{ tag: { id: string; name: string; slug: string } }>;
  [key: string]: unknown;
}) => ({
  ...article,
  tags: article.tags.map((item) => item.tag),
});

export const listNews = async (query: Record<string, unknown>) => {
  const params = parsePagination(query);
  const where: Record<string, unknown> = {};

  if (query.status) {
    where.status = String(query.status);
  }

  if (query.type) {
    where.type = String(query.type);
  }

  if (query.featured === 'true') {
    where.isFeatured = true;
  }

  if (query.category) {
    where.category = { is: { slug: String(query.category) } };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: String(query.search), mode: 'insensitive' } },
      { excerpt: { contains: String(query.search), mode: 'insensitive' } },
      { content: { contains: String(query.search), mode: 'insensitive' } },
    ];
  }

  const orderBy = query.sort === 'views'
    ? [{ views: 'desc' as const }, { publishDate: 'desc' as const }]
    : [{ publishDate: 'desc' as const }, { createdAt: 'desc' as const }];

  const [total, articles] = await prisma.$transaction([
    prisma.newsArticle.count({ where }),
    prisma.newsArticle.findMany({
      where,
      include: articleInclude,
      orderBy,
      ...paginationSkipTake(params),
    }),
  ]);

  return {
    articles: articles.map(mapArticle),
    pagination: buildPaginationMeta(params, total),
  };
};

export const getNewsBySlug = async (slug: string) => {
  const article = await prisma.newsArticle.findUnique({
    where: { slug },
    include: articleInclude,
  });

  if (!article) {
    throw new HttpError(404, 'Article not found');
  }

  void prisma.newsArticle.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  return mapArticle(article);
};

export const getNewsById = async (id: string) => {
  const article = await prisma.newsArticle.findUnique({
    where: { id },
    include: articleInclude,
  });

  if (!article) {
    throw new HttpError(404, 'Article not found');
  }

  return mapArticle(article);
};

export const createNews = async (data: {
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  categoryId?: string;
  tags?: string[];
  status?: string;
  publishDate?: string;
  isFeatured?: boolean;
  type?: string;
  mediaUrl?: string;
  duration?: string;
  authorId: string;
}) => {
  const baseSlug = generateSlug(data.title);
  const slug = await ensureUniqueSlug(
    baseSlug,
    async (candidate) => Boolean(await prisma.newsArticle.findUnique({ where: { slug: candidate } }))
  );

  const article = await prisma.newsArticle.create({
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      featuredImage: data.featuredImage,
      categoryId: data.categoryId,
      authorId: data.authorId,
      status: data.status ?? 'draft',
      type: (data.type ?? 'article') as 'article' | 'video' | 'podcast' | 'bulletin',
      mediaUrl: data.mediaUrl,
      duration: data.duration,
      isFeatured: data.isFeatured ?? false,
      publishDate: data.publishDate ? new Date(data.publishDate) : undefined,
      tags: data.tags?.length
        ? {
            create: data.tags.map((tagId) => ({ tagId })),
          }
        : undefined,
    },
    include: articleInclude,
  });

  return mapArticle(article);
};

export const updateNews = async (
  id: string,
  data: {
    title?: string;
    excerpt?: string;
    content?: string;
    featuredImage?: string;
    categoryId?: string | null;
    tags?: string[];
    status?: string;
    publishDate?: string | null;
    isFeatured?: boolean;
    type?: string;
    mediaUrl?: string;
    duration?: string;
  }
) => {
  await getNewsById(id);

  const article = await prisma.newsArticle.update({
    where: { id },
    data: {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      featuredImage: data.featuredImage,
      categoryId: data.categoryId,
      status: data.status,
      type: data.type as 'article' | 'video' | 'podcast' | 'bulletin' | undefined,
      mediaUrl: data.mediaUrl,
      duration: data.duration,
      isFeatured: data.isFeatured,
      publishDate:
        data.publishDate === null
          ? null
          : data.publishDate
            ? new Date(data.publishDate)
            : undefined,
      ...(data.tags !== undefined
        ? {
            tags: {
              deleteMany: {},
              create: data.tags.map((tagId) => ({ tagId })),
            },
          }
        : {}),
    },
    include: articleInclude,
  });

  return mapArticle(article);
};

export const deleteNews = async (id: string) => {
  await getNewsById(id);
  await prisma.newsArticle.delete({ where: { id } });
};
import { prisma } from '../config/prisma';
import { HttpError } from '../utils/http-error';
import { buildPaginationMeta, paginationSkipTake, parsePagination } from '../utils/pagination';

export const listEvents = async (query: Record<string, unknown>) => {
  const params = parsePagination(query);
  const where: Record<string, unknown> = {};

  if (query.isActive !== 'false') {
    where.isActive = true;
  }

  if (query.isLeadEvent === 'true') {
    where.isLeadEvent = true;
  }

  if (query.category) {
    where.category = String(query.category);
  }

  if (query.eventType) {
    where.eventType = String(query.eventType);
  }

  if (query.featured === 'true') {
    where.isFeatured = true;
  }

  if (query.upcoming === 'true') {
    where.eventDate = { gte: new Date() };
  }

  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: [{ eventDate: 'asc' }, { createdAt: 'desc' }],
      ...paginationSkipTake(params),
    }),
  ]);

  return {
    events,
    pagination: buildPaginationMeta(params, total),
  };
};

export const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    throw new HttpError(404, 'Event not found');
  }

  return event;
};

export const createEvent = async (data: {
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  location?: string;
  category?: string;
  eventType?: string;
  isLeadEvent?: boolean;
  image?: string;
  registrationLink?: string;
  capacity?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}) => {
  return prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      eventDate: new Date(data.eventDate),
      eventTime: data.eventTime,
      location: data.location,
      category: data.category,
      eventType: data.eventType,
      isLeadEvent: data.isLeadEvent ?? false,
      image: data.image,
      registrationLink: data.registrationLink,
      capacity: data.capacity,
      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive ?? true,
    },
  });
};

export const updateEvent = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    eventDate?: string;
    eventTime?: string;
    location?: string;
    category?: string;
    eventType?: string;
    isLeadEvent?: boolean;
    image?: string;
    registrationLink?: string;
    capacity?: number;
    isFeatured?: boolean;
    isActive?: boolean;
  }
) => {
  await getEventById(id);

  return prisma.event.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      eventTime: data.eventTime,
      location: data.location,
      category: data.category,
      eventType: data.eventType,
      isLeadEvent: data.isLeadEvent,
      image: data.image,
      registrationLink: data.registrationLink,
      capacity: data.capacity,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
    },
  });
};

export const deleteEvent = async (id: string) => {
  await getEventById(id);
  await prisma.event.delete({ where: { id } });
};
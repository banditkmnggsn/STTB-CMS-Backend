-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('article', 'video', 'podcast', 'bulletin');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "event_type" VARCHAR(100),
ADD COLUMN     "is_lead_event" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "news_articles" ADD COLUMN     "duration" VARCHAR(20),
ADD COLUMN     "media_url" VARCHAR(500),
ADD COLUMN     "type" "ContentType" NOT NULL DEFAULT 'article';

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "data" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "position" VARCHAR(200),
    "specialization" VARCHAR(300),
    "education" TEXT,
    "email" VARCHAR(255),
    "image_url" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255),
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_slug_idx" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_is_active_idx" ON "pages"("is_active");

-- CreateIndex
CREATE INDEX "lecturers_is_active_idx" ON "lecturers"("is_active");

-- CreateIndex
CREATE INDEX "lecturers_order_idx" ON "lecturers"("order");

-- CreateIndex
CREATE INDEX "inquiries_is_read_idx" ON "inquiries"("is_read");

-- CreateIndex
CREATE INDEX "inquiries_created_at_idx" ON "inquiries"("created_at");

-- CreateIndex
CREATE INDEX "events_is_lead_event_idx" ON "events"("is_lead_event");

-- CreateIndex
CREATE INDEX "events_event_type_idx" ON "events"("event_type");

-- CreateIndex
CREATE INDEX "news_articles_type_idx" ON "news_articles"("type");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

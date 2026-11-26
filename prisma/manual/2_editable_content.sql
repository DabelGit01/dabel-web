-- Dabel: editable content (migration 2_editable_content + default data)
-- Paste into Supabase > SQL Editor and click Run. Safe to run more than once.
BEGIN;

-- 1) Migration (only if not applied yet)
DO $mig$
BEGIN
IF NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '2_editable_content' AND finished_at IS NOT NULL) THEN
  -- CreateTable
  CREATE TABLE IF NOT EXISTS "HeroSlide" (
      "id" TEXT NOT NULL,
      "label" TEXT NOT NULL,
      "eyebrow" TEXT NOT NULL,
      "line1" TEXT NOT NULL,
      "line2" TEXT NOT NULL DEFAULT '',
      "line3" TEXT NOT NULL DEFAULT '',
      "accentLine" INTEGER NOT NULL DEFAULT 3,
      "body" TEXT NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "ctaLabel" TEXT NOT NULL DEFAULT 'Explore offers',
      "ctaHref" TEXT NOT NULL DEFAULT '/offers',
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
  );

  -- CreateTable
  CREATE TABLE IF NOT EXISTS "CoreValue" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "CoreValue_pkey" PRIMARY KEY ("id")
  );

  -- CreateTable
  CREATE TABLE IF NOT EXISTS "SiteContent" (
      "key" TEXT NOT NULL,
      "value" JSONB NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL,

      CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("key")
  );

  INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
  VALUES (gen_random_uuid()::text, '9768710d9a065974ebcd5b7aca41a5088b2cd582f695a7d7059b001173506a14', now(), '2_editable_content', NULL, NULL, now(), 1);
END IF;
END
$mig$;

-- 2) Default hero slides (only if none yet)
INSERT INTO "HeroSlide" (id, label, eyebrow, line1, line2, line3, "accentLine", body, "imageUrl", "ctaLabel", "ctaHref", "order", published, "createdAt", "updatedAt")
SELECT * FROM (VALUES
  (gen_random_uuid()::text, 'Marine Logistics', 'Marine Logistics · Since 2013', 'Marine logistics', 'you can rely on,', 'every tide.', 3, 'Vessel management, chartering, inter-ship agency, port services and cargo transport for offshore oil & gas operations.', '/images/tug-barge.jpg', 'Explore offers', '/offers', 0, true, now(), now()),
  (gen_random_uuid()::text, 'Consultancy', 'Consultancy', 'Expert consultancy', 'for safer, cleaner', 'operations.', 3, 'Environmental and industrial consultancy, plus skilled personnel — engineers, waste management staff and documentation teams — for the oil & gas sector.', '/images/consultancy-meeting.jpg', 'Our consultancy', '/offers/consultancy', 1, true, now(), now()),
  (gen_random_uuid()::text, 'Procurement', 'Procurement for Oil & Gas', 'The supply chain', 'that keeps you', 'operating.', 3, 'Marine vessel, water, labour and fuel supply — plus valves, flanges and coated pipes, delivered to site.', '/images/crane-container.jpg', 'Procurement offers', '/offers/procurement', 2, true, now(), now())
) AS v
WHERE NOT EXISTS (SELECT 1 FROM "HeroSlide");

-- 3) Default values (only if none yet)
INSERT INTO "CoreValue" (id, name, body, images, "order", published, "createdAt", "updatedAt")
SELECT * FROM (VALUES
  (gen_random_uuid()::text, 'Speed', 'We prioritize agility, efficiency, and proactive problem-solving to ensure timely and responsive service delivery.', ARRAY['/images/crane-container.jpg', '/images/tanker.jpg', '/images/cranes-lift.jpg']::TEXT[], 0, true, now(), now()),
  (gen_random_uuid()::text, 'Efficiency', 'We optimize resources, minimize waste, and continuously improve our processes to deliver maximum value with minimal effort.', ARRAY['/images/tug-barge.jpg', '/images/deck-equipment.jpg', '/images/barge-tanks.jpg']::TEXT[], 1, true, now(), now()),
  (gen_random_uuid()::text, 'Dependability', 'We strive for consistent quality, take responsibility for our commitments, and maintain open communication to build lasting trust with our clients.', ARRAY['/images/crew-briefing.jpg', '/images/houseboat.jpg', '/images/tug-angel-vi.jpg']::TEXT[], 2, true, now(), now()),
  (gen_random_uuid()::text, 'Commitment', 'We are dedicated to client satisfaction, employee growth, and ethical conduct in all our business endeavors.', ARRAY['/images/port-traffic.jpg', '/images/tug-barge.jpg', '/images/crew-briefing.jpg']::TEXT[], 3, true, now(), now()),
  (gen_random_uuid()::text, 'Quality Management', 'We pursue excellence in all aspects of our work, continuously seek feedback, and prioritize client satisfaction to deliver exceptional service.', ARRAY['/images/boat-cabin.jpg', '/images/houseboat.jpg', '/images/deck-equipment.jpg']::TEXT[], 4, true, now(), now())
) AS v
WHERE NOT EXISTS (SELECT 1 FROM "CoreValue");

-- 4) Admin permission for the new Page Content section
INSERT INTO "Permission" (id, name, path, "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Page Content', '/admin/content', now(), now())
ON CONFLICT (path) DO NOTHING;

COMMIT;

-- Check: should list 3 slides and 5 values
SELECT 'slides' AS what, count(*) FROM "HeroSlide" UNION ALL SELECT 'values', count(*) FROM "CoreValue";

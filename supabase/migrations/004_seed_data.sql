-- ═══════════════════════════════════════════════════════════════════
-- Vi Smart Learning Education — Seed Data
-- Run AFTER all schema + RLS migrations
-- ═══════════════════════════════════════════════════════════════════

insert into public.batches (
  slug, title, subtitle, category, stream,
  class_level, price, original_price,
  thumbnail_url, banner_url,
  subjects, badge, is_featured,
  has_live_classes, has_recorded_lectures,
  has_notes, duration_months,
  teacher_name, language
) values
(
  'class-12-science-2025',
  'Class 12th Science Batch',
  'CBSE Board · 2024-25',
  'class-12', 'Science', '12',
  5000, 8000,
  '/images/preview-class12th-batch.png',
  '/images/banner-class12th-batch.png',
  ARRAY['Physics','Chemistry','Mathematics','Biology'],
  'POPULAR', true, true, true, true, 12,
  'Vi Smart Faculty', 'Hindi + English'
),
(
  'class-12-commerce-2025',
  'Class 12th Commerce Batch',
  'CBSE Board · 2024-25',
  'class-12', 'Commerce', '12',
  5000, 8000,
  '/images/preview-class12th-batch-Accountancy.png',
  '/images/banner-class12th-batch-Accountancy.png',
  ARRAY['Accountancy','Business Studies','Economics','Mathematics'],
  'POPULAR', true, true, true, true, 12,
  'Vi Smart Faculty', 'Hindi'
),
(
  'class-11-science-2025',
  'Class 11th Science Batch',
  'CBSE Board · 2024-25',
  'class-11', 'Science', '11',
  5000, 8000,
  '/images/preview-class11th-batch.png',
  '/images/banner-class12th-batch.png',
  ARRAY['Physics','Chemistry','Mathematics','Biology'],
  'NEW', true, true, true, true, 12,
  'Vi Smart Faculty', 'Hindi + English'
),
(
  'class-11-commerce-2025',
  'Class 11th Commerce Batch',
  'CBSE Board · 2024-25',
  'class-11', 'Commerce', '11',
  5000, 8000,
  '/images/preview-class12th-batch-Accountancy.png',
  '/images/banner-class12th-batch-Accountancy.png',
  ARRAY['Accountancy','Business Studies','Economics','Mathematics'],
  'NEW', false, true, true, true, 12,
  'Vi Smart Faculty', 'Hindi'
),
(
  'class-9-10-2025',
  'Class 9th & 10th Batch',
  'CBSE Board · 2024-25',
  'class-9-10', 'All Subjects', '9-10',
  4000, 6000,
  '/images/preview-class11th-batch.png',
  '/images/banner-class12th-batch.png',
  ARRAY['Mathematics','Science','English','Social Science'],
  'POPULAR', false, true, true, true, 12,
  'Vi Smart Faculty', 'Hindi + English'
),
(
  'tally-gst-course',
  'Tally Prime ERP9 + GST Filing',
  'Professional Accounting Course',
  'accounting', 'Accounting', 'graduate',
  3000, 5000,
  '/images/preview-class12th-batch-Accountancy.png',
  '/images/banner-class12th-batch-Accountancy.png',
  ARRAY['Tally Prime ERP9','GST Filing','Registration'],
  'HOT', false, false, true, true, 3,
  'Vi Smart Faculty', 'Hindi'
);

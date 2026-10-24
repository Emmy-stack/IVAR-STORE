-- Keep existing installations aligned with the upload validation limits.
UPDATE storage.buckets
SET public = true, file_size_limit = 15728640
WHERE id = 'account-images';

UPDATE storage.buckets
SET public = true, file_size_limit = 104857600
WHERE id = 'hero-media';

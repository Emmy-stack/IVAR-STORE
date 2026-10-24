import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  getAccountByIdAdmin,
  createAccount,
  updateAccount,
  deleteAccount,
  getNextProductId,
  generateSlug,
} from '@/lib/services/account-service';
import {
  validateUploadMetadata,
  uploadFile,
  removeStoredAccountImages,
} from '@/lib/services/storage-service';
import { ADMIN_EMAIL } from '@/lib/clerk-config';

const LOCAL_DB_PATH = path.join(process.cwd(), 'src/lib/data/local-db.json');

test.describe('IVAR STORE Admin Dashboard Integration Tests', () => {
  let dbBackup: string | null = null;

  test.before(async () => {
    // Backup local DB if it exists so we can guarantee existing data preservation
    try {
      dbBackup = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    } catch {
      dbBackup = null;
    }
  });

  test.after(async () => {
    // Restore local DB exactly as it was
    if (dbBackup !== null) {
      await fs.writeFile(LOCAL_DB_PATH, dbBackup, 'utf-8');
    }
  });

  test.describe('1. Security & Admin Verification', () => {
    test('enforces socialmeda03@gmail.com as the only authorized admin email', () => {
      assert.equal(ADMIN_EMAIL, 'socialmeda03@gmail.com');
    });

    test('validates image uploads allow only supported image formats under 15MB', () => {
      // Valid formats
      assert.doesNotThrow(() => {
        validateUploadMetadata('image/jpeg', 1024 * 1024, 'account-images');
      });
      assert.doesNotThrow(() => {
        validateUploadMetadata('image/png', 5 * 1024 * 1024, 'account-images');
      });
      assert.doesNotThrow(() => {
        validateUploadMetadata('image/webp', 2 * 1024 * 1024, 'account-images');
      });

      // Unsupported format (e.g. GIF, PDF, HTML)
      assert.throws(
        () => {
          validateUploadMetadata('image/gif', 1024, 'account-images');
        },
        /Unsupported image format/
      );
      assert.throws(
        () => {
          validateUploadMetadata('application/pdf', 1024, 'account-images');
        },
        /Unsupported image format/
      );

      // Oversized files (> 15MB)
      assert.throws(
        () => {
          validateUploadMetadata('image/png', 16 * 1024 * 1024, 'account-images');
        },
        /Image file size exceeds maximum 15MB limit/
      );

      // Empty file
      assert.throws(
        () => {
          validateUploadMetadata('image/jpeg', 0, 'account-images');
        },
        /selected file is empty/
      );
    });
  });

  test.describe('2. Product Querying & ID Resolution', () => {
    test('loads existing product by canonical UUID', async () => {
      const account = await getAccountByIdAdmin('a1000000-0000-0000-0000-000000000001');
      assert.ok(account, 'Account should be found by UUID');
      assert.equal(account.product_id, 'IVAR-FF-0001');
      assert.ok(account.images.length > 0, 'Images should be loaded');
      assert.ok(account.price > 0, 'Price should be loaded');
      assert.ok(account.rare_skins.length > 0, 'Rare skins should be loaded');
    });

    test('loads existing product by custom Product ID (e.g. IVAR-FF-0001)', async () => {
      // Crucial fix: Passing "IVAR-FF-0001" must NOT crash PostgreSQL with invalid input syntax for type uuid
      const account = await getAccountByIdAdmin('IVAR-FF-0001');
      assert.ok(account, 'Account should be found by Product ID string');
      assert.equal(account.id, 'a1000000-0000-0000-0000-000000000001');
      assert.equal(account.product_id, 'IVAR-FF-0001');
      assert.equal(account.status, 'available');
    });

    test('generates valid, URL-safe slugs with product ID suffix', () => {
      const slug = generateSlug('Level 85 Grandmaster | AK47 Draco Max', 'IVAR-FF-0001');
      assert.ok(slug.endsWith('-ivar-ff-0001'));
      assert.ok(!slug.includes(' '));
      assert.ok(!slug.includes('|'));
    });
  });

  test.describe('3. Product Editing & Image Management', () => {
    test('updates account fields, replaces images, updates primary image, and persists', async () => {
      const targetId = 'a1000000-0000-0000-0000-000000000001';
      const original = await getAccountByIdAdmin(targetId);
      assert.ok(original);

      const updatedPrice = original.price + 5000;
      const updatedTitle = original.title + ' [Updated for Test]';
      const newImages = [
        {
          storage_path: '/uploads/account-images/test-new-thumb.webp',
          sort_order: 0,
          is_primary: true,
        },
        {
          storage_path: original.images[0]?.storage_path || '/images/sample-acc-1.jpg',
          sort_order: 1,
          is_primary: false,
        },
      ];

      const updated = await updateAccount(targetId, {
        title: updatedTitle,
        price: updatedPrice,
        rank: 'Heroic',
        level: 88,
        description: 'Updated test description with verified details.',
        rare_skins: ['Updated Skin A', 'Updated Skin B'],
        status: 'reserved',
        images: newImages,
      });

      assert.equal(updated.title, updatedTitle);
      assert.equal(updated.price, updatedPrice);
      assert.equal(updated.rank, 'Heroic');
      assert.equal(updated.level, 88);
      assert.equal(updated.status, 'reserved');
      assert.equal(updated.images.length, 2);
      assert.equal(updated.images[0].is_primary, true);
      assert.equal(updated.images[0].storage_path, '/uploads/account-images/test-new-thumb.webp');

      // Re-fetch to ensure persistence
      const refetched = await getAccountByIdAdmin(targetId);
      assert.ok(refetched);
      assert.equal(refetched.price, updatedPrice);
      assert.equal(refetched.status, 'reserved');
      assert.equal(refetched.images[0].storage_path, '/uploads/account-images/test-new-thumb.webp');
    });

    test('updating via custom product ID (e.g. IVAR-FF-0001) resolves correctly', async () => {
      const updated = await updateAccount('IVAR-FF-0001', {
        status: 'available',
      });
      assert.equal(updated.status, 'available');
      const refetched = await getAccountByIdAdmin('IVAR-FF-0001');
      assert.equal(refetched?.status, 'available');
    });
  });

  test.describe('4. Product Deletion & Cascade', () => {
    test('creates and then deletes a product, ensuring complete removal from database', async () => {
      const nextId = await getNextProductId();
      const testAccount = await createAccount({
        product_id: nextId,
        title: 'Temporary Test Account For Deletion',
        description: 'Will be deleted in automated test.',
        price: 25000,
        level: 50,
        rank: 'Diamond',
        status: 'available',
        published: true,
        images: [
          {
            storage_path: '/uploads/account-images/temp-delete-test.jpg',
            sort_order: 0,
            is_primary: true,
          },
        ],
      });

      assert.ok(testAccount.id);
      assert.equal(testAccount.product_id, nextId);

      // Verify it exists in admin queries
      const found = await getAccountByIdAdmin(testAccount.id);
      assert.ok(found);

      // Delete by ID
      await deleteAccount(testAccount.id);

      // Verify it no longer exists
      const afterDelete = await getAccountByIdAdmin(testAccount.id);
      assert.equal(afterDelete, null, 'Deleted account must not be found');

      // Verify it is not found by product ID either
      const afterDeleteByPid = await getAccountByIdAdmin(nextId);
      assert.equal(afterDeleteByPid, null, 'Deleted account must not be found by product ID');
    });

    test('deleting via product_id string removes record correctly', async () => {
      const nextId = await getNextProductId();
      const testAccount = await createAccount({
        product_id: nextId,
        title: 'Temporary Test Account 2 For Deletion By PID',
        description: 'Will be deleted via product_id in test.',
        price: 30000,
        level: 60,
        rank: 'Heroic',
        status: 'available',
        published: true,
        images: [],
      });

      assert.ok(testAccount.id);

      // Delete using the custom product ID string instead of UUID
      await deleteAccount(nextId);

      // Verify removal
      const check = await getAccountByIdAdmin(testAccount.id);
      assert.equal(check, null);
    });
  });

  test.describe('5. Image Upload & Persistent Storage', () => {
    test('uploadFile persists file to storage and returns public URL', async () => {
      const testBuffer = Buffer.from('FAKE-JPEG-DATA-FOR-TESTING');
      const testFile = new File([testBuffer], 'test-unit-upload.jpg', {
        type: 'image/jpeg',
      });

      const result = await uploadFile(testFile, 'account-images');
      assert.ok(result.url, 'Upload must return a public URL');
      assert.ok(result.storagePath, 'Upload must return a storage path');
      assert.ok(
        result.url.startsWith('http://') ||
        result.url.startsWith('https://') ||
        result.url.startsWith('/uploads/account-images/'),
        'URL must be an absolute URL or persistent uploads URL'
      );

      // Verify file is not a temporary blob: or file: URL
      assert.ok(!result.url.startsWith('blob:'));
      assert.ok(!result.url.startsWith('file:'));

      // Test cleanup
      await removeStoredAccountImages([result.storagePath]);
    });
  });
});

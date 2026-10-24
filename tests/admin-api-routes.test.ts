import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { PUT as updateAccountRoute, DELETE as deleteAccountRoute } from '@/app/api/admin/accounts/[id]/route';
import { POST as uploadRoute } from '@/app/api/admin/upload/route';
import { requireAdmin, AuthError } from '@/lib/auth';

test.describe('Admin API Route Security & Validation Tests', () => {
  test.describe('1. Unauthorized Access Protection', () => {
    test('unauthenticated direct requests to PUT /api/admin/accounts/[id] are blocked with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/accounts/test-id', {
        method: 'PUT',
        body: JSON.stringify({
          account: { title: 'Hacked Title' },
        }),
      });

      const res = await updateAccountRoute(req, {
        params: Promise.resolve({ id: 'test-id' }),
      });

      assert.ok(res.status === 401 || res.status === 403, `Expected 401 or 403, got ${res.status}`);
      const body = await res.json();
      assert.ok(body.error, 'Should return error message');
    });

    test('unauthenticated direct requests to DELETE /api/admin/accounts/[id] are blocked with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/accounts/test-id', {
        method: 'DELETE',
      });

      const res = await deleteAccountRoute(req, {
        params: Promise.resolve({ id: 'test-id' }),
      });

      assert.ok(res.status === 401 || res.status === 403, `Expected 401 or 403, got ${res.status}`);
      const body = await res.json();
      assert.ok(body.error, 'Should return error message');
    });

    test('unauthenticated direct requests to POST /api/admin/upload are blocked with 401', async () => {
      const formData = new FormData();
      formData.append('file', new File(['dummy'], 'test.png', { type: 'image/png' }));
      formData.append('bucket', 'account-images');

      const req = new NextRequest('http://localhost:3000/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadRoute(req);
      assert.ok(res.status === 401 || res.status === 403, `Expected 401 or 403, got ${res.status}`);
      const body = await res.json();
      assert.ok(body.error, 'Should return error message');
    });
  });

  test.describe('2. AuthError Status Propagation', () => {
    test('requireAdmin throws 401 or 403 when caller is not verified socialmeda03@gmail.com', async () => {
      await assert.rejects(
        async () => {
          await requireAdmin();
        },
        (err: unknown) => {
          assert.ok(err instanceof AuthError);
          assert.ok(err.status === 401 || err.status === 403);
          return true;
        }
      );
    });
  });
});

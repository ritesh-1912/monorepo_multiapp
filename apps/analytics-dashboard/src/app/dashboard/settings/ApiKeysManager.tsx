'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@repo/ui';
import { useToast } from '@repo/ui/toast';

type KeyRow = { id: string; keyPrefix: string; createdAt: string };

export function ApiKeysManager({
  initialKeys,
  userEmail,
  role,
  isAdmin,
  showSeedButton,
}: {
  initialKeys: KeyRow[];
  userEmail: string;
  role: string;
  isAdmin: boolean;
  showSeedButton?: boolean;
}) {
  const [keys, setKeys] = useState(initialKeys);
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const { toast } = useToast();

  function handleCreate() {
    setCreating(true);
    setNewKey(null);
    fetch('/api/api-keys', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        if (d.key) {
          setNewKey(d.key);
          setKeys((k) => [
            ...k,
            { id: 'new', keyPrefix: d.keyPrefix, createdAt: new Date().toISOString() },
          ]);
          toast('API key created. Copy it now; it won’t be shown again.', 'success');
        } else throw new Error(d.error ?? 'Failed');
      })
      .catch(() => toast('Failed to create key', 'error'))
      .finally(() => setCreating(false));
  }

  function handleSeedDemo() {
    setSeeding(true);
    fetch('/api/seed', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          toast('Demo data seeded. Refresh the dashboard to see it.', 'success');
          window.location.href = '/dashboard';
        } else throw new Error(d.error ?? 'Failed');
      })
      .catch(() => toast('Failed to seed demo data', 'error'))
      .finally(() => setSeeding(false));
  }

  function handleRevoke(id: string) {
    if (!confirm('Revoke this key? It will stop working immediately.')) return;
    fetch(`/api/api-keys/${id}`, { method: 'DELETE' })
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        setKeys((k) => k.filter((x) => x.id !== id));
        toast('Key revoked', 'success');
      })
      .catch(() => toast('Failed to revoke', 'error'));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API keys</CardTitle>
        <p className="text-sm text-muted-foreground">
          Signed in as {userEmail || 'unknown'} · Role:{' '}
          <span className="font-medium">{role || 'viewer'}</span>
          <br />
          {isAdmin
            ? 'Use keys to call the public API (e.g. GET /api/v1/metrics). Pass as Authorization: Bearer <key>.'
            : 'Only admins can create API keys.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSeedButton && (
          <div className="flex items-center gap-3 rounded border border-border bg-muted/20 p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Demo data</p>
              <p className="text-xs text-muted-foreground">
                Populate the dashboard with sample metrics so it looks complete.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSeedDemo} loading={seeding}>
              Seed demo data
            </Button>
          </div>
        )}
        <Button onClick={handleCreate} loading={creating}>
          Create API key
        </Button>
        {newKey && (
          <div className="rounded border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-1">New key (copy now):</p>
            <code className="block break-all text-sm">{newKey}</code>
          </div>
        )}
        {keys.length === 0 && !newKey ? (
          <p className="text-muted-foreground">No API keys yet.</p>
        ) : (
          <ul className="space-y-2">
            {keys.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between rounded border border-border px-3 py-2"
              >
                <code className="text-sm">{k.keyPrefix}…</code>
                {k.id !== 'new' && (
                  <Button variant="ghost" size="sm" onClick={() => handleRevoke(k.id)}>
                    Revoke
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

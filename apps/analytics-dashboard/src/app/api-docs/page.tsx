/**
 * API docs page: embeds Swagger UI for the OpenAPI spec.
 */
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/openapi')
      .then((r) => r.json())
      .then(setSpec)
      .catch(() => setSpec(null));
  }, []);

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading API spec…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SwaggerUI spec={spec} />
    </div>
  );
}

declare module 'swagger-ui-react' {
  import type { ComponentType } from 'react';
  interface SwaggerUIProps {
    spec: Record<string, unknown>;
  }
  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}

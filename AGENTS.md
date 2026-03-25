# AGENTS.md - VDS Seeder Project

## Project Overview

Next.js application for seeding data via API with flexible generation strategies. Uses OpenIddict (ABP Framework) for authentication via PKCE flow.

## Build Commands

```bash
# Development
npm run dev

# Production build (runs lint + typecheck)
npm run build

# Start production server
npm start

# Lint only
npm run lint
```

**Always run `npm run build` after changes** to verify lint and typecheck pass.

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
├── components/       # React components (PascalCase.tsx)
├── lib/              # Services and utilities (kebab-case.ts)
└── types/            # TypeScript interfaces and enums (kebab-case.ts)
```

## Code Style

### Imports
- Use `@/` path alias for all imports from `src/`
- Group imports: React → Third-party → Local types → Local services → Components
```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';
import { VDSEventData } from '@/types/vds-event';
import { apiService } from '@/lib/api';
import Settings from '@/components/Settings';
```

### Components
- `'use client'` directive for client components
- Default exports for pages and components
- Use `function` keyword (not arrow functions) for components

### Types & Interfaces
- PascalCase for interfaces, enums, types
- Inline types for simple props
- Separate files for complex domain types
```typescript
interface FieldConfig {
  name: keyof VDSEventData;
  label: string;
  type: 'enum' | 'string' | 'number' | 'date';
  required: boolean;
}
```

### Naming Conventions
- Variables/functions: camelCase
- Constants (module-level): UPPER_SNAKE_CASE
- Components/files: PascalCase
- API services: singleton pattern (`export const apiService = new ApiService()`)

### State & Hooks
- Use `useState` with explicit initial values
- `useEffect` with proper dependency arrays
- Async functions in event handlers with try/catch

### Error Handling
```typescript
try {
  const response = await apiService.seed(data);
  if (!response.success) {
    setResult({ success: false, message: response.error });
    return;
  }
} catch (error) {
  const message = error instanceof Error ? error.message : 'Operation failed';
  setResult({ success: false, message });
}
```

### Styling
- Tailwind CSS classes inline
- Use `@/` for imports in Tailwind config (already configured)
- Use `cn()` pattern if needed for conditional classes

## Key Libraries
- **Next.js 16.x** - App Router, Turbopack
- **React 19** - Client components
- **Axios** - HTTP client
- **@faker-js/faker** - Fake data generation
- **Tailwind CSS 3.x** - Styling

## Notes
- No test framework configured; verify changes via `npm run build`
- Browser-based PKCE auth; tokens stored in httpOnly cookies
- Enum values are numeric (match C# backend)

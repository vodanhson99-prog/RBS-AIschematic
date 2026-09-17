---
name: shadcn
description: Guidelines, best practices, and component recipes for building accessible and modern UIs with Shadcn UI, Tailwind CSS, and Radix Primitives. Use when adding, customizing, or styling Shadcn components.
---

# Shadcn UI Best Practices & Guidelines

## Core Principles
1. **Component Copy-Paste Model**: Components live directly in `src/components/ui/` and can be customized freely.
2. **Tailwind & CSS Variables**: Use semantic color variables (`bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, `bg-primary`, etc.) for automatic dark mode support.
3. **Radix Primitives**: Maintain accessibility (ARIA roles, keyboard navigation, focus management) provided by Radix primitives.
4. **`cn()` Utility**: Always merge class names using `clsx` and `tailwind-merge` via `@/lib/utils`.

## Component Conventions
- Place reusable building blocks in `@/components/ui/`.
- Extend component variants using `class-variance-authority` (cva).
- Ensure forward refs are properly configured on interactive elements.

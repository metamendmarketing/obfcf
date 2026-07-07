# Audit Strategy Template - Architecture Overview

## Core Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Custom CSS Variables
- **State Management:** Zustand (with IndexedDB Persistence)
- **Export Engine:** html2canvas + jsPDF
- **Icons:** Lucide React

## Application Flow

1. **Dashboard (`src/app/(main)/dashboard/page.tsx`)**
   - Entry point for users to manage audits and templates.
   - Fetches audit metadata from global state.

2. **Editor (`src/app/audits/[id]/edit/page.tsx`)**
   - The primary workspace.
   - **Left Sidebar (`SidebarSortables.tsx`)**: Draggable tree of pages and findings. Supports dynamic reorganization using `@dnd-kit`.
   - **Center Canvas (`LivePreview.tsx`)**: WYSIWYG A4 canvas that strictly mirrors the final PDF output. Scales down to fit smaller viewports without breaking aspect ratio.
   - **Right Panel**: Contextual property editors (e.g., `FindingEntryForm`, `BlockEditor`).

3. **Presentation Mode (`src/app/audits/[id]/present/page.tsx`)**
   - A full-screen slider presentation generated dynamically from the same underlying data structure.
   - Implements interactive scrubbing and quick-jump navigation.

## State Management (`src/lib/store.ts`)
The application relies heavily on a centralized **Zustand** store.
- **Persistence:** By default, Zustand's `persist` middleware uses `localStorage`. Because the application stores heavy base64 strings and rich text HTML, it frequently exceeds the 5MB quota. Therefore, the store is wrapped with a custom adapter (`idb-keyval`) to persist directly to IndexedDB.
- **Data Model:**
  - `Audit`: The top-level document, contains an array of `pages`.
  - `Finding`: Represent issues or opportunities. Previously coupled to static stages, they are now dynamically attached to audits and can be drag-and-dropped.

## The Rendering & Export Engine (`LivePreview.tsx`)

### The WYSIWYG Challenge
The app guarantees that **what you see in the editor is exactly what exports to the PDF.**
- The `LivePreview` strictly enforces a fixed width (e.g., `794px` or `1123px` for A4 at 96 DPI).
- CSS `transform: scale(...)` is used to fit the canvas on the screen.

### The PDF Pipeline (`src/app/audits/[id]/report/page.tsx`)
Because standard browser printing strips background graphics and manipulates layout, the app uses a canvas-based approach:
1. Render all pages consecutively in a hidden DOM element.
2. Use `html2canvas` to take a literal screenshot of each page node.
3. Inject the resulting images into `jsPDF` to compile a multi-page document.

> **Important Constraint:** `html2canvas` does not natively support Next.js `<Image />` tags due to how they are processed and lazy-loaded. The codebase MUST use standard HTML `<img>` elements. The `@next/next/no-img-element` ESLint rule is disabled intentionally.

## Key Directories
- `src/components/audit/`: Legacy and core layout components (Findings, Overviews).
- `src/components/blocks/`: Modular page components (Hero headers, Text blocks, Data panels).
- `src/components/editor/`: UI elements exclusively used for configuration in edit mode.
- `src/components/ui/`: Shared atomic components (Buttons, Inputs, RichTextEditor).
- `src/lib/templates/`: Default boilerplate configurations for new audits (e.g., Valtir, Everest).

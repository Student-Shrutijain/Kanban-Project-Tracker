# Multi-View Project Tracker UI

This is a modern, high-performance project tracker application designed without external UI, drag-and-drop, or virtual scrolling libraries.

## 🚀 Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Run Development Server:**
   ```bash
   npm run dev
   ```
3. **Build for Production:**
   ```bash
   npm run build
   ```

## 🏗 State Management Decision

We chose **Zustand** over React Context + useReducer for state management. Zustand offers significant performance benefits by allowing components to select strictly the slices of state they need, avoiding unnecessary re-renders. A single unified store (`useStore.ts`) effortlessly handles the heavily interconnected data context (e.g., tasks lists, active view mode, URL-synced filters, and local simulation of active users) with minimal boilerplate.

## 📜 Virtual Scrolling Implementation

The custom virtual scroller (`useVirtualScroll.ts`) is designed for maximum performance when rendering over 500 tasks. 
It operates by tracking the container's `scrollTop`. Based on the `itemHeight`, it computes the `startIndex` and `endIndex` of the visible data window. To prevent white flashes during rapid scrolling, a buffer of 5 items is added symmetrically around the window. 
The inner container is sized to the `totalItems * itemHeight` to allow natural browser scrollbars, and the subset of visible task rows are absolutely positioned using calculated `offsetTop` values.

## 🎯 Drag-and-Drop Approach

We implemented a native HTML5 Drag and Drop (`draggable={true}`) system in the Kanban board.
When a task drag starts (`onDragStart`), we grab the task's ID and stash it into local state (`draggedTaskId`). We immediately append a custom translucent, rotated "ghost" clone.
To solve layout shifting, the original card in the column is conditionally rendered as a transparent placeholder (`isPlaceholder`) matching the same physical dimensions. When dragging over distinct column drop zones, the target column receives highlight styling based on `dragOverColumnId`.

## 📸 Lighthouse Performance

*(Insert your Lighthouse Desktop Performance Screenshot here)*

---

## 📝 Explanation (150-250 words)

The hardest UI problem to solve was harmonizing the native HTML5 drag-and-drop mechanics with React's rapid state updates without causing layout-thrashing or phantom cursor tracking. To ensure a smooth experience and prevent the UI from violently reflowing during the drag, we employed a dedicated "placeholder" state. As soon as a card is picked up, rather than unmounting it, we swap its renderer to a dotted-outline placeholder of identical height. This rigidly preserves the vertical scroll height of the source column.

Simultaneously, we construct a rotated, slightly transparent ghost clone of the dragged element, attach it to the `dataTransfer.setDragImage()`, and strip the original card to keep the column visually intact. Valid drop zones detect `onDragOver` and illuminate with a subtle tint.

If given more time to refactor, we would abstract the Kanban drag-and-drop logic entirely away from HTML5 DND toward a strict Pointer Events architecture (`onPointerDown`, `onPointerMove`). HTML5 DND natively lacks granular control over custom snap-back animations when a drop is canceled. Pointer events provide complete frame-by-frame control to inject spring physics or Framer Motion transitions, resulting in an exponentially smoother "snap-to-origin" experience.

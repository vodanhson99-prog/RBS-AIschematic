import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  CircuitComponent,
  CircuitActionLog,
  CanvasViewport,
} from '../types/circuit';

interface CircuitState {
  // Canvas & Components
  components: CircuitComponent[];
  selectedComponentId: string | null;
  viewport: CanvasViewport;
  
  // Event Sourcing & Audit Log
  actionLogs: CircuitActionLog[];

  // Actions
  addComponent: (component: CircuitComponent, logReason?: string) => void;
  removeComponent: (instanceId: string) => void;
  updateComponentPosition: (instanceId: string, x: number, y: number) => void;
  updateComponentRotation: (instanceId: string) => void;
  updateComponentAttributes: (instanceId: string, attributes: Record<string, any>) => void;
  selectComponent: (instanceId: string | null) => void;
  
  // Viewport Actions
  setViewportPan: (x: number, y: number) => void;
  setViewportZoom: (zoom: number) => void;
  adjustZoom: (factor: number, center?: { x: number; y: number }) => void;
  resetViewport: () => void;
  
  // Canvas Reset
  clearCanvas: () => void;
}

const INITIAL_VIEWPORT: CanvasViewport = {
  zoom: 1,
  pan: { x: 0, y: 0 },
};

export const useCircuitStore = create<CircuitState>()(
  immer((set) => ({
    components: [],
    selectedComponentId: null,
    viewport: INITIAL_VIEWPORT,
    actionLogs: [],

    addComponent: (component, logReason = 'User manual placement') =>
      set((state) => {
        const comp = {
          ...component,
          id: component.id || component.instanceId,
          instanceId: component.instanceId || component.id || `comp_${Date.now()}`,
          modelId: component.modelId || (component as any).type || 'generic',
          type: (component as any).type || component.modelId,
          properties: component.properties || component.attributes || {},
          attributes: component.attributes || component.properties || {},
        };
        state.components.push(comp);
        state.selectedComponentId = comp.instanceId;

        // Append to Audit Log per PRD Section 6.2
        state.actionLogs.push({
          logId: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: new Date().toISOString(),
          actionType: 'ADD_COMPONENT',
          details: {
            target: comp.instanceId,
            reason: logReason,
          },
        });
      }),

    removeComponent: (targetId) =>
      set((state) => {
        const index = state.components.findIndex(
          (c) => c.instanceId === targetId || c.id === targetId
        );
        if (index !== -1) {
          const removed = state.components[index];
          state.components.splice(index, 1);
          if (state.selectedComponentId === targetId) {
            state.selectedComponentId = null;
          }

          state.actionLogs.push({
            logId: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            timestamp: new Date().toISOString(),
            actionType: 'REMOVE_COMPONENT',
            details: {
              target: removed.instanceId || removed.id || targetId,
              reason: 'User deleted component',
            },
          });
        }
      }),

    updateComponentPosition: (targetId, x, y) =>
      set((state) => {
        const comp = state.components.find(
          (c) => c.instanceId === targetId || c.id === targetId
        );
        if (comp) {
          comp.x = Math.round(x);
          comp.y = Math.round(y);
        }
      }),

    updateComponentRotation: (targetId) =>
      set((state) => {
        const comp = state.components.find(
          (c) => c.instanceId === targetId || c.id === targetId
        );
        if (comp) {
          comp.rotation = (comp.rotation + 90) % 360;
        }
      }),

    updateComponentAttributes: (targetId, attributes) =>
      set((state) => {
        const comp = state.components.find(
          (c) => c.instanceId === targetId || c.id === targetId
        );
        if (comp) {
          comp.attributes = { ...comp.attributes, ...attributes };
          comp.properties = { ...comp.properties, ...attributes };
        }
      }),

    selectComponent: (instanceId) =>
      set((state) => {
        state.selectedComponentId = instanceId;
      }),

    setViewportPan: (x, y) =>
      set((state) => {
        state.viewport.pan = { x, y };
      }),

    setViewportZoom: (zoom) =>
      set((state) => {
        state.viewport.zoom = Math.min(Math.max(zoom, 0.25), 2.8);
      }),

    adjustZoom: (factor, center) =>
      set((state) => {
        const oldZoom = state.viewport.zoom;
        const newZoom = Math.min(Math.max(oldZoom * factor, 0.25), 2.8);
        if (center) {
          state.viewport.pan.x = center.x - (center.x - state.viewport.pan.x) * (newZoom / oldZoom);
          state.viewport.pan.y = center.y - (center.y - state.viewport.pan.y) * (newZoom / oldZoom);
        }
        state.viewport.zoom = newZoom;
      }),

    resetViewport: () =>
      set((state) => {
        state.viewport = { ...INITIAL_VIEWPORT };
      }),

    clearCanvas: () =>
      set((state) => {
        state.components = [];
        state.selectedComponentId = null;
        state.actionLogs.push({
          logId: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: new Date().toISOString(),
          actionType: 'REMOVE_COMPONENT',
          details: {
            target: 'ALL_COMPONENTS',
            reason: 'Cleared entire canvas',
          },
        });
      }),
  }))
);

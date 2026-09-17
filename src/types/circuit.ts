/**
 * AI Virtual Circuit Studio - Core Schemas (PRD v1.0.0 Section 6)
 */

export type ComponentType = string;

export type PinType =
  | 'VCC'
  | 'GND'
  | 'DIGITAL'
  | 'ANALOG'
  | 'PWM'
  | 'I2C_SDA'
  | 'I2C_SCL'
  | 'PASSIVE'
  | 'power'
  | 'gnd'
  | 'digital'
  | 'analog'
  | 'pwm'
  | 'passive';

export interface Pin {
  id: string;
  label: string;
  name: string;
  type: PinType;
  voltageRating?: number;
  position?: { x: number; y: number };
  x: number;
  y: number;
  description?: string;
}

export interface CircuitComponent {
  instanceId: string; // PRD 6.1
  id: string; // alias
  modelId: string; // PRD 6.1
  type: string; // alias
  name: string;
  x: number;
  y: number;
  rotation: number;
  pins: Pin[];
  attributes: Record<string, any>; // PRD 6.1
  properties: Record<string, any>; // alias
}

export interface WireConnection {
  connectionId: string;
  from: {
    componentId: string;
    pinId: string;
  };
  to: {
    componentId: string;
    pinId: string;
  };
  wireColor: string;
  status: 'VALID' | 'WARNING' | 'ERROR';
  createdAt: number;
}

// Wire interface alias for backwards compatibility
export interface Wire {
  id: string;
  fromCompId: string;
  fromPinId: string;
  toCompId: string;
  toPinId: string;
  color: string;
  createdAt: number;
  waypoints?: Array<{ x: number; y: number }>;
}

export type ActionType =
  | 'ADD_COMPONENT'
  | 'REMOVE_COMPONENT'
  | 'CONNECT_WIRE'
  | 'DISCONNECT_WIRE'
  | 'MOVE_COMPONENT';

export interface CircuitActionLog {
  logId: string;
  timestamp: string;
  actionType: ActionType;
  details: {
    target: string;
    fromPin?: string;
    toPin?: string;
    reason?: string;
  };
}

// LogEntry alias for existing log components
export interface LogEntry {
  id: string;
  timestamp: string;
  action: 'add_wire' | 'remove_wire' | 'change_color' | 'add_component' | 'remove_component' | 'ai_generated' | 'warning' | 'clear';
  message: string;
  detail?: string;
  wireId?: string;
}

export interface CanvasViewport {
  zoom: number;
  pan: { x: number; y: number };
}

export interface ComponentBlueprint {
  modelId: string;
  name: string;
  category: 'controller' | 'board' | 'output' | 'passive' | 'input' | 'sensor';
  description: string;
  defaultAttributes?: Record<string, any>;
  dimensions: { width: number; height: number };
  pins: Pin[];
}

export interface PinSuggestion {
  targetCompId: string;
  targetPinId: string;
  targetCompName: string;
  targetPinName: string;
  reason: string;
  safe: boolean;
  recommendedColor: string;
  voltageNote?: string;
}

export interface AISchematicRecipe {
  id: string;
  title: string;
  category: string;
  promptSample: string;
  description: string;
  components: Array<{
    id: string;
    type: string;
    name: string;
    x: number;
    y: number;
    properties?: Record<string, any>;
  }>;
  wires: Array<{
    fromCompId: string;
    fromPinId: string;
    toCompId: string;
    toPinId: string;
    color: string;
    note?: string;
  }>;
  steps: string[];
}

export interface SimulationState {
  isRunning: boolean;
  activeLeds: Record<string, boolean>;
  buzzerActive: boolean;
  buzzerFrequency: number;
  servoAngle: number;
  distanceVal: number;
  potVoltage: number;
  ldrLightLevel?: number;
  motionDetected?: boolean;
  buttonPressed?: boolean;
}


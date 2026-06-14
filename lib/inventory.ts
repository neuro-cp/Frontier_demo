// lib/inventory.ts

export type InventoryItem = {
  name: string;
  currentQty: number;
  targetQty: number;
  warning: boolean;
  workspaceId: string;
};

export const inventory: InventoryItem[] = [
  // LANDSCAPING

  {
    name: "Gasoline (gallons)",
    currentQty: 20,
    targetQty: 40,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Mulch (cubic yards)",
    currentQty: 12,
    targetQty: 50,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Fertilizer (50lb bags)",
    currentQty: 8,
    targetQty: 25,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Trimmer Line",
    currentQty: 6,
    targetQty: 15,
    warning: true,
    workspaceId: "landscaping",
  },
  {
    name: "Topsoil (cubic yards)",
    currentQty: 22,
    targetQty: 20,
    warning: false,
    workspaceId: "landscaping",
  },

  // SNOW REMOVAL

  {
    name: "Salt Bags",
    currentQty: 18,
    targetQty: 80,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Ice Melt Buckets",
    currentQty: 10,
    targetQty: 30,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Snow Shovels",
    currentQty: 14,
    targetQty: 12,
    warning: false,
    workspaceId: "snow-removal",
  },
  {
    name: "Fuel (gallons)",
    currentQty: 30,
    targetQty: 50,
    warning: true,
    workspaceId: "snow-removal",
  },
  {
    name: "Hydraulic Fluid",
    currentQty: 12,
    targetQty: 10,
    warning: false,
    workspaceId: "snow-removal",
  },

  // PROPERTIES

  {
    name: "HVAC Filters",
    currentQty: 22,
    targetQty: 40,
    warning: true,
    workspaceId: "properties",
  },
  {
    name: "Light Bulbs",
    currentQty: 60,
    targetQty: 50,
    warning: false,
    workspaceId: "properties",
  },
  {
    name: "Smoke Detectors",
    currentQty: 8,
    targetQty: 20,
    warning: true,
    workspaceId: "properties",
  },
  {
    name: "Paint (gallons)",
    currentQty: 14,
    targetQty: 10,
    warning: false,
    workspaceId: "properties",
  },
  {
    name: "Air Fresheners",
    currentQty: 5,
    targetQty: 15,
    warning: true,
    workspaceId: "properties",
  },
];
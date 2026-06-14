export type JobStatus =
  | "Lead"
  | "Quoted"
  | "Scheduled"
  | "Completed"
  | "Paid";

export type JobMaterial = {
  name: string;
  quantity: number;
};

export type Job = {
  id: string;
  workspaceId: string;
  name: string;
  client: string;
  status: JobStatus;
  value: string;
  date: string;
  materials: JobMaterial[];
  notes?: string;
};

export const jobs: Job[] = [
  // LANDSCAPING
  {
    id: "1",
    workspaceId: "landscaping",
    name: "Jones Residence",
    client: "Jones Family",
    status: "Lead",
    value: "$200",
    date: "2026-06-10",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 2 },
      { name: "Fertilizer (50lb bags)", quantity: 1 },
    ],
    notes: "Initial lead for residential landscaping work.",
  },
  {
    id: "2",
    workspaceId: "landscaping",
    name: "Brown Property",
    client: "Brown Family",
    status: "Lead",
    value: "$350",
    date: "2026-06-12",
    materials: [
      { name: "Gasoline (gallons)", quantity: 4 },
      { name: "Trimmer Line", quantity: 1 },
    ],
    notes: "Needs follow-up before quote is finalized.",
  },
  {
    id: "3",
    workspaceId: "landscaping",
    name: "Acme HOA Cleanup",
    client: "Acme HOA",
    status: "Quoted",
    value: "$1,500",
    date: "2026-06-14",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 10 },
      { name: "Topsoil (cubic yards)", quantity: 5 },
      { name: "Fertilizer (50lb bags)", quantity: 4 },
    ],
    notes: "HOA cleanup quote submitted.",
  },
  {
    id: "4",
    workspaceId: "landscaping",
    name: "Spring Cleanup",
    client: "John Smith",
    status: "Scheduled",
    value: "$450",
    date: "2026-06-15",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 5 },
      { name: "Fertilizer (50lb bags)", quantity: 1 },
      { name: "Trimmer Line", quantity: 1 },
    ],
    notes: "Customer requested cleanup around front flower beds.",
  },
  {
    id: "5",
    workspaceId: "landscaping",
    name: "Weekly Service",
    client: "Sunset Apartments",
    status: "Completed",
    value: "$120",
    date: "2026-06-18",
    materials: [
      { name: "Gasoline (gallons)", quantity: 3 },
      { name: "Trimmer Line", quantity: 1 },
    ],
    notes: "Weekly service completed.",
  },
  {
    id: "6",
    workspaceId: "landscaping",
    name: "Mulch Installation",
    client: "Johnson Residence",
    status: "Paid",
    value: "$800",
    date: "2026-06-17",
    materials: [
      { name: "Mulch (cubic yards)", quantity: 8 },
      { name: "Topsoil (cubic yards)", quantity: 2 },
    ],
    notes: "Paid mulch installation job.",
  },

  // SNOW REMOVAL
  {
    id: "7",
    workspaceId: "snow-removal",
    name: "Church Snow Contract",
    client: "Rochester Community Church",
    status: "Lead",
    value: "$3,500",
    date: "2026-11-01",
    materials: [
      { name: "Salt Bags", quantity: 20 },
      { name: "Ice Melt Buckets", quantity: 4 },
    ],
    notes: "Seasonal snow removal lead.",
  },
  {
    id: "8",
    workspaceId: "snow-removal",
    name: "Office Lot Bid",
    client: "Riverside Office Park",
    status: "Quoted",
    value: "$6,800",
    date: "2026-11-05",
    materials: [
      { name: "Salt Bags", quantity: 40 },
      { name: "Fuel (gallons)", quantity: 10 },
    ],
    notes: "Commercial lot bid submitted.",
  },
  {
    id: "9",
    workspaceId: "snow-removal",
    name: "Condo Association",
    client: "Winter Ridge Condos",
    status: "Scheduled",
    value: "$9,200",
    date: "2026-11-10",
    materials: [
      { name: "Salt Bags", quantity: 50 },
      { name: "Ice Melt Buckets", quantity: 8 },
      { name: "Fuel (gallons)", quantity: 12 },
    ],
    notes: "Scheduled snow removal contract.",
  },
  {
    id: "10",
    workspaceId: "snow-removal",
    name: "Emergency Salt Run",
    client: "Oakland Medical Center",
    status: "Completed",
    value: "$650",
    date: "2026-11-12",
    materials: [
      { name: "Salt Bags", quantity: 12 },
      { name: "Fuel (gallons)", quantity: 5 },
      { name: "Hydraulic Fluid", quantity: 1 },
    ],
    notes: "Emergency salt run completed.",
  },
  {
    id: "11",
    workspaceId: "snow-removal",
    name: "Retail Plaza Clearing",
    client: "North Plaza",
    status: "Paid",
    value: "$2,400",
    date: "2026-11-15",
    materials: [
      { name: "Salt Bags", quantity: 25 },
      { name: "Fuel (gallons)", quantity: 8 },
    ],
    notes: "Paid snow clearing job.",
  },

  // PROPERTIES
  {
    id: "12",
    workspaceId: "properties",
    name: "Unit 204 Turnover",
    client: "Maple Grove Apartments",
    status: "Lead",
    value: "$1,200",
    date: "2026-07-01",
    materials: [
      { name: "Paint (gallons)", quantity: 3 },
      { name: "Light Bulbs", quantity: 4 },
    ],
    notes: "Potential apartment turnover job.",
  },
  {
    id: "13",
    workspaceId: "properties",
    name: "HVAC Inspection",
    client: "Riverside Office Park",
    status: "Quoted",
    value: "$950",
    date: "2026-07-03",
    materials: [
      { name: "HVAC Filters", quantity: 6 },
      { name: "Smoke Detectors", quantity: 2 },
    ],
    notes: "Inspection quote submitted.",
  },
  {
    id: "14",
    workspaceId: "properties",
    name: "Parking Lot Sealcoat",
    client: "Sunset Strip Mall",
    status: "Scheduled",
    value: "$8,500",
    date: "2026-07-10",
    materials: [
      { name: "Paint (gallons)", quantity: 8 },
      { name: "Light Bulbs", quantity: 10 },
    ],
    notes: "Scheduled parking lot maintenance.",
  },
  {
    id: "15",
    workspaceId: "properties",
    name: "Roof Leak Repair",
    client: "Green Valley HOA",
    status: "Completed",
    value: "$2,100",
    date: "2026-07-12",
    materials: [
      { name: "Smoke Detectors", quantity: 3 },
      { name: "Air Fresheners", quantity: 5 },
    ],
    notes: "Repair completed.",
  },
  {
    id: "16",
    workspaceId: "properties",
    name: "Quarterly Maintenance",
    client: "Johnson Commercial",
    status: "Paid",
    value: "$4,750",
    date: "2026-07-15",
    materials: [
      { name: "HVAC Filters", quantity: 8 },
      { name: "Light Bulbs", quantity: 12 },
      { name: "Air Fresheners", quantity: 6 },
    ],
    notes: "Paid quarterly maintenance job.",
  },
];
// lib/expenses.ts

export type Expense = {
  description: string;
  category: string;
  amount: string;
  workspaceId: string;
};

export const expenses: Expense[] = [
  // LANDSCAPING

  {
    description: "Mulch Bulk Order",
    category: "Materials",
    amount: "$1,750",
    workspaceId: "landscaping",
  },
  {
    description: "Fuel For Fleet",
    category: "Fuel",
    amount: "$420",
    workspaceId: "landscaping",
  },
  {
    description: "Trimmer Line Restock",
    category: "Materials",
    amount: "$180",
    workspaceId: "landscaping",
  },
  {
    description: "Equipment Maintenance",
    category: "Equipment",
    amount: "$320",
    workspaceId: "landscaping",
  },

  // SNOW REMOVAL

  {
    description: "Salt Bulk Order",
    category: "Materials",
    amount: "$900",
    workspaceId: "snow-removal",
  },
  {
    description: "Snow Plow Maintenance",
    category: "Equipment",
    amount: "$380",
    workspaceId: "snow-removal",
  },
  {
    description: "Diesel Fuel",
    category: "Fuel",
    amount: "$540",
    workspaceId: "snow-removal",
  },
  {
    description: "Hydraulic Repair",
    category: "Equipment",
    amount: "$650",
    workspaceId: "snow-removal",
  },

  // PROPERTIES

  {
    description: "Monthly Property Insurance",
    category: "Insurance",
    amount: "$650",
    workspaceId: "properties",
  },
  {
    description: "HVAC Service Contract",
    category: "Maintenance",
    amount: "$1,200",
    workspaceId: "properties",
  },
  {
    description: "Lighting Replacement",
    category: "Materials",
    amount: "$340",
    workspaceId: "properties",
  },
  {
    description: "Parking Lot Repairs",
    category: "Maintenance",
    amount: "$875",
    workspaceId: "properties",
  },
];
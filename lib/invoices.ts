export type Invoice = {
  id: string;
  client: string;
  status: "Draft" | "Sent" | "Overdue" | "Paid";
  amount: string;
  workspaceId: string;
};

export const invoices: Invoice[] = [
  // LANDSCAPING

  {
    id: "INV-001",
    client: "Acme HOA",
    status: "Paid",
    amount: "$850",
    workspaceId: "landscaping",
  },
  {
    id: "INV-005",
    client: "John Smith",
    status: "Sent",
    amount: "$450",
    workspaceId: "landscaping",
  },
  {
    id: "INV-006",
    client: "Johnson Residence",
    status: "Overdue",
    amount: "$800",
    workspaceId: "landscaping",
  },

  // SNOW REMOVAL

  {
    id: "INV-002",
    client: "Winter Ridge Condos",
    status: "Overdue",
    amount: "$2,400",
    workspaceId: "snow-removal",
  },
  {
    id: "INV-007",
    client: "Rochester Community Church",
    status: "Sent",
    amount: "$3,500",
    workspaceId: "snow-removal",
  },
  {
    id: "INV-008",
    client: "North Plaza",
    status: "Paid",
    amount: "$2,400",
    workspaceId: "snow-removal",
  },

  // PROPERTIES

  {
    id: "INV-003",
    client: "Johnson Commercial",
    status: "Paid",
    amount: "$3,200",
    workspaceId: "properties",
  },
  {
    id: "INV-004",
    client: "Green Valley HOA",
    status: "Sent",
    amount: "$1,200",
    workspaceId: "properties",
  },
  {
    id: "INV-009",
    client: "Sunset Strip Mall",
    status: "Draft",
    amount: "$8,500",
    workspaceId: "properties",
  },
];
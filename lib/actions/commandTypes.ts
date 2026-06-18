import type { ClientRow } from "@/lib/clientTypes";
import type { InventoryRow } from "@/lib/db/inventory";
import type { InvoiceRow } from "@/lib/frontierInvoices";
import type { Job } from "@/lib/jobTypes";
import type { Workspace } from "@/components/WorkspaceContext";

export type FrontierCommandIntent =
  | { name: "client.create"; payload: ClientRow }
  | { name: "client.update"; payload: ClientRow }
  | { name: "client.delete"; payload: { id: string } }
  | { name: "job.create"; payload: Job }
  | { name: "job.update"; payload: Job }
  | { name: "job.delete"; payload: { id: string } }
  | { name: "invoice.create"; payload: InvoiceRow }
  | { name: "invoice.update"; payload: InvoiceRow }
  | { name: "invoice.markPaid"; payload: { id: string } }
  | { name: "inventory.create"; payload: InventoryRow }
  | { name: "inventory.update"; payload: InventoryRow }
  | { name: "inventory.delete"; payload: InventoryRow }
  | { name: "workspace.create"; payload: Workspace }
  | { name: "workspace.update"; payload: Workspace };

export type FrontierCommandSource = "gui" | "future-ai" | "future-voice";

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useWorkspace } from "@/components/WorkspaceContext";

const invoiceStatuses = ["Draft", "Sent", "Overdue", "Paid"] as const;
const discountTypes = ["None", "Percent", "Fixed"] as const;

type InvoiceStatus = (typeof invoiceStatuses)[number];
type DiscountType = (typeof discountTypes)[number];

type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
};

type InvoiceSetupDraft = {
  id: string;
  workspaceId: string;
  invoiceNumber: string;
  invoiceDate: string;

  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  companyEmail: string;

  billToName: string;
  billToCompany: string;
  billToAddress: string;
  billToCity: string;
  billToState: string;
  billToZip: string;
  billToPhone: string;
  billToEmail: string;

  footerMessage: string;
  contactMessage: string;
};

type InvoiceRow = InvoiceSetupDraft & {
  lineItems: InvoiceLineItem[];
  discountType: DiscountType;
  discountValue: string;
  taxRate: string;
  status: InvoiceStatus;
};

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, "")) || 0;
}

function formatMoney(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getLineTotal(item: InvoiceLineItem) {
  return item.quantity * moneyToNumber(item.unitPrice);
}

function getSubtotal(lineItems: InvoiceLineItem[]) {
  return lineItems.reduce((total, item) => total + getLineTotal(item), 0);
}

function getDiscountAmount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: string
) {
  const value = Number(discountValue) || 0;

  if (discountType === "Percent") {
    return Math.min(subtotal * (value / 100), subtotal);
  }

  if (discountType === "Fixed") {
    return Math.min(value, subtotal);
  }

  return 0;
}

function getTaxAmount(afterDiscountSubtotal: number, taxRate: string) {
  const rate = Number(taxRate) || 0;

  return afterDiscountSubtotal * (rate / 100);
}

export default function InvoiceBuilderPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();

  const [draft, setDraft] = useState<InvoiceSetupDraft | null>(null);

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [lineDescription, setLineDescription] = useState("");
  const [lineQuantity, setLineQuantity] = useState("1");
  const [lineUnitPrice, setLineUnitPrice] = useState("");

  const [discountType, setDiscountType] = useState<DiscountType>("None");
  const [discountValue, setDiscountValue] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("Draft");

  useEffect(() => {
    const savedDraft = localStorage.getItem("frontier-invoice-draft");

    if (!savedDraft) {
      router.push("/invoices/new");
      return;
    }

    try {
      const parsedDraft = JSON.parse(savedDraft) as InvoiceSetupDraft;

      if (parsedDraft.workspaceId !== activeWorkspace.id) {
        router.push("/invoices/new");
        return;
      }

      setDraft(parsedDraft);
    } catch {
      router.push("/invoices/new");
    }
  }, [activeWorkspace.id, router]);

  const subtotal = getSubtotal(lineItems);
  const discount = getDiscountAmount(subtotal, discountType, discountValue);
  const taxableSubtotal = Math.max(subtotal - discount, 0);
  const tax = getTaxAmount(taxableSubtotal, taxRate);
  const total = taxableSubtotal + tax;

  function addLineItem() {
    if (!lineDescription.trim()) return;

    const quantity = Number(lineQuantity);
    const unitPrice = Number(lineUnitPrice);

    if (Number.isNaN(quantity) || quantity <= 0) return;
    if (Number.isNaN(unitPrice) || unitPrice < 0) return;

    setLineItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        description: lineDescription.trim(),
        quantity,
        unitPrice: formatMoney(unitPrice),
      },
    ]);

    setLineDescription("");
    setLineQuantity("1");
    setLineUnitPrice("");
  }

  function removeLineItem(id: string) {
    setLineItems((current) => current.filter((item) => item.id !== id));
  }

  function saveInvoice() {
    if (!draft) return;

    const savedInvoices = localStorage.getItem("frontier-invoices");
    let existingInvoices: InvoiceRow[] = [];

    if (savedInvoices) {
      try {
        existingInvoices = JSON.parse(savedInvoices);
      } catch {
        existingInvoices = [];
      }
    }

    const invoice: InvoiceRow = {
      ...draft,
      lineItems,
      discountType,
      discountValue,
      taxRate,
      status,
    };

    localStorage.setItem(
      "frontier-invoices",
      JSON.stringify([...existingInvoices, invoice])
    );
    localStorage.removeItem("frontier-invoice-draft");

    router.push("/invoices");
  }

  const inputClass =
    "rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-700 dark:bg-gray-800";

  if (!draft) {
    return (
      <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-900">
        Loading invoice builder...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice Builder</h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Step 2: add itemization, fees, tax, and save.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/invoices/new"
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Back
          </Link>

          <button
            type="button"
            onClick={saveInvoice}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Save Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Invoice #{draft.invoiceNumber}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Date: {draft.invoiceDate}
                </p>
              </div>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as InvoiceStatus)
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {invoiceStatuses.map((invoiceStatus) => (
                  <option key={invoiceStatus}>{invoiceStatus}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
                <h3 className="mb-2 font-semibold">From</h3>
                <p>{draft.companyName}</p>
                <p>{draft.companyAddress}</p>
                <p>
                  {draft.companyCity}, {draft.companyState} {draft.companyZip}
                </p>
                <p className="mt-2">{draft.companyPhone}</p>
                <p>{draft.companyEmail}</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
                <h3 className="mb-2 font-semibold">Bill To</h3>
                <p>{draft.billToName || "—"}</p>
                <p>{draft.billToCompany || "—"}</p>
                <p>{draft.billToAddress || "—"}</p>
                <p>
                  {[draft.billToCity, draft.billToState, draft.billToZip]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
                <p className="mt-2">{draft.billToPhone || "—"}</p>
                <p>{draft.billToEmail || "—"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
            <h2 className="text-xl font-bold">Line Items</h2>

            <div
              className="mt-4"
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                gap: "12px",
                width: "100%",
                alignItems: "stretch",
              }}
            >
              <input
                value={lineDescription}
                onChange={(event) => setLineDescription(event.target.value)}
                placeholder="Description"
                className={inputClass}
                style={{
                  flex: "1 1 0",
                  width: "auto",
                  minWidth: 0,
                }}
              />

              <input
                type="number"
                value={lineQuantity}
                onChange={(event) => setLineQuantity(event.target.value)}
                placeholder="Qty"
                className={inputClass}
                style={{
                  flex: "0 0 90px",
                  width: "auto",
                  minWidth: 0,
                }}
              />

              <input
                type="number"
                value={lineUnitPrice}
                onChange={(event) => setLineUnitPrice(event.target.value)}
                placeholder="Unit Price"
                className={inputClass}
                style={{
                  flex: "0 0 130px",
                  width: "auto",
                  minWidth: 0,
                }}
              />

              <button
                type="button"
                onClick={addLineItem}
                className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                style={{
                  flex: "0 0 100px",
                  width: "auto",
                  minWidth: 0,
                }}
              >
                Add
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr className="text-left text-sm text-gray-700 dark:text-gray-300">
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Line Total</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {lineItems.length > 0 ? (
                    lineItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">{item.unitPrice}</td>
                        <td className="p-3 text-right">
                          {formatMoney(getLineTotal(item))}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            className="text-sm text-red-600 hover:underline dark:text-red-400"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No line items added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
            <h2 className="text-xl font-bold">Discount / Tax</h2>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                gap: "12px",
                width: "100%",
                alignItems: "stretch",
              }}
            >
              <select
                value={discountType}
                onChange={(event) =>
                  setDiscountType(event.target.value as DiscountType)
                }
                className={inputClass}
                style={{
                  flex: "1 1 0",
                  width: "auto",
                  minWidth: 0,
                }}
              >
                {discountTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>

              <input
                type="number"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                placeholder={discountType === "Percent" ? "Discount %" : "Discount $"}
                disabled={discountType === "None"}
                className={`${inputClass} disabled:opacity-50`}
                style={{
                  flex: "1 1 0",
                  width: "auto",
                  minWidth: 0,
                }}
              />

              <input
                type="number"
                value={taxRate}
                onChange={(event) => setTaxRate(event.target.value)}
                placeholder="Tax Rate %"
                className={inputClass}
                style={{
                  flex: "1 1 0",
                  width: "auto",
                  minWidth: 0,
                }}
              />
            </div>
          </section>

          <section className="rounded-xl bg-white p-4 shadow dark:bg-gray-900 sm:p-6">
            <h2 className="text-xl font-bold">Totals</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>

              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>Discount</span>
                <span>-{formatMoney(discount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Taxable Subtotal</span>
                <span>{formatMoney(taxableSubtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatMoney(tax)}</span>
              </div>

              <div className="flex justify-between border-t border-gray-300 pt-3 text-2xl font-bold dark:border-gray-700">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

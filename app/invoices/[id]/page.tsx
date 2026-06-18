"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import DocumentAttachments from "@/app/documents/DocumentAttachments";
import { useAuthSession } from "@/components/AuthSessionProvider";
import { storageKeys, useStoredJsonState, writeStoredJson } from "@/lib/clientStorage";
import { createInvoicesRepository } from "@/lib/db/invoices";
import {
  formatMoneyNumber,
  getInvoiceTotals,
  getInvoiceClientName,
  getLineTotal,
  InvoiceRow,
  invoiceStatuses,
  InvoiceStatus,
  moneyToNumber,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const borderColor = "#9ca3af";
const headerBlue = "#dbeafe";
const amountColumnWidth = "144px";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = String(params.id);
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoice, setDatabaseInvoice] = useState<InvoiceRow | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices, setLocalInvoices }), [isDatabaseMode, localInvoices, setLocalInvoices, supabase]);

  const invoice = useMemo(() => {
    return isDatabaseMode ? databaseInvoice : localInvoices.find((item) => item.id === invoiceId);
  }, [databaseInvoice, invoiceId, isDatabaseMode, localInvoices]);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoadingInvoice(true);
        setInvoiceError("");
      }
    });
    invoicesRepo.getInvoiceById(invoiceId).then((item) => { if (!cancelled) setDatabaseInvoice(item); }).catch((error) => {
      if (!cancelled) setInvoiceError(error instanceof Error ? error.message : "Unable to load invoice.");
    }).finally(() => {
      if (!cancelled) setIsLoadingInvoice(false);
    });
    return () => { cancelled = true; };
  }, [invoiceId, invoicesRepo, isDatabaseMode]);

  async function updateInvoiceStatus(nextStatus: InvoiceStatus) {
    if (!invoice) return;

    try {
      const saved = await invoicesRepo.updateInvoice({ ...invoice, status: nextStatus });
      if (isDatabaseMode) setDatabaseInvoice(saved);
      else setLocalInvoices((current) => current.map((item) => item.id === invoice.id ? saved : item));
      setInvoiceError("");
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : "Unable to update invoice status.");
    }
  }

  function getNextInvoiceNumber() {
    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    return `INV-${stamp}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }

  async function duplicateInvoice() {
    if (!invoice) return;

    const duplicated: InvoiceRow = {
      ...invoice,
      id: crypto.randomUUID(),
      invoiceNumber: getNextInvoiceNumber(),
      invoiceDate: new Date().toISOString().slice(0, 10),
      status: invoice.status === "Estimate" ? "Estimate" : "Draft",
      lineItems: invoice.lineItems.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    };

    try {
      const saved = await invoicesRepo.createInvoice(duplicated);
      setInvoiceError("");
      router.push(`/invoices/${saved.id}`);
    } catch (error) {
      setInvoiceError(error instanceof Error ? error.message : "Unable to duplicate invoice.");
    }
  }

  function editInvoice() {
    if (!invoice) return;
    writeStoredJson(storageKeys.invoiceDraft, {
      ...invoice,
      editExisting: true,
    });
    router.push("/invoices/new/build");
  }

  if (isLoadingInvoice) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/invoices" className="text-blue-600 hover:underline dark:text-blue-400">
          - Back to Invoices
        </Link>
        <h1 className="text-3xl font-bold">Loading invoice...</h1>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/invoices" className="text-blue-600 hover:underline dark:text-blue-400">
          - Back to Invoices
        </Link>

        <h1 className="text-3xl font-bold">Invoice not found</h1>
        {invoiceError && (
          <p className="text-sm text-red-600 dark:text-red-400">{invoiceError}</p>
        )}
      </div>
    );
  }

  const totals = getInvoiceTotals(invoice);
  const billToDisplay = getInvoiceClientName(invoice);

  const mailSubject = encodeURIComponent(`Invoice ${invoice.invoiceNumber}`);
  const mailBody = encodeURIComponent(
    `Hello,\n\nPlease see invoice ${invoice.invoiceNumber} for $${formatMoneyNumber(
      totals.total
    )}.\n\nPlease attach the saved PDF before sending.\n\nThank you.`
  );

  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    invoice.billToEmail
  )}&su=${mailSubject}&body=${mailBody}`;

  const displayRows = [
    ...invoice.lineItems.map((item) => ({
      id: item.id,
      description:
        item.quantity > 1
          ? `${item.description} - ${item.quantity} - $${formatMoneyNumber(
              moneyToNumber(item.unitPrice)
            )}`
          : item.description,
      amount: formatMoneyNumber(getLineTotal(item)),
    })),
    ...(totals.discount > 0
      ? [
          {
            id: "discount",
            description:
              invoice.discountType === "Percent"
                ? `Discount (${invoice.discountValue}%)`
                : "Discount",
            amount: `(${formatMoneyNumber(totals.discount)})`,
          },
        ]
      : []),
    ...(totals.tax > 0
      ? [
          {
            id: "tax",
            description: `Tax (${invoice.taxRate}% after discount)`,
            amount: formatMoneyNumber(totals.tax),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      {invoiceError && (
        <div className="print-hidden rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 print:hidden dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {invoiceError}
        </div>
      )}
      <div className="print-hidden flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/invoices" className="text-blue-600 hover:underline dark:text-blue-400">
            - Back to Invoices
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Invoice {invoice.invoiceNumber}
          </h1>

          {invoice.jobId && (
            <Link
              href={`/jobs/${invoice.jobId}`}
              className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Linked job: {invoice.jobName || invoice.jobId}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={editInvoice}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={duplicateInvoice}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Duplicate
          </button>

          {invoice.status === "Estimate" && (
            <button
              type="button"
              onClick={() => updateInvoiceStatus("Draft")}
              className="rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
            >
              Convert to Invoice
            </button>
          )}

          {invoiceStatuses.filter((status) => status !== "Estimate").map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => updateInvoiceStatus(status)}
              disabled={invoice.status === status}
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Mark {status}
            </button>
          ))}

          <a
            href={gmailHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Send Email
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="invoice-print-page mx-auto max-w-4xl rounded-xl bg-white p-8 text-black shadow print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-sm leading-5">
            <p className="font-bold">{invoice.companyName}</p>
            <p>{invoice.companyAddress}</p>
            <p>
              {invoice.companyCity}, {invoice.companyState} {invoice.companyZip}
            </p>
            <p>{invoice.companyPhone}</p>
            <p>{invoice.companyEmail}</p>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-bold text-blue-500">
              {invoice.status === "Estimate" ? "ESTIMATE" : "INVOICE"}
            </h2>

            <div
              className="mt-4 grid text-sm"
              style={{
                gridTemplateColumns: "1fr 1fr 1fr",
                borderTop: `1px solid ${borderColor}`,
                borderLeft: `1px solid ${borderColor}`,
              }}
            >
              {[
                invoice.status === "Estimate" ? "ESTIMATE #" : "INVOICE #",
                "DATE",
                "STATUS",
                invoice.invoiceNumber,
                invoice.invoiceDate,
                invoice.status,
              ].map((value, index) => (
                <div
                  key={`${value}-${index}`}
                  className={`px-3 py-1 ${index < 3 ? "font-bold" : ""}`}
                  style={{
                    background: index < 3 ? headerBlue : undefined,
                    borderRight: `1px solid ${borderColor}`,
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-sm text-sm leading-5">
          <div
            className="px-2 py-1 font-bold"
            style={{ background: headerBlue, border: `1px solid ${borderColor}` }}
          >
            BILL TO
          </div>

          <div className="px-2 py-2">
            <p>{billToDisplay}</p>
            {invoice.billToAddress && <p>{invoice.billToAddress}</p>}
            {(invoice.billToCity || invoice.billToState || invoice.billToZip) && (
              <p>
                {invoice.billToCity}, {invoice.billToState} {invoice.billToZip}
              </p>
            )}
            {invoice.billToPhone && <p>{invoice.billToPhone}</p>}
            {invoice.billToEmail && <p>{invoice.billToEmail}</p>}
          </div>
        </div>

        <div className="mt-8 text-sm">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `1fr ${amountColumnWidth}`,
              borderTop: `1px solid ${borderColor}`,
              borderLeft: `1px solid ${borderColor}`,
              borderRight: `1px solid ${borderColor}`,
            }}
          >
            <div
              className="px-3 py-2 font-bold"
              style={{
                background: headerBlue,
                borderRight: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              DESCRIPTION
            </div>

            <div
              className="px-3 py-2 text-right font-bold"
              style={{ background: headerBlue, borderBottom: `1px solid ${borderColor}` }}
            >
              AMOUNT
            </div>

            {displayRows.map((row) => (
              <div key={`${row.id}-description`} className="contents invoice-row">
                <div
                  className="px-3 py-1"
                  style={{ borderRight: `1px solid ${borderColor}` }}
                >
                  {row.description}
                </div>

                <div className="px-3 py-1 text-right">{row.amount}</div>
              </div>
            ))}

            {displayRows.length < 8 && (
              <>
                <div style={{ minHeight: "224px", borderRight: `1px solid ${borderColor}` }} />
                <div />
              </>
            )}

            <div
              className="px-3 py-3 text-center italic"
              style={{
                borderTop: `1px solid ${borderColor}`,
                borderRight: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              {invoice.footerMessage || "Thank you for your business!"}
            </div>

            <div
              className="px-3 py-3"
              style={{
                borderTop: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <div className="flex justify-between gap-3 font-bold">
                <span>TOTAL</span>
                <span>${formatMoneyNumber(totals.total)}</span>
              </div>
              <div className="mt-2 space-y-1 text-xs font-normal">
                <div className="flex justify-between gap-3">
                  <span>Subtotal</span>
                  <span>${formatMoneyNumber(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between gap-3">
                    <span>Discount</span>
                    <span>-${formatMoneyNumber(totals.discount)}</span>
                  </div>
                )}
                {totals.tax > 0 && (
                  <div className="flex justify-between gap-3">
                    <span>Tax</span>
                    <span>${formatMoneyNumber(totals.tax)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-sm">
          <p>
            {invoice.contactMessage ||
              "If you have any questions about this invoice, please contact us."}
          </p>
          <p>
            {invoice.companyPhone}
            {invoice.companyPhone && invoice.companyEmail ? ", " : ""}
            {invoice.companyEmail}
          </p>
        </div>
      </div>

      <div className="print-hidden print:hidden">
        <DocumentAttachments
          workspaceId={invoice.workspaceId}
          invoiceId={invoice.id}
          title="Invoice Documents"
        />
      </div>
    </div>
  );
}

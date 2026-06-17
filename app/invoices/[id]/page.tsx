"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useAuthSession } from "@/components/AuthSessionProvider";
import { storageKeys, useStoredJsonState } from "@/lib/clientStorage";
import { createInvoicesRepository } from "@/lib/db/invoices";
import {
  formatMoneyNumber,
  getInvoiceTotals,
  getInvoiceClientName,
  getLineTotal,
  InvoiceRow,
  moneyToNumber,
} from "@/lib/frontierInvoices";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const borderColor = "#9ca3af";
const headerBlue = "#dbeafe";
const amountColumnWidth = "144px";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = String(params.id);
  const { isSupabaseConfigured, user } = useAuthSession();
  const isDatabaseMode = Boolean(isSupabaseConfigured && user);

  const [localInvoices, setLocalInvoices] = useStoredJsonState<InvoiceRow[]>(
    storageKeys.invoices,
    []
  );
  const [databaseInvoice, setDatabaseInvoice] = useState<InvoiceRow | null>(null);

  const supabase = useMemo(() => (isDatabaseMode ? createBrowserSupabaseClient() : null), [isDatabaseMode]);
  const invoicesRepo = useMemo(() => createInvoicesRepository({ isSignedIn: isDatabaseMode, supabase, localInvoices, setLocalInvoices }), [isDatabaseMode, localInvoices, setLocalInvoices, supabase]);

  const invoice = useMemo(() => {
    return isDatabaseMode ? databaseInvoice : localInvoices.find((item) => item.id === invoiceId);
  }, [databaseInvoice, invoiceId, isDatabaseMode, localInvoices]);

  useEffect(() => {
    if (!isDatabaseMode) return;
    let cancelled = false;
    invoicesRepo.getInvoiceById(invoiceId).then((item) => { if (!cancelled) setDatabaseInvoice(item); });
    return () => { cancelled = true; };
  }, [invoiceId, invoicesRepo, isDatabaseMode]);

  if (!invoice) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link href="/invoices" className="text-blue-600 hover:underline dark:text-blue-400">
          - Back to Invoices
        </Link>

        <h1 className="text-3xl font-bold">Invoice not found</h1>
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
            <h2 className="text-4xl font-bold text-blue-500">INVOICE</h2>

            <div
              className="mt-4 grid text-sm"
              style={{
                gridTemplateColumns: "1fr 1fr",
                borderTop: `1px solid ${borderColor}`,
                borderLeft: `1px solid ${borderColor}`,
              }}
            >
              {["INVOICE #", "DATE", invoice.invoiceNumber, invoice.invoiceDate].map((value, index) => (
                <div
                  key={`${value}-${index}`}
                  className={`px-3 py-1 ${index < 2 ? "font-bold" : ""}`}
                  style={{
                    background: index < 2 ? headerBlue : undefined,
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
    </div>
  );
}

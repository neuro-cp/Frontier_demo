"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

type InvoiceRow = {
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

  lineItems: InvoiceLineItem[];

  discountType: DiscountType;
  discountValue: string;
  taxRate: string;

  footerMessage: string;
  contactMessage: string;
  status: InvoiceStatus;
};

function moneyToNumber(value: string) {
  return Number(value.replace(/[$,]/g, "")) || 0;
}

function formatMoney(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

const borderColor = "#9ca3af";
const headerBlue = "#dbeafe";
const amountColumnWidth = "144px";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = String(params.id);

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedInvoices = localStorage.getItem("frontier-invoices");

    if (savedInvoices) {
      try {
        setInvoices(JSON.parse(savedInvoices));
      } catch {
        setInvoices([]);
      }
    }

    setLoaded(true);
  }, []);

  const invoice = useMemo(() => {
    return invoices.find((item) => item.id === invoiceId);
  }, [invoices, invoiceId]);

  if (!loaded) {
    return <div className="text-gray-400">Loading invoice...</div>;
  }

  if (!invoice) {
    return (
      <div className="space-y-4 text-gray-950 dark:text-gray-100">
        <Link
          href="/invoices"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Invoices
        </Link>

        <h1 className="text-3xl font-bold">Invoice not found</h1>
      </div>
    );
  }

  const subtotal = getSubtotal(invoice.lineItems);

  const discount = getDiscountAmount(
    subtotal,
    invoice.discountType,
    invoice.discountValue
  );

  const taxableSubtotal = Math.max(subtotal - discount, 0);
  const tax = getTaxAmount(taxableSubtotal, invoice.taxRate);
  const total = taxableSubtotal + tax;

  const billToDisplay =
    invoice.billToCompany || invoice.billToName || "Unnamed Client";

  const mailSubject = encodeURIComponent(`Invoice ${invoice.invoiceNumber}`);

  const mailBody = encodeURIComponent(
    `Hello,\n\nPlease see invoice ${invoice.invoiceNumber} for $${formatMoney(
      total
    )}.\n\nThank you.`
  );

  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    invoice.billToEmail
  )}&su=${mailSubject}&body=${mailBody}`;

  const displayRows = [
    ...invoice.lineItems.map((item) => ({
      id: item.id,
      description:
        item.quantity > 1
          ? `${item.description} — ${item.quantity} × $${formatMoney(
              moneyToNumber(item.unitPrice)
            )}`
          : item.description,
      amount: formatMoney(getLineTotal(item)),
    })),
    ...(discount > 0
      ? [
          {
            id: "discount",
            description:
              invoice.discountType === "Percent"
                ? `Discount (${invoice.discountValue}%)`
                : "Discount",
            amount: `(${formatMoney(discount)})`,
          },
        ]
      : []),
    ...(tax > 0
      ? [
          {
            id: "tax",
            description: `Tax (${invoice.taxRate}% after discount)`,
            amount: formatMoney(tax),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 text-gray-950 dark:text-gray-100">
      <div className="print-hidden flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/invoices"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Back to Invoices
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Invoice {invoice.invoiceNumber}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">


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
              <div
                className="px-3 py-1 font-bold"
                style={{
                  background: headerBlue,
                  borderRight: `1px solid ${borderColor}`,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                INVOICE #
              </div>

              <div
                className="px-3 py-1 font-bold"
                style={{
                  background: headerBlue,
                  borderRight: `1px solid ${borderColor}`,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                DATE
              </div>

              <div
                className="px-3 py-1"
                style={{
                  borderRight: `1px solid ${borderColor}`,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                {invoice.invoiceNumber}
              </div>

              <div
                className="px-3 py-1"
                style={{
                  borderRight: `1px solid ${borderColor}`,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                {invoice.invoiceDate}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-sm text-sm leading-5">
          <div
            className="px-2 py-1 font-bold"
            style={{
              background: headerBlue,
              border: `1px solid ${borderColor}`,
            }}
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
              style={{
                background: headerBlue,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              AMOUNT
            </div>

            {displayRows.map((row) => (
              <div
                key={`${row.id}-description`}
                className="contents"
              >
                <div
                  className="px-3 py-1"
                  style={{
                    borderRight: `1px solid ${borderColor}`,
                  }}
                >
                  {row.description}
                </div>

                <div className="px-3 py-1 text-right">{row.amount}</div>
              </div>
            ))}

            <div
              style={{
                minHeight: "224px",
                borderRight: `1px solid ${borderColor}`,
              }}
            />

            <div />

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
                <span>${formatMoney(total)}</span>
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
"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Calendar", href: "/calendar", icon: "📅" },
  { label: "Jobs", href: "/jobs", icon: "✅" },
  { label: "Inventory", href: "/inventory", icon: "🧱" },
  { label: "Financials", href: "/financials", icon: "💵" },
  { label: "Invoices", href: "/invoices", icon: "📄" },
  { label: "Clients", href: "/clients", icon: "🧑‍💼" },
  { label: "Document Extraction", href: "/documents", icon: "📁" },
  { label: "Logistics", href: "/logistics", icon: "🛣️" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside
      className={`flex h-full flex-shrink-0 flex-col bg-gray-900 text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`group relative flex items-center rounded-xl px-3 py-2.5 text-gray-300 transition-colors hover:bg-blue-600 hover:text-white ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <span className="w-8 text-center text-2xl leading-none">
              {item.icon}
            </span>

            {!collapsed && (
              <span className="truncate text-base font-medium">
                {item.label}
              </span>
            )}

            {collapsed && (
              <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-sm text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          className={`flex w-full items-center rounded-xl px-3 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <span className="text-xl">{collapsed ? "›" : "‹"}</span>

          {!collapsed && (
            <span className="text-base font-medium">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
}
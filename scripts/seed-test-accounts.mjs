#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const seedName = "frontier_test_accounts";
const qaSeed = true;
const password = ".";
const workspaceName = "Frontier QA Test Workspace";

const accounts = {
  business: {
    email: "bus@t.com",
    displayName: "QA Business Owner",
  },
  employee: {
    email: "emp@t.com",
    displayName: "QA Test Employee",
  },
  customer: {
    email: "cus@t.com",
    displayName: "QA Test Customer",
  },
};

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required. Refusing to seed QA accounts.`);
  }
  return value;
}

function loadLocalEnv() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim().replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  }
}

function seedMetadata(role) {
  return {
    qa_seed: qaSeed,
    seed_name: seedName,
    qa_role: role,
  };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function futureIsoDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function findUserByEmail(supabase, email) {
  let page = 1;
  const perPage = 100;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function createOrUpdateUser(supabase, role, account) {
  const existing = await findUserByEmail(supabase, account.email);
  if (!existing) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: account.displayName,
        ...seedMetadata(role),
      },
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    user_metadata: {
      ...(existing.user_metadata ?? {}),
      display_name: account.displayName,
      ...seedMetadata(role),
    },
  });
  if (error) throw error;
  return data.user;
}

async function upsertProfile(supabase, user, displayName) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      display_name: displayName,
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

async function getOrCreateWorkspace(supabase, ownerUserId) {
  const { data: existing, error: existingError } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("name", workspaceName)
    .eq("created_by", ownerUserId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name: workspaceName,
      type: "QA Test",
      created_by: ownerUserId,
    })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

async function upsertWorkspaceMember(supabase, workspaceId, userId, role) {
  const { data: existing, error: existingError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existingError) throw existingError;

  const row = {
    workspace_id: workspaceId,
    user_id: userId,
    role,
    status: "Active",
  };

  if (existing) {
    const { error } = await supabase
      .from("workspace_members")
      .update(row)
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("workspace_members").insert(row);
  if (error) throw error;
}

async function upsertWorkspaceBilling(supabase, workspaceId) {
  const { error } = await supabase.from("workspace_billing").upsert(
    {
      workspace_id: workspaceId,
      plan: "free",
      billing_status: "Not Configured",
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
      current_period_end: null,
      cancel_at_period_end: false,
    },
    { onConflict: "workspace_id" }
  );
  if (error) throw error;
}

async function getOrCreateClient(supabase, workspaceId) {
  const name = "QA Test Customer";
  const { data: existing, error: existingError } = await supabase
    .from("clients")
    .select("id")
    .eq("workspace_id", workspaceId)
    .ilike("name", name)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) {
    const { error } = await supabase
      .from("clients")
      .update({
        status: "Active",
        email: accounts.customer.email,
        phone: "555-0100",
        address: "210 W University Dr",
        city: "Rochester",
        state: "MI",
        zip: "48307",
        notes: `qa_seed=${qaSeed}; seed_name=${seedName}`,
      })
      .eq("id", existing.id);
    if (error) throw error;
    return existing;
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      workspace_id: workspaceId,
      name,
      status: "Active",
      email: accounts.customer.email,
      phone: "555-0100",
      address: "210 W University Dr",
      city: "Rochester",
      state: "MI",
      zip: "48307",
      notes: `qa_seed=${qaSeed}; seed_name=${seedName}`,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

async function getOrCreateJob(supabase, workspaceId, clientId) {
  const name = "QA Test Job";
  const { data: existing, error: existingError } = await supabase
    .from("jobs")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("name", name)
    .maybeSingle();
  if (existingError) throw existingError;

  const row = {
    workspace_id: workspaceId,
    client_id: clientId,
    client_name_snapshot: "QA Test Customer",
    name,
    status: "Scheduled",
    estimated_value_cents: 12500,
    scheduled_date: futureIsoDate(1),
    scheduled_time: "10:00",
    notes: `QA Test Employee Assignment. qa_seed=${qaSeed}; seed_name=${seedName}`,
  };

  if (existing) {
    const { error } = await supabase.from("jobs").update(row).eq("id", existing.id);
    if (error) throw error;
    return existing;
  }

  const { data, error } = await supabase.from("jobs").insert(row).select("id").single();
  if (error) throw error;
  return data;
}

async function upsertEmployeeAssignment(supabase, workspaceId, jobId, employeeUserId, ownerUserId) {
  const { data: existing, error: existingError } = await supabase
    .from("employee_job_assignments")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("job_id", jobId)
    .eq("employee_user_id", employeeUserId)
    .neq("status", "Removed")
    .maybeSingle();
  if (existingError) throw existingError;

  const row = {
    workspace_id: workspaceId,
    job_id: jobId,
    employee_user_id: employeeUserId,
    assigned_by: ownerUserId,
    status: "Assigned",
    notes: `QA Test Employee Assignment. qa_seed=${qaSeed}; seed_name=${seedName}`,
  };

  if (existing) {
    const { error } = await supabase
      .from("employee_job_assignments")
      .update(row)
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("employee_job_assignments").insert(row);
  if (error) throw error;
}

async function getOrCreateInvoice(supabase, workspaceId, clientId, jobId) {
  const invoiceNumber = "QA-INV-001";
  const { data: existing, error: existingError } = await supabase
    .from("invoices")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("invoice_number", invoiceNumber)
    .maybeSingle();
  if (existingError) throw existingError;

  const row = {
    workspace_id: workspaceId,
    client_id: clientId,
    job_id: jobId,
    invoice_number: invoiceNumber,
    invoice_date: todayIsoDate(),
    due_date: futureIsoDate(14),
    company_name: "Frontier QA Test Workspace",
    company_email: accounts.business.email,
    bill_to_name: "QA Test Customer",
    bill_to_email: accounts.customer.email,
    discount_type: "None",
    discount_value: 0,
    tax_rate: 0,
    footer_message: "QA seed invoice.",
    contact_message: "Temporary QA invoice.",
    status: "Sent",
  };

  const invoice = existing
    ? await supabase.from("invoices").update(row).eq("id", existing.id).select("id").single()
    : await supabase.from("invoices").insert(row).select("id").single();
  if (invoice.error) throw invoice.error;

  const { data: line, error: lineError } = await supabase
    .from("invoice_line_items")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("invoice_id", invoice.data.id)
    .eq("description", "QA Test Invoice")
    .maybeSingle();
  if (lineError) throw lineError;

  const lineRow = {
    workspace_id: workspaceId,
    invoice_id: invoice.data.id,
    description: "QA Test Invoice",
    quantity: 1,
    unit_price_cents: 12500,
    sort_order: 1,
  };
  const lineResult = line
    ? await supabase.from("invoice_line_items").update(lineRow).eq("id", line.id)
    : await supabase.from("invoice_line_items").insert(lineRow);
  if (lineResult.error) throw lineResult.error;

  return invoice.data;
}

async function upsertClientPortalAccess(
  supabase,
  workspaceId,
  clientId,
  customerUserId,
  ownerUserId
) {
  const { data: existing, error: existingError } = await supabase
    .from("client_portal_access")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("client_id", clientId)
    .eq("email", accounts.customer.email)
    .maybeSingle();
  if (existingError) throw existingError;

  const row = {
    workspace_id: workspaceId,
    client_id: clientId,
    user_id: customerUserId,
    email: accounts.customer.email,
    status: "Active",
    invite_token_hash: null,
    invite_expires_at: null,
    accepted_at: new Date().toISOString(),
    created_by: ownerUserId,
  };

  if (existing) {
    const { error } = await supabase
      .from("client_portal_access")
      .update(row)
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("client_portal_access").insert(row);
  if (error) throw error;
}

async function main() {
  loadLocalEnv();
  console.warn("Creating temporary Frontier QA accounts. Do not use these in production.");
  const supabase = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  const businessUser = await createOrUpdateUser(supabase, "business", accounts.business);
  const employeeUser = await createOrUpdateUser(supabase, "employee", accounts.employee);
  const customerUser = await createOrUpdateUser(supabase, "customer", accounts.customer);

  await upsertProfile(supabase, businessUser, accounts.business.displayName);
  await upsertProfile(supabase, employeeUser, accounts.employee.displayName);
  await upsertProfile(supabase, customerUser, accounts.customer.displayName);

  const workspace = await getOrCreateWorkspace(supabase, businessUser.id);
  await upsertWorkspaceBilling(supabase, workspace.id);
  await upsertWorkspaceMember(supabase, workspace.id, businessUser.id, "Owner");
  await upsertWorkspaceMember(supabase, workspace.id, employeeUser.id, "Employee");

  const client = await getOrCreateClient(supabase, workspace.id);
  const job = await getOrCreateJob(supabase, workspace.id, client.id);
  const invoice = await getOrCreateInvoice(supabase, workspace.id, client.id, job.id);
  await upsertEmployeeAssignment(
    supabase,
    workspace.id,
    job.id,
    employeeUser.id,
    businessUser.id
  );
  await upsertClientPortalAccess(
    supabase,
    workspace.id,
    client.id,
    customerUser.id,
    businessUser.id
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        seedName,
        passwordAccepted: true,
        workspace,
        plan: "free",
        accounts: {
          business: accounts.business.email,
          employee: accounts.employee.email,
          customer: accounts.customer.email,
        },
        clientId: client.id,
        jobId: job.id,
        invoiceId: invoice.id,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

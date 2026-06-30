#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const seedName = "frontier_test_accounts";
const workspaceName = "Frontier QA Test Workspace";
const emails = ["bus@t.com", "emp@t.com", "cus@t.com"];

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required. Refusing to remove QA accounts.`);
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

function isSeedUser(user) {
  return (
    user?.user_metadata?.qa_seed === true &&
    user?.user_metadata?.seed_name === seedName
  );
}

async function main() {
  loadLocalEnv();
  console.warn("Removing temporary Frontier QA accounts and QA workspace data.");
  const supabase = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  const users = new Map();
  for (const email of emails) {
    const user = await findUserByEmail(supabase, email);
    if (user) users.set(email, user);
  }

  const businessUser = users.get("bus@t.com");
  if (businessUser && isSeedUser(businessUser)) {
    const { data: workspaces, error } = await supabase
      .from("workspaces")
      .select("id, name")
      .eq("name", workspaceName)
      .eq("created_by", businessUser.id);
    if (error) throw error;

    for (const workspace of workspaces ?? []) {
      const { error: deleteError } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", workspace.id)
        .eq("created_by", businessUser.id)
        .eq("name", workspaceName);
      if (deleteError) throw deleteError;
    }
  }

  const removedUsers = [];
  const skippedUsers = [];
  for (const [email, user] of users.entries()) {
    if (!isSeedUser(user)) {
      skippedUsers.push(email);
      continue;
    }
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
    removedUsers.push(email);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        seedName,
        removedUsers,
        skippedUsers,
        workspaceName,
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

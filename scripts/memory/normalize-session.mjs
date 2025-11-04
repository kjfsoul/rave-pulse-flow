#!/usr/bin/env node

import fs from "fs";

const today = new Date().toISOString().split("T")[0];

const f = `memory/persistent/session-${today}.json`;

if (!fs.existsSync(f)) process.exit(0);



const j = JSON.parse(fs.readFileSync(f,"utf8"));



j.date = j.date ?? today;

j.branch = j.branch ?? (process.env.CI_BRANCH || "unknown");

j.commits_today = Number.isInteger(j.commits_today) ? j.commits_today : 0;

j.areas = Array.isArray(j.areas) ? j.areas : (Array.isArray(j.context) ? j.context : []);

j.statuses = j.statuses && typeof j.statuses === "object" ? j.statuses : {};

j.next = Array.isArray(j.next) ? j.next : [];

j.compliance = j.compliance || {};

if (typeof j.compliance.provider_order !== "string") {

  j.compliance.provider_order = "localjson,supabase,byterover(optional)";

}

if (typeof j.compliance.byterover_enabled !== "boolean") {

  // normalize older "byte_rover_disabled: true" property if present

  if (typeof j.compliance.byte_rover_disabled === "boolean") {

    j.compliance.byterover_enabled = !j.compliance.byte_rover_disabled;

  } else {

    j.compliance.byterover_enabled = false;

  }

}



fs.writeFileSync(f, JSON.stringify(j, null, 2));

console.log("✅ normalized", f);

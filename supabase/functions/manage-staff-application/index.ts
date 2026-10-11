import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond(405, { error: "Method not allowed." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const appSiteUrl = Deno.env.get("APP_SITE_URL");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !appSiteUrl) {
    console.error("Required Supabase function environment values are missing.");
    return respond(500, { error: "Staff application review is not configured." });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return respond(401, { error: "Sign in as an owner to continue." });

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: userData, error: authError } = await userClient.auth.getUser();
  if (authError || !userData.user) return respond(401, { error: "Your session is invalid or expired." });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: ownerProfile, error: ownerError } = await adminClient
    .from("staff_profiles")
    .select("role")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (ownerError) {
    console.error("Unable to verify staff application reviewer:", ownerError);
    return respond(500, { error: "Could not verify owner access." });
  }
  if (ownerProfile?.role !== "owner") return respond(403, { error: "Only an owner can review staff applications." });

  let payload: { applicationId?: string; action?: string };
  try {
    payload = await request.json();
  } catch {
    return respond(400, { error: "Invalid request body." });
  }
  if (!payload.applicationId || !["approve", "reject"].includes(payload.action || "")) {
    return respond(400, { error: "A valid application and review action are required." });
  }

  const { data: application, error: applicationError } = await adminClient
    .from("access_applications")
    .select("id, applicant_user_id, applicant_name, applicant_email, requested_role, status")
    .eq("id", payload.applicationId)
    .maybeSingle();
  if (applicationError) {
    console.error("Unable to load staff application:", applicationError);
    return respond(500, { error: "Could not load this application." });
  }
  if (!application || application.status !== "pending") return respond(409, { error: "This application is no longer pending." });

  const review = {
    status: payload.action === "approve" ? "approved" : "rejected",
    reviewed_by: userData.user.id,
    reviewed_at: new Date().toISOString()
  };

  if (payload.action === "reject") {
    const { error } = await adminClient.from("access_applications").update(review)
      .eq("id", application.id).eq("status", "pending");
    if (error) {
      console.error("Unable to reject staff application:", error);
      return respond(500, { error: "Could not reject this application." });
    }
    return respond(200, { status: "rejected" });
  }

  if (!["owner", "manager", "cashier"].includes(application.requested_role)) {
    return respond(400, { error: "The requested staff role is invalid." });
  }
  if (application.applicant_user_id) {
    return respond(409, { error: "This application is already linked to an account. Contact the store owner." });
  }

  const redirectTo = `${appSiteUrl.replace(/\/$/, "")}/frontend.html`;
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin
    .inviteUserByEmail(application.applicant_email, {
      data: { full_name: application.applicant_name },
      redirectTo
    });
  if (inviteError || !inviteData.user) {
    console.error("Unable to invite approved staff member:", inviteError);
    return respond(400, { error: "Could not invite this email. It may already have a Supabase Auth account." });
  }

  const defaultPermissions = application.requested_role === "cashier"
    ? ["pos"]
    : ["overview", "products", "inventory", "orders", "pos"];
  const { error: profileError } = await adminClient.from("staff_profiles").insert({
    user_id: inviteData.user.id,
    email: application.applicant_email,
    full_name: application.applicant_name,
    role: application.requested_role,
    permissions: defaultPermissions
  });
  if (profileError) {
    console.error("Unable to create approved staff profile:", profileError);
    const { error: rollbackError } = await adminClient.auth.admin.deleteUser(inviteData.user.id);
    if (rollbackError) console.error("Unable to remove the incomplete invited account:", rollbackError);
    return respond(500, { error: "The account could not be provisioned. No password was created; contact the store owner." });
  }

  const { data: reviewedApplication, error: reviewError } = await adminClient
    .from("access_applications").update(review)
    .eq("id", application.id).eq("status", "pending").select("id").maybeSingle();
  if (reviewError || !reviewedApplication) {
    console.error("Unable to complete staff application approval:", reviewError);
    const { error: profileRollbackError } = await adminClient.from("staff_profiles")
      .delete().eq("user_id", inviteData.user.id);
    if (profileRollbackError) console.error("Unable to remove incomplete staff profile:", profileRollbackError);
    const { error: userRollbackError } = await adminClient.auth.admin.deleteUser(inviteData.user.id);
    if (userRollbackError) console.error("Unable to remove incomplete invited account:", userRollbackError);
    return respond(500, { error: "Approval could not be completed. Contact the store owner before retrying." });
  }

  return respond(200, { status: "approved", invitationSent: true });
});

const supabaseConfig = window.ATHLIFE_SUPABASE_CONFIG || {};
const supabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);
const supabaseClient = supabaseConfigured
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;

function isSupabaseAuthConfigured(){return Boolean(supabaseClient)}

function staffRoleName(role){return role==="owner"?"Owner":role==="manager"?"Manager":"Cashier"}

async function signInSupabaseStaff(email,password){
  const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
  if(error)throw error;
  const {data:profile,error:profileError}=await supabaseClient.from("staff_profiles")
    .select("user_id,email,full_name,role,permissions")
    .eq("user_id",data.user.id)
    .maybeSingle();
  if(profileError)throw profileError;
  if(!profile){
    await supabaseClient.auth.signOut();
    throw new Error("This email is not assigned an approved staff account.");
  }
  return {
    id:profile.user_id,
    email:profile.email||data.user.email,
    name:profile.full_name,
    role:staffRoleName(profile.role),
    permissions:profile.permissions||[]
  };
}

async function submitSupabaseStaffApplication({name,email,role}){
  const {error}=await supabaseClient.from("access_applications").insert({
    applicant_name:name,
    applicant_email:email,
    requested_role:role.toLowerCase(),
    status:"pending"
  });
  if(error)throw error;
}

async function loadSupabaseStaffData(){
  const [profilesResult,applicationsResult]=await Promise.all([
    supabaseClient.from("staff_profiles").select("user_id,email,full_name,role,permissions"),
    supabaseClient.from("access_applications")
      .select("id,applicant_name,applicant_email,requested_role,status,created_at")
      .order("created_at",{ascending:false})
  ]);
  if(profilesResult.error)throw profilesResult.error;
  if(applicationsResult.error)throw applicationsResult.error;
  staff.splice(0,staff.length,...profilesResult.data.map(profile=>({
    id:profile.user_id,
    email:profile.email,
    name:profile.full_name,
    role:staffRoleName(profile.role),
    permissions:profile.permissions||[]
  })));
  accessApplications.splice(0,accessApplications.length,...applicationsResult.data.map(app=>({
    id:app.id,
    name:app.applicant_name,
    email:app.applicant_email,
    requestedRole:staffRoleName(app.requested_role),
    status:app.status==="pending"?"Pending":app.status==="approved"?"Approved":"Rejected",
    date:new Date(app.created_at).toLocaleString()
  })));
}

async function reviewSupabaseStaffApplication(id,action){
  const {data:{session},error:sessionError}=await supabaseClient.auth.getSession();
  if(sessionError)throw sessionError;
  if(!session)throw new Error("Sign in again to review staff applications.");
  const response=await fetch(`${supabaseConfig.url}/functions/v1/manage-staff-application`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${session.access_token}`,
      "apikey":supabaseConfig.anonKey
    },
    body:JSON.stringify({applicationId:id,action})
  });
  const result=await response.json();
  if(!response.ok)throw new Error(result.error||"Unable to review this application.");
  return result;
}

async function saveSupabaseStaffPermissions(email,permissions){
  const {error}=await supabaseClient.from("staff_profiles").update({permissions})
    .eq("email",email)
    .neq("role","owner");
  if(error)throw error;
}

async function sendSupabasePasswordReset(email){
  const redirectTo=`${window.location.origin}${window.location.pathname}`;
  const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo});
  if(error)throw error;
}

async function setSupabasePassword(password){
  const {error}=await supabaseClient.auth.updateUser({password});
  if(error)throw error;
  const {error:signOutError}=await supabaseClient.auth.signOut();
  if(signOutError)throw signOutError;
}

let passwordSetupModalShown=false;
function showPasswordSetupFromAuth(){
  if(passwordSetupModalShown)return;
  passwordSetupModalShown=true;
  window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}`);
  openPasswordUpdateModal();
}

if(supabaseClient){
  supabaseClient.auth.onAuthStateChange((event)=>{
    if(event==="PASSWORD_RECOVERY"||/type=(invite|recovery)/.test(window.location.hash)){
      window.setTimeout(showPasswordSetupFromAuth,0);
    }
  });
  if(/type=(invite|recovery)/.test(window.location.hash)){
    window.setTimeout(showPasswordSetupFromAuth,0);
  }
}

const demoLogin = window.login;
window.login = async function(){
  if(!supabaseClient)return demoLogin();
  const email=document.getElementById("loginEmail").value.trim().toLowerCase();
  const password=document.getElementById("loginPassword").value;
  if(members.some(member=>member.email.toLowerCase()===email))return demoLogin();
  try{
    const user=await signInSupabaseStaff(email,password);
    if(user.role==="Owner")await loadSupabaseStaffData();
    activeMember=null;
    activeStaff=user;
    document.getElementById("userName").textContent=user.name+" · "+user.role;
    refreshAdminAccess();
    closeModal();
    document.getElementById("storefront").style.display="none";
    document.getElementById("trackingView").style.display="none";
    document.getElementById("membershipView").style.display="none";
    document.getElementById("admin").classList.add("show");
    showAdminView(user.role==="Owner"?"overview":(user.permissions.includes("overview")?"overview":featurePermissions.find(permission=>user.permissions.includes(permission[0]))?.[0]||"none"));
    updateAccountButton();
  }catch(error){
    console.error("Supabase staff sign-in failed:",error);
    toast(error.message==="Invalid login credentials"?"Email or password not recognized.":error.message||"Unable to sign in.");
  }
};

const demoRegisterAccount = window.registerAccount;
window.registerAccount = async function(){
  const type=document.getElementById("registerType").value;
  if(!supabaseClient||type==="member")return demoRegisterAccount();
  const name=document.getElementById("registerName").value.trim();
  const email=document.getElementById("registerEmail").value.trim().toLowerCase();
  const role=type==="owner"?"Owner":document.getElementById("requestedStaffRole").value;
  if(!name||!email.includes("@"))return toast("Enter your name and a valid email address.");
  if(members.some(member=>member.email.toLowerCase()===email))return toast("That email already has a demo membership account.");
  try{
    await submitSupabaseStaffApplication({name,email,role});
    openModal(`<div class="modal-head"><h3>Application submitted</h3><button class="close" onclick="closeModal()">×</button></div><p class="hint">Your application is pending owner review. If approved, Supabase will email you a secure account setup link. You can request a password reset from the sign-in screen later.</p><button class="primary" onclick="closeModal()">Done</button>`);
  }catch(error){
    console.error("Supabase staff application failed:",error);
    toast(error.code==="23505"?"There is already a pending application for that email.":error.message||"Could not submit the application.");
  }
};

const demoOpenStaff = window.openStaff;
window.openStaff = function(email=null){
  if(supabaseClient&&!email)return toast("With Supabase enabled, staff accounts are created after an owner approves an application.");
  return demoOpenStaff(email);
};

const demoCreateStaff = window.createStaff;
window.createStaff = function(){
  if(supabaseClient)return toast("With Supabase enabled, staff accounts are created through approved applications.");
  return demoCreateStaff();
};

const demoSaveStaffPermissions = window.saveStaffPermissions;
window.saveStaffPermissions = async function(email){
  if(!supabaseClient)return demoSaveStaffPermissions(email);
  if(activeStaff?.role!=="Owner")return toast("Only the owner can manage staff access.");
  try{
    await saveSupabaseStaffPermissions(email,selectedPermissions());
    await loadSupabaseStaffData();
    closeModal();
    renderAdmin();
    toast("Staff permissions updated.");
  }catch(error){
    console.error("Supabase staff permissions update failed:",error);
    toast(error.message||"Could not update staff permissions.");
  }
};

const demoApproveApplication = window.approveApplication;
window.approveApplication = async function(id){
  if(!supabaseClient)return demoApproveApplication(id);
  if(activeStaff?.role!=="Owner")return toast("Only an existing owner can approve applications.");
  try{
    const result=await reviewSupabaseStaffApplication(id,"approve");
    await loadSupabaseStaffData();
    renderAdmin();
    openModal(`<div class="modal-head"><h3>Application approved</h3><button class="close" onclick="closeModal()">×</button></div><p class="hint">${result.invitationSent?"A secure account setup link was sent to the applicant by email. They can set their password from that link, then use Forgot your password if they need a new reset email.":"The application was approved."}</p><button class="primary" onclick="closeModal()">Done</button>`);
  }catch(error){
    console.error("Supabase staff approval failed:",error);
    toast(error.message||"Could not approve this application.");
  }
};

const demoRejectApplication = window.rejectApplication;
window.rejectApplication = async function(id){
  if(!supabaseClient)return demoRejectApplication(id);
  if(activeStaff?.role!=="Owner")return toast("Only an existing owner can review applications.");
  try{
    await reviewSupabaseStaffApplication(id,"reject");
    await loadSupabaseStaffData();
    renderAdmin();
    toast("Application rejected.");
  }catch(error){
    console.error("Supabase staff application rejection failed:",error);
    toast(error.message||"Could not reject this application.");
  }
};

const demoLogout = window.logout;
window.logout = async function(){
  if(!supabaseClient)return demoLogout();
  const {error}=await supabaseClient.auth.signOut();
  if(error){
    console.error("Supabase sign-out failed:",error);
    return toast("Could not sign out. Please try again.");
  }
  activeStaff=null;
  activeMember=null;
  updateAccountButton();
  renderProducts();
  showStore();
};

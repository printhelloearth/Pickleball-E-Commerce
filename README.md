# AthLife Pickleball Store

https://pickleball-e-commerce-iimf8fmla-builder-5fe3.vercel.app/

# Preview

The preview includes the storefront, cart and demo checkout, customer order tracking, customer membership dashboard, staff dashboard, product and inventory management, order management, point of sale, and owner-managed staff permissions. Demo data is saved in that browser's local storage.

The page structure stays in `frontend.html`; shared styles are in `assets/css/styles.css`. JavaScript is organized into `assets/js/` modules, including `supabase-config.js` and `supabase-auth.js` for optional Supabase staff authentication. Keep these files in their folders when moving the project, and continue opening `frontend.html`.


# Deployment to Vercel

The included [`vercel.json`](./vercel.json) routes the site root to `frontend.html`, so visitors can open the Vercel domain directly.

1. Push this project folder to a GitHub repository, including `frontend.html`, `assets/`, `vercel.json`, and `supabase/`.
2. In Vercel, choose **Add New → Project**, import that GitHub repository, and set the **Root Directory** to this project folder if the repository contains other folders.
3. Select **Other** as the framework preset. This static prototype needs no build command; use `.` as the output directory if Vercel asks for one.
4. Deploy. Vercel will provide a preview URL; merge/push to the configured production branch to publish updates.

The deployment is still a browser-only demo: Vercel does not connect Supabase automatically, and the current membership, staff, inventory, and order state remains in each visitor's browser storage. Do not use the demo credentials or collect real customer data.

Tailwind CSS is loaded from its Play CDN for this no-build prototype and powers the button/card transitions and bouncing hero ball. Section links use a slower 1.5-second eased scroll, and the ticker and other scene effects use CSS animations. Opening the page with an internet connection is required for Tailwind utilities; the existing site styles still provide the core layout and fallback motion. For production, replace the Play CDN with a compiled Tailwind build.

Customers can open **Track order** and enter their order number and checkout email. After placing a demo order, the order-tracking dashboard opens with its details. The status timeline reflects the latest status selected in the staff Orders dashboard.

The storefront has one **Account** button for member, staff, and owner sign-in and registration. New members can register directly. When Supabase is configured, staff and owner applications are stored in Supabase; owners review them in **Staff access**. Approval creates the Auth account and emails a secure setup link instead of generating a temporary password. Staff can use **Forgot your password?** to request a Supabase recovery email and set a new password. Without Supabase configuration, these features remain local-only demo flows and do not send email. Owners can manage staff feature permissions in either mode.

Members receive a demo 10% merchandise discount at checkout and can shop members-only products in the Secret shop on their membership dashboard.

The storefront's **Membership** section highlights the member discount, Secret shop access, online order updates, and order history. The **Be a member** call to action opens the existing member registration flow.

Demo owner account:

- Email: `owner@rally.demo`
- Password: `rally2025`

This is a prototype. It does not process payments, calculate tax, or save storefront, membership, inventory, and order data to Supabase. Those demo features use browser local storage and are not secure. Staff Auth and application review can use Supabase only after configuration below; until then, approval and password reset are simulated/not available. Order number plus email is not production-grade authentication; use signed, expiring tracking links before handling real orders. Do not use real customer or staff data until the project has been fully configured and tested.

<<<<<<< HEAD
## Supabase database blueprint and optional staff Auth
=======
# Supabase database blueprint (not connected to the app)
>>>>>>> 1ae475ec96f4a8f3fea821923135d1f9488d63c4

The `supabase/` folder contains a **database blueprint and the source for one optional staff-application Edge Function**. The schema is not automatically applied when you deploy the site. Most website features still use browser local storage; the Supabase connection described here is limited to staff Auth, staff profiles, and access applications. It does not enable live product, inventory, membership, order, or payment syncing.

<<<<<<< HEAD
1. Create a Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor.
3. In **Authentication → URL Configuration**, set the deployed site URL and add the exact redirect URL ending in `/frontend.html` to the allowed redirect URLs. Configure email delivery/SMTP so invitation and recovery emails can be sent.
4. Create the first owner in Supabase Auth, then follow the owner-bootstrap SQL comment at the bottom of the schema to give that user the `owner` role and include their email.
5. Set `url` and the project's public `anonKey` in [`assets/js/supabase-config.js`](./assets/js/supabase-config.js). The anon key is intended for browser use; never put the service-role key in this file or any frontend asset.
6. Install/sign in to the Supabase CLI, link the project, set the `APP_SITE_URL` function secret to the site's origin (for example, `https://your-domain.vercel.app`), and deploy the function:
   ```powershell
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase secrets set APP_SITE_URL=https://your-domain.vercel.app
   supabase functions deploy manage-staff-application
   ```
   Supabase supplies the function's project URL and API keys. Only this server-side function uses the service-role key to provision accounts; it verifies the caller is an owner first.
7. Reload the site. Staff applications will be stored in Supabase, owner approval will invite the applicant to set a password, and **Forgot your password?** will send a password recovery email. Verify both email links on the deployed site before using real accounts.
8. Before taking real orders, implement trusted Edge Functions for checkout and POS transactions. They must validate prices and inventory and atomically write orders, payments, and inventory movements. Configure payment providers separately; never put secret keys in the browser.
=======
>>>>>>> 1ae475ec96f4a8f3fea821923135d1f9488d63c4

The schema includes products and variants, inventory and movement history, staff roles and permissions, pending access applications, customers and memberships, shared online/in-store orders, discounts, and payment references. Only staff Auth, staff profiles, and staff applications are wired to the frontend when configured; the rest remains a blueprint.

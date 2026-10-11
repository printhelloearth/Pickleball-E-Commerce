# AthLife Pickleball Store

https://pickleball-e-commerce-iimf8fmla-builder-5fe3.vercel.app/

# Preview

The preview includes the storefront, cart and demo checkout, customer order tracking, customer membership dashboard, staff dashboard, product and inventory management, order management, point of sale, and owner-managed staff permissions. Demo data is saved in that browser's local storage.

The page structure stays in `frontend.html`; shared styles are in `assets/css/styles.css`. JavaScript is organized into `assets/js/data.js`, `storefront.js`, `orders.js`, `accounts.js`, `dashboard.js`, `membership.js`, and `scroll.js`, loaded in that order. Keep these files in their folders when moving the project, and continue opening `frontend.html`.


# Deployment to Vercel

The included [`vercel.json`](./vercel.json) routes the site root to `frontend.html`, so visitors can open the Vercel domain directly.

1. Push this project folder to a GitHub repository, including `frontend.html`, `assets/`, `vercel.json`, and `supabase/`.
2. In Vercel, choose **Add New → Project**, import that GitHub repository, and set the **Root Directory** to this project folder if the repository contains other folders.
3. Select **Other** as the framework preset. This static prototype needs no build command; use `.` as the output directory if Vercel asks for one.
4. Deploy. Vercel will provide a preview URL; merge/push to the configured production branch to publish updates.

The deployment is still a browser-only demo: Vercel does not connect Supabase automatically, and the current membership, staff, inventory, and order state remains in each visitor's browser storage. Do not use the demo credentials or collect real customer data.

Tailwind CSS is loaded from its Play CDN for this no-build prototype and powers the button/card transitions and bouncing hero ball. Section links use a slower 1.5-second eased scroll, and the ticker and other scene effects use CSS animations. Opening the page with an internet connection is required for Tailwind utilities; the existing site styles still provide the core layout and fallback motion. For production, replace the Play CDN with a compiled Tailwind build.

Customers can open **Track order** and enter their order number and checkout email. After placing a demo order, the order-tracking dashboard opens with its details. The status timeline reflects the latest status selected in the staff Orders dashboard.

The storefront has one **Account** button for member, staff, and owner sign-in and registration. New members can register directly. Staff and owner registration submits an application; only an existing owner can approve it under **Staff access**. Approval creates a demo account and shows a temporary password once. Owners can continue to add staff directly and set per-feature permissions.

Members receive a demo 10% merchandise discount at checkout and can shop members-only products in the Secret shop on their membership dashboard.

The storefront's **Membership** section highlights the member discount, Secret shop access, online order updates, and order history. The **Be a member** call to action opens the existing member registration flow.

Demo owner account:

- Email: `owner@rally.demo`
- Password: `rally2025`

This is a browser-only prototype. It does not process payments, send email, calculate tax, or connect to a live database. Demo member/staff passwords and applications are stored in local storage and are not secure. Owner/staff approval is only simulated in this browser; it does not send applicants a notification. Order number plus email is not production-grade authentication; use Supabase Auth, server-verified roles and memberships, and signed, expiring tracking links before handling real accounts or orders. Do not use real customer or staff data.

# Supabase database blueprint (not connected to the app)

The `supabase/` folder contains a **database blueprint only**. In particular, `supabase/schema.sql` describes the tables, relationships, policies, and setup steps intended for a future Supabase integration. The current website does not connect to Supabase or read/write data there; its demo data is stored in the browser's local storage. Running the SQL creates the outlined database objects, but does not connect the website to them or enable live authentication, syncing, or checkout.


The schema includes products and variants, inventory and movement history, staff roles and permissions, pending access applications, customers and memberships, shared online/in-store orders, discounts, and payment references. The HTML preview is not yet wired to this schema.

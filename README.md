# AthLife Pickleball Store

## Preview

Open `frontend.html` in a browser. The preview includes the storefront, cart and demo checkout, customer order tracking, customer membership dashboard, staff dashboard, product and inventory management, order management, point of sale, and owner-managed staff permissions. Demo data is saved in that browser's local storage.

Customers can open **Track order** and enter their order number and checkout email. After placing a demo order, the order-tracking dashboard opens with its details. The status timeline reflects the latest status selected in the staff Orders dashboard.

The storefront has one **Account** button for member, staff, and owner sign-in and registration. New members can register directly. Staff and owner registration submits an application; only an existing owner can approve it under **Staff access**. Approval creates a demo account and shows a temporary password once. Owners can continue to add staff directly and set per-feature permissions.

Members receive a demo 10% merchandise discount at checkout and can shop members-only products in the Secret shop on their membership dashboard.

Demo owner account:

- Email: `owner@rally.demo`
- Password: `rally2025`

This is a browser-only prototype. It does not process payments, send email, calculate tax, or connect to a live database. Demo member/staff passwords and applications are stored in local storage and are not secure. Owner/staff approval is only simulated in this browser; it does not send applicants a notification. Order number plus email is not production-grade authentication; use Supabase Auth, server-verified roles and memberships, and signed, expiring tracking links before handling real accounts or orders. Do not use real customer or staff data.

## Supabase foundation

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor.
3. Create the first user in Supabase Auth, then follow the owner-bootstrap SQL comment at the bottom of the schema to give that user the `owner` role.
4. Create staff users through Supabase Auth and assign their `staff_profiles` roles and `permissions` from a trusted owner-only process. Route public role applications through a server-validated workflow; never let registration set a staff or owner role directly.
5. Before taking real orders, connect the app to Supabase Auth and the database, and implement trusted Edge Functions for checkout and POS transactions. Those functions must validate prices and inventory and atomically write orders, payments, and inventory movements.
6. Configure a payment provider for online checkout and a supported in-person payment terminal for POS. Keep secret and service-role keys on the server; never put them in the browser.

The schema includes products and variants, inventory and movement history, staff roles and permissions, pending access applications, customers and memberships, shared online/in-store orders, discounts, and payment references. The HTML preview is not yet wired to this schema.

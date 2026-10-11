# AthLife Pickleball Store

## Preview

Open `index.html` in a browser. The preview includes the storefront, cart and demo checkout, staff dashboard, product and inventory management, order management, and point of sale. Demo data is saved in that browser's local storage.

The storefront has separate **Owner login** and **Staff login** choices. Sign in as the demo owner to create Manager or Cashier accounts and choose their dashboard permissions using **+ Add staff**. Change those permissions later in **Staff access**; staff accounts use Staff login. The account type only supplies default selections—the owner's feature permissions determine actual access.

Demo owner account:

- Email: `owner@rally.demo`
- Password: `rally2025`

This is a browser-only prototype. It does not process payments, send email, calculate tax, or connect to a live database. Demo staff passwords are not securely stored; do not use real customer or staff data.

## Supabase foundation

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor.
3. Create the first user in Supabase Auth, then follow the owner-bootstrap SQL comment at the bottom of the schema to give that user the `owner` role.
4. Create staff users through Supabase Auth and assign their `staff_profiles` roles and `permissions` from a trusted owner-only process.
5. Before taking real orders, connect the app to Supabase Auth and the database, and implement trusted Edge Functions for checkout and POS transactions. Those functions must validate prices and inventory and atomically write orders, payments, and inventory movements.
6. Configure a payment provider for online checkout and a supported in-person payment terminal for POS. Keep secret and service-role keys on the server; never put them in the browser.

The schema includes products and variants, inventory and movement history, staff roles, customers, shared online/in-store orders, discounts, and payment references. The HTML preview is not yet wired to this schema.

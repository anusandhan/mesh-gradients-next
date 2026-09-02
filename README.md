# Mesh Gradient Generator

A beautiful, modern web application for creating customizable mesh gradients using Next.js, TypeScript, and shadcn/ui.

## Features

### 🎨 **Enhanced UI/UX**

- **Light Mode Design**: Clean, modern interface with a light color scheme
- **shadcn/ui Components**: Professional, accessible UI components
- **Responsive Layout**: Works perfectly on desktop and mobile devices
- **Intuitive Controls**: Easy-to-use color pickers and sliders

### 🎛️ **Advanced Controls**

- **Color Customization**: 4 gradient colors + background color
- **Visual Effects**: Adjustable blur, noise, contrast, and saturation
- **Real-time Preview**: See changes instantly as you adjust settings
- **Color Picker Integration**: Both hex input and visual color pickers

### 🎯 **Preset Gradients**

- **Ocean Breeze**: Cool blue tones
- **Sunset Glow**: Warm orange and red hues
- **Forest Mist**: Natural green palette
- **Purple Dream**: Vibrant purple gradients

### 💾 **Export Features**

- **High-Quality Export**: 1920x1080 PNG downloads
- **Random Generation**: Create unique gradients with one click
- **Tooltips**: Helpful guidance for all controls

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Canvas**: HTML5 Canvas API

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## How to Use

1. **Choose Colors**: Use the color pickers or hex inputs to set your gradient colors
2. **Adjust Effects**: Fine-tune blur, noise, contrast, and saturation with the sliders
3. **Try Presets**: Click on preset buttons for quick-start beautiful gradients
4. **Randomize**: Generate unique gradients with the randomize button
5. **Download**: Save your creation as a high-quality PNG image

## Recent Improvements

- ✅ Converted to light mode design
- ✅ Integrated shadcn/ui components
- ✅ Added advanced effect controls (blur, noise, contrast, saturation)
- ✅ Implemented preset gradients
- ✅ Enhanced responsive layout
- ✅ Added tooltips for better UX
- ✅ Improved color picker integration
- ✅ Better visual hierarchy and spacing

## Deployment & Operations

### Canonical domain: always use `www`

Production serves from `https://www.gradients.studio`. The apex domain
`https://gradients.studio` issues a **308 permanent redirect** to `www`.

**Any server-to-server URL must target `www` directly.** Stripe (and most
webhook senders) do **not** follow redirects on POST — a 308 is treated as a
failed delivery. Pointing a Stripe webhook at the apex domain silently breaks
every event with no error surfaced to the app.

This bit us once: live Stripe `checkout.session.completed` events were all
failing with 308 because the endpoint was registered at `gradients.studio`
instead of `www.gradients.studio`, so Pro was never granted after payment.

Applies to: Stripe webhooks, OAuth/SSO callbacks, and any external service
that calls back into the app.

### Stripe

- **Webhook endpoint**: `https://www.gradients.studio/api/webhooks/stripe`,
  subscribed to `checkout.session.completed` and
  `checkout.session.async_payment_succeeded`. Its signing secret must match
  `STRIPE_WEBHOOK_SECRET` in Vercel (Production), or every event is rejected
  with a 400.
- **Entitlements are webhook-only.** The success page (`/?upgraded=1`) is just
  a redirect and never grants Pro; the webhook is the sole writer. If Pro
  isn't granted after a payment, check the endpoint's **Event deliveries** tab
  for non-2xx responses before touching code.
- **Promo / 100%-off codes**: checkout passes `allow_promotion_codes: true`.
  A 100%-off code produces a `checkout.session.completed` with `amount_total:
  0`; the webhook grants Pro on both `paid` and `no_payment_required` states.
  Redeeming a 100% code through the real flow is the cleanest way to comp an
  account (it exercises the whole pipeline).

### Database migrations

`db/schema.sql` is idempotent (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF
NOT EXISTS`). Apply with `npm run db:migrate` against the target
`DATABASE_URL`. The Vercel-managed Neon store's **main branch backs both
development and production**, so a schema change applied once is visible to
both. Migrating prod: run the SQL in the Vercel → Storage → Query console
(toggle Read-only off) or `DATABASE_URL="<prod>" npx tsx scripts/migrate.ts`.

## Testing the Improvements

1. **Color Controls**: Try changing colors using both hex inputs and color pickers
2. **Effect Sliders**: Adjust blur, noise, contrast, and saturation to see real-time changes
3. **Presets**: Click different preset buttons to see instant gradient changes
4. **Randomize**: Click the randomize button to generate unique gradients
5. **Download**: Test the download functionality to save your gradients
6. **Responsive**: Resize your browser window to test mobile responsiveness

## Commit Summary

**feat: Modernize Mesh Gradient Generator with shadcn/ui and enhanced UX**

- Convert to light mode design with modern UI
- Integrate shadcn/ui components for professional look
- Add advanced effect controls (blur, noise, contrast, saturation)
- Implement preset gradients for quick-start options
- Enhance responsive layout and accessibility
- Add tooltips and better visual feedback
- Improve color picker integration with dual input/visual controls

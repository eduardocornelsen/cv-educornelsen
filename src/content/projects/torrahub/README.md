## The Problem

A specialty-coffee brand runs on six tools: a store builder, an ERP, a spreadsheet for roasting, a bank app, a shipping portal and a WhatsApp list. Each one knows a piece of the business, and none of them can say what a bag of coffee actually earned after freight, gateway fees and taxes.

**TorraHub** is the system I built to put that in one place, starting with a real coffee producer's own brand. **RodeAqui** is the same platform for any small online store.

![Dashboard](painel-resumo.webp)

---

## What It Is

- **Multi-tenant SaaS:** Next.js, TypeScript and Postgres (Supabase) with row-level security, in a Turborepo monorepo with storefront, admin, order-ahead and marketing apps.
- **Live store in production**, with a certified Mercado Pago integration (Pix, card and recurring billing for the subscription club) and shipping quotes.
- **About 50 admin screens**, including the ones that matter to a data person:
  - contribution margin by sales channel
  - monthly P&L (DRE) and cash projection
  - moving-average cost of goods
  - roast planning from sales velocity
- **Analytics layer:** 18 dbt models generated from one semantic schema, with a CI test that fails if the models drift from it. The built-in AI analyst reads that layer (see the Analista IA case study).

![AI analyst](analista.webp)

---

## Demos You Can Open

The sites are in Portuguese and the demo stores are fictional (Café Serrano for TorraHub, Vale Cosméticos for RodeAqui):

- [torrahub.com.br](https://torrahub.com.br) · [TorraHub demo](https://torrahub.com/demo)
- [rodeaqui.com](https://rodeaqui.com) · [RodeAqui demo](https://rodeaqui.com/demo)

![AI board](diretoria.webp)

![RodeAqui](rodeaqui-home.webp)

---

## Stack

`Next.js` · `React` · `TypeScript` · `PostgreSQL` · `Supabase` · `Drizzle` · `dbt` · `Mercado Pago` · `Vercel`

# The Bantu's Stall — stall display + sales tracker

Next.js 15 (App Router, TypeScript, Tailwind) + MongoDB for a food and 3D-printed pendant stall.

- **`/`** — the customer-facing monitor display. It is read-only, fits one 16:9 screen with no scrolling, and never touches the database.
- **`/tracker`** — your sales tracker, locked with a 4-digit PIN (`TRACKER_PIN`, default **1001**). Each device enters it once and stays unlocked for 30 days (🔒 **Lock** in the header locks it again). Tap an item to record a sale. It works offline and syncs when the connection comes back.

```
app/
  page.tsx                 monitor display (static)
  tracker/page.tsx         sales tracker
  api/sales/route.ts       GET today · POST sale · DELETE (reset day)
  api/sales/[id]/route.ts  DELETE one sale (by _id or clientId)
  api/sales/undo/route.ts  POST delete most recent sale
  api/sales/csv/route.ts   GET all sales as CSV
components/
  display/                 Carousel, PendantCards, PriceBoard, Display
  tracker/                 Tracker, ConfirmModal
  FoodArt.tsx              SVG fallbacks for missing food photos
  ModelArt.tsx             illustrated models wearing the pendants
  ItemVisual.tsx           photo-or-illustration picker
lib/
  menu.ts                  ← single source of truth for items & prices
  mongodb.ts               cached MongoClient + indexes
  sales.ts                 types, totals, "today" (IST)
  useSales.ts              SWR polling + offline queue
public/img/                cross.jpg, fish.jpg (+ optional food-*.jpg)
```

The server always looks up prices in `lib/menu.ts` and ignores any price the client sends. To change a price, edit that one file.

**Food photos:** put `food-plate.jpg`, `food-combo.jpg` and `food-drink.jpg` in `public/img/` and the display uses them automatically. Until then it shows illustrations. After adding photos, restart `npm run dev` or redeploy.

---

## 1. Create a free MongoDB Atlas database

1. Sign up at <https://www.mongodb.com/cloud/atlas/register> and create a **free M0 cluster**. Pick a region close to you, such as Mumbai `ap-south-1`.
2. **Database user:** go to *Security → Database Access → Add New Database User*. Choose password auth, enter a username and an auto-generated password (save it), and pick the role *Read and write to any database*.
3. **Network access:** go to *Security → Network Access → Add IP Address → Allow access from anywhere* (`0.0.0.0/0`). You need this for Vercel and for venue Wi-Fi, where your IP changes.
4. **Connection string:** go to *Database → Connect → Drivers → Node.js* and copy the `mongodb+srv://…` string. Replace `<password>` with your user's password. If the password contains `@ : / ? #`, URL-encode it.
5. Create `.env.local` in the project root:

   ```bash
   cp .env.example .env.local
   ```

   Then edit it:

   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=stall
   TRACKER_PIN=1001
   ```

   `.env.local` is git-ignored. Never commit it.

The `sales` collection and its indexes (a unique index on `clientId` and an index on `createdAt`) are created automatically on the first request.

## 2. Run locally

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:3000> (display) and <http://localhost:3000/tracker> (tracker).

To use the tracker from your phone on the same Wi-Fi, open `http://<laptop-ip>:3000/tracker`.

Other commands: `npm run build`, `npm start`, `npm run lint`.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo (`.env.local` stays out because it is git-ignored).
2. At <https://vercel.com/new>, import the repo. The framework is detected as Next.js.
3. Under *Settings → Environment Variables*, add **`MONGODB_URI`**, **`MONGODB_DB`** (`stall`) and **`TRACKER_PIN`** (`1001`) for Production and Preview.
4. Deploy. Your URLs are `https://<project>.vercel.app/` and `/tracker`.

"Today" means the India calendar day (UTC+5:30). If your event is elsewhere, set `STALL_UTC_OFFSET_MINUTES`.

## 4. Day-of checklist

- [ ] **Monitor:** open `/`, press **F11** (or hover and click *Fullscreen*). The cursor hides after 3 seconds.
- [ ] **Laptop/phone:** open `/tracker` and enter the PIN **1001**. The dot in the header should be green, showing **Synced**.
- [ ] **Reset day:** tap *Reset day* and confirm, so yesterday's tests don't count.
- [ ] **Test sale:** tap any item. You should see a toast, and the total should go up. Tap **Undo last**, and the total should go back to ₹0.
- [ ] Pick **Cash** or **UPI** before each tap. The toggle applies to the next taps.
- [ ] At the end, use **Copy summary** to paste into WhatsApp and **Download CSV** for records.

### If the Wi-Fi drops

Keep tapping. Sales wait in the browser (localStorage), and the header shows a red **Offline** dot with "Offline — N sales waiting to sync". The tracker retries every 5 seconds and whenever the device comes back online. Each sale has a unique `clientId`, so retries never double-count. Don't clear the browser data while sales are waiting.

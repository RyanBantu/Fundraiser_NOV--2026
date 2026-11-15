export type ItemId = "plate" | "extra" | "combo" | "drink" | "cross" | "fish";
export type ItemGroup = "Food" | "Combo" | "Drink" | "3D print";
export type PayMethod = "cash" | "upi";

export interface MenuItem {
  id: ItemId;
  name: string;
  /** Short label for small tap cards. */
  short: string;
  price: number;
  group: ItemGroup;
  image: string;
  /** One-line description used on the monitor carousel. */
  blurb: string;
}

/** Single source of truth for items and prices. The server always prices sales from here. */
export const MENU: readonly MenuItem[] = [
  {
    id: "plate",
    name: "Chicken with potatoes",
    short: "Chicken plate",
    price: 69,
    group: "Food",
    image: "/img/food-plate.jpg",
    blurb: "Flame-grilled chicken with golden roast potatoes.",
  },
  {
    id: "extra",
    name: "Extra chicken",
    short: "Extra chicken",
    price: 25,
    group: "Food",
    image: "/img/food-extra.jpg",
    blurb: "Add another piece of grilled chicken to your plate.",
  },
  {
    id: "combo",
    name: "Chicken + potatoes + cool drink",
    short: "Combo",
    price: 89,
    group: "Combo",
    image: "/img/food-combo.jpg",
    blurb: "The full plate plus an ice-cold drink.",
  },
  {
    id: "drink",
    name: "Cool drink (glass)",
    short: "Cool drink",
    price: 25,
    group: "Drink",
    image: "/img/food-drink.jpg",
    blurb: "A tall glass, poured cold.",
  },
  {
    id: "cross",
    name: "Cross pendant",
    short: "Cross",
    price: 99,
    group: "3D print",
    image: "/img/cross.jpg",
    blurb: "3D-printed here, ready to wear today.",
  },
  {
    id: "fish",
    name: "“JESUS” fish pendant",
    short: "JESUS fish",
    price: 129,
    group: "3D print",
    image: "/img/fish.jpg",
    blurb: "The ichthys, lettered and printed by hand.",
  },
] as const;

export const ITEM_IDS = MENU.map((m) => m.id) as [ItemId, ...ItemId[]];

const BY_ID = new Map<string, MenuItem>(MENU.map((m) => [m.id, m]));

export function getItem(id: string): MenuItem | undefined {
  return BY_ID.get(id);
}

export const FOOD_ITEMS = MENU.filter((m) => m.group !== "3D print");
export const PENDANT_ITEMS = MENU.filter((m) => m.group === "3D print");

/** How much the combo saves versus buying the plate and drink separately (badge hidden if ≤ 0). */
export const COMBO_SAVING =
  (getItem("plate")!.price + getItem("drink")!.price) - getItem("combo")!.price;

export const STALL_NAME = "The Bantu's Stall";

export function rupees(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

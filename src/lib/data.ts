import type { Base, Table } from "~/types";

export const bases: Base[] = [
  { id: "base1", name: "Marketing", description: "Marketing base" },
  { id: "base2", name: "Sales", description: "Sales base" },
];

export const tables: Table[] = [
  { id: "table1", name: "Contacts" },
  { id: "table2", name: "Campaigns" },
];

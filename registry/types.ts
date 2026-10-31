export type Category = "components" | "blocks";

export interface ItemMeta {
  title: string;
  category: Category;
  tags: string[];
  added: string;
  source?: { project: string; url?: string };
}

/**
 * One-off: export catalog products to an Excel-compatible .xlsx (SpreadsheetML).
 * Usage: npx tsx --tsconfig tsconfig.json scripts/export-products-affiliate-sheet.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { categories } from "@/content/taxonomy/categories";

const brandById = new Map(brands.map((b) => [b.id, b.name]));
const categoryById = new Map(categories.map((c) => [c.id, c.name]));

const headers = [
  "id",
  "slug",
  "name",
  "fullName",
  "brand",
  "category",
  "lifecycleStatus",
  "affiliateUrl",
] as const;

type Row = Record<(typeof headers)[number], string>;

const rows: Row[] = [...products]
  .sort((a, b) => a.fullName.localeCompare(b.fullName))
  .map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    fullName: p.fullName,
    brand: brandById.get(p.brandId) ?? p.brandId,
    category: categoryById.get(p.categoryId) ?? p.categoryId,
    lifecycleStatus: p.lifecycleStatus,
    affiliateUrl: "",
  }));

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cell(value: string): string {
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

const headerRow = `<Row>${headers.map((h) => cell(h)).join("")}</Row>`;
const dataRows = rows
  .map((r) => `<Row>${headers.map((h) => cell(r[h])).join("")}</Row>`)
  .join("\n");

const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Products">
  <Table>
${headerRow}
${dataRows}
  </Table>
 </Worksheet>
</Workbook>
`;

// SpreadsheetML — Excel opens this as a workbook (.xls avoids extension mismatch warnings)
const outPath = resolve(process.cwd(), "kitletics-products-affiliate-urls.xls");
writeFileSync(outPath, workbook, "utf8");
console.log(`Wrote ${rows.length} products to ${outPath}`);

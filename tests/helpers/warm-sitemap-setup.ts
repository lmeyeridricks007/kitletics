/**
 * Catalog-integration setup — warm sitemap once per worker before suites run.
 * Requires isolate:false so the fixture/module caches survive across files.
 */
import { getSitemapEntriesFixture } from "./sitemap-fixture";

getSitemapEntriesFixture();

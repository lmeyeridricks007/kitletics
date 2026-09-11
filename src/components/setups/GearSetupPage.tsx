import { Container } from "@/components/layout/Container";
import { TrustRow } from "@/components/home/TrustRow";
import { GearSetupHero } from "@/components/setups/GearSetupHero";
import { GearSetupSummary } from "@/components/setups/GearSetupSummary";
import { GearSetupNav } from "@/components/setups/GearSetupNav";
import { GearSetupItemList } from "@/components/setups/GearSetupItemList";
import {
  GearSetupWhyPanel,
  GearSetupVariantPanel,
  GearSetupRelatedGuides,
  GearSetupFinderPanel,
  GearSetupAlternatives,
  GearSetupNextItems,
} from "@/components/setups/GearSetupSidebar";
import { GearSetupChecklist } from "@/components/setups/GearSetupChecklist";
import type { GearSetupPageData } from "@/lib/setups/get-gear-setup-page-data";

interface GearSetupPageProps {
  data: GearSetupPageData;
}

export function GearSetupPage({ data }: GearSetupPageProps) {
  const kitTitle = `The ${data.setup.title}`;

  return (
    <>
      <div id="kit-overview" className="scroll-mt-16">
        <GearSetupHero data={data} />
        <GearSetupSummary data={data} />
      </div>
      <GearSetupNav />

      <Container size="wide" className="py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.34fr)] lg:items-start lg:gap-10">
          <div className="min-w-0 space-y-10">
            <GearSetupItemList
              items={data.allListItems}
              title={kitTitle}
              howWeChooseHref={data.howWeChooseHref}
            />

            {/* Mobile sidebar blocks after core list */}
            <div className="space-y-4 lg:hidden">
              <GearSetupWhyPanel data={data} />
              <GearSetupVariantPanel data={data} />
              <GearSetupRelatedGuides data={data} />
              <GearSetupFinderPanel data={data} />
            </div>

            <GearSetupAlternatives data={data} />
            <GearSetupNextItems data={data} />
            <GearSetupChecklist
              items={data.checklist}
              storageKey={`kitletics-setup-checklist:${data.setup.slug}`}
            />
          </div>

          <aside className="hidden space-y-4 lg:sticky lg:top-14 lg:block lg:self-start">
            <GearSetupWhyPanel data={data} />
            <GearSetupVariantPanel data={data} />
            <GearSetupRelatedGuides data={data} />
            <GearSetupFinderPanel data={data} />
          </aside>
        </div>
      </Container>

      <TrustRow />
    </>
  );
}

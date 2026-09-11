import { peerGuideIdsFor } from "@/content/link-graph-p47";
import { getBuyingGuides, getBuyingGuideById } from "@/repositories";
console.log("peers from choose-watch", peerGuideIdsFor("guide-choose-watch"));
console.log("hyrox by id", getBuyingGuideById("guide-choose-hyrox-watch")?.slug);
const watch = getBuyingGuides({isDev:false}).find(g => g.id === "guide-choose-watch");
console.log("choose-watch relatedGuideIds", watch?.relatedGuideIds);
console.log("choose-watch relatedBest", watch?.relatedBestGuideIds);

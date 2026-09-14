export interface ChartBarPoint {
  id: string;
  label: string;
  count: number;
  share: number;
  href: string;
}

export interface CompositionChartModel {
  kind: "composition";
  metric: string;
  points: ChartBarPoint[];
  sampleSize: number;
  populationSize: number;
}

export interface PadelRacketDataExplorerPanel {
  id: string;
  headline: string;
  interpretation: string;
  sampleNote: string;
  chart: CompositionChartModel;
}

export interface PadelRacketDataExplorerPayload {
  eligibleCount: number;
  unitOfAnalysis: "product-model";
  panels: PadelRacketDataExplorerPanel[];
  /** Charts withheld when sample below threshold */
  withheldNotes: string[];
}

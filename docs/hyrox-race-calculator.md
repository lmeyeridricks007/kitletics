# HYROX Race Time Calculator

`/tools/hyrox-race-time-calculator`

## Purpose

Arithmetic race **plan** from user assumptions. Not a physiological predictor.

## Data source

`getCurrentHyroxSinglesFormat()` → Season 26/27 `CompetitionFormat`.

Segment sequence = `getStationSequence(format)` (run₁, station₁, …).

## Modes

1. **Simple** — avg run pace/km + avg station + transition allowance  
2. **Advanced** — per-segment mm:ss  
3. **Target finish** — stations + transitions fixed → required avg run pace  

Impossible target: if stations + transitions ≥ target → clear error.

## Formulas

```
total = Σ runs + Σ stations + transitions
requiredPaceSecPerKm = (target - stations - transitions) / runCount
```

Rounding: whole seconds; display `m:ss` or `h:mm:ss`.

## Limitations

Crowding, Roxzone, fatigue and execution are not modelled. Label output as **race plan estimate**.

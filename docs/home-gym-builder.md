# Home Gym Builder

Flagship Kitletics decision tool at `/tools/home-gym-builder`.

## Purpose

Recommend a **compatible product set** for a real room, training goals and budget — then place it on a **2D floor plan**.

Not: “top five products in the catalog.”

## Workflow

1. Space (dimensions, ceiling, mounting, optional door swing)
2. How you train (goals + exercises)
3. Priorities (up to 3) + noise
4. Owned equipment
5. Budget (strict / target / flexible)
6. Result: setup + 2D layout + coverage + alternatives + upgrades

Modes: **Build from scratch** · **Improve my gym** · **Plan around owned**  
Depth: **Quick** · **Advanced**

## Coordinate system

- Origin: **top-left (north-west)** of the floor plan
- +X: width (left → right)
- +Y: length (top → bottom)
- Internal units: **millimetres**
- Rotation: 0° / 90° / 180° / 270° clockwise

## Optimization

Hard constraints (invalid):

- Physical footprint / ceiling exceedance
- Wall/floor mounting forbidden when required
- Strict budget overrun
- Hard incompatibilities (`ProductCompatibility`)
- Door swing / restricted zones / obstacles

Soft penalties: noise, footprint, unknown dimensions, price missing (never €0).

Budget is a **ceiling**, not a spend target (`spendStyle: minimal | maximize-budget`).

Affiliate commission is **never** an input.

## Clearances

| Kind | Meaning |
| --- | --- |
| Physical footprint | Product body |
| Operating | In-use envelope when published |
| Kitletics planning | Conservative allowance — **not** manufacturer safety |

Unknown height ⇒ **unknown** fit (never “fits”).

Product can **fit** while an activity (pull-ups, muscle-ups) is **limited** by ceiling.

## Results

- Exercise coverage: supported / partial / not-supported
- Goal coverage bands
- Known price total + count of unavailable prices
- Alternative builds when meaningfully different
- Upgrade path: start → next → later → optional
- Shop via existing Offer engine (multi-retailer OK)

## Save / share

- Local: `kitletics.my-gyms.v1` / `kitletics.saved-room.v1`
- Share: `?build=` base64 JSON (IDs + room + placements only)
- Shared builds rehydrate **current Offers**; product dimensions always from catalog
- User builds: **noindex**

## Limitations (explicit)

Kitletics is a **planning tool**, not structural engineering software.

It does **not** validate:

- Wall structural strength
- Floor structural load capacity
- Electrical installation
- Building regulations
- Professional gym safety certification

## Related

- [Room layout engine](./room-layout-engine.md)
- Prompt 19 onboarding should research dimensions / mounting / clearances
- Prompt 20 freshness should flag dimension and compatibility changes for saved builds

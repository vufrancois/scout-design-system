# UX Enhancement Summaries

Per-view enhancement logs from the UI/UX improvement phase. Each file documents what changed in the view and any design-system components or rules added along the way.

| View | Summary |
|---|---|
| Reviews | [reviews.md](reviews.md) |
| Campaigns | [campaigns.md](campaigns.md) |
| Promotions | [promotions.md](promotions.md) |
| Price Lists | [price-lists.md](price-lists.md) |
| Customer Groups | [customer-groups.md](customer-groups.md) |
| Organizations + Organization detail | [organizations.md](organizations.md) |
| Properties + Property detail | [properties.md](properties.md) |
| Inventory | [inventory.md](inventory.md) |
| Products | [products.md](products.md) |

Remaining views: Orders, Quotes, Insights.

## Format

Every summary follows the same structure:

```markdown
# <View> — UX Enhancement Summary

**View:** [<view>.html](https://scout-design-system-beta.vercel.app/<view>.html)
**Date:** MM/DD/YYYY

## <Thematic heading for the group of changes>

### 1. <Enhancement title>
One short paragraph, client-readable, bolding the key numbers/labels.

## Design system additions
- **<Component or rule>** — what was added and why it generalizes
  (or: None — this view is a pure application of existing components.)
```

- Numbering runs continuously across section headings (and into addendums).
- Follow-up work on an already-summarized view goes under
  `## Addendum — <topic> (MM/DD/YYYY)`, continuing the numbering, with its own
  `## Design system additions (addendum)` if rules changed.

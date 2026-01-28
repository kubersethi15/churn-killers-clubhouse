# Churn Is Dead - Design System

**Last Updated:** January 2026  
**Aesthetic:** Professional, enterprise-grade B2B SaaS  
**Target Audience:** CSMs, CS Leaders, VPs of Customer Success

---

## 1. Brand Principles

- **No emojis** in headings, CTAs, buttons, or professional content
- **Concise copy**: 2-3 words max for buttons/CTAs
- **Professional tone**: Comparable to Gong, Gainsight, enterprise B2B leaders
- **Clean hierarchy**: Clear visual structure, generous whitespace
- **Consistent spacing**: Use standardized spacing scale

---

## 2. Color Palette

All colors are defined in HSL format in `index.css` and extended in `tailwind.config.ts`.

### Primary Brand Colors

| Token         | HSL Value          | Usage                        |
|---------------|-------------------|------------------------------|
| `navy-dark`   | 220, 45%, 12%     | Primary headings, dark backgrounds |
| `navy`        | 220, 45%, 18%     | Secondary navy elements      |
| `navy-light`  | 220, 45%, 28%     | Lighter navy accents         |
| `red`         | 358, 85%, 52%     | CTAs, accents, alerts        |
| `red-light`   | 358, 85%, 62%     | Hover states                 |
| `red-dark`    | 358, 85%, 42%     | Active states                |
| `cream`       | 36, 100%, 97%     | Section backgrounds          |

### Semantic Colors

| Token              | Usage                              |
|--------------------|------------------------------------|
| `background`       | Page background (white)            |
| `foreground`       | Default text                       |
| `muted`            | Muted backgrounds                  |
| `muted-foreground` | Secondary text                     |
| `destructive`      | Error states, destructive actions  |

### Report-Specific Tokens

| Token               | Usage                              |
|---------------------|------------------------------------|
| `report-heading`    | Report section headings            |
| `report-text`       | Report body text                   |
| `report-muted`      | Report secondary text              |
| `report-surface`    | Report card backgrounds            |
| `report-border`     | Report card borders                |

### Status Colors (Badges/Indicators)

| Status   | Background      | Text           | Border         |
|----------|-----------------|----------------|----------------|
| Success  | `emerald-50`    | `emerald-700`  | `emerald-200`  |
| Warning  | `amber-50`      | `amber-700`    | `amber-200`    |
| Error    | `red-50`        | `red-700`      | `red-200`      |
| Neutral  | `slate-50`      | `slate-600`    | `slate-200`    |

---

## 3. Typography

### Font Families

| Type  | Family            | Weights         | Usage                    |
|-------|-------------------|-----------------|--------------------------|
| Serif | Playfair Display  | 400, 700, 900   | Headings, titles         |
| Sans  | Inter             | 300-700         | Body, UI, labels         |

### Type Scale

| Element       | Font       | Size (Mobile) | Size (Desktop) | Weight   | Tracking      |
|---------------|------------|---------------|----------------|----------|---------------|
| H1            | Serif      | 2rem (32px)   | 3rem (48px)    | 900      | tight         |
| H2            | Serif      | 1.5rem (24px) | 2rem (32px)    | 700      | tight         |
| H3            | Serif      | 1.25rem (20px)| 1.5rem (24px)  | 700      | normal        |
| Section Title | Serif      | 1.125rem (18px)| 1.25rem (20px)| 700      | tight         |
| Body Large    | Sans       | 1rem (16px)   | 1.125rem (18px)| 400      | normal        |
| Body          | Sans       | 0.875rem (14px)| 0.875rem (14px)| 400     | normal        |
| Label         | Sans       | 0.75rem (12px) | 0.75rem (12px)| 500      | normal        |
| Label Upper   | Sans       | 0.6875rem (11px)| 0.6875rem (11px)| 600   | wider (0.05em)|
| Metric Label  | Sans       | 0.625rem (10px)| 0.625rem (10px)| 500     | wide (0.04em) |

### Line Heights

- Headings: `1.2` (tight)
- Body: `1.6` (relaxed)
- Labels: `1.4`

---

## 4. Spacing Scale

Use Tailwind's default spacing scale consistently:

| Token | Value   | Usage                              |
|-------|---------|-------------------------------------|
| 1     | 4px     | Inline spacing, icon gaps           |
| 2     | 8px     | Tight element spacing               |
| 3     | 12px    | Standard small gap                  |
| 4     | 16px    | Standard element padding            |
| 5     | 20px    | Card padding, section gaps          |
| 6     | 24px    | Large element spacing               |
| 8     | 32px    | Section padding                     |
| 10    | 40px    | Large section gaps                  |
| 12    | 48px    | Major section padding               |
| 16    | 64px    | Page section padding (mobile)       |
| 20    | 80px    | Page section padding (desktop)      |

### Standard Patterns

- **Card padding**: `p-5` (20px) or `p-6` (24px)
- **Card header padding**: `px-5 py-4` 
- **Section padding**: `py-14 md:py-20` (56px mobile, 80px desktop)
- **Container max-width**: `max-w-3xl` (prose), `max-w-4xl` (content), `max-w-5xl` (wide)
- **Grid gaps**: `gap-3` (compact), `gap-4` (standard), `gap-6` (spacious)

---

## 5. Component Standards

### Buttons

| Variant       | Background       | Text          | Usage                    |
|---------------|------------------|---------------|--------------------------|
| Primary       | `bg-red-600`     | White         | Main CTAs                |
| Secondary     | `bg-navy-dark`   | White         | Secondary actions        |
| Outline       | Transparent      | `navy-dark`   | Tertiary actions         |
| Ghost         | Transparent      | Inherit       | Subtle actions           |

**Button Copy Rules:**
- Max 2-3 words
- No emojis
- Action verbs: "Join Free", "Try Free", "Read", "View All"

### Cards

```
Border: border-report-border (1px)
Border Radius: rounded-xl (12px)
Shadow: shadow-sm (default), shadow-md (hover)
Background: bg-card
```

### Badges

```
Font: text-xs font-medium
Padding: px-2 py-0.5
Border Radius: rounded-md
Border: 1px solid
```

### Tables

```
Header: bg-report-surface/50
Row Hover: hover:bg-report-surface/40
Cell Padding: px-4 py-3
```

---

## 6. Icon Usage

### Sizes

| Context        | Size    | Class      |
|----------------|---------|------------|
| Inline text    | 16px    | `w-4 h-4`  |
| Button icon    | 20px    | `w-5 h-5`  |
| Card header    | 20px    | `w-5 h-5`  |
| Feature icon   | 24px    | `w-6 h-6`  |
| Hero icon      | 32px    | `w-8 h-8`  |

### Icon Containers

```
Standard: p-2.5 rounded-xl
Small: p-1.5 rounded-lg
```

---

## 7. Border Radius

| Token     | Value  | Usage                    |
|-----------|--------|--------------------------|
| `sm`      | 4px    | Small elements, inputs   |
| `md`      | 6px    | Badges, small cards      |
| `lg`      | 8px    | Default (--radius)       |
| `xl`      | 12px   | Cards, containers        |
| `2xl`     | 16px   | Large containers         |
| `full`    | 50%    | Avatars, dots            |

---

## 8. Shadows

| Level    | Class        | Usage                    |
|----------|--------------|--------------------------|
| None     | `shadow-none`| Flat elements            |
| Small    | `shadow-sm`  | Cards, subtle depth      |
| Medium   | `shadow-md`  | Hover states, dropdowns  |
| Large    | `shadow-lg`  | Modals, overlays         |

---

## 9. Responsive Breakpoints

| Breakpoint | Min Width | Usage                    |
|------------|-----------|--------------------------|
| `sm`       | 640px     | Small tablets            |
| `md`       | 768px     | Tablets, hide mobile nav |
| `lg`       | 1024px    | Desktop                  |
| `xl`       | 1280px    | Large desktop            |
| `2xl`      | 1400px    | Container max-width      |

---

## 10. Content Rules

### No Emojis Policy
- ❌ No emojis in headings
- ❌ No emojis in buttons/CTAs
- ❌ No emojis in professional content sections
- ✅ Use Lucide icons for visual indicators

### Copy Guidelines
- Buttons: 2-3 words max ("Join Free", "Read", "Try Free")
- Headings: Clear, benefit-focused, no fluff
- Body: Concise, scannable, action-oriented

---

## 11. Animation

### Standard Transitions

```
Duration: 200ms (fast), 300ms (default)
Easing: ease-out
Properties: color, background-color, shadow, transform
```

### Hover States

- Cards: `hover:shadow-md transition-shadow duration-200`
- Buttons: `hover:scale-103` (optional)
- Links: `hover:text-red-600`

---

## 12. Report-Specific Styles

Located in `src/components/cs-analyzer/report/reportStyles.ts`:

### Typography Tokens

```typescript
sectionTitle: "font-serif text-lg font-bold text-report-heading tracking-tight"
sectionSubtitle: "text-sm font-normal text-report-muted"
bodyText: "font-sans text-sm leading-relaxed text-report-text"
labelUppercase: "font-sans text-[11px] font-semibold uppercase tracking-wider text-report-muted"
```

### Layout Tokens

```typescript
card: "rounded-xl border border-report-border bg-card shadow-sm hover:shadow-md transition-shadow"
cardHeader: "px-5 py-4 border-b border-report-border bg-report-surface/30"
iconContainer: "p-2.5 rounded-xl"
```

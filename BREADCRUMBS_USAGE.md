# Breadcrumbs Usage Guide

## Simple Setup

The breadcrumbs component accepts an array of items. Each page defines its own breadcrumb path.

## Basic Usage

```tsx
import Breadcrumbs from "@/components/Dashboard/CommonComponents/Breadcrumbs";

// In your component
<Breadcrumbs
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Current Page" },
  ]}
/>;
```

## Examples

### Two-level breadcrumb

```tsx
<Breadcrumbs
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Client Panel" },
  ]}
/>
```

**Result:** Dashboard > Client Panel

---

### Three-level breadcrumb

```tsx
<Breadcrumbs
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Clients", href: "/dashboard/clients" },
    { label: "John Doe" },
  ]}
/>
```

**Result:** Dashboard > Clients > John Doe

---

### Four-level breadcrumb

```tsx
<Breadcrumbs
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Salon", href: "/dashboard/salon" },
    { label: "Services", href: "/dashboard/salon/services" },
    { label: "Edit Service" },
  ]}
/>
```

**Result:** Dashboard > Salon > Services > Edit Service

---

## Rules

1. **Last item has no href** - it's the current page (not clickable)
2. **First item shows home icon** - automatically added
3. **All other items need href** - to be clickable links

## Quick Templates

### Client Panel

```tsx
<Breadcrumbs
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Client Panel" },
  ]}
/>
```

### Admin Panel

```tsx
<Breadcrumbs
  items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Admin Panel" }]}
/>
```

### Clients List

```tsx
<Breadcrumbs
  items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Clients" }]}
/>
```

### Client Details

```tsx
<Breadcrumbs
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Clients", href: "/dashboard/clients" },
    { label: clientName },
  ]}
/>
```

### Edit Client

```tsx
<Breadcrumbs
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Clients", href: "/dashboard/clients" },
    { label: clientName, href: `/dashboard/clients/${clientId}` },
    { label: "Edit" },
  ]}
/>
```

---

## That's it!

Just copy-paste the template you need and adjust the labels and hrefs.

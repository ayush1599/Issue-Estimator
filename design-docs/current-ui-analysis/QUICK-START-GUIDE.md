# Issue Estimator - shadcn/ui Quick Start Guide

## 🚀 Fast Track Implementation Guide

This quick start guide provides the essential steps to begin migrating the Issue Estimator to React + shadcn/ui.

---

## Step 1: Project Setup (15 minutes)

### Create New React + TypeScript Project

```bash
# Create project with Vite
npm create vite@latest issue-estimator -- --template react-ts
cd issue-estimator
npm install
```

### Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Install shadcn/ui

```bash
npx shadcn@latest init
```

**When prompted, select:**
- Style: Default
- Base color: Slate (or custom)
- CSS variables: Yes

---

## Step 2: Install All Components (5 minutes)

### One-Command Installation

```bash
npx shadcn@latest add input label button form navigation-menu tabs table badge card separator alert alert-dialog toast progress skeleton dialog sheet scroll-area tooltip
```

### Install Additional Dependencies

```bash
# Form validation
npm install react-hook-form zod @hookform/resolvers/zod

# Utilities
npm install clsx tailwind-merge class-variance-authority

# Icons and extras
npm install lucide-react date-fns dompurify @types/dompurify
```

---

## Step 3: Configure Custom Theme (10 minutes)

### Update `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Layer system (4 depths)
        layer: {
          0: '#e6eaec',
          1: '#f4faff',
          2: '#fafcff',
          3: '#ffffff',
        },
        // Primary brand colors
        thistle: {
          100: '#e0e0e0',
          200: '#d0d0d0',
          500: '#1a1a1a',
          600: '#151515',
          700: '#0f0f0f',
        },
        // Text colors
        text: {
          primary: '#1f282d',
          secondary: '#4f646f',
          tertiary: '#8a9ba8',
        },
        // Utility colors
        info: {
          500: '#3b82f6',
          600: '#2563eb',
        },
        danger: '#dc2626',
      },
      boxShadow: {
        // Two-layer shadow system
        '2l-sm': 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.1)',
        '2l-md': 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.15)',
        '2l-lg': 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Update `src/index.css`

Add CSS variables (in addition to shadcn defaults):

```css
@layer base {
  :root {
    /* Layer system */
    --layer-0: #e6eaec;
    --layer-1: #f4faff;
    --layer-2: #fafcff;
    --layer-3: #ffffff;

    /* Thistle (primary brand) */
    --thistle-100: #e0e0e0;
    --thistle-200: #d0d0d0;
    --thistle-500: #1a1a1a;
    --thistle-600: #151515;
    --thistle-700: #0f0f0f;

    /* Text colors */
    --text-primary: #1f282d;
    --text-secondary: #4f646f;
    --text-tertiary: #8a9ba8;

    /* Border colors */
    --border-color: #c9d5d5;
    --border-focus: #666666;

    /* Utility */
    --info-500: #3b82f6;
    --info-600: #2563eb;
    --danger-color: #dc2626;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Step 4: Create Custom Components (20 minutes)

### 1. CircularProgress Component

Create `src/components/ui/circular-progress.tsx`:

```tsx
import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number  // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 opacity-30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-info-600 transition-all duration-300 ease-in-out"
        />
      </svg>

      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  )
}
```

### 2. ComplexityBadge Component

Create `src/components/features/ComplexityBadge.tsx`:

```tsx
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ComplexityBadgeProps {
  complexity: "Low" | "Medium" | "High" | "Very High"
  className?: string
}

export function ComplexityBadge({ complexity, className }: ComplexityBadgeProps) {
  const variants = {
    "Low": {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
    },
    "Medium": {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
    },
    "High": {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
    },
    "Very High": {
      bg: "bg-red-200",
      text: "text-red-900",
      border: "border-red-300",
    },
  }

  const style = variants[complexity]

  return (
    <Badge
      className={cn(
        "rounded-full px-3 py-1 font-semibold border",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {complexity}
    </Badge>
  )
}
```

### 3. Spinner Component

Create `src/components/ui/spinner.tsx`:

```tsx
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2 className={cn("animate-spin", sizeMap[size], className)} />
  )
}
```

---

## Step 5: Create Validation Schema (10 minutes)

Create `src/lib/validation.ts`:

```typescript
import { z } from "zod"

export const repoSchema = z.object({
  url: z.string()
    .min(1, "Repository URL is required")
    .regex(
      /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/,
      "Invalid GitHub URL format. Use: https://github.com/owner/repo"
    ),
})

export const formSchema = z.object({
  repositories: z.array(repoSchema)
    .min(1, "At least one repository is required")
    .max(5, "Maximum 5 repositories allowed")
    .refine(
      (repos) => {
        const urls = repos.map(r => r.url)
        return new Set(urls).size === urls.length
      },
      "Duplicate repository URLs are not allowed"
    ),
  hourlyRate: z.number({
    required_error: "Hourly rate is required",
    invalid_type_error: "Must be a number",
  })
    .min(1, "Hourly rate must be greater than 0")
    .max(10000, "Hourly rate exceeds reasonable maximum"),
})

export type FormValues = z.infer<typeof formSchema>
```

---

## Step 6: Build First Component (30 minutes)

### Create Analyze Form

Create `src/components/features/AnalyzeForm.tsx`:

```tsx
import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { formSchema, type FormValues } from "@/lib/validation"

export function AnalyzeForm() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repositories: [{ url: "" }],
      hourlyRate: 80,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "repositories",
  })

  const onSubmit = async (data: FormValues) => {
    setIsAnalyzing(true)
    try {
      console.log("Form data:", data)
      // API call will go here
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="bg-[var(--layer-1)] shadow-2l-md rounded-2xl">
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Repository URLs */}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`repositories.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Repository URL {fields.length > 1 && `#${index + 1}`}
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="https://github.com/owner/repo"
                            className="bg-[var(--layer-2)] hover:bg-[var(--layer-3)] focus:bg-[var(--layer-3)]"
                          />
                        </FormControl>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ url: "" })}
                disabled={fields.length >= 5}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                {fields.length >= 5 ? "Maximum 5 Repositories" : "Add Another Repository"}
              </Button>
            </div>

            {/* Hourly Rate */}
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      className="bg-[var(--layer-2)]"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription className="text-[var(--text-secondary)]">
                    Default: $80/hour. Enter your preferred development rate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-[var(--thistle-500)] to-[var(--thistle-600)] hover:from-[var(--thistle-600)] hover:to-[var(--thistle-700)] text-white font-semibold shadow-2l-md hover:-translate-y-0.5 transition-transform"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Fetch & Analyze Issues"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

---

## Step 7: Create Basic Layout (15 minutes)

### Create App Layout

Update `src/App.tsx`:

```tsx
import { useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { AnalyzeForm } from "@/components/features/AnalyzeForm"

function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[var(--layer-0)]">
        {/* Header */}
        <header className="border-b bg-[var(--layer-1)]">
          <div className="max-w-[1100px] mx-auto px-6 py-4">
            <h1 className="text-3xl font-light bg-gradient-to-r from-[var(--thistle-500)] to-[var(--thistle-600)] bg-clip-text text-transparent">
              Effortly
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1100px] mx-auto px-6 py-8">
          <AnalyzeForm />
        </main>

        {/* Toast Container */}
        <Toaster />
      </div>
    </TooltipProvider>
  )
}

export default App
```

---

## Step 8: Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173 to see your form!

---

## Common Patterns Quick Reference

### 1. Gradient Button
```tsx
<Button className="bg-gradient-to-r from-thistle-500 to-thistle-600 text-white">
  Action
</Button>
```

### 2. Layer Background Card
```tsx
<Card className="bg-layer-1 shadow-2l-md rounded-2xl">
  <CardContent>Content</CardContent>
</Card>
```

### 3. Complexity Badge
```tsx
<ComplexityBadge complexity="Medium" />
```

### 4. Loading Button
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

### 5. Circular Progress
```tsx
<CircularProgress value={progress} size={120} />
```

### 6. Responsive Table
```tsx
<ScrollArea className="w-full rounded-xl border">
  <Table className="min-w-[800px]">
    {/* Table content */}
  </Table>
</ScrollArea>
```

### 7. Toast Notification
```tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

toast({
  title: "Success!",
  description: "Operation completed successfully.",
})
```

### 8. Confirmation Dialog
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/                          # shadcn components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── circular-progress.tsx   # Custom
│   │   ├── spinner.tsx             # Custom
│   │   └── ...
│   ├── features/                    # Feature components
│   │   ├── AnalyzeForm.tsx
│   │   ├── ComplexityBadge.tsx
│   │   └── ...
│   └── layout/
│       ├── Header.tsx
│       └── Container.tsx
├── hooks/
│   ├── use-analysis.ts
│   ├── use-history.ts
│   └── use-toast.ts
├── lib/
│   ├── utils.ts
│   ├── validation.ts
│   └── api.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## Next Steps

1. ✅ Complete form submission flow with API integration
2. ✅ Build results display with tabs
3. ✅ Create issues table with sorting
4. ✅ Implement issue details dialog
5. ✅ Build history view and table
6. ✅ Add progress indicator during analysis
7. ✅ Implement CSV download functionality
8. ✅ Test accessibility compliance
9. ✅ Optimize performance
10. ✅ Deploy to production

---

## Helpful Resources

- **Full Component Research**: `component-research.md` (5,371 lines)
- **Executive Summary**: `RESEARCH-SUMMARY.md`
- **shadcn Docs**: https://ui.shadcn.com
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev

---

## Troubleshooting

### Issue: CSS Variables Not Working
**Solution**: Ensure CSS variables are defined in `:root` in `index.css`

### Issue: Components Not Found
**Solution**: Run `npx shadcn@latest add [component-name]` to install

### Issue: Tailwind Classes Not Applied
**Solution**: Check `content` paths in `tailwind.config.js` include all source files

### Issue: Form Validation Not Triggering
**Solution**: Ensure `zodResolver` is passed to `useForm` and schema is correct

---

**Quick Start Complete!** 🎉

You now have a working React + shadcn/ui project with the core Issue Estimator form component. Continue building additional components using the patterns and examples in the full research document.

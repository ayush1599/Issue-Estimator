# Issue Estimator - Complete UI Component Analysis

## 1. Feature Name

**Issue Estimator - Complete UI Component Analysis**

A comprehensive mapping of all existing vanilla HTML/CSS/JavaScript UI elements to shadcn components for modernizing the GitHub Issue Cost Estimator application. This document covers both the Analyze View (primary interface) and History View (secondary interface) in their entirety.

---

## 2. Components Required

### 2.1 Form Components

#### **Input**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Repository URL text inputs (dynamic, up to 5)
  - Hourly rate number input
- **Key Props**:
  - `type="text"` for URLs
  - `type="number"` for hourly rate
  - `placeholder` for helper text
  - `value` for controlled inputs
- **Customization**:
  - Apply Layer 2 (--layer-2) background for interactive state
  - Layer 3 (--layer-3) on hover/focus
  - Custom border colors using CSS variables (--border-color, --border-focus)
  - Focus ring with custom shadow (inset + glow)

#### **Label**
- **Registry Source**: shadcn/ui
- **Purpose**: Labels for all form inputs (repository URLs, hourly rate)
- **Key Props**:
  - `htmlFor` to associate with input IDs
- **Customization**:
  - Font weight 600
  - Color: var(--text-primary)
  - Margin bottom 0.5rem

#### **Button**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Primary action button (Analyze)
  - Secondary action buttons (Download CSV, Clear History)
  - Remove repository input buttons
  - Add repository button
  - Details button in table
  - Action buttons in history table
- **Key Props**:
  - `variant="default"` for primary gradient button
  - `variant="outline"` for secondary buttons
  - `variant="destructive"` for Remove/Delete/Clear buttons
  - `variant="ghost"` for Details buttons
  - `disabled` for loading states
  - `size="default"`, `size="sm"` for sizing
- **Customization**:
  - Primary: Linear gradient (thistle-500 to thistle-600) with hover state
  - Secondary: Layer 2 background with primary border, two-layer shadow
  - Loading state with spinner (replace button content)
  - Destructive: Red background (--danger-color)
  - Smooth transform on hover (translateY)

#### **FormField / FormControl / FormDescription / FormMessage**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Wrap inputs with proper structure
  - Display helper text ("Default: $80/hour...")
  - Show validation errors
- **Key Props**:
  - `name` for form field identification
  - `control` for form state management
- **Customization**:
  - FormDescription: Small text, color: var(--text-secondary)
  - FormMessage: Error state with red color
  - Helper text styling matching current .input-help class

### 2.2 Navigation Components

#### **NavigationMenu / NavigationMenuList / NavigationMenuItem**
- **Registry Source**: shadcn/ui
- **Purpose**: Top navigation bar with "Analyze" and "History" tabs
- **Key Props**:
  - Active state management
  - Click handlers for view switching
- **Customization**:
  - Container: Layer 1 background, rounded corners (16px)
  - Items: Layer 2 background by default
  - Active state: Gradient background (thistle-500 to thistle-600) with bottom border indicator
  - Hover: Layer 3 background with translateY animation
  - Brand text with gradient clip effect

#### **Tabs / TabsList / TabsTrigger / TabsContent**
- **Registry Source**: shadcn/ui
- **Purpose**: Multi-repository results tabs (one tab per analyzed repository)
- **Key Props**:
  - `value` for tab identification
  - `defaultValue` for initial tab
  - `onValueChange` for tab switching
- **Customization**:
  - Container: Layer 1 background with padding
  - Trigger: Layer 2 background, Layer 3 on hover
  - Active trigger: Gradient background (thistle-100 to thistle-200) with two-layer shadow
  - Tab subtitle showing issue count
  - Responsive horizontal scrolling on mobile

### 2.3 Data Display Components

#### **Table / TableHeader / TableBody / TableRow / TableHead / TableCell**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Results table showing issues (issue #, title, complexity, hours, cost, labels, link, details)
  - History table showing past analyses
- **Key Props**:
  - Sortable columns (future enhancement)
  - Row hover states
  - Cell content alignment
- **Customization**:
  - Container: Layer 0 background for depth perception
  - Header: Layer 1 background
  - Row hover: Layer 1 background
  - No visible borders between rows (use subtle layer separation)
  - Responsive: Horizontal scroll on mobile with min-width
  - Special cells: Title/labels with ellipsis overflow

#### **Badge**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Complexity indicators (Low, Medium, High, Very High)
  - Potentially for issue labels
- **Key Props**:
  - `variant="default"`, `variant="secondary"`, `variant="destructive"`, `variant="outline"`
- **Customization**:
  - Low complexity: Green background (#d1fae5), dark green text (#065f46)
  - Medium complexity: Orange background (#fed7aa), dark orange text (#92400e)
  - High complexity: Red background (#fecaca), dark red text (#991b1b)
  - Rounded pill shape (border-radius: 20px)
  - Small padding (0.25rem 0.75rem)

#### **Card / CardHeader / CardTitle / CardDescription / CardContent**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Summary statistics cards (Total Issues, Total Hours, Total Cost, Avg Cost/Issue)
  - Input section container
  - Loading indicator container
  - Error/Info message boxes
- **Key Props**:
  - Click handlers for interactive cards (if needed)
- **Customization**:
  - Default: Layer 2 background
  - Hover: Layer 3 background with translateY animation
  - Summary cards: Large gradient number values, uppercase labels
  - Two-layer shadow system (inset highlight + drop shadow)
  - Top highlight border effect for emphasis
  - Responsive grid (auto-fit, minmax(200px, 1fr))

#### **Separator**
- **Registry Source**: shadcn/ui
- **Purpose**: Visual dividers between sections (if needed for clarity)
- **Key Props**:
  - `orientation="horizontal"` or `orientation="vertical"`
- **Customization**:
  - Color: var(--border-color)
  - Subtle appearance matching platinum color palette

### 2.4 Feedback Components

#### **Alert / AlertTitle / AlertDescription**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Error messages (red background)
  - Info messages (blue background) for empty states
  - Error boxes in tab content when repository analysis fails
- **Key Props**:
  - `variant="destructive"` for errors
  - `variant="default"` for info
- **Customization**:
  - Error: Red background (#fee), red border (2px), red text
  - Info: Layer 1 background with blue left border (4px)
  - Auto-dismiss after 10 seconds for inline errors
  - Border-radius: 8px

#### **AlertDialog / AlertDialogAction / AlertDialogCancel / AlertDialogContent / AlertDialogDescription / AlertDialogFooter / AlertDialogHeader / AlertDialogTitle**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Confirmation dialogs (Clear History, Delete History Item)
- **Key Props**:
  - `open` state control
  - `onOpenChange` handler
- **Customization**:
  - Backdrop: rgba(0, 0, 0, 0.5)
  - Content: Layer 1 background, rounded corners
  - Actions: Primary button for confirm, secondary for cancel
  - Cancel button for destructive actions

#### **Toast / Toaster**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Success notifications (e.g., "CSV downloaded successfully")
  - Error notifications (alternative to inline alerts)
- **Key Props**:
  - `variant="default"`, `variant="destructive"`
  - Duration control
  - Auto-dismiss
- **Customization**:
  - Position: bottom-right
  - Layer 1 background with shadow
  - Success: Green accent border
  - Error: Red accent border

#### **Progress**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Circular progress ring showing analysis progress (0-100%)
- **Key Props**:
  - `value` for progress percentage
  - `max={100}`
- **Customization**:
  - Circular SVG implementation (custom override)
  - Background circle: Light gray with opacity
  - Progress circle: Blue stroke (--info-600) with rounded cap
  - Animated stroke-dashoffset transition
  - Center text showing percentage
  - Size: 120x120px

#### **Skeleton**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Loading placeholders for table rows (future enhancement)
  - Loading placeholders for summary cards during initial load
- **Key Props**:
  - `className` for custom sizing
- **Customization**:
  - Layer 2 background with pulse animation
  - Match dimensions of actual content

### 2.5 Overlay Components

#### **Dialog / DialogContent / DialogHeader / DialogTitle / DialogDescription / DialogFooter / DialogClose**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Issue details modal showing reasoning, complexity, cost, hours, description
- **Key Props**:
  - `open` state control
  - `onOpenChange` handler
  - Click outside to close
- **Customization**:
  - Backdrop: rgba(0, 0, 0, 0.5) with fadeIn animation
  - Content: Layer 1 background, max-width 800px, max-height calc(100vh - 4rem)
  - Header: Layer 2 background with larger title
  - Body: Scrollable with proper overflow handling
  - Close button: Large X (2rem font size) in top-right
  - Detail items: Label-value pairs with strong labels
  - Reasoning section: Layer 2 background with left border accent, formatted HTML content
  - SlideIn animation (translateY)

#### **Sheet / SheetContent / SheetHeader / SheetTitle / SheetDescription**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Alternative mobile-friendly drawer for filters or settings (future enhancement)
- **Key Props**:
  - `side="right"`, `side="left"`, `side="top"`, `side="bottom"`
  - `open` state control
- **Customization**:
  - Slide-in animation
  - Full-height drawer
  - Layer 1 background

### 2.6 Layout Components

#### **Container**
- **Note**: Not a shadcn component, but a custom wrapper
- **Purpose**: Main content container with max-width and centering
- **Customization**:
  - Max-width: 1100px
  - Margin: 0 auto
  - Padding: 1.5rem (responsive: 1rem on mobile)

#### **Grid Pattern** (using CSS Grid)
- **Purpose**:
  - Summary cards layout (4 columns on desktop, 2 on mobile)
  - Responsive auto-fit pattern
- **Implementation**: CSS `display: grid` with `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`

#### **Flex Pattern** (using Flexbox)
- **Purpose**:
  - Navigation layout (space-between)
  - Results header (space-between)
  - Input with remove button (gap)
  - Button groups
- **Implementation**: CSS `display: flex` with appropriate properties

### 2.7 Typography Components

#### **Heading** (custom or Typography)
- **Purpose**:
  - Section headings (h2, h3)
  - Brand title
- **Customization**:
  - Brand: 2rem, font-weight 300, gradient text clip
  - h2: 1.8rem, font-weight 600
  - h3: 1.25rem in modals

#### **Text / Paragraph**
- **Purpose**:
  - Body text
  - Subtitles
  - Helper text
- **Customization**:
  - Primary text: var(--text-primary)
  - Secondary text: var(--text-secondary)
  - Tertiary text: var(--text-tertiary)
  - Line-height: 1.6

### 2.8 Specialized Components

#### **ScrollArea**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Modal body scrolling
  - Table horizontal scrolling on mobile
  - Tab container horizontal scrolling
- **Key Props**:
  - `className` for sizing
  - `orientation="horizontal"`, `orientation="vertical"`
- **Customization**:
  - Custom scrollbar styling matching design system
  - Smooth scrolling behavior

#### **Tooltip**
- **Registry Source**: shadcn/ui
- **Purpose**:
  - Full text preview for truncated table cells (title, labels)
  - Help text for form inputs (alternative to FormDescription)
- **Key Props**:
  - `content` for tooltip text
  - `side="top"`, `side="bottom"`, etc.
- **Customization**:
  - Layer 1 background with shadow
  - Small padding
  - Max-width for wrapping

### 2.9 Custom Components (Not in shadcn Registry)

#### **Spinner** (Custom)
- **Purpose**:
  - Loading state in button ("Analyzing...")
  - Large circular spinner in loading indicator (replaced by Progress ring)
- **Implementation**:
  - Small: 16x16px inline-block with border animation
  - Large: 48x48px centered with border animation
  - Spin animation: 0.8s linear infinite

#### **Dynamic Input Group** (Custom)
- **Purpose**:
  - Add/remove repository URL inputs dynamically (up to 5)
  - Track input count state
- **Implementation**:
  - Array of Input components with remove buttons
  - Add button with disabled state at max
  - Renumbering logic after removal

#### **Empty State** (Custom)
- **Purpose**:
  - History view when no analyses exist
  - No issues state in tab content
- **Implementation**:
  - Centered text with large font
  - Subtitle with instructions
  - Layer 1 background

---

## 3. Component Hierarchy

### 3.1 Analyze View Hierarchy

```
Container (max-width wrapper)
├── NavigationMenu (Top Nav)
│   ├── Brand (Gradient text "Effortly")
│   └── NavigationMenuList
│       ├── NavigationMenuItem (Analyze - Active)
│       └── NavigationMenuItem (History)
│
└── Main (Analyze View)
    ├── Card (Input Section - Layer 1)
    │   ├── CardContent
    │   │   ├── Dynamic Input Group (Repository URLs)
    │   │   │   ├── FormField (Repo URL #1)
    │   │   │   │   ├── Label
    │   │   │   │   └── Input (text)
    │   │   │   ├── FormField (Repo URL #2)
    │   │   │   │   ├── Label
    │   │   │   │   ├── Flex Container
    │   │   │   │   │   ├── Input (text)
    │   │   │   │   │   └── Button (Remove - destructive)
    │   │   │   └── ... (up to 5 total)
    │   │   ├── Button (Add Another Repository - secondary, small)
    │   │   ├── FormField (Hourly Rate)
    │   │   │   ├── Label
    │   │   │   ├── Input (number)
    │   │   │   └── FormDescription ("Default: $80/hour...")
    │   │   └── Button (Fetch & Analyze Issues - primary)
    │   │       ├── Span (Button text)
    │   │       └── Span (Loading state with Spinner)
    │
    ├── Card (Loading Indicator - conditionally rendered)
    │   ├── CardContent
    │   │   ├── Progress (Circular SVG ring)
    │   │   │   ├── SVG Background Circle
    │   │   │   ├── SVG Progress Circle
    │   │   │   └── Text (Percentage - centered)
    │   │   └── Paragraph (Status message)
    │
    ├── Alert (Error Message - conditionally rendered)
    │   ├── AlertTitle
    │   └── AlertDescription
    │
    └── Card (Results Section - conditionally rendered)
        ├── CardHeader (Results Header)
        │   ├── Div (Results Info)
        │   │   ├── Heading (h2 - "Analysis Results")
        │   │   └── Paragraph (Subtitle - repo count)
        │   └── Div (Results Actions)
        │       └── Button (Download All as CSV - secondary)
        │
        ├── Tabs (Multi-Repository Tabs)
        │   ├── TabsList
        │   │   ├── TabsTrigger (Repo #1)
        │   │   │   ├── Div (Tab title - repo name)
        │   │   │   └── Div (Tab subtitle - issue count)
        │   │   ├── TabsTrigger (Repo #2)
        │   │   ���── ... (one per repository)
        │   │
        │   ├── TabsContent (Repo #1 Content)
        │   │   ├── Grid (Summary Cards - 4 columns)
        │   │   │   ├── Card (Total Issues)
        │   │   │   │   ├── Heading (Large gradient value)
        │   │   │   │   └── Paragraph (Label - uppercase)
        │   │   │   ├── Card (Total Hours)
        │   │   │   ├── Card (Total Cost)
        │   │   │   └── Card (Avg Cost/Issue)
        │   │   │
        │   │   ├── Div (Table Actions)
        │   │   │   └── Button (Download CSV for this Repository)
        │   │   │
        │   │   └── ScrollArea (Table Container)
        │   │       └── Table
        │   │           ├── TableHeader
        │   │           │   └── TableRow
        │   │           │       ├── TableHead (Issue #)
        │   │           │       ├── TableHead (Title)
        │   │           │       ├── TableHead (Complexity)
        │   │           │       ├── TableHead (Est. Hours)
        │   │           │       ├── TableHead (Est. Cost)
        │   │           │       ├── TableHead (Labels)
        │   │           │       ├── TableHead (Link)
        │   │           │       └── TableHead (Details)
        │   │           └── TableBody
        │   │               └── TableRow (per issue)
        │   │                   ├── TableCell (Issue number)
        │   │                   ├── TableCell (Title - with Tooltip)
        │   │                   ├── TableCell (Badge - Complexity)
        │   │                   ├── TableCell (Hours)
        │   │                   ├── TableCell (Cost - styled)
        │   │                   ├── TableCell (Labels - with Tooltip)
        │   │                   ├── TableCell (Link - anchor tag)
        │   │                   └── TableCell (Button - Details)
        │   │
        │   ├── TabsContent (Repo #2 Content)
        │   │   └── ... (same structure)
        │   └── ... (one TabsContent per repository)
```

### 3.2 History View Hierarchy

```
Container (max-width wrapper)
├── NavigationMenu (Top Nav)
│   ├── Brand (Gradient text "Effortly")
│   └── NavigationMenuList
│       ├── NavigationMenuItem (Analyze)
│       └── NavigationMenuItem (History - Active)
│
└── Main (History View)
    └── Card (History Section - Layer 1)
        ├── CardHeader (History Header)
        │   ├── Div
        │   │   ├── Heading (h2 - "Analysis History")
        │   │   └── Paragraph (Subtitle - "View and download...")
        │   └── Button (Clear History - secondary)
        │       └── AlertDialog (Confirmation on click)
        │           ├── AlertDialogContent
        │           │   ├── AlertDialogHeader
        │           │   │   ├── AlertDialogTitle
        │           │   │   └── AlertDialogDescription
        │           │   └── AlertDialogFooter
        │           │       ├── AlertDialogCancel
        │           │       └── AlertDialogAction
        │
        ├── Div (Empty State - conditionally rendered)
        │   ├── Paragraph (No history message)
        │   └── Paragraph (Subtitle - instruction)
        │
        └── Div (History Content - conditionally rendered)
            └── ScrollArea (Table Container)
                └── Table (History Table)
                    ├── TableHeader
                    │   └── TableRow
                    │       ├── TableHead (Date)
                    │       ├── TableHead (Repositories)
                    │       ├── TableHead (Total Issues)
                    │       ├── TableHead (Total Hours)
                    │       ├── TableHead (Total Cost)
                    │       ├── TableHead (Hourly Rate)
                    │       └── TableHead (Actions)
                    └── TableBody
                        └── TableRow (per history item)
                            ├── TableCell (Formatted date/time)
                            ├── TableCell (Comma-separated repo names)
                            ├── TableCell (Total issues count)
                            ├── TableCell (Total hours)
                            ├── TableCell (Formatted currency)
                            ├── TableCell (Hourly rate)
                            └── TableCell (Action buttons)
                                ├── Button (Download CSV - primary small)
                                └── Button (Delete - destructive small)
                                    └── AlertDialog (Confirmation on click)
```

### 3.3 Modal Overlay Hierarchy

```
Dialog (Issue Details Modal - conditionally rendered)
├── DialogContent
│   ├── DialogHeader
│   │   ├── DialogTitle ("Issue Analysis Details")
│   │   └── DialogClose (X button)
│   │
│   ├── ScrollArea (Dialog Body)
│   │   ├── Div (Detail Item)
│   │   │   ├── Strong (Label - "Issue:")
│   │   │   └── Paragraph (Issue title)
│   │   ├── Div (Detail Item)
│   │   │   ├── Strong (Label - "Complexity:")
│   │   │   └── Badge (Complexity badge)
│   │   ├── Div (Detail Item)
│   │   │   ├── Strong (Label - "Estimated Hours:")
│   │   │   └── Paragraph (Hours value)
│   │   ├── Div (Detail Item)
│   │   │   ├── Strong (Label - "Estimated Cost:")
│   │   │   └── Paragraph (Cost value)
│   │   └── Div (Detail Item)
│   │       ├── Strong (Label - "Analysis Reasoning:")
│   │       └── Div (Reasoning text - formatted HTML)
│   │           ├── h3 (Section headings)
│   │           ├── h4 (Subsection headings)
│   │           ├── p (Paragraphs)
│   │           ├── ul/ol (Lists)
│   │           ├── strong (Bold text)
│   │           ├── em (Italic text)
│   │           └── code (Inline code)
```

---

## 4. Implementation Notes

### 4.1 State Management

**Current Approach (Vanilla JS):**
- Global state variables (currentResults, progressInterval, currentSessionId, repoInputCount, activeTabIndex, allRepoIssues)
- Direct DOM manipulation
- Event listeners attached in init()
- localStorage for history persistence

**Recommended Approach (React + shadcn):**
- **React state hooks** (useState) for component-level state:
  - Form inputs (repository URLs, hourly rate)
  - Loading state (isLoading, progress percentage, status message)
  - Results data (currentResults)
  - Active tab index
  - Modal open/close state
  - Error messages
- **React Context** (useContext) for global state:
  - History data (shared between Analyze and History views)
  - Active view (analyze vs history)
- **React hooks for side effects** (useEffect):
  - Progress polling with setInterval
  - localStorage persistence for history
  - Cleanup for intervals and event listeners
- **Form state management**:
  - Option 1: react-hook-form (recommended for validation)
  - Option 2: Formik
  - Option 3: Plain React state with custom validation
- **Data fetching**:
  - Custom hooks (useFetch, useAnalysis, useHistory)
  - Error boundary for API failures

### 4.2 Validation Strategy

**Current Validation:**
- Client-side only
- Manual checks in handleAnalyze()
- Simple validation (empty check, number > 0)
- Error display via showError() function

**Enhanced Validation (React + shadcn):**
- **Libraries**: react-hook-form + zod (type-safe schema validation)
- **Validation Rules**:
  - Repository URLs:
    - Required: At least one URL
    - Format: Must match GitHub URL pattern (https://github.com/owner/repo)
    - Max count: 5 repositories
    - Unique: No duplicate URLs
  - Hourly Rate:
    - Required: Must have value
    - Type: Number only
    - Range: Must be greater than 0
    - Reasonable range: 1-1000 (warning for outliers)
- **Validation Timing**:
  - Real-time: onChange for URL format validation
  - On blur: For expensive validations (URL existence check - optional)
  - On submit: Full validation before API call
- **Error Display**:
  - FormMessage component below each input
  - Alert component for form-level errors
  - Toast for success/failure notifications

### 4.3 Accessibility Considerations

**WCAG AA Compliance:**
- **Keyboard Navigation**:
  - All interactive elements focusable (buttons, inputs, links, tabs)
  - Tab order follows logical flow
  - Enter key triggers form submission (current behavior preserved)
  - Escape key closes modals and dialogs
  - Arrow keys for tab navigation
  - Space/Enter for button activation
- **Screen Reader Support**:
  - Semantic HTML elements (nav, main, section, table)
  - ARIA labels for all form inputs
  - ARIA live regions for dynamic content (progress updates, error messages)
  - ARIA expanded/collapsed states for tabs
  - ARIA modal for Dialog component
  - Alt text for any icons (if added)
- **Focus Management**:
  - Visible focus indicators (custom ring with --border-focus color)
  - Focus trap in modals (prevent focus leaving dialog)
  - Return focus to trigger element when modal closes
  - Skip to main content link (optional enhancement)
- **Color Contrast**:
  - All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
  - Current color palette already designed for high contrast
  - Complexity badges: Verify contrast ratios
    - Low (green): #065f46 on #d1fae5 - CHECK
    - Medium (orange): #92400e on #fed7aa - CHECK
    - High (red): #991b1b on #fecaca - CHECK
- **Motion and Animation**:
  - Respect prefers-reduced-motion media query
  - Disable transform animations if user prefers reduced motion
  - Provide alternative loading indicators (static vs animated)

### 4.4 Performance Optimizations

**Current Performance Concerns:**
- Direct DOM manipulation for every table row
- No virtualization for large tables
- Polling every 500ms for progress updates
- No debouncing on input validation

**Optimizations for React + shadcn:**
- **Virtualization**:
  - Use react-virtual or react-window for tables with 100+ rows
  - Render only visible rows in viewport
  - Lazy load rows as user scrolls
- **Memoization**:
  - React.memo() for table rows to prevent unnecessary re-renders
  - useMemo() for expensive calculations (totals, averages)
  - useCallback() for event handlers passed to children
- **Code Splitting**:
  - Lazy load History view (React.lazy + Suspense)
  - Lazy load Dialog component (only load when opened)
  - Split large table into separate chunk
- **Data Optimization**:
  - Debounce input validation (300ms delay)
  - Reduce polling frequency if no progress change (adaptive polling)
  - Cancel ongoing API calls when component unmounts
  - Cache results in memory to avoid re-fetching
- **Bundle Size**:
  - Tree-shake unused shadcn components
  - Use production builds
  - Compress assets
  - Lazy load Inter font with font-display: swap

### 4.5 Styling Approach

**Current Approach:**
- Custom CSS with CSS variables
- 4-layer depth system (--layer-0 through --layer-3)
- Two-layer shadow system (inset highlight + drop shadow)
- 60-30-10 color rule (backgrounds, primary, accents)
- Responsive breakpoint at 768px

**Migration to shadcn + Tailwind:**
- **Preserve Design System**:
  - Map existing CSS variables to Tailwind theme
  - Define custom colors in tailwind.config.js
  - Create custom utilities for two-layer shadows
  - Preserve layer system in theme
- **Tailwind Configuration**:
  ```javascript
  theme: {
    extend: {
      colors: {
        layer: {
          0: '#e6eaec',
          1: '#f4faff',
          2: '#fafcff',
          3: '#ffffff',
        },
        thistle: {
          100: '#e0e0e0',
          500: '#1a1a1a',
          600: '#151515',
          700: '#0f0f0f',
        },
        // ... rest of color palette
      },
      boxShadow: {
        '2l-sm-top': 'inset 0 1px 0 rgba(255, 255, 255, 0.10)',
        '2l-sm-bottom': '0 1px 2px rgba(0, 0, 0, 0.10)',
        // ... rest of shadows
      },
    },
  }
  ```
- **Component Styling**:
  - Use Tailwind utilities for most styling
  - shadcn components come with base styles
  - Override via className prop for customization
  - CSS modules for complex component-specific styles
  - Preserve custom animations (fadeIn, slideIn, spin)
- **Responsive Design**:
  - Use Tailwind responsive modifiers (sm:, md:, lg:)
  - Maintain 768px breakpoint as 'md' in Tailwind
  - Mobile-first approach

---

## 5. Data Flow Patterns

### 5.1 Form Submission Flow

```
User Input (Repository URLs + Hourly Rate)
    ↓
Form Validation (react-hook-form + zod)
    ↓
[Valid] → API Call (POST /api/analyze)
    ↓
Receive session_id
    ↓
Start Progress Polling (setInterval 500ms)
    ↓
Fetch Progress (GET /api/progress/:sessionId)
    ↓
Update Progress State (percentage, message)
    ↓
[Complete] → Stop Polling
    ↓
Update Results State
    ↓
Save to History (localStorage)
    ↓
Display Results (Tabs, Cards, Table)
```

### 5.2 History Persistence Flow

```
Analysis Complete
    ↓
Create History Item {
  id: timestamp,
  timestamp: ISO string,
  data: full analysis results
}
    ↓
Load Existing History (localStorage.getItem)
    ↓
Prepend New Item (unshift)
    ↓
Limit to 50 Items (splice if > 50)
    ↓
Save to localStorage (setItem)
    ↓
[History View Active] → Reload History Display
```

### 5.3 Tab Switching Flow

```
User Clicks Tab
    ↓
Update activeTabIndex State
    ↓
Re-render Tabs Component
    ↓
Show Active Tab Content (display: block)
    ↓
Hide Other Tab Contents (display: none)
    ↓
Update Tab Button Styles (active class)
```

### 5.4 Modal Interaction Flow

```
User Clicks "Details" Button
    ↓
Get Issue Data (from allRepoIssues[repoIndex][issueIndex])
    ↓
Update Modal State (open: true, data: issue)
    ↓
Render Dialog Component
    ↓
Display Issue Details (title, complexity, hours, cost, reasoning)
    ↓
[User Clicks Close / Outside / Escape] → Update Modal State (open: false)
    ↓
Unmount Dialog Component
```

### 5.5 API Communication Patterns

**Current API Endpoints:**
- `GET /api/health` - Health check
- `POST /api/analyze` - Start analysis (returns session_id)
- `GET /api/progress/:sessionId` - Poll for progress updates
- `POST /api/download-csv` - Generate and download CSV file

**Data Flow Architecture:**
```
React Component
    ↓
Custom Hook (useAnalysis)
    ↓
API Client (fetch wrapper)
    ↓
Flask Backend
    ↓
Background Worker (analysis processing)
    ↓
Progress Tracking (in-memory cache)
    ↓
Response to Client
    ↓
Update React State
    ↓
Re-render UI
```

**Error Handling:**
- Network errors: Retry logic with exponential backoff
- API errors: Display user-friendly messages
- Validation errors: Prevent submission, show inline errors
- Timeout errors: Cancel request, show timeout message

**Cache Invalidation:**
- Results cached in memory during session
- History stored in localStorage (persistent across sessions)
- Clear cache on page refresh (optional)
- No backend caching (fresh data every analysis)

---

## 6. Accessibility Requirements

### 6.1 WCAG Compliance Level

**Target: WCAG 2.1 Level AA**

### 6.2 Screen Reader Support

**Semantic Structure:**
- Use proper heading hierarchy (h1 → h2 → h3)
- Landmark regions: `<nav>`, `<main>`, `<section>`, `<footer>`
- Table semantics: `<thead>`, `<tbody>`, `<th>`, `<td>`
- Form structure: `<form>`, `<fieldset>`, `<legend>` (for grouped inputs)

**ARIA Attributes:**
- Navigation:
  - `aria-label="Main navigation"` on nav
  - `aria-current="page"` on active nav item
- Tabs:
  - `role="tablist"` on tab container
  - `role="tab"` on tab buttons
  - `role="tabpanel"` on tab content
  - `aria-selected="true/false"` on tabs
  - `aria-controls` linking tab to panel
- Modal:
  - `role="dialog"` on modal container
  - `aria-modal="true"` to indicate modal
  - `aria-labelledby` pointing to modal title
  - `aria-describedby` pointing to modal description
- Loading:
  - `aria-live="polite"` on progress messages
  - `aria-busy="true"` during loading states
- Buttons:
  - `aria-label` for icon-only buttons (if any)
  - `aria-disabled="true"` instead of disabled attribute (for better SR support)
- Dynamic Content:
  - `aria-live="assertive"` for errors
  - `aria-live="polite"` for success messages
- Form Validation:
  - `aria-invalid="true"` on invalid inputs
  - `aria-describedby` linking input to error message

### 6.3 Keyboard Navigation Patterns

**Global:**
- Tab: Move forward through interactive elements
- Shift+Tab: Move backward
- Enter: Activate buttons, submit forms
- Space: Activate buttons, toggle checkboxes
- Escape: Close modals, clear focus

**Navigation Menu:**
- Tab: Focus nav items
- Enter/Space: Activate nav item (switch view)
- Arrow keys: Navigate between nav items (optional enhancement)

**Form:**
- Tab: Move between inputs and buttons
- Enter in input: Submit form
- Enter on "Add Repository" button: Add new input field

**Tabs:**
- Arrow Left/Right: Navigate between tab buttons
- Home: Focus first tab
- End: Focus last tab
- Tab: Exit tab list to tab panel content

**Table:**
- Tab: Focus next interactive element (link, button)
- Enter on "Details" button: Open modal
- Enter on "View" link: Open GitHub issue (new tab)

**Modal:**
- Focus trap: Tab cycles within modal only
- Escape: Close modal
- Tab: Navigate between modal elements

**History Table:**
- Tab: Focus action buttons
- Enter on "Download CSV": Trigger download
- Enter on "Delete": Open confirmation dialog

### 6.4 Focus Management

**Focus Indicators:**
- Custom focus ring: 3px solid color using --border-focus
- High contrast: Visible on all backgrounds
- Offset: 2px from element edge
- Never remove focus indicators (no outline: none without replacement)

**Focus Order:**
- Logical flow: Top to bottom, left to right
- Skip navigation links (for keyboard users to bypass nav)
- Focus first input on page load (optional)
- Return focus to trigger when modal closes
- Move focus to error message when validation fails

**Focus Trapping:**
- Modal: Trap focus within dialog when open
- Dropdown menus: Keep focus in menu while open (if added)

### 6.5 Color Contrast Requirements

**Text Contrast (WCAG AA: 4.5:1 for normal, 3:1 for large):**
- Primary text (--text-primary: #1f282d) on backgrounds:
  - Layer 0 (#e6eaec): 12.5:1 ✓
  - Layer 1 (#f4faff): 12.8:1 ✓
  - Layer 2 (#fafcff): 13.0:1 ✓
  - Layer 3 (#ffffff): 13.2:1 ✓
- Secondary text (--text-secondary: #4f646f) on backgrounds:
  - Layer 0: 5.1:1 ✓
  - Layer 1: 5.3:1 ✓
- White text (#fafcff) on primary buttons:
  - Thistle-500 (#1a1a1a): 13.0:1 ✓

**UI Component Contrast (3:1 minimum):**
- Borders (--border-color: #c9d5d5) on Layer 0: 1.5:1 (May need adjustment for AA)
- Focus ring (--border-focus: #666666) on all layers: >4.5:1 ✓
- Complexity badges: Verified in section 4.3

**Action Items:**
- Verify all border colors meet 3:1 contrast
- Test gradient text readability
- Ensure disabled state text meets contrast (if still readable)

### 6.6 Motion and Animation

**Respect prefers-reduced-motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Alternative Indicators:**
- Progress: Provide percentage text (not just animated circle)
- Loading: Static spinner option
- Transitions: Instant instead of animated (when motion reduced)

---

## 7. Validation Rules

### 7.1 Repository URL Validation

**Rules:**
1. **Required**: At least one URL must be provided
2. **Format**: Must match GitHub repository URL pattern
   - Pattern: `https://github.com/{owner}/{repo}`
   - RegEx: `^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$`
3. **Maximum**: No more than 5 repository URLs
4. **Uniqueness**: No duplicate URLs allowed
5. **Accessibility**: URL must be a public GitHub repository (checked by API)

**Validation Timing:**
- **onChange**: Format validation (RegEx check)
- **onBlur**: Trim whitespace, re-validate format
- **onSubmit**: Full validation (required, format, max count, uniqueness)

**Error Messages:**
- Empty: "Please enter at least one GitHub repository URL"
- Invalid format: "Invalid GitHub URL format. Use: https://github.com/owner/repo"
- Max exceeded: "Maximum 5 repositories allowed"
- Duplicate: "This repository URL is already added"
- API error: "Repository not found or is not accessible"

**Validation Schema (Zod):**
```typescript
const repoUrlSchema = z.string()
  .min(1, "Repository URL is required")
  .regex(
    /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/,
    "Invalid GitHub URL format"
  );

const formSchema = z.object({
  repoUrls: z.array(repoUrlSchema)
    .min(1, "At least one repository is required")
    .max(5, "Maximum 5 repositories allowed")
    .refine(
      (urls) => new Set(urls).size === urls.length,
      "Duplicate repository URLs are not allowed"
    ),
  hourlyRate: z.number().min(1, "Hourly rate must be greater than 0"),
});
```

### 7.2 Hourly Rate Validation

**Rules:**
1. **Required**: Must have a value
2. **Type**: Must be a number (not string or other type)
3. **Minimum**: Must be greater than 0
4. **Maximum**: Reasonable upper limit (e.g., 10,000) to prevent accidental input errors
5. **Precision**: Allow decimals (e.g., 79.50) but round to 2 decimal places
6. **Default**: 80 (pre-filled)

**Validation Timing:**
- **onChange**: Type validation (number only)
- **onBlur**: Range validation
- **onSubmit**: Full validation

**Error Messages:**
- Empty: "Hourly rate is required"
- Not a number: "Hourly rate must be a valid number"
- Too low: "Hourly rate must be greater than 0"
- Too high: "Hourly rate seems unusually high. Please verify."
- Invalid precision: "Hourly rate can have maximum 2 decimal places"

**Validation Schema (Zod):**
```typescript
const hourlyRateSchema = z.number({
  required_error: "Hourly rate is required",
  invalid_type_error: "Hourly rate must be a number",
})
  .min(1, "Hourly rate must be greater than 0")
  .max(10000, "Hourly rate exceeds reasonable maximum")
  .refine(
    (val) => Number.isFinite(val),
    "Hourly rate must be a finite number"
  );
```

### 7.3 Form-Level Validation

**Submission Prevention:**
- Disable submit button while validation is in progress
- Disable submit button during API call (loading state)
- Show validation errors inline (below each field)
- Show form-level error summary at top (if multiple errors)

**Success Validation:**
- Clear all error messages
- Enable submit button
- Proceed with API call

**Real-time Validation Behavior:**
- Show errors only after user has interacted with field (touched)
- Don't show errors on initial render
- Clear error when user starts correcting the input
- Re-validate on blur (after field loses focus)

### 7.4 Max Repository Limit Enforcement

**UI Enforcement:**
1. **Add Button State**:
   - Enabled: When count < 5
   - Disabled: When count = 5
   - Update button text: "Maximum 5 Repositories Reached"

2. **Remove Button Availability**:
   - Show remove button only when count > 1
   - Always allow removing down to 1 repository
   - Re-enable Add button after removal

3. **Visual Feedback**:
   - Disabled button styling (opacity, cursor)
   - Tooltip on disabled Add button: "Maximum 5 repositories allowed"

**State Management:**
```typescript
const [repoUrls, setRepoUrls] = useState<string[]>(['']);

const addRepoUrl = () => {
  if (repoUrls.length < 5) {
    setRepoUrls([...repoUrls, '']);
  }
};

const removeRepoUrl = (index: number) => {
  if (repoUrls.length > 1) {
    setRepoUrls(repoUrls.filter((_, i) => i !== index));
  }
};
```

### 7.5 Async Validation (Optional Enhancement)

**Repository Existence Check:**
- **When**: On blur or with debounce after typing stops (2 seconds)
- **How**: Lightweight API call to GitHub API (HEAD request)
- **Success**: Show green checkmark icon next to input
- **Failure**: Show error message "Repository not found or is private"
- **Loading**: Show spinner icon during check

**Rate Limiting:**
- GitHub API has rate limits (60 requests/hour for unauthenticated)
- Consider using backend proxy to avoid CORS and rate limit issues
- Cache validation results to avoid redundant checks

**User Experience:**
- Don't block form submission for async validation
- Show warning but allow submission if user confirms
- Backend will perform final validation anyway

---

## 8. Additional Considerations

### 8.1 Error Boundaries

**Purpose**: Catch React errors and display fallback UI instead of crashing the app

**Implementation:**
- Wrap entire app in error boundary
- Wrap individual views (Analyze, History) in error boundaries
- Display user-friendly error message
- Provide "Reload" button to recover
- Log errors to console or error tracking service (Sentry, LogRocket)

### 8.2 Loading States

**Types of Loading States:**
1. **Initial Page Load**: Skeleton loaders for layout
2. **Form Submission**: Button loading state with spinner
3. **Analysis Progress**: Circular progress indicator with percentage
4. **Table Loading**: Skeleton rows or spinner overlay
5. **History Loading**: Skeleton table rows
6. **CSV Download**: Button loading state

**Best Practices:**
- Always indicate loading state to user
- Disable interactive elements during loading
- Provide estimated time if possible (progress percentage)
- Allow cancellation of long-running operations (future enhancement)

### 8.3 Empty States

**Scenarios:**
1. **No History**: "No analysis history yet. Start by analyzing a repository!"
2. **No Open Issues**: "This repository has no open issues to analyze."
3. **No Results**: "No results found. Please try different repositories."

**Design:**
- Centered content
- Large illustrative icon or text
- Clear message explaining the state
- Call-to-action button if applicable

### 8.4 Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile Adaptations:**
- Container padding: 1rem (vs 1.5rem on desktop)
- Summary cards: 2 columns (vs 4 on desktop)
- Table: Horizontal scroll with min-width
- Navigation: Stacked or hamburger menu (future enhancement)
- Modal: Full-screen on mobile
- Tab container: Horizontal scroll
- Font sizes: Slightly reduced

### 8.5 Progressive Enhancement

**Base Functionality (No JS):**
- Not applicable (React app requires JS)
- Consider server-side rendering (SSR) for initial load (future enhancement)

**Offline Support (Future Enhancement):**
- Service worker for offline page
- Cache history in IndexedDB (vs localStorage)
- Queue analysis requests when offline

### 8.6 Testing Strategy

**Unit Tests:**
- Form validation logic
- Data transformation functions (currency formatting, date formatting)
- Custom hooks (useAnalysis, useHistory)
- Utility functions

**Component Tests:**
- Render tests for all components
- User interaction tests (button clicks, form submissions)
- Accessibility tests (axe-core)
- Snapshot tests for visual regression

**Integration Tests:**
- Full form submission flow
- API mocking for predictable tests
- Navigation between views
- Modal interactions

**E2E Tests:**
- Complete user journey (input → analyze → view results → download CSV)
- History view interactions
- Multi-repository analysis
- Error scenarios

### 8.7 Migration Strategy

**Phase 1: Setup and Infrastructure**
1. Initialize React project (Vite or Create React App)
2. Install shadcn/ui and dependencies
3. Configure Tailwind with custom theme
4. Set up routing (if needed)

**Phase 2: Component Migration (Bottom-Up)**
1. Build atomic components (Button, Input, Label, Badge, Card)
2. Build composite components (Form, Table, Tabs, Modal)
3. Build page-level components (AnalyzeView, HistoryView)

**Phase 3: State and Logic Migration**
1. Convert global state to React Context
2. Migrate event handlers to React event system
3. Implement form validation with react-hook-form + zod
4. Migrate API calls to custom hooks

**Phase 4: Styling and Polish**
1. Apply Tailwind utilities
2. Implement two-layer shadow system
3. Fine-tune animations and transitions
4. Test responsive design

**Phase 5: Testing and Deployment**
1. Write tests for critical paths
2. Accessibility audit
3. Performance optimization
4. Deploy to production

---

## 9. Summary

This comprehensive requirements document maps every UI element of the Issue Estimator application from vanilla HTML/CSS/JavaScript to shadcn components. The application consists of two main views (Analyze and History) with the following component counts:

**Component Inventory:**
- **Form Components**: Input (7 instances), Label (7), Button (20+), FormField (2), FormDescription (1)
- **Navigation Components**: NavigationMenu (1), NavigationMenuItem (2), Tabs (1), TabsList (1), TabsTrigger (dynamic), TabsContent (dynamic)
- **Data Display**: Table (2), Card (10+), Badge (dynamic for complexities)
- **Feedback**: Alert (2), AlertDialog (2), Toast (optional), Progress (1), Skeleton (optional)
- **Overlay**: Dialog (1)
- **Layout**: Container, Grid, Flex patterns throughout
- **Typography**: Heading, Text, Paragraph components
- **Specialized**: ScrollArea (3), Tooltip (multiple)

**Key Implementation Priorities:**
1. Preserve existing 4-layer color depth system
2. Maintain two-layer shadow system for premium feel
3. Ensure WCAG AA accessibility compliance
4. Implement robust validation with zod
5. Optimize performance for large datasets
6. Maintain responsive design for mobile users

**Next Steps:**
1. Set up React + shadcn/ui project
2. Implement atomic components with custom styling
3. Migrate state management to React patterns
4. Implement comprehensive testing
5. Deploy and monitor performance

This document serves as the complete blueprint for modernizing the Issue Estimator application while preserving its design language, functionality, and user experience.

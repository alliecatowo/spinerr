# 🎵 Spinerr

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23-FF0055?style=for-the-badge&logo=framer&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.18-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

**An ambient dashboard music visualizer with stunning generative vinyl disc art**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Development](#-development)

</div>

---

## ✨ Features

### 🎨 Generative Vinyl Visualization
- **Algorithmic art** using p5.js with "Sonic Grooves" aesthetic
- **Unique patterns** per album using seeded Perlin noise
- **Interactive seeking** via touch/mouse on vinyl grooves
- **Realistic animations** with physics-based tone arm movement
- **60fps smooth rotation** with performance optimization

### 🎵 Music Player
- Beautiful vinyl record player interface
- Animated tone arm with spring physics
- Full playback controls (play/pause, skip, volume)
- Progress tracking and seeking
- Mock music library (ready for Spotify/local files integration)

### 📅 Calendar Integration
- Clean month view with event indicators
- Upcoming events list
- Multiple event types (meetings, appointments, birthdays, reminders)
- Date selection and filtering
- Mock Google Calendar data (ready for real API integration)

### 🎭 Responsive Design
- **Desktop**: 60/40 split layout (music | calendar)
- **Tablet**: Stacked responsive layout
- **Mobile**: Swipeable views with toggle
- Glass-morphism UI with dark mode
- Smooth Framer Motion animations

### 🎮 Interactive Features
- Touch and mouse interactions on vinyl
- Keyboard shortcuts (coming soon)
- View mode toggle (music only, both, calendar only)
- Smooth page transitions
- Accessibility-first design

---

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with server components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### Styling & UI
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Radix UI-based component library
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready animations

### State & Data
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[date-fns](https://date-fns.org/)** - Modern date utilities

### Visualization
- **[p5.js](https://p5js.org/)** - Creative coding and generative art
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon library

### Tooling
- **[mise](https://mise.jdx.dev/)** - Development environment management
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[ESLint 9](https://eslint.org/)** - Code linting and formatting

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** (managed via mise)
- **pnpm 10+**
- **mise** for tooling management

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/spinerr.git
cd spinerr

# Install mise if not already installed
curl https://mise.run | sh

# Install project dependencies
mise install

# Navigate to web directory
cd web

# Install Node.js packages
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev

# Open http://localhost:3000 in your browser
```

### Build

```bash
# Create production build
pnpm build

# Start production server
pnpm start
```

### Linting

```bash
# Run ESLint
pnpm lint
```

---

## 🏗️ Architecture

### Project Structure

```
spinerr/
├── web/                          # Next.js application
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── page.tsx          # Main dashboard page
│   │   │   └── globals.css       # Global styles + Tailwind
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── music/            # Music player components
│   │   │   │   ├── VinylDisc.tsx
│   │   │   │   ├── ToneArm.tsx
│   │   │   │   ├── PlayerControls.tsx
│   │   │   │   └── NowPlaying.tsx
│   │   │   ├── calendar/         # Calendar components
│   │   │   │   ├── Calendar.tsx
│   │   │   │   ├── UpcomingEvents.tsx
│   │   │   │   └── EventCard.tsx
│   │   │   └── layout/           # Layout components
│   │   │       ├── Dashboard.tsx
│   │   │       └── ViewToggle.tsx
│   │   ├── lib/
│   │   │   ├── store.ts          # Zustand state management
│   │   │   ├── mock-data.ts      # Mock albums & events
│   │   │   ├── vinyl-sketch.ts   # p5.js visualization
│   │   │   └── utils.ts          # Utility functions
│   │   └── hooks/                # Custom React hooks
│   ├── public/                   # Static assets
│   ├── package.json
│   └── next.config.ts
├── .mise.toml                    # Tool versions
└── README.md
```

### Component Hierarchy

```
Dashboard (layout/Dashboard.tsx)
├── ViewToggle (layout/ViewToggle.tsx)
├── Music Section
│   ├── VinylDisc (music/VinylDisc.tsx)
│   │   └── p5.js Canvas (lib/vinyl-sketch.ts)
│   ├── ToneArm (music/ToneArm.tsx)
│   ├── NowPlaying (music/NowPlaying.tsx)
│   └── PlayerControls (music/PlayerControls.tsx)
└── Calendar Section
    ├── Calendar (calendar/Calendar.tsx)
    └── UpcomingEvents (calendar/UpcomingEvents.tsx)
        └── EventCard[] (calendar/EventCard.tsx)
```

### State Management

**Zustand Stores** (`lib/store.ts`):

```typescript
// Player Store
usePlayerStore()
  - currentTrack: Track | null
  - isPlaying: boolean
  - progress: number (0-1)
  - volume: number (0-1)
  - playlist: Track[]
  - Actions: play(), pause(), setTrack(), nextTrack(), prevTrack()

// Calendar Store
useCalendarStore()
  - selectedDate: Date
  - events: CalendarEvent[]
  - viewMode: 'music' | 'calendar' | 'both'
  - Actions: selectDate(), setViewMode(), addEvent()
```

---

## 🎨 Design Philosophy

### Generative Art - "Sonic Grooves"

The vinyl visualization embodies computational beauty through:

- **Seeded Randomness**: Each album generates unique, reproducible patterns
- **Perlin Noise**: Organic groove displacement mimicking vinyl imperfections
- **Layered Transparency**: Triple-layer shimmer creating optical depth
- **Mathematical Harmony**: Trigonometric functions producing emergent patterns
- **Temporal Evolution**: Living, breathing grooves that evolve over time

### UI/UX Principles

- **Glass-morphism**: Subtle backdrop blur with gradient overlays
- **Ambient Aesthetic**: Low-opacity borders and muted colors
- **Smooth Animations**: Spring physics and natural easing
- **Responsive First**: Mobile to desktop, touch to mouse
- **Accessible**: ARIA labels, keyboard navigation, screen reader support

---

## 🔮 Roadmap

### Phase 1: Core Architecture ✅
- [x] Project setup with Next.js 16 + React 19
- [x] Tailwind CSS v4 + shadcn/ui integration
- [x] Component architecture (music, calendar, layout)
- [x] Zustand state management
- [x] p5.js generative vinyl visualization
- [x] Mock data (albums, events)

### Phase 2: Integration & Polish 🚧
- [ ] Wire Dashboard to main page
- [ ] Implement playback state synchronization
- [ ] Add keyboard shortcuts
- [ ] Touch gesture support (swipe, pinch)
- [ ] Accessibility improvements
- [ ] Performance optimization

### Phase 3: Real Data Integration 🔜
- [ ] Spotify Web API integration
- [ ] Google Calendar API integration
- [ ] Local file support
- [ ] Playlist management
- [ ] Event creation/editing

### Phase 4: Advanced Features 💡
- [ ] Audio visualization (waveform, frequency bars)
- [ ] Vinyl collection browsing
- [ ] Custom vinyl disc designs
- [ ] Social sharing
- [ ] PWA support (offline mode)
- [ ] Multi-room audio sync

---

## 🧑‍💻 Development

### Code Style

This project follows:
- **TypeScript strict mode** for type safety
- **ESLint** with Next.js config for linting
- **Prettier** for code formatting (via ESLint)
- **Component-driven architecture** with single responsibility

### Best Practices

- Use `"use client"` directive for client components
- Import from `@/` path alias (e.g., `@/lib/store`)
- Keep components small and focused
- Use Zustand for global state, React state for local
- Leverage shadcn/ui components for consistency
- Framer Motion for all animations
- TypeScript types over `any`

### Performance

- **Dynamic imports** for p5.js (avoid SSR issues)
- **Conditional rendering** for performance-heavy components
- **Debounced updates** for seek interactions
- **Memoization** for expensive calculations
- **Lazy loading** for off-screen content

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **shadcn** for the beautiful component library
- **Framer** for Framer Motion
- **p5.js Community** for creative coding inspiration
- **Radix UI** for accessible primitives

---

<div align="center">

**Built with ❤️ using Next.js, React, and p5.js**

*Spinerr - Where music meets generative art*

</div>

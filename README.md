# Survey Dashboard

A modern, full-featured dashboard for managing, visualizing, and validating survey data with a beautiful UI. Built with Next.js, React, Tailwind CSS, and Leaflet.js.

![Survey Dashboard Screenshot](public/space-background.webp)

## Features

- **Interactive Map View**: Visualize survey markers and branch images on a satellite map (Leaflet.js), with direction overlays and marker popups.
- **Survey Management**: Add, validate, and track surveys. View status (pending/complete), AOI, surveyor, and sync time.
- **User Management**: Admins can add or remove users, assign roles, and manage user details.
- **Modern UI**: Responsive, glassmorphic design using Tailwind CSS and Radix UI components.
- **Role-based Access**: Admin and user roles with tailored navigation and permissions.
- **Mock Data**: Easily extensible mock data for users, surveys, and markers for rapid prototyping.

## Screenshots

![Map View](public/space-background.webp)

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation
```bash
pnpm install
# or
npm install
```

### Development
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production
```bash
pnpm build && pnpm start
# or
npm run build && npm start
```

## Project Structure
- `app/` - Next.js app directory (routing, pages)
- `components/` - UI, map, admin, and survey components
- `data/` - Mock survey data
- `lib/` - Auth and mock data logic
- `public/` - Static assets (backgrounds, images)
- `styles/` - Global styles

## Technologies Used
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet.js](https://leafletjs.com/) (map rendering)
- [Radix UI](https://www.radix-ui.com/) (UI primitives)

## Customization
- Update mock data in `lib/auth.ts` and `data/survey-data.ts`.
- Add new UI components in `components/ui/`.
- Change map tile provider in `components/map/map-view.tsx`.

## License
MIT

---

> © 2025 Survey Dashboard. Built with ❤️ by your team.

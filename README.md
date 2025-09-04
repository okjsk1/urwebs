# UrWebs

UrWebs is a modern web application built with [Vite](https://vitejs.dev/) and [React](https://react.dev/). It serves as an experimental playground demonstrating UI patterns and integrations such as Firebase authentication and Supabase data storage.

## Installation

Install dependencies:

```bash
npm install
```

## Usage

- **Development server:** `npm run dev`
- **Preview production build:** `npm run preview`

## Build

Generate a production build:

```bash
npm run build
```

The optimized assets are output to the `dist/` directory.

## Environment Variables

Some features require configuration using environment variables. Create a `.env` file in the project root and define:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These values are used in `src/lib/supabase.ts` to connect to your Supabase project.

## Contributing

Contributions are welcome!

1. Fork the repository and create a feature branch.
2. Implement your changes following the existing code style.
3. Run tests and build steps to ensure the project remains stable.
4. Submit a pull request describing your changes.


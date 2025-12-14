# Bushu - Elysia API Project

A modern API built with Elysia and TypeScript, following best practices and clean architecture.

## Features

- 🚀 Blazing fast with Elysia framework
- 📁 Clean and modular directory structure
- 🔧 TypeScript for type safety
- 💻 Development with Bun runtime
- 📝 Well-documented

## Tech Stack

- **Framework**: Elysia ^1.4.19
- **Runtime**: Bun ^1.3.1
- **Language**: TypeScript ^5

## Project Structure

```
├── src/
│   ├── app.ts              # Main Elysia app instance
│   ├── index.ts            # Server entry point
│   ├── routes/             # API route definitions
│   ├── controllers/        # Business logic handlers
│   ├── services/           # Core business services
│   ├── models/             # Data models and schemas
│   ├── types/              # TypeScript type definitions
│   ├── middlewares/        # Custom middlewares
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── .gitignore              # Git ignore rules
```

## Getting Started

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

### Build

```bash
bun run build
```

### Production

```bash
bun run start
```

### Preview Production Build

```bash
bun run preview
```

## Directory Descriptions

- **app.ts**: Initializes the Elysia app with global configurations
- **index.ts**: Starts the server and registers all routes
- **routes/**: Contains API endpoints and route handlers
- **controllers/**: Implements business logic for each endpoint
- **services/**: Contains core functionality and data access
- **models/**: Defines data structures and validation schemas
- **types/**: Shared TypeScript type definitions
- **middlewares/**: Custom middlewares (authentication, logging, etc.)
- **utils/**: Helper functions and utilities
- **config/**: Environment-specific configurations

## Example Usage

To add a new feature:

1. Define routes in `src/routes/`
2. Implement business logic in `src/controllers/`
3. Add core functionality in `src/services/`
4. Define models in `src/models/`

## License

MIT

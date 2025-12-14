import { Elysia } from 'elysia'
// Import individual route modules here when they're created
import userRoutes from './user'

const routes = new Elysia({ prefix: '/api' })

// Register route modules
routes.use(userRoutes)

export default routes

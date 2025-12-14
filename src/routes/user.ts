import { Elysia, t } from 'elysia'
import { userController } from '../controllers/user.controller'

// Create user route module
const userRoutes = new Elysia({ prefix: '/users' })
  // Get all users
  .get('/', () => userController.getUsers())

  // Get user by ID
  .get('/:id', ({ params }) => userController.getUser(Number(params.id)), {
    params: t.Object({
      id: t.String({ format: 'number' })
    })
  })

  // Create new user
  .post('/', ({ body }) => userController.createUser(body), {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      age: t.Optional(t.Number())
    })
  })

  // Update user by ID
  .put('/:id', ({ params, body }) => userController.updateUser(Number(params.id), body), {
    params: t.Object({
      id: t.String({ format: 'number' })
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      email: t.Optional(t.String({ format: 'email' })),
      age: t.Optional(t.Number())
    })
  })

  // Delete user by ID
  .delete('/:id', ({ params }) => userController.deleteUser(Number(params.id)), {
    params: t.Object({
      id: t.String({ format: 'number' })
    })
  })

export default userRoutes

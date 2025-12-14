import { prisma } from '../utils/prisma'
import { CreateUserInput, UpdateUserInput } from '../types/user'
import redis from '../utils/redis'

export class UserService {
  // Create a new user
  async createUser(data: CreateUserInput) {
    const user = await prisma.user.create({ data })

    // Cache the user
    await redis.set(`user:${user.id}`, JSON.stringify(user), 'EX', 3600)

    return user
  }

  // Get user by ID with cache
  async getUserById(id: number) {
    // Check cache first
    const cachedUser = await redis.get(`user:${id}`)
    if (cachedUser) {
      return JSON.parse(cachedUser)
    }

    // Fetch from database
    const user = await prisma.user.findUnique({ where: { id } })

    if (user) {
      // Cache the result
      await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600)
    }

    return user
  }

  // Get all users
  async getAllUsers() {
    // Check cache first
    const cachedUsers = await redis.get('users:all')
    if (cachedUsers) {
      return JSON.parse(cachedUsers)
    }

    // Fetch from database
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Cache the result
    await redis.set('users:all', JSON.stringify(users), 'EX', 600)

    return users
  }

  // Update user by ID
  async updateUser(id: number, data: UpdateUserInput) {
    const user = await prisma.user.update({
      where: { id },
      data
    })

    // Update cache
    await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600)
    // Invalidate all users cache
    await redis.del('users:all')

    return user
  }

  // Delete user by ID
  async deleteUser(id: number) {
    const user = await prisma.user.delete({ where: { id } })

    // Remove from cache
    await redis.del(`user:${id}`)
    // Invalidate all users cache
    await redis.del('users:all')

    return user
  }
}

// Export singleton instance
export const userService = new UserService()

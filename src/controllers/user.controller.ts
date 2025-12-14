import { userService } from '../services/user.service'
import type { CreateUserInput, UpdateUserInput } from '../types/user'

export class UserController {
  // Get all users
  async getUsers() {
    const users = await userService.getAllUsers()
    return {
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    }
  }

  // Get user by ID
  async getUser(id: number) {
    const user = await userService.getUserById(id)

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      }
    }

    return {
      success: true,
      data: user,
      message: 'User retrieved successfully'
    }
  }

  // Create new user
  async createUser(data: CreateUserInput) {
    try {
      const user = await userService.createUser(data)
      return {
        success: true,
        data: user,
        message: 'User created successfully'
      }
    } catch (error: any) {
      if (error.code === 'P2002') {
        return {
          success: false,
          message: 'Email already exists'
        }
      }

      return {
        success: false,
        message: 'Failed to create user'
      }
    }
  }

  // Update user
  async updateUser(id: number, data: UpdateUserInput) {
    try {
      const user = await userService.updateUser(id, data)
      return {
        success: true,
        data: user,
        message: 'User updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: 'User not found'
      }
    }
  }

  // Delete user
  async deleteUser(id: number) {
    try {
      const user = await userService.deleteUser(id)
      return {
        success: true,
        data: user,
        message: 'User deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: 'User not found'
      }
    }
  }
}

// Export singleton instance
export const userController = new UserController()

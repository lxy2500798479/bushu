// User creation request body
export interface CreateUserInput {
  name: string;
  email: string;
  age?: number;
}

// User update request body
export interface UpdateUserInput {
  name?: string;
  email?: string;
  age?: number;
}

// User response
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

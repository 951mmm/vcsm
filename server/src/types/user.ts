export interface User {
    id: number;
    username: string;
    role: 'admin' | 'user';
    created_at: Date;
}

export interface UserWithPassword extends User {
    password: string;
}

export interface CreateUserDto {
    username: string;
    password: string;
    role: 'admin' | 'user';
}

export interface UpdateUserDto {
    username?: string;
    password?: string;
    role?: 'admin' | 'user';
} 
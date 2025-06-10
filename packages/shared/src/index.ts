// Shared types and utilities for both frontend and backend

export const APP_NAME = 'Hono React App';

// Common interfaces
export interface User {
    id: string;
    name: string;
    email: string;
}

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
}; 
export interface Category {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
}

export interface CategoryRequest {
    name: string;
    description?: string | null;
}

export interface Location {
    id: number;
    aisle: string;
    rack: string;
    level: string;
    description: string | null;
    createdAt: string;
}

export interface LocationRequest {
    aisle: string;
    rack: string;
    level: string;
    description?: string | null;
}

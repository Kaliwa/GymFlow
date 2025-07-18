export interface Address {
    street: string;
    city: string;
    zipCode: string;
    country: string;
}

export interface ContactInfo {
    phone: string;
    email: string;
    website?: string;
}

export interface SocialLinks {
    instagram?: string;
    facebook?: string;
    twitter?: string;
}

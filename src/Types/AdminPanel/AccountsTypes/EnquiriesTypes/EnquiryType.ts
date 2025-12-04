export interface EnquiryImage {
    uid: string;
    image: string;
    created_at: string;
    updated_at: string;
}

export interface EnquiryProps {
    uid: string;
    level: string;
    topic: string;
    subject: string;
    queries: string;
    status: string;
    images: EnquiryImage[];
    created_at: string;
}
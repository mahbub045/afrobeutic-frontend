  export interface EnquiryProps  {
    uid: string;
    type?: string | null;
    summary?: string | null;
    status?: string | null;
    lead?: { first_name?: string | null; last_name?: string | null } | null;
    customer?: { name?: string | null } | null;
    created_at?: string | null;
    salon?: { name?: string | null } | null;
  };
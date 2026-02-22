export type OpportunityStatus =
    | 'Teklif verildi'
    | 'Teklif görüşüldü'
    | 'Teklif detaylandırıldı'
    | 'Bitmeye çok yakın'
    | 'Bitti';

export interface ContactPerson {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface TrainingItem {
    id: string;
    topic: string;
    type: string;
    amount: number;
    duration: string;
    hasAssessment: boolean;
    participantCount?: number;
    assessmentPrice?: number;
    status: 'pending' | 'won' | 'lost';
}

export interface Opportunity {
    id: string;
    customerName: string;
    createdAt: string;
    lastUpdatedAt?: string;
    name: string;
    contact: ContactPerson;
    trainings: TrainingItem[];
    totalAmount: number;
    notes: string;
    status: OpportunityStatus;
}

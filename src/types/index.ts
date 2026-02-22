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

export interface Activity {
    id: string;
    date: string;
    content: string;
    type: 'note' | 'email' | 'call' | 'meeting';
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
    lossReason?: string;
}

export interface OppTask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export interface Opportunity {
    id: string;
    customerName: string;
    createdAt: string;
    lastUpdatedAt?: string;
    targetCloseDate?: string;
    assignee?: string;
    name: string;
    contact: ContactPerson;
    trainings: TrainingItem[];
    activities: Activity[];
    tasks: OppTask[];
    totalAmount: number;
    notes?: string; /* Legacy */
    status: OpportunityStatus;
}

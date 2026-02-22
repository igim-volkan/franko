import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Opportunity, OpportunityStatus } from '../types';

interface OpportunityContextType {
    opportunities: Opportunity[];
    addOpportunity: (opp: Opportunity) => void;
    updateOpportunityStatus: (id: string, status: OpportunityStatus) => void;
    updateOpportunity: (id: string, opp: Partial<Opportunity>) => void;
}

export const OpportunityContext = createContext<OpportunityContextType | undefined>(undefined);

export const OpportunityProvider = ({ children }: { children: ReactNode }) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

    const addOpportunity = (opp: Opportunity) => {
        setOpportunities(prev => [...prev, opp]);
    };

    const updateOpportunityStatus = (id: string, status: OpportunityStatus) => {
        setOpportunities(prev => prev.map(opp => opp.id === id ? { ...opp, status } : opp));
    };

    const updateOpportunity = (id: string, updatedFields: Partial<Opportunity>) => {
        setOpportunities(prev => prev.map(opp => opp.id === id ? { ...opp, ...updatedFields } : opp));
    };

    return (
        <OpportunityContext.Provider value={{ opportunities, addOpportunity, updateOpportunityStatus, updateOpportunity }}>
            {children}
        </OpportunityContext.Provider>
    );
};

export const useOpportunities = () => {
    const context = useContext(OpportunityContext);
    if (!context) throw new Error("useOpportunities must be used within an OpportunityProvider");
    return context;
};

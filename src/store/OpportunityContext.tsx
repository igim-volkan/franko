import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Opportunity, OpportunityStatus } from '../types';
import { supabase } from '../lib/supabase';

// Helper function to map Supabase database row to our TypeScript 'Opportunity' type
// In a real app we'd use auto-generated types, but we'll do manual mapping here for safety
const mapDbToOpportunity = (row: any): Opportunity => {
    return {
        id: row.id,
        customerName: row.customer_name,
        createdAt: row.created_at,
        lastUpdatedAt: row.last_updated_at,
        targetCloseDate: row.target_close_date,
        assignee: row.assignee,
        name: row.name,
        contact: row.contact,
        trainings: row.trainings,
        activities: row.activities,
        tasks: row.tasks,
        totalAmount: Number(row.total_amount),
        notes: row.notes,
        status: row.status as OpportunityStatus,
    };
};

const mapOpportunityToDb = (opp: Partial<Opportunity>) => {
    const data: any = {};
    if (opp.customerName !== undefined) data.customer_name = opp.customerName;
    if (opp.createdAt !== undefined) data.created_at = opp.createdAt;
    if (opp.lastUpdatedAt !== undefined) data.last_updated_at = opp.lastUpdatedAt;
    if (opp.targetCloseDate !== undefined) data.target_close_date = opp.targetCloseDate;
    if (opp.assignee !== undefined) data.assignee = opp.assignee;
    if (opp.name !== undefined) data.name = opp.name;
    if (opp.contact !== undefined) data.contact = opp.contact;
    if (opp.trainings !== undefined) data.trainings = opp.trainings;
    if (opp.activities !== undefined) data.activities = opp.activities;
    if (opp.tasks !== undefined) data.tasks = opp.tasks;
    if (opp.totalAmount !== undefined) data.total_amount = opp.totalAmount;
    if (opp.notes !== undefined) data.notes = opp.notes;
    if (opp.status !== undefined) data.status = opp.status;
    return data;
}

interface OpportunityContextType {
    opportunities: Opportunity[];
    isLoading: boolean;
    error: string | null;
    addOpportunity: (opp: Opportunity) => Promise<void>;
    updateOpportunityStatus: (id: string, status: OpportunityStatus) => Promise<void>;
    updateOpportunity: (id: string, opp: Partial<Opportunity>) => Promise<void>;
    refreshData: () => Promise<void>;
}

export const OpportunityContext = createContext<OpportunityContextType | undefined>(undefined);

export const OpportunityProvider = ({ children }: { children: ReactNode }) => {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOpportunities = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('opportunities')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Supabase fetch error:", error);
                throw error;
            }

            if (data) {
                setOpportunities(data.map(mapDbToOpportunity));
            }
        } catch (err: any) {
            setError(err.message || 'Veriler yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const addOpportunity = async (opp: Opportunity) => {
        const newOppData = {
            id: opp.id, // we generate it in Modal currently
            customer_name: opp.customerName,
            target_close_date: opp.targetCloseDate,
            assignee: opp.assignee,
            name: opp.name,
            contact: opp.contact,
            trainings: opp.trainings,
            activities: opp.activities,
            tasks: opp.tasks,
            total_amount: opp.totalAmount,
            notes: opp.notes,
            status: opp.status
        };

        // Optimistic UI update
        const tempOpp = { ...opp, createdAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString() };
        setOpportunities(prev => [tempOpp, ...prev]);

        try {
            const { error: insertError } = await supabase
                .from('opportunities')
                .insert([newOppData]);

            if (insertError) {
                throw insertError;
            }
            // re-fetch to ensure we have actual DB assigned timestamps/ids if any
            await fetchOpportunities();
        } catch (err) {
            console.error("Failed to add opportunity", err);
            // Revert optimistic update (basic handling)
            setOpportunities(prev => prev.filter(o => o.id !== opp.id));
            alert("Fırsat eklenirken bir hata oluştu.");
        }
    };

    const updateOpportunityStatus = async (id: string, status: OpportunityStatus) => {
        const timestamp = new Date().toISOString();

        // Optimistic update
        setOpportunities(prev => prev.map(opp =>
            opp.id === id ? { ...opp, status, lastUpdatedAt: timestamp } : opp
        ));

        try {
            const { error } = await supabase
                .from('opportunities')
                .update({ status: status, last_updated_at: timestamp })
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error("Failed to update status", err);
            await fetchOpportunities(); // revert on failure
        }
    };

    const updateOpportunity = async (id: string, updatedFields: Partial<Opportunity>) => {
        const timestamp = new Date().toISOString();
        const dbFields = mapOpportunityToDb(updatedFields);
        dbFields.last_updated_at = timestamp;

        // Optimistic update
        setOpportunities(prev => prev.map(opp =>
            opp.id === id ? { ...opp, ...updatedFields, lastUpdatedAt: timestamp } : opp
        ));

        try {
            const { error } = await supabase
                .from('opportunities')
                .update(dbFields)
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error("Failed to update opportunity", err);
            await fetchOpportunities(); // revert on failure
        }
    };

    return (
        <OpportunityContext.Provider value={{
            opportunities,
            isLoading,
            error,
            addOpportunity,
            updateOpportunityStatus,
            updateOpportunity,
            refreshData: fetchOpportunities
        }}>
            {children}
        </OpportunityContext.Provider>
    );
};

export const useOpportunities = () => {
    const context = useContext(OpportunityContext);
    if (!context) throw new Error("useOpportunities must be used within an OpportunityProvider");
    return context;
};

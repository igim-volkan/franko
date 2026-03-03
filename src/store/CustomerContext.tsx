import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Customer } from '../types';
import { supabase } from '../lib/supabase';

interface CustomerContextType {
    customers: Customer[];
    isLoading: boolean;
    error: string | null;
    addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
    refreshData: () => Promise<void>;
}

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                // If table doesn't exist yet, we won't crash the app, just log it.
                if (error.code === '42P01') {
                    console.warn("customers table does not exist in Supabase yet.");
                    setCustomers([]);
                } else {
                    console.error("Supabase fetch customers error:", error);
                    throw error;
                }
            } else if (data) {
                setCustomers(data.map(row => ({
                    id: row.id,
                    companyName: row.company_name,
                    representative: row.representative,
                    contactName: row.contact_name,
                    industry: row.industry,
                    email: row.email,
                    phone: row.phone,
                    employeeCount: row.employee_count,
                    address: row.address,
                    billingAddress: row.billing_address,
                    taxOffice: row.tax_office,
                    taxNumber: row.tax_number,
                    type: row.type as 'potential' | 'existing',
                    createdAt: row.created_at
                })));
            }
        } catch (err: any) {
            setError('Müşteriler yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
        const dbData = {
            company_name: customer.companyName,
            representative: customer.representative,
            contact_name: customer.contactName,
            industry: customer.industry,
            email: customer.email,
            phone: customer.phone,
            employee_count: customer.employeeCount,
            address: customer.address,
            billing_address: customer.billingAddress,
            tax_office: customer.taxOffice,
            tax_number: customer.taxNumber,
            type: customer.type
        };

        try {
            const { error: insertError } = await supabase
                .from('customers')
                .insert([dbData]);

            if (insertError) {
                throw insertError;
            }
            await fetchCustomers();
        } catch (err) {
            console.error("Failed to add customer", err);
            throw err;
        }
    };

    return (
        <CustomerContext.Provider value={{
            customers,
            isLoading,
            error,
            addCustomer,
            refreshData: fetchCustomers
        }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomers = () => {
    const context = useContext(CustomerContext);
    if (!context) throw new Error("useCustomers must be used within a CustomerProvider");
    return context;
};

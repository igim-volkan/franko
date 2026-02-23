import { useState } from 'react';
import { OpportunityProvider, useOpportunities } from './store/OpportunityContext';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { CustomerDirectory } from './components/CustomerDirectory';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CalendarView } from './components/CalendarView';
import { NewOpportunityModal } from './components/NewOpportunityModal';

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'kanban' | 'customers' | 'reports' | 'calendar'>('kanban');
  const { isLoading, error } = useOpportunities();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Veriler yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl max-w-md w-full text-center">
          <h3 className="font-semibold text-lg mb-2">Hata Oluştu</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      onNewOpportunity={() => setIsModalOpen(true)}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'kanban' && <KanbanBoard />}
      {activeTab === 'customers' && <CustomerDirectory />}
      {activeTab === 'reports' && <AnalyticsDashboard />}
      {activeTab === 'calendar' && <CalendarView />}

      {isModalOpen && (
        <NewOpportunityModal onClose={() => setIsModalOpen(false)} />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <OpportunityProvider>
      <AppContent />
    </OpportunityProvider>
  );
}

import { useState } from 'react';
import { OpportunityProvider } from './store/OpportunityContext';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { CustomerDirectory } from './components/CustomerDirectory';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CalendarView } from './components/CalendarView';
import { NewOpportunityModal } from './components/NewOpportunityModal';

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'kanban' | 'customers' | 'reports' | 'calendar'>('kanban');

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

import { useState } from 'react';
import { OpportunityProvider } from './store/OpportunityContext';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { NewOpportunityModal } from './components/NewOpportunityModal';

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Layout onNewOpportunity={() => setIsModalOpen(true)}>
      <KanbanBoard />

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

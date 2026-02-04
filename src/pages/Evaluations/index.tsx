import React, { useState } from 'react';
import EvaluationList from './components/EvaluationList';
import EvaluationDetail from './components/EvaluationDetail';
import { MOCK_EVALUATIONS } from '../../utils/mockEvaluations';

const EvaluationsPage: React.FC = () => {
    const [evaluations, setEvaluations] = useState(MOCK_EVALUATIONS);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedEvaluation = evaluations.find(ev => ev.id === selectedId) || null;

    const handleUpdateEvaluation = (id: string, updates: Partial<typeof MOCK_EVALUATIONS[0]>) => {
        setEvaluations(prev => prev.map(ev =>
            ev.id === id ? { ...ev, ...updates } : ev
        ));
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '2rem',
            height: '100%',
            maxHeight: 'calc(100vh - 120px)'
        }}>
            {/* Left Column: List */}
            <div style={{ height: '100%', overflowY: 'auto' }}>
                <EvaluationList
                    evaluations={evaluations}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />
            </div>

            {/* Right Column: Detail */}
            <div style={{ height: '100%', overflowY: 'auto' }}>
                <EvaluationDetail
                    evaluation={selectedEvaluation}
                    onUpdate={handleUpdateEvaluation}
                />
            </div>
        </div>
    );
};

export default EvaluationsPage;

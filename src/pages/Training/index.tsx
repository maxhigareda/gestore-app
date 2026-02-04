import React, { useState } from 'react';
import VideoCard from './components/VideoCard';
import VideoPlayerModal from './components/VideoPlayerModal';
import { MOCK_TRAINING_VIDEOS, type TrainingVideo } from '../../utils/mockTraining';

const TrainingPage: React.FC = () => {
    const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 0.5rem 1.5rem 0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Mis Capacitaciones</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Explora los tutoriales y videos asignados a tu perfil.</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
                overflowY: 'auto',
                padding: '0.5rem'
            }}>
                {MOCK_TRAINING_VIDEOS.map(video => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        onClick={() => setSelectedVideo(video)}
                    />
                ))}
            </div>

            {selectedVideo && (
                <VideoPlayerModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
};

export default TrainingPage;

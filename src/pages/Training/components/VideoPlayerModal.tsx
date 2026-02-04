import React from 'react';
import { X } from 'lucide-react';
import { type TrainingVideo } from '../../../utils/mockTraining';

interface VideoPlayerModalProps {
    video: TrainingVideo;
    onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)', // Darker overlay for cinema mode
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                width: '90%',
                maxWidth: '1000px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{video.title}</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.1)'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Video Player */}
                <div style={{
                    position: 'relative',
                    paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
                    height: 0,
                    backgroundColor: 'black',
                    borderRadius: 'var(--border-radius)',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                    {video.type === 'youtube' ? (
                        <iframe
                            src={`${video.url}?autoplay=1`}
                            title={video.title}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            src={video.url}
                            controls
                            autoPlay
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerModal;

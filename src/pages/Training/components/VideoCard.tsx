import React from 'react';
import { Play } from 'lucide-react';
import { type TrainingVideo, getYoutubeThumbnail } from '../../../utils/mockTraining';

interface VideoCardProps {
    video: TrainingVideo;
    onClick: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
    const thumbnailUrl = video.thumbnail || (video.type === 'youtube' ? getYoutubeThumbnail(video.url) : '');

    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--border-radius)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                // Find the play icon container and scale it
                const playIcon = e.currentTarget.querySelector('.play-icon');
                if (playIcon) (playIcon as HTMLElement).style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                const playIcon = e.currentTarget.querySelector('.play-icon');
                if (playIcon) (playIcon as HTMLElement).style.transform = 'scale(1)';
            }}
        >
            {/* Thumbnail */}
            <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
                <img
                    src={thumbnailUrl}
                    alt={video.title}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.8
                    }}
                />
                {/* Play Icon Overlay */}
                <div
                    className="play-icon"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        border: '2px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Play size={24} fill="white" />
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                }}>
                    {video.duration}
                </div>
            </div>

            {/* Info */}
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <div>
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {video.category}
                    </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{video.title}</h4>
                <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-paragraph)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {video.description}
                </p>
            </div>
        </div>
    );
};

export default VideoCard;

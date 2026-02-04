export interface TrainingVideo {
    id: string;
    title: string;
    description: string;
    thumbnail?: string; // Optional custom thumbnail
    url: string;
    type: 'youtube' | 'direct';
    duration: string;
    category: string;
}

export const MOCK_TRAINING_VIDEOS: TrainingVideo[] = [
    {
        id: 'vid-1',
        title: 'Bienvenida a Store Intelligence',
        description: 'Conoce nuestra misión, visión y valores en este video introductorio.',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
        type: 'youtube',
        duration: '5:20',
        category: 'Onboarding'
    },
    {
        id: 'vid-2',
        title: 'Protocolos de Seguridad 2024',
        description: 'Actualización sobre las normativas de seguridad en planta y oficinas.',
        url: 'https://www.youtube.com/embed/lxRwEPvL-mQ', // Placeholder
        type: 'youtube',
        duration: '12:45',
        category: 'Seguridad'
    },
    {
        id: 'vid-3',
        title: 'Uso del Portal GeStore',
        description: 'Tutorial paso a paso para solicitar vacaciones y permisos.',
        url: 'https://www.youtube.com/embed/tgbNymZ7vqY', // Placeholder
        type: 'youtube',
        duration: '8:10',
        category: 'Herramientas'
    },
    {
        id: 'vid-4',
        title: 'Liderazgo Efectivo',
        description: 'Técnicas para gestionar equipos de alto rendimiento.',
        url: 'https://www.youtube.com/embed/ScMzIvxBSi4', // Placeholder
        type: 'youtube',
        duration: '15:30',
        category: 'Desarrollo'
    }
];

// Helper to get YouTube thumbnail
export const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
        ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`
        : 'https://via.placeholder.com/320x180.png?text=Video';
};

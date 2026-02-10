import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { User, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface OrgProfile {
    id: string;
    first_name: string;
    last_name: string;
    job_title: string;
    photo_url: string | null;
    avatar_url?: string | null;
    manager_id: string | null;
    _count?: number; // Subordinate count
}

const OrgNode: React.FC<{
    profile: OrgProfile;
    isRoot?: boolean;
    parentNode?: OrgProfile
}> = ({ profile, isRoot, parentNode: _parentNode }) => {
    const [subordinates, setSubordinates] = useState<OrgProfile[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    // const [loading, setLoading] = useState(false); // Unused for now
    const [subCount, setSubCount] = useState(0);

    useEffect(() => {
        fetchSubordinateCount();
    }, [profile.id]);

    const fetchSubordinateCount = async () => {
        // Use RPC or raw count
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('manager_id', profile.id);

        if (!error && count !== null) {
            setSubCount(count);
        }
    };

    const toggleExpand = async () => {
        if (isExpanded) {
            setIsExpanded(false);
            return;
        }

        // setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('manager_id', profile.id);

        if (!error && data) {
            setSubordinates(data as OrgProfile[]);
            setIsExpanded(true);
        }
        // setLoading(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Top Line (Connect to Parent) */}
            {!isRoot && (
                <div style={{
                    width: '1px',
                    height: '20px',
                    backgroundColor: '#ccc',
                    marginBottom: '0px'
                }} />
            )}

            {/* Node Card */}
            <div
                style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '1rem',
                    width: '260px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                {/* Photo */}
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#e0e0e0',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 1px #eee'
                }}>
                    {(profile.photo_url || profile.avatar_url) ? (
                        <img src={profile.photo_url || profile.avatar_url || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <User size={24} color="#888" />
                    )}
                </div>

                {/* Text Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {profile.first_name} {profile.last_name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                        {profile.job_title || 'N/A'}
                    </p>
                </div>

                {/* Subordinate Badge / Toggle */}
                {subCount > 0 && (
                    <button
                        onClick={toggleExpand}
                        style={{
                            background: isExpanded ? 'var(--color-primary)' : 'var(--color-background)',
                            color: isExpanded ? '#fff' : 'var(--color-text-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Users size={12} />
                        {subCount}
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                )}
            </div>

            {/* Subordinates Area */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        {/* Vertical Line downwards from parent */}
                        <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc' }} />

                        {/* Horizontal Line spanning children */}
                        {subordinates.length > 1 && (
                            <div style={{
                                width: `calc(100% - 260px)`, // Rough logic, usually requires intricate width calc
                                // Better approach: Flex container with lines on each child
                                borderTop: '1px solid #ccc',
                                height: '0px'
                            }} />
                        )}

                        {/* Children Container */}
                        <div style={{ display: 'flex', gap: '2rem', paddingTop: '0px' }}>
                            {subordinates.map((sub) => (
                                <div key={sub.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {/* Small top connecter for child to the horizontal bar above */}
                                    {/* To make it look like a tree, we need the horizontal bar to just span from first to last child center. 
                                        CSS-only tree lines are tricky. Simplified approach: 
                                        Just flex row here, and letting each child draw its own top connector. 
                                    */}
                                    <OrgNode profile={sub} parentNode={profile} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const OrganigramaPage: React.FC = () => {
    const [rootNode, setRootNode] = useState<OrgProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoot();
    }, []);

    const fetchRoot = async () => {
        try {
            // Fetch CEO (manager_id is null)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .is('manager_id', null)
                .limit(1)
                .single();

            if (data) {
                setRootNode(data as OrgProfile);
            } else {
                // Determine if no root exists or multiple
                console.log("No root found or error", error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Cargando organigrama...</div>;

    if (!rootNode) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            No se encontró un nodo raíz (CEO) con jefe_id = null.
            <br />Asegúrate de configurar la jerarquía en la base de datos.
        </div>
    );

    return (
        <div style={{
            padding: '4rem',
            minHeight: '100%',
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start' // Start from top
        }}>
            <OrgNode profile={rootNode} isRoot />
        </div>
    );
};

export default OrganigramaPage;

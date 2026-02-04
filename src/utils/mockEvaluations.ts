export interface Evaluation {
    id: string;
    title: string;
    assignor: string; // "Manuel Rojano"
    evaluatedPerson: string; // "Max Higareda"
    status: 'Pendiente' | 'Finalizada';
    progress: number; // 0-100
    score: number; // 0-100
    scale: 'Malo' | 'Regular' | 'Bueno' | 'Sobresaliente';
}

export const MOCK_EVALUATIONS: Evaluation[] = Array.from({ length: 10 }, (_, i) => {
    const isFinalized = i % 2 === 0; // Alternating status
    const score = isFinalized ? Math.floor(Math.random() * 100) : 0;

    let scale: Evaluation['scale'] = 'Malo';
    if (score > 75) scale = 'Sobresaliente';
    else if (score > 50) scale = 'Bueno';
    else if (score > 25) scale = 'Regular';

    return {
        id: `eval-${i}`,
        title: `Evaluación de desempeño 360° ${2024 - i}`,
        assignor: 'Manuel Rojano',
        evaluatedPerson: 'Max Higareda',
        status: isFinalized ? 'Finalizada' : 'Pendiente',
        progress: isFinalized ? 100 : Math.floor(Math.random() * 80),
        score: score,
        scale: scale
    };
});

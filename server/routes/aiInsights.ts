import { Router } from 'express';
import type { Request, Response } from 'express';
import { rateLimit } from '../lib/rateLimit.js';
import { generateInsights } from '../lib/llmClient.js';
import { validateInsights } from '../lib/validateInsights.js';
import type { InsightsRequest } from '../types.js';

const router = Router();

const VALID_TRACKS = ['data_engineer', 'fullstack', 'ml_engineer'];
const VALID_RANGES = ['7d', '30d'];

router.post('/', rateLimit, async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as InsightsRequest;

        // Validate request body

        if (!body.range || !VALID_RANGES.includes(body.range)) {
            res.status(400).json({
                error: 'Invalid range',
                message: `range must be one of: ${VALID_RANGES.join(', ')}`,
            });
            return;
        }

        if (!body.metrics || typeof body.metrics.coding_time_7d !== 'number') {
            res.status(400).json({
                error: 'Invalid metrics',
                message: 'metrics object with coding_time_7d (number) is required',
            });
            return;
        }

        console.log(`[aiInsights] Generating insights for track=${body.track}, range=${body.range}`);

        const rawOutput = await generateInsights(body);
        const validated = validateInsights(rawOutput);

        res.json(validated);
    } catch (err: any) {
        console.error('[aiInsights] Error:', err.message);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Gagal menghasilkan insights. Silakan coba beberapa saat lagi.',
            ...(process.env.NODE_ENV === 'development' ? { details: err.message } : {}),
        });
    }
});

export default router;

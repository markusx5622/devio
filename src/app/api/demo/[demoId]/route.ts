import { readFileSync } from 'fs';
import { join } from 'path';
import type { NextRequest } from 'next/server';
import { analyzeProcess } from '@/lib/spc';
import type { AnalysisResult } from '@/lib/spc/types';

interface DemoConfig {
  id: string;
  filename: string;
  chartType: string;
  specLimits?: { usl: number; lsl: number };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { demoId: string } }
) {
  try {
    const demoId = params.demoId;

    // Read demo index to find the demo
    const indexPath = join(process.cwd(), 'public/demo/index.json');
    const indexContent = readFileSync(indexPath, 'utf-8');
    const demos: DemoConfig[] = JSON.parse(indexContent);

    const demoConfig = demos.find((d) => d.id === demoId);
    if (!demoConfig) {
      return Response.json({ error: 'Demo not found' }, { status: 404 });
    }

    // Read the CSV file
    const csvPath = join(process.cwd(), 'public/demo', demoConfig.filename);
    const csvContent = readFileSync(csvPath, 'utf-8');

    // Parse CSV (same logic as upload endpoint)
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      return Response.json({ error: 'Invalid CSV' }, { status: 400 });
    }

    // Simple CSV parser (assumes comma-separated)
    const data: number[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(',')
        .map((v) => parseFloat(v.trim()))
        .filter((v) => !isNaN(v));
      if (values.length > 0) {
        data.push(values);
      }
    }

    if (data.length === 0) {
      return Response.json({ error: 'No valid data' }, { status: 400 });
    }

    // Analyze with the engine
    const options = {
      usl: demoConfig.specLimits?.usl,
      lsl: demoConfig.specLimits?.lsl,
    };

    const result = analyzeProcess(data, options);

    if (!result.ok) {
      return Response.json({ error: result.error.message }, { status: 400 });
    }

    // Return the analysis result
    const analysisResult: AnalysisResult = result.value;
    return Response.json(analysisResult);
  } catch (error) {
    console.error('Error loading demo:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}

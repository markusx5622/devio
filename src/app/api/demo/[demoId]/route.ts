import { readFileSync } from 'fs';
import { join } from 'path';
import type { NextRequest } from 'next/server';
import { analyzeProcess, detectLayout, parseCsv } from '@/lib/spc';
import type { ChartInput, AnalyzeOptions } from '@/lib/spc';
import type { AnalysisResult } from '@/lib/spc/types';

interface DemoConfig {
  id: string;
  filename: string;
  chartType: string;
  specLimits?: { usl: number; lsl: number };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ demoId: string }> }
) {
  try {
    const { demoId } = await params;

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

    // Parse CSV using the library function
    const parseResult = parseCsv(csvContent);
    if (!parseResult.ok) {
      return Response.json({ error: parseResult.error.message }, { status: 400 });
    }

    // Detect layout (individual vs subgroups)
    const layoutResult = detectLayout(parseResult.value);
    if (!layoutResult.ok) {
      return Response.json({ error: layoutResult.error.message }, { status: 400 });
    }

    const layout = layoutResult.value;

    // Build ChartInput
    let chartInput: ChartInput;
    if (layout.kind === 'individual') {
      chartInput = { kind: 'individual', values: layout.values };
    } else {
      chartInput = {
        kind: 'subgroup',
        subgroupSize: layout.subgroupSize,
        subgroups: layout.subgroups,
      };
    }

    // Build options
    const options: AnalyzeOptions = {
      xbarSThreshold:
        demoConfig.chartType === 'xbar-r'
          ? 25
          : demoConfig.chartType === 'xbar-s'
            ? 1
            : 10,
      specLimits:
        demoConfig.specLimits?.usl !== undefined && demoConfig.specLimits?.lsl !== undefined
          ? { usl: demoConfig.specLimits.usl, lsl: demoConfig.specLimits.lsl }
          : undefined,
    };

    // Analyze
    const result = analyzeProcess(chartInput, options);

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

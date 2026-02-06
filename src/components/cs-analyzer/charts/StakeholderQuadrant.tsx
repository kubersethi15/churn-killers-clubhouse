import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { StakeholderDataPoint, CHART_COLORS, SENTIMENT_COLORS } from './types';

interface StakeholderQuadrantProps {
  data: StakeholderDataPoint[];
}

export const StakeholderQuadrant = ({ data }: StakeholderQuadrantProps) => {
  if (!data || data.length < 2) return null;

  // Transform data for Nivo scatterplot
  const chartData = [
    {
      id: 'stakeholders',
      data: data.map((d) => ({
        x: d.x,
        y: d.y,
        id: d.id,
        role: d.role,
        sentiment: d.sentiment,
      })),
    },
  ];

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          Stakeholder Power Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] relative">
          {/* Quadrant labels */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <span className="absolute top-2 left-2 text-xs text-muted-foreground/60 font-medium">
              High Power / Negative
            </span>
            <span className="absolute top-2 right-2 text-xs text-muted-foreground/60 font-medium">
              High Power / Positive
            </span>
            <span className="absolute bottom-8 left-2 text-xs text-muted-foreground/60 font-medium">
              Low Power / Negative
            </span>
            <span className="absolute bottom-8 right-2 text-xs text-muted-foreground/60 font-medium">
              Low Power / Positive
            </span>
          </div>
          
          <ResponsiveScatterPlot
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            xScale={{ type: 'linear', min: -5, max: 5 }}
            yScale={{ type: 'linear', min: 1, max: 5 }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Sentiment',
              legendPosition: 'middle',
              legendOffset: 40,
              tickValues: [-5, -2.5, 0, 2.5, 5],
              format: (v) => (v === -5 ? 'Negative' : v === 0 ? 'Neutral' : v === 5 ? 'Positive' : ''),
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Power',
              legendPosition: 'middle',
              legendOffset: -50,
              tickValues: [1, 2, 3, 4, 5],
              format: (v) => (v === 1 ? 'Low' : v === 5 ? 'High' : ''),
            }}
            colors={(node: { serieId: string | number }) => {
              // Find the data point based on serieId matching
              // Since we have a single series, use node index approach
              return CHART_COLORS.navy;
            }}
            nodeSize={14}
            useMesh={true}
            tooltip={({ node }) => {
              const nodeData = node.data as { id: string; x: number; y: number };
              const point = data.find((d) => d.id === nodeData.id);
              return (
                <div className="bg-background border rounded-lg shadow-lg px-3 py-2 text-sm">
                  <div className="font-semibold">{nodeData.id}</div>
                  <div className="text-muted-foreground text-xs">{point?.role}</div>
                  <div className="flex gap-2 mt-1 text-xs">
                    <span>Power: {nodeData.y}</span>
                    <span>•</span>
                    <span className="capitalize">{point?.sentiment}</span>
                  </div>
                </div>
              );
            }}
            theme={{
              background: 'transparent',
              text: { fill: CHART_COLORS.navy },
              axis: {
                ticks: { text: { fill: '#6B7280', fontSize: 11 } },
                legend: { text: { fill: CHART_COLORS.navy, fontSize: 12, fontWeight: 500 } },
              },
              grid: {
                line: { stroke: '#E5E7EB', strokeDasharray: '4 4' },
              },
            }}
            gridXValues={[0]}
            gridYValues={[3]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

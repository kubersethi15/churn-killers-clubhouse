import { ResponsiveRadar } from '@nivo/radar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { RiskDataPoint, CHART_COLORS } from './types';

interface RiskRadarProps {
  data: RiskDataPoint[];
}

export const RiskRadar = ({ data }: RiskRadarProps) => {
  if (!data || data.length < 3) return null;

  // Transform data for Nivo radar
  const chartData = data.map((d) => ({
    metric: d.metric.length > 15 ? d.metric.slice(0, 15) + '...' : d.metric,
    fullMetric: d.metric,
    value: d.value,
  }));

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          Risk Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveRadar
            data={chartData}
            keys={['value']}
            indexBy="metric"
            maxValue={100}
            margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
            curve="linearClosed"
            borderWidth={2}
            borderColor={CHART_COLORS.red}
            gridLevels={5}
            gridShape="circular"
            gridLabelOffset={16}
            enableDots={true}
            dotSize={8}
            dotColor={CHART_COLORS.cream}
            dotBorderWidth={2}
            dotBorderColor={CHART_COLORS.red}
            colors={[CHART_COLORS.red]}
            fillOpacity={0.25}
            blendMode="normal"
            animate={true}
            motionConfig="gentle"
            sliceTooltip={({ index, data }) => {
              const point = data.find((d) => d.id === 'value');
              return (
                <div className="bg-background border rounded-lg shadow-lg px-3 py-2 text-sm">
                  <div className="font-semibold">{chartData[index]?.fullMetric || index}</div>
                  <div className="text-muted-foreground">
                    Risk Level: <span className="font-medium text-foreground">{point?.value}%</span>
                  </div>
                </div>
              );
            }}
            theme={{
              background: 'transparent',
              text: { fill: CHART_COLORS.navy, fontSize: 11 },
              grid: {
                line: { stroke: '#E5E7EB' },
              },
              tooltip: {
                container: {
                  background: 'white',
                  borderRadius: 8,
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

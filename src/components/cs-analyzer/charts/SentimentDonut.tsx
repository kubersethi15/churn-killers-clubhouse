import { ResponsivePie } from '@nivo/pie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { SentimentDataPoint, SENTIMENT_COLORS, CHART_COLORS } from './types';

interface SentimentDonutProps {
  data: SentimentDataPoint[];
}

export const SentimentDonut = ({ data }: SentimentDonutProps) => {
  if (!data || data.length < 2) return null;

  // Transform data with colors
  const chartData = data.map((d) => ({
    id: d.id,
    label: d.id,
    value: d.value,
    color: d.color || SENTIMENT_COLORS[d.id] || CHART_COLORS.neutral,
  }));

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          Conversation Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsivePie
            data={chartData}
            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
            innerRadius={0.6}
            padAngle={2}
            cornerRadius={4}
            activeOuterRadiusOffset={8}
            colors={{ datum: 'data.color' }}
            borderWidth={0}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={CHART_COLORS.navy}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
            enableArcLabels={true}
            arcLabel={(d) => `${d.value}%`}
            tooltip={({ datum }) => (
              <div className="bg-background border rounded-lg shadow-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: datum.color }}
                  />
                  <span className="font-semibold">{datum.label}</span>
                </div>
                <div className="text-muted-foreground mt-1">{datum.value}% of conversation</div>
              </div>
            )}
            theme={{
              background: 'transparent',
              text: { fill: CHART_COLORS.navy, fontSize: 12 },
            }}
            motionConfig="gentle"
            legends={[]}
          />
        </div>
        {/* Legend */}
        <div className="flex justify-center gap-4 mt-2">
          {chartData.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

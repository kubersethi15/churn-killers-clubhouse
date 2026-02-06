import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import { ActionDataPoint, CHART_COLORS } from './types';

interface ActionTimelineProps {
  data: ActionDataPoint[];
}

export const ActionTimeline = ({ data }: ActionTimelineProps) => {
  if (!data || data.length < 2) return null;

  // Transform and sort data by urgency
  const priorityOrder = ['Immediate', 'Short-term', 'Medium-term', 'Long-term'];
  const chartData = [...data]
    .sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.priority);
      const bIndex = priorityOrder.indexOf(b.priority);
      return aIndex - bIndex;
    })
    .map((d) => ({
      priority: d.priority,
      count: d.count,
      color: d.priority === 'Immediate' ? CHART_COLORS.red :
             d.priority === 'Short-term' ? CHART_COLORS.amber :
             CHART_COLORS.positive,
    }));

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <ListChecks className="w-4 h-4" />
          Action Items by Priority
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveBar
            data={chartData}
            keys={['count']}
            indexBy="priority"
            margin={{ top: 10, right: 20, bottom: 40, left: 100 }}
            padding={0.4}
            layout="horizontal"
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={(bar) => bar.data.color as string}
            borderRadius={4}
            borderWidth={0}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 10,
              tickRotation: 0,
              legend: 'Actions',
              legendPosition: 'middle',
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 10,
              tickRotation: 0,
            }}
            enableLabel={true}
            label={(d) => `${d.value}`}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
            tooltip={({ data, value }) => (
              <div className="bg-background border rounded-lg shadow-lg px-3 py-2 text-sm">
                <div className="font-semibold">{data.priority}</div>
                <div className="text-muted-foreground">{value} action items</div>
              </div>
            )}
            theme={{
              background: 'transparent',
              text: { fill: CHART_COLORS.navy, fontSize: 12 },
              axis: {
                ticks: { text: { fill: '#6B7280', fontSize: 11 } },
                legend: { text: { fill: CHART_COLORS.navy, fontSize: 12, fontWeight: 500 } },
              },
              grid: {
                line: { stroke: '#E5E7EB', strokeDasharray: '4 4' },
              },
            }}
            motionConfig="gentle"
          />
        </div>
      </CardContent>
    </Card>
  );
};

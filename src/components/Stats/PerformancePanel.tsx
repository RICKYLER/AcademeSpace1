
import React, { useEffect, useMemo, useState } from 'react';
import { Brain, Heart, Target, BookOpen, TrendingUp, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

// Default fallback stats shown before realtime loads
const defaultStats = [
  {
    label: 'IQ Score',
    value: 127,
    percentage: 85,
    icon: Brain,
    color: 'bg-blue-500',
    trend: '+3 this month',
    chartColor: '#3b82f6'
  },
  {
    label: 'EQ Level',
    value: 89,
    percentage: 78,
    icon: Heart,
    color: 'bg-red-500',
    trend: '+5 this month',
    chartColor: '#ef4444'
  },
  {
    label: 'Mental Health',
    value: 92,
    percentage: 92,
    icon: Target,
    color: 'bg-green-500',
    trend: 'Excellent',
    chartColor: '#22c55e'
  },
  {
    label: 'Math Skills',
    value: 94,
    percentage: 94,
    icon: BookOpen,
    color: 'bg-purple-500',
    trend: '+8 this month',
    chartColor: '#a855f7'
  },
  {
    label: 'Comprehension',
    value: 88,
    percentage: 88,
    icon: TrendingUp,
    color: 'bg-orange-500',
    trend: '+2 this month',
    chartColor: '#f97316'
  }
];

// Default fallback trend data
const defaultTrendData = [
  { month: 'Jan', IQ: 120, EQ: 82, Mental: 88, Math: 85, Comp: 83 },
  { month: 'Feb', IQ: 122, EQ: 84, Mental: 90, Math: 88, Comp: 85 },
  { month: 'Mar', IQ: 124, EQ: 86, Mental: 91, Math: 90, Comp: 86 },
  { month: 'Apr', IQ: 125, EQ: 87, Mental: 91, Math: 92, Comp: 87 },
  { month: 'May', IQ: 127, EQ: 89, Mental: 92, Math: 94, Comp: 88 }
];

const chartConfig = {
  IQ: { label: 'IQ Score', color: '#3b82f6' },
  EQ: { label: 'EQ Level', color: '#ef4444' },
  Mental: { label: 'Mental Health', color: '#22c55e' },
  Math: { label: 'Math Skills', color: '#a855f7' },
  Comp: { label: 'Comprehension', color: '#f97316' }
};

const PerformancePanel: React.FC<{ studentId?: string }> = ({ studentId = 'demo-student' }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [liveStats, setLiveStats] = useState<any>(null);

  const clearGraph = () => {
    setShowChart(false);
  };

  // Realtime subscription
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    // Lazy import to avoid bundling issues if firebase config is absent in some envs
    (async () => {
      try {
        const { initializeRealtimeAuth, listenToStudentStats } = await import('../../lib/firebase-realtime');
        await initializeRealtimeAuth();
        unsubscribe = listenToStudentStats(studentId, (data) => {
          setLiveStats(data);
        });
      } catch (err) {
        console.error('Realtime stats init failed:', err);
      }
    })();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [studentId]);

  const stats = useMemo(() => {
    const metrics = liveStats?.metrics;
    if (!metrics) return defaultStats;
    return [
      {
        label: 'IQ Score',
        value: metrics.IQ?.value ?? defaultStats[0].value,
        percentage: metrics.IQ?.percentage ?? defaultStats[0].percentage,
        icon: Brain,
        color: 'bg-blue-500',
        trend: metrics.IQ?.trend ?? defaultStats[0].trend,
        chartColor: '#3b82f6'
      },
      {
        label: 'EQ Level',
        value: metrics.EQ?.value ?? defaultStats[1].value,
        percentage: metrics.EQ?.percentage ?? defaultStats[1].percentage,
        icon: Heart,
        color: 'bg-red-500',
        trend: metrics.EQ?.trend ?? defaultStats[1].trend,
        chartColor: '#ef4444'
      },
      {
        label: 'Mental Health',
        value: metrics.Mental?.value ?? defaultStats[2].value,
        percentage: metrics.Mental?.percentage ?? defaultStats[2].percentage,
        icon: Target,
        color: 'bg-green-500',
        trend: metrics.Mental?.trend ?? defaultStats[2].trend,
        chartColor: '#22c55e'
      },
      {
        label: 'Math Skills',
        value: metrics.Math?.value ?? defaultStats[3].value,
        percentage: metrics.Math?.percentage ?? defaultStats[3].percentage,
        icon: BookOpen,
        color: 'bg-purple-500',
        trend: metrics.Math?.trend ?? defaultStats[3].trend,
        chartColor: '#a855f7'
      },
      {
        label: 'Comprehension',
        value: metrics.Comp?.value ?? defaultStats[4].value,
        percentage: metrics.Comp?.percentage ?? defaultStats[4].percentage,
        icon: TrendingUp,
        color: 'bg-orange-500',
        trend: metrics.Comp?.trend ?? defaultStats[4].trend,
        chartColor: '#f97316'
      }
    ];
  }, [liveStats]);

  const trendData = liveStats?.trends ?? defaultTrendData;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Summary
            </h3>
            <button
              onClick={() => setShowChart(!showChart)}
              className={`p-2 rounded-lg transition-colors ${
                showChart 
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
              title={showChart ? 'Hide Chart' : 'Show Chart'}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            {showChart && (
              <button
                onClick={clearGraph}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                title="Clear Graph"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View Details
            </button>
            <CollapsibleTrigger asChild>
              <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent className="space-y-6">
          {/* Chart Section */}
          {showChart && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Performance Trends (Last 5 Months)
              </h4>
              <ChartContainer config={chartConfig} className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs fill-gray-600 dark:fill-gray-400"
                    />
                    <YAxis className="text-xs fill-gray-600 dark:fill-gray-400" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="IQ" 
                      stroke={chartConfig.IQ.color} 
                      strokeWidth={2}
                      dot={{ fill: chartConfig.IQ.color, strokeWidth: 2, r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="EQ" 
                      stroke={chartConfig.EQ.color} 
                      strokeWidth={2}
                      dot={{ fill: chartConfig.EQ.color, strokeWidth: 2, r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Mental" 
                      stroke={chartConfig.Mental.color} 
                      strokeWidth={2}
                      dot={{ fill: chartConfig.Mental.color, strokeWidth: 2, r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Math" 
                      stroke={chartConfig.Math.color} 
                      strokeWidth={2}
                      dot={{ fill: chartConfig.Math.color, strokeWidth: 2, r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Comp" 
                      stroke={chartConfig.Comp.color} 
                      strokeWidth={2}
                      dot={{ fill: chartConfig.Comp.color, strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}

          {/* Stats Section */}
          <div className="space-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {stat.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {stat.trend}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.percentage}%
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stat.color} transition-all duration-500 ease-out`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Overall Progress */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">Overall Progress</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You're performing exceptionally well! Keep up the great work to maintain your academic excellence.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PerformancePanel;

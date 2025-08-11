
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, Trophy, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface PerformanceData {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  tag: string;
  route: string | null;
  activeUsers: number;
  performanceScore: number;
  trend: 'up' | 'down' | 'stable';
}

const FeaturedProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<PerformanceData[]>([
    {
      id: 1,
      name: 'Venice AI',
      description: 'AI-powered math tutor that adapts to your learning style',
      icon: Brain,
      color: 'from-green-400 to-blue-500',
      tag: 'AI Tutor',
      route: '/algebrain',
      activeUsers: 0,
      performanceScore: 0,
      trend: 'stable'
    },
    {
      id: 2,
      name: 'Study Buddy',
      description: 'Find perfect study partners in your area',
      icon: Users,
      color: 'from-purple-400 to-pink-500',
      tag: 'Social Learning',
      route: null,
      activeUsers: 0,
      performanceScore: 0,
      trend: 'stable'
    },
    {
      id: 3,
      name: 'AcademeNFT',
      description: 'Earn unique NFTs for academic achievements',
      icon: Trophy,
      color: 'from-yellow-400 to-orange-500',
      tag: 'Rewards',
      route: null,
      activeUsers: 0,
      performanceScore: 0,
      trend: 'stable'
    }
  ]);

  const [isLive, setIsLive] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateData = useCallback(() => {
    setProducts(prev => prev.map(product => ({
      ...product,
      activeUsers: Math.floor(Math.random() * 1000) + 100,
      performanceScore: Math.floor(Math.random() * 40) + 60,
      trend: (Math.random() > 0.5 ? 'up' : 'down') as 'up' | 'down'
    })));
  }, []);

  // Visibility handling to pause/resume updates when the tab is hidden/visible
  useEffect(() => {
    const handleVisibility = () => {
      const visible = !document.hidden;
      setIsPageVisible(visible);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    handleVisibility();
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Manage the interval lifecycle robustly
  useEffect(() => {
    const shouldRun = isLive && isPageVisible;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!shouldRun) return;

    // Initial tick
    updateData();

    // Start interval
    intervalRef.current = setInterval(updateData, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLive, isPageVisible, updateData]);

  const handleProductClick = useCallback((product: PerformanceData) => {
    if (product.route) navigate(product.route);
  }, [navigate]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    return trend === 'up' ? 
      <TrendingUp className="w-3 h-3 text-green-500" aria-hidden /> : 
      <TrendingDown className="w-3 h-3 text-red-500" aria-hidden />;
  };

  // Memoized aggregates
  const totalActiveUsers = useMemo(() => (
    products.reduce((sum, p) => sum + p.activeUsers, 0)
  ), [products]);

  const avgPerformance = useMemo(() => (
    products.length ? Math.round(products.reduce((sum, p) => sum + p.performanceScore, 0) / products.length) : 0
  ), [products]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Featured Tools
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 motion-safe:animate-pulse' : 'bg-gray-400'}`} aria-hidden />
          <button
            type="button"
            aria-pressed={isLive}
            aria-label={isLive ? 'Turn live updates off' : 'Turn live updates on'}
            onClick={() => setIsLive(!isLive)}
            className={`px-2 py-1 rounded text-xs font-medium ${
              isLive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={isLive ? 'Live updates enabled' : 'Live updates disabled'}
          >
            {isLive ? 'Live' : 'Off'}
          </button>
        </div>
      </div>
      
      <div
        className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory"
        role="list"
        aria-label="Featured tools list"
      >
        {products.map((product) => {
          const IconComponent = product.icon;
          const isClickable = Boolean(product.route);
          const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
            if (!isClickable) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleProductClick(product);
            }
          };
          return (
            <div
              key={product.id}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : -1}
              aria-label={isClickable ? `Open ${product.name}` : `${product.name}`}
              className={`flex items-center space-x-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all min-w-[320px] md:min-w-[360px] snap-start ${
                isClickable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
              }`}
              onClick={() => isClickable && handleProductClick(product)}
              onKeyDown={onKeyDown}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${product.color} flex items-center justify-center`}>
                <IconComponent className="w-5 h-5 text-white" aria-hidden />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {product.name}
                  </h4>
                  <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    {product.tag}
                  </span>
                  {getTrendIcon(product.trend)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {product.description}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-white" aria-live="polite">
                  {product.activeUsers.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {product.performanceScore}% perf
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-500" aria-hidden />
            <span className="text-gray-600 dark:text-gray-400">Summary</span>
          </div>
          <div className="text-gray-900 dark:text-white font-medium" aria-live="polite" aria-label="Total active users and average performance">
            {totalActiveUsers.toLocaleString()} users · {avgPerformance}% avg perf
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, Trophy } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Algebrain',
    description: 'AI-powered math tutor that adapts to your learning style',
    icon: Brain,
    color: 'from-green-400 to-blue-500',
    tag: 'AI Tutor',
    route: '/algebrain'
  },
  {
    id: 2,
    name: 'Study Buddy',
    description: 'Find perfect study partners in your area',
    icon: Users,
    color: 'from-purple-400 to-pink-500',
    tag: 'Social Learning',
    route: null
  },
  {
    id: 3,
    name: 'AcademeNFT',
    description: 'Earn unique NFTs for academic achievements',
    icon: Trophy,
    color: 'from-yellow-400 to-orange-500',
    tag: 'Rewards',
    route: null
  }
];

const FeaturedProducts: React.FC = () => {
  const navigate = useNavigate();

  const handleProductClick = (product: typeof products[0]) => {
    if (product.route) {
      navigate(product.route);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Featured Learning Tools
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className={`group border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg dark:hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 ${
              product.route ? 'cursor-pointer' : 'cursor-default'
            }`}
            onClick={() => handleProductClick(product)}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${product.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <product.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {product.name}
                  </h4>
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    {product.tag}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {product.description}
                </p>
                <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  {product.route ? 'Launch →' : 'Explore →'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;

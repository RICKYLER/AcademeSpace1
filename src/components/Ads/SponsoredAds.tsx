
import React from 'react';
import { ExternalLink, Star } from 'lucide-react';

const ads = [
  {
    id: 1,
    title: 'Premium Study Materials',
    description: 'Get access to exclusive study guides, practice tests, and video tutorials.',
    image: '📚',
    rating: 4.8,
    price: '$19.99/month',
    cta: 'Start Free Trial'
  },
  {
    id: 2,
    title: 'Online Tutoring',
    description: '1-on-1 sessions with expert tutors in Math, Science, and more.',
    image: '👨‍🏫',
    rating: 4.9,
    price: '$25/hour',
    cta: 'Book Session'
  },
  {
    id: 3,
    title: 'Study Abroad Program',
    description: 'Explore universities worldwide. Scholarships available!',
    image: '🌍',
    rating: 4.7,
    price: 'Free Consultation',
    cta: 'Learn More'
  }
];

const SponsoredAds: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sponsored
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
          AD
        </span>
      </div>

      <div className="space-y-4">
        {ads.map((ad) => (
          <div key={ad.id} className="group cursor-pointer border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg dark:hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300">
            <div className="flex items-start space-x-3">
              <div className="text-2xl flex-shrink-0">
                {ad.image}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {ad.title}
                </h4>
                
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {ad.rating}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {ad.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {ad.price}
                  </span>
                  <button className="flex items-center space-x-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    <span>{ad.cta}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SponsoredAds;

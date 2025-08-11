import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Sparkles, Palette, Lightbulb, Zap } from 'lucide-react';

interface PhotoGenerationGuideProps {
  onClose: () => void;
}

const PhotoGenerationGuide: React.FC<PhotoGenerationGuideProps> = ({ onClose }) => {
  const promptExamples = [
    {
      category: 'Landscapes',
      icon: <Camera className="w-5 h-5" />,
      examples: [
        'A beautiful sunset over mountains with golden light',
        'A serene lake reflecting autumn colors',
        'A tropical beach with palm trees and crystal clear water',
        'A misty forest with sunlight streaming through trees'
      ]
    },
    {
      category: 'Architecture',
      icon: <Palette className="w-5 h-5" />,
      examples: [
        'A futuristic city with flying cars and neon lights',
        'A cozy coffee shop interior with warm lighting',
        'A modern minimalist office space with natural light',
        'A grand castle on a hilltop at sunset'
      ]
    },
    {
      category: 'Animals',
      icon: <Sparkles className="w-5 h-5" />,
      examples: [
        'A cute fluffy cat sitting on a windowsill',
        'A majestic lion in the savanna at golden hour',
        'A playful golden retriever in a garden',
        'A colorful tropical bird perched on a branch'
      ]
    },
    {
      category: 'Artistic',
      icon: <Lightbulb className="w-5 h-5" />,
      examples: [
        'A magical forest with glowing mushrooms',
        'A steampunk airship in the clouds',
        'A cyberpunk street scene at night',
        'A fantasy castle floating in the clouds'
      ]
    },
    {
      category: 'Enhanced & Upscaled',
      icon: <Zap className="w-5 h-5" />,
      examples: [
        'A beautiful sunset landscape in 4K quality',
        'A detailed portrait enhanced with sharp details',
        'A futuristic city upscaled to high resolution',
        'A professional product photo with enhanced clarity'
      ]
    },
    {
      category: 'Image Editing',
      icon: <Palette className="w-5 h-5" />,
      examples: [
        'Edit previous image to add more colors',
        'Colorize this black and white photo',
        'Transform the background to sunset',
        'Modify the style to be more realistic'
      ]
    }
  ];

  const tips = [
    'Be specific about what you want to see',
    'Include style preferences (realistic, cartoon, 3D)',
    'Mention colors, lighting, and mood',
    'Add details about the environment or setting',
    'Try different variations of your prompt'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-500" />
              Photo Generation Guide
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tips Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              💡 Tips for Better Results
            </h3>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-500 mt-1">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Prompt Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              🎨 Prompt Examples by Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promptExamples.map((category) => (
                <Card key={category.category} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {category.icon}
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {category.examples.map((example, index) => (
                        <li key={index} className="cursor-pointer hover:text-blue-600 hover:bg-blue-50 p-1 rounded">
                          "{example}"
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technical Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              ⚙️ Technical Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <strong>Resolution:</strong> 1024x1024 (2048x2048 when upscaled)
              </div>
              <div>
                <strong>Format:</strong> WebP
              </div>
              <div>
                <strong>Quality:</strong> High
              </div>
              <div>
                <strong>Generation Time:</strong> 10-15 seconds (15-20 with upscaling)
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">✨ Upscaling & Enhancement</h4>
              <p className="text-sm text-blue-700 mb-2">
                Add these keywords to automatically upscale and enhance your images:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">upscale</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">enhance</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">4K</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">HD</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">high quality</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🎨 Image Editing</h4>
              <p className="text-sm text-green-700 mb-2">
                Add these keywords to edit the previous generated image:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">edit</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">modify</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">change</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">colorize</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">transform</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">🎭 Image Styles</h4>
              <p className="text-sm text-purple-700 mb-2">
                Available artistic styles for image generation:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">3D Model</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Analog Film</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Anime</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Cinematic</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Comic Book</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Digital Art</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Fantasy Art</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Photographic</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Watercolor</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">+ 66 more...</span>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                Select your preferred style from the sidebar when in Photo mode
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoGenerationGuide; 
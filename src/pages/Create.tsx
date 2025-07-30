
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import ResponsiveNavbar from '../components/Navigation/ResponsiveNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, FileText, Users, Image } from 'lucide-react';

const Create: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <ResponsiveNavbar />
        
        <div className="p-4 pb-20 md:pb-6 max-w-2xl mx-auto">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>Create New Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex flex-col items-center space-y-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create Post</span>
                </button>
                
                <button className="flex flex-col items-center space-y-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <Users className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create Group</span>
                </button>
                
                <button className="flex flex-col items-center space-y-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <Image className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share Media</span>
                </button>
                
                <button className="flex flex-col items-center space-y-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <Plus className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">More Options</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Create;

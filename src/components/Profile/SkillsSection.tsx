
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Code, Wrench } from 'lucide-react';

const SkillsSection: React.FC = () => {
  const technicalSkills = [
    { name: 'Python', level: 92 },
    { name: 'JavaScript', level: 88 },
    { name: 'React', level: 85 },
    { name: 'Java', level: 90 },
    { name: 'Machine Learning', level: 78 },
    { name: 'SQL', level: 83 }
  ];

  const softSkills = [
    'Leadership',
    'Problem Solving',
    'Communication',
    'Project Management',
    'Critical Thinking',
    'Teamwork'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Code className="w-5 h-5" />
          <span>Skills</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Technical Skills */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <Wrench className="w-4 h-4" />
            <span>Technical Skills</span>
          </h3>
          <div className="space-y-3">
            {technicalSkills.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {skill.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {skill.level}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Soft Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsSection;

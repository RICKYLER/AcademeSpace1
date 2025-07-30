
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { GraduationCap, BookOpen, Calendar, Award } from 'lucide-react';

const AcademicInfo: React.FC = () => {
  const academicData = [
    {
      institution: "Stanford University",
      degree: "Bachelor of Science in Computer Science",
      period: "2022 - 2026",
      gpa: "3.9/4.0",
      status: "Current"
    },
    {
      institution: "Westfield High School",
      degree: "High School Diploma - Summa Cum Laude",
      period: "2018 - 2022",
      gpa: "4.0/4.0",
      status: "Graduated"
    }
  ];

  const courses = [
    "Data Structures & Algorithms",
    "Machine Learning",
    "Database Systems",
    "Software Engineering",
    "Computer Networks",
    "Artificial Intelligence"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GraduationCap className="w-5 h-5" />
          <span>Academic Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Education */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Education</span>
          </h3>
          <div className="space-y-4">
            {academicData.map((edu, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {edu.institution}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    edu.status === 'Current' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {edu.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{edu.degree}</p>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{edu.period}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>GPA: {edu.gpa}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Courses */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Current Courses
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {courses.map((course, index) => (
              <div
                key={index}
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm"
              >
                {course}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicInfo;

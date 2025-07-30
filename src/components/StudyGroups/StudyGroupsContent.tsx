
import React, { useState } from 'react';
import { Search, Plus, Users, Clock, BookOpen, Star } from 'lucide-react';
import StudyGroupCard from './StudyGroupCard';
import CreateGroupModal from './CreateGroupModal';

const studyGroups = [
  {
    id: 1,
    name: 'Advanced Calculus Study Group',
    subject: 'Mathematics',
    members: 12,
    maxMembers: 15,
    description: 'Weekly sessions covering advanced calculus topics, derivatives, and integrals.',
    schedule: 'Tuesdays & Thursdays, 7:00 PM',
    difficulty: 'Advanced',
    isJoined: true
  },
  {
    id: 2,
    name: 'Computer Science Algorithms',
    subject: 'Computer Science',
    members: 8,
    maxMembers: 10,
    description: 'Discussing data structures, algorithms, and preparing for technical interviews.',
    schedule: 'Wednesdays, 6:00 PM',
    difficulty: 'Intermediate',
    isJoined: false
  },
  {
    id: 3,
    name: 'Organic Chemistry Lab Prep',
    subject: 'Chemistry',
    members: 6,
    maxMembers: 8,
    description: 'Lab preparation sessions and homework help for organic chemistry.',
    schedule: 'Mondays, 4:00 PM',
    difficulty: 'Beginner',
    isJoined: true
  },
  {
    id: 4,
    name: 'Physics Problem Solving',
    subject: 'Physics',
    members: 15,
    maxMembers: 20,
    description: 'Collaborative problem-solving sessions for mechanics and thermodynamics.',
    schedule: 'Fridays, 5:00 PM',
    difficulty: 'Intermediate',
    isJoined: false
  }
];

const StudyGroupsContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const subjects = ['All', 'Mathematics', 'Computer Science', 'Chemistry', 'Physics'];

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSubject === 'All' || group.subject === filterSubject;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Study Groups
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Join study groups to collaborate with fellow students and enhance your learning experience.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search study groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <StudyGroupCard key={group.id} group={group} />
        ))}
      </div>

      {/* No Results */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No study groups found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or create a new study group.
          </p>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default StudyGroupsContent;

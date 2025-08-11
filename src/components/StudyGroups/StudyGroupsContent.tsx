
import React, { useMemo, useState } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { Search, Plus, BookOpen, SlidersHorizontal, User, Trash2, AlertTriangle } from 'lucide-react';
import StudyGroupCard from './StudyGroupCard';
import CreateGroupModal from './CreateGroupModal';

const initialGroups = [
  {
    id: 1,
    name: 'Advanced Calculus Study Group',
    subject: 'Mathematics',
    members: 12,
    maxMembers: 15,
    description: 'Weekly sessions covering advanced calculus topics, derivatives, and integrals.',
    schedule: 'Tuesdays & Thursdays, 7:00 PM',
    difficulty: 'Advanced',
    isJoined: true,
    hostName: 'Dr. Emily Carter'
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
    isJoined: false,
    hostName: 'Chris Johnson'
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
    isJoined: true,
    hostName: 'Dr. Anita Rao'
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
    isJoined: false,
    hostName: 'Michael Zhang'
  }
];

const StudyGroupsContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'members' | 'name' | 'difficulty'>('relevance');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState(initialGroups);
  const [activeGroup, setActiveGroup] = useState<typeof initialGroups[number] | null>(null);
  const { profileName } = useProfile();

  const subjects = ['All', 'Mathematics', 'Computer Science', 'Chemistry', 'Physics'];

  const filteredGroups = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    const raw = groups.filter(group => {
      const matchesSearch =
        lowerSearch.length === 0 ||
        group.name.toLowerCase().includes(lowerSearch) ||
        group.subject.toLowerCase().includes(lowerSearch);
      const matchesFilter = filterSubject === 'All' || group.subject === filterSubject;
      return matchesSearch && matchesFilter;
    });

    const sortDifficultyRank = (difficulty: string) => {
      switch (difficulty) {
        case 'Beginner':
          return 1;
        case 'Intermediate':
          return 2;
        case 'Advanced':
          return 3;
        default:
          return 99;
      }
    };

    if (sortBy === 'relevance') return raw;
    if (sortBy === 'name') return [...raw].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'difficulty') return [...raw].sort((a, b) => sortDifficultyRank(a.difficulty) - sortDifficultyRank(b.difficulty));
    if (sortBy === 'members') return [...raw].sort((a, b) => b.members / b.maxMembers - a.members / a.maxMembers);
    return raw;
  }, [filterSubject, searchTerm, sortBy, groups]);

  const handleView = (group: typeof initialGroups[number]) => {
    setActiveGroup(group);
  };

  const handleJoinToggle = (group: typeof initialGroups[number]) => {
    setGroups(prev => prev.map(g => g.id === group.id ? { ...g, isJoined: !g.isJoined } : g));
    // If joining, open the group modal right away
    setActiveGroup({ ...group, isJoined: !group.isJoined });
  };

  const handleCreate = (data: {
    name: string;
    subject: string;
    description: string;
    maxMembers: number;
    schedule: string;
    difficulty: string;
  }) => {
    const newGroup = {
      id: Math.max(0, ...groups.map(g => g.id)) + 1,
      name: data.name,
      subject: data.subject,
      members: 1,
      maxMembers: data.maxMembers,
      description: data.description,
      schedule: data.schedule,
      difficulty: data.difficulty,
      isJoined: true,
      hostName: profileName,
    } as typeof initialGroups[number];

    setGroups(prev => [newGroup, ...prev]);
    setShowCreateModal(false);

    // Success toast
    setCreationToast({ open: true, name: newGroup.name });

    // Open the group modal for the newly created group
    setActiveGroup(newGroup);
  };

  const [creationToast, setCreationToast] = useState<{ open: boolean; name: string } | null>(null);
  const [deletionToast, setDeletionToast] = useState<{ open: boolean; name: string } | null>(null);
  const [deleteConfirmGroup, setDeleteConfirmGroup] = useState<typeof initialGroups[number] | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [lastDeletedGroup, setLastDeletedGroup] = useState<typeof initialGroups[number] | null>(null);

  const handleDeleteGroup = (group: typeof initialGroups[number]) => {
    const confirmed = window.confirm(`Delete the group "${group.name}"? This action cannot be undone.`);
    if (!confirmed) return;
    setGroups(prev => prev.filter(g => g.id !== group.id));
    setActiveGroup(null);
    setDeletionToast({ open: true, name: group.name });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Study Groups
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="hidden md:inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
          <span>{filteredGroups.length} results</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Filter by subject or sort to discover groups faster</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search study groups"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Sort results"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="members">Sort: Most Filled</option>
                  <option value="name">Sort: Name A–Z</option>
                  <option value="difficulty">Sort: Difficulty</option>
                </select>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="md:hidden inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* Subject filter: pills on desktop, select on mobile */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile select */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="md:hidden w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by subject"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            {/* Desktop pills */}
            <div className="hidden md:flex flex-wrap gap-2">
              {subjects.map(subject => {
                const isActive = filterSubject === subject;
                return (
                  <button
                    key={subject}
                    onClick={() => setFilterSubject(subject)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                        : 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    aria-pressed={isActive}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredGroups.map((group) => (
          <StudyGroupCard key={group.id} group={group} onView={handleView} onJoinToggle={handleJoinToggle} />
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
          hostName={profileName}
          onCreate={handleCreate}
        />
      )}

      {/* Group Details Modal */}
      {activeGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{activeGroup.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activeGroup.subject} • {activeGroup.difficulty}</p>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setActiveGroup(null)}
                aria-label="Close group details"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">{activeGroup.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Members</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{activeGroup.members} / {activeGroup.maxMembers}</div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Schedule</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{activeGroup.schedule}</div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Fill</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{Math.round((activeGroup.members/activeGroup.maxMembers)*100)}%</div>
                </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Host</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{activeGroup.hostName}</div>
                </div>
              </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-3 md:gap-4 md:items-center md:justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {activeGroup.isJoined
                  ? `${profileName} is a member of this group.`
                  : `${profileName} has not joined this group yet.`}
              </div>
              <div className="flex gap-3">
                {activeGroup.hostName === profileName && (
                  <button
                    className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    onClick={() => setDeleteConfirmGroup(activeGroup)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Group
                  </button>
                )}
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setActiveGroup(null)}
                >
                  Close
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${activeGroup.isJoined ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  onClick={() => handleJoinToggle(activeGroup)}
                >
                  {activeGroup.isJoined ? 'Leave Group' : 'Join Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creation toast */}
      {creationToast?.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-sm">Group "{creationToast.name}" created successfully</span>
            <button
              onClick={() => setCreationToast(null)}
              className="text-white/70 hover:text-white"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {deletionToast?.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-sm">Group "{deletionToast.name}" deleted</span>
            {lastDeletedGroup && (
              <button
                onClick={() => {
                  setGroups(prev => [lastDeletedGroup, ...prev]);
                  setLastDeletedGroup(null);
                  setDeletionToast(null);
                }}
                className="text-white underline text-sm"
              >
                Undo
              </button>
            )}
            <button
              onClick={() => setDeletionToast(null)}
              className="text-white/70 hover:text-white"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {deleteConfirmGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-start gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Delete group?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This action will permanently delete "{deleteConfirmGroup.name}". To confirm, type the group name below.
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Group name</label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={deleteConfirmGroup.name}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => { setDeleteConfirmGroup(null); setDeleteConfirmInput(''); }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                  disabled={deleteConfirmInput !== deleteConfirmGroup.name}
                  onClick={() => {
                    const toDelete = deleteConfirmGroup;
                    setGroups(prev => prev.filter(g => g.id !== toDelete.id));
                    setActiveGroup(null);
                    setLastDeletedGroup(toDelete);
                    setDeletionToast({ open: true, name: toDelete.name });
                    setDeleteConfirmGroup(null);
                    setDeleteConfirmInput('');
                  }}
                >
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupsContent;

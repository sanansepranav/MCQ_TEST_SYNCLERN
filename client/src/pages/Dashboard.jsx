import { useAuth } from '../context/AuthContext';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineChartBarSquare,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineCheckBadge,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';

const Dashboard = () => {
  const { user } = useAuth();

  const statsCards = {
    admin: [
      { label: 'Total Students', value: '—', icon: HiOutlineUsers, color: 'from-amber-500 to-amber-700', glow: 'shadow-amber-500/20' },
      { label: 'Total Tests', value: '—', icon: HiOutlineClipboardDocumentList, color: 'from-emerald-500 to-emerald-700', glow: 'shadow-emerald-500/20' },
      { label: 'Submissions', value: '—', icon: HiOutlineChartBarSquare, color: 'from-primary-500 to-primary-700', glow: 'shadow-primary-500/20' },
      { label: 'Active Now', value: '—', icon: HiOutlineClock, color: 'from-rose-500 to-rose-700', glow: 'shadow-rose-500/20' },
    ],
    student: [
      { label: 'Available Tests', value: '—', icon: HiOutlineClipboardDocumentList, color: 'from-primary-500 to-primary-700', glow: 'shadow-primary-500/20' },
      { label: 'Completed', value: '—', icon: HiOutlineCheckBadge, color: 'from-emerald-500 to-emerald-700', glow: 'shadow-emerald-500/20' },
      { label: 'Avg. Score', value: '—', icon: HiOutlineArrowTrendingUp, color: 'from-amber-500 to-amber-700', glow: 'shadow-amber-500/20' },
      { label: 'Upcoming', value: '—', icon: HiOutlineClock, color: 'from-rose-500 to-rose-700', glow: 'shadow-rose-500/20' },
    ],
  };

  const cards = statsCards[user?.role] || statsCards.student;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-100">
          {greeting()}, <span className="text-primary-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-surface-500 mt-1">
          Here&apos;s your overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-5 hover:border-surface-700/50 transition-all duration-300 group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{card.label}</p>
                  <p className="text-3xl font-bold text-surface-100 mt-2">{card.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-surface-200 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {user?.role !== 'student' && (
              <button className="w-full text-left px-4 py-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 border border-surface-700/30 text-surface-300 hover:text-surface-100 transition-all text-sm cursor-pointer">
                ➕ Create New Test
              </button>
            )}
            <button className="w-full text-left px-4 py-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 border border-surface-700/30 text-surface-300 hover:text-surface-100 transition-all text-sm cursor-pointer">
              📋 View All Tests
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 border border-surface-700/30 text-surface-300 hover:text-surface-100 transition-all text-sm cursor-pointer">
              📊 View Results
            </button>
          </div>
        </div>

        <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-surface-200 mb-4">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-8 text-surface-600">
            <HiOutlineClock className="w-10 h-10 mb-2" />
            <p className="text-sm">No recent activity yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

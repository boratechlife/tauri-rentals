import { useEffect, useState } from 'react';
import Database from '@tauri-apps/plugin-sql';
import { Users, AlertCircle, Calendar, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type StatsCard = {
  title: string;
  value: number | string;
  change?: string;
  icon: React.ElementType;
  color: string;
};

export type Payment = {
  payment_id: string;
  tenant_id: string;
  unit_id: string;
  property_id: string;
  amount_paid: number;
  payment_date: string;
  due_date: string;
  payment_status: string;
  payment_method: string;
  payment_category: string;
  receipt_number?: string;
  transaction_reference?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
};

type Task = {
  task: string;
  due: string;
  priority: string;
};

type Activity = {
  activityType: string;
  message: string;
  time: string;
};

type StatsData = {
  totalProperties: number;
  totalTenants: number;
  totalPayments: number;
  averageRent: number;
  totalExpenses: number;
  totalManagers: number;
};

const PropertyManagerDashboard = () => {
  const navigate = useNavigate();
  const [statsCards, setStatsCards] = useState<StatsCard[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchStats(): Promise<StatsData> {
    const db = await Database.load('sqlite:productionv2.db');
    try {
      const results = await db.select<StatsData[]>(`
        SELECT 
          (SELECT COUNT(*) FROM properties) as totalProperties,
          (SELECT COUNT(*) FROM tenants WHERE status = 'Active') as totalTenants,
          (SELECT COUNT(*) FROM payments WHERE payment_status = 'Paid') as totalPayments,
          (SELECT AVG(monthly_rent) FROM units) as averageRent,
          (SELECT SUM(amount) FROM expenses) as totalExpenses,
          (SELECT COUNT(*) FROM managers) as totalManagers
      `);
      return results[0];
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      console.log('Error details:', error);
      throw err;
    } finally {
      await db.close();
    }
  }

  useEffect(() => {
    async function loadTasks() {
      try {
        const db = await Database.load('sqlite:productionv2.db');
        const data = await db.select<Task[]>(
          `SELECT task_name as task, due_date as due, priority FROM tasks ORDER BY due_date ASC LIMIT 5;`
        );
        setUpcomingTasks(data);
      } catch (err) {
        console.error('Failed to load upcoming tasks:', err);
        setError('Failed to load upcoming tasks data.');
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const db = await Database.load('sqlite:productionv2.db');
      try {
        const [activitiesData, statsData] = await Promise.all([
          db.select<Activity[]>(
            `SELECT activity_type as activityType, message, time FROM recent_activities ORDER BY time DESC LIMIT 10;`
          ),
          fetchStats(),
        ]);

        const statsCardsData: StatsCard[] = [
          {
            title: 'Total Properties',
            value: statsData.totalProperties || 0,
            change: '+2.5%',
            icon: Users,
            color: '#3B82F6',
          },
          {
            title: 'Active Tenants',
            value: statsData.totalTenants || 0,
            change: '+1.8%',
            icon: Calendar,
            color: '#10B981',
          },
          {
            title: 'Total Payments',
            value: statsData.totalPayments || 0,
            change: '+3.0%',
            icon: TrendingUp,
            color: '#F59E0B',
          },
          {
            title: 'Average Rent',
            value: `Kes${statsData.averageRent?.toFixed(2) || '0.00'}`,
            change: '+1.2%',
            icon: TrendingUp,
            color: '#8B5CF6',
          },
          {
            title: 'Total Expenses',
            value: `Kes${statsData.totalExpenses?.toFixed(2) || '0.00'}`,
            change: '-0.5%',
            icon: AlertCircle,
            color: '#EF4444',
          },
          {
            title: 'Total Managers',
            value: statsData.totalManagers || 0,
            change: '+1.0%',
            icon: Users,
            color: '#6B7280',
          },
        ];

        setRecentActivities(activitiesData);
        setStatsCards(statsCardsData);
        //   setGreeting(await invoke<string>('greet', { name: 'Next.js' }));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load essential dashboard data.');
      } finally {
        setLoading(false);
        await db.close();
      }
    }

    fetchData();
  }, []);

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      padding: '16px 24px',
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0,
    },
    searchContainer: {
      position: 'relative',
    },
    searchInput: {
      paddingLeft: '40px',
      paddingRight: '16px',
      paddingTop: '8px',
      paddingBottom: '8px',
      width: '320px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9CA3AF',
      width: '16px',
      height: '16px',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    iconButton: {
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#9CA3AF',
      position: 'relative',
      transition: 'color 0.2s',
    },
    notificationBadge: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      backgroundColor: '#EF4444',
      color: 'white',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: '32px',
      height: '32px',
      backgroundColor: '#3B82F6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
    },
    nav: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding: '0 24px',
    },
    navTabs: {
      display: 'flex',
      gap: '32px',
    },
    navTab: {
      padding: '16px 4px',
      border: 'none',
      backgroundColor: 'transparent',
      fontSize: '14px',
      fontWeight: '500',
      textTransform: 'capitalize',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s',
    },
    navTabActive: {
      borderBottomColor: '#3B82F6',
      color: '#3B82F6',
    },
    navTabInactive: {
      color: '#6B7280',
    },
    main: {
      padding: '24px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
    },
    statsCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    statsCardContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statsText: {
      display: 'flex',
      flexDirection: 'column',
    },
    statsTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#6B7280',
      margin: '0',
    },
    statsValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      margin: '4px 0',
    },
    statsChange: {
      fontSize: '14px',
      color: '#6B7280',
      margin: '0',
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px',
      marginBottom: '32px',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    cardHeader: {
      padding: '24px',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: '0',
    },
    cardContent: {
      padding: '24px',
    },
    activityList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    activityItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    },
    activityDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginTop: '8px',
      flexShrink: 0,
    },
    activityContent: {
      flex: 1,
    },
    activityMessage: {
      fontSize: '14px',
      color: '#111827',
      margin: '0 0 4px 0',
    },
    activityTime: {
      fontSize: '12px',
      color: '#6B7280',
      margin: '0',
    },
    tasksList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    taskItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    taskCheckbox: {
      width: '16px',
      height: '16px',
      accentColor: '#3B82F6',
    },
    taskContent: {
      flex: 1,
    },
    taskText: {
      fontSize: '14px',
      color: '#111827',
      margin: '0 0 4px 0 ',
    },
    taskMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '0',
    },
    taskDue: {
      fontSize: '12px',
      color: '#6B7280',
    },
    priorityBadge: {
      padding: '2px 8px',
      fontSize: '12px',
      borderRadius: '12px',
      fontWeight: '500',
    },
    priorityHigh: {
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
    },
    priorityMedium: {
      backgroundColor: '#FEF3C7',
      color: '#D97706',
    },
    priorityLow: {
      backgroundColor: '#D1FAE5',
      color: '#065F46',
    },
    quickActions: {
      marginTop: '32px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '16px',
    },
    quickActionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
    },
    quickActionButton: {
      backgroundColor: '#FFFFFF',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
    },
    quickActionText: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#111827',
    },
    linkButton: {
      color: '#3B82F6',
      fontSize: '14px',
      fontWeight: '500',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'color 0.2s',
    },
  };

  const getActivityDotColor = (type: string): string => {
    switch (type) {
      case 'payment':
        return '#10B981';
      case 'maintenance':
        return '#F59E0B';
      case 'lease':
        return '#3B82F6';
      default:
        return '#8B5CF6';
    }
  };

  const getPriorityStyle = (priority: string): React.CSSProperties => {
    switch (priority) {
      case 'high':
        return { ...styles.priorityBadge, ...styles.priorityHigh };
      case 'medium':
        return { ...styles.priorityBadge, ...styles.priorityMedium };
      default:
        return { ...styles.priorityBadge, ...styles.priorityLow };
    }
  };

  const handleQuickActionClick = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <div style={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <div key={index} style={styles.statsCard}>
              <div style={styles.statsCardContent}>
                <div style={styles.statsText}>
                  <p style={styles.statsTitle}>{stat.title}</p>
                  <p style={styles.statsValue}>{stat.value}</p>
                  {stat.change && (
                    <p style={styles.statsChange}>{stat.change}</p>
                  )}
                </div>
                <stat.icon size={32} style={{ color: stat.color }} />
              </div>
            </div>
          ))}
        </div>
        <div style={styles.contentGrid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Recent Activity</h2>
              <a
                href="#"
                style={styles.linkButton}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#3B82F6')}
              >
                View all
              </a>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.activityList}>
                {recentActivities.map((activity, index) => (
                  <div key={index} style={styles.activityItem}>
                    <div
                      style={{
                        ...styles.activityDot,
                        backgroundColor: getActivityDotColor(
                          activity.activityType
                        ),
                      }}
                    />
                    <div style={styles.activityContent}>
                      <p style={styles.activityMessage}>{activity.message}</p>
                      <p style={styles.activityTime}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Upcoming Tasks</h2>
              <button
                style={styles.iconButton}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6B7280')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >
                <Plus size={16} />
              </button>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.tasksList}>
                {upcomingTasks.map((task, index) => (
                  <div key={index} style={styles.taskItem}>
                    <input type="checkbox" style={styles.taskCheckbox} />
                    <div style={styles.taskContent}>
                      <p style={styles.taskText}>{task.task}</p>
                      <div style={styles.taskMeta}>
                        <Calendar size={12} style={{ color: '#9CA3AF' }} />
                        <span style={styles.taskDue}>{task.due}</span>
                        <span style={getPriorityStyle(task.priority)}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.quickActionsGrid}>
            <button
              style={styles.quickActionButton}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  '0 1px 3px 0 rgba(0, 0, 0, 0.1)')
              }
              onClick={() => handleQuickActionClick('/properties')}
            >
              <div style={styles.quickActionContent}>
                <Plus size={24} style={{ color: '#3B82F6' }} />
                <span style={styles.quickActionText}>Add Property</span>
              </div>
            </button>
            <button
              style={styles.quickActionButton}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  '0 1px 3px 0 rgba(0, 0, 0, 0.1)')
              }
              onClick={() => handleQuickActionClick('/tenants')}
            >
              <div style={styles.quickActionContent}>
                <Users size={24} style={{ color: '#10B981' }} />
                <span style={styles.quickActionText}>Add Tenant</span>
              </div>
            </button>
            <button
              style={styles.quickActionButton}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  '0 1px 3px 0 rgba(0, 0, 0, 0.1)')
              }
              onClick={() => handleQuickActionClick('/payments')}
            >
              <div style={styles.quickActionContent}>
                <AlertCircle size={24} style={{ color: '#F59E0B' }} />
                <span style={styles.quickActionText}>Payments</span>
              </div>
            </button>
            <button
              style={styles.quickActionButton}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  '0 1px 3px 0 rgba(0, 0, 0, 0.1)')
              }
              onClick={() => handleQuickActionClick('/reports')}
            >
              <div style={styles.quickActionContent}>
                <TrendingUp size={24} style={{ color: '#8B5CF6' }} />
                <span style={styles.quickActionText}>View Reports</span>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyManagerDashboard;

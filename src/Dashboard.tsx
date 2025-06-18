import React, { useState } from "react";
import {
  Home,
  Users,
  DollarSign,
  AlertCircle,
  Calendar,
  TrendingUp,
  Settings,
  Bell,
  Search,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PropertyManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate(); // Initialize useNavigate hook

  const statsCards = [
    {
      title: "Total Properties",
      value: "24",
      change: "+2 this month",
      icon: Home,
      color: "#3B82F6",
    },
    {
      title: "Active Tenants",
      value: "87",
      change: "+5 this month",
      icon: Users,
      color: "#10B981",
    },
    {
      title: "Monthly Revenue",
      value: "$42,350",
      change: "+8% from last month",
      icon: DollarSign,
      color: "#8B5CF6",
    },
    {
      title: "Pending Issues",
      value: "12",
      change: "3 urgent",
      icon: AlertCircle,
      color: "#EF4444",
    },
  ];

  const recentActivities = [
    {
      type: "payment",
      message: "Rent payment received from Unit 4B - Oak Street",
      time: "2 hours ago",
    },
    {
      type: "maintenance",
      message: "Maintenance request submitted for Unit 12A - Pine Ave",
      time: "4 hours ago",
    },
    {
      type: "lease",
      message: "New lease signed for Unit 7C - Maple Drive",
      time: "1 day ago",
    },
    {
      type: "inspection",
      message: "Property inspection completed - Cedar Complex",
      time: "2 days ago",
    },
  ];

  const upcomingTasks = [
    { task: "Lease renewal - Unit 5A", due: "Tomorrow", priority: "high" },
    {
      task: "Property inspection - Sunset Building",
      due: "Dec 20",
      priority: "medium",
    },
    { task: "Maintenance follow-up - Unit 3B", due: "Dec 22", priority: "low" },
    {
      task: "Rent collection - Oak Street Property",
      due: "Dec 25",
      priority: "high",
    },
  ];

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#F9FAFB",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      backgroundColor: "#FFFFFF",
      borderBottom: "1px solid #E5E7EB",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      padding: "16px 24px",
    },
    headerContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#111827",
      margin: 0,
    },
    searchContainer: {
      position: "relative",
    },
    searchInput: {
      paddingLeft: "40px",
      paddingRight: "16px",
      paddingTop: "8px",
      paddingBottom: "8px",
      width: "320px",
      border: "1px solid #D1D5DB",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s",
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9CA3AF",
      width: "16px",
      height: "16px",
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    iconButton: {
      padding: "8px",
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      color: "#9CA3AF",
      position: "relative",
      transition: "color 0.2s",
    },
    notificationBadge: {
      position: "absolute",
      top: "-4px",
      right: "-4px",
      backgroundColor: "#EF4444",
      color: "white",
      borderRadius: "50%",
      width: "16px",
      height: "16px",
      fontSize: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    avatar: {
      width: "32px",
      height: "32px",
      backgroundColor: "#3B82F6",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "14px",
      fontWeight: "500",
    },
    nav: {
      backgroundColor: "#FFFFFF",
      borderBottom: "1px solid #E5E7EB",
      padding: "0 24px",
    },
    navTabs: {
      display: "flex",
      gap: "32px",
    },
    navTab: {
      padding: "16px 4px",
      border: "none",
      backgroundColor: "transparent",
      fontSize: "14px",
      fontWeight: "500",
      textTransform: "capitalize",
      cursor: "pointer",
      borderBottom: "2px solid transparent",
      transition: "all 0.2s",
    },
    navTabActive: {
      borderBottomColor: "#3B82F6",
      color: "#3B82F6",
    },
    navTabInactive: {
      color: "#6B7280",
    },
    main: {
      padding: "24px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "24px",
      marginBottom: "32px",
    },
    statsCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      padding: "24px",
      border: "1px solid #E5E7EB",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    },
    statsCardContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statsText: {
      display: "flex",
      flexDirection: "column",
    },
    statsTitle: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#6B7280",
      margin: "0",
    },
    statsValue: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#111827",
      margin: "4px 0",
    },
    statsChange: {
      fontSize: "14px",
      color: "#6B7280",
      margin: "0",
    },
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: "24px",
      marginBottom: "32px",
    },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: "8px",
      border: "1px solid #E5E7EB",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    },
    cardHeader: {
      padding: "24px",
      borderBottom: "1px solid #E5E7EB",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      margin: "0",
    },
    cardContent: {
      padding: "24px",
    },
    activityList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    activityItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
    },
    activityDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      marginTop: "8px",
      flexShrink: 0,
    },
    activityContent: {
      flex: 1,
    },
    activityMessage: {
      fontSize: "14px",
      color: "#111827",
      margin: "0 0 4px 0",
    },
    activityTime: {
      fontSize: "12px",
      color: "#6B7280",
      margin: "0",
    },
    tasksList: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    taskItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    taskCheckbox: {
      width: "16px",
      height: "16px",
      accentColor: "#3B82F6",
    },
    taskContent: {
      flex: 1,
    },
    taskText: {
      fontSize: "14px",
      color: "#111827",
      margin: "0 0 4px 0",
    },
    taskMeta: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      margin: "0",
    },
    taskDue: {
      fontSize: "12px",
      color: "#6B7280",
    },
    priorityBadge: {
      padding: "2px 8px",
      fontSize: "12px",
      borderRadius: "12px",
      fontWeight: "500",
    },
    priorityHigh: {
      backgroundColor: "#FEE2E2",
      color: "#DC2626",
    },
    priorityMedium: {
      backgroundColor: "#FEF3C7",
      color: "#D97706",
    },
    priorityLow: {
      backgroundColor: "#D1FAE5",
      color: "#065F46",
    },
    quickActions: {
      marginTop: "32px",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "16px",
    },
    quickActionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
    },
    quickActionButton: {
      backgroundColor: "#FFFFFF",
      padding: "16px",
      borderRadius: "8px",
      border: "1px solid #E5E7EB",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      cursor: "pointer",
      transition: "box-shadow 0.2s",
      textAlign: "center",
      display: "flex", // Ensures content is centered vertically and horizontally
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    quickActionContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      width: "100%", // Ensure content takes full button width for better click area
    },
    quickActionText: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#111827",
    },
    linkButton: {
      color: "#3B82F6",
      fontSize: "14px",
      fontWeight: "500",
      textDecoration: "none",
      cursor: "pointer",
      transition: "color 0.2s",
    },
  };

  const getActivityDotColor = (type) => {
    switch (type) {
      case "payment":
        return "#10B981";
      case "maintenance":
        return "#F59E0B";
      case "lease":
        return "#3B82F6";
      default:
        return "#8B5CF6";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return { ...styles.priorityBadge, ...styles.priorityHigh };
      case "medium":
        return { ...styles.priorityBadge, ...styles.priorityMedium };
      default:
        return { ...styles.priorityBadge, ...styles.priorityLow };
    }
  };

  // Handler for quick actions navigation
  const handleQuickActionClick = (path) => {
    navigate(path);
  };

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <main style={styles.main}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <div key={index} style={styles.statsCard}>
              <div style={styles.statsCardContent}>
                <div style={styles.statsText}>
                  <p style={styles.statsTitle}>{stat.title}</p>
                  <p style={styles.statsValue}>{stat.value}</p>
                  <p style={styles.statsChange}>{stat.change}</p>
                </div>
                <stat.icon size={32} style={{ color: stat.color }} />
              </div>
            </div>
          ))}
        </div>
        <div style={styles.contentGrid}>
          {/* Recent Activity */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Recent Activity</h2>
              <a
                href="#"
                style={styles.linkButton}
                onMouseEnter={(e) => (e.target.style.color = "#2563EB")}
                onMouseLeave={(e) => (e.target.style.color = "#3B82F6")}
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
                        backgroundColor: getActivityDotColor(activity.type),
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

          {/* Upcoming Tasks */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Upcoming Tasks</h2>
              <button
                style={styles.iconButton}
                onMouseEnter={(e) => (e.target.style.color = "#6B7280")}
                onMouseLeave={(e) => (e.target.style.color = "#9CA3AF")}
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
                        <Calendar size={12} style={{ color: "#9CA3AF" }} />
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
        ---
        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.quickActionsGrid}>
            <button
              style={styles.quickActionButton}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1)")
              }
              onClick={() => handleQuickActionClick("/properties")} // Navigate to Add Property route
            >
              <div style={styles.quickActionContent}>
                <Plus size={24} style={{ color: "#3B82F6" }} />
                <span style={styles.quickActionText}>Add Property</span>
              </div>
            </button>
            <button
              style={styles.quickActionButton}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1)")
              }
              onClick={() => handleQuickActionClick("/tenants")} // Navigate to Add Tenant route
            >
              <div style={styles.quickActionContent}>
                <Users size={24} style={{ color: "#10B981" }} />
                <span style={styles.quickActionText}>Add Tenant</span>
              </div>
            </button>
            <button
              style={styles.quickActionButton}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1)")
              }
              onClick={() => handleQuickActionClick("/payments")} // Navigate to Report Issue route
            >
              <div style={styles.quickActionContent}>
                <AlertCircle size={24} style={{ color: "#F59E0B" }} />
                <span style={styles.quickActionText}>Payments</span>
              </div>
            </button>
            <button
              style={styles.quickActionButton}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1)")
              }
              onClick={() => handleQuickActionClick("/reports")} // Navigate to View Reports route
            >
              <div style={styles.quickActionContent}>
                <TrendingUp size={24} style={{ color: "#8B5CF6" }} />
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

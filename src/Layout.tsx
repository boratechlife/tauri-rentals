import { useState } from "react";
import { Settings, Bell, Search } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const Layout = () => {
  const [activeTab, setActiveTab] = useState("overview");

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

  // Handler for quick actions navigation

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>PropertyHub</h1>
            <div style={styles.searchContainer}>
              <Search style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search properties, tenants, or units..."
                style={styles.searchInput}
                onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
                onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
              />
            </div>
          </div>
          <div style={styles.headerRight}>
            <button
              style={styles.iconButton}
              onMouseEnter={(e) => (e.target.style.color = "#6B7280")}
              onMouseLeave={(e) => (e.target.style.color = "#9CA3AF")}
            >
              <Bell size={20} />
              <span style={styles.notificationBadge}>3</span>
            </button>
            <button
              style={styles.iconButton}
              onMouseEnter={(e) => (e.target.style.color = "#6B7280")}
              onMouseLeave={(e) => (e.target.style.color = "#9CA3AF")}
            >
              <Settings size={20} />
            </button>
            <div style={styles.avatar}>JD</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navTabs}>
          {[
            { tab: "overview", to: "/" },
            { tab: "properties", to: "/properties" },
            { tab: "tenants", to: "/tenants" },
            { tab: "finances", to: "/payments" },
            { tab: "expenses", to: "/expenses" },
          ].map(({ tab, to }) => (
            <NavLink
              key={tab}
              to={to}
              end={tab === "overview"}
              style={({ isActive }) => ({
                ...styles.navTab,
                ...(isActive ? styles.navTabActive : styles.navTabInactive),
              })}
              onMouseEnter={(e) => {
                // @ts-ignore
                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.color = "#374151";
                  e.currentTarget.style.borderBottomColor = "#D1D5DB";
                }
              }}
              onMouseLeave={(e) => {
                // @ts-ignore
                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.color = "#6B7280";
                  e.currentTarget.style.borderBottomColor = "transparent";
                }
              }}
            >
              {tab}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

use serde::{Serialize, Deserialize};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
   format!("Hello, {}!", name)
}

// This struct represents a single stat card
#[derive(Debug, Serialize, Deserialize)] // Add Debug for easier debugging
pub struct StatCard {
    pub title: String,
    pub value: String,
    pub change: String,
    pub icon: String, // Store icon name as String, or an enum if you have limited icons
    pub color: String,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct RecentActivity {
    #[serde(rename = "type")] // Map 'type' in JSON to 'activity_type' in Rust to avoid keyword conflict
    pub activity_type: String,
    pub message: String,
    pub time: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Task {
    pub task: String,
    pub due: String,
    pub priority: String, // You could also use an enum for priority for stronger typing
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")] // Add this line!
pub struct Expense {
    pub id: String,
    pub amount: f64,
    pub category: String,
    pub description: String,
    pub date: String,
    pub unit_id: String, // Rust remains snake_case
    pub unit_name: String,
    pub block_name: String,
    pub payment_method: String,
    pub vendor: String,
}

#[tauri::command]
fn get_building_blocks() -> Vec<String> {
    // In a real application, this data might come from a configuration file, database, etc.
    // For this example, we'll hardcode it.
    vec![
        "All".to_string(),
        "Block A".to_string(),
        "Block B".to_string(),
        "Block C".to_string(),
    ]
}


#[tauri::command]
fn get_all_expenses() -> Vec<Expense> {
    // In a real application, this data would come from a database, API, etc.
    // For this example, we're hardcoding the data.
    vec![
        Expense {
            id: "1".to_string(),
            amount: 450.0,
            category: "Maintenance".to_string(),
            description: "Plumbing repair - Kitchen sink".to_string(),
            date: "2024-06-15".to_string(),
            unit_id: "A101".to_string(),
            unit_name: "Unit A101".to_string(),
            block_name: "Block A".to_string(),
            payment_method: "Bank Transfer".to_string(),
            vendor: "ProFix Plumbing".to_string(),
        },
        Expense {
            id: "2".to_string(),
            amount: 1200.0,
            category: "Utilities".to_string(),
            description: "Electricity bill - Common areas".to_string(),
            date: "2024-06-14".to_string(),
            unit_id: "COMMON".to_string(),
            unit_name: "Common Areas".to_string(),
            block_name: "Block A".to_string(),
            payment_method: "Direct Debit".to_string(),
            vendor: "PowerCorp".to_string(),
        },
        Expense {
            id: "3".to_string(),
            amount: 850.0,
            category: "Security".to_string(),
            description: "Security system maintenance".to_string(),
            date: "2024-06-12".to_string(),
            unit_id: "COMMON".to_string(),
            unit_name: "Common Areas".to_string(),
            block_name: "Block B".to_string(),
            payment_method: "Credit Card".to_string(),
            vendor: "SecureGuard Inc".to_string(),
        },
        Expense {
            id: "4".to_string(),
            amount: 320.0,
            category: "Cleaning".to_string(),
            description: "Deep cleaning after tenant move-out".to_string(),
            date: "2024-06-10".to_string(),
            unit_id: "B205".to_string(),
            unit_name: "Unit B205".to_string(),
            block_name: "Block B".to_string(),
            payment_method: "Cash".to_string(),
            vendor: "CleanPro Services".to_string(),
        },
        Expense {
            id: "5".to_string(),
            amount: 2500.0,
            category: "Renovation".to_string(),
            description: "Bathroom renovation".to_string(),
            date: "2024-06-08".to_string(),
            unit_id: "A103".to_string(),
            unit_name: "Unit A103".to_string(),
            block_name: "Block A".to_string(),
            payment_method: "Bank Transfer".to_string(),
            vendor: "RenovateRight Co".to_string(),
        },
    ]
}

#[tauri::command]
fn get_upcoming_tasks() -> Vec<Task> {
    // In a real application, this data would come from a database, file, or external API.
    // Here, we're just hardcoding it for demonstration.
    vec![
        Task {
            task: "Lease renewal - Unit 5A".to_string(),
            due: "Tomorrow".to_string(),
            priority: "high".to_string(),
        },
        Task {
            task: "Property inspection - Sunset Building".to_string(),
            due: "Dec 20".to_string(),
            priority: "medium".to_string(),
        },
        Task {
            task: "Maintenance follow-up - Unit 3B".to_string(),
            due: "Dec 22".to_string(),
            priority: "low".to_string(),
        },
        Task {
            task: "Rent collection - Oak Street Property".to_string(),
            due: "Dec 25".to_string(),
            priority: "high".to_string(),
        },
    ]
}


#[tauri::command]
fn get_recent_activities() -> Vec<RecentActivity> {
    vec![
        RecentActivity {
            activity_type: "payment".to_string(),
            message: "Rent payment received from Unit 4B - Oak Street".to_string(),
            time: "2 hours ago".to_string(),
        },
        RecentActivity {
            activity_type: "maintenance".to_string(),
            message: "Maintenance request submitted for Unit 12A - Pine Ave".to_string(),
            time: "4 hours ago".to_string(),
        },
        RecentActivity {
            activity_type: "lease".to_string(),
            message: "New lease signed for Unit 7C - Maple Drive".to_string(),
            time: "1 day ago".to_string(),
        },
        RecentActivity {
            activity_type: "inspection".to_string(),
            message: "Property inspection completed - Cedar Complex".to_string(),
            time: "2 days ago".to_string(),
        },
    ]
}

#[tauri::command]
fn get_stats_cards() -> Vec<StatCard> {
    // In a real application, this data would come from a database, API, or calculations
    vec![
        StatCard {
            title: "Total Properties".to_string(),
            value: "24".to_string(),
            change: "+2 this month".to_string(),
            icon: "Home".to_string(), // Just the string name of the icon
            color: "#3B82F6".to_string(),
        },
        StatCard {
            title: "Active Tenants".to_string(),
            value: "87".to_string(),
            change: "+5 this month".to_string(),
            icon: "Users".to_string(),
            color: "#10B981".to_string(),
        },
        StatCard {
            title: "Monthly Revenue".to_string(),
            value: "$42,350".to_string(),
            change: "+8% from last month".to_string(),
            icon: "DollarSign".to_string(),
            color: "#8B5CF6".to_string(),
        },
        StatCard {
            title: "Pending Issues".to_string(),
            value: "12".to_string(),
            change: "3 urgent".to_string(),
            icon: "AlertCircle".to_string(),
            color: "#EF4444".to_string(),
        },
    ]
}

#[tauri::command]
fn get_expense_categories() -> Vec<String> {
    // In a real application, these categories might be fetched from a database,
    // a configuration file, or dynamically generated.
    // For this example, we'll hardcode them directly.
    vec![
        "All".to_string(),
        "Maintenance".to_string(),
        "Utilities".to_string(),
        "Security".to_string(),
        "Cleaning".to_string(),
        "Renovation".to_string(),
        "Insurance".to_string(),
        "Legal".to_string(),
    ]
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet,get_expense_categories,get_all_expenses,get_stats_cards,get_recent_activities,get_upcoming_tasks,get_building_blocks])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

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


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet,get_stats_cards])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

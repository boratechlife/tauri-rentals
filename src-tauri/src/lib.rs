use serde::{Deserialize, Serialize};

use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

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
pub struct Payment {
    pub id: String,
    pub tenant: String,
    pub unit: String,
    pub property: String,
    pub amount: f64, // Use f64 for floating-point numbers like currency
    pub date: String,
    pub due_date: String, // Rust typically uses snake_case for fields
    pub status: String,
    pub method: String,
    pub category: String,
}

// Define the TenantInfo struct first, as it's nested
#[derive(Debug, Serialize, Deserialize, Clone)] // Add Clone if you plan to copy instances
pub struct TenantInfo {
    pub id: String,
    pub name: String,
    // Use Option<String> for fields that might be null
    #[serde(rename = "leaseEndDate")] // Maps Rust field to JS field name
    pub lease_end_date: String,
}

// Define the Unit struct
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")] // Converts all fields from snake_case in Rust to camelCase in JS
pub struct Unit {
    pub id: String,
    #[serde(rename = "unitNumber")]
    pub unit_number: String,
    pub property: String,
    pub block: String,
    pub floor: i32, // Use i32 for integers
    pub status: String,
    #[serde(rename = "type")] // Use "r#type" or rename for Rust keywords
    pub unit_type: String, // Renamed to avoid keyword collision
    pub bedrooms: i32,
    pub bathrooms: i32,
    #[serde(rename = "squareFootage")]
    pub square_footage: i32,
    pub rent: i32,
    #[serde(rename = "securityDeposit")]
    pub security_deposit: i32,
    pub amenities: Vec<String>, // Use Vec<String> for string arrays
    pub photos: Vec<String>,
    // Use Option<TenantInfo> for fields that might be null
    #[serde(rename = "tenantInfo")]
    pub tenant_info: Option<TenantInfo>,
    pub notes: String,
}

#[tauri::command]
fn get_mock_units() -> Result<Vec<Unit>, String> {
    let mock_units = vec![
        Unit {
            id: "U001".to_string(),
            unit_number: "SL-201".to_string(),
            property: "Sunset Lofts".to_string(),
            block: "A".to_string(),
            floor: 2,
            status: "Occupied".to_string(),
            unit_type: "2BR/2BA".to_string(),
            bedrooms: 2,
            bathrooms: 2,
            square_footage: 1200,
            rent: 1800,
            security_deposit: 1800,
            amenities: vec![
                "Parking".to_string(),
                "AC".to_string(),
                "Pool Access".to_string(),
            ],
            photos: vec![
                "https://placehold.co/200x150/FF5733/FFFFFF?text=SL-201-1".to_string(),
                "https://placehold.co/200x150/33FF57/FFFFFF?text=SL-201-2".to_string(),
            ],
            tenant_info: Some(TenantInfo {
                id: "T001".to_string(),
                name: "Alice Johnson".to_string(),
                lease_end_date: "2025-01-14".to_string(),
            }),
            notes: "Recently renovated kitchen.".to_string(),
        },
        Unit {
            id: "U002".to_string(),
            unit_number: "GVA-105".to_string(),
            property: "Green Valley Apartments".to_string(),
            block: "B".to_string(),
            floor: 1,
            status: "Available".to_string(),
            unit_type: "1BR/1BA".to_string(),
            bedrooms: 1,
            bathrooms: 1,
            square_footage: 750,
            rent: 1500,
            security_deposit: 1500,
            amenities: vec!["Gym".to_string(), "Balcony".to_string(), "Wifi".to_string()],
            photos: vec!["https://placehold.co/200x150/3366FF/FFFFFF?text=GVA-105-1".to_string()],
            tenant_info: None, // Use None for null values
            notes: "Great view of the park.".to_string(),
        },
        Unit {
            id: "U003".to_string(),
            unit_number: "CVC-08".to_string(),
            property: "City View Condos".to_string(),
            block: "Main".to_string(),
            floor: 5,
            status: "Maintenance".to_string(),
            unit_type: "3BR/2BA".to_string(),
            bedrooms: 3,
            bathrooms: 2,
            square_footage: 1800,
            rent: 2200,
            security_deposit: 2200,
            amenities: vec!["Washer/Dryer".to_string(), "Pet Friendly".to_string()],
            photos: vec!["https://placehold.co/200x150/33FF57/FFFFFF?text=CVC-08-1".to_string()],
            tenant_info: None,
            notes: "Plumbing repair in progress. Estimated completion: 2024-07-01.".to_string(),
        },
        Unit {
            id: "U004".to_string(),
            unit_number: "SL-303".to_string(),
            property: "Sunset Lofts".to_string(),
            block: "A".to_string(),
            floor: 3,
            status: "Occupied".to_string(),
            unit_type: "2BR/1BA".to_string(),
            bedrooms: 2,
            bathrooms: 1,
            square_footage: 1000,
            rent: 1950,
            security_deposit: 1950,
            amenities: vec!["Parking".to_string(), "Balcony".to_string()],
            photos: vec!["https://placehold.co/200x150/FF33CC/FFFFFF?text=SL-303-1".to_string()],
            tenant_info: Some(TenantInfo {
                id: "T004".to_string(),
                name: "David Lee".to_string(),
                lease_end_date: "2025-08-31".to_string(),
            }),
            notes: "Quiet corner unit.".to_string(),
        },
        Unit {
            id: "U005".to_string(), // Corrected from .to_string()
            unit_number: "GVA-210".to_string(),
            property: "Green Valley Apartments".to_string(),
            block: "C".to_string(),
            floor: 2,
            status: "Reserved".to_string(),
            unit_type: "1BR/1BA".to_string(),
            bedrooms: 1,
            bathrooms: 1,
            square_footage: 800,
            rent: 1450,
            security_deposit: 1450,
            amenities: vec!["AC".to_string(), "Gym".to_string()],
            photos: vec!["https://placehold.co/200x150/5733FF/FFFFFF?text=GVA-210-1".to_string()],
            tenant_info: None,
            notes: "Awaiting final approval for new tenant.".to_string(),
        },
    ];
    Ok(mock_units) // Return the vector wrapped in Ok
}

#[tauri::command]
fn get_all_payments() -> Vec<Payment> {
    // In a real application, this data would come from a database query,
    // an external API call, or a file system.
    // Here, we're hardcoding the data for demonstration purposes.
    vec![
        Payment {
            id: "1".to_string(),
            tenant: "John Smith".to_string(),
            unit: "A101".to_string(),
            property: "Sunset Apartments".to_string(),
            amount: 1500.0,
            date: "2025-06-15".to_string(),
            due_date: "2025-06-01".to_string(),
            status: "Paid".to_string(),
            method: "Bank Transfer".to_string(),
            category: "Rent".to_string(),
        },
        Payment {
            id: "2".to_string(),
            tenant: "Sarah Johnson".to_string(),
            unit: "B205".to_string(),
            property: "Oak Ridge Complex".to_string(),
            amount: 1200.0,
            date: "2025-06-10".to_string(),
            due_date: "2025-06-01".to_string(),
            status: "Paid".to_string(),
            method: "Credit Card".to_string(),
            category: "Rent".to_string(),
        },
        Payment {
            id: "3".to_string(),
            tenant: "Mike Davis".to_string(),
            unit: "C301".to_string(),
            property: "Sunset Apartments".to_string(),
            amount: 1800.0,
            date: "".to_string(), // Empty string for missing date
            due_date: "2025-06-01".to_string(),
            status: "Overdue".to_string(),
            method: "".to_string(), // Empty string for missing method
            category: "Rent".to_string(),
        },
        Payment {
            id: "4".to_string(),
            tenant: "Emily Wilson".to_string(),
            unit: "A203".to_string(),
            property: "Green Valley".to_string(),
            amount: 150.0,
            date: "".to_string(),
            due_date: "2025-06-15".to_string(),
            status: "Pending".to_string(),
            method: "".to_string(),
            category: "Utilities".to_string(),
        },
        Payment {
            id: "5".to_string(),
            tenant: "David Brown".to_string(),
            unit: "B102".to_string(),
            property: "Oak Ridge Complex".to_string(),
            amount: 1400.0,
            date: "2025-06-12".to_string(),
            due_date: "2025-06-01".to_string(),
            status: "Paid".to_string(),
            method: "Check".to_string(),
            category: "Rent".to_string(),
        },
    ]
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentActivity {
    #[serde(rename = "type")]
    // Map 'type' in JSON to 'activity_type' in Rust to avoid keyword conflict
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
pub struct Property {
    pub id: i32,
    pub name: String,
    pub address: String,
    pub block: String,
    #[serde(rename = "totalUnits")] // Use rename for fields that differ from Rust's snake_case
    pub total_units: i32,
    #[serde(rename = "occupiedUnits")]
    pub occupied_units: i32,
    #[serde(rename = "vacantUnits")]
    pub vacant_units: i32,
    #[serde(rename = "monthlyRent")]
    pub monthly_rent: i32, // Assuming whole dollars, use f64 for decimals
    #[serde(rename = "type")] // 'type' is a Rust keyword, so rename it
    pub property_type: String,
    pub status: String,
    pub image: String,
    #[serde(rename = "lastInspection")]
    pub last_inspection: String,
    pub manager: String,
}

// Define the Tenant struct to match your TypeScript interface
#[derive(Debug, Serialize, Deserialize, Clone)] // Add Clone if you plan to copy instances
pub struct Tenant {
    pub id: u32, // Use u32 for IDs
    pub name: String,
    pub email: String,
    pub phone: String,
    pub status: String,
    pub unit: String,
    pub property: String,
    pub rent_amount: u32, // Use snake_case for Rust fields
    pub lease_start: String,
    pub lease_end: String,
}

#[tauri::command]
fn get_mock_tenants() -> Vec<Tenant> {
    let mock_tenants: Vec<Tenant> = vec![
        Tenant {
            id: 1,
            name: "John Doe".to_string(),
            email: "john@example.com".to_string(),
            phone: "123-456-7890".to_string(),
            status: "Active".to_string(),
            unit: "A101".to_string(),
            property: "Sunset Villas".to_string(),
            rent_amount: 1200,
            lease_start: "2023-01-01".to_string(),
            lease_end: "2023-12-31".to_string(),
        },
        Tenant {
            id: 2,
            name: "Jane Smith".to_string(),
            email: "jane@example.com".to_string(),
            phone: "098-765-4321".to_string(),
            status: "Moving Out".to_string(),
            unit: "B202".to_string(),
            property: "Green Meadows".to_string(),
            rent_amount: 1500,
            lease_start: "2022-06-01".to_string(),
            lease_end: "2023-05-31".to_string(),
        },
        Tenant {
            id: 3,
            name: "Peter Jones".to_string(),
            email: "peter@example.com".to_string(),
            phone: "555-123-4567".to_string(),
            status: "Active".to_string(),
            unit: "C303".to_string(),
            property: "Riverbend Apartments".to_string(),
            rent_amount: 950,
            lease_start: "2024-03-15".to_string(),
            lease_end: "2025-03-14".to_string(),
        },
        Tenant {
            id: 4,
            name: "Sarah Parker".to_string(),
            email: "sarah@example.com".to_string(),
            phone: "111-222-3333".to_string(),
            status: "Inactive".to_string(),
            unit: "D404".to_string(),
            property: "City Heights".to_string(),
            rent_amount: 1100,
            lease_start: "2021-09-01".to_string(),
            lease_end: "2022-08-31".to_string(),
        },
    ];
    mock_tenants
}

#[tauri::command]
fn get_property_types() -> Vec<String> {
    vec![
        "all".to_string(),
        "Apartment".to_string(),
        "Townhouse".to_string(),
        "House".to_string(),
        "Studio".to_string(),
        "Villa".to_string(),
    ]
}

#[tauri::command]
fn get_all_properties() -> Vec<Property> {
    // In a real application, this data would typically come from a database query,
    // a file, or an external API call. For demonstration, we're hardcoding it.
    vec![
        Property {
            id: 1,
            name: "Sunset Apartments".to_string(),
            address: "123 Oak Street, Downtown".to_string(),
            block: "Block A".to_string(),
            total_units: 24,
            occupied_units: 20,
            vacant_units: 4,
            monthly_rent: 1200,
            property_type: "Apartment".to_string(),
            status: "Active".to_string(),
            image: "/api/placeholder/300/200".to_string(),
            last_inspection: "2024-11-15".to_string(),
            manager: "John Smith".to_string(),
        },
        Property {
            id: 2,
            name: "Pine Grove Complex".to_string(),
            address: "456 Pine Avenue, Midtown".to_string(),
            block: "Block B".to_string(),
            total_units: 18,
            occupied_units: 16,
            vacant_units: 2,
            monthly_rent: 1400,
            property_type: "Apartment".to_string(),
            status: "Active".to_string(),
            image: "/api/placeholder/300/200".to_string(),
            last_inspection: "2024-12-01".to_string(),
            manager: "Sarah Johnson".to_string(),
        },
        Property {
            id: 3,
            name: "Maple Heights".to_string(),
            address: "789 Maple Drive, Uptown".to_string(),
            block: "Block A".to_string(),
            total_units: 30,
            occupied_units: 28,
            vacant_units: 2,
            monthly_rent: 1600,
            property_type: "Townhouse".to_string(),
            status: "Active".to_string(),
            image: "/api/placeholder/300/200".to_string(),
            last_inspection: "2024-11-28".to_string(),
            manager: "Mike Davis".to_string(),
        },
        Property {
            id: 4,
            name: "Cedar Court".to_string(),
            address: "321 Cedar Lane, Westside".to_string(),
            block: "Block C".to_string(),
            total_units: 12,
            occupied_units: 8,
            vacant_units: 4,
            monthly_rent: 1000,
            property_type: "House".to_string(),
            status: "Maintenance".to_string(),
            image: "/api/placeholder/300/200".to_string(),
            last_inspection: "2024-10-15".to_string(),
            manager: "Lisa Wilson".to_string(),
        },
        Property {
            id: 5,
            name: "Elm Street Studios".to_string(),
            address: "654 Elm Street, Downtown".to_string(),
            block: "Block B".to_string(),
            total_units: 36,
            occupied_units: 32,
            vacant_units: 4,
            monthly_rent: 800,
            property_type: "Studio".to_string(),
            status: "Active".to_string(),
            image: "/api/placeholder/300/200".to_string(),
            last_inspection: "2024-12-05".to_string(),
            manager: "Tom Anderson".to_string(),
        },
        Property {
            id: 6,
            name: "Birch Villa".to_string(),
            address: "987 Birch Road, Eastside".to_string(),
            block: "Block C".to_string(),
            total_units: 6,
            occupied_units: 5,
            vacant_units: 1,
            monthly_rent: 2000,
            property_type: "Villa".to_string(),
            status: "Active".to_string(),
            image: "/api/placeholder/300/200".to_string(),
            last_inspection: "2024-11-20".to_string(),
            manager: "Emma Brown".to_string(),
        },
    ]
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
    // Define your migrations here
    let migrations = vec![
        Migration {
            version: 1, // Keep the version as 1, as we're extending the initial setup
            description: "create_users_table_and_seed_data", // Update description
            sql: "
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL
                );
                -- Seed data below
                INSERT OR IGNORE INTO users (name, email) VALUES ('Alice Smith', 'alice@example.com');
                INSERT OR IGNORE INTO users (name, email) VALUES ('Bob Johnson', 'bob@example.com');
                INSERT OR IGNORE INTO users (name, email) VALUES ('Charlie Brown', 'charlie@example.com');
            ",
            kind: MigrationKind::Up,
        },
        // If you have more complex seeding or want to separate concerns,
        // you could create a new migration with version: 2, description: "seed_initial_data",
        // and only put INSERT statements there.
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(
            SqlBuilder::default() // Use our aliased Builder
                .add_migrations("sqlite:test.db", migrations) // 'test.db' is our database file
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_mock_units,
            get_mock_tenants,
            get_property_types,
            get_all_properties,
            get_all_payments,
            get_expense_categories,
            get_all_expenses,
            get_stats_cards,
            get_recent_activities,
            get_upcoming_tasks,
            get_building_blocks
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

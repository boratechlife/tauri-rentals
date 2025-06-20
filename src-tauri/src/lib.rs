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
// ---------------------------------------------------------------------
        // Migration 2: Create payments table and seed data
        // Title: Create Payments Table
        // Table Name: payments
        // Columns: id (TEXT PRIMARY KEY), tenant (TEXT NOT NULL), unit (TEXT NOT NULL), property (TEXT NOT NULL), amount (REAL NOT NULL), date (TEXT NOT NULL), due_date (TEXT NOT NULL), status (TEXT NOT NULL), method (TEXT NOT NULL), category (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 2,
            description: "create_payments_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS payments (
                    id TEXT PRIMARY KEY NOT NULL,
                    tenant TEXT NOT NULL,
                    unit TEXT NOT NULL,
                    property TEXT NOT NULL,
                    amount REAL NOT NULL,
                    date TEXT NOT NULL,
                    due_date TEXT NOT NULL,
                    status TEXT NOT NULL,
                    method TEXT NOT NULL,
                    category TEXT NOT NULL
                );
                INSERT OR IGNORE INTO payments (id, tenant, unit, property, amount, date, due_date, status, method, category) VALUES ('1', 'John Smith', 'A101', 'Sunset Apartments', 1500.0, '2025-06-15', '2025-06-01', 'Paid', 'Bank Transfer', 'Rent');
                INSERT OR IGNORE INTO payments (id, tenant, unit, property, amount, date, due_date, status, method, category) VALUES ('2', 'Sarah Johnson', 'B205', 'Oak Ridge Complex', 1200.0, '2025-06-10', '2025-06-01', 'Paid', 'Credit Card', 'Rent');
                INSERT OR IGNORE INTO payments (id, tenant, unit, property, amount, date, due_date, status, method, category) VALUES ('3', 'Mike Davis', 'C301', 'Sunset Apartments', 1800.0, '', '2025-06-01', 'Overdue', '', 'Rent');
                INSERT OR IGNORE INTO payments (id, tenant, unit, property, amount, date, due_date, status, method, category) VALUES ('4', 'Emily Wilson', 'A203', 'Green Valley', 150.0, '', '2025-06-15', 'Pending', '', 'Utilities');
                INSERT OR IGNORE INTO payments (id, tenant, unit, property, amount, date, due_date, status, method, category) VALUES ('5', 'David Brown', 'B102', 'Oak Ridge Complex', 1400.0, '2025-06-12', '2025-06-01', 'Paid', 'Check', 'Rent');
            ",
            kind: MigrationKind::Up,
        },

        // ---------------------------------------------------------------------
        // Migration 3: Create tenant_info table (if needed separately) and seed data
        // Title: Create Tenant Info Table
        // Table Name: tenant_info
        // Columns: id (TEXT PRIMARY KEY), name (TEXT NOT NULL), lease_end_date (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 3,
            description: "create_tenant_info_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS tenant_info (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    lease_end_date TEXT NOT NULL
                );
                INSERT OR IGNORE INTO tenant_info (id, name, lease_end_date) VALUES ('T001', 'Alice Johnson', '2025-01-14');
                INSERT OR IGNORE INTO tenant_info (id, name, lease_end_date) VALUES ('T004', 'David Lee', '2025-08-31');
            ",
            kind: MigrationKind::Up,
        },
         // ---------------------------------------------------------------------
        // Migration 4: Create units table and seed data
        // Title: Create Units Table
        // Table Name: units
        // Columns: id (TEXT PRIMARY KEY), unit_number (TEXT NOT NULL), property (TEXT NOT NULL), block (TEXT NOT NULL), floor (INTEGER NOT NULL), status (TEXT NOT NULL), unit_type (TEXT NOT NULL), bedrooms (INTEGER NOT NULL), bathrooms (INTEGER NOT NULL), square_footage (INTEGER NOT NULL), rent (INTEGER NOT NULL), security_deposit (INTEGER NOT NULL), amenities (TEXT NOT NULL), photos (TEXT NOT NULL), tenant_info_id (TEXT), notes (TEXT NOT NULL)
        // Note: amenities and photos are stored as comma-separated strings (TEXT). tenant_info_id is nullable (TEXT).
        // ---------------------------------------------------------------------
        Migration {
            version: 4,
            description: "create_units_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS units (
                    id TEXT PRIMARY KEY NOT NULL,
                    unit_number TEXT NOT NULL,
                    property TEXT NOT NULL,
                    block TEXT NOT NULL,
                    floor INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    unit_type TEXT NOT NULL,
                    bedrooms INTEGER NOT NULL,
                    bathrooms INTEGER NOT NULL,
                    square_footage INTEGER NOT NULL,
                    rent INTEGER NOT NULL,
                    security_deposit INTEGER NOT NULL,
                    amenities TEXT NOT NULL, -- Storing as comma-separated string
                    photos TEXT NOT NULL, -- Storing as comma-separated string
                    tenant_info_id TEXT, -- Can be NULL
                    notes TEXT NOT NULL,
                    FOREIGN KEY (tenant_info_id) REFERENCES tenant_info(id)
                );
                INSERT OR IGNORE INTO units (id, unit_number, property, block, floor, status, unit_type, bedrooms, bathrooms, square_footage, rent, security_deposit, amenities, photos, tenant_info_id, notes) VALUES ('U001', 'SL-201', 'Sunset Lofts', 'A', 2, 'Occupied', '2BR/2BA', 2, 2, 1200, 1800, 1800, 'Parking,AC,Pool Access', 'https://placehold.co/200x150/FF5733/FFFFFF?text=SL-201-1,https://placehold.co/200x150/33FF57/FFFFFF?text=SL-201-2', 'T001', 'Recently renovated kitchen.');
                INSERT OR IGNORE INTO units (id, unit_number, property, block, floor, status, unit_type, bedrooms, bathrooms, square_footage, rent, security_deposit, amenities, photos, tenant_info_id, notes) VALUES ('U002', 'GVA-105', 'Green Valley Apartments', 'B', 1, 'Available', '1BR/1BA', 1, 1, 750, 1500, 1500, 'Gym,Balcony,Wifi', 'https://placehold.co/200x150/3366FF/FFFFFF?text=GVA-105-1', NULL, 'Great view of the park.');
                INSERT OR IGNORE INTO units (id, unit_number, property, block, floor, status, unit_type, bedrooms, bathrooms, square_footage, rent, security_deposit, amenities, photos, tenant_info_id, notes) VALUES ('U003', 'CVC-08', 'City View Condos', 'Main', 5, 'Maintenance', '3BR/2BA', 3, 2, 1800, 2200, 2200, 'Washer/Dryer,Pet Friendly', 'https://placehold.co/200x150/33FF57/FFFFFF?text=CVC-08-1', NULL, 'Plumbing repair in progress. Estimated completion: 2024-07-01.');
                INSERT OR IGNORE INTO units (id, unit_number, property, block, floor, status, unit_type, bedrooms, bathrooms, square_footage, rent, security_deposit, amenities, photos, tenant_info_id, notes) VALUES ('U004', 'SL-303', 'Sunset Lofts', 'A', 3, 'Occupied', '2BR/1BA', 2, 1, 1000, 1950, 1950, 'Parking,Balcony', 'https://placehold.co/200x150/FF33CC/FFFFFF?text=SL-303-1', 'T004', 'Quiet corner unit.');
                INSERT OR IGNORE INTO units (id, unit_number, property, block, floor, status, unit_type, bedrooms, bathrooms, square_footage, rent, security_deposit, amenities, photos, tenant_info_id, notes) VALUES ('U005', 'GVA-210', 'Green Valley Apartments', 'C', 2, 'Reserved', '1BR/1BA', 1, 1, 800, 1450, 1450, 'AC,Gym', 'https://placehold.co/200x150/5733FF/FFFFFF?text=GVA-210-1', NULL, 'Awaiting final approval for new tenant.');
            ",
            kind: MigrationKind::Up,
        },
         // ---------------------------------------------------------------------
        // Migration 5: Create tenants table and seed data
        // Title: Create Tenants Table
        // Table Name: tenants
        // Columns: id (INTEGER PRIMARY KEY), name (TEXT NOT NULL), email (TEXT NOT NULL), phone (TEXT NOT NULL), status (TEXT NOT NULL), unit (TEXT NOT NULL), property (TEXT NOT NULL), rent_amount (INTEGER NOT NULL), lease_start (TEXT NOT NULL), lease_end (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 5,
            description: "create_tenants_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS tenants (
                    id INTEGER PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    status TEXT NOT NULL,
                    unit TEXT NOT NULL,
                    property TEXT NOT NULL,
                    rent_amount INTEGER NOT NULL,
                    lease_start TEXT NOT NULL,
                    lease_end TEXT NOT NULL
                );
                INSERT OR IGNORE INTO tenants (id, name, email, phone, status, unit, property, rent_amount, lease_start, lease_end) VALUES (1, 'John Doe', 'john@example.com', '123-456-7890', 'Active', 'A101', 'Sunset Villas', 1200, '2023-01-01', '2023-12-31');
                INSERT OR IGNORE INTO tenants (id, name, email, phone, status, unit, property, rent_amount, lease_start, lease_end) VALUES (2, 'Jane Smith', 'jane@example.com', '098-765-4321', 'Moving Out', 'B202', 'Green Meadows', 1500, '2022-06-01', '2023-05-31');
                INSERT OR IGNORE INTO tenants (id, name, email, phone, status, unit, property, rent_amount, lease_start, lease_end) VALUES (3, 'Peter Jones', 'peter@example.com', '555-123-4567', 'Active', 'C303', 'Riverbend Apartments', 950, '2024-03-15', '2025-03-14');
                INSERT OR IGNORE INTO tenants (id, name, email, phone, status, unit, property, rent_amount, lease_start, lease_end) VALUES (4, 'Sarah Parker', 'sarah@example.com', '111-222-3333', 'Inactive', 'D404', 'City Heights', 1100, '2021-09-01', '2022-08-31');
            ",
            kind: MigrationKind::Up,
        },
        // ---------------------------------------------------------------------
        // Migration 6: Create properties table and seed data
        // Title: Create Properties Table
        // Table Name: properties
        // Columns: id (INTEGER PRIMARY KEY), name (TEXT NOT NULL), address (TEXT NOT NULL), block (TEXT NOT NULL), total_units (INTEGER NOT NULL), occupied_units (INTEGER NOT NULL), vacant_units (INTEGER NOT NULL), monthly_rent (INTEGER NOT NULL), property_type (TEXT NOT NULL), status (TEXT NOT NULL), image (TEXT NOT NULL), last_inspection (TEXT NOT NULL), manager (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 6,
            description: "create_properties_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS properties (
                    id INTEGER PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    address TEXT NOT NULL,
                    block TEXT NOT NULL,
                    total_units INTEGER NOT NULL,
                    occupied_units INTEGER NOT NULL,
                    vacant_units INTEGER NOT NULL,
                    monthly_rent INTEGER NOT NULL,
                    property_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    image TEXT NOT NULL,
                    last_inspection TEXT NOT NULL,
                    manager TEXT NOT NULL
                );
                INSERT OR IGNORE INTO properties (id, name, address, block, total_units, occupied_units, vacant_units, monthly_rent, property_type, status, image, last_inspection, manager) VALUES (1, 'Sunset Apartments', '123 Oak Street, Downtown', 'Block A', 24, 20, 4, 1200, 'Apartment', 'Active', '/api/placeholder/300/200', '2024-11-15', 'John Smith');
                INSERT OR IGNORE INTO properties (id, name, address, block, total_units, occupied_units, vacant_units, monthly_rent, property_type, status, image, last_inspection, manager) VALUES (2, 'Pine Grove Complex', '456 Pine Avenue, Midtown', 'Block B', 18, 16, 2, 1400, 'Apartment', 'Active', '/api/placeholder/300/200', '2024-12-01', 'Sarah Johnson');
                INSERT OR IGNORE INTO properties (id, name, address, block, total_units, occupied_units, vacant_units, monthly_rent, property_type, status, image, last_inspection, manager) VALUES (3, 'Maple Heights', '789 Maple Drive, Uptown', 'Block A', 30, 28, 2, 1600, 'Townhouse', 'Active', '/api/placeholder/300/200', '2024-11-28', 'Mike Davis');
                INSERT OR IGNORE INTO properties (id, name, address, block, total_units, occupied_units, vacant_units, monthly_rent, property_type, status, image, last_inspection, manager) VALUES (4, 'Cedar Court', '321 Cedar Lane, Westside', 'Block C', 12, 8, 4, 1000, 'House', 'Maintenance', '/api/placeholder/300/200', '2024-10-15', 'Lisa Wilson');
                INSERT OR IGNORE INTO properties (id, name, address, block, total_units, occupied_units, vacant_units, monthly_rent, property_type, status, image, last_inspection, manager) VALUES (5, 'Elm Street Studios', '654 Elm Street, Downtown', 'Block B', 36, 32, 4, 800, 'Studio', 'Active', '/api/placeholder/300/200', '2024-12-05', 'Tom Anderson');
                INSERT OR IGNORE INTO properties (id, name, address, block, total_units, occupied_units, vacant_units, monthly_rent, property_type, status, image, last_inspection, manager) VALUES (6, 'Birch Villa', '987 Birch Road, Eastside', 'Block C', 6, 5, 1, 2000, 'Villa', 'Active', '/api/placeholder/300/200', '2024-11-20', 'Emma Brown');
            ",
            kind: MigrationKind::Up,
        },
        // ---------------------------------------------------------------------
        // Migration 7: Create expenses table and seed data
        // Title: Create Expenses Table
        // Table Name: expenses
        // Columns: id (TEXT PRIMARY KEY), amount (REAL NOT NULL), category (TEXT NOT NULL), description (TEXT NOT NULL), date (TEXT NOT NULL), unit_id (TEXT NOT NULL), unit_name (TEXT NOT NULL), block_name (TEXT NOT NULL), payment_method (TEXT NOT NULL), vendor (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 7,
            description: "create_expenses_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS expenses (
                    id TEXT PRIMARY KEY NOT NULL,
                    amount REAL NOT NULL,
                    category TEXT NOT NULL,
                    description TEXT NOT NULL,
                    date TEXT NOT NULL,
                    unit_id TEXT NOT NULL,
                    unit_name TEXT NOT NULL,
                    block_name TEXT NOT NULL,
                    payment_method TEXT NOT NULL,
                    vendor TEXT NOT NULL
                );
                INSERT OR IGNORE INTO expenses (id, amount, category, description, date, unit_id, unit_name, block_name, payment_method, vendor) VALUES ('1', 450.0, 'Maintenance', 'Plumbing repair - Kitchen sink', '2024-06-15', 'A101', 'Unit A101', 'Block A', 'Bank Transfer', 'ProFix Plumbing');
                INSERT OR IGNORE INTO expenses (id, amount, category, description, date, unit_id, unit_name, block_name, payment_method, vendor) VALUES ('2', 1200.0, 'Utilities', 'Electricity bill - Common areas', '2024-06-14', 'COMMON', 'Common Areas', 'Block A', 'Direct Debit', 'PowerCorp');
                INSERT OR IGNORE INTO expenses (id, amount, category, description, date, unit_id, unit_name, block_name, payment_method, vendor) VALUES ('3', 850.0, 'Security', 'Security system maintenance', '2024-06-12', 'COMMON', 'Common Areas', 'Block B', 'Credit Card', 'SecureGuard Inc');
                INSERT OR IGNORE INTO expenses (id, amount, category, description, date, unit_id, unit_name, block_name, payment_method, vendor) VALUES ('4', 320.0, 'Cleaning', 'Deep cleaning after tenant move-out', '2024-06-10', 'B205', 'Unit B205', 'Block B', 'Cash', 'CleanPro Services');
                INSERT OR IGNORE INTO expenses (id, amount, category, description, date, unit_id, unit_name, block_name, payment_method, vendor) VALUES ('5', 2500.0, 'Renovation', 'Bathroom renovation', '2024-06-08', 'A103', 'Unit A103', 'Block A', 'Bank Transfer', 'RenovateRight Co');
            ",
            kind: MigrationKind::Up,
        },
         // ---------------------------------------------------------------------
        // Migration 8: Create recent_activities table and seed data
        // Title: Create Recent Activities Table
        // Table Name: recent_activities
        // Columns: activity_type (TEXT NOT NULL), message (TEXT NOT NULL), time (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 8,
            description: "create_recent_activities_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS recent_activities (
                    activity_type TEXT NOT NULL,
                    message TEXT PRIMARY KEY NOT NULL, -- Message as primary key assuming messages are unique for simplicity
                    time TEXT NOT NULL
                );
                INSERT OR IGNORE INTO recent_activities (activity_type, message, time) VALUES ('payment', 'Rent payment received from Unit 4B - Oak Street', '2 hours ago');
                INSERT OR IGNORE INTO recent_activities (activity_type, message, time) VALUES ('maintenance', 'Maintenance request submitted for Unit 12A - Pine Ave', '4 hours ago');
                INSERT OR IGNORE INTO recent_activities (activity_type, message, time) VALUES ('lease', 'New lease signed for Unit 7C - Maple Drive', '1 day ago');
                INSERT OR IGNORE INTO recent_activities (activity_type, message, time) VALUES ('inspection', 'Property inspection completed - Cedar Complex', '2 days ago');
            ",
            kind: MigrationKind::Up,
        },
                // ---------------------------------------------------------------------
        // Migration 9: Create tasks table and seed data
        // Title: Create Tasks Table
        // Table Name: tasks
        // Columns: task_name (TEXT PRIMARY KEY), due_date (TEXT NOT NULL), priority (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 9,
            description: "create_tasks_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS tasks (
                    task_name TEXT PRIMARY KEY NOT NULL,
                    due_date TEXT NOT NULL,
                    priority TEXT NOT NULL
                );
                INSERT OR IGNORE INTO tasks (task_name, due_date, priority) VALUES ('Lease renewal - Unit 5A', 'Tomorrow', 'high');
                INSERT OR IGNORE INTO tasks (task_name, due_date, priority) VALUES ('Property inspection - Sunset Building', 'Dec 20', 'medium');
                INSERT OR IGNORE INTO tasks (task_name, due_date, priority) VALUES ('Maintenance follow-up - Unit 3B', 'Dec 22', 'low');
                INSERT OR IGNORE INTO tasks (task_name, due_date, priority) VALUES ('Rent collection - Oak Street Property', 'Dec 25', 'high');
            ",
            kind: MigrationKind::Up,
        },
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

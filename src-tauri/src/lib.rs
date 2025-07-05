use serde::{Deserialize, Serialize};

use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
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
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL
                );
              
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
                payment_id TEXT PRIMARY KEY NOT NULL,           -- UUID recommended
                tenant_id TEXT NOT NULL,                        -- FK to tenants table
                unit_id TEXT NOT NULL,                          -- FK to units table
                property_id TEXT NOT NULL,                      -- FK to properties table
                amount_paid DECIMAL(10, 2) NOT NULL,            -- Accurate money representation
                payment_date DATE NOT NULL,                     -- When payment was made
                due_date DATE NOT NULL,                         -- When it was due
                payment_status TEXT NOT NULL CHECK (payment_status IN ('Paid', 'Pending', 'Overdue')), -- Enforce valid statuses
                payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Credit Card', 'Mobile Money', 'Check', 'Other')), -- Control options
                payment_category TEXT NOT NULL CHECK (payment_category IN ('Rent', 'Utilities', 'Deposit', 'Other')), -- Standard categories
                receipt_number TEXT UNIQUE,                     -- Optional: receipt/tracking number
                transaction_reference TEXT,                     -- Optional: e.g., M-Pesa code
                remarks TEXT,                                   -- Optional: freeform comments
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Timestamp for creation
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- Timestamp for updates
            );

              
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
                CREATE TABLE IF NOT EXISTS tenants (
                tenant_id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                phone_number TEXT,
                email TEXT,
                id_number TEXT,
                lease_start_date DATE NOT NULL,
                lease_end_date DATE NOT NULL,
                rent_amount DECIMAL(10, 2),
                deposit_amount DECIMAL(10, 2),
                unit_id INTEGER, -- should reference unit or property
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

               
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
                unit_id INTEGER PRIMARY KEY AUTOINCREMENT,
                unit_number TEXT NOT NULL,
                property_id INTEGER NOT NULL,
                block_id TEXT,
                floor_number INTEGER,
                unit_status TEXT NOT NULL, -- e.g. 'vacant', 'occupied', etc.
                unit_type TEXT NOT NULL,
                bedroom_count INTEGER NOT NULL,
                bathroom_count INTEGER NOT NULL,
                monthly_rent DECIMAL(10, 2),
                security_deposit DECIMAL(10, 2),
                tenant_id INTEGER,
                notes TEXT,
                FOREIGN KEY (property_id) REFERENCES properties(property_id),
                FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
                );

               
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
                CREATE TABLE leases (
                lease_id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id INTEGER NOT NULL,
                unit_id INTEGER NOT NULL,
                rent_amount DECIMAL(10,2),
                lease_start_date DATE NOT NULL,
                lease_end_date DATE NOT NULL,
                deposit_paid DECIMAL(10,2),
                status TEXT DEFAULT 'active', -- optional: active/expired/terminated
                FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
                FOREIGN KEY (unit_id) REFERENCES units(unit_id)
                );
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
                property_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT NOT NULL,
                total_units INTEGER NOT NULL,
                property_type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                last_inspection DATE,
                manager_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (manager_id) REFERENCES managers(manager_id)
                );
            ",
            kind: MigrationKind::Up,
        },
        // ---------------------------------------------------------------------
        // Migration 7: Create Blocks table and seed data
        // Title: Create Blcoks Table
        // Table Name: Blocks
        // Columns: id (TEXT PRIMARY KEY), amount (REAL NOT NULL), category (TEXT NOT NULL), description (TEXT NOT NULL), date (TEXT NOT NULL), unit_id (TEXT NOT NULL), unit_name (TEXT NOT NULL), block_name (TEXT NOT NULL), payment_method (TEXT NOT NULL), vendor (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 7,
            description: "create_blocks_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS blocks (
                block_id INTEGER PRIMARY KEY AUTOINCREMENT,
                block_name TEXT NOT NULL,
                property_id INTEGER NOT NULL,
                floor_count INTEGER,
                notes TEXT,
                FOREIGN KEY (property_id) REFERENCES properties(property_id)
                );


            
            ",
            kind: MigrationKind::Up,
        },
                // ---------------------------------------------------------------------
        // Migration 8: Create expenses table and seed data
        // Title: Create Expenses Table
        // Table Name: expenses
        // Columns: id (TEXT PRIMARY KEY), amount (REAL NOT NULL), category (TEXT NOT NULL), description (TEXT NOT NULL), date (TEXT NOT NULL), unit_id (TEXT NOT NULL), unit_name (TEXT NOT NULL), block_name (TEXT NOT NULL), payment_method (TEXT NOT NULL), vendor (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 8,
            description: "create_expenses_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS expenses (
                expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount DECIMAL(10, 2) NOT NULL,
                category TEXT NOT NULL, -- e.g., maintenance, utility
                description TEXT,
                expense_date DATE NOT NULL,
                unit_id INTEGER, -- optional, if this expense is unit-specific
                block_id INTEGER, -- optional, if this expense is block-specific
                property_id INTEGER, -- optional, for property-wide expenses
                payment_method TEXT NOT NULL, -- e.g., cash, bank, M-Pesa
                vendor TEXT NOT NULL,
                invoice_number TEXT,
                paid_by TEXT, -- who entered or approved the expense
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (unit_id) REFERENCES units(unit_id),
                FOREIGN KEY (block_id) REFERENCES blocks(block_id),
                FOREIGN KEY (property_id) REFERENCES properties(property_id)
                );


              
            ",
            kind: MigrationKind::Up,
        },
         // ---------------------------------------------------------------------
        // Migration 9: Create recent_activities table and seed data
        // Title: Create Recent Activities Table
        // Table Name: recent_activities
        // Columns: activity_type (TEXT NOT NULL), message (TEXT NOT NULL), time (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 9,
            description: "create_recent_activities_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS recent_activities (
                    recent_activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    activity_type TEXT NOT NULL,
                    message TEXT  KEY NOT NULL, -- Message as primary key assuming messages are unique for simplicity
                    time TEXT NOT NULL
                );
               
            ",
            kind: MigrationKind::Up,
        },
                // ---------------------------------------------------------------------
        // Migration 10: Create tasks table and seed data
        // Title: Create Tasks Table
        // Table Name: tasks
        // Columns: task_name (TEXT PRIMARY KEY), due_date (TEXT NOT NULL), priority (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 10,
            description: "create_tasks_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS tasks (
                    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_name TEXT UNIQUE  NOT NULL,
                    due_date TEXT NOT NULL,
                    priority TEXT NOT NULL
                );
               
            ",
            kind: MigrationKind::Up,
        },
// ---------------------------------------------------------------------
        // Migration 11: Create managers table and seed data
        // Title: Create Managers Table
        // Table Name: managers
        // Columns: id (TEXT PRIMARY KEY), name (TEXT NOT NULL), email (TEXT NOT NULL), phone (TEXT NOT NULL), hire_date (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
            version: 11,
            description: "create_managers_table_and_seed_data",
            sql: "
                CREATE TABLE IF NOT EXISTS managers (
                    manager_id INTEGER PRIMARY KEY  AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT ,
                    phone TEXT NOT NULL,
                    hire_date TEXT NOT NULL
                );
               
            ",
            kind: MigrationKind::Up,
        },
        // ---------------------------------------------------------------------
        // Migration 11: seed managers table and seed data
        // Title: seed Managers Table
        // Table Name: managers
        // Columns: id (TEXT PRIMARY KEY), name (TEXT NOT NULL), email (TEXT NOT NULL), phone (TEXT NOT NULL), hire_date (TEXT NOT NULL)
        // ---------------------------------------------------------------------
        Migration {
    version: 12, // <-- Increment this version number
    description: "seed_managers_table",
    sql: "
        -- Seed data for the managers table
-- Seed data for the managers table
INSERT INTO managers (name, email, phone, hire_date) VALUES
('Alice Johnson', 'alice.j@example.com', '111-222-3333', '2023-01-15'),
('Bob Smith', 'bob.s@example.com', '444-555-6666', '2022-07-01'),
('Carol White', 'carol.w@example.com', '777-888-9999', '2024-03-20');
    ",
    kind: MigrationKind::Up, // This is an "Up" migration to apply changes
},

        Migration {
            version: 13, // <-- Increment this version number
            description: "seed_managers_table",
            sql: "
            ALTER TABLE payments ADD COLUMN payment_month TEXT NOT NULL DEFAULT '';
            UPDATE payments SET payment_month = strftime('%Y-%m', due_date) WHERE payment_month = '';
            ",
            kind: MigrationKind::Up, // This is an "Up" migration to apply changes
},
      Migration {
            version: 14, // <-- Increment this version number
            description: "create_indexes_on_payments_table",
            sql: "
                CREATE INDEX idx_payment_month ON payments(payment_month);
                CREATE INDEX idx_tenant_id ON payments(tenant_id);
                CREATE INDEX idx_unit_id ON payments(unit_id);
            ",
            kind: MigrationKind::Up, // This is an "Up" migration to apply changes
},
      Migration {
            version: 15, // <-- Increment this version number
            description: "create_complaints_table",
            sql: "
                    CREATE TABLE IF NOT EXISTS complaints (
                    complaint_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    unit_id INTEGER NOT NULL,
                    tenant_id INTEGER,
                    description TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('Open', 'In Progress', 'Resolved')),
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (unit_id) REFERENCES units(unit_id),
                    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
                    );
            ",
            kind: MigrationKind::Up, // This is an "Up" migration to apply changes
},

     Migration {
            version: 16, // <-- Increment this version number
            description: "create_complaints_table",
            sql: "
                -- V2__alter_units_columns.sql
                ALTER TABLE units RENAME COLUMN bedroom_count TO old_bedroom_count;
                ALTER TABLE units ADD COLUMN bedroom_count REAL; -- Or whatever new type/constraints you need
                UPDATE units SET bedroom_count = old_bedroom_count;
                ALTER TABLE units DROP COLUMN old_bedroom_count;

                ALTER TABLE units RENAME COLUMN bathroom_count TO old_bathroom_count;
                ALTER TABLE units ADD COLUMN bathroom_count REAL; -- Or whatever new type/constraints you need
                UPDATE units SET bathroom_count = old_bathroom_count;
                ALTER TABLE units DROP COLUMN old_bathroom_count;
            ",
            kind: MigrationKind::Up, // This is an "Up" migration to apply changes
},
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(
            SqlBuilder::default() // Use our aliased Builder
                .add_migrations("sqlite:test6.db", migrations) // 'test4.db' is our database file
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // greet,
            // get_mock_units,
            // get_mock_tenants,
            // get_property_types,
            // get_all_properties,
            // get_all_payments,
            // get_expense_categories,
            // get_all_expenses,
            // get_stats_cards,
            // get_recent_activities,
            // get_upcoming_tasks,
            // get_building_blocks
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
    >
      {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
      {copied ? "Copied" : "Copy Mermaid"}
    </Button>
  )
}

/* ─────────────────────────────────────────────────────────────
   1. ER DIAGRAM  (Entity-Relationship)
   ───────────────────────────────────────────────────────────── */
const erDiagram = `erDiagram
    USERS {
        int id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar role "manager | biller"
        boolean is_active
        timestamp created_at
    }

    VENDORS {
        int id PK
        varchar name
        varchar contact_person
        varchar email
        varchar phone
        text address
        decimal performance_rating
        int total_orders
        int on_time_delivery
        boolean is_active
        timestamp created_at
    }

    PRODUCTS {
        int id PK
        varchar name
        varchar sku UK
        varchar category
        decimal price
        decimal cost_price
        int current_stock
        int threshold
        varchar unit
        int vendor_id FK
        boolean is_active
        timestamp created_at
    }

    BILLS {
        int id PK
        varchar bill_number UK
        int biller_id FK
        varchar customer_name
        varchar customer_phone
        decimal subtotal
        decimal tax_rate
        decimal tax_amount
        decimal discount
        decimal total_amount
        varchar payment_method "cash | upi"
        varchar payment_status
        decimal cash_received
        decimal change_returned
        timestamp created_at
    }

    BILL_ITEMS {
        int id PK
        int bill_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal total
    }

    STOCK_ALERTS {
        int id PK
        int product_id FK
        varchar alert_type
        varchar severity "critical | warning | info"
        text message
        boolean acknowledged
        int acknowledged_by FK
        timestamp created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        varchar title
        text message
        varchar type "info | warning | success | error"
        boolean is_read
        timestamp created_at
    }

    STORE_SETTINGS {
        int id PK
        varchar store_name
        text store_address
        varchar store_phone
        decimal tax_rate
        text receipt_footer
        text upi_qr_image
        timestamp updated_at
    }

    USERS ||--o{ BILLS : "creates"
    USERS ||--o{ NOTIFICATIONS : "receives"
    VENDORS ||--o{ PRODUCTS : "supplies"
    PRODUCTS ||--o{ BILL_ITEMS : "included_in"
    PRODUCTS ||--o{ STOCK_ALERTS : "triggers"
    BILLS ||--|{ BILL_ITEMS : "contains"
    USERS ||--o{ STOCK_ALERTS : "acknowledges"`

/* ─────────────────────────────────────────────────────────────
   2. CLASS DIAGRAM  (Backend SQLAlchemy models)
   ───────────────────────────────────────────────────────────── */
const classDiagram = `classDiagram
    class User {
        +int id
        +str name
        +str email
        +str password_hash
        +str role
        +bool is_active
        +datetime created_at
        +List~Bill~ bills
        +List~Notification~ notifications
    }

    class Vendor {
        +int id
        +str name
        +str contact_person
        +str email
        +str phone
        +str address
        +float performance_rating
        +int total_orders
        +int on_time_delivery
        +bool is_active
        +List~Product~ products
    }

    class Product {
        +int id
        +str name
        +str sku
        +str category
        +float price
        +float cost_price
        +int current_stock
        +int threshold
        +str unit
        +int vendor_id
        +bool is_active
        +Vendor vendor
        +List~BillItem~ bill_items
        +List~StockAlert~ stock_alerts
    }

    class Bill {
        +int id
        +str bill_number
        +int biller_id
        +str customer_name
        +str customer_phone
        +float subtotal
        +float tax_rate
        +float tax_amount
        +float discount
        +float total_amount
        +str payment_method
        +str payment_status
        +float cash_received
        +float change_returned
        +datetime created_at
        +User biller
        +List~BillItem~ items
    }

    class BillItem {
        +int id
        +int bill_id
        +int product_id
        +int quantity
        +float unit_price
        +float total
        +Bill bill
        +Product product
    }

    class StockAlert {
        +int id
        +int product_id
        +str alert_type
        +str severity
        +str message
        +bool acknowledged
        +int acknowledged_by
        +datetime created_at
        +Product product
    }

    class Notification {
        +int id
        +int user_id
        +str title
        +str message
        +str type
        +bool is_read
        +datetime created_at
        +User user
    }

    class StoreSettings {
        +int id
        +str store_name
        +str store_address
        +str store_phone
        +float tax_rate
        +str receipt_footer
        +str upi_qr_image
        +datetime updated_at
    }

    class ForecastService {
        -dict _model_cache
        +get_daily_sales(db, product_id) DataFrame
        +train_prophet(df) tuple~Prophet, dict~
        +get_product_forecast(db, product_id, days, retrain) dict
        +get_category_forecasts(db) list
        +get_forecast_accuracy(db) dict
    }

    class CRUDOperations {
        +get_user_by_email(db, email) User
        +get_users(db, role) list
        +get_vendors(db) list
        +create_vendor(db, data) Vendor
        +update_vendor(db, id, data) Vendor
        +get_products(db) list
        +create_product(db, data) Product
        +update_product(db, id, data) Product
        +get_bills(db, biller_id) list
        +create_bill(db, data) Bill
        +get_stock_alerts(db, severity) list
        +acknowledge_alert(db, id, user_id) StockAlert
        +auto_generate_alerts(db) list
        +get_sales_chart_data(db, days) list
    }

    User "1" --> "*" Bill : creates
    User "1" --> "*" Notification : receives
    Vendor "1" --> "*" Product : supplies
    Product "1" --> "*" BillItem : sold_as
    Product "1" --> "*" StockAlert : triggers
    Bill "1" --> "*" BillItem : contains
    ForecastService ..> Product : queries
    ForecastService ..> BillItem : aggregates
    CRUDOperations ..> User : manages
    CRUDOperations ..> Vendor : manages
    CRUDOperations ..> Product : manages
    CRUDOperations ..> Bill : manages`

/* ─────────────────────────────────────────────────────────────
   3. SEQUENCE DIAGRAM  (Billing Flow)
   ───────────────────────────────────────────────────────────── */
const sequenceDiagram = `sequenceDiagram
    actor Biller
    participant UI as Next.js Frontend
    participant API as Next.js API Route
    participant FastAPI as FastAPI Backend
    participant DB as PostgreSQL

    Biller->>UI: Search product
    UI->>API: GET /api/products?search=...
    API->>FastAPI: GET /api/products
    FastAPI->>DB: SELECT * FROM products
    DB-->>FastAPI: Product rows
    FastAPI-->>API: JSON products
    API-->>UI: Product list
    UI-->>Biller: Show autocomplete results

    Biller->>UI: Add items to cart
    Note over UI: Cart managed in React state

    Biller->>UI: Set customer info + payment method

    alt Cash Payment
        Biller->>UI: Enter cash received
        Note over UI: Calculate change = cash - total
    else UPI Payment
        UI-->>Biller: Display UPI QR Code
        Biller->>UI: Confirm payment received
    end

    Biller->>UI: Click "Generate Bill"
    UI->>API: POST /api/bills
    API->>FastAPI: POST /api/bills
    FastAPI->>DB: BEGIN TRANSACTION
    FastAPI->>DB: INSERT INTO bills
    FastAPI->>DB: INSERT INTO bill_items (each item)
    FastAPI->>DB: UPDATE products SET current_stock -= qty
    FastAPI->>DB: COMMIT
    DB-->>FastAPI: Bill with items
    FastAPI-->>API: BillOut JSON
    API-->>UI: Bill response
    UI-->>Biller: Show receipt / print dialog

    Note over FastAPI,DB: Auto stock alert check
    FastAPI->>DB: SELECT products WHERE stock <= threshold
    FastAPI->>DB: INSERT INTO stock_alerts (if new)`

/* ─────────────────────────────────────────────────────────────
   4. SEQUENCE DIAGRAM  (Prophet Forecasting)
   ───────────────────────────────────────────────────────────── */
const forecastSequence = `sequenceDiagram
    actor Manager
    participant UI as Next.js Frontend
    participant FastAPI as FastAPI Backend
    participant Service as ForecastService
    participant Prophet as Prophet Model
    participant DB as PostgreSQL
    participant Cache as Model Cache

    Manager->>UI: Open Demand Forecast page
    UI->>FastAPI: GET /api/forecast/products
    FastAPI->>DB: SELECT id, name, category FROM products
    DB-->>FastAPI: Product list
    FastAPI-->>UI: Product dropdown options

    Manager->>UI: Select product
    UI->>FastAPI: GET /api/forecast/product/{id}?days=14

    FastAPI->>Service: get_product_forecast(db, product_id)
    Service->>Cache: Check model cache
    
    alt Model cached and fresh (< 6 hours)
        Cache-->>Service: Return cached model
    else Not cached or stale
        Service->>DB: SELECT date(created_at), SUM(quantity) FROM bill_items JOIN bills GROUP BY date
        DB-->>Service: 60 days of daily sales data
        Service->>Service: Fill missing dates with 0
        Service->>Service: Split: train (53 days) / test (7 days)
        Service->>Prophet: Prophet().fit(train_data)
        Prophet-->>Service: Fitted model
        Service->>Prophet: model.predict(test_period)
        Prophet-->>Service: Test predictions
        Service->>Service: Calculate MAPE, RMSE, R-squared
        Service->>Cache: Store model + metrics
    end

    Service->>Prophet: make_future_dataframe(periods=14)
    Prophet-->>Service: Future dates
    Service->>Prophet: model.predict(future)
    Prophet-->>Service: yhat, yhat_lower, yhat_upper
    Service->>Service: Merge actuals with predictions
    Service-->>FastAPI: Forecast data + metrics

    FastAPI-->>UI: JSON response
    UI-->>Manager: Render chart with confidence bands

    Note over UI: Blue line = actual sales
    Note over UI: Orange line = Prophet predictions
    Note over UI: Shaded area = 80% confidence interval

    opt Manager clicks "Retrain"
        Manager->>UI: Click Retrain button
        UI->>FastAPI: GET /api/forecast/product/{id}?retrain=true
        FastAPI->>Service: get_product_forecast(force_retrain=true)
        Service->>Cache: Invalidate cache
        Note over Service,Prophet: Full retraining cycle
        Service-->>FastAPI: Fresh forecast
        FastAPI-->>UI: Updated predictions
    end`

/* ─────────────────────────────────────────────────────────────
   5. COMPONENT DIAGRAM  (System Architecture)
   ───────────────────────────────────────────────────────────── */
const componentDiagram = `graph TB
    subgraph "Browser"
        LOGIN["Login Page<br/>(auth)/login"]
        MD["Manager Dashboard<br/>/manager"]
        BD["Biller Dashboard<br/>/biller"]
        INV["Inventory Page<br/>/inventory"]
        BILL["Billing Page<br/>/biller/billing"]
        TX["Transactions<br/>/biller/transactions"]
        PAY["Payments<br/>/biller/payments"]
        ALERTS["Stock Alerts<br/>/manager/stock-alerts"]
        FORECAST["Demand Forecast<br/>/manager/demand-forecast"]
        VENDORS["Vendors<br/>/manager/vendors"]
        VA["Vendor Analytics<br/>/manager/vendor-analytics"]
        MTX["Manager Transactions<br/>/manager/transactions"]
        BILLERS["Billers Mgmt<br/>/manager/billers"]
        REPORTS["Reports<br/>/manager/reports"]
        SETTINGS["Settings<br/>/manager/settings"]
        PROFILE["Profile<br/>/profile"]
    end

    subgraph "Next.js Server (Port 3000)"
        LAYOUT["Dashboard Layout<br/>+ SidebarProvider"]
        AUTH_CTX["AuthContext<br/>+ useAuth Hook"]
        API_CLIENT["API Client<br/>lib/api-client.ts"]
        MOCK["Mock Data Fallback<br/>lib/mock-data.ts"]
        AUTH_API["API Routes<br/>/api/auth/*"]
        AUTH_LIB["Auth Library<br/>lib/auth.ts"]
    end

    subgraph "FastAPI Server (Port 8000)"
        MAIN["FastAPI App<br/>main.py"]
        AUTH_R["Auth Routes<br/>/api/auth/login, /me"]
        PROD_R["Product Routes<br/>/api/products/*"]
        BILL_R["Bill Routes<br/>/api/bills/*"]
        VEND_R["Vendor Routes<br/>/api/vendors/*"]
        ALERT_R["Alert Routes<br/>/api/alerts/*"]
        SET_R["Settings Routes<br/>/api/settings/*"]
        FORE_R["Forecast Routes<br/>/api/forecast/*"]
        CRUD["CRUD Layer<br/>crud.py"]
        FORE_SVC["ForecastService<br/>forecast_service.py"]
        MODELS["SQLAlchemy Models<br/>models.py"]
        PROPHET["Prophet ML<br/>Model Training"]
        M_CACHE["Model Cache<br/>(In-Memory, 6h TTL)"]
    end

    subgraph "PostgreSQL (Port 5432)"
        USERS_T[("users")]
        VENDORS_T[("vendors")]
        PRODUCTS_T[("products")]
        BILLS_T[("bills")]
        ITEMS_T[("bill_items")]
        ALERTS_T[("stock_alerts")]
        NOTIF_T[("notifications")]
        STORE_T[("store_settings")]
    end

    LOGIN --> AUTH_CTX
    MD --> LAYOUT
    BD --> LAYOUT
    LAYOUT --> AUTH_CTX
    AUTH_CTX --> AUTH_API
    AUTH_API --> AUTH_LIB

    FORECAST --> API_CLIENT
    API_CLIENT --> MAIN
    API_CLIENT -.-> MOCK

    MAIN --> AUTH_R
    MAIN --> PROD_R
    MAIN --> BILL_R
    MAIN --> VEND_R
    MAIN --> ALERT_R
    MAIN --> SET_R
    MAIN --> FORE_R

    AUTH_R --> CRUD
    PROD_R --> CRUD
    BILL_R --> CRUD
    VEND_R --> CRUD
    ALERT_R --> CRUD
    SET_R --> CRUD
    FORE_R --> FORE_SVC

    CRUD --> MODELS
    FORE_SVC --> MODELS
    FORE_SVC --> PROPHET
    FORE_SVC --> M_CACHE

    MODELS --> USERS_T
    MODELS --> VENDORS_T
    MODELS --> PRODUCTS_T
    MODELS --> BILLS_T
    MODELS --> ITEMS_T
    MODELS --> ALERTS_T
    MODELS --> NOTIF_T
    MODELS --> STORE_T

    style LOGIN fill:#1E40AF,color:#fff
    style MAIN fill:#059669,color:#fff
    style PROPHET fill:#D97706,color:#fff
    style USERS_T fill:#6366F1,color:#fff
    style PRODUCTS_T fill:#6366F1,color:#fff
    style BILLS_T fill:#6366F1,color:#fff
    style ITEMS_T fill:#6366F1,color:#fff`

/* ─────────────────────────────────────────────────────────────
   6. USE CASE DIAGRAM
   ───────────────────────────────────────────────────────────── */
const useCaseDiagram = `graph LR
    subgraph Actors
        MGR((Manager))
        BLR((Biller))
    end

    subgraph "Authentication"
        UC1["Login / Logout"]
        UC2["View Profile"]
        UC3["Change Password"]
    end

    subgraph "Inventory Management"
        UC4["View Products"]
        UC5["Add / Edit Product"]
        UC6["Delete Product"]
        UC7["View Stock Levels"]
    end

    subgraph "Vendor Management"
        UC8["View Vendors"]
        UC9["Add / Edit Vendor"]
        UC10["View Vendor Analytics"]
    end

    subgraph "Billing"
        UC11["Create New Bill"]
        UC12["Search Products"]
        UC13["Process Cash Payment"]
        UC14["Process UPI Payment"]
        UC15["Print Receipt"]
    end

    subgraph "Transactions"
        UC16["View My Transactions"]
        UC17["View All Transactions"]
        UC18["Export to CSV"]
    end

    subgraph "Alerts & Monitoring"
        UC19["View Stock Alerts"]
        UC20["Acknowledge Alert"]
        UC21["View Notifications"]
    end

    subgraph "Forecasting (Prophet)"
        UC22["View Product Forecast"]
        UC23["View Category Forecasts"]
        UC24["Retrain Models"]
        UC25["View Accuracy Metrics"]
    end

    subgraph "Reports & Settings"
        UC26["Sales Reports"]
        UC27["Top Products Report"]
        UC28["Biller Performance"]
        UC29["Configure Store"]
        UC30["Upload UPI QR Code"]
        UC31["Manage Billers"]
    end

    MGR --> UC1
    MGR --> UC2
    MGR --> UC3
    MGR --> UC4
    MGR --> UC5
    MGR --> UC6
    MGR --> UC7
    MGR --> UC8
    MGR --> UC9
    MGR --> UC10
    MGR --> UC17
    MGR --> UC18
    MGR --> UC19
    MGR --> UC20
    MGR --> UC21
    MGR --> UC22
    MGR --> UC23
    MGR --> UC24
    MGR --> UC25
    MGR --> UC26
    MGR --> UC27
    MGR --> UC28
    MGR --> UC29
    MGR --> UC30
    MGR --> UC31

    BLR --> UC1
    BLR --> UC2
    BLR --> UC3
    BLR --> UC4
    BLR --> UC7
    BLR --> UC11
    BLR --> UC12
    BLR --> UC13
    BLR --> UC14
    BLR --> UC15
    BLR --> UC16
    BLR --> UC18
    BLR --> UC21

    style MGR fill:#1E40AF,color:#fff
    style BLR fill:#059669,color:#fff`

/* ─────────────────────────────────────────────────────────────
   7. ACTIVITY DIAGRAM  (Bill Creation Flow)
   ───────────────────────────────────────────────────────────── */
const activityDiagram = `graph TD
    START(("Start")) --> A["Biller opens Billing page"]
    A --> B["Search & select products"]
    B --> C["Add items to cart"]
    C --> D{"More items?"}
    D -- Yes --> B
    D -- No --> E["Enter customer details"]
    E --> F["System calculates subtotal + tax"]
    F --> G{"Select payment method"}

    G -- Cash --> H["Enter cash received"]
    H --> I{"Cash >= Total?"}
    I -- No --> H
    I -- Yes --> J["Calculate change"]
    J --> K["Generate Bill"]

    G -- UPI --> L["Display UPI QR Code"]
    L --> M["Customer scans & pays"]
    M --> N["Biller confirms payment"]
    N --> K

    K --> O["INSERT bill into database"]
    O --> P["INSERT bill_items"]
    P --> Q["UPDATE product stock levels"]
    Q --> R{"Any stock below threshold?"}
    R -- Yes --> S["Create stock alert"]
    S --> T["Show receipt"]
    R -- No --> T
    T --> U["Biller prints receipt"]
    U --> STOP(("End"))

    style START fill:#1E40AF,color:#fff
    style STOP fill:#1E40AF,color:#fff
    style K fill:#059669,color:#fff
    style S fill:#D97706,color:#fff`

/* ─────────────────────────────────────────────────────────────
   8. DEPLOYMENT DIAGRAM
   ───────────────────────────────────────────────────────────── */
const deploymentDiagram = `graph TB
    subgraph "Client Machine (Browser)"
        BROWSER["Web Browser<br/>Chrome / Safari / Firefox"]
    end

    subgraph "macOS Local Machine"
        subgraph "Terminal 1 - Frontend (Port 3000)"
            NEXTJS["Next.js 16 Dev Server<br/>pnpm dev<br/>React 19 + Tailwind v4<br/>shadcn/ui components"]
        end

        subgraph "Terminal 2 - Backend (Port 8000)"
            FASTAPI_S["FastAPI + Uvicorn<br/>uvicorn app.main:app<br/>SQLAlchemy ORM<br/>Prophet ML Models"]
        end

        subgraph "PostgreSQL (Port 5432)"
            PG["PostgreSQL 16<br/>Database: castpro<br/>8 Tables<br/>60 days sales history"]
        end

        subgraph "Python Virtual Environment"
            VENV["venv/<br/>prophet 1.1.5<br/>pandas 2.2.2<br/>scikit-learn 1.5.1<br/>bcrypt, PyJWT<br/>SQLAlchemy 2.0.35"]
        end
    end

    BROWSER -- "HTTP :3000" --> NEXTJS
    NEXTJS -- "HTTP :8000<br/>/api/*" --> FASTAPI_S
    FASTAPI_S -- "TCP :5432<br/>SQLAlchemy" --> PG
    FASTAPI_S -.-> VENV

    style BROWSER fill:#374151,color:#fff
    style NEXTJS fill:#1E40AF,color:#fff
    style FASTAPI_S fill:#059669,color:#fff
    style PG fill:#6366F1,color:#fff
    style VENV fill:#D97706,color:#fff`

const diagrams = [
  { id: "er", label: "ER Diagram", title: "Entity-Relationship Diagram", description: "Database schema showing all 8 tables, their columns, data types, and relationships.", code: erDiagram },
  { id: "class", label: "Class Diagram", title: "Class Diagram (SQLAlchemy Models)", description: "Backend ORM models with attributes, methods, and relationships. Includes ForecastService and CRUDOperations.", code: classDiagram },
  { id: "billing-seq", label: "Billing Flow", title: "Sequence Diagram -- Billing Process", description: "End-to-end billing flow: product search, cart, cash/UPI payment, bill creation, stock deduction, and alert generation.", code: sequenceDiagram },
  { id: "forecast-seq", label: "Forecast Flow", title: "Sequence Diagram -- Prophet Forecasting", description: "How demand forecasting works: data extraction, Prophet model training, caching, prediction, and retraining.", code: forecastSequence },
  { id: "component", label: "Architecture", title: "System Architecture Diagram", description: "Full system showing Next.js frontend pages, FastAPI backend routes, services, and PostgreSQL database tables.", code: componentDiagram },
  { id: "usecase", label: "Use Cases", title: "Use Case Diagram", description: "All 31 use cases mapped to Manager and Biller actor roles.", code: useCaseDiagram },
  { id: "activity", label: "Activity Flow", title: "Activity Diagram -- Bill Creation", description: "Step-by-step activity flow for creating a bill with cash or UPI payment.", code: activityDiagram },
  { id: "deployment", label: "Deployment", title: "Deployment Diagram", description: "Local development setup showing all services, ports, and dependencies.", code: deploymentDiagram },
]

export default function UmlDiagramsPage() {
  const [activeTab, setActiveTab] = useState("er")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">UML Diagrams</h1>
        <p className="text-muted-foreground mt-1">
          Complete system documentation with 8 UML diagrams. Copy the Mermaid code and paste into{" "}
          <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-primary underline">mermaid.live</a> to render visually.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {diagrams.map((d) => (
            <TabsTrigger key={d.id} value={d.id} className="text-xs">{d.label}</TabsTrigger>
          ))}
        </TabsList>

        {diagrams.map((d) => (
          <TabsContent key={d.id} value={d.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-foreground">{d.title}</CardTitle>
                    <CardDescription>{d.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Mermaid</Badge>
                    <CopyButton text={d.code} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-lg border border-border bg-muted/50 p-4 text-sm font-mono text-foreground leading-relaxed whitespace-pre max-h-[600px]">
                  {d.code}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">How to Render These Diagrams</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Option 1 -- Mermaid Live Editor:</strong> Go to <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-primary underline">mermaid.live</a>, paste any diagram code, and it renders instantly. You can export as SVG or PNG.</p>
          <p><strong className="text-foreground">Option 2 -- VS Code:</strong> Install the "Mermaid Markdown Syntax Highlighting" extension. Create a <code className="bg-muted px-1 rounded">.md</code> file, wrap the code in <code className="bg-muted px-1 rounded">{"```mermaid ... ```"}</code>, and preview it.</p>
          <p><strong className="text-foreground">Option 3 -- GitHub:</strong> GitHub natively renders Mermaid in Markdown files. Just commit a <code className="bg-muted px-1 rounded">.md</code> file with the Mermaid code blocks.</p>
          <p><strong className="text-foreground">Option 4 -- Draw.io / Lucidchart:</strong> Import the diagram structure manually into your preferred diagramming tool for further customization.</p>
        </CardContent>
      </Card>
    </div>
  )
}

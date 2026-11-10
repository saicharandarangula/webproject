/**
 * TrackQR – QR-Based Device and Stock Management System
 * Vanilla JavaScript Frontend Architecture
 * Separated Modules: Device Management & Stock Management
 */

// =============================================================================
// 1. STORAGE SERVICE (Data Layer & LocalStorage Abstraction)
// =============================================================================
const StorageService = (function () {
    const STORAGE_KEYS = {
        INIT: "trackqr_initialized",
        DEVICES: "trackqr_devices",
        STOCK: "trackqr_stock",
        STOCK_TXNS: "trackqr_stock_transactions",
        MAINTENANCE: "trackqr_maintenance",
        CATEGORIES: "trackqr_categories",
        LOGS: "trackqr_activity_logs",
        SETTINGS: "trackqr_settings"
    };

    const DEFAULT_SETTINGS = {
        orgName: "GlobalTech Industries",
        currency: "$",
        defaultLowStock: 10,
        soundEnabled: true,
        autoOpenModal: false,
        scanCooldown: 2500,
        theme: "light"
    };

    // Separate Taxonomies for Devices and Stock Items
    const DEFAULT_CATEGORIES = [
        // Device Categories
        { id: "CAT-DEV-1", type: "device", name: "Laptops & Notebooks", prefix: "LAP", desc: "Portable computers and mobile workstations" },
        { id: "CAT-DEV-2", type: "device", name: "Monitors & Displays", prefix: "MON", desc: "Color-accurate 4K screens, curved panels, TV displays" },
        { id: "CAT-DEV-3", type: "device", name: "Projectors & AV", prefix: "PRJ", desc: "Conference presentation equipment and audio amplifiers" },
        { id: "CAT-DEV-4", type: "device", name: "Printers & Scanners", prefix: "PRN", desc: "Multifunction network printers, label printers, scanners" },
        { id: "CAT-DEV-5", type: "device", name: "Desktop Workstations", prefix: "DSK", desc: "Tower computers, lab testing rigs, rendering engines" },

        // Stock Categories
        { id: "CAT-STK-1", type: "stock", name: "Cables & Connectors", prefix: "CAB", desc: "HDMI, DisplayPort, USB-C, Cat6 patch cables" },
        { id: "CAT-STK-2", type: "stock", name: "Keyboards & Mice", prefix: "PER", desc: "Wireless mice, ergonomic mechanical keyboards, trackpads" },
        { id: "CAT-STK-3", type: "stock", name: "Adapters & Hubs", prefix: "ADP", desc: "Multiport dongles, USB hubs, power delivery adapters" },
        { id: "CAT-STK-4", type: "stock", name: "Power Supplies & Batteries", prefix: "PWR", desc: "Laptop chargers, surge protectors, backup UPS batteries" },
        { id: "CAT-STK-5", type: "stock", name: "Office Consumables", prefix: "CON", desc: "Printer toner, label rolls, thermal ribbons, cleaning kits" }
    ];

    // Seed Devices (Individually Serialized Assets)
    const DEFAULT_DEVICES = [
        {
            id: "DEV-LAP-001",
            name: "MacBook Pro 16 M2 Max",
            category: "Laptops & Notebooks",
            serial: "C02XYZ123ABC",
            location: "Floor 3 - Engineering Lab",
            assignedTo: "Sarah Jenkins",
            department: "Engineering",
            purchaseDate: "2024-03-15",
            cost: 2499,
            condition: "Good",
            status: "In Use",
            notes: "Configured with 32GB RAM, 1TB SSD. Assigned for iOS deployment."
        },
        {
            id: "DEV-LAP-002",
            name: "Dell XPS 15 9530",
            category: "Laptops & Notebooks",
            serial: "DL-987412X",
            location: "IT Storage Room B",
            assignedTo: "",
            department: "IT Infrastructure",
            purchaseDate: "2024-05-10",
            cost: 1899,
            condition: "New",
            status: "Available",
            notes: "Freshly re-imaged with Windows 11 Enterprise. Ready for new hire issue."
        },
        {
            id: "DEV-MON-001",
            name: "Dell UltraSharp 27 4K (U2720Q)",
            category: "Monitors & Displays",
            serial: "CN-0U2720-991",
            location: "Design Studio - Desk 4",
            assignedTo: "Marcus Chen",
            department: "Product Design",
            purchaseDate: "2023-11-20",
            cost: 580,
            condition: "Good",
            status: "In Use",
            notes: "Color calibrated 99% DCI-P3 for UI/UX product design team."
        },
        {
            id: "DEV-MON-002",
            name: "LG 34 Curved Ultrawide (34WN80C)",
            category: "Monitors & Displays",
            serial: "LG34WP-4421",
            location: "Finance Office 202",
            assignedTo: "Facilities Support",
            department: "Finance",
            purchaseDate: "2024-01-18",
            cost: 720,
            condition: "Needs Repair",
            status: "Under Maintenance",
            notes: "DisplayPort input flickers intermittently. Diagnostic in progress."
        },
        {
            id: "DEV-PRJ-001",
            name: "Epson PowerLite 2250U 5000L",
            category: "Projectors & AV",
            serial: "EP-PL2250-801",
            location: "Conference Room Alpha",
            assignedTo: "Facilities Team",
            department: "Operations",
            purchaseDate: "2023-08-14",
            cost: 1250,
            condition: "Good",
            status: "In Use",
            notes: "Ceiling mounted projector with wireless HDMI presentation gateway."
        },
        {
            id: "DEV-PRJ-002",
            name: "BenQ Wireless Meeting Projector",
            category: "Projectors & AV",
            serial: "BQ-MW535A",
            location: "AV Storage Locker 2",
            assignedTo: "",
            department: "Operations",
            purchaseDate: "2024-02-01",
            cost: 890,
            condition: "Good",
            status: "Available",
            notes: "Portable presentation projector equipped with travel carry case."
        },
        {
            id: "DEV-PRN-001",
            name: "HP LaserJet Enterprise MFP M528",
            category: "Printers & Scanners",
            serial: "HP-MFP528-552",
            location: "Floor 2 Copy Center",
            assignedTo: "Shared Office",
            department: "General Admin",
            purchaseDate: "2023-06-11",
            cost: 1650,
            condition: "Fair",
            status: "In Use",
            notes: "High capacity departmental laser printer and document scanner."
        },
        {
            id: "DEV-DSK-001",
            name: "Lenovo ThinkStation P360 Tower",
            category: "Desktop Workstations",
            serial: "LEN-P360-9941",
            location: "Server Room Testing Rig 1",
            assignedTo: "DevOps Team",
            department: "Engineering",
            purchaseDate: "2023-10-04",
            cost: 2100,
            condition: "Good",
            status: "In Use",
            notes: "Configured with RTX A4000 GPU for automated build runner pipelines."
        }
    ];

    // Seed Stock Items (Quantity-Based Consumables & Accessories)
    const DEFAULT_STOCK = [
        {
            id: "STK-CAB-001",
            name: "Cat6 Ethernet Patch Cable 3m (Snagless)",
            category: "Cables & Connectors",
            quantity: 45,
            minLevel: 15,
            unit: "pcs",
            location: "Warehouse Bin B-14",
            unitPrice: 4.50,
            supplier: "Monoprice Direct",
            notes: "Molded RJ45 connectors, high bandwidth gigabit rated."
        },
        {
            id: "STK-CAB-002",
            name: "High-Speed HDMI 2.1 4K Cable 2m",
            category: "Cables & Connectors",
            quantity: 8, // Low Stock Alert (<= 10)
            minLevel: 10,
            unit: "pcs",
            location: "Warehouse Bin B-16",
            unitPrice: 9.00,
            supplier: "Anker Official",
            notes: "Braided 48Gbps ultra high speed cable."
        },
        {
            id: "STK-PER-001",
            name: "Logitech M185 Wireless Optical Mouse",
            category: "Keyboards & Mice",
            quantity: 24,
            minLevel: 8,
            unit: "pcs",
            location: "IT Supply Closet Shelf 1",
            unitPrice: 14.50,
            supplier: "Logitech Commercial",
            notes: "Includes AA battery and nano USB receiver."
        },
        {
            id: "STK-PER-002",
            name: "Dell QuietKey USB Wired Keyboard (KB216)",
            category: "Keyboards & Mice",
            quantity: 0, // Out of Stock Alert (= 0)
            minLevel: 10,
            unit: "pcs",
            location: "IT Supply Closet Shelf 2",
            unitPrice: 18.00,
            supplier: "Dell Direct",
            notes: "Standard full size layout with numeric keypad."
        },
        {
            id: "STK-ADP-001",
            name: "USB-C to Dual HDMI 4K Display Adapter",
            category: "Adapters & Hubs",
            quantity: 6, // Low Stock Alert (<= 8)
            minLevel: 8,
            unit: "pcs",
            location: "Accessories Cabinet 3",
            unitPrice: 32.00,
            supplier: "Satechi Partner",
            notes: "Supports dual 4K 60Hz monitor output from modern laptops."
        },
        {
            id: "STK-PWR-001",
            name: "Universal 100W USB-C GaN Laptop Charger",
            category: "Power Supplies & Batteries",
            quantity: 14,
            minLevel: 5,
            unit: "pcs",
            location: "IT Supply Closet Shelf 3",
            unitPrice: 42.00,
            supplier: "Baseus Tech",
            notes: "Power Delivery 3.0 certified fast charger with 2m cable."
        },
        {
            id: "STK-PWR-002",
            name: "Heavy-Duty 6-Outlet Surge Protector 3m",
            category: "Power Supplies & Batteries",
            quantity: 19,
            minLevel: 6,
            unit: "pcs",
            location: "Warehouse Bin C-02",
            unitPrice: 16.50,
            supplier: "APC Schneider",
            notes: "1080 Joules surge suppression rating with safety shutters."
        },
        {
            id: "STK-CON-001",
            name: "Dymo Thermal Asset Barcode Label Rolls",
            category: "Office Consumables",
            quantity: 12,
            minLevel: 4,
            unit: "rolls",
            location: "Labeling Station Drawer",
            unitPrice: 11.20,
            supplier: "Dymo Direct",
            notes: "Self-adhesive durable synthetic tags, 250 labels per roll."
        }
    ];

    // Seed Stock Transactions (Immutable Movement History)
    const DEFAULT_STOCK_TXNS = [
        {
            id: "TXN-001",
            stockId: "STK-CAB-001",
            stockName: "Cat6 Ethernet Patch Cable 3m (Snagless)",
            type: "Stock-In",
            quantity: 50,
            previousQty: 0,
            newQty: 50,
            reference: "Initial Bulk Purchase PO-8801",
            performedBy: "Admin",
            timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
            notes: "Restocked into Warehouse Bin B-14"
        },
        {
            id: "TXN-002",
            stockId: "STK-CAB-001",
            stockName: "Cat6 Ethernet Patch Cable 3m (Snagless)",
            type: "Stock-Out",
            quantity: 5,
            previousQty: 50,
            newQty: 45,
            reference: "Floor 3 Workstation Cabling Setup",
            performedBy: "Admin",
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            notes: "Issued to Network Operations Team"
        },
        {
            id: "TXN-003",
            stockId: "STK-PER-002",
            stockName: "Dell QuietKey USB Wired Keyboard (KB216)",
            type: "Stock-Out",
            quantity: 10,
            previousQty: 10,
            newQty: 0,
            reference: "Computer Lab 4 Upgrade Project",
            performedBy: "Admin",
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            notes: "Item now out of stock; reorder pending."
        },
        {
            id: "TXN-004",
            stockId: "STK-ADP-001",
            stockName: "USB-C to Dual HDMI 4K Display Adapter",
            type: "Stock Return",
            quantity: 2,
            previousQty: 4,
            newQty: 6,
            reference: "Returned by Marketing Team",
            performedBy: "Admin",
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
            notes: "Items inspected and returned to storage in pristine condition."
        }
    ];

    // Seed Device Maintenance Tickets
    const DEFAULT_MAINTENANCE = [
        {
            id: "MNT-001",
            deviceId: "DEV-MON-002",
            title: "DisplayPort Flickering & Inverter Repair",
            type: "Repair",
            scheduledDate: "2026-10-30",
            completedDate: "",
            status: "In Progress",
            cost: 85,
            technician: "Apex Display Repair Services",
            notes: "Investigating power board voltage fluctuations and capacitor wear."
        },
        {
            id: "MNT-002",
            deviceId: "DEV-PRJ-001",
            title: "Projector Lamp Replacement & Optical Cleaning",
            type: "Preventive",
            scheduledDate: "2026-09-15",
            completedDate: "2026-09-16",
            status: "Completed",
            cost: 180,
            technician: "In-House AV Team",
            notes: "Replaced lamp bulb after 3,000 runtime hours. Air intake filter washed."
        },
        {
            id: "MNT-003",
            deviceId: "DEV-LAP-002",
            title: "Annual Thermal Paste & Battery Health Check",
            type: "Inspection",
            scheduledDate: "2026-11-10",
            completedDate: "",
            status: "Scheduled",
            cost: 50,
            technician: "IT Helpdesk",
            notes: "Standard bi-annual hardware checkup prior to re-assignment."
        }
    ];

    // Seed Activity Logs
    const DEFAULT_LOGS = [
        {
            id: "LOG-001",
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            category: "QR Scanned",
            type: "QR Scanned",
            title: "QR Tag Scanned",
            details: "Scanned device DEV-LAP-001 via camera scanner.",
            user: "Admin"
        },
        {
            id: "LOG-002",
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
            category: "Stock",
            type: "Stock Return",
            title: "Stock Return Processed",
            details: "Returned 2 units of USB-C to Dual HDMI 4K Display Adapter (STK-ADP-001).",
            user: "Admin"
        },
        {
            id: "LOG-003",
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            category: "Stock",
            type: "Stock-Out",
            title: "Stock-Out Issued",
            details: "Issued 10 units of Dell Keyboard (STK-PER-002) for Computer Lab 4.",
            user: "Admin"
        },
        {
            id: "LOG-004",
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            category: "Maintenance",
            type: "Maintenance",
            title: "Maintenance Scheduled",
            details: "Scheduled repair ticket MNT-001 for DEV-MON-002.",
            user: "Admin"
        },
        {
            id: "LOG-005",
            timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
            category: "Device",
            type: "Device Created",
            title: "New Device Registered",
            details: "Registered MacBook Pro 16 (DEV-LAP-001) in Engineering.",
            user: "Admin"
        }
    ];

    // Persistence Rule: Initialize sample data ONLY on the first run; never overwrite on refresh
    function init() {
        const isInitialized = localStorage.getItem(STORAGE_KEYS.INIT);
        if (!isInitialized) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
            localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(DEFAULT_DEVICES));
            localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(DEFAULT_STOCK));
            localStorage.setItem(STORAGE_KEYS.STOCK_TXNS, JSON.stringify(DEFAULT_STOCK_TXNS));
            localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(DEFAULT_MAINTENANCE));
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_LOGS));
            localStorage.setItem(STORAGE_KEYS.INIT, "true");
        }
    }

    init();

    return {
        // --- 1. DEVICES ---
        getDevices: function () {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEVICES)) || [];
            } catch (e) {
                return [];
            }
        },

        getDeviceById: function (id) {
            if (!id) return null;
            const searchId = id.trim().toUpperCase();
            const list = this.getDevices();
            return list.find(d => d.id.toUpperCase() === searchId) || null;
        },

        saveDevice: function (device) {
            const list = this.getDevices();
            const index = list.findIndex(d => d.id.toUpperCase() === device.id.toUpperCase());
            if (index >= 0) {
                list[index] = Object.assign({}, list[index], device);
                this.addLog("Device", "Device Updated", `Updated details for device ${device.name} (${device.id}).`);
            } else {
                list.unshift(device);
                this.addLog("Device", "Device Registered", `Registered new device ${device.name} (${device.id}) in ${device.category}.`);
            }
            localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(list));
            return device;
        },

        deleteDevice: function (id) {
            let list = this.getDevices();
            const dev = list.find(d => d.id.toUpperCase() === id.toUpperCase());
            list = list.filter(d => d.id.toUpperCase() !== id.toUpperCase());
            localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(list));

            // Also clean up any maintenance associated with this device
            let maintList = this.getMaintenance();
            maintList = maintList.filter(m => m.deviceId.toUpperCase() !== id.toUpperCase());
            localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(maintList));

            if (dev) {
                this.addLog("Device", "Device Deleted", `Deleted device ${dev.name} (${dev.id}) and removed its maintenance tickets.`);
            }
            return true;
        },

        updateDeviceStatus: function (id, newStatus) {
            const dev = this.getDeviceById(id);
            if (!dev) return null;
            const oldStatus = dev.status;
            dev.status = newStatus;
            this.saveDevice(dev);
            this.addLog("Device", "Device Status Changed", `Device ${dev.name} (${dev.id}) status transitioned from "${oldStatus}" to "${newStatus}".`);
            return dev;
        },

        // --- 2. STOCK MANAGEMENT ---
        getStock: function () {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK)) || [];
            } catch (e) {
                return [];
            }
        },

        getStockById: function (id) {
            if (!id) return null;
            const searchId = id.trim().toUpperCase();
            const list = this.getStock();
            return list.find(s => s.id.toUpperCase() === searchId) || null;
        },

        saveStock: function (item) {
            const list = this.getStock();
            const index = list.findIndex(s => s.id.toUpperCase() === item.id.toUpperCase());
            if (index >= 0) {
                list[index] = Object.assign({}, list[index], item);
                this.addLog("Stock", "Stock Item Updated", `Updated stock catalog for ${item.name} (${item.id}).`);
            } else {
                list.unshift(item);
                this.addLog("Stock", "Stock Item Created", `Added new stock item ${item.name} (${item.id}) with initial quantity ${item.quantity} ${item.unit}.`);
            }
            localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(list));
            return item;
        },

        deleteStock: function (id) {
            let list = this.getStock();
            const item = list.find(s => s.id.toUpperCase() === id.toUpperCase());
            list = list.filter(s => s.id.toUpperCase() !== id.toUpperCase());
            localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(list));

            if (item) {
                this.addLog("Stock", "Stock Item Deleted", `Deleted stock item ${item.name} (${item.id}).`);
            }
            return true;
        },

        /**
         * Real Stock Movement: Stock-In, Stock-Out, or Stock Return
         * Strictly validates that quantities never become negative or exceed available stock.
         * Appends an immutable Stock Transaction record.
         */
        performStockMovement: function (stockId, movementType, quantity, reference, notes = "") {
            const item = this.getStockById(stockId);
            if (!item) throw new Error(`Stock item "${stockId}" does not exist.`);

            const qty = parseInt(quantity, 10);
            if (isNaN(qty) || qty <= 0) throw new Error("Movement quantity must be a positive number greater than zero.");

            const prevQty = parseInt(item.quantity, 10) || 0;
            let newQty = prevQty;

            if (movementType === "Stock-In" || movementType === "Stock Return") {
                newQty = prevQty + qty;
            } else if (movementType === "Stock-Out") {
                if (prevQty < qty) {
                    throw new Error(`Cannot issue ${qty} ${item.unit}. Only ${prevQty} ${item.unit} are currently available in stock.`);
                }
                newQty = prevQty - qty;
            } else {
                throw new Error(`Invalid stock movement type: "${movementType}".`);
            }

            // Update item quantity
            item.quantity = newQty;
            this.saveStock(item);

            // Record transaction
            const txns = this.getStockTransactions();
            const newTxn = {
                id: "TXN-" + String(txns.length + 1).padStart(3, "0"),
                stockId: item.id,
                stockName: item.name,
                type: movementType,
                quantity: qty,
                previousQty: prevQty,
                newQty: newQty,
                reference: reference || "Standard Stock Movement",
                performedBy: "Admin",
                timestamp: new Date().toISOString(),
                notes: notes
            };
            txns.unshift(newTxn);
            localStorage.setItem(STORAGE_KEYS.STOCK_TXNS, JSON.stringify(txns));

            // Log activity
            this.addLog("Stock", movementType, `${movementType} of ${qty} ${item.unit} for ${item.name} (${item.id}). New balance: ${newQty} ${item.unit}.`);

            return { item: item, transaction: newTxn };
        },

        getStockTransactions: function () {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK_TXNS)) || [];
            } catch (e) {
                return [];
            }
        },

        getTransactionsByStockId: function (stockId) {
            const all = this.getStockTransactions();
            return all.filter(t => t.stockId.toUpperCase() === stockId.toUpperCase());
        },

        // --- 3. MAINTENANCE ---
        getMaintenance: function () {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) || [];
            } catch (e) {
                return [];
            }
        },

        getMaintenanceByDeviceId: function (deviceId) {
            const all = this.getMaintenance();
            return all.filter(m => m.deviceId.toUpperCase() === deviceId.toUpperCase());
        },

        saveMaintenance: function (record) {
            const list = this.getMaintenance();
            const index = list.findIndex(m => m.id === record.id);
            if (index >= 0) {
                list[index] = Object.assign({}, list[index], record);
                this.addLog("Maintenance", "Ticket Updated", `Updated maintenance ticket ${record.id} for device ${record.deviceId}.`);
            } else {
                record.id = "MNT-" + String(list.length + 1).padStart(3, "0");
                list.unshift(record);
                this.addLog("Maintenance", "Ticket Created", `Created maintenance ticket ${record.id} (${record.title}) for device ${record.deviceId}.`);
            }
            localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(list));
            return record;
        },

        deleteMaintenance: function (id) {
            let list = this.getMaintenance();
            list = list.filter(m => m.id !== id);
            localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(list));
            this.addLog("Maintenance", "Ticket Removed", `Removed maintenance record ${id}.`);
            return true;
        },

        // --- 4. CATEGORIES (DEVICE & STOCK) ---
        getCategories: function () {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || [];
            } catch (e) {
                return [];
            }
        },

        getDeviceCategories: function () {
            return this.getCategories().filter(c => c.type === "device");
        },

        getStockCategories: function () {
            return this.getCategories().filter(c => c.type === "stock");
        },

        saveCategory: function (cat) {
            const list = this.getCategories();
            const index = list.findIndex(c => c.prefix.toUpperCase() === cat.prefix.toUpperCase() && c.type === cat.type);
            if (index >= 0) {
                list[index] = Object.assign({}, list[index], cat);
                this.addLog("System", "Category Updated", `Updated ${cat.type} category ${cat.name} (${cat.prefix}).`);
            } else {
                cat.id = "CAT-" + (cat.type === "device" ? "DEV-" : "STK-") + (list.length + 1);
                list.push(cat);
                this.addLog("System", "Category Added", `Added new ${cat.type} category ${cat.name} with prefix ${cat.prefix}.`);
            }
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
            return cat;
        },

        deleteCategory: function (prefix, type) {
            if (type === "device") {
                const devs = this.getDevices();
                const cat = this.getDeviceCategories().find(c => c.prefix.toUpperCase() === prefix.toUpperCase());
                const inUse = devs.some(d => cat && d.category === cat.name);
                if (inUse) throw new Error(`Cannot delete category "${cat ? cat.name : prefix}" because devices are currently assigned to it.`);
            } else {
                const stock = this.getStock();
                const cat = this.getStockCategories().find(c => c.prefix.toUpperCase() === prefix.toUpperCase());
                const inUse = stock.some(s => cat && s.category === cat.name);
                if (inUse) throw new Error(`Cannot delete category "${cat ? cat.name : prefix}" because stock items are currently cataloged under it.`);
            }

            let list = this.getCategories();
            list = list.filter(c => !(c.prefix.toUpperCase() === prefix.toUpperCase() && c.type === type));
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
            this.addLog("System", "Category Deleted", `Deleted ${type} category with prefix ${prefix}.`);
            return true;
        },

        // --- 5. ACTIVITY LOGS ---
        getLogs: function () {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
            } catch (e) {
                return [];
            }
        },

        addLog: function (category, title, details) {
            const logs = this.getLogs();
            const newLog = {
                id: "LOG-" + Date.now().toString(36).toUpperCase(),
                timestamp: new Date().toISOString(),
                category: category || "System",
                type: title,
                title: title,
                details: details,
                user: "Admin"
            };
            logs.unshift(newLog);
            if (logs.length > 200) logs.pop();
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
            return newLog;
        },

        clearLogs: function () {
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
            return true;
        },

        // --- 6. SETTINGS ---
        getSettings: function () {
            try {
                const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
                return Object.assign({}, DEFAULT_SETTINGS, s);
            } catch (e) {
                return DEFAULT_SETTINGS;
            }
        },

        saveSettings: function (newSettings) {
            const current = this.getSettings();
            const updated = Object.assign({}, current, newSettings);
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
            this.addLog("System", "Settings Saved", "Updated system branding, thresholds, and preferences.");
            return updated;
        },

        // --- 7. BACKUP, RESTORE & RESET ---
        resetToDefaults: function () {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
            localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(DEFAULT_DEVICES));
            localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(DEFAULT_STOCK));
            localStorage.setItem(STORAGE_KEYS.STOCK_TXNS, JSON.stringify(DEFAULT_STOCK_TXNS));
            localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(DEFAULT_MAINTENANCE));
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_LOGS));
            localStorage.setItem(STORAGE_KEYS.INIT, "true");
            return true;
        },

        wipeAllData: function () {
            localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify([]));
            localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify([]));
            localStorage.setItem(STORAGE_KEYS.STOCK_TXNS, JSON.stringify([]));
            localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify([]));
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
            return true;
        },

        exportDatabaseJSON: function () {
            return JSON.stringify({
                version: "2.0",
                exportedAt: new Date().toISOString(),
                settings: this.getSettings(),
                categories: this.getCategories(),
                devices: this.getDevices(),
                stock: this.getStock(),
                stockTransactions: this.getStockTransactions(),
                maintenance: this.getMaintenance(),
                logs: this.getLogs()
            }, null, 2);
        },

        importDatabaseJSON: function (jsonString) {
            const data = JSON.parse(jsonString);
            if (!data.devices || !Array.isArray(data.devices) || !data.stock || !Array.isArray(data.stock)) {
                throw new Error("Invalid backup format: Must contain devices and stock arrays.");
            }
            if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
            if (data.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
            if (data.devices) localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(data.devices));
            if (data.stock) localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(data.stock));
            if (data.stockTransactions) localStorage.setItem(STORAGE_KEYS.STOCK_TXNS, JSON.stringify(data.stockTransactions));
            if (data.maintenance) localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(data.maintenance));
            if (data.logs) localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs));
            this.addLog("System", "Database Restored", `Restored backup: ${data.devices.length} devices, ${data.stock.length} stock items.`);
            return true;
        }
    };
})();


// =============================================================================
// 2. UI & NOTIFICATION SYSTEM
// =============================================================================
const UIManager = (function () {
    // Pure Web Audio synthesized chime
    function playBeepSound() {
        const settings = StorageService.getSettings();
        if (!settings.soundEnabled) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);

            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.26);
        } catch (e) {
            console.warn("Audio chime prevented:", e);
        }
    }

    function showToast(message, type = "info", title = "") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;

        const iconMap = {
            success: "#icon-check",
            error: "#icon-alert",
            warning: "#icon-alert",
            info: "#icon-dashboard"
        };
        const iconHref = iconMap[type] || "#icon-dashboard";
        const titleText = title || (type.charAt(0).toUpperCase() + type.slice(1));

        toast.innerHTML = `
            <svg class="icon-inline toast-icon"><use href="${iconHref}"/></svg>
            <div class="toast-content">
                <div class="toast-title">${escapeHtml(titleText)}</div>
                <div class="toast-message">${escapeHtml(message)}</div>
            </div>
            <button class="toast-close-btn" aria-label="Dismiss">&times;</button>
        `;

        toast.querySelector(".toast-close-btn").addEventListener("click", () => removeToast(toast));
        container.appendChild(toast);

        setTimeout(() => removeToast(toast), 4000);
    }

    function removeToast(toast) {
        if (!toast || toast.classList.contains("removing")) return;
        toast.classList.add("removing");
        setTimeout(() => {
            if (toast.parentElement) toast.parentElement.removeChild(toast);
        }, 220);
    }

    // Confirmation Modal
    let confirmCallback = null;

    function confirmAction(message, onConfirm, title = "Confirm Action") {
        const modal = document.getElementById("confirmModal");
        document.getElementById("confirmModalTitle").textContent = title;
        document.getElementById("confirmModalMessage").textContent = message;
        confirmCallback = onConfirm;
        modal.classList.add("active");
    }

    function closeConfirmModal() {
        document.getElementById("confirmModal").classList.remove("active");
        confirmCallback = null;
    }

    document.getElementById("confirmModalOkBtn")?.addEventListener("click", function () {
        if (typeof confirmCallback === "function") confirmCallback();
        closeConfirmModal();
    });

    document.getElementById("confirmModalCancelBtn")?.addEventListener("click", closeConfirmModal);
    document.getElementById("closeConfirmModalBtn")?.addEventListener("click", closeConfirmModal);

    return {
        playBeepSound: playBeepSound,
        showToast: showToast,
        confirmAction: confirmAction,
        closeConfirmModal: closeConfirmModal
    };
})();

// Helper Functions
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatCurrency(amount) {
    const settings = StorageService.getSettings();
    const curr = settings.currency || "$";
    const num = parseFloat(amount) || 0;
    return curr + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " " +
           d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}


// =============================================================================
// 3. QR CODE GENERATION & PRINT CONTROLLER
// =============================================================================
const QrController = (function () {

    function renderQrCode(container, text, size = 180) {
        if (!container) return;
        container.innerHTML = "";

        if (typeof QRCode === "undefined") {
            container.innerHTML = `<p style="color: red; font-size: 11px;">QRCode library not loaded</p>`;
            return;
        }

        try {
            new QRCode(container, {
                text: text,
                width: size,
                height: size,
                colorDark: "#0f172a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            console.error("QR Generation error:", e);
            container.innerHTML = `<p style="color: red; font-size: 11px;">QR Render Failed</p>`;
        }
    }

    /**
     * Downloads branded high-res PNG for a Device
     */
    function downloadDeviceQrPng(device) {
        if (!device) return;
        const settings = StorageService.getSettings();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 600;
        canvas.height = 760;

        // Background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.lineWidth = 14;
        ctx.strokeStyle = "#0d9488";
        ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);

        // Header Banner
        ctx.fillStyle = "#0d9488";
        ctx.fillRect(14, 14, canvas.width - 28, 90);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(settings.orgName.toUpperCase(), canvas.width / 2, 54);

        ctx.font = "bold 16px -apple-system, sans-serif";
        ctx.fillStyle = "#ccfbf1";
        ctx.fillText("DEVICE ASSET PASSPORT TAG", canvas.width / 2, 82);

        // Render QR
        const tempDiv = document.createElement("div");
        tempDiv.style.display = "none";
        document.body.appendChild(tempDiv);

        new QRCode(tempDiv, {
            text: device.id,
            width: 380,
            height: 380,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        setTimeout(() => {
            const qrImg = tempDiv.querySelector("img") || tempDiv.querySelector("canvas");
            if (qrImg) ctx.drawImage(qrImg, (canvas.width - 380) / 2, 135, 380, 380);

            // Asset ID
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 42px monospace";
            ctx.textAlign = "center";
            ctx.fillText(device.id, canvas.width / 2, 575);

            // Device Name
            ctx.fillStyle = "#334155";
            ctx.font = "bold 24px -apple-system, sans-serif";
            const name = device.name.length > 32 ? device.name.substring(0, 30) + "..." : device.name;
            ctx.fillText(name, canvas.width / 2, 620);

            // Category & Location
            ctx.fillStyle = "#64748b";
            ctx.font = "18px -apple-system, sans-serif";
            ctx.fillText(`${device.category} • ${device.location}`, canvas.width / 2, 660);

            // Serial
            if (device.serial) {
                ctx.fillText(`SN: ${device.serial} • Cond: ${device.condition}`, canvas.width / 2, 690);
            }

            // Footer
            ctx.fillStyle = "#94a3b8";
            ctx.font = "13px -apple-system, sans-serif";
            ctx.fillText("SCAN TO VERIFY DEVICE • TRACKQR SYSTEM", canvas.width / 2, 730);

            const link = document.createElement("a");
            link.download = `TrackQR_Device_${device.id}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();

            document.body.removeChild(tempDiv);
            UIManager.showToast(`Downloaded QR PNG for ${device.id}`, "success");
            StorageService.addLog("QR Scanned", "QR Downloaded", `Downloaded QR tag for device ${device.id}.`);
        }, 80);
    }

    /**
     * Downloads branded high-res PNG for a Stock Item
     */
    function downloadStockQrPng(stockItem) {
        if (!stockItem) return;
        const settings = StorageService.getSettings();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 600;
        canvas.height = 760;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 14;
        ctx.strokeStyle = "#d97706"; // Amber accent for stock
        ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);

        ctx.fillStyle = "#d97706";
        ctx.fillRect(14, 14, canvas.width - 28, 90);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(settings.orgName.toUpperCase(), canvas.width / 2, 54);

        ctx.font = "bold 16px -apple-system, sans-serif";
        ctx.fillStyle = "#fef3c7";
        ctx.fillText("STOCK CONSUMABLE TAG", canvas.width / 2, 82);

        const tempDiv = document.createElement("div");
        tempDiv.style.display = "none";
        document.body.appendChild(tempDiv);

        new QRCode(tempDiv, {
            text: stockItem.id,
            width: 380,
            height: 380,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        setTimeout(() => {
            const qrImg = tempDiv.querySelector("img") || tempDiv.querySelector("canvas");
            if (qrImg) ctx.drawImage(qrImg, (canvas.width - 380) / 2, 135, 380, 380);

            ctx.fillStyle = "#d97706";
            ctx.font = "bold 42px monospace";
            ctx.textAlign = "center";
            ctx.fillText(stockItem.id, canvas.width / 2, 575);

            ctx.fillStyle = "#334155";
            ctx.font = "bold 24px -apple-system, sans-serif";
            const name = stockItem.name.length > 32 ? stockItem.name.substring(0, 30) + "..." : stockItem.name;
            ctx.fillText(name, canvas.width / 2, 620);

            ctx.fillStyle = "#64748b";
            ctx.font = "18px -apple-system, sans-serif";
            ctx.fillText(`${stockItem.category} • Loc: ${stockItem.location}`, canvas.width / 2, 660);
            ctx.fillText(`Unit: ${stockItem.unit} • Min Alert Level: ${stockItem.minLevel} ${stockItem.unit}`, canvas.width / 2, 690);

            ctx.fillStyle = "#94a3b8";
            ctx.font = "13px -apple-system, sans-serif";
            ctx.fillText("SCAN TO RECORD STOCK-IN / OUT • TRACKQR SYSTEM", canvas.width / 2, 730);

            const link = document.createElement("a");
            link.download = `TrackQR_Stock_${stockItem.id}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();

            document.body.removeChild(tempDiv);
            UIManager.showToast(`Downloaded QR PNG for ${stockItem.id}`, "success");
            StorageService.addLog("QR Scanned", "QR Downloaded", `Downloaded QR tag for stock item ${stockItem.id}.`);
        }, 80);
    }

    /**
     * Prints Device Tag via window.print()
     */
    function printDeviceTag(device) {
        if (!device) return;
        const settings = StorageService.getSettings();
        const sheet = document.getElementById("printableTagSheet");
        if (!sheet) return;

        sheet.innerHTML = `
            <div class="print-sticker-container">
                <div class="print-sticker-header">
                    <strong>${escapeHtml(settings.orgName)}</strong>
                    <span style="font-size: 10px; font-weight: bold; border: 1px solid black; padding: 1px 4px;">DEVICE TAG</span>
                </div>
                <div class="print-sticker-body">
                    <div class="print-sticker-qr" id="printQrBox"></div>
                    <div class="print-sticker-details">
                        <div style="font-family: monospace; font-size: 18px; font-weight: 900;">${escapeHtml(device.id)}</div>
                        <div style="font-size: 12px; font-weight: bold; margin: 2px 0;">${escapeHtml(device.name)}</div>
                        <div style="font-size: 10px; color: #333;">${escapeHtml(device.category)}</div>
                        <div style="font-size: 9px; color: #555;">Loc: ${escapeHtml(device.location)}</div>
                        <div style="font-size: 9px; color: #555;">SN: ${escapeHtml(device.serial || "N/A")} | Cond: ${escapeHtml(device.condition)}</div>
                    </div>
                </div>
                <div class="print-sticker-footer">
                    <span>SCAN TO VERIFY</span>
                    <span>${new Date().toLocaleDateString()}</span>
                </div>
            </div>
        `;

        renderQrCode(sheet.querySelector("#printQrBox"), device.id, 120);

        setTimeout(() => {
            window.print();
            StorageService.addLog("System", "Tag Printed", `Printed asset tag for device ${device.id}.`);
        }, 120);
    }

    /**
     * Prints Stock Item Tag via window.print()
     */
    function printStockTag(stockItem) {
        if (!stockItem) return;
        const settings = StorageService.getSettings();
        const sheet = document.getElementById("printableTagSheet");
        if (!sheet) return;

        sheet.innerHTML = `
            <div class="print-sticker-container" style="border: 2px solid #b45309;">
                <div class="print-sticker-header" style="border-bottom: 2px solid #b45309;">
                    <strong>${escapeHtml(settings.orgName)}</strong>
                    <span style="font-size: 10px; font-weight: bold; background: #b45309; color: white; padding: 1px 4px;">STOCK TAG</span>
                </div>
                <div class="print-sticker-body">
                    <div class="print-sticker-qr" id="printQrBox"></div>
                    <div class="print-sticker-details">
                        <div style="font-family: monospace; font-size: 18px; font-weight: 900; color: #b45309;">${escapeHtml(stockItem.id)}</div>
                        <div style="font-size: 12px; font-weight: bold; margin: 2px 0;">${escapeHtml(stockItem.name)}</div>
                        <div style="font-size: 10px; color: #333;">${escapeHtml(stockItem.category)}</div>
                        <div style="font-size: 9px; color: #555;">Loc: ${escapeHtml(stockItem.location)}</div>
                        <div style="font-size: 9px; color: #555;">Unit: ${escapeHtml(stockItem.unit)} | Min: ${stockItem.minLevel}</div>
                    </div>
                </div>
                <div class="print-sticker-footer" style="border-top: 1px dashed #b45309;">
                    <span>SCAN FOR STOCK IN / OUT</span>
                    <span>${new Date().toLocaleDateString()}</span>
                </div>
            </div>
        `;

        renderQrCode(sheet.querySelector("#printQrBox"), stockItem.id, 120);

        setTimeout(() => {
            window.print();
            StorageService.addLog("System", "Tag Printed", `Printed stock tag for ${stockItem.id}.`);
        }, 120);
    }

    return {
        renderQrCode: renderQrCode,
        downloadDeviceQrPng: downloadDeviceQrPng,
        downloadStockQrPng: downloadStockQrPng,
        printDeviceTag: printDeviceTag,
        printStockTag: printStockTag
    };
})();


// =============================================================================
// 4. SMART QR SCANNER CONTROLLER (Dual Entity Discriminator)
// =============================================================================
const ScannerController = (function () {
    let html5QrCode = null;
    let isScanning = false;
    let lastScannedText = null;
    let lastScanTime = 0;
    let availableCameras = [];

    const elements = {
        cameraSelect: document.getElementById("cameraDeviceSelect"),
        startBtn: document.getElementById("startScannerBtn"),
        stopBtn: document.getElementById("stopScannerBtn"),
        viewport: document.querySelector(".scanner-viewport-wrapper"),
        idlePlaceholder: document.getElementById("scannerIdlePlaceholder"),
        statusDot: document.getElementById("scannerStatusDot"),
        statusMsg: document.getElementById("scannerStatusMessage"),
        fileInput: document.getElementById("qrFileInput"),
        fileDropzone: document.getElementById("qrFileDropzone"),
        scannedPanel: document.getElementById("scannedResultPanel"),
        scannedEmpty: document.getElementById("scannedEmptyMessage"),
        scannedDevice: document.getElementById("scannedDeviceDetails"),
        scannedStock: document.getElementById("scannedStockDetails"),
        scannedUnknown: document.getElementById("scannedUnknownAlert"),
        scannedBadge: document.getElementById("scannedResultBadge"),
        sessionList: document.getElementById("scannerSessionHistory")
    };

    function init() {
        if (!elements.startBtn) return;
        detectCameras();

        elements.startBtn.addEventListener("click", startScanner);
        elements.stopBtn.addEventListener("click", stopScanner);

        if (elements.fileDropzone && elements.fileInput) {
            elements.fileDropzone.addEventListener("click", () => elements.fileInput.click());
            elements.fileInput.addEventListener("change", handleFileScan);

            elements.fileDropzone.addEventListener("dragover", (e) => {
                e.preventDefault();
                elements.fileDropzone.style.borderColor = "var(--primary)";
            });
            elements.fileDropzone.addEventListener("dragleave", () => {
                elements.fileDropzone.style.borderColor = "var(--border-color)";
            });
            elements.fileDropzone.addEventListener("drop", (e) => {
                e.preventDefault();
                elements.fileDropzone.style.borderColor = "var(--border-color)";
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processImageFile(e.dataTransfer.files[0]);
                }
            });
        }
    }

    async function detectCameras() {
        if (typeof Html5Qrcode === "undefined") {
            updateStatus("Html5Qrcode library not loaded", "error");
            return;
        }

        try {
            const devices = await Html5Qrcode.getCameras();
            availableCameras = devices || [];

            elements.cameraSelect.innerHTML = "";
            if (availableCameras.length === 0) {
                elements.cameraSelect.innerHTML = `<option value="">No cameras detected</option>`;
                updateStatus("No camera device found. Use File Upload or Manual Lookup.", "idle");
                return;
            }

            availableCameras.forEach((cam, index) => {
                const opt = document.createElement("option");
                opt.value = cam.id;
                opt.textContent = cam.label || `Camera ${index + 1}`;
                elements.cameraSelect.appendChild(opt);
            });

            const backCam = availableCameras.find(c => /back|rear|environment/i.test(c.label));
            if (backCam) elements.cameraSelect.value = backCam.id;

            updateStatus("Camera ready. Click Start Scanner to begin.", "idle");
        } catch (err) {
            elements.cameraSelect.innerHTML = `<option value="">Camera access unavailable</option>`;
            if (!window.isSecureContext) {
                updateStatus("Camera requires HTTPS or localhost due to browser security.", "error");
            } else {
                updateStatus("Camera access pending user permission.", "idle");
            }
        }
    }

    async function startScanner() {
        if (isScanning) return;
        if (typeof Html5Qrcode === "undefined") {
            UIManager.showToast("QR Scanner library unavailable.", "error");
            return;
        }

        const cameraId = elements.cameraSelect.value;
        const cameraConfig = cameraId ? cameraId : { facingMode: "environment" };

        updateStatus("Requesting camera access...", "idle");
        elements.startBtn.disabled = true;

        try {
            if (!html5QrCode) {
                html5QrCode = new Html5Qrcode("qrReader");
            }

            const qrConfig = {
                fps: 10,
                qrbox: function (viewfinderWidth, viewfinderHeight) {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxSize = Math.floor(minEdge * 0.75);
                    return { width: qrboxSize, height: qrboxSize };
                },
                aspectRatio: 1.0
            };

            await html5QrCode.start(
                cameraConfig,
                qrConfig,
                onQrScanSuccess,
                onQrScanFailure
            );

            isScanning = true;
            elements.startBtn.disabled = true;
            elements.stopBtn.disabled = false;
            elements.cameraSelect.disabled = true;
            elements.viewport.classList.add("scanning");
            if (elements.idlePlaceholder) elements.idlePlaceholder.style.display = "none";

            updateStatus("Camera active. Point at any Device or Stock QR code.", "active");
            UIManager.showToast("Camera scanner active", "info");

        } catch (err) {
            console.error("Scanner start error:", err);
            isScanning = false;
            elements.startBtn.disabled = false;
            elements.stopBtn.disabled = true;
            elements.cameraSelect.disabled = false;
            elements.viewport.classList.remove("scanning");
            if (elements.idlePlaceholder) elements.idlePlaceholder.style.display = "flex";

            let errMsg = "Failed to launch camera feed.";
            if (err.name === "NotAllowedError" || err.message?.includes("Permission")) {
                errMsg = "Camera permission was denied in your browser settings.";
            } else if (!window.isSecureContext) {
                errMsg = "Camera requires HTTPS or localhost. Try manual ID lookup below.";
            }
            updateStatus(errMsg, "error");
            UIManager.showToast(errMsg, "error");
        }
    }

    async function stopScanner() {
        if (!isScanning || !html5QrCode) return;
        try {
            await html5QrCode.stop();
            isScanning = false;
            elements.startBtn.disabled = false;
            elements.stopBtn.disabled = true;
            elements.cameraSelect.disabled = false;
            elements.viewport.classList.remove("scanning");
            if (elements.idlePlaceholder) elements.idlePlaceholder.style.display = "flex";
            updateStatus("Camera stopped.", "idle");
        } catch (e) {
            isScanning = false;
            elements.startBtn.disabled = false;
            elements.stopBtn.disabled = true;
            elements.viewport.classList.remove("scanning");
        }
    }

    function onQrScanSuccess(decodedText) {
        if (!decodedText) return;
        const settings = StorageService.getSettings();
        const cooldown = settings.scanCooldown || 2500;
        const now = Date.now();

        if (decodedText === lastScannedText && (now - lastScanTime < cooldown)) {
            return;
        }

        lastScannedText = decodedText;
        lastScanTime = now;
        UIManager.playBeepSound();
        handleScannedCode(decodedText.trim());
    }

    function onQrScanFailure(error) {
        // Normal frame scanning misses
    }

    function handleFileScan(e) {
        const file = e.target.files && e.target.files[0];
        if (file) {
            processImageFile(file);
            e.target.value = "";
        }
    }

    async function processImageFile(file) {
        if (typeof Html5Qrcode === "undefined") return;
        updateStatus(`Decoding QR image ${file.name}...`, "active");
        try {
            const scanner = new Html5Qrcode("qrReader");
            const decodedText = await scanner.scanFile(file, true);
            UIManager.playBeepSound();
            handleScannedCode(decodedText.trim());
            updateStatus(`Decoded ${file.name} successfully`, "idle");
        } catch (err) {
            updateStatus("No QR code detected in the uploaded image.", "error");
            UIManager.showToast("Could not recognize a QR code in that image.", "warning");
        }
    }

    /**
     * DUAL-ENTITY DISCRIMINATOR:
     * Intelligently resolves decoded string to either a Device, Stock Item, or Unknown.
     */
    function handleScannedCode(scannedId) {
        elements.scannedEmpty.style.display = "none";
        elements.scannedDevice.style.display = "none";
        elements.scannedStock.style.display = "none";
        elements.scannedUnknown.style.display = "none";

        // 1. Check if it's a Device
        const device = StorageService.getDeviceById(scannedId);
        if (device) {
            renderScannedDevice(device);
            addSessionHistory(scannedId, "Device", true);
            return;
        }

        // 2. Check if it's a Stock Item
        const stock = StorageService.getStockById(scannedId);
        if (stock) {
            renderScannedStock(stock);
            addSessionHistory(scannedId, "Stock", true);
            return;
        }

        // 3. Unknown Code
        renderScannedUnknown(scannedId);
        addSessionHistory(scannedId, "Unknown", false);
    }

    function renderScannedDevice(device) {
        elements.scannedBadge.textContent = "Device Verified";
        elements.scannedBadge.className = "badge available";
        elements.scannedDevice.style.display = "block";

        document.getElementById("scannedDevId").textContent = device.id;
        document.getElementById("scannedDevName").textContent = device.name;
        document.getElementById("scannedDevCategory").textContent = device.category;
        document.getElementById("scannedDevCondition").textContent = device.condition || "Good";
        document.getElementById("scannedDevLocation").textContent = device.location;
        document.getElementById("scannedDevAssigned").textContent = device.assignedTo ? `${device.assignedTo} (${device.department || ""})` : "Unassigned";
        document.getElementById("scannedDevSerial").textContent = device.serial || "N/A";

        const statusPill = document.getElementById("scannedDevStatus");
        statusPill.textContent = device.status;
        statusPill.className = `scanned-status-pill badge ${device.status.toLowerCase().replace(/\s+/g, "-")}`;

        // Render maintenance history snippet
        const maintList = StorageService.getMaintenanceByDeviceId(device.id);
        const maintContainer = document.getElementById("scannedDevMaintList");
        maintContainer.innerHTML = "";
        if (maintList.length === 0) {
            maintContainer.innerHTML = `<span style="color: var(--text-muted);">No repair tickets recorded. Device is healthy.</span>`;
        } else {
            maintList.forEach(m => {
                const item = document.createElement("div");
                item.style.padding = "3px 0";
                item.innerHTML = `<strong>${m.id}</strong>: ${escapeHtml(m.title)} - <span class="badge ${m.status === "Completed" ? "available" : "maintenance"}">${m.status}</span>`;
                maintContainer.appendChild(item);
            });
        }

        // Quick status actions
        document.getElementById("scanDevSetAvailableBtn").onclick = () => updateScannedDeviceStatus(device.id, "Available");
        document.getElementById("scanDevSetInUseBtn").onclick = () => updateScannedDeviceStatus(device.id, "In Use");
        document.getElementById("scanDevSetMaintBtn").onclick = () => updateScannedDeviceStatus(device.id, "Under Maintenance");
        document.getElementById("scanDevViewFullBtn").onclick = () => App.openDeviceDetailsModal(device.id);
        document.getElementById("scanDevAddMaintBtn").onclick = () => App.openMaintenanceModal(device.id);

        StorageService.addLog("QR Scanned", "Device Scanned", `Scanned device ${device.id} (${device.name}).`);
        UIManager.showToast(`Device recognized: ${device.name} (${device.id})`, "success");

        if (StorageService.getSettings().autoOpenModal) {
            App.openDeviceDetailsModal(device.id);
        }
    }

    function renderScannedStock(stock) {
        elements.scannedBadge.textContent = "Stock Item Verified";
        elements.scannedBadge.className = "badge in-stock";
        elements.scannedStock.style.display = "block";

        document.getElementById("scannedStkId").textContent = stock.id;
        document.getElementById("scannedStkName").textContent = stock.name;
        document.getElementById("scannedStkCategory").textContent = stock.category;
        document.getElementById("scannedStkQty").textContent = stock.quantity;
        document.getElementById("scannedStkUnit").textContent = stock.unit;
        document.getElementById("scannedStkMinLevel").textContent = `${stock.minLevel} ${stock.unit}`;
        document.getElementById("scannedStkLocation").textContent = stock.location;
        document.getElementById("scannedStkPrice").textContent = formatCurrency(stock.unitPrice);

        const statusPill = document.getElementById("scannedStkStatus");
        if (stock.quantity === 0) {
            statusPill.textContent = "Out of Stock";
            statusPill.className = "scanned-status-pill badge out-of-stock";
        } else if (stock.quantity <= stock.minLevel) {
            statusPill.textContent = "Low Stock Alert";
            statusPill.className = "scanned-status-pill badge low-stock";
        } else {
            statusPill.textContent = "In Stock";
            statusPill.className = "scanned-status-pill badge in-stock";
        }

        // Instant movement triggers
        document.getElementById("scanStkQuickInBtn").onclick = () => App.openStockMovementModal(stock.id, "Stock-In");
        document.getElementById("scanStkQuickOutBtn").onclick = () => App.openStockMovementModal(stock.id, "Stock-Out");
        document.getElementById("scanStkQuickReturnBtn").onclick = () => App.openStockMovementModal(stock.id, "Stock Return");
        document.getElementById("scanStkViewHistoryBtn").onclick = () => App.openStockDetailsModal(stock.id);

        StorageService.addLog("QR Scanned", "Stock Scanned", `Scanned stock item ${stock.id} (${stock.name}). Available: ${stock.quantity} ${stock.unit}.`);
        UIManager.showToast(`Stock item recognized: ${stock.name} (${stock.quantity} ${stock.unit})`, "success");

        if (StorageService.getSettings().autoOpenModal) {
            App.openStockDetailsModal(stock.id);
        }
    }

    function renderScannedUnknown(scannedId) {
        elements.scannedBadge.textContent = "Unregistered QR";
        elements.scannedBadge.className = "badge maintenance";
        elements.scannedUnknown.style.display = "block";

        document.getElementById("unknownScannedIdTitle").textContent = `ID "${scannedId}" Not Found`;
        document.getElementById("unknownScannedIdMessage").textContent =
            `No registered Device or Stock Consumable matches "${scannedId}". Choose an option below to catalog it:`;

        document.getElementById("unknownRegisterDevBtn").onclick = () => App.openAddDeviceModalWithId(scannedId);
        document.getElementById("unknownRegisterStkBtn").onclick = () => App.openAddStockModalWithId(scannedId);

        UIManager.showToast(`Code "${scannedId}" is not in the system`, "warning");
    }

    function updateScannedDeviceStatus(deviceId, newStatus) {
        StorageService.updateDeviceStatus(deviceId, newStatus);
        UIManager.showToast(`Device status set to "${newStatus}"`, "success");
        handleScannedCode(deviceId);
        App.refreshAllViews();
    }

    function addSessionHistory(id, entityType, isFound) {
        if (!elements.sessionList) return;
        const emptyHint = elements.sessionList.querySelector(".empty-hint");
        if (emptyHint) elements.sessionList.removeChild(emptyHint);

        const row = document.createElement("div");
        row.className = "session-scan-row";
        const badgeClass = isFound ? (entityType === "Device" ? "available" : "in-stock") : "out-of-stock";

        row.innerHTML = `
            <div>
                <strong style="font-family: monospace;">${escapeHtml(id)}</strong>
                <small style="color: var(--text-muted); margin-left: 6px;">[${entityType}] ${new Date().toLocaleTimeString()}</small>
            </div>
            <span class="badge ${badgeClass}">${isFound ? "Recognized" : "Unknown"}</span>
        `;
        elements.sessionList.prepend(row);
    }

    function updateStatus(message, state = "idle") {
        if (!elements.statusMsg) return;
        elements.statusMsg.textContent = message;
        elements.statusDot.className = "status-indicator-dot";
        if (state === "active") elements.statusDot.classList.add("active");
        if (state === "error") elements.statusDot.classList.add("error");
    }

    return {
        init: init,
        startScanner: startScanner,
        stopScanner: stopScanner,
        handleScannedCode: handleScannedCode,
        isScanning: () => isScanning
    };
})();


// =============================================================================
// 5. MAIN APPLICATION CONTROLLER
// =============================================================================
const App = (function () {
    let activeTab = "dashboard";

    let deviceFilters = { search: "", category: "all", status: "all", condition: "all", sort: "name_asc" };
    let stockFilters = { search: "", category: "all", level: "all", sort: "name_asc" };
    let txnFilters = { search: "", type: "all" };
    let maintFilters = { search: "", status: "all", type: "all" };
    let activityFilters = { search: "", type: "all" };
    let activeCategorySegment = "device"; // 'device' or 'stock'

    function init() {
        setupNavigation();
        setupDashboard();
        setupDevices();
        setupStock();
        setupTransactions();
        setupMaintenance();
        setupCategories();
        setupActivity();
        setupSettings();
        setupMobileMenu();
        ScannerController.init();

        const settings = StorageService.getSettings();
        applyTheme(settings.theme || "light");

        refreshAllViews();

        const hash = window.location.hash.replace("#", "");
        if (hash && ["dashboard", "devices", "stock", "scanner", "transactions", "maintenance", "activity", "categories", "settings"].includes(hash)) {
            switchTab(hash);
        }
    }

    // --- NAVIGATION & TABS ---
    function setupNavigation() {
        document.querySelectorAll(".sidebar-nav .nav-item").forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                const tab = this.getAttribute("data-tab");
                switchTab(tab);
                closeMobileSidebar();
            });
        });

        document.getElementById("topbarScanBtn")?.addEventListener("click", () => switchTab("scanner"));
        document.getElementById("topbarAddBtn")?.addEventListener("click", () => openAddDeviceModal());
        document.getElementById("topbarStockMovementBtn")?.addEventListener("click", () => openStockMovementModal());

        document.getElementById("themeToggleBtn")?.addEventListener("click", toggleTheme);
    }

    function switchTab(tabId) {
        if (activeTab === "scanner" && tabId !== "scanner") {
            ScannerController.stopScanner();
        }

        activeTab = tabId;
        window.location.hash = tabId;

        document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
            if (item.getAttribute("data-tab") === tabId) item.classList.add("active");
            else item.classList.remove("active");
        });

        document.querySelectorAll(".tab-view").forEach(view => view.classList.remove("active"));
        const target = document.getElementById(`tab-${tabId}`);
        if (target) target.classList.add("active");

        const titles = {
            dashboard: { title: "Unified Dashboard", breadcrumb: "SYSTEM / OVERVIEW" },
            devices: { title: "Device Management", breadcrumb: "HARDWARE / SERIALIZED DEVICES" },
            stock: { title: "Stock & Consumables", breadcrumb: "SUPPLIES / QUANTITY MANAGEMENT" },
            scanner: { title: "Smart QR Scanner", breadcrumb: "SCANNER / DUAL RECOGNITION" },
            transactions: { title: "Stock Movement Ledger", breadcrumb: "AUDIT / STOCK MOVEMENTS" },
            maintenance: { title: "Device Maintenance", breadcrumb: "REPAIRS / WORK ORDERS" },
            activity: { title: "Activity Logs", breadcrumb: "AUDIT / SYSTEM TIMELINE" },
            categories: { title: "Categories Management", breadcrumb: "CLASSIFICATION / CATEGORIES" },
            settings: { title: "System Settings", breadcrumb: "CONFIGURATION / PREFERENCES" }
        };

        const info = titles[tabId] || titles.dashboard;
        document.getElementById("pageTitle").textContent = info.title;
        document.getElementById("pageBreadcrumb").textContent = info.breadcrumb;

        // Render target view
        if (tabId === "dashboard") renderDashboard();
        if (tabId === "devices") renderDevices();
        if (tabId === "stock") renderStock();
        if (tabId === "transactions") renderTransactions();
        if (tabId === "maintenance") renderMaintenance();
        if (tabId === "activity") renderActivity();
        if (tabId === "categories") renderCategories();
        if (tabId === "settings") renderSettings();
    }

    function setupMobileMenu() {
        const btn = document.getElementById("mobileMenuBtn");
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebarOverlay");

        btn?.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            overlay.classList.toggle("active");
        });

        overlay?.addEventListener("click", closeMobileSidebar);
    }

    function closeMobileSidebar() {
        document.getElementById("sidebar")?.classList.remove("open");
        document.getElementById("sidebarOverlay")?.classList.remove("active");
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        const next = current === "light" ? "dark" : "light";
        applyTheme(next);
        StorageService.saveSettings({ theme: next });
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
    }

    // =========================================================================
    // 5A. UNIFIED DASHBOARD
    // =========================================================================
    function setupDashboard() {
        const dateEl = document.getElementById("currentDateDisplay");
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        }

        document.getElementById("dashViewAllDevicesBtn")?.addEventListener("click", () => switchTab("devices"));
        document.getElementById("dashViewAllStockBtn")?.addEventListener("click", () => switchTab("stock"));
        document.getElementById("dashViewAllTxnsBtn")?.addEventListener("click", () => switchTab("transactions"));
        document.getElementById("dashViewAllActivityBtn")?.addEventListener("click", () => switchTab("activity"));
        document.getElementById("dashAddDeviceBtn")?.addEventListener("click", () => openAddDeviceModal());
        document.getElementById("dashAddStockBtn")?.addEventListener("click", () => openAddStockModal());
        document.getElementById("dashOpenScannerBtn")?.addEventListener("click", () => switchTab("scanner"));
        document.getElementById("dashPerformStockMovementBtn")?.addEventListener("click", () => openStockMovementModal());
        document.getElementById("dashScheduleMaintBtn")?.addEventListener("click", () => openMaintenanceModal());
        document.getElementById("dashQuickStockInBtn")?.addEventListener("click", () => openStockMovementModal(null, "Stock-In"));
    }

    function renderDashboard() {
        const devices = StorageService.getDevices();
        const stock = StorageService.getStock();
        const settings = StorageService.getSettings();
        const txns = StorageService.getStockTransactions();
        const logs = StorageService.getLogs();

        document.getElementById("welcomeHeading").textContent = `TrackQR – ${settings.orgName}`;

        // 1. Device Counts
        const totalDevs = devices.length;
        const availDevs = devices.filter(d => d.status === "Available").length;
        const inUseDevs = devices.filter(d => d.status === "In Use").length;
        const maintDevs = devices.filter(d => d.status === "Under Maintenance").length;

        document.getElementById("dashTotalDevices").textContent = totalDevs;
        document.getElementById("dashAvailableDevices").textContent = availDevs;
        document.getElementById("dashInUseDevices").textContent = inUseDevs;
        document.getElementById("dashMaintenanceDevices").textContent = maintDevs;

        // 2. Stock Quantities & Alerts
        const totalStockSkus = stock.length;
        const totalStockQty = stock.reduce((acc, s) => acc + (parseInt(s.quantity, 10) || 0), 0);
        const lowStockItems = stock.filter(s => s.quantity > 0 && s.quantity <= s.minLevel);
        const outOfStockItems = stock.filter(s => s.quantity === 0);

        document.getElementById("dashTotalStockSkus").textContent = totalStockSkus;
        document.getElementById("dashTotalStockQuantity").textContent = totalStockQty.toLocaleString();
        document.getElementById("dashLowStockCount").textContent = lowStockItems.length;
        document.getElementById("dashOutOfStockCount").textContent = outOfStockItems.length;

        // Nav Badges
        document.getElementById("navDeviceCount").textContent = totalDevs;
        document.getElementById("navStockItemCount").textContent = totalStockSkus;
        document.getElementById("navMaintenanceCount").textContent = maintDevs;
        document.getElementById("storageItemCount").textContent = `${totalDevs} Dev / ${totalStockQty} Stock`;

        // Render Stock Alert Banners
        const alertContainer = document.getElementById("dashStockAlertsContainer");
        alertContainer.innerHTML = "";

        if (outOfStockItems.length > 0) {
            const outBanner = document.createElement("div");
            outBanner.className = "stock-alert-banner out";
            outBanner.innerHTML = `
                <div class="stock-alert-info">
                    <svg class="icon-inline" style="width: 20px; height: 20px;"><use href="#icon-alert"/></svg>
                    <div>
                        <strong>OUT-OF-STOCK CRITICAL ALERT:</strong> ${outOfStockItems.length} items have 0 units available in storage (${outOfStockItems.map(i => escapeHtml(i.name)).join(", ")}).
                    </div>
                </div>
                <button class="btn btn-sm btn-danger" onclick="App.openStockMovementModal('${outOfStockItems[0].id}', 'Stock-In')">+ Restock Now</button>
            `;
            alertContainer.appendChild(outBanner);
        }

        if (lowStockItems.length > 0) {
            const lowBanner = document.createElement("div");
            lowBanner.className = "stock-alert-banner low";
            lowBanner.innerHTML = `
                <div class="stock-alert-info">
                    <svg class="icon-inline" style="width: 20px; height: 20px;"><use href="#icon-alert"/></svg>
                    <div>
                        <strong>LOW-STOCK REPLENISHMENT WARNING:</strong> ${lowStockItems.length} consumables are at or below minimum threshold.
                    </div>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="App.switchTab('stock')">Review Stock</button>
            `;
            alertContainer.appendChild(lowBanner);
        }

        // 3. Recent Devices Table
        const devTable = document.getElementById("dashRecentDevicesTable");
        devTable.innerHTML = "";
        const latestDevs = devices.slice(0, 5);
        if (latestDevs.length === 0) {
            devTable.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No devices registered yet.</td></tr>`;
        } else {
            latestDevs.forEach(dev => {
                const tr = document.createElement("tr");
                const statusClass = dev.status.toLowerCase().replace(/\s+/g, "-");
                tr.innerHTML = `
                    <td><span class="asset-id-pill" onclick="App.openDeviceDetailsModal('${dev.id}')">${escapeHtml(dev.id)}</span></td>
                    <td><strong>${escapeHtml(dev.name)}</strong></td>
                    <td>${escapeHtml(dev.category)}</td>
                    <td><span class="badge condition-badge">${escapeHtml(dev.condition || "Good")}</span></td>
                    <td><span class="badge ${statusClass}">${escapeHtml(dev.status)}</span></td>
                    <td>
                        <button class="qr-thumb-btn" onclick="App.openDeviceDetailsModal('${dev.id}')">
                            <svg class="icon-inline" style="width: 14px; height: 14px;"><use href="#icon-qr"/></svg>
                            <span>QR Tag</span>
                        </button>
                    </td>
                `;
                devTable.appendChild(tr);
            });
        }

        // 4. Stock Overview Table on Dashboard
        const stockTable = document.getElementById("dashStockOverviewTable");
        stockTable.innerHTML = "";
        const sampleStock = stock.slice(0, 5);
        if (sampleStock.length === 0) {
            stockTable.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No stock items cataloged yet.</td></tr>`;
        } else {
            sampleStock.forEach(stk => {
                const tr = document.createElement("tr");
                let statusBadge = `<span class="badge in-stock">In Stock</span>`;
                let qtyClass = "";

                if (stk.quantity === 0) {
                    statusBadge = `<span class="badge out-of-stock">Out of Stock</span>`;
                    qtyClass = "zero";
                } else if (stk.quantity <= stk.minLevel) {
                    statusBadge = `<span class="badge low-stock">Low Stock</span>`;
                    qtyClass = "low";
                }

                tr.innerHTML = `
                    <td><span class="asset-id-pill stock-id-pill" onclick="App.openStockDetailsModal('${stk.id}')">${escapeHtml(stk.id)}</span></td>
                    <td><strong>${escapeHtml(stk.name)}</strong></td>
                    <td><span class="qty-pill ${qtyClass}">${stk.quantity} ${stk.unit}</span></td>
                    <td>${stk.minLevel} ${stk.unit}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-row-sm">
                            <button class="btn btn-sm btn-outline-success" onclick="App.openStockMovementModal('${stk.id}', 'Stock-In')" title="Stock In">+</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="App.openStockMovementModal('${stk.id}', 'Stock-Out')" title="Stock Out" ${stk.quantity === 0 ? "disabled" : ""}>-</button>
                            <button class="qr-thumb-btn" onclick="App.openStockDetailsModal('${stk.id}')">QR</button>
                        </div>
                    </td>
                `;
                stockTable.appendChild(tr);
            });
        }

        // 5. Recent Stock Movements Mini List
        const movesList = document.getElementById("dashStockMovementsList");
        movesList.innerHTML = "";
        const latestTxns = txns.slice(0, 4);
        if (latestTxns.length === 0) {
            movesList.innerHTML = `<p class="empty-hint">No transactions logged yet.</p>`;
        } else {
            latestTxns.forEach(t => {
                const item = document.createElement("div");
                const typeClass = t.type === "Stock-In" ? "in" : t.type === "Stock-Out" ? "out" : "return";
                item.className = `stock-move-mini-item ${typeClass}`;
                item.innerHTML = `
                    <div>
                        <strong>${escapeHtml(t.type)}:</strong> ${escapeHtml(t.stockName)}
                        <small style="display: block; color: var(--text-muted);">${escapeHtml(t.reference)} • ${formatDateTime(t.timestamp)}</small>
                    </div>
                    <div style="font-family: monospace; font-weight: bold;">
                        ${t.type === "Stock-Out" ? "-" : "+"}${t.quantity}
                    </div>
                `;
                movesList.appendChild(item);
            });
        }

        // 6. Recent Activity Feed
        const activityList = document.getElementById("dashRecentActivityList");
        activityList.innerHTML = "";
        const latestLogs = logs.slice(0, 5);
        if (latestLogs.length === 0) {
            activityList.innerHTML = `<p class="empty-hint">No system activity.</p>`;
        } else {
            latestLogs.forEach(log => activityList.appendChild(createActivityItemNode(log)));
        }
    }


    // =========================================================================
    // 5B. DEVICE MANAGEMENT MODULE
    // =========================================================================
    function setupDevices() {
        const searchInput = document.getElementById("deviceSearchInput");
        const clearBtn = document.getElementById("deviceClearSearchBtn");
        const catSelect = document.getElementById("filterDeviceCategory");
        const statusSelect = document.getElementById("filterDeviceStatus");
        const condSelect = document.getElementById("filterDeviceCondition");
        const sortSelect = document.getElementById("filterDeviceSort");
        const resetBtn = document.getElementById("filterDeviceResetBtn");

        searchInput?.addEventListener("input", function () {
            deviceFilters.search = this.value.trim().toLowerCase();
            if (this.value) searchInput.parentElement.classList.add("has-value");
            else searchInput.parentElement.classList.remove("has-value");
            renderDevices();
        });

        clearBtn?.addEventListener("click", () => {
            searchInput.value = "";
            searchInput.parentElement.classList.remove("has-value");
            deviceFilters.search = "";
            renderDevices();
        });

        catSelect?.addEventListener("change", function () { deviceFilters.category = this.value; renderDevices(); });
        statusSelect?.addEventListener("change", function () { deviceFilters.status = this.value; renderDevices(); });
        condSelect?.addEventListener("change", function () { deviceFilters.condition = this.value; renderDevices(); });
        sortSelect?.addEventListener("change", function () { deviceFilters.sort = this.value; renderDevices(); });

        resetBtn?.addEventListener("click", () => {
            searchInput.value = "";
            searchInput.parentElement.classList.remove("has-value");
            catSelect.value = "all";
            statusSelect.value = "all";
            condSelect.value = "all";
            sortSelect.value = "name_asc";
            deviceFilters = { search: "", category: "all", status: "all", condition: "all", sort: "name_asc" };
            renderDevices();
        });

        document.getElementById("deviceAddBtn")?.addEventListener("click", openAddDeviceModal);
        document.getElementById("deviceEmptyAddBtn")?.addEventListener("click", openAddDeviceModal);
        document.getElementById("deviceExportBtn")?.addEventListener("click", exportDevicesCSV);

        setupDeviceModal();
    }

    function renderDevices() {
        const devices = StorageService.getDevices();
        const categories = StorageService.getDeviceCategories();

        const catSelect = document.getElementById("filterDeviceCategory");
        const currCat = catSelect.value;
        catSelect.innerHTML = `<option value="all">All Device Categories</option>`;
        categories.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.name;
            opt.textContent = c.name;
            catSelect.appendChild(opt);
        });
        catSelect.value = currCat || "all";

        let filtered = devices.filter(d => {
            if (deviceFilters.search) {
                const s = deviceFilters.search;
                const matchName = d.name.toLowerCase().includes(s);
                const matchId = d.id.toLowerCase().includes(s);
                const matchSerial = (d.serial || "").toLowerCase().includes(s);
                const matchUser = (d.assignedTo || "").toLowerCase().includes(s);
                const matchLoc = (d.location || "").toLowerCase().includes(s);
                if (!matchName && !matchId && !matchSerial && !matchUser && !matchLoc) return false;
            }
            if (deviceFilters.category !== "all" && d.category !== deviceFilters.category) return false;
            if (deviceFilters.status !== "all" && d.status !== deviceFilters.status) return false;
            if (deviceFilters.condition !== "all" && d.condition !== deviceFilters.condition) return false;
            return true;
        });

        filtered.sort((a, b) => {
            switch (deviceFilters.sort) {
                case "name_asc": return a.name.localeCompare(b.name);
                case "name_desc": return b.name.localeCompare(a.name);
                case "id_asc": return a.id.localeCompare(b.id, undefined, { numeric: true });
                case "id_desc": return b.id.localeCompare(a.id, undefined, { numeric: true });
                case "date_desc": return new Date(b.purchaseDate) - new Date(a.purchaseDate);
                case "cost_desc": return (parseFloat(b.cost) || 0) - (parseFloat(a.cost) || 0);
                default: return 0;
            }
        });

        const countEl = document.getElementById("deviceResultsCount");
        if (countEl) countEl.textContent = `Showing ${filtered.length} of ${devices.length} registered devices`;

        const tbody = document.getElementById("deviceTableBody");
        const emptyState = document.getElementById("deviceEmptyState");
        tbody.innerHTML = "";

        if (filtered.length === 0) {
            tbody.style.display = "none";
            emptyState.style.display = "block";
        } else {
            tbody.style.display = "";
            emptyState.style.display = "none";

            filtered.forEach(dev => {
                const tr = document.createElement("tr");
                const statusClass = dev.status.toLowerCase().replace(/\s+/g, "-");

                tr.innerHTML = `
                    <td><span class="asset-id-pill" onclick="App.openDeviceDetailsModal('${dev.id}')">${escapeHtml(dev.id)}</span></td>
                    <td><strong>${escapeHtml(dev.name)}</strong></td>
                    <td>${escapeHtml(dev.category)}</td>
                    <td><span style="font-family: monospace; font-size: 11px;">${escapeHtml(dev.serial || "N/A")}</span></td>
                    <td>
                        <span>${escapeHtml(dev.location)}</span>
                        ${dev.assignedTo ? `<small style="display: block; color: var(--text-muted);">${escapeHtml(dev.assignedTo)} (${escapeHtml(dev.department || "")})</small>` : ""}
                    </td>
                    <td><span class="badge condition-badge">${escapeHtml(dev.condition || "Good")}</span></td>
                    <td><span class="badge ${statusClass}">${escapeHtml(dev.status)}</span></td>
                    <td>
                        <button class="qr-thumb-btn" onclick="App.openDeviceDetailsModal('${dev.id}')">
                            <svg class="icon-inline" style="width: 14px; height: 14px;"><use href="#icon-qr"/></svg>
                            <span>QR</span>
                        </button>
                    </td>
                    <td class="text-right">
                        <button class="btn btn-sm btn-ghost" onclick="App.openDeviceDetailsModal('${dev.id}')" title="Details">
                            <svg class="icon-inline"><use href="#icon-dashboard"/></svg>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="App.openEditDeviceModal('${dev.id}')" title="Edit">
                            <svg class="icon-inline"><use href="#icon-edit"/></svg>
                        </button>
                        <button class="btn btn-sm btn-danger-ghost" onclick="App.deleteDevicePrompt('${dev.id}')" title="Delete">
                            <svg class="icon-inline"><use href="#icon-trash"/></svg>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function setupDeviceModal() {
        const modal = document.getElementById("deviceModal");
        const form = document.getElementById("deviceModalForm");
        const closeBtn = document.getElementById("closeDeviceModalBtn");
        const cancelBtn = document.getElementById("cancelDeviceModalBtn");
        const catSelect = document.getElementById("inputDevCategory");
        const regenBtn = document.getElementById("regenerateDevIdBtn");

        closeBtn?.addEventListener("click", closeDeviceModal);
        cancelBtn?.addEventListener("click", closeDeviceModal);

        catSelect?.addEventListener("change", function () {
            const mode = document.getElementById("deviceFormMode").value;
            if (mode === "add") {
                document.getElementById("inputDevId").value = generateNextDeviceId(this.value);
            }
        });

        regenBtn?.addEventListener("click", function () {
            const cat = catSelect.value;
            if (!cat) {
                UIManager.showToast("Select a device category first to auto-generate an ID", "warning");
                return;
            }
            document.getElementById("inputDevId").value = generateNextDeviceId(cat);
        });

        form?.addEventListener("submit", function (e) {
            e.preventDefault();

            const mode = document.getElementById("deviceFormMode").value;
            const originalId = document.getElementById("deviceFormOriginalId").value;
            const id = document.getElementById("inputDevId").value.trim().toUpperCase();
            const name = document.getElementById("inputDevName").value.trim();
            const category = document.getElementById("inputDevCategory").value;
            const serial = document.getElementById("inputDevSerial").value.trim();
            const condition = document.getElementById("inputDevCondition").value;
            const status = document.getElementById("inputDevStatus").value;
            const location = document.getElementById("inputDevLocation").value.trim();
            const purchaseDate = document.getElementById("inputDevPurchaseDate").value;
            const assignedTo = document.getElementById("inputDevAssigned").value.trim();
            const department = document.getElementById("inputDevDept").value.trim();
            const cost = parseFloat(document.getElementById("inputDevCost").value) || 0;
            const notes = document.getElementById("inputDevNotes").value.trim();

            if (!id || !name || !category || !serial || !location || !purchaseDate) {
                UIManager.showToast("Please fill in all required device fields.", "error");
                return;
            }

            const existing = StorageService.getDeviceById(id);
            if (mode === "add" && existing) {
                document.getElementById("errorDevId").textContent = "Asset ID already exists! Please use a unique ID.";
                return;
            }
            if (mode === "edit" && existing && existing.id.toUpperCase() !== originalId.toUpperCase()) {
                document.getElementById("errorDevId").textContent = "Asset ID belongs to another registered device.";
                return;
            }

            const deviceData = {
                id: id,
                name: name,
                category: category,
                serial: serial,
                condition: condition,
                status: status,
                location: location,
                purchaseDate: purchaseDate,
                assignedTo: assignedTo,
                department: department,
                cost: cost,
                notes: notes
            };

            if (mode === "edit" && originalId && originalId.toUpperCase() !== id) {
                StorageService.deleteDevice(originalId);
            }

            StorageService.saveDevice(deviceData);
            closeDeviceModal();
            refreshAllViews();
            UIManager.showToast(`Device "${name}" (${id}) saved.`, "success");
        });
    }

    function generateNextDeviceId(catName) {
        if (!catName) return "DEV-AST-001";
        const cat = StorageService.getDeviceCategories().find(c => c.name === catName);
        const prefix = cat ? `DEV-${cat.prefix.toUpperCase()}` : "DEV-AST";

        const devs = StorageService.getDevices();
        const regex = new RegExp(`^${prefix}-(\\d+)`, "i");
        let maxNum = 0;
        devs.forEach(d => {
            const m = d.id.match(regex);
            if (m) {
                const n = parseInt(m[1], 10);
                if (n > maxNum) maxNum = n;
            }
        });
        return `${prefix}-${String(maxNum + 1).padStart(3, "0")}`;
    }

    function openAddDeviceModal() {
        const modal = document.getElementById("deviceModal");
        const form = document.getElementById("deviceModalForm");
        form.reset();

        document.getElementById("deviceModalTitle").textContent = "Add New Device";
        document.getElementById("deviceFormMode").value = "add";
        document.getElementById("deviceFormOriginalId").value = "";
        document.getElementById("errorDevId").textContent = "";

        const catSelect = document.getElementById("inputDevCategory");
        catSelect.innerHTML = `<option value="">Select Category</option>`;
        StorageService.getDeviceCategories().forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.name;
            opt.textContent = `${c.name} (${c.prefix})`;
            catSelect.appendChild(opt);
        });

        document.getElementById("inputDevPurchaseDate").value = new Date().toISOString().split("T")[0];
        modal.classList.add("active");
    }

    function openAddDeviceModalWithId(id) {
        openAddDeviceModal();
        document.getElementById("inputDevId").value = id.toUpperCase();
    }

    function openEditDeviceModal(id) {
        const dev = StorageService.getDeviceById(id);
        if (!dev) return;

        openAddDeviceModal();
        document.getElementById("deviceModalTitle").textContent = `Edit Device (${dev.id})`;
        document.getElementById("deviceFormMode").value = "edit";
        document.getElementById("deviceFormOriginalId").value = dev.id;

        document.getElementById("inputDevName").value = dev.name;
        document.getElementById("inputDevCategory").value = dev.category;
        document.getElementById("inputDevId").value = dev.id;
        document.getElementById("inputDevSerial").value = dev.serial;
        document.getElementById("inputDevCondition").value = dev.condition || "Good";
        document.getElementById("inputDevStatus").value = dev.status;
        document.getElementById("inputDevLocation").value = dev.location;
        document.getElementById("inputDevPurchaseDate").value = dev.purchaseDate;
        document.getElementById("inputDevAssigned").value = dev.assignedTo || "";
        document.getElementById("inputDevDept").value = dev.department || "";
        document.getElementById("inputDevCost").value = dev.cost || "";
        document.getElementById("inputDevNotes").value = dev.notes || "";
    }

    function closeDeviceModal() {
        document.getElementById("deviceModal")?.classList.remove("active");
    }

    function deleteDevicePrompt(id) {
        const dev = StorageService.getDeviceById(id);
        if (!dev) return;

        UIManager.confirmAction(
            `Permanently delete device "${dev.name}" (${dev.id})? This will also remove any linked repair history.`,
            () => {
                StorageService.deleteDevice(id);
                refreshAllViews();
                UIManager.showToast(`Device ${id} deleted.`, "info");
            },
            "Delete Device"
        );
    }

    // --- Device Details Modal ---
    let currentDetailsDevice = null;

    function openDeviceDetailsModal(deviceId) {
        const dev = StorageService.getDeviceById(deviceId);
        if (!dev) {
            UIManager.showToast(`Device "${deviceId}" not found.`, "error");
            return;
        }

        currentDetailsDevice = dev;
        const modal = document.getElementById("deviceDetailsModal");
        const settings = StorageService.getSettings();

        // Sticker
        document.getElementById("devTagOrgName").textContent = settings.orgName;
        document.getElementById("devTagAssetId").textContent = dev.id;
        document.getElementById("devTagDeviceName").textContent = dev.name;
        document.getElementById("devTagCategory").textContent = dev.category;

        QrController.renderQrCode(document.getElementById("devDetailsQrBox"), dev.id, 160);

        // Right side
        document.getElementById("devDetailsNameDisplay").textContent = dev.name;
        document.getElementById("devDetailsCategoryDisplay").textContent = dev.category;
        document.getElementById("devDetailsIdDisplay").textContent = dev.id;
        document.getElementById("devDetailsSerialDisplay").textContent = dev.serial || "N/A";
        document.getElementById("devDetailsLocationDisplay").textContent = dev.location;
        document.getElementById("devDetailsAssignedDisplay").textContent = dev.assignedTo ? `${dev.assignedTo} (${dev.department || ""})` : "Unassigned";
        document.getElementById("devDetailsDateDisplay").textContent = formatDate(dev.purchaseDate);
        document.getElementById("devDetailsCostDisplay").textContent = formatCurrency(dev.cost);
        document.getElementById("devDetailsNotesDisplay").textContent = dev.notes || "No notes.";

        const statusBadge = document.getElementById("devDetailsStatusBadge");
        statusBadge.textContent = dev.status;
        statusBadge.className = `badge ${dev.status.toLowerCase().replace(/\s+/g, "-")}`;

        const condBadge = document.getElementById("devDetailsConditionBadge");
        condBadge.textContent = `${dev.condition || "Good"} Condition`;

        // Render maintenance history table for this device
        const maintHistory = StorageService.getMaintenanceByDeviceId(dev.id);
        const maintTbody = document.getElementById("devDetailsMaintTableBody");
        maintTbody.innerHTML = "";

        if (maintHistory.length === 0) {
            maintTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 8px;">No maintenance records for this device.</td></tr>`;
        } else {
            maintHistory.forEach(m => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${formatDate(m.scheduledDate)}</td>
                    <td><strong>${escapeHtml(m.title)}</strong></td>
                    <td><span class="badge ${m.status === "Completed" ? "available" : "maintenance"}">${m.status}</span></td>
                    <td>${formatCurrency(m.cost)}</td>
                `;
                maintTbody.appendChild(tr);
            });
        }

        // Actions
        document.getElementById("closeDeviceDetailsModalBtn").onclick = closeDeviceDetailsModal;
        document.getElementById("devDetailsDownloadPngBtn").onclick = () => QrController.downloadDeviceQrPng(dev);
        document.getElementById("devDetailsPrintTagBtn").onclick = () => QrController.printDeviceTag(dev);
        document.getElementById("devDetailsEditBtn").onclick = () => { closeDeviceDetailsModal(); openEditDeviceModal(dev.id); };
        document.getElementById("devDetailsDeleteBtn").onclick = () => { closeDeviceDetailsModal(); deleteDevicePrompt(dev.id); };
        document.getElementById("devDetailsAddMaintBtn").onclick = () => { closeDeviceDetailsModal(); openMaintenanceModal(dev.id); };

        modal.classList.add("active");
    }

    function closeDeviceDetailsModal() {
        document.getElementById("deviceDetailsModal")?.classList.remove("active");
        currentDetailsDevice = null;
    }

    function exportDevicesCSV() {
        const devs = StorageService.getDevices();
        if (devs.length === 0) { UIManager.showToast("No devices to export.", "warning"); return; }

        const headers = ["Asset ID", "Device Name", "Category", "Serial Number", "Condition", "Status", "Location", "Assigned Person", "Department", "Purchase Date", "Cost", "Notes"];
        const rows = devs.map(d => [
            `"${d.id}"`,
            `"${(d.name || "").replace(/"/g, '""')}"`,
            `"${d.category}"`,
            `"${(d.serial || "").replace(/"/g, '""')}"`,
            `"${d.condition || ""}"`,
            `"${d.status}"`,
            `"${(d.location || "").replace(/"/g, '""')}"`,
            `"${(d.assignedTo || "").replace(/"/g, '""')}"`,
            `"${(d.department || "").replace(/"/g, '""')}"`,
            `"${d.purchaseDate}"`,
            `"${d.cost || 0}"`,
            `"${(d.notes || "").replace(/"/g, '""')}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `TrackQR_Devices_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        UIManager.showToast(`Exported ${devs.length} devices to CSV`, "success");
        StorageService.addLog("Device", "Devices Exported", `Exported ${devs.length} devices as CSV.`);
    }


    // =========================================================================
    // 5C. STOCK MANAGEMENT MODULE
    // =========================================================================
    function setupStock() {
        const searchInput = document.getElementById("stockSearchInput");
        const clearBtn = document.getElementById("stockClearSearchBtn");
        const catSelect = document.getElementById("filterStockCategory");
        const levelSelect = document.getElementById("filterStockLevel");
        const sortSelect = document.getElementById("filterStockSort");
        const resetBtn = document.getElementById("filterStockResetBtn");

        searchInput?.addEventListener("input", function () {
            stockFilters.search = this.value.trim().toLowerCase();
            if (this.value) searchInput.parentElement.classList.add("has-value");
            else searchInput.parentElement.classList.remove("has-value");
            renderStock();
        });

        clearBtn?.addEventListener("click", () => {
            searchInput.value = "";
            searchInput.parentElement.classList.remove("has-value");
            stockFilters.search = "";
            renderStock();
        });

        catSelect?.addEventListener("change", function () { stockFilters.category = this.value; renderStock(); });
        levelSelect?.addEventListener("change", function () { stockFilters.level = this.value; renderStock(); });
        sortSelect?.addEventListener("change", function () { stockFilters.sort = this.value; renderStock(); });

        resetBtn?.addEventListener("click", () => {
            searchInput.value = "";
            searchInput.parentElement.classList.remove("has-value");
            catSelect.value = "all";
            levelSelect.value = "all";
            sortSelect.value = "name_asc";
            stockFilters = { search: "", category: "all", level: "all", sort: "name_asc" };
            renderStock();
        });

        document.getElementById("stockAddBtn")?.addEventListener("click", openAddStockModal);
        document.getElementById("stockEmptyAddBtn")?.addEventListener("click", openAddStockModal);
        document.getElementById("stockRecordMovementBtn")?.addEventListener("click", () => openStockMovementModal());
        document.getElementById("stockExportBtn")?.addEventListener("click", exportStockCSV);

        setupStockModal();
        setupStockMovementModal();
    }

    function renderStock() {
        const stock = StorageService.getStock();
        const categories = StorageService.getStockCategories();

        const catSelect = document.getElementById("filterStockCategory");
        const currCat = catSelect.value;
        catSelect.innerHTML = `<option value="all">All Stock Categories</option>`;
        categories.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.name;
            opt.textContent = c.name;
            catSelect.appendChild(opt);
        });
        catSelect.value = currCat || "all";

        let filtered = stock.filter(s => {
            if (stockFilters.search) {
                const q = stockFilters.search;
                const matchName = s.name.toLowerCase().includes(q);
                const matchId = s.id.toLowerCase().includes(q);
                const matchLoc = (s.location || "").toLowerCase().includes(q);
                if (!matchName && !matchId && !matchLoc) return false;
            }
            if (stockFilters.category !== "all" && s.category !== stockFilters.category) return false;
            if (stockFilters.level !== "all") {
                if (stockFilters.level === "in_stock" && (s.quantity <= s.minLevel)) return false;
                if (stockFilters.level === "low_stock" && (s.quantity === 0 || s.quantity > s.minLevel)) return false;
                if (stockFilters.level === "out_of_stock" && s.quantity > 0) return false;
            }
            return true;
        });

        filtered.sort((a, b) => {
            switch (stockFilters.sort) {
                case "name_asc": return a.name.localeCompare(b.name);
                case "qty_asc": return a.quantity - b.quantity;
                case "qty_desc": return b.quantity - a.quantity;
                case "id_asc": return a.id.localeCompare(b.id, undefined, { numeric: true });
                default: return 0;
            }
        });

        const countEl = document.getElementById("stockResultsCount");
        if (countEl) countEl.textContent = `Showing ${filtered.length} of ${stock.length} cataloged stock items`;

        const tbody = document.getElementById("stockTableBody");
        const emptyState = document.getElementById("stockEmptyState");
        tbody.innerHTML = "";

        if (filtered.length === 0) {
            tbody.style.display = "none";
            emptyState.style.display = "block";
        } else {
            tbody.style.display = "";
            emptyState.style.display = "none";

            filtered.forEach(item => {
                const tr = document.createElement("tr");
                let statusBadge = `<span class="badge in-stock">In Stock</span>`;
                let qtyClass = "";

                if (item.quantity === 0) {
                    statusBadge = `<span class="badge out-of-stock">Out of Stock</span>`;
                    qtyClass = "zero";
                } else if (item.quantity <= item.minLevel) {
                    statusBadge = `<span class="badge low-stock">Low Stock (≤ ${item.minLevel})</span>`;
                    qtyClass = "low";
                }

                tr.innerHTML = `
                    <td><span class="asset-id-pill stock-id-pill" onclick="App.openStockDetailsModal('${item.id}')">${escapeHtml(item.id)}</span></td>
                    <td><strong>${escapeHtml(item.name)}</strong></td>
                    <td>${escapeHtml(item.category)}</td>
                    <td>${escapeHtml(item.location)}</td>
                    <td><span class="qty-pill ${qtyClass}">${item.quantity} ${item.unit}</span></td>
                    <td>${item.minLevel} ${item.unit}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="qr-thumb-btn" onclick="App.openStockDetailsModal('${item.id}')">
                            <svg class="icon-inline" style="width: 14px; height: 14px;"><use href="#icon-qr"/></svg>
                            <span>QR</span>
                        </button>
                    </td>
                    <td class="text-right">
                        <div class="action-row-sm" style="justify-content: flex-end;">
                            <button class="btn btn-sm btn-outline-success" onclick="App.openStockMovementModal('${item.id}', 'Stock-In')" title="Stock In">+ In</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="App.openStockMovementModal('${item.id}', 'Stock-Out')" title="Stock Out" ${item.quantity === 0 ? "disabled" : ""}>- Out</button>
                            <button class="btn btn-sm btn-secondary" onclick="App.openEditStockModal('${item.id}')" title="Edit">
                                <svg class="icon-inline"><use href="#icon-edit"/></svg>
                            </button>
                            <button class="btn btn-sm btn-danger-ghost" onclick="App.deleteStockPrompt('${item.id}')" title="Delete">
                                <svg class="icon-inline"><use href="#icon-trash"/></svg>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function setupStockModal() {
        const modal = document.getElementById("stockModal");
        const form = document.getElementById("stockModalForm");
        const closeBtn = document.getElementById("closeStockModalBtn");
        const cancelBtn = document.getElementById("cancelStockModalBtn");
        const catSelect = document.getElementById("inputStkCategory");
        const regenBtn = document.getElementById("regenerateStkIdBtn");

        closeBtn?.addEventListener("click", closeStockModal);
        cancelBtn?.addEventListener("click", closeStockModal);

        catSelect?.addEventListener("change", function () {
            const mode = document.getElementById("stockFormMode").value;
            if (mode === "add") {
                document.getElementById("inputStkId").value = generateNextStockId(this.value);
            }
        });

        regenBtn?.addEventListener("click", function () {
            const cat = catSelect.value;
            if (!cat) {
                UIManager.showToast("Select a stock category first to generate ID", "warning");
                return;
            }
            document.getElementById("inputStkId").value = generateNextStockId(cat);
        });

        form?.addEventListener("submit", function (e) {
            e.preventDefault();

            const mode = document.getElementById("stockFormMode").value;
            const originalId = document.getElementById("stockFormOriginalId").value;
            const id = document.getElementById("inputStkId").value.trim().toUpperCase();
            const name = document.getElementById("inputStkName").value.trim();
            const category = document.getElementById("inputStkCategory").value;
            const unit = document.getElementById("inputStkUnit").value;
            const quantity = parseInt(document.getElementById("inputStkQuantity").value, 10) || 0;
            const minLevel = parseInt(document.getElementById("inputStkMinLevel").value, 10) || 10;
            const location = document.getElementById("inputStkLocation").value.trim();
            const unitPrice = parseFloat(document.getElementById("inputStkUnitPrice").value) || 0;
            const supplier = document.getElementById("inputStkSupplier").value.trim();
            const notes = document.getElementById("inputStkNotes").value.trim();

            if (!id || !name || !category || !location || quantity < 0 || minLevel < 1) {
                UIManager.showToast("Please provide valid stock details.", "error");
                return;
            }

            const existing = StorageService.getStockById(id);
            if (mode === "add" && existing) {
                document.getElementById("errorStkId").textContent = "Stock Item ID already exists! Please use a unique ID.";
                return;
            }
            if (mode === "edit" && existing && existing.id.toUpperCase() !== originalId.toUpperCase()) {
                document.getElementById("errorStkId").textContent = "Stock Item ID belongs to another cataloged item.";
                return;
            }

            const stockData = {
                id: id,
                name: name,
                category: category,
                unit: unit,
                quantity: quantity,
                minLevel: minLevel,
                location: location,
                unitPrice: unitPrice,
                supplier: supplier,
                notes: notes
            };

            if (mode === "edit" && originalId && originalId.toUpperCase() !== id) {
                StorageService.deleteStock(originalId);
            }

            StorageService.saveStock(stockData);
            closeStockModal();
            refreshAllViews();
            UIManager.showToast(`Stock item "${name}" (${id}) saved.`, "success");
        });
    }

    function generateNextStockId(catName) {
        if (!catName) return "STK-ITM-001";
        const cat = StorageService.getStockCategories().find(c => c.name === catName);
        const prefix = cat ? `STK-${cat.prefix.toUpperCase()}` : "STK-ITM";

        const stock = StorageService.getStock();
        const regex = new RegExp(`^${prefix}-(\\d+)`, "i");
        let maxNum = 0;
        stock.forEach(s => {
            const m = s.id.match(regex);
            if (m) {
                const n = parseInt(m[1], 10);
                if (n > maxNum) maxNum = n;
            }
        });
        return `${prefix}-${String(maxNum + 1).padStart(3, "0")}`;
    }

    function openAddStockModal() {
        const modal = document.getElementById("stockModal");
        const form = document.getElementById("stockModalForm");
        form.reset();

        document.getElementById("stockModalTitle").textContent = "Add New Stock Consumable";
        document.getElementById("stockFormMode").value = "add";
        document.getElementById("stockFormOriginalId").value = "";
        document.getElementById("errorStkId").textContent = "";

        const catSelect = document.getElementById("inputStkCategory");
        catSelect.innerHTML = `<option value="">Select Category</option>`;
        StorageService.getStockCategories().forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.name;
            opt.textContent = `${c.name} (${c.prefix})`;
            catSelect.appendChild(opt);
        });

        const settings = StorageService.getSettings();
        document.getElementById("inputStkMinLevel").value = settings.defaultLowStock || 10;
        modal.classList.add("active");
    }

    function openAddStockModalWithId(id) {
        openAddStockModal();
        document.getElementById("inputStkId").value = id.toUpperCase();
    }

    function openEditStockModal(id) {
        const item = StorageService.getStockById(id);
        if (!item) return;

        openAddStockModal();
        document.getElementById("stockModalTitle").textContent = `Edit Stock Item (${item.id})`;
        document.getElementById("stockFormMode").value = "edit";
        document.getElementById("stockFormOriginalId").value = item.id;

        document.getElementById("inputStkName").value = item.name;
        document.getElementById("inputStkCategory").value = item.category;
        document.getElementById("inputStkId").value = item.id;
        document.getElementById("inputStkUnit").value = item.unit;
        document.getElementById("inputStkQuantity").value = item.quantity;
        document.getElementById("inputStkMinLevel").value = item.minLevel;
        document.getElementById("inputStkLocation").value = item.location;
        document.getElementById("inputStkUnitPrice").value = item.unitPrice || "";
        document.getElementById("inputStkSupplier").value = item.supplier || "";
        document.getElementById("inputStkNotes").value = item.notes || "";
    }

    function closeStockModal() {
        document.getElementById("stockModal")?.classList.remove("active");
    }

    function deleteStockPrompt(id) {
        const item = StorageService.getStockById(id);
        if (!item) return;

        UIManager.confirmAction(
            `Permanently delete stock consumable "${item.name}" (${item.id})?`,
            () => {
                StorageService.deleteStock(id);
                refreshAllViews();
                UIManager.showToast(`Stock item ${id} deleted.`, "info");
            },
            "Delete Stock Item"
        );
    }

    // --- Stock Details Modal ---
    let currentDetailsStock = null;

    function openStockDetailsModal(stockId) {
        const item = StorageService.getStockById(stockId);
        if (!item) {
            UIManager.showToast(`Stock item "${stockId}" not found.`, "error");
            return;
        }

        currentDetailsStock = item;
        const modal = document.getElementById("stockDetailsModal");
        const settings = StorageService.getSettings();

        // Sticker
        document.getElementById("stkTagOrgName").textContent = settings.orgName;
        document.getElementById("stkTagItemId").textContent = item.id;
        document.getElementById("stkTagItemName").textContent = item.name;
        document.getElementById("stkTagCategory").textContent = item.category;

        QrController.renderQrCode(document.getElementById("stockDetailsQrBox"), item.id, 160);

        // Right side
        document.getElementById("stkDetailsNameDisplay").textContent = item.name;
        document.getElementById("stkDetailsCategoryDisplay").textContent = item.category;
        document.getElementById("stkDetailsQtyDisplay").textContent = `${item.quantity} ${item.unit}`;
        document.getElementById("stkDetailsMinDisplay").textContent = `${item.minLevel} ${item.unit}`;
        document.getElementById("stkDetailsIdDisplay").textContent = item.id;
        document.getElementById("stkDetailsLocationDisplay").textContent = item.location;
        document.getElementById("stkDetailsPriceDisplay").textContent = formatCurrency(item.unitPrice);
        const totalVal = (item.quantity * (parseFloat(item.unitPrice) || 0));
        document.getElementById("stkDetailsValuationDisplay").textContent = formatCurrency(totalVal);

        const levelBadge = document.getElementById("stkDetailsLevelBadge");
        if (item.quantity === 0) {
            levelBadge.textContent = "Out of Stock";
            levelBadge.className = "badge out-of-stock";
        } else if (item.quantity <= item.minLevel) {
            levelBadge.textContent = "Low Stock Alert";
            levelBadge.className = "badge low-stock";
        } else {
            levelBadge.textContent = "In Stock";
            levelBadge.className = "badge in-stock";
        }

        // Render movement transactions for this item
        const txns = StorageService.getTransactionsByStockId(item.id);
        const txnTbody = document.getElementById("stkDetailsTxnTableBody");
        txnTbody.innerHTML = "";
        if (txns.length === 0) {
            txnTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 8px;">No stock movements recorded yet.</td></tr>`;
        } else {
            txns.slice(0, 5).forEach(t => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${formatDate(t.timestamp)}</td>
                    <td><span class="badge ${t.type.toLowerCase().replace(/\s+/g, "-")}">${t.type}</span></td>
                    <td style="font-family: monospace; font-weight: bold;">${t.type === "Stock-Out" ? "-" : "+"}${t.quantity}</td>
                    <td style="font-family: monospace;">${t.newQty} ${item.unit}</td>
                    <td>${escapeHtml(t.reference)}</td>
                `;
                txnTbody.appendChild(tr);
            });
        }

        // Action Buttons
        document.getElementById("closeStockDetailsModalBtn").onclick = closeStockDetailsModal;
        document.getElementById("stkDetailsDownloadPngBtn").onclick = () => QrController.downloadStockQrPng(item);
        document.getElementById("stkDetailsPrintTagBtn").onclick = () => QrController.printStockTag(item);
        document.getElementById("stkDetailsEditBtn").onclick = () => { closeStockDetailsModal(); openEditStockModal(item.id); };
        document.getElementById("stkDetailsDeleteBtn").onclick = () => { closeStockDetailsModal(); deleteStockPrompt(item.id); };

        // Instant movement from details modal
        document.getElementById("stkModalStockInBtn").onclick = () => { closeStockDetailsModal(); openStockMovementModal(item.id, "Stock-In"); };
        document.getElementById("stkModalStockOutBtn").onclick = () => { closeStockDetailsModal(); openStockMovementModal(item.id, "Stock-Out"); };
        document.getElementById("stkModalReturnBtn").onclick = () => { closeStockDetailsModal(); openStockMovementModal(item.id, "Stock Return"); };

        modal.classList.add("active");
    }

    function closeStockDetailsModal() {
        document.getElementById("stockDetailsModal")?.classList.remove("active");
        currentDetailsStock = null;
    }

    // --- STOCK MOVEMENT MODAL (Stock-In, Stock-Out, Return) ---
    function setupStockMovementModal() {
        const modal = document.getElementById("stockMovementModal");
        const form = document.getElementById("stockMovementForm");
        const closeBtn = document.getElementById("closeStockMovementModalBtn");
        const cancelBtn = document.getElementById("cancelStockMovementModalBtn");
        const itemSelect = document.getElementById("moveItemSelect");
        const typeSelect = document.getElementById("moveTypeSelect");
        const qtyInput = document.getElementById("moveQuantityInput");

        closeBtn?.addEventListener("click", closeStockMovementModal);
        cancelBtn?.addEventListener("click", closeStockMovementModal);

        itemSelect?.addEventListener("change", updateMovementPreview);
        typeSelect?.addEventListener("change", updateMovementPreview);
        qtyInput?.addEventListener("input", updateMovementPreview);

        form?.addEventListener("submit", function (e) {
            e.preventDefault();

            const stockId = itemSelect.value;
            const moveType = typeSelect.value;
            const qty = parseInt(qtyInput.value, 10);
            const reference = document.getElementById("moveReferenceInput").value.trim();
            const notes = document.getElementById("moveNotesInput").value.trim();

            if (!stockId) {
                UIManager.showToast("Please select a stock item.", "error");
                return;
            }

            try {
                const result = StorageService.performStockMovement(stockId, moveType, qty, reference, notes);
                closeStockMovementModal();
                refreshAllViews();
                UIManager.showToast(`Recorded ${moveType}: ${qty} ${result.item.unit} of ${result.item.name}. New balance: ${result.item.quantity} ${result.item.unit}.`, "success");

                // If drops below minimum, show low stock alert toast
                if (result.item.quantity === 0) {
                    UIManager.showToast(`CRITICAL: ${result.item.name} is now completely Out of Stock!`, "error");
                } else if (result.item.quantity <= result.item.minLevel) {
                    UIManager.showToast(`ALERT: ${result.item.name} is now at Low Stock level (${result.item.quantity} ${result.item.unit} remaining).`, "warning");
                }
            } catch (err) {
                document.getElementById("errorMoveQuantity").textContent = err.message;
                UIManager.showToast(err.message, "error");
            }
        });
    }

    function updateMovementPreview() {
        const stockId = document.getElementById("moveItemSelect").value;
        const moveType = document.getElementById("moveTypeSelect").value;
        const qty = parseInt(document.getElementById("moveQuantityInput").value, 10) || 0;
        const errEl = document.getElementById("errorMoveQuantity");
        errEl.textContent = "";

        const item = StorageService.getStockById(stockId);
        if (!item) {
            document.getElementById("moveCurrentQtyDisplay").textContent = "0 pcs";
            document.getElementById("moveProjectedQtyDisplay").textContent = "0 pcs";
            return;
        }

        document.getElementById("moveCurrentQtyDisplay").textContent = `${item.quantity} ${item.unit}`;
        let projected = item.quantity;

        if (moveType === "Stock-In" || moveType === "Stock Return") {
            projected = item.quantity + qty;
        } else if (moveType === "Stock-Out") {
            if (qty > item.quantity) {
                errEl.textContent = `Cannot issue ${qty}. Exceeds available stock (${item.quantity})!`;
            }
            projected = Math.max(0, item.quantity - qty);
        }

        document.getElementById("moveProjectedQtyDisplay").textContent = `${projected} ${item.unit}`;
    }

    function openStockMovementModal(preselectedStockId = null, preselectedType = "Stock-In") {
        const modal = document.getElementById("stockMovementModal");
        const form = document.getElementById("stockMovementForm");
        form.reset();
        document.getElementById("errorMoveQuantity").textContent = "";

        const itemSelect = document.getElementById("moveItemSelect");
        itemSelect.innerHTML = `<option value="">Select Stock Item</option>`;
        StorageService.getStock().forEach(s => {
            const opt = document.createElement("option");
            opt.value = s.id;
            opt.textContent = `${s.id} – ${s.name} (Available: ${s.quantity} ${s.unit})`;
            itemSelect.appendChild(opt);
        });

        if (preselectedStockId) {
            itemSelect.value = preselectedStockId;
        }
        document.getElementById("moveTypeSelect").value = preselectedType;
        document.getElementById("moveQuantityInput").value = "1";

        updateMovementPreview();
        modal.classList.add("active");
    }

    function closeStockMovementModal() {
        document.getElementById("stockMovementModal")?.classList.remove("active");
    }

    function exportStockCSV() {
        const stock = StorageService.getStock();
        if (stock.length === 0) { UIManager.showToast("No stock items to export.", "warning"); return; }

        const headers = ["Stock ID", "Item Name", "Category", "Available Quantity", "Unit", "Min Alert Level", "Unit Price", "Total Valuation", "Storage Location", "Supplier", "Notes"];
        const rows = stock.map(s => [
            `"${s.id}"`,
            `"${(s.name || "").replace(/"/g, '""')}"`,
            `"${s.category}"`,
            `"${s.quantity}"`,
            `"${s.unit}"`,
            `"${s.minLevel}"`,
            `"${s.unitPrice || 0}"`,
            `"${(s.quantity * (parseFloat(s.unitPrice) || 0)).toFixed(2)}"`,
            `"${(s.location || "").replace(/"/g, '""')}"`,
            `"${(s.supplier || "").replace(/"/g, '""')}"`,
            `"${(s.notes || "").replace(/"/g, '""')}"`
        ]);

        const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = `TrackQR_Stock_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        UIManager.showToast(`Exported ${stock.length} stock items to CSV`, "success");
        StorageService.addLog("Stock", "Stock Exported", `Exported complete stock inventory as CSV.`);
    }


    // =========================================================================
    // 5D. STOCK TRANSACTIONS VIEW
    // =========================================================================
    function setupTransactions() {
        const searchInput = document.getElementById("txnSearchInput");
        const typeSelect = document.getElementById("filterTxnType");

        searchInput?.addEventListener("input", function () {
            txnFilters.search = this.value.trim().toLowerCase();
            renderTransactions();
        });

        typeSelect?.addEventListener("change", function () {
            txnFilters.type = this.value;
            renderTransactions();
        });

        document.getElementById("transactionsNewMovementBtn")?.addEventListener("click", () => openStockMovementModal());
        document.getElementById("transactionsExportBtn")?.addEventListener("click", exportTransactionsCSV);
    }

    function renderTransactions() {
        const txns = StorageService.getStockTransactions();
        const tbody = document.getElementById("transactionsTableBody");
        const emptyState = document.getElementById("txnEmptyState");
        tbody.innerHTML = "";

        const filtered = txns.filter(t => {
            if (txnFilters.type !== "all" && t.type !== txnFilters.type) return false;
            if (txnFilters.search) {
                const s = txnFilters.search;
                const matchName = t.stockName.toLowerCase().includes(s);
                const matchId = t.stockId.toLowerCase().includes(s);
                const matchRef = (t.reference || "").toLowerCase().includes(s);
                if (!matchName && !matchId && !matchRef) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            tbody.style.display = "none";
            emptyState.style.display = "block";
        } else {
            tbody.style.display = "";
            emptyState.style.display = "none";

            filtered.forEach(t => {
                const tr = document.createElement("tr");
                const typeClass = t.type.toLowerCase().replace(/\s+/g, "-");
                const isOut = t.type === "Stock-Out";

                tr.innerHTML = `
                    <td><strong style="font-family: monospace;">${escapeHtml(t.id)}</strong></td>
                    <td>${formatDateTime(t.timestamp)}</td>
                    <td>
                        <span class="asset-id-pill stock-id-pill" onclick="App.openStockDetailsModal('${t.stockId}')">${escapeHtml(t.stockId)}</span>
                        <small style="display: block; font-weight: 600;">${escapeHtml(t.stockName)}</small>
                    </td>
                    <td><span class="badge ${typeClass}">${escapeHtml(t.type)}</span></td>
                    <td style="font-family: monospace; font-weight: bold; color: ${isOut ? "var(--danger)" : "var(--success)"};">
                        ${isOut ? "-" : "+"}${t.quantity}
                    </td>
                    <td style="font-family: monospace;">${t.newQty}</td>
                    <td>
                        <strong>${escapeHtml(t.reference)}</strong>
                        ${t.notes ? `<small style="display: block; color: var(--text-muted);">${escapeHtml(t.notes)}</small>` : ""}
                    </td>
                    <td>${escapeHtml(t.performedBy || "Admin")}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function exportTransactionsCSV() {
        const txns = StorageService.getStockTransactions();
        if (txns.length === 0) { UIManager.showToast("No transactions to export.", "warning"); return; }

        const headers = ["Transaction ID", "Date", "Stock ID", "Stock Name", "Movement Type", "Quantity", "Previous Qty", "New Qty", "Reference", "Performed By", "Notes"];
        const rows = txns.map(t => [
            `"${t.id}"`,
            `"${t.timestamp}"`,
            `"${t.stockId}"`,
            `"${(t.stockName || "").replace(/"/g, '""')}"`,
            `"${t.type}"`,
            `"${t.quantity}"`,
            `"${t.previousQty}"`,
            `"${t.newQty}"`,
            `"${(t.reference || "").replace(/"/g, '""')}"`,
            `"${t.performedBy || "Admin"}"`,
            `"${(t.notes || "").replace(/"/g, '""')}"`
        ]);

        const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = `TrackQR_Stock_Transactions_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        UIManager.showToast(`Exported ${txns.length} stock transactions to CSV`, "success");
    }


    // =========================================================================
    // 5E. DEVICE MAINTENANCE VIEW
    // =========================================================================
    function setupMaintenance() {
        document.getElementById("maintenanceAddBtn")?.addEventListener("click", () => openMaintenanceModal());
        document.getElementById("maintenanceEmptyAddBtn")?.addEventListener("click", () => openMaintenanceModal());

        const searchInput = document.getElementById("maintenanceSearchInput");
        const statusFilter = document.getElementById("filterMaintStatus");
        const typeFilter = document.getElementById("filterMaintType");

        searchInput?.addEventListener("input", function () {
            maintFilters.search = this.value.trim().toLowerCase();
            renderMaintenance();
        });

        statusFilter?.addEventListener("change", function () {
            maintFilters.status = this.value;
            renderMaintenance();
        });

        typeFilter?.addEventListener("change", function () {
            maintFilters.type = this.value;
            renderMaintenance();
        });

        setupMaintenanceModal();
    }

    function renderMaintenance() {
        const records = StorageService.getMaintenance();
        const devices = StorageService.getDevices();

        const activeCount = records.filter(r => r.status === "Scheduled" || r.status === "In Progress").length;
        const completedCount = records.filter(r => r.status === "Completed").length;
        const totalCost = records.reduce((acc, r) => acc + (parseFloat(r.cost) || 0), 0);

        document.getElementById("maintActiveCount").textContent = activeCount;
        document.getElementById("maintCompletedCount").textContent = completedCount;
        document.getElementById("maintTotalCost").textContent = formatCurrency(totalCost);

        const filtered = records.filter(rec => {
            if (maintFilters.status !== "all" && rec.status !== maintFilters.status) return false;
            if (maintFilters.type !== "all" && rec.type !== maintFilters.type) return false;
            if (maintFilters.search) {
                const s = maintFilters.search;
                const matchTitle = rec.title.toLowerCase().includes(s);
                const matchDevice = rec.deviceId.toLowerCase().includes(s);
                if (!matchTitle && !matchDevice) return false;
            }
            return true;
        });

        const tbody = document.getElementById("maintenanceTableBody");
        const emptyState = document.getElementById("maintenanceEmptyState");
        tbody.innerHTML = "";

        if (filtered.length === 0) {
            tbody.style.display = "none";
            emptyState.style.display = "block";
        } else {
            tbody.style.display = "";
            emptyState.style.display = "none";

            filtered.forEach(rec => {
                const dev = devices.find(d => d.id === rec.deviceId);
                const devName = dev ? dev.name : "Unknown Device";
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td><strong style="font-family: monospace;">${escapeHtml(rec.id)}</strong></td>
                    <td>
                        <span class="asset-id-pill" onclick="App.openDeviceDetailsModal('${rec.deviceId}')">${escapeHtml(rec.deviceId)}</span>
                        <small style="display: block; color: var(--text-muted);">${escapeHtml(devName)}</small>
                    </td>
                    <td>
                        <strong>${escapeHtml(rec.title)}</strong>
                        ${rec.technician ? `<small style="display: block; color: var(--text-muted);">Tech: ${escapeHtml(rec.technician)}</small>` : ""}
                    </td>
                    <td><span class="badge ${rec.type.toLowerCase()}">${escapeHtml(rec.type)}</span></td>
                    <td>${formatDate(rec.scheduledDate)}</td>
                    <td>${formatCurrency(rec.cost)}</td>
                    <td><span class="badge ${rec.status === "Completed" ? "available" : "maintenance"}">${escapeHtml(rec.status)}</span></td>
                    <td class="text-right">
                        ${rec.status !== "Completed" ? `
                            <button class="btn btn-sm btn-outline-success" onclick="App.markMaintenanceComplete('${rec.id}')">Complete</button>
                        ` : ""}
                        <button class="btn btn-sm btn-ghost" onclick="App.openEditMaintenanceModal('${rec.id}')">Edit</button>
                        <button class="btn btn-sm btn-danger-ghost" onclick="App.deleteMaintenancePrompt('${rec.id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    function setupMaintenanceModal() {
        const modal = document.getElementById("maintenanceModal");
        const form = document.getElementById("maintenanceModalForm");
        const closeBtn = document.getElementById("closeMaintenanceModalBtn");
        const cancelBtn = document.getElementById("cancelMaintenanceModalBtn");

        closeBtn?.addEventListener("click", closeMaintenanceModal);
        cancelBtn?.addEventListener("click", closeMaintenanceModal);

        form?.addEventListener("submit", function (e) {
            e.preventDefault();

            const mode = document.getElementById("maintenanceFormMode").value;
            const id = document.getElementById("maintenanceFormId").value;
            const deviceId = document.getElementById("inputMaintDevice").value;
            const title = document.getElementById("inputMaintTitle").value.trim();
            const type = document.getElementById("inputMaintType").value;
            const status = document.getElementById("inputMaintStatus").value;
            const scheduledDate = document.getElementById("inputMaintScheduledDate").value;
            const completedDate = document.getElementById("inputMaintCompletedDate").value;
            const cost = parseFloat(document.getElementById("inputMaintCost").value) || 0;
            const technician = document.getElementById("inputMaintTechnician").value.trim();
            const notes = document.getElementById("inputMaintNotes").value.trim();

            if (!deviceId || !title || !scheduledDate) {
                UIManager.showToast("Please provide required maintenance details.", "error");
                return;
            }

            const record = {
                id: mode === "edit" ? id : undefined,
                deviceId: deviceId,
                title: title,
                type: type,
                status: status,
                scheduledDate: scheduledDate,
                completedDate: completedDate,
                cost: cost,
                technician: technician,
                notes: notes
            };

            StorageService.saveMaintenance(record);

            // Sync with device status
            if (status === "In Progress" || status === "Scheduled") {
                const dev = StorageService.getDeviceById(deviceId);
                if (dev && dev.status !== "Under Maintenance") {
                    StorageService.updateDeviceStatus(deviceId, "Under Maintenance");
                }
            } else if (status === "Completed") {
                const dev = StorageService.getDeviceById(deviceId);
                if (dev && dev.status === "Under Maintenance") {
                    StorageService.updateDeviceStatus(deviceId, "Available");
                }
            }

            closeMaintenanceModal();
            refreshAllViews();
            UIManager.showToast("Maintenance ticket saved.", "success");
        });
    }

    function openMaintenanceModal(preselectedDeviceId = "") {
        const modal = document.getElementById("maintenanceModal");
        const form = document.getElementById("maintenanceModalForm");
        form.reset();

        document.getElementById("maintenanceModalTitle").textContent = "Schedule Device Maintenance";
        document.getElementById("maintenanceFormMode").value = "add";
        document.getElementById("maintenanceFormId").value = "";

        const select = document.getElementById("inputMaintDevice");
        select.innerHTML = `<option value="">Select Device to Service</option>`;
        StorageService.getDevices().forEach(d => {
            const opt = document.createElement("option");
            opt.value = d.id;
            opt.textContent = `${d.id} – ${d.name} (${d.status})`;
            select.appendChild(opt);
        });

        if (preselectedDeviceId) select.value = preselectedDeviceId;
        document.getElementById("inputMaintScheduledDate").value = new Date().toISOString().split("T")[0];
        modal.classList.add("active");
    }

    function openEditMaintenanceModal(maintId) {
        const rec = StorageService.getMaintenance().find(m => m.id === maintId);
        if (!rec) return;

        openMaintenanceModal(rec.deviceId);
        document.getElementById("maintenanceModalTitle").textContent = `Edit Maintenance (${rec.id})`;
        document.getElementById("maintenanceFormMode").value = "edit";
        document.getElementById("maintenanceFormId").value = rec.id;

        document.getElementById("inputMaintDevice").value = rec.deviceId;
        document.getElementById("inputMaintTitle").value = rec.title;
        document.getElementById("inputMaintType").value = rec.type;
        document.getElementById("inputMaintStatus").value = rec.status;
        document.getElementById("inputMaintScheduledDate").value = rec.scheduledDate;
        document.getElementById("inputMaintCompletedDate").value = rec.completedDate || "";
        document.getElementById("inputMaintCost").value = rec.cost || "";
        document.getElementById("inputMaintTechnician").value = rec.technician || "";
        document.getElementById("inputMaintNotes").value = rec.notes || "";
    }

    function closeMaintenanceModal() {
        document.getElementById("maintenanceModal")?.classList.remove("active");
    }

    function markMaintenanceComplete(maintId) {
        const rec = StorageService.getMaintenance().find(m => m.id === maintId);
        if (!rec) return;

        rec.status = "Completed";
        rec.completedDate = new Date().toISOString().split("T")[0];
        StorageService.saveMaintenance(rec);

        const dev = StorageService.getDeviceById(rec.deviceId);
        if (dev && dev.status === "Under Maintenance") {
            StorageService.updateDeviceStatus(dev.id, "Available");
        }

        refreshAllViews();
        UIManager.showToast(`Ticket ${maintId} completed. Device set to Available.`, "success");
    }

    function deleteMaintenancePrompt(maintId) {
        UIManager.confirmAction(
            `Delete maintenance ticket ${maintId}?`,
            () => {
                StorageService.deleteMaintenance(maintId);
                refreshAllViews();
                UIManager.showToast(`Maintenance record ${maintId} deleted.`, "info");
            },
            "Delete Maintenance"
        );
    }


    // =========================================================================
    // 5F. CATEGORIES VIEW (DEVICES & STOCK SEGMENTATION)
    // =========================================================================
    function setupCategories() {
        document.getElementById("segmentDeviceCatsBtn")?.addEventListener("click", function () {
            activeCategorySegment = "device";
            this.classList.add("active");
            document.getElementById("segmentStockCatsBtn").classList.remove("active");
            renderCategories();
        });

        document.getElementById("segmentStockCatsBtn")?.addEventListener("click", function () {
            activeCategorySegment = "stock";
            this.classList.add("active");
            document.getElementById("segmentDeviceCatsBtn").classList.remove("active");
            renderCategories();
        });

        document.getElementById("categoryAddBtn")?.addEventListener("click", () => openAddCategoryModal(activeCategorySegment));
        setupCategoryModal();
    }

    function renderCategories() {
        const isDevice = activeCategorySegment === "device";
        const categories = isDevice ? StorageService.getDeviceCategories() : StorageService.getStockCategories();
        const devices = StorageService.getDevices();
        const stock = StorageService.getStock();

        const grid = document.getElementById("categoriesGrid");
        grid.innerHTML = "";

        categories.forEach(cat => {
            const count = isDevice
                ? devices.filter(d => d.category === cat.name).length
                : stock.filter(s => s.category === cat.name).length;

            const card = document.createElement("div");
            card.className = `category-card ${isDevice ? "device-cat" : "stock-cat"}`;
            card.innerHTML = `
                <div>
                    <div class="category-card-top">
                        <span class="category-prefix-badge">${escapeHtml(cat.prefix)}</span>
                        <span class="category-asset-count">${count} ${isDevice ? "devices" : "items"}</span>
                    </div>
                    <h3>${escapeHtml(cat.name)}</h3>
                    <p>${escapeHtml(cat.desc || (isDevice ? "Hardware device category" : "Consumable stock category"))}</p>
                </div>
                <div class="category-card-footer">
                    <button class="btn btn-sm btn-secondary" onclick="App.openEditCategoryModal('${cat.prefix}', '${cat.type}')">Edit</button>
                    <button class="btn btn-sm btn-danger-ghost" onclick="App.deleteCategoryPrompt('${cat.prefix}', '${cat.type}')" ${count > 0 ? "title='Cannot delete category containing active items'" : ""}>Delete</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function setupCategoryModal() {
        const modal = document.getElementById("categoryModal");
        const form = document.getElementById("categoryModalForm");
        const closeBtn = document.getElementById("closeCategoryModalBtn");
        const cancelBtn = document.getElementById("cancelCategoryModalBtn");

        closeBtn?.addEventListener("click", closeCategoryModal);
        cancelBtn?.addEventListener("click", closeCategoryModal);

        form?.addEventListener("submit", function (e) {
            e.preventDefault();

            const mode = document.getElementById("categoryFormMode").value;
            const type = document.getElementById("inputCategoryType").value;
            const name = document.getElementById("inputCategoryName").value.trim();
            const prefix = document.getElementById("inputCategoryPrefix").value.trim().toUpperCase();
            const desc = document.getElementById("inputCategoryDesc").value.trim();

            if (!name || !prefix) {
                UIManager.showToast("Category name and prefix code are required.", "error");
                return;
            }

            const existing = StorageService.getCategories().find(c => c.prefix.toUpperCase() === prefix && c.type === type);
            if (mode === "add" && existing) {
                document.getElementById("errorCategoryPrefix").textContent = `Prefix code "${prefix}" already exists in ${type} categories!`;
                return;
            }

            StorageService.saveCategory({
                type: type,
                name: name,
                prefix: prefix,
                desc: desc
            });

            closeCategoryModal();
            refreshAllViews();
            UIManager.showToast(`Category "${name}" saved.`, "success");
        });
    }

    function openAddCategoryModal(defaultType = "device") {
        const modal = document.getElementById("categoryModal");
        const form = document.getElementById("categoryModalForm");
        form.reset();

        document.getElementById("categoryModalTitle").textContent = "Add New Category";
        document.getElementById("categoryFormMode").value = "add";
        document.getElementById("categoryFormOriginalPrefix").value = "";
        document.getElementById("errorCategoryPrefix").textContent = "";
        document.getElementById("inputCategoryType").value = defaultType;

        modal.classList.add("active");
    }

    function openEditCategoryModal(prefix, type) {
        const cat = StorageService.getCategories().find(c => c.prefix.toUpperCase() === prefix.toUpperCase() && c.type === type);
        if (!cat) return;

        openAddCategoryModal(type);
        document.getElementById("categoryModalTitle").textContent = `Edit Category (${cat.prefix})`;
        document.getElementById("categoryFormMode").value = "edit";
        document.getElementById("categoryFormOriginalPrefix").value = cat.prefix;

        document.getElementById("inputCategoryType").value = cat.type;
        document.getElementById("inputCategoryName").value = cat.name;
        document.getElementById("inputCategoryPrefix").value = cat.prefix;
        document.getElementById("inputCategoryDesc").value = cat.desc || "";
    }

    function closeCategoryModal() {
        document.getElementById("categoryModal")?.classList.remove("active");
    }

    function deleteCategoryPrompt(prefix, type) {
        try {
            UIManager.confirmAction(
                `Delete ${type} category with prefix "${prefix}"?`,
                () => {
                    try {
                        StorageService.deleteCategory(prefix, type);
                        refreshAllViews();
                        UIManager.showToast(`Category ${prefix} deleted.`, "info");
                    } catch (e) {
                        UIManager.showToast(e.message, "error");
                    }
                },
                "Delete Category"
            );
        } catch (e) {
            UIManager.showToast(e.message, "error");
        }
    }


    // =========================================================================
    // 5G. ACTIVITY LOGS VIEW
    // =========================================================================
    function setupActivity() {
        const searchInput = document.getElementById("activitySearchInput");
        const typeSelect = document.getElementById("filterActivityType");

        searchInput?.addEventListener("input", function () {
            activityFilters.search = this.value.trim().toLowerCase();
            renderActivity();
        });

        typeSelect?.addEventListener("change", function () {
            activityFilters.type = this.value;
            renderActivity();
        });

        document.getElementById("activityClearBtn")?.addEventListener("click", () => {
            UIManager.confirmAction(
                "Are you sure you want to permanently clear all activity logs?",
                () => {
                    StorageService.clearLogs();
                    renderActivity();
                    UIManager.showToast("Activity logs cleared.", "info");
                },
                "Clear Logs"
            );
        });

        document.getElementById("activityExportBtn")?.addEventListener("click", exportActivityCSV);
    }

    function renderActivity() {
        const logs = StorageService.getLogs();
        const list = document.getElementById("fullActivityLogList");
        const emptyState = document.getElementById("activityEmptyState");
        list.innerHTML = "";

        const filtered = logs.filter(l => {
            if (activityFilters.type !== "all" && l.category !== activityFilters.type) return false;
            if (activityFilters.search) {
                const s = activityFilters.search;
                const matchDesc = l.details.toLowerCase().includes(s);
                const matchTitle = l.title.toLowerCase().includes(s);
                if (!matchDesc && !matchTitle) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            list.style.display = "none";
            emptyState.style.display = "block";
        } else {
            list.style.display = "";
            emptyState.style.display = "none";
            filtered.forEach(log => list.appendChild(createActivityItemNode(log)));
        }
    }

    function createActivityItemNode(log) {
        const item = document.createElement("div");
        item.className = "activity-item";

        let bubbleClass = "system";
        let iconHref = "#icon-dashboard";

        if (log.category === "Device") { bubbleClass = "create"; iconHref = "#icon-devices"; }
        else if (log.category === "Stock") { bubbleClass = "stock"; iconHref = "#icon-stock"; }
        else if (log.category === "Maintenance") { bubbleClass = "maint"; iconHref = "#icon-maintenance"; }
        else if (log.category === "QR Scanned") { bubbleClass = "scan"; iconHref = "#icon-camera"; }

        item.innerHTML = `
            <div class="activity-icon-bubble ${bubbleClass}">
                <svg class="icon-inline"><use href="${iconHref}"/></svg>
            </div>
            <div class="activity-body">
                <div class="activity-title-row">
                    <span class="activity-title">${escapeHtml(log.title)}</span>
                    <span class="activity-time">${formatDateTime(log.timestamp)}</span>
                </div>
                <p class="activity-desc">${escapeHtml(log.details)}</p>
            </div>
        `;
        return item;
    }

    function exportActivityCSV() {
        const logs = StorageService.getLogs();
        if (logs.length === 0) { UIManager.showToast("No activity logs to export.", "warning"); return; }

        const headers = ["Timestamp", "Category", "Action", "Details", "User"];
        const rows = logs.map(l => [
            `"${l.timestamp}"`,
            `"${l.category}"`,
            `"${(l.title || "").replace(/"/g, '""')}"`,
            `"${(l.details || "").replace(/"/g, '""')}"`,
            `"${l.user || "Admin"}"`
        ]);

        const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = `TrackQR_ActivityLogs_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        UIManager.showToast("Exported activity log to CSV", "success");
    }


    // =========================================================================
    // 5H. SETTINGS VIEW
    // =========================================================================
    function setupSettings() {
        const generalForm = document.getElementById("generalSettingsForm");
        const scannerForm = document.getElementById("scannerSettingsForm");

        generalForm?.addEventListener("submit", function (e) {
            e.preventDefault();
            const orgName = document.getElementById("settingOrgName").value.trim();
            const currency = document.getElementById("settingCurrency").value;
            const defaultLowStock = parseInt(document.getElementById("settingDefaultLowStock").value, 10) || 10;

            StorageService.saveSettings({
                orgName: orgName,
                currency: currency,
                defaultLowStock: defaultLowStock
            });

            UIManager.showToast("Organization settings saved.", "success");
            refreshAllViews();
        });

        scannerForm?.addEventListener("submit", function (e) {
            e.preventDefault();
            StorageService.saveSettings({
                soundEnabled: document.getElementById("settingSoundToggle").checked,
                autoOpenModal: document.getElementById("settingAutoOpenModal").checked,
                scanCooldown: parseInt(document.getElementById("settingScanCooldown").value, 10)
            });
            UIManager.showToast("Scanner preferences saved.", "success");
        });

        // Backup Export / Import
        document.getElementById("exportBackupBtn")?.addEventListener("click", () => {
            const jsonStr = StorageService.exportDatabaseJSON();
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `TrackQR_Backup_${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            UIManager.showToast("Database exported as JSON backup.", "success");
        });

        const importInput = document.getElementById("importBackupInput");
        const importBtn = document.getElementById("importBackupTriggerBtn");
        importBtn?.addEventListener("click", () => importInput.click());

        importInput?.addEventListener("change", function (e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    StorageService.importDatabaseJSON(event.target.result);
                    refreshAllViews();
                    UIManager.showToast("Database restored successfully from backup!", "success");
                } catch (err) {
                    UIManager.showToast(`Import failed: ${err.message}`, "error");
                }
            };
            reader.readAsText(file);
            e.target.value = "";
        });

        // Reset Demo Data
        document.getElementById("resetDemoDataBtn")?.addEventListener("click", () => {
            UIManager.confirmAction(
                "Reset all devices, stock consumables, transactions, and logs back to default demo records?",
                () => {
                    StorageService.resetToDefaults();
                    refreshAllViews();
                    UIManager.showToast("Demo data restored.", "success");
                },
                "Restore Demo Data"
            );
        });

        // Wipe Database
        document.getElementById("wipeAllDataBtn")?.addEventListener("click", () => {
            UIManager.confirmAction(
                "Are you sure you want to PERMANENTLY ERASE all devices, stock items, and transaction history? This cannot be undone.",
                () => {
                    StorageService.wipeAllData();
                    refreshAllViews();
                    UIManager.showToast("All data wiped from localStorage.", "warning");
                },
                "Wipe Entire Database"
            );
        });
    }

    function renderSettings() {
        const s = StorageService.getSettings();
        document.getElementById("settingOrgName").value = s.orgName || "";
        document.getElementById("settingCurrency").value = s.currency || "$";
        document.getElementById("settingDefaultLowStock").value = s.defaultLowStock || 10;
        document.getElementById("settingSoundToggle").checked = !!s.soundEnabled;
        document.getElementById("settingAutoOpenModal").checked = !!s.autoOpenModal;
        document.getElementById("settingScanCooldown").value = String(s.scanCooldown || 2500);
    }


    // =========================================================================
    // 5I. SAMPLE LOOKUP PILLS IN SCANNER
    // =========================================================================
    function renderSampleLookupTags() {
        const container = document.getElementById("sampleLookupTags");
        if (!container) return;
        container.innerHTML = "";

        const devs = StorageService.getDevices().slice(0, 2);
        devs.forEach(d => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "asset-id-pill";
            btn.textContent = `${d.id} (Dev)`;
            btn.onclick = () => {
                document.getElementById("manualAssetIdInput").value = d.id;
                ScannerController.handleScannedCode(d.id);
            };
            container.appendChild(btn);
        });

        const stock = StorageService.getStock().slice(0, 2);
        stock.forEach(s => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "asset-id-pill stock-id-pill";
            btn.textContent = `${s.id} (Stock)`;
            btn.onclick = () => {
                document.getElementById("manualAssetIdInput").value = s.id;
                ScannerController.handleScannedCode(s.id);
            };
            container.appendChild(btn);
        });
    }

    function refreshAllViews() {
        renderDashboard();
        renderDevices();
        renderStock();
        renderTransactions();
        renderMaintenance();
        renderCategories();
        renderActivity();
        renderSettings();
        renderSampleLookupTags();
    }

    return {
        init: init,
        switchTab: switchTab,
        refreshAllViews: refreshAllViews,
        // Devices
        openAddDeviceModal: openAddDeviceModal,
        openAddDeviceModalWithId: openAddDeviceModalWithId,
        openEditDeviceModal: openEditDeviceModal,
        openDeviceDetailsModal: openDeviceDetailsModal,
        deleteDevicePrompt: deleteDevicePrompt,
        // Stock
        openAddStockModal: openAddStockModal,
        openAddStockModalWithId: openAddStockModalWithId,
        openEditStockModal: openEditStockModal,
        openStockDetailsModal: openStockDetailsModal,
        deleteStockPrompt: deleteStockPrompt,
        openStockMovementModal: openStockMovementModal,
        // Maintenance
        openMaintenanceModal: openMaintenanceModal,
        openEditMaintenanceModal: openEditMaintenanceModal,
        markMaintenanceComplete: markMaintenanceComplete,
        deleteMaintenancePrompt: deleteMaintenancePrompt,
        // Categories
        openAddCategoryModal: openAddCategoryModal,
        openEditCategoryModal: openEditCategoryModal,
        deleteCategoryPrompt: deleteCategoryPrompt
    };
})();


// =============================================================================
// INITIALIZE ON DOM CONTENT LOADED
// =============================================================================
document.addEventListener("DOMContentLoaded", function () {
    App.init();

    const manualForm = document.getElementById("manualLookupForm");
    const manualInput = document.getElementById("manualAssetIdInput");
    manualForm?.addEventListener("submit", function (e) {
        e.preventDefault();
        const id = manualInput.value.trim().toUpperCase();
        if (id) {
            ScannerController.handleScannedCode(id);
        }
    });
});

// Expose to window for inline onclick handlers and debugging
if (typeof window !== "undefined") {
    window.StorageService = StorageService;
    window.UIManager = UIManager;
    window.QrController = QrController;
    window.ScannerController = ScannerController;
    window.App = App;
}

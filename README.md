# 📊 Expense Tracking System 

A high-performance, full-stack financial portfolio management system built with **React 18**, **Tailwind CSS**, and **Framer Motion**. This system provides real-time cashflow analytics, secure administrative controls, and cloud-synchronized data persistence.

**Live Demo:** https://Varshithkumars03.github.io/expense-tracking-system

---

## 🚀 Key Features

* **Financial Portfolio Management:** Complete CRUD (Create, Read, Update, Delete) functionality for financial records.
* **Real-time Analytics:** Chronologically sorted Bar Charts (Recharts) providing instant visualization of Income vs. Outflow.
* **Enterprise Access Control:** Toggle between **Admin Privileges** (Full Edit Access) and **Standard Access** (Read-Only).
* **Asset Intelligence AI:** Adaptive insight engine that analyzes spending volatility and suggests capital optimization.
* **Multi-Format Reporting:** Integrated **Export to CSV** functionality for extracting financial performance data.
* **Smart Categorization:** Context-aware labeling (Food, Housing, Salary, etc.) with unique visual identifiers.
* **Adaptive UI:** High-contrast Dark/Light mode engine with persistence across sessions.

---

## 🛠️ Technical Stack

* **Frontend:** React.js (Hooks, Context, useMemo)
* **Styling:** Tailwind CSS (Modern Utility-First Framework)
* **Animations:** Framer Motion (State-driven transitions)
* **Icons:** Lucide-React
* **Charts:** Recharts (SVG-based responsive charts)
* **Deployment:** GitHub Pages

---

## 📦 Installation & Setup

To run this system locally for evaluation or development, follow these steps:

### 1. Prerequisites

Ensure you have **Node.js** (v16 or higher) and **npm** installed on your machine.

### 2. Clone the Repository

```bash
git clone https://github.com/Varshithkumars03/expense-tracking-system.git
cd expense-tracking-system
```

### 3. Install Dependencies

To install the full suite of professional libraries for the **Frontend**, run:

```bash
npm install framer-motion recharts lucide-react @reduxjs/toolkit react-redux
```

To initialize the **Tailwind CSS** engine (if not already set up):

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4. Backend Environment Setup

Since your system relies on **Cloud Sync logic**, the backend requires its own set of lightweight dependencies. Navigate to your backend folder and run:

```bash
npm install express cors body-parser nodemon
```

---

### 🚀 Running the Full System

To see the **Live System Sync** in action, you must have two terminals open:

**Terminal 1 (The Engine):**

```bash
cd backend
npm start
```

**Terminal 2 (The Interface):**

```bash
cd frontend
npm start
```

### 💡 Why these specific packages?

* **`framer-motion`**: Handles the "top-tier" entrance animations for your cards.
* **`recharts`**: Powers the chronologically sorted financial graphs.
* **`lucide-react`**: Provides the high-end icons for your categories.
* **`cors`**: (Backend) Essential for allowing your Frontend to talk to your Backend without security blocks.
* **`nodemon`**: (Backend) Automatically restarts the server whenever you save changes to your data.

---

### 5. Launch the System

```bash
npm start
```

The application will open automatically at **http://localhost:3000**.

---

## 🏗️ System Architecture

* **`App.js`**: Core logic engine managing state synchronization and data aggregation.
* **`index.html`**: Root template configured for **Live System Sync** and SEO optimization.
* **`/src/mockData.js`**: Initial transaction seeds for immediate system population.
* **`App.css`**: Global theme variables for CSS-in-JS style switching.

---

## 👨‍💻 Author

**Varshith Kumar S**
*Computer Science Engineering (8th Semester)*
Focus: Full-Stack Development & Cloud Synchronization Systems.
Github repo : https://Varshithkumars03.github.com

---

> *Note: This system is currently configured for Enterprise Tier evaluation as part of a final semester technical portfolio.*

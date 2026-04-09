# ⚙️ Setup Instructions

## Requirements

Before running the project, make sure you have installed:

* Microsoft SQL Server (Express or Developer)
* SQL Server Management Studio (SSMS)
* Visual Studio 2022 (.NET + MAUI workload)
* Node.js (LTS)
* Visual Studio Code
* Android Emulator (optional)

---

## 🗄️ Database Setup

This project uses a SQL Server database provided as a backup file.

### Restore database

1. Open **SQL Server Management Studio (SSMS)**
2. Connect to your local SQL Server instance
3. Right-click on **Databases** → **Restore Database...**
4. In **Source**, select:

   * **Device**
   * Click **...** and choose the file:

     ```
     database/ElearningDb.bak
     ```
5. Set database name to:

   ```
   ElearningDb
   ```
6. Go to **Files** tab (optional):

   * Enable **Relocate all files to folder**
7. Click **OK**

After restoring, the database should be visible as:

```
ElearningDb
```

---

## 🔗 Connection String

Open file:

```
backend/Elearning.API/appsettings.json
```

Set connection string:

```json
"ConnectionStrings": {
  "Default": "Server=.;Database=ElearningDb;Trusted_Connection=True;TrustServerCertificate=True"
}
```

If needed, change `Server=` to your SQL instance (e.g. `.\SQLEXPRESS`).

---

## 🚀 Backend

1. Open solution in Visual Studio:

   ```
   backend/Elearning.API/Elearning.API.sln
   ```
2. Run the API using **HTTPS profile**

Default address:

```
https://localhost:7164
```

---

## 🌐 Frontend (React)

1. Navigate to frontend folder:

```bash
cd frontend/elearning-web
```

2. Install dependencies:

```bash
npm install
```

3. Run application:

```bash
npm run dev
```

4. Open in browser (usually):

```
http://localhost:5173
```

---

## 📱 Mobile (optional)

1. Open project in Visual Studio
2. Select Android Emulator
3. Run application (F5)

---

## 🔧 Configuration Notes

* Backend must be running before frontend or mobile app
* If backend port changes, update `.env` file in frontend:

```
VITE_API_BASE_URL=https://localhost:7164
```

---

## 🔐 Test Accounts

You can log in using the following accounts:

### Administrator

* Email: [admin@test.pl](mailto:admin@test.pl)
* Password: Admin1$

### Tutor

* Email: [tutor1@test.pl](mailto:tutor1@test.pl)
* Password: Tutor1$

### Student

* Email: [student1@test.pl](mailto:student1@test.pl)
* Password: Student1$

---

## ⚠️ Troubleshooting

* If you see HTTPS errors:

  * Run:

    ```
    dotnet dev-certs https --trust
    ```
* If frontend cannot connect to API:

  * Check backend is running
  * Verify API URL in `.env`

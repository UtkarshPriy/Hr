# 📑 Document Maintenance System

A role-based Document Maintenance System built with Node.js, Express, MongoDB, and AWS S3.
This system allows Admins, Sub-admins, Owners, and Employees to manage organizations, users, and documents.

## 🚀 Features

### 👨‍💼 Admin
- Manage Admin & Sub-admin accounts
- Control access rights

### 🏢 Sub-admin
- Create Organizations
- Add Owners
- Manage Owner status

### 👑 Owner
- Manage Employees
- Upload & send documents (AWS S3 storage)
- Track document signing status

### 👷 Employee
- Access assigned documents
- Digitally sign or reject documents

## 🛠 Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **View Engine:** EJS
- **Authentication:** Express-session, Cookie-parser, Connect-flash
- **File Uploads:** Multer, AWS S3
- **Utilities:** Method-override, dotenv

## 📂 Project Structure

```
├── src
│   ├── config
│   │   └── mongoose.config.js      # MongoDB connection
│   ├── controller
│   │   ├── user.controller.js
│   │   ├── organization.controller.js
│   │   ├── status.controller.js
│   │   └── document.controller.js
│   ├── middleware
│   │   └── authenticate.js         # Role-based authentication
│   ├── public                      # Static assets
│   └── view                        # EJS templates
├── uploads                         # Temp file uploads
├── env.js                          # Env loader
├── app.js                          # Main Express app
└── package.json
```

## ⚙️ Setup

### 1. Clone the repo
```bash
git clone https://github.com/UtkarshPriy/Hr.git
cd Hr
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file (or update `env.js`):
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/hr-system
SESSION_SECRET_KEY=your_secret_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket
```

### 4. Run the app
```bash
npm start
```
App will be available at `http://localhost:3000`

## 🔑 Role-based Routes

| Role | Routes |
|------|--------|
| **Admin** | `/admin`, `/addsubadmin`, `/updatesubAdmin` |
| **Sub-admin** | `/subadmin`, `/createOrganization`, `/addOwner` |
| **Owner** | `/owner`, `/addEmployee`, `/uploadDoc`, `/sendDoc`, `/docStatus` |
| **Employee** | `/employee`, `/signDocument`, `/rejectSign` |

## 📦 Document Management API

### 1️⃣ Upload a Document (Owner only)
**Endpoint:**
```
POST /uploadDocument
```
**Headers:**
```
Content-Type: multipart/form-data
```
**Body:**
```
document → file (PDF, DOCX, etc.)
```
📤 Uploads the document to `/uploads` (local) → then pushes it to AWS S3.

### 2️⃣ Download a Document (Owner only)
**Endpoint:**
```
POST /downloadDocument
```
**Body (JSON):**
```json
{
  "documentId": "64f9e2c8a9e7f3abc1234567"
}
```

### 3️⃣ Search Documents by Employee
**Endpoint:**
```
GET /searchByEmployee?email=employee@example.com
```
🔍 Finds all documents linked to an employee's email.

### 4️⃣ Send Document to Employee (Owner only)
**Endpoint:**
```
POST /sendDoc
```
**Body (JSON):**
```json
{
  "employeeId": "64f9e2c8a9e7f3abc1234567",
  "documentId": "64f9e2c8a9e7f3abc7654321"
}
```

### 5️⃣ Employee Signs Document
**Endpoint:**
```
POST /signDocument
```
**Body (JSON):**
```json
{
  "documentId": "64f9e2c8a9e7f3abc7654321"
}
```
✅ Marks the document as signed.

### 6️⃣ Employee Rejects Document
**Endpoint:**
```
POST /rejectSign
```
**Body (JSON):**
```json
{
  "documentId": "64f9e2c8a9e7f3abc7654321",
  "reason": "Incorrect details in contract"
}
```
❌ Marks document as rejected with a reason.

## 🔮 Future Enhancements

- Email notifications for document workflows
- Role-based dashboards with analytics
- Integration with e-signature providers (e.g., DocuSign)

## 📝 License

MIT License

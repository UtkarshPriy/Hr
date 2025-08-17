# 📑 Document Maintenance System

A comprehensive role-based Document Maintenance System built with Node.js, Express, MongoDB, and AWS S3. This system allows Admins, Sub-admins, Owners, and Employees to manage organizations, users, and documents with secure authentication and cloud storage.

## 🌐 Live Demo

**🚀 [View Live Application](https://hr-17e5.onrender.com)**

## <img width="2559" height="830" alt="image" src="https://github.com/user-attachments/assets/82dc8980-399d-421b-a0e7-1b6b45ef8055" />


### Dashboard Overview

<img width="2559" height="1189" alt="image" src="https://github.com/user-attachments/assets/4fd47cd1-939f-4dfc-abbc-9c7b466ae5e7" />


### Document Management

<img width="2559" height="864" alt="image" src="https://github.com/user-attachments/assets/2f11dc17-16ad-4a8a-b681-5aca4dbea8df" />


### Employee View

<img width="2559" height="864" alt="image" src="https://github.com/user-attachments/assets/597c23a6-f42e-4a2a-afb9-da7ffa49ce45" />
<img width="2559" height="1219" alt="image" src="https://github.com/user-attachments/assets/0905d920-25fa-4058-a8fd-0063d392cfc9" />


### Admin Panel

![Uploading image.png…]()


## ✨ Key Highlights

- **🔐 JWT Authentication:** Secure token-based authentication with role-based access control
- **🔑 Password Security:** Bcrypt hashing for secure password storage
- **☁️ Cloud Storage:** AWS S3 integration for reliable document storage and retrieval
- **📱 Responsive Design:** Works seamlessly across desktop and mobile devices
- **🔄 Real-time Status:** Live document signing status tracking
- **📊 Scalable Architecture:** Built to handle multiple organizations and users
- **🛡️ Data Security:** Secure file handling, input validation, and user data protection
- **🎯 Role-Based Access:** Four-tier user hierarchy with specific permissions

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
- **Authentication:** JWT (JSON Web Tokens), Express-session, Cookie-parser, Connect-flash
- **File Uploads:** Multer, AWS S3
- **Cloud Services:** AWS S3 for document storage
- **Security:** Bcrypt for password hashing, JWT for secure authentication
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
JWT_SECRET=your_jwt_secret_key
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

| Role          | Routes                                                           |
| ------------- | ---------------------------------------------------------------- |
| **Admin**     | `/admin`, `/addsubadmin`, `/updatesubAdmin`                      |
| **Sub-admin** | `/subadmin`, `/createOrganization`, `/addOwner`                  |
| **Owner**     | `/owner`, `/addEmployee`, `/uploadDoc`, `/sendDoc`, `/docStatus` |
| **Employee**  | `/employee`, `/signDocument`, `/rejectSign`                      |

## 📦 Document Management API

> **Authentication Required:** All API endpoints require valid JWT token in Authorization header
>
> ```
> Authorization: Bearer <your_jwt_token>
> ```

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

- 📧 Email notifications for document workflows
- 📊 Role-based dashboards with analytics
- ✍️ Integration with e-signature providers (e.g., DocuSign)
- 📱 Mobile application development
- 🔍 Advanced search and filtering options
- 📈 Audit trails and compliance reporting
- 🌐 Multi-language support

## 🏗️ Architecture & Design Patterns

- **MVC Pattern:** Clean separation of concerns with organized controllers, models, and views
- **RESTful APIs:** Standard API design principles for all endpoints
- **JWT Authentication:** Stateless authentication with secure token management
- **Middleware Chain:** Modular authentication, authorization, and validation layers
- **Role-Based Access Control (RBAC):** Fine-grained permissions for different user types
- **File Upload Pipeline:** Secure multi-step file processing (local → AWS S3)
- **Error Handling:** Comprehensive error management with proper status codes
- **Security Layers:** Input validation, sanitization, password hashing, and secure sessions

## 📊 Performance & Scalability

- **JWT Stateless Authentication:** Reduces server memory usage and enables horizontal scaling
- **Database Indexing:** Optimized MongoDB queries with proper indexing strategies
- **File Management:** Efficient AWS S3 integration with direct upload capabilities
- **Password Security:** Bcrypt with salt rounds for secure password hashing
- **Session Management:** Hybrid approach with JWT + sessions for optimal security
- **Error Logging:** Comprehensive logging for debugging and monitoring
- **API Rate Limiting:** Protection against abuse and DOS attacks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Developer

**Utkarsh Priy**

- GitHub: [@UtkarshPriy](https://github.com/UtkarshPriy)
- LinkedIn: [Connect with me](https://linkedin.com/in/your-profile)

## 📝 License

MIT License

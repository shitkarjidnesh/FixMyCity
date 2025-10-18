# FixMyCity - Full-Stack Complaint Management System

This is a monorepo for a full-stack complaint management system. It includes a React web client, a React admin dashboard, and a Node.js/Express.js backend.

## Running the Project

### Prerequisites

- Node.js
- npm
- MongoDB
- A Cloudinary account

### Backend Setup

1.  Navigate to the `backend` directory:
    ```sh
    cd backend
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Create a `.env` file and add the following environment variables (use `.env.example` as a template):
    ```
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
    ```
4.  Start the backend server:
    ```sh
    npm start
    ```

### Frontend (Client) Setup

1.  Navigate to the `client` directory:
    ```sh
    cd client
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Start the client development server:
    ```sh
    npm start
    ```

### Frontend (Admin) Setup

1.  Navigate to the `admin` directory:
    ```sh
    cd admin
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Start the admin development server:
    ```sh
    npm start
    ```
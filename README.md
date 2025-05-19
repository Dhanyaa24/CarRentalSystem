# EcoRide Project

EcoRide is a modern car rental application that allows users to easily rent cars while providing an admin dashboard for managing users and cars. This project is built using a full-stack architecture with Node.js, Express.js, and MySQL for the backend, and HTML, CSS, and JavaScript for the frontend.

## Features

- **User Authentication**: Secure registration and login functionalities.
- **Car Management**: Admins can add, update, and delete car listings.
- **Booking System**: Users can book cars for specified dates and manage their bookings.
- **Admin Dashboard**: Admins can view metrics and manage users and cars.

## Tech Stack

- **Backend**: Node.js, Express.js, MySQL
- **Frontend**: HTML, CSS (Bootstrap/Tailwind CSS), JavaScript
- **Database**: MySQL

## Project Structure

```
EcoRide
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── middleware
│   │   ├── config
│   │   ├── utils
│   │   └── app.js
│   ├── package.json
│   └── README.md
├── frontend
│   ├── public
│   ├── src
│   ├── package.json
│   └── README.md
├── database
│   └── schema.sql
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- MySQL
- npm

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd EcoRide
   ```

2. Set up the backend:
   - Navigate to the backend directory:
     ```
     cd backend
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Configure the database connection in `src/config/db.js`.
   - Run the migrations using the SQL schema in `database/schema.sql`.

3. Set up the frontend:
   - Navigate to the frontend directory:
     ```
     cd ../frontend
     ```
   - Install dependencies:
     ```
     npm install
     ```

### Running the Application

- Start the backend server:
  ```
  cd backend
  npm start
  ```

- Open another terminal and start the frontend:
  ```
  cd frontend
  npm start
  ```

### Usage

- Access the application in your browser at `http://localhost:3000`.
- Register a new account or log in to start renting cars.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
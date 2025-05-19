Write-Host "Starting EcoRide Backend Server..."
$env:PORT = "3000"
$env:DB_HOST = "localhost"
$env:DB_USER = "root"
$env:DB_PASSWORD = "dhanya24"
$env:DB_NAME = "ecoride_db"
$env:DB_PORT = "3306"
$env:JWT_SECRET = "ecoride_secret_key_2025"
$env:NODE_ENV = "development"

npm install
node src/app.js

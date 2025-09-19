-git clone https://github.com/AlexJosua/inventory-dashboard.git

-cd inventory-api

-npm install

-create database menggunakan schema.sql yang ada di file db

buat file .env lalu isi dengan
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=inventory_db

-npm run dev

-lakukan testing menggunakan POSTMAN
dengan cara import file postman yang ada di folder testing = Inventory.postman_collection.json  
pastikan jika ingin melakukan transaksi harus membuat customer terlebih dahulu

const { query } = require('../config/db');

class Car {
    static async findAll() {
        try {
            console.log('[Car Model] Executing findAll query');
            const sql = 'SELECT * FROM cars';
            console.log('[Car Model] SQL Query:', sql);
            
            const cars = await query(sql);
            console.log(`[Car Model] Found ${cars.length} cars:`, cars);
            
            if (!Array.isArray(cars)) {
                console.error('[Car Model] Query did not return an array:', cars);
                throw new Error('Invalid response format from database');
            }
            
            return cars;
        } catch (error) {
            console.error('[Car Model] Error in findAll:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                stack: error.stack
            });
            throw error;
        }
    }

    static async findById(id) {
        try {
            const cars = await query('SELECT * FROM cars WHERE id = ?', [id]);
            return cars[0];
        } catch (error) {
            console.error('[Car Model] Error in findById:', error);
            throw error;
        }
    }

    static async create(carData) {
        try {
            const result = await query(
                'INSERT INTO cars (model, brand, year, price, category, transmission, fuel_type, seats, mileage, license_plate, vin, image_url, features, location_id, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [carData.model, carData.brand, carData.year, carData.price, carData.category, carData.transmission, carData.fuel_type, carData.seats, carData.mileage, carData.license_plate, carData.vin, carData.image_url, JSON.stringify(carData.features), carData.location_id, carData.availability]
            );
            return result.insertId;
        } catch (error) {
            console.error('[Car Model] Error in create:', error);
            throw error;
        }
    }

    static async update(id, carData) {
        try {
            const result = await query(
                'UPDATE cars SET model = ?, brand = ?, year = ?, price = ?, category = ?, transmission = ?, fuel_type = ?, seats = ?, mileage = ?, license_plate = ?, vin = ?, image_url = ?, features = ?, location_id = ?, availability = ? WHERE id = ?',
                [carData.model, carData.brand, carData.year, carData.price, carData.category, carData.transmission, carData.fuel_type, carData.seats, carData.mileage, carData.license_plate, carData.vin, carData.image_url, JSON.stringify(carData.features), carData.location_id, carData.availability, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('[Car Model] Error in update:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const result = await query('DELETE FROM cars WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('[Car Model] Error in delete:', error);
            throw error;
        }
    }
}

module.exports = Car;
const pool = require('../config/db');
const { TRANSACTION_ISOLATION } = require('../config/constants');


class TransactionHelper {
    static async executeTransaction(callback, isolationLevel = TRANSACTION_ISOLATION.READ_COMMITTED) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            if (isolationLevel && isolationLevel !== TRANSACTION_ISOLATION.READ_COMMITTED) {
                await client.query(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
            }

            const result = await callback(client);

            await client.query('COMMIT');
            
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Transaction rolled back:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async executeMultipleQueries(queries, isolationLevel = TRANSACTION_ISOLATION.READ_COMMITTED) {
        return this.executeTransaction(async (client) => {
            const results = [];
            
            for (const query of queries) {
                const result = await client.query(query.text, query.values || []);
                results.push(result);
            }
            
            return results;
        }, isolationLevel);
    }

    static async deleteWithCascade(tableName, id, relatedTables = []) {
        return this.executeTransaction(async (client) => {
            for (const related of relatedTables) {
                await client.query(
                    `DELETE FROM ${related.table} WHERE ${related.foreignKey} = $1`,
                    [id]
                );
            }

            const result = await client.query(
                `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`,
                [id]
            );

            if (result.rows.length === 0) {
                throw new Error(`Record not found in ${tableName}`);
            }

            return result;
        });
    }

    static async updateWithValidation(tableName, id, data, requiredFields = []) {
        return this.executeTransaction(async (client) => {
            const checkResult = await client.query(
                `SELECT id FROM ${tableName} WHERE id = $1`,
                [id]
            );

            if (checkResult.rows.length === 0) {
                throw new Error(`Record not found in ${tableName}`);
            }

            const fields = Object.keys(data).filter(key => data[key] !== undefined);
            
            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            let query = `UPDATE ${tableName} SET updated_at = CURRENT_TIMESTAMP`;
            const values = [];
            let paramIndex = 1;

            fields.forEach(field => {
                query += `, ${field} = $${paramIndex}`;
                values.push(data[field]);
                paramIndex++;
            });

            query += ` WHERE id = $${paramIndex} RETURNING *`;
            values.push(id);

            const result = await client.query(query, values);
            return result;
        });
    }

    static async bulkInsert(tableName, records, columns) {
        if (!records || records.length === 0) {
            throw new Error('No records to insert');
        }

        return this.executeTransaction(async (client) => {
            const results = [];

            for (const record of records) {
                const values = columns.map(col => record[col]);
                const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                
                const query = `
                    INSERT INTO ${tableName} (${columns.join(', ')})
                    VALUES (${placeholders})
                    RETURNING *
                `;

                const result = await client.query(query, values);
                results.push(result.rows[0]);
            }

            return results;
        });
    }

    static async atomicIncrement(tableName, id, field, amount = 1) {
        return this.executeTransaction(async (client) => {
            const result = await client.query(
                `UPDATE ${tableName} 
                 SET ${field} = ${field} + $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2
                 RETURNING *`,
                [amount, id]
            );

            if (result.rows.length === 0) {
                throw new Error(`Record not found in ${tableName}`);
            }

            return result;
        }, TRANSACTION_ISOLATION.REPEATABLE_READ);
    }

    static async safeDelete(tableName, id, dependencies = []) {
        return this.executeTransaction(async (client) => {
            for (const dep of dependencies) {
                const checkResult = await client.query(
                    `SELECT COUNT(*) as count FROM ${dep.table} WHERE ${dep.foreignKey} = $1`,
                    [id]
                );

                const count = parseInt(checkResult.rows[0].count);
                if (count > 0) {
                    throw new Error(dep.errorMessage || `Cannot delete: ${count} related records exist in ${dep.table}`);
                }
            }

            const result = await client.query(
                `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`,
                [id]
            );

            if (result.rows.length === 0) {
                throw new Error(`Record not found in ${tableName}`);
            }

            return result;
        });
    }
}

module.exports = TransactionHelper;
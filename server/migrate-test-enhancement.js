import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: ".env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrateTestEnhancements() {
    const client = await pool.connect();
    
    try {
        console.log('Starting migration for test enhancements...');
        
        // Add allow_retake column to tests table
        await client.query(`
            ALTER TABLE tests 
            ADD COLUMN IF NOT EXISTS allow_retake BOOLEAN NOT NULL DEFAULT true;
        `);
        console.log('✓ Added allow_retake column to tests table');
        
        // Add is_first_attempt column to exam_sessions table
        await client.query(`
            ALTER TABLE exam_sessions 
            ADD COLUMN IF NOT EXISTS is_first_attempt BOOLEAN NOT NULL DEFAULT true;
        `);
        console.log('✓ Added is_first_attempt column to exam_sessions table');
        
        // Create test_course_recommendations table
        await client.query(`
            CREATE TABLE IF NOT EXISTS test_course_recommendations (
                id SERIAL PRIMARY KEY,
                test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
                course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✓ Created test_course_recommendations table');
        
        // Create test_doubts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS test_doubts (
                id SERIAL PRIMARY KEY,
                session_id INTEGER NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
                student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                question_number INTEGER,
                doubt_text TEXT NOT NULL,
                screenshot_url TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                response_text TEXT,
                responded_by INTEGER REFERENCES users(id),
                responded_at TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✓ Created test_doubts table');
        
        // Update is_first_attempt for existing sessions
        await client.query(`
            WITH ranked_sessions AS (
                SELECT 
                    id,
                    ROW_NUMBER() OVER (PARTITION BY student_id, test_id ORDER BY created_at) as rn
                FROM exam_sessions
            )
            UPDATE exam_sessions
            SET is_first_attempt = (
                SELECT CASE WHEN rn = 1 THEN true ELSE false END
                FROM ranked_sessions
                WHERE ranked_sessions.id = exam_sessions.id
            );
        `);
        console.log('✓ Updated is_first_attempt for existing sessions');
        
        console.log('\n✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateTestEnhancements().catch(console.error);

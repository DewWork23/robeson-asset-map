import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { readFileSync, writeFileSync } from 'fs';
import { CATEGORY_MIGRATION_MAP } from '../robeson-app/utils/categoryConsolidation';
import path from 'path';

const CSV_PATH = path.join(__dirname, '..', 'robeson-app', 'public', 'consolidated_robeson.csv');
const OUTPUT_PATH = path.join(__dirname, '..', 'robeson-app', 'public', 'consolidated_robeson_migrated.csv');

function migrateCategories() {
  console.log('Starting category migration...\n');
  
  // Read the CSV file
  const csvContent = readFileSync(CSV_PATH, 'utf-8');
  
  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  // Track migration statistics
  const migrationStats: Record<string, number> = {};
  const unmappedCategories: Set<string> = new Set();
  let freePrograms: any[] = [];
  
  // Migrate categories
  const migratedRecords = records.map((record: any) => {
    const oldCategory = record.Category;
    let newCategory = CATEGORY_MIGRATION_MAP[oldCategory];
    
    // Special handling for "Free Programs" - need manual review
    if (oldCategory === 'Free Programs') {
      freePrograms.push(record);
      // Try to categorize based on organization name or services
      if (record['Organization Name'].toLowerCase().includes('health') || 
          record['Services Offered'].toLowerCase().includes('health')) {
        newCategory = 'Healthcare Services';
      } else if (record['Organization Name'].toLowerCase().includes('church') || 
                 record['Organization Name'].toLowerCase().includes('ministry')) {
        newCategory = 'Faith-Based Services';
      } else if (record['Organization Name'].toLowerCase().includes('school') || 
                 record['Organization Name'].toLowerCase().includes('education')) {
        newCategory = 'Education';
      } else if (record['Organization Name'].toLowerCase().includes('housing')) {
        newCategory = 'Housing Services';
      } else if (record['Organization Name'].toLowerCase().includes('legal')) {
        newCategory = 'Legal Services';
      } else {
        newCategory = 'Community Services'; // Default fallback
      }
    }
    
    if (!newCategory) {
      unmappedCategories.add(oldCategory);
      newCategory = oldCategory; // Keep original if no mapping
    }
    
    // Update statistics
    migrationStats[newCategory] = (migrationStats[newCategory] || 0) + 1;
    
    return {
      ...record,
      Category: newCategory
    };
  });
  
  // Convert back to CSV
  const headers = Object.keys(records[0]);
  const csvOutput = stringify(migratedRecords, {
    header: true,
    columns: headers
  });
  
  // Write the new CSV
  writeFileSync(OUTPUT_PATH, csvOutput);
  
  // Print migration report
  console.log('Migration Report:');
  console.log('=================\n');
  
  console.log('New Category Distribution:');
  Object.entries(migrationStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count} organizations`);
    });
  
  console.log(`\nTotal organizations: ${records.length}`);
  console.log(`Categories reduced from 20 to ${Object.keys(migrationStats).length}`);
  
  if (freePrograms.length > 0) {
    console.log(`\n⚠️  ${freePrograms.length} "Free Programs" were redistributed based on keywords.`);
    console.log('   Please review these manually for accuracy.');
  }
  
  if (unmappedCategories.size > 0) {
    console.log('\n❌ Unmapped categories (kept original):');
    unmappedCategories.forEach(cat => console.log(`   - ${cat}`));
  }
  
  console.log(`\n✅ Migration complete! New CSV saved to:\n   ${OUTPUT_PATH}`);
}

// Run the migration
if (require.main === module) {
  migrateCategories();
}
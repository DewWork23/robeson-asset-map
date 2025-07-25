#!/usr/bin/env python3
"""
Script to normalize categories in the Robeson County CSV file.
Applies the same category normalization logic as the TypeScript application.
"""

import csv
import sys

# Define the category migration map (same as TypeScript)
CATEGORY_MIGRATION_MAP = {
    # Healthcare consolidation
    'Healthcare/Treatment': 'Healthcare Services',
    'Healthcare/Medical': 'Healthcare Services',
    'Healthcare/Public Health': 'Healthcare Services',
    'Mental Health': 'Mental Health & Substance Use',
    
    # Government and Tribal separation
    'Government Services': 'Government Services',
    'Government/Tribal Services': 'Government Services',  # Default to Government, will handle Tribal separately
    'Government & Tribal Services': 'Government Services',  # For migration
    
    # Community consolidation
    'Community Services': 'Community Services',
    'Community Organizations': 'Community Groups & Development',
    'Community Development': 'Community Groups & Development',
    
    # Faith-based rename
    'Faith-Based Programs': 'Faith-Based Services',
    
    # Keep as is
    'Legal Services': 'Legal Services',
    'Law Enforcement': 'Law Enforcement',
    'Education': 'Education',
    'Housing Services': 'Housing Services',
    'Pharmacy': 'Pharmacy',
    
    # Cultural and information consolidation
    'Cultural Services': 'Cultural & Information Services',
    'Labor Union': 'Cultural & Information Services',
    'Information/Referral': 'Cultural & Information Services',
    
    # Programs need redistribution - temporary mapping
    'Free Programs': 'Community Services',  # This will need manual review
    'Fee-Based Programs': 'Community Services'  # This will need manual review
}

# Define consolidated categories
CONSOLIDATED_CATEGORIES = [
    'Crisis Services',
    'Food Services',
    'Housing Services',
    'Healthcare Services',
    'Mental Health & Substance Use',
    'Government Services',
    'Tribal Services',
    'Community Services',
    'Community Groups & Development',
    'Faith-Based Services',
    'Legal Services',
    'Law Enforcement',
    'Education',
    'Pharmacy',
    'Cultural & Information Services'
]

def normalize_category(row):
    """
    Normalize the category for a given row based on the migration map and special rules.
    
    Args:
        row: Dictionary containing the CSV row data
    
    Returns:
        str: The normalized category
    """
    original_category = row.get('Category', '')
    org_name = row.get('Organization Name', '').lower()
    service_type = row.get('Service Type', '').lower()
    services_offered = row.get('Services Offered', '').lower()
    is_crisis = row.get('Crisis Service', '').lower() == 'yes'
    
    # Special handling for crisis services - if marked as crisis, it should be in Crisis Services
    if is_crisis and original_category != 'Crisis Services':
        # Check if it's a mental health/substance use crisis service
        mental_health_service_types = [
            'mental health services', 'substance abuse treatment', 'mental health/addiction',
            'mental health/developmental services', 'mental health/substance abuse',
            'addiction medicine', 'behavioral health/medical', 'behavioral health/peer support',
            'opioid treatment', 'opioid recovery', 'substance abuse prevention/recovery',
            'substance use prevention/recovery', 'youth substance abuse prevention',
            'therapeutic foster care/behavioral health'
        ]
        
        # If it's a mental health crisis service, categorize appropriately
        if any(mh_type in service_type.lower() for mh_type in mental_health_service_types):
            return 'Mental Health & Substance Use'
        else:
            return 'Crisis Services'
    
    # First, apply the migration map
    normalized_category = CATEGORY_MIGRATION_MAP.get(original_category, original_category)
    
    # Special handling for Government/Tribal Services
    if original_category == 'Government/Tribal Services' or normalized_category == 'Government Services':
        # Check for tribal keywords
        if ('tribal' in service_type or 
            'tribe' in org_name or 'tribal' in org_name or 
            'lumbee' in org_name or 'indian' in org_name or
            'tribal' in services_offered):
            normalized_category = 'Tribal Services'
            print(f"  → Categorizing as Tribal: {row.get('Organization Name')} (serviceType: {row.get('Service Type')})")
        else:
            normalized_category = 'Government Services'
    
    # Handle Food Services detection
    if ('food' in services_offered or 'meal' in services_offered or 
        'pantry' in services_offered or 'kitchen' in services_offered or
        'nutrition' in services_offered or 'feeding' in services_offered or
        'food bank' in org_name or 'soup kitchen' in org_name):
        # But exclude support groups
        if 'support group' not in service_type and 'anonymous' not in org_name and 'al-anon' not in org_name:
            normalized_category = 'Food Services'
    
    # Handle Healthcare Services - exclude support groups
    if original_category == 'Healthcare Services' and 'support group' in service_type:
        normalized_category = 'Community Services'
    
    # Law Enforcement detection
    if ('police' in org_name or 'sheriff' in org_name) and 'law enforcement' not in original_category.lower():
        normalized_category = 'Law Enforcement'
    
    # Handle unmapped categories
    if normalized_category not in CONSOLIDATED_CATEGORIES:
        if is_crisis:
            normalized_category = 'Crisis Services'
        else:
            # Default unmapped categories to Community Services
            print(f"  ⚠ Unmapped category: {original_category} for {row.get('Organization Name')}")
            normalized_category = 'Community Services'
    
    return normalized_category

def process_csv(input_file, output_file):
    """
    Process the CSV file and apply category normalization.
    
    Args:
        input_file: Path to the input CSV file
        output_file: Path to the output CSV file
    """
    print(f"Reading from: {input_file}")
    print(f"Writing to: {output_file}")
    print()
    
    # Track category changes
    category_changes = {}
    total_rows = 0
    
    # Read and process the CSV
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames
        
        # Process all rows
        rows = []
        for row in reader:
            total_rows += 1
            original_category = row['Category']
            normalized_category = normalize_category(row)
            
            # Track changes
            if original_category != normalized_category:
                key = f"{original_category} → {normalized_category}"
                category_changes[key] = category_changes.get(key, 0) + 1
            
            # Update the category
            row['Category'] = normalized_category
            rows.append(row)
    
    # Write the corrected CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    # Print summary
    print("\nSummary:")
    print(f"Total rows processed: {total_rows}")
    print(f"\nCategory changes made:")
    for change, count in sorted(category_changes.items()):
        print(f"  {change}: {count} organizations")
    
    # Count final categories
    final_counts = {}
    for row in rows:
        cat = row['Category']
        final_counts[cat] = final_counts.get(cat, 0) + 1
    
    print(f"\nFinal category distribution:")
    for cat in CONSOLIDATED_CATEGORIES:
        count = final_counts.get(cat, 0)
        if count > 0:
            print(f"  {cat}: {count} organizations")

if __name__ == "__main__":
    input_csv = "/home/jdew/github/robeson-asset-map/robeson-app/public/consolidated_robeson_migrated.csv"
    output_csv = "/home/jdew/github/robeson-asset-map/robeson-app/corrected_categories.csv"
    
    try:
        process_csv(input_csv, output_csv)
        print(f"\n✅ Successfully created corrected CSV file: {output_csv}")
    except Exception as e:
        print(f"\n❌ Error processing CSV: {e}")
        sys.exit(1)
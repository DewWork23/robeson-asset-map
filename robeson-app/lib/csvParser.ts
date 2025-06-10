import { Organization } from '@/types/organization';
import { withBasePath } from './basePath';

export async function loadOrganizations(): Promise<Organization[]> {
  try {
    const response = await fetch(withBasePath('/robeson_county.csv'));
    const text = await response.text();
    
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const organizations: Organization[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const org: Organization = {
          id: i.toString(),
          organizationName: values[0] || '',
          category: values[1] || '',
          serviceType: values[2] || '',
          address: values[3] || '',
          phone: values[4] || '',
          email: values[5] || '',
          website: values[6] || '',
          hours: values[7] || '',
          servicesOffered: values[8] || '',
          costPayment: values[9] || '',
          description: values[10] || '',
          crisisService: values[11]?.toLowerCase() === 'yes',
          languages: values[12] || '',
          specialNotes: values[13] || ''
        };
        organizations.push(org);
      }
    }
    
    return organizations;
  } catch (error) {
    console.error('Error loading organizations:', error);
    return [];
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function filterOrganizations(
  organizations: Organization[], 
  category?: string,
  searchTerm?: string
): Organization[] {
  let filtered = [...organizations];
  
  if (category && category !== 'All') {
    filtered = filtered.filter(org => org.category === category);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(org => 
      org.organizationName.toLowerCase().includes(term) ||
      org.servicesOffered.toLowerCase().includes(term) ||
      org.description.toLowerCase().includes(term) ||
      org.address.toLowerCase().includes(term)
    );
  }
  
  // Sort crisis services to the top
  filtered.sort((a, b) => {
    if (a.crisisService && !b.crisisService) return -1;
    if (!a.crisisService && b.crisisService) return 1;
    return 0;
  });
  
  return filtered;
}
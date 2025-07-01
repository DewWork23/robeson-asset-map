# Organizations Context

This context provides global access to the organizations data, preventing the need to reload from Google Sheets on every page navigation.

## Usage

### Using the Hook

```typescript
import { useOrganizations } from '@/contexts/OrganizationsContext';

export default function MyComponent() {
  const { organizations, loading, error, refetch } = useOrganizations();

  if (loading) {
    return <div>Loading organizations...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {organizations.map(org => (
        <div key={org.id}>{org.organizationName}</div>
      ))}
    </div>
  );
}
```

### Context API

The `useOrganizations` hook returns an object with:

- `organizations`: Array of Organization objects
- `loading`: Boolean indicating if data is being loaded
- `error`: Error message string or null
- `refetch`: Function to manually refresh the data

### Migration Guide

To migrate existing components:

1. Remove direct imports of `loadOrganizationsFromGoogleSheets`
2. Replace the `useState` and `useEffect` pattern with `useOrganizations`
3. Handle loading and error states appropriately

#### Before:
```typescript
const [organizations, setOrganizations] = useState<Organization[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadData() {
    try {
      const orgs = await loadOrganizationsFromGoogleSheets();
      setOrganizations(orgs);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      setLoading(false);
    }
  }
  loadData();
}, []);
```

#### After:
```typescript
const { organizations, loading, error } = useOrganizations();
```

### Benefits

1. **Performance**: Data is loaded once and cached in memory
2. **Consistency**: All components share the same data
3. **Simplicity**: Less boilerplate code in each component
4. **Error Handling**: Centralized error handling
5. **Refresh Capability**: Can manually refresh data when needed

### Notes

- The context still uses the existing localStorage caching from `googleSheetsParser.ts`
- Data is automatically loaded when the app starts
- The provider is added at the root layout level, making it available throughout the app
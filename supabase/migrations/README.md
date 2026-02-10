# Supabase Migrations

## Order of execution

1. `001_initial_schema.sql` - Initial database schema with PostGIS, tables, RLS
2. `002_seed_skills.sql` - Seed 60+ predefined skills
3. `003_matching_functions.sql` - Matching and distance calculation functions

## How to apply migrations

### Via Supabase Dashboard (SQL Editor)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the content of the migration file
5. Click "Run" to execute

Apply in order: 001 → 002 → 003

### Via Supabase CLI (if using local development)

```bash
supabase db push
```

## Migration 003: Matching Functions

This migration adds:

- **calculate_distance()**: Calculate distance between two lat/long points
- **update_location_from_coordinates()**: Trigger to auto-update PostGIS location from lat/long
- **find_matching_projects()**: Find relevant projects for a talent (skills + proximity)
- **find_matching_talents()**: Find relevant talents for a project (skills + proximity)

### Matching Algorithm

**For talents** (finding projects):
- Skills match: 60% weight
- Proximity: 40% weight
- Filters: Within max_distance OR remote possible
- Excludes: Already applied projects

**For projects** (finding talents):
- Skills match: 70% weight
- Proximity: 30% weight
- Filters: Within preferred_radius OR remote possible
- Excludes: Already applied talents

## Important Notes

- PostGIS extension must be enabled (already done in 001)
- Triggers automatically update `location` field when `latitude`/`longitude` change
- Spatial indexes (GIST) are created for performance
- RLS policies control data access (already configured)

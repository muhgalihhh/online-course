# Setup Instructions - Contact Page Updates

## Changes Made

### 1. Removed About/Tentang Page
- ✅ Removed "Tentang" navigation item from guest layout (`resources/js/layouts/guest-layout.tsx`)
- ✅ Removed the route for `/tentang` from `routes/web.php`
- ✅ Deleted the About page component (`resources/js/pages/tentang.tsx`)

### 2. Updated Contact Page to Use Real Database Data
- ✅ Modified `resources/js/pages/kontak.tsx` to use institution data from database
- ✅ The page now reads institution data through the `usePage` hook
- ✅ Contact information (address, phone, email) now comes from the `institutions` table

### 3. Created Institution Seeder
- ✅ Created `database/seeders/InstitutionSeeder.php` with default institution data
- ✅ Updated `DatabaseSeeder.php` to include the InstitutionSeeder

## Required Setup Steps

To apply these changes and populate the institution data, run the following commands in your Laravel environment:

```bash
# Run the institution seeder to populate the database
php artisan db:seed --class=InstitutionSeeder

# Or run all seeders
php artisan db:seed

# If you need to refresh the entire database with seeders
php artisan migrate:fresh --seed
```

## Database Structure

The `institutions` table has the following fields that are used in the contact page:
- `name`: Institution name (displayed in header/footer)
- `description`: Institution description (displayed in footer)
- `phone`: Phone number (displayed in contact info)
- `email`: Email address (displayed in contact info)
- `address`: Physical address (displayed in contact info and map section)
- `website`: Website URL (can be used for social media links)
- `photo_path`: Logo/photo path (optional)

## How the Data Flow Works

1. **Middleware**: `app/Http/Middleware/HandleInertiaRequests.php` shares the institution data to all pages
2. **Frontend**: Pages access this data using `usePage<PageProps>().props.institution`
3. **Contact Page**: Now displays real institution data instead of hardcoded values

## Updating Institution Data

To update the institution information, you can:

1. **Via Database Seeder**: Edit `database/seeders/InstitutionSeeder.php` and re-run the seeder
2. **Via Database**: Directly update the record in the `institutions` table
3. **Via Admin Panel**: If you have an admin panel, you can update through the InstitutionController

## Verification

After running the seeders, verify that:
1. The About/Tentang page is no longer accessible
2. The Contact page displays the correct institution data from the database
3. The footer in guest layout shows the correct institution information
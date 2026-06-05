# Supabase Storage Setup for Gallery Upload

To enable the gallery file upload functionality, you need to configure Supabase Storage:

## Steps to Configure Supabase Storage

1. **Log in to Supabase Dashboard**
   - Go to [https://supabase.com](https://supabase.com) and log in to your project

2. **Create a Storage Bucket**
   - Navigate to **Storage** > **Buckets**
   - Click **Create a new bucket**
   - Name it: `gallery`
   - Make sure to set it as **Public** (so images can be accessed via URL)
   - Click **Create bucket**

3. **Configure Bucket Policies (Optional but Recommended)**
   - Go to **Storage** > **Policies**
   - Select the `gallery` bucket
   - Create policies to restrict who can upload/delete files
   - Example policy:
     - **For uploads**: Allow authenticated users to upload to `gallery/`
     - **For public reads**: Allow all users to read from `gallery/`

## How It Works

When an admin uploads a gallery image:
1. The file is sent to `/api/admin/gallery` endpoint
2. The API uploads the file to Supabase Storage (`gallery` bucket)
3. A public URL is generated for the image
4. The gallery record is created in the database with the public URL
5. The main website Gallery component automatically fetches and displays the images

## Environment Variables

Make sure your `.env.local` file has:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

These are used by both the client and server for Supabase operations.

## Testing

1. Go to Admin Dashboard > Gallery section
2. Click "Add Gallery Item"
3. Fill in the form:
   - **Title**: Name of the gallery item
   - **Description**: Optional description
   - **Image File**: Select a JPG, PNG, or WebP file (max 5MB)
   - **Category**: Optional category
4. Click "Save"
5. The image will be uploaded to Supabase Storage and saved to the database
6. Visit the main website Gallery page to see the image displayed

## Troubleshooting

- **"Bucket not found" error**: Make sure you created a `gallery` bucket in Supabase Storage
- **"Public URL not accessible" error**: Make sure the bucket is set to Public
- **File size error**: Ensure the image is less than 5MB
- **File type error**: Only JPG, PNG, and WebP files are supported

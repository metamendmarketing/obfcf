import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // allow public read access
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'imageUrl',
      type: 'text',
      required: false,
      label: 'Image URL',
      admin: {
        description: 'HOW TO ADD AN IMAGE: 1) Upload your photo to Google Drive. 2) Right-click it → Share → set to "Anyone with the link" → Copy link. 3) Your link looks like: https://drive.google.com/file/d/FILE_ID/view — change it to: https://drive.google.com/uc?export=view&id=FILE_ID and paste it here.',
      },
    },
    {
      name: 'projectUrl',
      type: 'text',
      required: false,
      label: 'Learn More URL',
    },
  ],
}

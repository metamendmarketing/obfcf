import type { CollectionConfig } from 'payload'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'createdAt'],
  },
  access: {
    create: () => true, // allow visitors to subscribe
    read: ({ req: { user } }) => Boolean(user), // authenticated admin only
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
      required: false,
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'Website Popup',
      admin: {
        readOnly: true,
      },
    },
  ],
}

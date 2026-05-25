import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'
import { isStaff } from '../access/isStaff'
import { buildConfigSummary } from '../lib/build-config-summary'

export const OrderLines: CollectionConfig = {
  slug: 'order-lines',
  admin: {
    useAsTitle: 'configurationSummary',
    defaultColumns: ['configurationSummary', 'order', 'quantity', 'status'],
    group: 'Fulfillment',
  },
  hooks: {
    beforeChange: [
      // Populate the human-readable summary from the configuration JSON.
      // Runs on every create + update so manual edits to either the
      // template or the configuration refresh the summary. The API route
      // hits this via payload.create() in /api/v1/orders.
      async ({ data, originalDoc, req }) => {
        const config = data.configuration ?? originalDoc?.configuration
        if (!config) return data
        let templateName: string | undefined
        const templateRef = data.template ?? originalDoc?.template
        const templateId =
          templateRef && typeof templateRef === 'object'
            ? (templateRef as { id?: number | string }).id
            : templateRef
        if (templateId != null) {
          try {
            const tmpl = await req.payload.findByID({
              collection: 'product-templates',
              id: templateId as number | string,
              depth: 0,
            })
            templateName = (tmpl as { name?: string } | null)?.name
          } catch {
            // Template lookup failure → fall back to artistProductName so the
            // summary is still useful. Logged at the payload layer already.
          }
        }
        const displayName =
          templateName ?? data.artistProductName ?? originalDoc?.artistProductName
        data.configurationSummary = buildConfigSummary(displayName, config)
        return data
      },
    ],
  },
  access: {
    create: isStaff,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
    },
    {
      name: 'productionItem',
      type: 'relationship',
      relationTo: 'production-catalog',
      admin: {
        description:
          'Closest Artbox production SKU. Optional when a template + configuration uniquely describes the work.',
      },
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'product-templates',
      admin: {
        description: 'The product template the customer configured.',
      },
    },
    {
      name: 'configurationSummary',
      type: 'text',
      admin: {
        readOnly: true,
        description:
          'Auto-generated from the template + configuration. Shown in the list view so staff can read the build at a glance.',
      },
    },
    {
      type: 'collapsible',
      label: 'Raw configuration (debug)',
      admin: {
        initCollapsed: true,
        description:
          'Stored snapshot of the customer\'s build at order time. Normally you don\'t need this — the summary + display above show everything in human-readable form. Use this only to inspect or correct a misencoded order.',
      },
      fields: [
        {
          name: 'configuration',
          type: 'json',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'artistProductRef',
          type: 'text',
          admin: { description: "Artist site's own product identifier" },
        },
        {
          name: 'artistProductName',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'imageUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'High-resolution master image URL the artist site provides for printing.',
      },
    },
    {
      name: 'imageNotes',
      type: 'textarea',
      admin: { description: 'Cropping, color, or special handling notes' },
    },
    {
      type: 'row',
      fields: [
        { name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 1 },
        { name: 'lineSubtotal', type: 'number', required: true },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In production', value: 'in_production' },
        { label: 'Ready', value: 'ready' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Issue', value: 'issue' },
      ],
    },
    {
      name: 'shipmentTracking',
      type: 'text',
    },
    {
      name: 'shipmentCarrier',
      type: 'text',
    },
  ],
}

import type { GlobalConfig } from 'payload'

import { isAuthenticated } from '../../access/isAuthenticated'

// Per-site marketing module settings. Defaults are conservative: the module
// is off until the artist (or Artbox) explicitly enables it. Social-platform
// OAuth fields are scaffolded but not wired — the "Connect" buttons in the
// admin UI show "Coming soon" placeholders for v0.
export const MarketingSettings: GlobalConfig = {
  slug: 'marketing-settings',
  admin: {
    group: 'Marketing',
    description:
      'Configure your weekly digest, social handles, and trigger cadence. Whether this module is available to you is controlled by Artbox — contact us if you want it enabled or disabled for your site.',
  },
  access: {
    read: isAuthenticated,
    update: isAuthenticated,
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Weekly email digest',
      admin: {
        description:
          'A Friday-morning summary of active prompts + recent activity. Disable to opt out entirely.',
      },
      fields: [
        {
          name: 'weeklyDigestEnabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'digestDay',
          type: 'select',
          defaultValue: 'fri',
          options: [
            { label: 'Monday', value: 'mon' },
            { label: 'Tuesday', value: 'tue' },
            { label: 'Wednesday', value: 'wed' },
            { label: 'Thursday', value: 'thu' },
            { label: 'Friday', value: 'fri' },
            { label: 'Saturday', value: 'sat' },
            { label: 'Sunday', value: 'sun' },
          ],
        },
        {
          name: 'emailRecipient',
          type: 'email',
          admin: {
            description:
              'Where the digest is sent. Defaults to the logged-in user\'s email if left blank.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Social handles',
      admin: {
        description:
          'Used to tag the artist in draft copy. Leave blank to skip tagging for that platform.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'instagramHandle', type: 'text', label: 'Instagram @' },
            { name: 'facebookHandle', type: 'text', label: 'Facebook page' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'twitterHandle', type: 'text', label: 'Twitter / X @' },
            { name: 'pinterestHandle', type: 'text', label: 'Pinterest @' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Social account connections (coming soon)',
      admin: {
        description:
          'OAuth-backed posting is not implemented yet. Schema lives here so future versions can fill in tokens without a migration. The buttons in the admin currently show a "coming soon" placeholder.',
      },
      fields: [
        {
          name: 'instagramConnected',
          type: 'checkbox',
          defaultValue: false,
          admin: { readOnly: true, description: 'Set by the OAuth flow (not implemented).' },
        },
        {
          name: 'instagramToken',
          type: 'text',
          admin: { hidden: true },
        },
        {
          name: 'facebookConnected',
          type: 'checkbox',
          defaultValue: false,
          admin: { readOnly: true, description: 'Set by the OAuth flow (not implemented).' },
        },
        {
          name: 'facebookToken',
          type: 'text',
          admin: { hidden: true },
        },
        {
          name: 'twitterConnected',
          type: 'checkbox',
          defaultValue: false,
          admin: { readOnly: true, description: 'Set by the OAuth flow (not implemented).' },
        },
        {
          name: 'twitterToken',
          type: 'text',
          admin: { hidden: true },
        },
        {
          name: 'pinterestConnected',
          type: 'checkbox',
          defaultValue: false,
          admin: { readOnly: true, description: 'Set by the OAuth flow (not implemented).' },
        },
        {
          name: 'pinterestToken',
          type: 'text',
          admin: { hidden: true },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Trigger cadence',
      admin: {
        description:
          'How often the trigger engine looks for things to nudge about. Each rule has its own threshold; this sets the global pace.',
      },
      fields: [
        {
          name: 'catalogIdleDays',
          type: 'number',
          defaultValue: 14,
          min: 1,
          admin: {
            description:
              'Days without a new published artwork before the "no new work" prompt fires.',
          },
        },
        {
          name: 'galleryIdleDays',
          type: 'number',
          defaultValue: 60,
          min: 1,
          admin: {
            description:
              'Days without new artworks in a specific gallery before the "idle gallery" prompt fires.',
          },
        },
        {
          name: 'heroRotateDays',
          type: 'number',
          defaultValue: 30,
          min: 1,
          admin: {
            description:
              'Days the editorial featured artwork can sit unchanged before suggesting a rotation.',
          },
        },
      ],
    },
  ],
}

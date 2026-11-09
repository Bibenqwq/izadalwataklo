# iza.dalwa.taklo

A journal website with reader and writer access modes.

## Access modes

The **sulat** navigation button opens a role chooser:

- **Tagabasa** opens a file-manager-style archive. Readers can browse folders and preview saved entries, but cannot edit or delete them.
- **Tagasulat** prompts for the writer password before opening the journal editor.

The writer password is checked in the client-side app, so this is only a basic interface gate, not secure authentication. Anyone with access to the site code can inspect it. Use a server-side authentication system to protect private writing.

Saved entries and folders use browser `localStorage`; they are not shared across different browsers or devices.

Writers can create a 9:16 Story image from a saved entry and download it or send it through the device's native share menu. Choose Instagram or Facebook from that menu if available, then select Story in the social app. The website cannot publish directly to either platform.

## Development

```sh
npm install
npm run dev
```

## Validation

```sh
npm run lint
npm run build
```

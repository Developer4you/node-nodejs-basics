import fs from 'fs/promises';

export async function listDirectoryContents(currentDir) {
    try {
        const items = await fs.readdir(currentDir, { withFileTypes: true });

        const folders = [];
        const files = [];

        for (const item of items) {
            if (item.isDirectory()) {
                folders.push({ Name: item.name, Type: 'directory' });
            } else {
                files.push({ Name: item.name, Type: 'file' });
            }
        }

        folders.sort((a, b) => a.Name.localeCompare(b.Name));
        files.sort((a, b) => a.Name.localeCompare(b.Name));

        const result = [...folders, ...files];
        console.table(result);
    } catch {
        throw new Error('\x1b[31m%s\x1b[0m', 'Operation failed');
    }
}
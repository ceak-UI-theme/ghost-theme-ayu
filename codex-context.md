# Ghost Theme Development Context

This repository contains a customized Ghost theme based on the **Wave theme**.

The goal is to incrementally modify the Wave theme according to the project documentation while preserving the original theme structure and build pipeline.

---

# Runtime Environment

Ghost is running inside Docker under WSL2.

Ghost container:

ghostdev_ghost

Image:

ghost:5-alpine

Ghost site URL:

http://172.22.0.199:2368/

MySQL container:

ghostdev_mysql

---

# Paths

## Windows

Ghost runtime project

D:\workspace\02.works\ghost-dev

Theme development repo

D:\workspace\02.works\ghost-theme-ayu

---

## WSL2

Ghost runtime

/mnt/d/workspace/02.works/ghost-dev

Theme source repository

/mnt/d/workspace/02.works/ghost-theme-ayu

Ghost content directory

/mnt/d/workspace/02.works/ghost-dev/content

Installed runtime theme

/mnt/d/workspace/02.works/ghost-dev/content/themes/wave

---

# Active Theme

wave

The repository is a **copy of the Wave theme with minor custom modifications**.

Do NOT restructure the theme architecture.

---

# Development Repository

All theme development must occur in this directory:

/mnt/d/workspace/02.works/ghost-theme-ayu

This directory is considered the **source of truth**.

Never modify runtime theme files directly unless explicitly required.

---

# Deployment Strategy

Workflow:

1. Modify files in the development repository

/mnt/d/workspace/02.works/ghost-theme-ayu

2. Run theme build pipeline (if present)

3. Package the theme as a zip file

wave-ayu-theme.zip

4. Install or overwrite the runtime theme

/mnt/d/workspace/02.works/ghost-dev/content/themes/wave

5. Refresh Ghost site to verify changes

http://172.22.0.199:2368/

Container restart is usually NOT required.

---

# Theme Structure (Wave)

Typical structure:

assets/
partials/
default.hbs
index.hbs
post.hbs
tag.hbs
page.hbs
package.json
gulpfile.js
routes.yaml

Preserve this structure.

---

# Asset Build Rules

Wave uses a build pipeline.

Source files

assets/css
assets/js

Generated files

assets/built

Rules:

- Modify only source files.
- Rebuild assets using the existing build pipeline.
- Never manually edit assets/built unless no build pipeline exists.

---

# Development Rules

1. Preserve Wave theme structure.
2. Prefer modifying existing templates rather than creating new ones.
3. Reuse partials when possible.
4. Keep CSS modular.
5. Avoid large structural changes.
6. Keep modifications minimal and incremental.

---

# Implementation Reference

The implementation is defined by these documents:

ghost-blog-spec.md  
ghost-theme-implementation.md  
ghost-theme-file-map.md  
ghost-theme-dev-checklist.md  

Codex should read these before making changes.

---

# Verification

After implementing a feature, verify manually using:

http://172.22.0.199:2368/

Check:

home page  
tag page  
post page  
custom pages  
navigation  
mobile layout  

---

# Expected Output

When completing a task, Codex should provide:

1. Files changed
2. Reason for change
3. How to verify the feature
4. Updated theme zip (wave-ayu-theme.zip)
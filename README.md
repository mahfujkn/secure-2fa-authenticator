# Secure 2FA Authenticator

<div align="center">

![Secure 2FA Authenticator Banner](public/icons/icon-128.png)

### 🔒 Privacy-First, 100% Offline 2FA Authenticator for Chromium Browsers

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![100% Offline](https://img.shields.io/badge/Network-100%25%20Offline-brightgreen.svg)](#privacy--security-guarantee)
[![Zero Telemetry](https://img.shields.io/badge/Telemetry-Zero%20Tracking-purple.svg)](#privacy--security-guarantee)
[![Built with React 19](https://img.shields.io/badge/Built%20with-React%2019%20%2B%20TypeScript-61dafb.svg)](package.json)
[![Release Version](https://img.shields.io/badge/Version-v1.0.0-orange.svg)](https://github.com/mahfujkn/secure-2fa-authenticator/releases)

[**Download Release (.ZIP)**](https://github.com/mahfujkn/secure-2fa-authenticator/releases) • [**Features**](#-features) • [**Installation**](#-installation-guide) • [**Screenshots**](#-screenshots) • [**Privacy Architecture**](#-privacy--security-guarantee)

</div>

---

## 📖 Overview

**Secure 2FA Authenticator** is a modern, lightweight, privacy-first browser extension for generating RFC 6238 Time-based One-Time Passwords (TOTP) directly in your browser. 

Unlike traditional authenticators, **Secure 2FA Authenticator** operates completely offline without cloud servers, user accounts, databases, tracking pixels, or remote APIs. Your secrets never leave your device.

---

## ✨ Features

- 🛡️ **100% Offline & Private**: Zero network requests, zero telemetry, zero analytics, zero external scripts.
- ⚡ **Ephemeral Quick TOTP (Multi-Key Support)**: Paste one or dozens of secrets or `otpauth://` URIs simultaneously to generate instant, temporary 2FA codes. All secrets stay strictly in runtime RAM and are never persisted to storage.
- 📷 **Local QR Code Import Suite**:
  - Drag-and-drop or upload QR images (PNG, JPG, WEBP, GIF).
  - Paste screenshot from clipboard (`Ctrl + V`).
  - **Scan Current Webpage**: Automatically detects and decodes QR codes from `<img>`, `<canvas>`, inline `<svg>`, and background images.
  - **Select QR Area**: Drag a region on the screen to snip and decode difficult or nested QR codes.
  - **Right-Click Context Menu**: Right-click any image on the web and select *"Add QR to Authenticator"*.
- 👁️ **Global & Per-Account Code Visibility**:
  - *Hide Codes by Default* setting to mask codes (`••• •••` / `•••• ••••`) upon opening.
  - Quick eye toggle button and three-dot menu options (*Show Code / Hide Code*).
  - Copying while hidden copies clean numeric OTPs (`482913`) without exposing the code on screen.
- 🎨 **Modern Security-Focused UI**:
  - Dark Obsidian (Recommended), Light, and System themes.
  - Compact & Comfortable account list density options.
  - Linear Progress Bar & Circular Ring countdown timers.
  - Pinned Favorites section for frequently accessed accounts.
- 🔍 **Instant Search & Filtering**: Real-time filtering by service issuer or username.
- 💾 **Safe Local Backup & Restore**: Export encrypted/plain JSON backups with duplicate conflict resolution (*Skip*, *Replace*, or *Keep Both*).

---

## 📸 Screenshots

<div align="center">

### 1. Main Authenticator & OTP List (Dark Obsidian Theme)
![Main Account List](Screenshots/Screenshot%202026-08-15%20163231.png)

---

### 2. Multi-Key Quick TOTP (Instant Zero-Persistence Generation)
![Quick TOTP](Screenshots/Screenshot%202026-08-15%20163258.png)

---

### 3. QR Code Import & Browser Capture Suite
![QR Code Import](Screenshots/Screenshot%202026-08-15%20163329.png)

---

### 4. Simplified Add Account with Smart Auto-Detection
![Add Account Form](Screenshots/Screenshot%202026-08-15%20163358.png)

---

### 5. Settings & Code Visibility Preferences
![General Settings](Screenshots/Screenshot%202026-08-15%20163427.png)

---

### 6. Local Backup & Migration Tools
![Backup & Restore](Screenshots/Screenshot%202026-08-15%20163505.png)

---

### 7. About & Privacy Architecture
![About & Developer Credit](Screenshots/Screenshot%202026-08-15%20163740.png)

---

### 8. Fullscreen Dashboard Interface
![Fullscreen Dashboard](Screenshots/Screenshot%202026-08-15%20163616.png)

</div>

---

## 🚀 Installation Guide

### Method 1: Install from GitHub Releases (Recommended)

1. Go to the [**Releases Page**](https://github.com/mahfujkn/secure-2fa-authenticator/releases) and download the latest `secure-2fa-authenticator-v1.0.0.zip`.
2. Extract / Unzip the downloaded `.zip` file to a folder on your computer (e.g., `secure-2fa-authenticator`).
3. Open your Chromium-based browser (Chrome, Microsoft Edge, Brave, Opera, Vivaldi):
   - **Google Chrome**: navigate to `chrome://extensions`
   - **Microsoft Edge**: navigate to `edge://extensions`
   - **Brave**: navigate to `brave://extensions`
4. Toggle on **Developer mode** in the top right corner.
5. Click **Load unpacked** in the top left corner.
6. Select the unzipped `dist` or extracted extension folder.
7. 🎉 **Secure 2FA Authenticator** is now installed and ready to use! Pin it to your extension toolbar for quick access.

---

### Method 2: Build from Source

#### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm, pnpm, or yarn

#### Build Steps

```bash
# 1. Clone the repository
git clone https://github.com/mahfujkn/secure-2fa-authenticator.git

# 2. Enter the project directory
cd secure-2fa-authenticator

# 3. Install dependencies
npm install

# 4. Run tests
npm test

# 5. Build production bundle
npm run build
```

The production-ready extension will be compiled into the `dist/` directory.

To load into your browser:
1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `dist` folder.

---

## 🔒 Privacy & Security Guarantee

| Privacy Pillar | Guarantee |
| :--- | :--- |
| **100% Local & Offline** | Zero network requests. No external APIs, CDNs, or remote scripts are required for normal operation. |
| **No Cloud Storage** | All persistent account secrets are stored solely inside your browser's local sandbox storage (`chrome.storage.local`). |
| **No Telemetry or Tracking** | Zero analytics, zero tracking pixels, zero crash reporting, zero user profiling. |
| **Ephemeral Quick TOTP** | Quick TOTP temporary secrets stay strictly in runtime RAM and are discarded immediately when you close the session. |
| **Local QR Decoding** | Uploaded and captured QR codes are processed locally in browser memory via HTML5 Canvas. No image data is ever uploaded. |

---

## 🛠️ Tech Stack

- **Framework**: React 19, TypeScript
- **Bundler & Build Tool**: Vite 6, esbuild
- **Cryptography Engine**: Web Crypto API (SubtleCrypto HMAC-SHA1, HMAC-SHA256, HMAC-SHA512)
- **QR Decoding**: Local canvas-based `jsQR` (100% offline)
- **Icons**: Lucide React
- **Testing**: Vitest

---

## 👨‍💻 Author & Developer

Developed with ❤️ by **Mahfuj Khan Rafsan**

- **GitHub Profile**: [@mahfujkn](https://github.com/mahfujkn)
- **Project Repository**: [github.com/mahfujkn/secure-2fa-authenticator](https://github.com/mahfujkn/secure-2fa-authenticator)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

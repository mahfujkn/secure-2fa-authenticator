/**
 * Secure 2FA Authenticator - Background Service Worker (Manifest V3)
 * Handles context menus, script injection, and navigation without remote dependencies.
 */

// Helper to inject content.js if not yet loaded in the tab
async function ensureContentScriptAndSend(tabId: number, message: { type: string; srcUrl?: string }): Promise<any> {
  try {
    return await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  } catch {
    // If receiving end doesn't exist, inject content script dynamically
    try {
      if (chrome.scripting) {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js'],
        });
      }
    } catch {
      return null;
    }

    await new Promise((r) => setTimeout(r, 60));

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Function to register context menus cleanly
function registerContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // 1. Right click on image
    chrome.contextMenus.create({
      id: 'add-qr-image',
      title: 'Add QR to Authenticator',
      contexts: ['image', 'video', 'link'],
    });

    // 2. Scan entire page
    chrome.contextMenus.create({
      id: 'scan-page-qr',
      title: 'Scan Page for QR Code',
      contexts: ['page', 'frame'],
    });

    // 3. Right click on selected text
    chrome.contextMenus.create({
      id: 'add-otpauth-selection',
      title: 'Add TOTP URI to Authenticator',
      contexts: ['selection'],
    });

    // 4. Open Authenticator Dashboard
    chrome.contextMenus.create({
      id: 'open-authenticator',
      title: 'Open Secure 2FA Authenticator',
      contexts: ['action'],
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  registerContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  registerContextMenus();
});

// Also register on worker init
registerContextMenus();

// Context Menu Click Listener
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'open-authenticator') {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    return;
  }

  if (info.menuItemId === 'add-otpauth-selection' && info.selectionText) {
    const text = info.selectionText.trim();
    if (text.toLowerCase().startsWith('otpauth://')) {
      chrome.tabs.create({
        url: chrome.runtime.getURL(`dashboard.html?import_uri=${encodeURIComponent(text)}`),
      });
    }
    return;
  }

  if (info.menuItemId === 'scan-page-qr' && tab?.id) {
    const response = await ensureContentScriptAndSend(tab.id, { type: 'SCAN_PAGE_QR' });
    if (response && Array.isArray(response.rawResults) && response.rawResults.length > 0) {
      const firstTotp = response.rawResults.find((t: string) => t.toLowerCase().startsWith('otpauth://'));
      if (firstTotp) {
        chrome.tabs.create({
          url: chrome.runtime.getURL(`dashboard.html?import_uri=${encodeURIComponent(firstTotp)}`),
        });
        return;
      }
    }
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html?action=scan_qr') });
    return;
  }

  if (info.menuItemId === 'add-qr-image' && tab?.id) {
    const targetUrl = info.srcUrl || info.linkUrl;
    if (targetUrl) {
      const response = await ensureContentScriptAndSend(tab.id, {
        type: 'DECODE_QR_IMAGE',
        srcUrl: targetUrl,
      });

      if (response && response.otpUri) {
        chrome.tabs.create({
          url: chrome.runtime.getURL(`dashboard.html?import_uri=${encodeURIComponent(response.otpUri)}`),
        });
        return;
      }
    }

    // Fallback: scan page
    const pageResponse = await ensureContentScriptAndSend(tab.id, { type: 'SCAN_PAGE_QR' });
    if (pageResponse && Array.isArray(pageResponse.rawResults) && pageResponse.rawResults.length > 0) {
      const firstTotp = pageResponse.rawResults.find((t: string) => t.toLowerCase().startsWith('otpauth://'));
      if (firstTotp) {
        chrome.tabs.create({
          url: chrome.runtime.getURL(`dashboard.html?import_uri=${encodeURIComponent(firstTotp)}`),
        });
        return;
      }
    }

    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html?action=scan_qr') });
  }
});

// Runtime messages from Content Script (e.g. when Select QR Area completes)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'QR_SCANNED_SUCCESS' && message.otpUri) {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`dashboard.html?import_uri=${encodeURIComponent(message.otpUri)}`),
    });
    sendResponse({ received: true });
    return true;
  }
});

/**
 * Safe Browser Tab QR Scanner Helper
 * Injects content script if necessary and securely communicates with the active tab.
 */

export interface PageScanResult {
  success: boolean;
  rawResults?: string[];
  otpUri?: string;
  error?: string;
  canceled?: boolean;
}

export async function sendTabMessageWithInjection(
  tabId: number,
  message: { type: string; srcUrl?: string }
): Promise<any> {
  // Try sending message directly
  const trySend = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.sendMessage(tabId, message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  try {
    return await trySend();
  } catch {
    // If receiving end does not exist, inject content.js dynamically
    try {
      if (chrome.scripting) {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js'],
        });
      }
    } catch (injectErr: unknown) {
      throw new Error(
        injectErr instanceof Error
          ? injectErr.message
          : "Cannot access this webpage (internal browser or webstore pages are restricted)."
      );
    }

    // Wait a brief moment for listeners to initialize
    await new Promise((r) => setTimeout(r, 80));

    try {
      return await trySend();
    } catch (retryErr: unknown) {
      throw new Error(
        retryErr instanceof Error ? retryErr.message : "Failed to communicate with page."
      );
    }
  }
}

export async function scanActiveTab(): Promise<PageScanResult> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return { success: false, error: 'Extension runtime not available.' };
  }

  try {
    const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });

    const activeTab = tabs[0];
    if (!activeTab || !activeTab.id) {
      return { success: false, error: 'No active webpage found.' };
    }

    if (
      activeTab.url &&
      (activeTab.url.startsWith('chrome://') ||
        activeTab.url.startsWith('edge://') ||
        activeTab.url.startsWith('chrome-extension://') ||
        activeTab.url.startsWith('https://chromewebstore.google.com') ||
        activeTab.url.startsWith('about:'))
    ) {
      return {
        success: false,
        error: 'Browser security restricts scanning internal browser pages. Please try on a standard webpage.',
      };
    }

    const response = await sendTabMessageWithInjection(activeTab.id, { type: 'SCAN_PAGE_QR' });
    if (!response || !Array.isArray(response.rawResults)) {
      return { success: false, error: "No QR codes found on this page." };
    }

    return {
      success: true,
      rawResults: response.rawResults,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "We couldn't scan the current page.",
    };
  }
}

export async function selectQrAreaActiveTab(): Promise<PageScanResult> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return { success: false, error: 'Extension runtime not available.' };
  }

  try {
    const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });

    const activeTab = tabs[0];
    if (!activeTab || !activeTab.id) {
      return { success: false, error: 'No active webpage found.' };
    }

    if (
      activeTab.url &&
      (activeTab.url.startsWith('chrome://') ||
        activeTab.url.startsWith('edge://') ||
        activeTab.url.startsWith('chrome-extension://') ||
        activeTab.url.startsWith('https://chromewebstore.google.com') ||
        activeTab.url.startsWith('about:'))
    ) {
      return {
        success: false,
        error: 'Browser security restricts scanning internal browser pages. Please try on a standard webpage.',
      };
    }

    const response = await sendTabMessageWithInjection(activeTab.id, { type: 'SELECT_QR_AREA' });
    if (!response) {
      return { success: false, error: 'Area selection canceled or unavailable.' };
    }

    if (response.canceled) {
      return { success: false, canceled: true };
    }

    if (response.otpUri) {
      return { success: true, otpUri: response.otpUri };
    }

    return { success: false, error: 'No QR code found in selected area.' };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Area selection failed.',
    };
  }
}

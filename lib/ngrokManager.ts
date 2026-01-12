// ngrok tunnel manager for localhost webhook testing
// Only used in development mode
// Uses the official @ngrok/ngrok SDK

let tunnelUrl: string | null = null;
let tunnelPromise: Promise<string | null> | null = null;
let listener: any = null;

export async function startTunnel(port: number = 3000): Promise<string | null> {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    console.log('[ngrok] Skipping tunnel in non-development environment');
    return null;
  }

  // Check for authtoken
  const authtoken = process.env.NGROK_AUTHTOKEN;
  if (!authtoken) {
    console.warn('[ngrok] NGROK_AUTHTOKEN not set. Webhooks will not be available in development.');
    console.warn('[ngrok] Get your free authtoken at: https://dashboard.ngrok.com/get-started/your-authtoken');
    return null;
  }

  // Return cached URL if already connected
  if (tunnelUrl) {
    return tunnelUrl;
  }

  // Return existing promise if tunnel is being started
  if (tunnelPromise) {
    return tunnelPromise;
  }

  // Start new tunnel
  tunnelPromise = createTunnel(port, authtoken);
  tunnelUrl = await tunnelPromise;
  tunnelPromise = null;
  
  return tunnelUrl;
}

async function createTunnel(port: number, authtoken: string): Promise<string | null> {
  try {
    // Dynamically import @ngrok/ngrok to avoid issues in production builds
    const ngrok = await import('@ngrok/ngrok');
    
    console.log(`[ngrok] Starting tunnel to localhost:${port}...`);
    
    // Create a forward listener with authtoken
    listener = await ngrok.forward({
      addr: port,
      authtoken: authtoken,
    });
    
    const url = listener.url();
    console.log(`[ngrok] Tunnel established: ${url}`);
    
    return url;
  } catch (error: any) {
    console.error('[ngrok] Failed to start tunnel:', error.message);
    
    // Common error handling
    if (error.message?.includes('authtoken')) {
      console.error('[ngrok] Invalid or expired authtoken. Please update NGROK_AUTHTOKEN.');
    } else if (error.message?.includes('address already in use')) {
      console.error('[ngrok] Port already in use. Try closing other ngrok instances.');
    }
    
    return null;
  }
}

export async function stopTunnel(): Promise<void> {
  if (listener) {
    try {
      await listener.close();
      console.log('[ngrok] Tunnel disconnected');
    } catch (error) {
      console.error('[ngrok] Error disconnecting:', error);
    }
    listener = null;
    tunnelUrl = null;
  }
}

export function getTunnelUrl(): string | null {
  return tunnelUrl;
}

export function isTunnelActive(): boolean {
  return tunnelUrl !== null;
}

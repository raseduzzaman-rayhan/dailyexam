import { GoogleAuth } from 'google-auth-library';

const syncCache = new Set([
  'localhost',
  '127.0.0.1',
  'nursify-57c26.firebaseapp.com',
  'nursify-57c26.web.app'
]);

let syncInProgress = false;

export async function ensureDomainAuthorized(host) {
  if (!host) return;

  // Clean host (remove port if present)
  const domain = host.split(':')[0].trim().toLowerCase();
  if (!domain || syncCache.has(domain)) {
    return;
  }

  // Only attempt for valid domain formats
  if (!domain.includes('.') && domain !== 'localhost') {
    return;
  }

  if (syncInProgress) return;

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountRaw) return;

  try {
    syncInProgress = true;
    const sa = typeof serviceAccountRaw === 'string'
      ? JSON.parse(serviceAccountRaw)
      : serviceAccountRaw;

    const projectId = sa.project_id || process.env.FIREBASE_PROJECT_ID || 'nursify-57c26';

    const auth = new GoogleAuth({
      credentials: sa,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const getRes = await client.request({
      url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`
    });

    const currentDomains = getRes.data?.authorizedDomains || [];
    currentDomains.forEach(d => syncCache.add(d.toLowerCase()));

    if (syncCache.has(domain)) {
      return;
    }

    const updatedDomains = Array.from(new Set([...currentDomains, domain]));

    await client.request({
      method: 'PATCH',
      url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=authorizedDomains`,
      data: {
        authorizedDomains: updatedDomains
      }
    });

    syncCache.add(domain);
    console.log(`[Firebase Auth] Successfully added domain to authorized domains: ${domain}`);
  } catch (err) {
    console.warn(`[Firebase Auth] Domain sync notice for ${domain}:`, err.message);
  } finally {
    syncInProgress = false;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

function resolveAssetUrl(url) {
  if (!url || /^(data:|blob:|https?:\/\/)/i.test(url)) {
    return url;
  }

  return API_BASE_URL && url.startsWith('/') ? `${API_BASE_URL}${url}` : url;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao acessar ${path}`);
  }

  return response.json();
}

export function getHome() {
  return request('/api/home');
}

export function createLead(payload) {
  return request('/api/leads', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function uploadProductImages(files, { productName } = {}) {
  const formData = new FormData();
  formData.append('productName', productName || 'Produto');

  Array.from(files || []).forEach((file) => {
    formData.append('images', file);
  });

  const response = await fetch(`${API_BASE_URL}/api/uploads/product-images`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    let message = `Erro ${response.status} ao enviar imagens.`;

    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      // Keep the generic upload error.
    }

    throw new Error(message);
  }

  const payload = await response.json();

  return {
    images: (payload.images || []).map((image) => ({
      ...image,
      url: resolveAssetUrl(image.url)
    }))
  };
}

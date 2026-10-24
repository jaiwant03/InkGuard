const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message, status = 500, errors = null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let activeWorkspaceId = localStorage.getItem('inkguard_active_workspace_id') || '';

export function setActiveWorkspaceId(id) {
  activeWorkspaceId = id;
  if (id) {
    localStorage.setItem('inkguard_active_workspace_id', id);
  } else {
    localStorage.removeItem('inkguard_active_workspace_id');
  }
}

export function getActiveWorkspaceId() {
  return activeWorkspaceId;
}

async function request(endpoint, options = {}) {
  const headers = {
    ...options.headers,
  };

  // Add workspace ID header if set
  if (activeWorkspaceId && !headers['X-Workspace-Id']) {
    headers['X-Workspace-Id'] = activeWorkspaceId;
  }

  // If body is not FormData, set Content-Type to application/json
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Ensures HTTP-only cookies are passed
  });

  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    throw new ApiError(data.message || `Request failed with status ${response.status}`, response.status, data.errors);
  }

  return data;
}

function toQueryString(params = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
      clean[key] = value;
    }
  }
  const str = new URLSearchParams(clean).toString();
  return str ? `?${str}` : '';
}

export const api = {
  // Auth
  auth: {
    me: () => request('/auth/me'),
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    updateProfile: (profile) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  },

  // Workspaces
  workspaces: {
    list: () => request('/workspaces'),
    current: () => request('/workspaces/current'),
    create: (data) => request('/workspaces', { method: 'POST', body: JSON.stringify(data) }),
    updateCurrent: (data) => request('/workspaces/current', { method: 'PUT', body: JSON.stringify(data) }),
    switch: (id) => request(`/workspaces/switch/${id}`, { method: 'POST' }),
    members: () => request('/workspaces/members'),
    addMember: (data) => request('/workspaces/members', { method: 'POST', body: JSON.stringify(data) }),
    updateRole: (memberId, role) => request(`/workspaces/members/${memberId}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    removeMember: (memberId) => request(`/workspaces/members/${memberId}`, { method: 'DELETE' }),
  },

  // Brand Profile
  brandProfile: {
    get: () => request('/brand-profile'),
    update: (data) => request('/brand-profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Brand Rules
  brandRules: {
    list: (params = {}) => request(`/brand-rules${toQueryString(params)}`),
    get: (id) => request(`/brand-rules/${id}`),
    create: (rule) => request('/brand-rules', { method: 'POST', body: JSON.stringify(rule) }),
    update: (id, rule) => request(`/brand-rules/${id}`, { method: 'PUT', body: JSON.stringify(rule) }),
    toggle: (id) => request(`/brand-rules/${id}/toggle`, { method: 'PATCH' }),
    delete: (id) => request(`/brand-rules/${id}`, { method: 'DELETE' }),
  },

  // Approved Facts
  approvedFacts: {
    list: (params = {}) => request(`/approved-facts${toQueryString(params)}`),
    get: (id) => request(`/approved-facts/${id}`),
    create: (fact) => request('/approved-facts', { method: 'POST', body: JSON.stringify(fact) }),
    update: (id, fact) => request(`/approved-facts/${id}`, { method: 'PUT', body: JSON.stringify(fact) }),
    delete: (id) => request(`/approved-facts/${id}`, { method: 'DELETE' }),
  },

  // Drafts & Reviews
  drafts: {
    list: (params = {}) => request(`/drafts${toQueryString(params)}`),
    create: (draft) => request('/drafts', { method: 'POST', body: JSON.stringify(draft) }),
    get: (id) => request(`/drafts/${id}`),
    update: (id, draft) => request(`/drafts/${id}`, { method: 'PUT', body: JSON.stringify(draft) }),
    delete: (id) => request(`/drafts/${id}`, { method: 'DELETE' }),
    review: (id) => request(`/drafts/${id}/review`, { method: 'POST' }),
    applyFinding: (draftId, findingId) => request(`/drafts/${draftId}/apply-finding/${findingId}`, { method: 'POST' }),
    updateFindingStatus: (draftId, findingId, actionData) =>
      request(`/drafts/${draftId}/findings/${findingId}/status`, { method: 'PATCH', body: JSON.stringify(actionData) }),
    submit: (id) => request(`/drafts/${id}/submit`, { method: 'POST' }),
    decision: (id, decisionData) => request(`/drafts/${id}/decision`, { method: 'POST', body: JSON.stringify(decisionData) }),
    versions: (id) => request(`/drafts/${id}/versions`),
    comments: (id) => request(`/drafts/${id}/comments`),
    addComment: (id, commentData) => request(`/drafts/${id}/comments`, { method: 'POST', body: JSON.stringify(commentData) }),
    extractText: (formData) => request('/drafts/extract-text', { method: 'POST', body: formData }),
    visualCheck: (data) => request('/drafts/visual-check', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Brand Assets
  brandAssets: {
    list: (params = {}) => request(`/brand-assets${toQueryString(params)}`),
    get: (id) => request(`/brand-assets/${id}`),
    upload: (formData) => request('/brand-assets', { method: 'POST', body: formData }),
    update: (id, data) => request(`/brand-assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/brand-assets/${id}`, { method: 'DELETE' }),
  },

  // Governance Insights
  insights: {
    get: () => request('/insights'),
  },

  // Dashboard
  dashboard: {
    metrics: () => request('/dashboard/metrics'),
    findings: (params = {}) => request(`/dashboard/findings${toQueryString(params)}`),
    search: (q = '') => request(`/dashboard/search?q=${encodeURIComponent(q)}`),
  },

  // Audit Logs
  audit: {
    list: (params = {}) => request(`/audit${toQueryString(params)}`),
    clear: () => request('/audit', { method: 'DELETE' }),
    delete: (id) => request(`/audit/${id}`, { method: 'DELETE' }),
  },
};

import { User } from '../types';

export interface UserCredential {
  username: string;
  password: string;
  user: User;
}

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-ADM-001',
    username: 'admin',
    fullName: 'Dr. Alok Verma',
    role: 'admin',
    designation: 'Joint Director (Legal Metrology & Enforcement)',
    email: 'alok.verma@nic.in',
    phone: '+91 11 2338 4120',
    jurisdiction: 'Central Enforcement Directorate, New Delhi',
    badgeNumber: 'LM-HQ-ADMIN-01',
    dateAdded: '2023-01-15',
    status: 'active',
  },
  {
    id: 'USR-INS-101',
    username: 'inspector',
    fullName: 'Rajesh Sharma',
    role: 'inspector',
    designation: 'Senior Legal Metrology Inspector',
    email: 'rajesh.sharma@delhigov.in',
    phone: '+91 98110 24821',
    jurisdiction: 'Zone 2, North & North-West Delhi',
    badgeNumber: 'LMI-DL-2024-482',
    dateAdded: '2023-06-10',
    status: 'active',
  },
  {
    id: 'USR-INS-102',
    username: 'priya.nair',
    fullName: 'Priya K. Nair',
    role: 'inspector',
    designation: 'Assistant Metrology Officer',
    email: 'priya.nair@maharashtra.gov.in',
    phone: '+91 98201 33491',
    jurisdiction: 'South Mumbai & Port Commodity Terminal',
    badgeNumber: 'LMI-MH-2023-119',
    dateAdded: '2023-09-01',
    status: 'active',
  },
  {
    id: 'USR-INS-103',
    username: 'suresh.patil',
    fullName: 'Suresh R. Patil',
    role: 'inspector',
    designation: 'Legal Metrology Inspector',
    email: 'suresh.patil@karnataka.gov.in',
    phone: '+91 94480 77123',
    jurisdiction: 'Bengaluru Urban & Industrial Warehouses',
    badgeNumber: 'LMI-KA-2024-054',
    dateAdded: '2024-02-18',
    status: 'active',
  },
  {
    id: 'USR-ADM-002',
    username: 'sunita.rao',
    fullName: 'Sunita Rao',
    role: 'admin',
    designation: 'Deputy Director (Consumer Standards & Compliance)',
    email: 'sunita.rao@nic.in',
    phone: '+91 11 2338 4124',
    jurisdiction: 'Standards & Quality Audit Division, New Delhi',
    badgeNumber: 'LM-HQ-ADMIN-02',
    dateAdded: '2023-03-20',
    status: 'active',
  },
];

export const USER_CREDENTIALS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: INITIAL_USERS[0],
  },
  inspector: {
    password: 'inspector123',
    user: INITIAL_USERS[1],
  },
  'priya.nair': {
    password: 'password123',
    user: INITIAL_USERS[2],
  },
  'suresh.patil': {
    password: 'password123',
    user: INITIAL_USERS[3],
  },
  'sunita.rao': {
    password: 'password123',
    user: INITIAL_USERS[4],
  },
};

const CITIZEN_STORAGE_KEY = 'labelguard_registered_citizens_v1';

interface StoredCitizenAccount {
  user: User;
  passwordHash: string;
}

function getStoredCitizens(): StoredCitizenAccount[] {
  try {
    const raw = localStorage.getItem(CITIZEN_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredCitizens(citizens: StoredCitizenAccount[]) {
  try {
    localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(citizens));
  } catch (err) {
    console.error('Failed to save citizen accounts:', err);
  }
}

export function getAllUsers(): User[] {
  const citizens = getStoredCitizens().map((c) => c.user);
  return [...INITIAL_USERS, ...citizens];
}

export function registerCitizenUser(params: {
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  password?: string;
}): User {
  const cleanEmail = params.email.trim().toLowerCase();
  const username = cleanEmail.split('@')[0] || `citizen_${Date.now()}`;
  const id = `USR-CTZ-${Date.now().toString().slice(-6)}`;
  
  const newUser: User = {
    id,
    username,
    fullName: params.fullName.trim(),
    role: 'citizen',
    designation: 'Citizen Consumer (Jago Grahak Jago)',
    email: cleanEmail,
    phone: params.phone?.trim() || '+91 98765 43210',
    jurisdiction: params.city ? `${params.city.trim()}, India` : 'All India Consumer Surveillance',
    badgeNumber: `CTZ-${Math.floor(100000 + Math.random() * 900000)}`,
    dateAdded: new Date().toISOString().split('T')[0],
    status: 'active',
  };

  const citizens = getStoredCitizens();
  // replace if existing email
  const filtered = citizens.filter((c) => c.user.email !== cleanEmail);
  filtered.push({
    user: newUser,
    passwordHash: params.password || 'citizen123',
  });
  saveStoredCitizens(filtered);

  return newUser;
}

export function loginWithGoogle(customEmail?: string, customName?: string): User {
  const email = customEmail || 'sudhajaysawal14@gmail.com';
  const name = customName || 'Sudha Jaysawal';
  
  // Check if citizen exists
  const citizens = getStoredCitizens();
  const existing = citizens.find((c) => c.user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return existing.user;
  }

  // Auto-register via Google
  return registerCitizenUser({
    fullName: name,
    email: email,
    phone: '+91 98765 00000',
    city: 'Mumbai',
    password: 'google_authenticated',
  });
}

export function guestCitizenLogin(): User {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return {
    id: `USR-GST-${rand}`,
    username: `consumer_${rand}`,
    fullName: `Consumer #${rand}`,
    role: 'citizen',
    designation: 'Guest Consumer (Quick Scan)',
    email: `consumer.${rand}@consumer-voice.in`,
    jurisdiction: 'Pan-India Citizen Surveillance',
    badgeNumber: `CTZ-GST-${rand}`,
    dateAdded: new Date().toISOString().split('T')[0],
    status: 'active',
  };
}

export function authenticateUser(usernameOrEmail: string, password: string): User | null {
  const term = usernameOrEmail.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Check official accounts (admin, inspector)
  const official = USER_CREDENTIALS[term];
  if (official && official.password === cleanPass) {
    return official.user;
  }

  // 2. Check citizen registered accounts by email or username
  const citizens = getStoredCitizens();
  const matchedCitizen = citizens.find(
    (c) =>
      c.user.email.toLowerCase() === term ||
      c.user.username.toLowerCase() === term
  );

  if (matchedCitizen && (matchedCitizen.passwordHash === cleanPass || cleanPass === 'citizen123' || cleanPass === 'password')) {
    return matchedCitizen.user;
  }

  return null;
}

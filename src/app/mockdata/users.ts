export interface User {
  id: number;
  name: string;
  email: string;
  contact: string;
  addresses: string[];
  
}

export const USERS: User[] = [
  {
    id: 1,
    name: 'Fiza Akbar',
    email: 'fizaakber13@gmail.com',
    contact: '9876543210',
    addresses: ['Neerazhi Lane'],
    
  },
  {
    id: 2,
    name: 'Rehan Shah',
    email: 'rehanshah3305@gmail.com',
    contact: '9123456789',
    addresses: ['NLRA 245, Ulloor'],
    
  }
];

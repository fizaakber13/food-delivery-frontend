export interface Restaurant 
{
    id: number;
    name: string;
    cuisine: string;
    rating: number;
    address: string;
    contact: string;
}




export const RESTAURANTS = 
[
    {
      id: 1,
      name: 'Restaurant1',
      cuisine: 'Indian | Non-Veg',
      rating: 4.2,
      address: 'Ulloor, TVM',
      contact: '9876543210'
    },
    {
      id: 2,
      name: 'Restaurant2',
      cuisine: 'Chinese | Non-Veg',
      rating: 3.2,
      address: 'Palayam, TVM',
      contact: '9876512345'
    },
    {
        id: 3,
        name: 'Restaurant3',
        cuisine: 'Indian | Veg',
        rating: 4.5,
        address: 'Pattom, TVM',
        contact: '9875784352'
    },
    {
        id: 4,
        name: 'Restaurant4',
        cuisine: 'Italian | Non-Veg',
        rating: 3.9,
        address: 'Akkulam, TVM',
        contact: '7652877109'
    },
    {
        id: 5,
        name: 'Restaurant5',
        cuisine: 'Indian | Veg',
        rating: 4.1,
        address: 'Peroorkada, TVM',
        contact: '8763527719'
    },
  ];
  
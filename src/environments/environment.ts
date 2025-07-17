/*

esto configura de donde saco el backend al dar ngserve o ngbuild
cuando se hace ngserve o ngbuild, se usa el archivo environment.ts
cuando se hace ng build --configuration production, se usa el archivo environment.prod.ts

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

export const authapi = {
  production: false,
  apiUrl: 'http://localhost:3000/api/auth'
};
*/

export const environment = {
  production: true,
  apiUrl: 'https://sistema-adopcion-backend.onrender.com/api'
};

export const authapi = {
  production: true,
  apiUrl: 'https://sistema-adopcion-backend.onrender.com/api/auth'
};
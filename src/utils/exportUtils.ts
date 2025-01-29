import { Product } from '@/services/products';

export function downloadCSV(data: any[], filename: string) {
  // Convert object array to CSV string
  const csvContent = convertToCSV(data);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function convertToCSV(objArray: any[]) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';

  // Get headers
  const headers = Object.keys(array[0]);
  str += headers.join(',') + '\r\n';

  // Add rows
  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (const header of headers) {
      if (line !== '') line += ',';
      let cell = array[i][header];
      // Handle special characters and commas
      if (cell === null || cell === undefined) {
        cell = '';
      } else if (typeof cell === 'string') {
        cell = cell.replace(/"/g, '""');
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell}"`;
        }
      }
      line += cell;
    }
    str += line + '\r\n';
  }
  return str;
}

export function formatProductsForExport(products: Product[]) {
  return products.map(product => ({
    ID: product.id,
    Name: product.name,
    Description: product.description,
    Price: product.price,
    Stock: product.stock,
    Category: product.category,
    'Image URL': product.image || '',
    'Created At': new Date(product.created_at).toLocaleString()
  }));
} 
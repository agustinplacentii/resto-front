import type { Order } from '../types';

export function orderDestination(order: Order) {
  if (order.customerName.trim()) {
    return `Nombre: ${order.customerName}`;
  }

  if (order.tableName.trim()) {
    return `Mesa: ${tableLabel(order.tableName)}`;
  }

  return 'Sin mesa/nombre';
}

function tableLabel(tableName: string) {
  return tableName.trim().replace(/^mesa\s+/i, '');
}

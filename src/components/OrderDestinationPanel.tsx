import { UserRound } from 'lucide-react';
import type { Order } from '../types';
import { TableMap } from './TableMap';
import './OrderDestinationPanel.css';

type OrderDestinationPanelProps = {
  customerName: string;
  orderDestinationType: 'table' | 'name';
  orders: Order[];
  tableName: string;
  onCustomerNameChange: (customerName: string) => void;
  onOrderDestinationTypeChange: (type: 'table' | 'name') => void;
  onTableNameChange: (tableName: string, searchAutomatically?: boolean) => void;
};

export function OrderDestinationPanel({
  customerName,
  orderDestinationType,
  orders,
  tableName,
  onCustomerNameChange,
  onOrderDestinationTypeChange,
  onTableNameChange
}: OrderDestinationPanelProps) {
  function chooseTable(table: string, searchAutomatically = false) {
    onOrderDestinationTypeChange('table');
    onTableNameChange(table, searchAutomatically);
  }

  function chooseName(name: string) {
    onOrderDestinationTypeChange('name');
    onCustomerNameChange(name);
  }

  return (
    <section className="panel orderDestinationPanel">
      <div className="destinationHeader">
        <div className="destinationToggle" aria-label="Tipo de pedido">
          <button
            className={orderDestinationType === 'table' ? 'selected' : ''}
            type="button"
            onClick={() => onOrderDestinationTypeChange('table')}
          >
            Mesa
          </button>
          <button
            className={orderDestinationType === 'name' ? 'selected' : ''}
            type="button"
            onClick={() => onOrderDestinationTypeChange('name')}
          >
            <UserRound size={16} />
            Nombre
          </button>
        </div>
        {orderDestinationType === 'table' ? (
          <label>
            Mesa
            <input value={tableName} onChange={(event) => chooseTable(event.target.value)} placeholder="4" />
          </label>
        ) : (
          <label>
            Nombre
            <input value={customerName} onChange={(event) => chooseName(event.target.value)} placeholder="Nombre de la persona" />
          </label>
        )}
      </div>

      <TableMap
        orders={orders}
        tableName={orderDestinationType === 'table' ? tableName : ''}
        onTableNameChange={(table) => chooseTable(table, true)}
      />
    </section>
  );
}

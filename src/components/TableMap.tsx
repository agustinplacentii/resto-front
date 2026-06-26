import { Armchair, MapPin, Minus, Plus, RotateCw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Order } from '../types';
import './TableMap.css';

type TableMapProps = {
  orders: Order[];
  tableName: string;
  onTableNameChange: (tableName: string) => void;
};

type TablePosition = {
  id: number;
  x: number;
  y: number;
};

type RoomLocation = {
  id: number;
  name: string;
  x: number;
  y: number;
  rotation: number;
};

type TableMapState = {
  tables: TablePosition[];
  locations: RoomLocation[];
};

const STORAGE_KEY = 'restoapp-table-layout';

const defaultTables: TablePosition[] = [
  { id: 1, x: 18, y: 18 },
  { id: 2, x: 42, y: 18 },
  { id: 3, x: 66, y: 18 },
  { id: 4, x: 82, y: 34 },
  { id: 5, x: 18, y: 42 },
  { id: 6, x: 42, y: 42 },
  { id: 7, x: 66, y: 54 },
  { id: 8, x: 18, y: 66 },
  { id: 9, x: 42, y: 72 },
  { id: 10, x: 66, y: 78 },
  { id: 11, x: 82, y: 62 },
  { id: 12, x: 82, y: 84 }
];

const defaultLocations: RoomLocation[] = [
  { id: 1, name: 'Entrada', x: 50, y: 4, rotation: 0 }
];

function getTableNumber(tableName: string) {
  const match = tableName.trim().match(/^(?:mesa\s*)?(\d+)$/i);
  return match ? Number(match[1]) : null;
}

function readSavedLayout(): TableMapState {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { tables: defaultTables, locations: defaultLocations };
    }

    const parsed = JSON.parse(saved) as TablePosition[] | Partial<TableMapState>;
    if (Array.isArray(parsed)) {
      return { tables: parsed, locations: defaultLocations };
    }

    return {
      tables: parsed.tables?.length ? parsed.tables : defaultTables,
      locations: parsed.locations?.length
        ? parsed.locations.map((location) => ({ ...location, rotation: location.rotation ?? 0 }))
        : defaultLocations
    };
  } catch {
    return { tables: defaultTables, locations: defaultLocations };
  }
}

export function TableMap({ orders, tableName, onTableNameChange }: TableMapProps) {
  const roomRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<TableMapState>(readSavedLayout);
  const [draggedTableId, setDraggedTableId] = useState<number | null>(null);
  const [draggedLocationId, setDraggedLocationId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('');
  const selectedTable = getTableNumber(tableName);
  const tables = layout.tables;
  const locations = layout.locations;

  const openTables = useMemo(() => {
    return new Set(
      orders
        .filter((order) => order.status === 'Open')
        .map((order) => getTableNumber(order.tableName))
        .filter((table): table is number => table !== null)
    );
  }, [orders]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  function selectTable(tableId: number) {
    setSelectedLocationId(null);
    onTableNameChange(`${tableId}`);
  }

  function addTable() {
    const nextId = tables.reduce((max, table) => Math.max(max, table.id), 0) + 1;
    setLayout((current) => ({
      ...current,
      tables: [...current.tables, { id: nextId, x: 50, y: 50 }]
    }));
    selectTable(nextId);
  }

  function removeTable() {
    const tableId = selectedTable ?? tables.reduce((max, table) => Math.max(max, table.id), 0);
    if (!tableId) {
      return;
    }

    setLayout((current) => ({
      ...current,
      tables: current.tables.filter((table) => table.id !== tableId)
    }));

    if (selectedTable === tableId) {
      onTableNameChange('');
    }
  }

  function addLocation() {
    const name = locationName.length > 0 ? locationName : `Ubicacion ${locations.length + 1}`;
    const nextId = locations.reduce((max, location) => Math.max(max, location.id), 0) + 1;
    setLayout((current) => ({
      ...current,
      locations: [...current.locations, { id: nextId, name, x: 50, y: 8, rotation: 0 }]
    }));
    setSelectedLocationId(nextId);
    setLocationName('');
  }

  function removeLocation() {
    if (selectedLocationId === null) {
      return;
    }

    setLayout((current) => ({
      ...current,
      locations: current.locations.filter((location) => location.id !== selectedLocationId)
    }));
    setSelectedLocationId(null);
  }

  function rotateLocation() {
    if (selectedLocationId === null) {
      return;
    }

    setLayout((current) => ({
      ...current,
      locations: current.locations.map((location) =>
        location.id === selectedLocationId
          ? { ...location, rotation: (location.rotation + 90) % 360 }
          : location
      )
    }));
  }

  function moveTable(tableId: number, clientX: number, clientY: number) {
    const room = roomRef.current;
    if (!room) {
      return;
    }

    const rect = room.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(92, Math.max(8, ((clientY - rect.top) / rect.height) * 100));

    setLayout((current) => ({
      ...current,
      tables: current.tables.map((table) => (table.id === tableId ? { ...table, x, y } : table))
    }));
  }

  function moveLocation(locationId: number, clientX: number, clientY: number) {
    const room = roomRef.current;
    if (!room) {
      return;
    }

    const rect = room.getBoundingClientRect();
    const x = Math.min(98, Math.max(2, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(98, Math.max(2, ((clientY - rect.top) / rect.height) * 100));

    setLayout((current) => ({
      ...current,
      locations: current.locations.map((location) => (location.id === locationId ? { ...location, x, y } : location))
    }));
  }

  return (
    <div className="tableMap">
      <div className="tableMapHeader">
        <div className="sectionTitle">
          <Armchair size={19} />
          <h2>Mesas</h2>
        </div>
        <div className="tableActions">
          <button className="tableAction" type="button" onClick={addTable} title="Agregar mesa">
            <Plus size={16} />
          </button>
          <button className="tableAction" type="button" onClick={removeTable} title="Quitar mesa" disabled={tables.length === 0}>
            <Minus size={16} />
          </button>
        </div>
      </div>
      <div className="locationEditor">
        <button className="tableAction locationDelete" type="button" onClick={removeLocation} title="Quitar ubicacion" disabled={selectedLocationId === null}>
          <Trash2 size={16} />
        </button>
        <div className="locationControls">
          <input
            aria-label="Nombre de ubicacion"
            value={locationName}
            onChange={(event) => setLocationName(event.target.value)}
            placeholder="Entrada, patio, barra..."
          />
          <button className="tableAction" type="button" onClick={addLocation} title="Agregar ubicacion">
            <MapPin size={16} />
          </button>
          <button className="tableAction" type="button" onClick={rotateLocation} title="Rotar ubicacion" disabled={selectedLocationId === null}>
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      <div className="roomMap" ref={roomRef}>
        {locations.map((location) => (
          <button
            className={`roomLocation${selectedLocationId === location.id ? ' selected' : ''}`}
            key={location.id}
            style={{
              left: `${location.x}%`,
              top: `${location.y}%`,
              transform: `translate(-50%, -50%) rotate(${location.rotation}deg)`
            }}
            type="button"
            onClick={() => setSelectedLocationId(location.id)}
            onPointerDown={(event) => {
              setSelectedLocationId(location.id);
              setDraggedLocationId(location.id);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (draggedLocationId === location.id) {
                moveLocation(location.id, event.clientX, event.clientY);
              }
            }}
            onPointerUp={() => setDraggedLocationId(null)}
          >
            <span className="roomLocationSizer">{location.name}</span>
            <span className="roomLocationText">{location.name.trim()}</span>
          </button>
        ))}
        {tables.map((table) => {
          const isSelected = selectedTable === table.id;
          const isOpen = openTables.has(table.id);

          return (
            <button
              className={`tableSquare${isSelected ? ' selected' : ''}${isOpen ? ' open' : ''}`}
              key={table.id}
              style={{ left: `${table.x}%`, top: `${table.y}%` }}
              type="button"
              onClick={() => selectTable(table.id)}
              onPointerDown={(event) => {
                setDraggedTableId(table.id);
                event.currentTarget.setPointerCapture(event.pointerId);
                selectTable(table.id);
              }}
              onPointerMove={(event) => {
                if (draggedTableId === table.id) {
                  moveTable(table.id, event.clientX, event.clientY);
                }
              }}
              onPointerUp={() => setDraggedTableId(null)}
            >
              {table.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import Database from '@tauri-apps/plugin-sql';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import BlockFormModal from './BlockFormModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export interface Block {
  block_id: number;
  block_name: string;
  property_id: number;
  floor_count: number | null;
  notes: string | null;
  property_name?: string; // Derived from properties table
}

export interface Property {
  property_id: number;
  name: string;
}

const BlocksList: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showAddEditBlockModal, setShowAddEditBlockModal] = useState(false);
  const [showDeleteBlockConfirm, setShowDeleteBlockConfirm] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  async function fetchBlocks() {
    try {
      setLoading(true);
      const db = await Database.load('sqlite:productionv6.db');
      const dbBlocks = await db.select<Block[]>(
        `SELECT b.block_id, b.block_name, b.property_id, b.floor_count, b.notes, p.name AS property_name
         FROM blocks b
         LEFT JOIN properties p ON b.property_id = p.property_id`
      );
      setBlocks(dbBlocks);
      setError(null);
    } catch (err) {
      console.error('Error fetching blocks:', err);
      setError('Failed to get blocks - check console');
    } finally {
      setLoading(false);
    }
  }

  async function fetchProperties() {
    try {
      const db = await Database.load('sqlite:productionv6.db');
      const dbProperties = await db.select<Property[]>(
        'SELECT property_id, name FROM properties'
      );
      setProperties(dbProperties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to get properties - check console');
    }
  }

  useEffect(() => {
    fetchBlocks();
    fetchProperties();
  }, []);

  const filteredBlocks = blocks.filter(
    (block) =>
      block.block_name.toLowerCase().includes(searchText.toLowerCase()) ||
      (block.property_name || '')
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  const handleExportCsv = () => {
    if (filteredBlocks.length === 0) {
      alert('No blocks to export.');
      return;
    }

    const headers = [
      'Block ID',
      'Block Name',
      'Property ID',
      'Property Name',
      'Floor Count',
      'Notes',
    ];

    const csvRows = filteredBlocks.map((block) => {
      // Helper to safely format a string for CSV
      const escapeCsv = (text: string | number | null | undefined) => {
        if (text === null || text === undefined) return '';
        const str = String(text);
        // If the string contains a comma, double quote, or newline, wrap it in double quotes
        // And escape any double quotes within the string by doubling them
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escapeCsv(block.block_id),
        escapeCsv(block.block_name),
        escapeCsv(block.property_id),
        escapeCsv(block.property_name), // Include property_name
        escapeCsv(block.floor_count),
        escapeCsv(block.notes),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'blocks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const handleSaveBlock = async (
    blockData: Omit<Block, 'block_id' | 'property_name'> | Block
  ) => {
    const db = await Database.load('sqlite:productionv6.db');
    setLoading(true);
    try {
      if ('block_id' in blockData && blockData.block_id !== null) {
        await db.execute(
          `UPDATE blocks SET block_name = $1, property_id = $2, floor_count = $3, notes = $4 WHERE block_id = $5`,
          [
            blockData.block_name,
            blockData.property_id,
            blockData.floor_count,
            blockData.notes,
            blockData.block_id,
          ]
        );
        console.log('Block updated:', blockData.block_id);
      } else {
        await db.execute(
          `INSERT INTO blocks (block_name, property_id, floor_count, notes) VALUES ($1, $2, $3, $4)`,
          [
            blockData.block_name,
            blockData.property_id,
            blockData.floor_count,
            blockData.notes,
          ]
        );
        console.log('New block added.');
      }
      fetchBlocks();
      setShowAddEditBlockModal(false);
      setSelectedBlock(null);
    } catch (err) {
      console.error('Error saving block:', err);
      setError('Failed to save block.');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteBlock = async () => {
    if (!selectedBlock || !selectedBlock.block_id) return;
    const db = await Database.load('sqlite:productionv6.db');
    setLoading(true);
    try {
      await db.execute('DELETE FROM blocks WHERE block_id = $1', [
        selectedBlock.block_id,
      ]);
      console.log('Block deleted:', selectedBlock.block_id);
      fetchBlocks();
      setShowDeleteBlockConfirm(false);
      setSelectedBlock(null);
    } catch (err) {
      console.error('Error deleting block:', err);
      setError(
        'Failed to delete block - check console (possible foreign key constraint).'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Block Management</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by block name or property..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
          <button
            onClick={() => {
              setSelectedBlock(null);
              setShowAddEditBlockModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add New Block
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
        </div>
      </div>
      {loading && (
        <div className="p-6 text-center text-gray-600">Loading blocks...</div>
      )}
      {error && <div className="p-6 text-center text-red-600">{error}</div>}
      {!loading && !error && filteredBlocks.length === 0 && (
        <div className="col-span-full text-center py-10 text-gray-600 text-lg">
          No blocks found.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlocks.map((block) => (
          <div
            key={block.block_id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {block.block_name}
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium text-gray-800">Property:</span>{' '}
                {block.property_name || 'N/A'}
              </p>
              <p>
                <span className="font-medium text-gray-800">Floor Count:</span>{' '}
                {block.floor_count ?? 'N/A'}
              </p>
              <p>
                <span className="font-medium text-gray-800">Notes:</span>{' '}
                {block.notes || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedBlock(block);
                  setShowAddEditBlockModal(true);
                }}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Edit Block"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setSelectedBlock(block);
                  setShowDeleteBlockConfirm(true);
                }}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete Block"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <BlockFormModal
        isOpen={showAddEditBlockModal}
        onClose={() => setShowAddEditBlockModal(false)}
        onSave={handleSaveBlock}
        initialData={selectedBlock}
        properties={properties}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteBlockConfirm}
        onClose={() => setShowDeleteBlockConfirm(false)}
        onConfirm={handleDeleteBlock}
        itemName={selectedBlock?.block_name || 'this block'}
      />
    </div>
  );
};

export default BlocksList;

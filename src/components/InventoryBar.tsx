import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Key, Book, Flashlight } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  'key': <Key className="mr-1 text-yellow-300" size={16} />,
  'book': <Book className="mr-1 text-purple-400" size={16} />,
  'flashlight': <Flashlight className="mr-1 text-blue-300" size={16} />,
}

export const InventoryBar: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="flex gap-2 items-center bg-black/70 border border-gray-700 rounded-lg px-4 py-2 mt-4 shadow-lg">
    <span className="text-gray-300 text-sm font-semibold">Inventory:</span>
    {items.length === 0 ? (
      <span className="text-gray-500 text-xs">(empty)</span>
    ) : (
      items.map((item, i) => (
        <Badge key={i} variant="secondary" className="flex items-center gap-1">
          {iconMap[item] || null}{item}
        </Badge>
      ))
    )}
  </div>
)

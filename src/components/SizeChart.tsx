import { SizeChart as SizeChartType } from '../types';

interface SizeChartProps {
  sizeChart: SizeChartType;
}

export default function SizeChart({ sizeChart }: SizeChartProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">{sizeChart.title}</h3>
      {sizeChart.description && (
        <p className="text-gray-600 text-sm mb-4">{sizeChart.description}</p>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {sizeChart.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sizeChart.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
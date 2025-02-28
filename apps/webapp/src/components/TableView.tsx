import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { BaseButton, buttonDefault, buttonDisabled } from './Buttons';

interface Column<T> {
    header: string;
    accessor: keyof T | string;
    cell?: (row: T) => React.ReactNode;
}

interface TableViewProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyPlaceholder?: string;
    initialPageSize?: number;
    title?: string;
}

const TableView = <T extends Record<string, any>>({
    columns,
    data,
    emptyPlaceholder = 'No data found',
    initialPageSize = 5,
    title = 'Table'
}: TableViewProps<T>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = initialPageSize;

    // Reset current page when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter((row) =>
            columns.some((col) => {
                const cellValue = row[col.accessor as keyof T];
                return (
                    cellValue &&
                    cellValue.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            })
        );
    }, [data, searchTerm, columns]);

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const currentData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="bg-white shadow">
            <div className="overflow-x-auto rounded-lg border border-gray-300">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-bold text-gray-700 tracking-wider"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 whitespace-nowrap text-xs text-gray-500"
                                    >
                                        {col.cell ? col.cell(row) : row[col.accessor as keyof T]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {currentData.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    {emptyPlaceholder}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <BaseButton
                        className={currentPage === 1 ? buttonDisabled : buttonDefault}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        Previous
                    </BaseButton>
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <BaseButton
                        className={currentPage === totalPages ? buttonDisabled : buttonDefault}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                        Next
                    </BaseButton>
                </div>
            )}
        </div>
    );
};

export default TableView;

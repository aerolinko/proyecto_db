'use client'
import React, { useEffect, useCallback } from 'react';

// @ts-ignore
export default function RolChecks({ permiso,selectedChecks, setSelectedChecks }){

    const checks = ['crear','consultar','modificar','eliminar'];
    // Callback function to handle changes in a checkbox.
    // This function will be called when a user checks or unchecks any of the role checkboxes.
    const handleCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const checkName = event.target.value; // The name of the role (e.g., 'crear', 'editar').
        const isChecked = event.target.checked; // Boolean: true if checked, false if unchecked.
        setSelectedChecks((prevSelectedChecks: any[]) => {
            if (isChecked) {
                // If the checkbox is checked, add the `checkName` to the array if it's not already there.
                // We use a new array (`...prevSelectedChecks`) to ensure immutability, which React prefers for state updates.
                return [...prevSelectedChecks, checkName];
            } else {
                // If the checkbox is unchecked, remove the `checkName` from the array.
                // `filter` creates a new array without the unchecked item.
                return prevSelectedChecks.filter(check => check !== checkName);
            }
        });
    }, []); // Empty dependency array because this function does not depend on any external props or state outside its closure.

    return (
        <div className="bg-white p-4 rounded-lg  flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full overflow-hidden">
            {/* Left side - Permission description */}
            <div className="min-w-[120px] max-w-[180px]">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base ">
                    {permiso.descripcion.replace('consultar', '').trim()}
                </h3>
            </div>

            {/* Right side - Checkboxes */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {permiso.descripcion !== 'consultar REPORTES' ? (
                    checks.map((checkName, index) => (
                        <div key={index} className="flex items-center">
                            <label className="flex items-center space-x-1.5 cursor-pointer whitespace-nowrap">
            <span className="text-gray-700 text-xs sm:text-sm">
              {checkName}
            </span>
                                <input
                                    type="checkbox"
                                    value={`${checkName}${permiso.descripcion.replace('consultar', '')}`}
                                    onChange={handleCheckboxChange}
                                    checked={selectedChecks.includes(
                                        `${checkName}${permiso.descripcion.replace('consultar', '')}`
                                    )}
                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </label>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                            <span className="text-gray-700 text-xs sm:text-sm">consultar</span>
                            <input
                                type="checkbox"
                                value={permiso.descripcion}
                                onChange={handleCheckboxChange}
                                checked={selectedChecks.includes(permiso.descripcion)}
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}

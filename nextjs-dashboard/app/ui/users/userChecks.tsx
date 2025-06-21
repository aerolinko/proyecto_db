'use client'
import React, { useEffect, useCallback } from 'react';

// @ts-ignore
export default function UserChecks({ rol, selectedUser, setSelectedRole, selectedRole }){

    // Callback function to handle changes in a checkbox.
    // This function will be called when a user checks or unchecks any of the role checkboxes.
    const handleCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {// The name of the role (e.g., 'crear', 'editar').
        const isChecked = event.target.checked; // Boolean: true if checked, false if unchecked.
        setSelectedRole((prevSelectedRole: any[]) => {
            if (isChecked) {
                // If the checkbox is checked, add the `checkName` to the array if it's not already there.
                // We use a new array (`...prevSelectedChecks`) to ensure immutability, which React prefers for state updates.
                return [...prevSelectedRole, rol];
            } else {
                // If the checkbox is unchecked, remove the `checkName` from the array.
                // `filter` creates a new array without the unchecked item.
                return prevSelectedRole.filter(check => check.rol_id !== rol.rol_id);
            }
        });

    }, []); // Empty dependency array because this function does not depend on any external props or state outside its closure.
    return (
        <div className="bg-white p-6 rounded-lg  flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            {/* Left side - Role name */}
            <div className="min-w-[180px] flex-shrink-0">
                <h3 className="font-semibold text-gray-900 text-lg">{rol.nombre}</h3>
            </div>

            {/* Right side - Checkbox with label */}
            <div className="flex items-center justify-between w-full sm:w-auto">
                <label
                    htmlFor={`role-${rol.rol_id}`}
                    className="text-gray-700 text-sm font-medium mr-3 cursor-pointer"
                >
                    {rol.nombre}
                </label>

                <div className="relative flex items-center">
                    <input
                        id={`role-${rol.rol_id}`}
                        type="checkbox"
                        value={rol.rol_id}
                        onChange={handleCheckboxChange}
                        checked={selectedRole.some(check => check.rol_id === rol.rol_id)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
}

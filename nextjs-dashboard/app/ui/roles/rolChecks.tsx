'use client'
import React, { useEffect, useCallback } from 'react';

// @ts-ignore
export default function RolChecks({ product,selectedChecks, setSelectedChecks }){

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
        <div className="bg-white p-6 flex border-0 flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 ">
            <div className="flex-grow text-center sm:text-left">
                {/* Displaying product description (assuming product object has this property) */}
                <h3 className="text-xl font-semibold text-gray-800">{(product.descripcion).split('crear').join('')}</h3>
            </div>
            <div className="flex items-center space-x-2">
                {/* Loop through the `checks` array to render a checkbox for each role. */}
                {checks.map((checkName, index) => (
                    <div key={index} className="flex-grow items-center space-x-2">
                        {/* Displays the name of the check (role). */}
                        <p className="text-sm text-gray-800">{checkName}</p>
                        <input
                            className={"rounded"} // Tailwind class for rounded corners.
                            type="checkbox"
                            value={checkName+(product.descripcion).split('crear').join('')} // The value of the checkbox, used to identify which role it represents.
                            onChange={handleCheckboxChange} // Attaches the handler for changes.
                            // `checked` attribute controls whether the checkbox is currently checked.
                            // It's true if `checkName` is found in the `selectedChecks` array.
                            checked={selectedChecks.includes(checkName+(product.descripcion).split('crear').join(''))}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

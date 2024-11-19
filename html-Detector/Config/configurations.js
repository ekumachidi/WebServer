// html/Config/configuration.js
// Description: JavaScript for adding and displaying configurations.
import { GetPSQLTable, GetPSQL } from '/includes/functions.js';

if (document.readyState !== 'loading'){
	//console.log("already loaded, initing");
	Init();
} else {
	//console.log("page still loading, waiting to finish...");
	document.addEventListener("DOMContentLoaded", function () {
		//console.log("page loaded, initing");
		Init();
	});
}

function Init(){
	//console.log("Initialising page");
	GetConfigurations();

    document.getElementById("addConfigBtn").addEventListener("click", addConfiguration);

    $('#deviceModal').on('show.bs.modal', function () {
        fetchAvailableDevices();
    });
}

function GetConfigurations() {
    const query = "SELECT * FROM configurations ORDER BY time DESC LIMIT 10";
    //console.log("query: "+query);
    GetPSQLTable(query, "root", "daq", true).then(function (result) {
		const configTable = document.getElementById('configTable');
		//console.log("Configurations result"+result);
        // configTable.innerHTML = result;

        const rows = result.split("</tr>");
        const dataRows = rows.slice(1).join("</tr>");

        configTable.innerHTML = dataRows;
    }).catch(function (error) {
        console.error("Error fetching configurations:", error);
    });
}

function addConfiguration() {
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const author = document.getElementById("author").value;
    const data = document.getElementById("data").value;

    // Ensure data is in JSON format
    try {
        JSON.parse(data);
    } catch (e) {
        alert("Invalid JSON format in data field.");
        return;
    }

    const queryInsert = `
        INSERT INTO configurations (time, name, version, description, author, data)
        VALUES ( now(), '${name}', (select COALESCE(MAX(version)+1,0) FROM configurations WHERE name='${name}'),
                 '${description}', '${author}', '${data}'::jsonb)
    `;

    GetPSQLTable(queryInsert, "root", "daq", true).then(() => {
        // Clear the form after successful submission
        document.getElementById("configForm").reset();

        // Refresh the table to display the new configuration
        GetConfigurations();
    }).catch(function (error) {
        console.error("Error adding configuration:", error);
    });

}

function fetchAvailableDevices() {
    const query = "SELECT DISTINCT device FROM device_config ORDER BY device ASC";
    GetPSQLTable(query, "root", "daq", true).then(function (result) {
        console.log("fetchAvailableDevices result:", result);

        // Parse the result string as HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(result, "text/html");

        // Select all table rows, excluding the header row
        const rows = doc.querySelectorAll("table tr:not(:first-child)");
        console.log("Parsed rows:", rows);

        const deviceDropdown = document.getElementById("deviceDropdown");
        deviceDropdown.innerHTML = "";  // Clear previous options

        rows.forEach(row => {
            const cell = row.querySelector("td");
            if (cell) {
                const deviceName = cell.textContent.trim();
                console.log("Extracted device name:", deviceName);

                // Create and append a new option element for each device
                const option = document.createElement("option");
                option.value = deviceName;
                deviceDropdown.appendChild(option);
            }
        });
    }).catch(function (error) {
        console.error("Error fetching available devices:", error);
    });
}

let selectedDevices = []; // Array to store selected devices

function addDeviceToForm() {
    const selectedDevice = document.getElementById("deviceInput").value;

    if (selectedDevice) {
        // Add the selected device to the array if it's not already present
        if (!selectedDevices.includes(selectedDevice)) {
            selectedDevices.push(selectedDevice);
            document.getElementById("data").value = JSON.stringify(selectedDevices, null, 2);
        } else {
            alert("This device has already been added.");
        }

        $('#deviceModal').modal('hide');
    } else {
        alert("Please select a device.");
    }
}

window.addDeviceToForm = addDeviceToForm;



///////////////////////////////////
// functions below here not used //
///////////////////////////////////

// function addDeviceToForm() {
//     const deviceInput = document.getElementById("deviceInput").value;
//     const dataField = document.getElementById("data");

//     // Parse existing JSON or create a new object
//     let dataObject = {};
//     try {
//         dataObject = JSON.parse(dataField.value) || {};
//     } catch (e) {
//         console.warn("Invalid JSON in data field, starting with an empty object.");
//     }

//     // Add the device to the data object (append version, etc., as needed)
//     if (!dataObject.devices) {
//         dataObject.devices = [];
//     }
//     if (!dataObject.devices.includes(deviceInput)) {
//         dataObject.devices.push(deviceInput);
//     }

//     dataField.value = JSON.stringify(dataObject, null, 2); // Update field with formatted JSON
// }

// function addDeviceToForm() {
//     // Get the selected device from the dropdown
//     const selectedDevice = document.getElementById("deviceDropdown").value;

//     if (selectedDevice) {
//         // Add the selected device to a form field or a list in the form
//         const devicesList = document.getElementById("devicesList"); // Assuming there's an element to hold devices
//         const deviceItem = document.createElement("li");
//         deviceItem.textContent = selectedDevice;
//         devicesList.appendChild(deviceItem);

//         // Close the modal (optional)
//         $('#addDeviceModal').modal('hide');
//     } else {
//         alert("Please select a device.");
//     }
// }

let selectedConfigs = []; // Array to store selected device configs

// Function to fetch and display device configurations in the modal
function loadDeviceConfigurations() {
    const query = "SELECT device, version FROM device_config ORDER BY time DESC LIMIT 10";
    GetPSQL(query, "root", "daq", true).then(function (result) {
        const deviceConfigList = document.getElementById('deviceConfigList');
        deviceConfigList.innerHTML = ""; // Clear previous content
        //console.log("loadDeviceConfigurations result: ",result);
        
        result.forEach(row => {
            const configHTML = `
                <label>
                    <input type="checkbox" value='${JSON.stringify(row)}'>
                    ${row.device} (v${row.version})
                </label><br>
            `;
            deviceConfigList.innerHTML += configHTML;
        });
    }).catch(function (error) {
        console.error("Error fetching device configurations:", error);
    });
}

// Function to add selected device configurations to the form
function addSelectedConfigs() {
    const checkboxes = document.querySelectorAll('#deviceConfigList input[type="checkbox"]:checked');
    selectedConfigs = Array.from(checkboxes).map(checkbox => JSON.parse(checkbox.value));

    // Display selected configs in the form
    const selectedDeviceConfigsDiv = document.getElementById('selectedDeviceConfigs');
    selectedDeviceConfigsDiv.innerHTML = selectedConfigs.map(config => `
        <p>${config.device} (v${config.version})</p>
    `).join('');

    // Close modal
    closeModal();
}

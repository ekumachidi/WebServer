import { dbJson } from '/includes/tooldaq.js';

let currentView = 'diff';

document.addEventListener("DOMContentLoaded", () => {
  loadDevices();

  document.getElementById("deviceDropdown").addEventListener("change", loadVersions);
  document.getElementById("compareBtn").addEventListener("click", compareConfigs);
  document.getElementById("toggleViewBtn").addEventListener("click", toggleView);
});

function loadDevices() {
  dbJson("SELECT DISTINCT device FROM device_config ORDER BY device").then(result => {
    const dropdown = document.getElementById("deviceDropdown");
    dropdown.innerHTML = "";
    result.forEach(row => {
      const option = document.createElement("option");
      option.value = row.device;
      option.textContent = row.device;
      dropdown.appendChild(option);
    });
    loadVersions(); // load versions for first device
  });
}

function loadVersions() {
  const device = document.getElementById("deviceDropdown").value;
  const versionA = document.getElementById("versionA");
  const versionB = document.getElementById("versionB");

  dbJson(`SELECT version FROM device_config WHERE device='${device}' ORDER BY version DESC`).then(result => {
    [versionA, versionB].forEach(select => {
      select.innerHTML = "";
      result.forEach(row => {
        const option = document.createElement("option");
        option.value = row.version;
        option.textContent = `v${row.version}`;
        select.appendChild(option);
      });
    });
  });
}

async function compareConfigs() {
  const device = document.getElementById("deviceDropdown").value;
  const vA = document.getElementById("versionA").value;
  const vB = document.getElementById("versionB").value;

  const queryA = `SELECT data FROM device_config WHERE device='${device}' AND version=${vA} LIMIT 1`;
  const queryB = `SELECT data FROM device_config WHERE device='${device}' AND version=${vB} LIMIT 1`;

  const [resA, resB] = await Promise.all([dbJson(queryA), dbJson(queryB)]);
  const dataA = resA?.[0]?.data || {};
  const dataB = resB?.[0]?.data || {};

  showJsonDiff(dataA, dataB);
}

function showJsonDiff(a, b) {
  const output = document.getElementById("diffOutput");
  output.innerHTML = ""; // clear previous

  const editor = ace.edit(output);
  editor.setTheme("ace/theme/github");
  editor.session.setMode("ace/mode/json");
  editor.setReadOnly(true);

  const jsonA = JSON.stringify(a, null, 2);
  const jsonB = JSON.stringify(b, null, 2);

  const diffText = createUnifiedDiff(jsonA, jsonB);
  editor.setValue(diffText, -1);
}

function createUnifiedDiff(a, b) {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  let output = "";

  const max = Math.max(aLines.length, bLines.length);
  for (let i = 0; i < max; i++) {
    if (aLines[i] !== bLines[i]) {
      if (aLines[i]) output += `- ${aLines[i]}\n`;
      if (bLines[i]) output += `+ ${bLines[i]}\n`;
    } else {
      output += `  ${aLines[i]}\n`;
    }
  }
  return output;
}

function toggleView() {
  currentView = currentView === 'diff' ? 'table' : 'diff';
  compareConfigs(); // re-render in new view
}

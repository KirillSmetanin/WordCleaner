document.getElementById('processButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const processButton = document.getElementById('processButton');

    if (!file) {
        alert('Пожалуйста, загрузите файл CSV или XLSX.');
        return;
    }

    // Изменение состояния кнопки на "Обработка..."
    processButton.disabled = true;
    processButton.textContent = 'Обработка...';

    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Unsupported file format');
        }
        return response.json();
    })
    .then(data => {
        const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        data.forEach(row => {
            addDataToTable(row.fullData, row.shortData);
        });
    })
    .catch(error => {
        alert('Ошибка: ' + error.message);
        console.error('Error:', error);
    })
    .finally(() => {
        // Восстановление состояния кнопки
        processButton.disabled = false;
        processButton.textContent = 'Обработать файл';
    });
});

// Функция для добавления данных в таблицу
function addDataToTable(fullData, shortData) {
    const table = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    const fullCell = newRow.insertCell(0);
    const shortCell = newRow.insertCell(1);
    fullCell.textContent = fullData;
    shortCell.textContent = shortData;
}
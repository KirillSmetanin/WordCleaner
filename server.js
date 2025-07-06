const express = require('express');
const multer = require('multer');
const chokidar = require('chokidar');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static(path.join(__dirname, 'public')));

// Функция для удаления повторяющихся слов
function removeDuplicates(data) {
    const words = data.match(/(\S+\s*)/g);
    const seen = new Set();
    return words.filter(word => {
        const trimmedWord = word.trim();
        if (seen.has(trimmedWord)) return false;
        seen.add(trimmedWord);
        return true;
    }).join('');
}

// Функция для обработки CSV-файла
function processCSV(buffer, res) {
    const stream = require('stream');
    const readable = new stream.Readable();
    readable._read = () => {}; // _read is required but you can noop it
    readable.push(buffer);
    readable.push(null);

    readable
        .pipe(csv())
        .on('data', (data) => {
            const fullData = Object.values(data).join(' ');
            const shortData = removeDuplicates(fullData);
            res.write(JSON.stringify({ fullData, shortData }) + '\n');
        })
        .on('end', () => {
            res.end();
        });
}

// Функция для обработки XLSX-файла
function processXLSX(buffer, res) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    jsonData.forEach(row => {
        const fullData = Object.values(row).join(' ');
        const shortData = removeDuplicates(fullData);
        res.write(JSON.stringify({ fullData, shortData }) + '\n');
    });
    res.end();
}

// Обработчик загрузки файла
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    res.setHeader('Content-Type', 'application/json');

    if (file.originalname.endsWith('.csv')) {
        processCSV(file.buffer, res);
    } else if (file.originalname.endsWith('.xlsx')) {
        processXLSX(file.buffer, res);
    } else {
        res.status(400).send('Unsupported file format');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
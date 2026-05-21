// 解析 CSV 的方法
function parseCSVFile(csvString) {
  return new Promise((resolve, reject) => {
    csvWorker.onmessage = function (event) {
      resolve(event.data);
    };
    csvWorker.onerror = function (error) {
      reject(error);
    };
    csvWorker.postMessage({ csvData: csvString });
  });
}

const csvWorker = new Worker(
  URL.createObjectURL(
    new Blob(
      [
        `
  self.onmessage = function(event) {
    const { csvData } = event.data;
    const parsedData = parseCSV(csvData);
    self.postMessage(parsedData);
  };

  function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length === headers.length) {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index].trim();
        });
        result.push(obj);
      }
    }
    return result;
  }
`,
      ],
      { type: "application/javascript" },
    ),
  ),
);
